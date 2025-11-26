---
title: 'セッション設定'
sidebar_label: 'セッション設定'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: '``system.settings`` テーブルに含まれる設定項目です。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* 自動生成 */ }

以下の設定はすべて、テーブル [system.settings](/docs/operations/system-tables/settings) でも利用できます。これらの設定は [ソースコード](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp) から自動生成されています。


## add_http_cors_header {#add_http_cors_header} 

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP CORS ヘッダーを書き込みます。

## additional&#95;result&#95;filter

`SELECT` クエリの結果に適用する追加のフィルタ式です。
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


## additional&#95;table&#95;filters

<SettingsInfoBlock type="Map" default_value="{}" />

指定されたテーブルからの読み込み後に適用される追加のフィルタ式。

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


## aggregate&#95;functions&#95;null&#95;for&#95;empty

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内のすべての集約関数を書き換え、末尾に [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) 接尾辞を追加するかどうかを有効または無効にします。SQL 標準との互換性を保つために有効にしてください。
分散クエリで一貫した結果を得るために、[count&#95;distinct&#95;implementation](#count_distinct_implementation) 設定と同様にクエリ書き換えとして実装されています。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

集約関数を含む次のクエリを例とします。

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

`aggregate_functions_null_for_empty = 0` を設定すると、次のようになります：

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

`aggregate_functions_null_for_empty = 1` を指定すると、結果は次のようになります。

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes {#aggregation_in_order_max_block_bytes} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

主キー順で集約を行う際に蓄積されるブロックの最大サイズ（バイト単位）。ブロックサイズを小さくすると、集約処理の最終マージ段階をより高い並列度で実行できます。

## aggregation_memory_efficient_merge_threads {#aggregation_memory_efficient_merge_threads} 

<SettingsInfoBlock type="UInt64" default_value="0" />

メモリ効率モードで中間集約結果をマージする際に使用するスレッド数。値を大きくすると、より多くのメモリが消費されます。0 を指定した場合は「max_threads」と同じ値を意味します。

## allow_aggregate_partitions_independently {#allow_aggregate_partitions_independently} 

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーが `GROUP BY` キーと対応している場合、パーティションごとに別スレッドで独立して集計できるようにします。パーティション数がコア数に近く、かつパーティションのサイズがほぼ同じ場合に有効です。

## allow_archive_path_syntax {#allow_archive_path_syntax} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "アーカイブパス構文の無効化を許可する新しい設定を追加しました。"}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "アーカイブパス構文の無効化を許可する新しい設定を追加しました。"}]}]}/>

File/S3 エンジンおよびテーブル関数では、アーカイブが正しい拡張子を持つ場合、'::' を含むパスを `<archive>::<file>` として解析します。

## allow_asynchronous_read_from_io_pool_for_merge_tree {#allow_asynchronous_read_from_io_pool_for_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

バックグラウンドの I/O プールを使用して MergeTree テーブルからデータを読み取ります。この設定により、I/O にボトルネックがあるクエリのパフォーマンスが向上する可能性があります。

## allow_changing_replica_until_first_data_packet {#allow_changing_replica_until_first_data_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、ヘッジ付きリクエストにおいて、すでにある程度進捗している場合でも（ただし、その進捗が `receive_data_timeout` の間更新されていない場合）、最初のデータパケットを受信するまで新しい接続を開始できます。無効な場合は、最初に進捗が発生した時点以降はレプリカの切り替えを行いません。

## allow_create_index_without_type {#allow_create_index_without_type} 

<SettingsInfoBlock type="Bool" default_value="0" />

TYPE を指定せずに `CREATE INDEX` クエリを実行することを許可します。クエリは無視されます。SQL 互換性テスト用の設定です。

## allow_custom_error_code_in_throwif {#allow_custom_error_code_in_throwif} 

<SettingsInfoBlock type="Bool" default_value="0" />

throwIf() 関数でカスタムエラーコードを有効にします。有効にすると、スローされる例外に想定外のエラーコードが設定される可能性があります。

## allow_ddl {#allow_ddl} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定されている場合、ユーザーは DDL クエリを実行できます。

## allow_deprecated_database_ordinary {#allow_deprecated_database_ordinary} 

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨の Ordinary データベースエンジンを使用したデータベースの作成を許可する

## allow_deprecated_error_prone_window_functions {#allow_deprecated_error_prone_window_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "非推奨でエラーを招きやすいウィンドウ関数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）の使用を許可"}]}]}/>

非推奨でエラーを招きやすいウィンドウ関数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）の使用を許可

## allow_deprecated_snowflake_conversion_functions {#allow_deprecated_snowflake_conversion_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "非推奨の関数 snowflakeToDateTime[64] および dateTime[64]ToSnowflake を無効にしました。"}]}]}/>

関数 `snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake`、`dateTime64ToSnowflake` は非推奨であり、デフォルトでは無効になっています。
代わりに、`snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID`、`dateTime64ToSnowflakeID` を使用してください。

非推奨の関数を再度有効化する場合（たとえば移行期間中など）は、この設定を `true` に設定してください。

## allow_deprecated_syntax_for_merge_tree {#allow_deprecated_syntax_for_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨のエンジン定義構文を使用した MergeTree テーブルの作成を許可します

## allow_distributed_ddl {#allow_distributed_ddl} 

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定されている場合、ユーザーによる分散 DDL クエリの実行が許可されます。

## allow_drop_detached {#allow_drop_detached} 

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE ... DROP DETACHED PART[ITION] ... クエリの実行を許可します

## allow_dynamic_type_in_join_keys {#allow_dynamic_type_in_join_keys} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで JOIN キーにおける Dynamic 型の使用を禁止"}]}]}/>

JOIN キーで Dynamic 型を使用できるようにします。互換性確保のために追加された設定です。Dynamic 型を JOIN キーで使用することは推奨されません。他の型との比較で予期しない結果を招く可能性があるためです。

## allow_execute_multiif_columnar {#allow_execute_multiif_columnar} 

<SettingsInfoBlock type="Bool" default_value="1" />

multiIf 関数のカラム指向での実行を許可する

## allow_experimental_alias_table_engine {#allow_experimental_alias_table_engine} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Alias テーブルエンジンを使用してテーブルを作成できるようにします。

## allow_experimental_analyzer {#allow_experimental_analyzer} 

**別名**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルトでアナライザーとプランナーを有効にします。"}]}]}/>

新しいクエリアナライザーを有効にします。

## allow_experimental_codecs {#allow_experimental_codecs} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、実験的な圧縮コーデックを指定できるようになります（ただし、現時点ではそのようなコーデックは存在せず、このオプションには何の効果もありません）。

## allow_experimental_correlated_subqueries {#allow_experimental_correlated_subqueries} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "相関サブクエリのサポートをベータ版として扱うようにしました。"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "相関サブクエリの実行を許可する新しい設定を追加しました。"}]}]}/>

相関サブクエリの実行を許可します。

## allow_experimental_database_glue_catalog {#allow_experimental_database_glue_catalog} 

<BetaBadge/>

**別名**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'glue' の実験的な DataLakeCatalog データベースエンジンを許可"}]}]}/>

catalog_type = 'glue' の実験的な DataLakeCatalog データベースエンジンを許可

## allow_experimental_database_hms_catalog {#allow_experimental_database_hms_catalog} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "catalog_type = 'hive' の実験的なデータベースエンジン DataLakeCatalog を許可"}]}]}/>

catalog_type = 'hms' の実験的なデータベースエンジン DataLakeCatalog を許可

## allow_experimental_database_iceberg {#allow_experimental_database_iceberg} 

<BetaBadge/>

**別名**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

catalog_type = 'iceberg' を使用する実験的なデータベースエンジン DataLakeCatalog を有効にします

## allow_experimental_database_materialized_postgresql {#allow_experimental_database_materialized_postgresql} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Engine=MaterializedPostgreSQL(...) を使用するデータベースを作成できるようにします。

## allow_experimental_database_unity_catalog {#allow_experimental_database_unity_catalog} 

<BetaBadge/>

**エイリアス**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'unity' の実験的なデータベースエンジン DataLakeCatalog を許可します"}]}]}/>

catalog_type = 'unity' の実験的なデータベースエンジン DataLakeCatalog を許可します

## allow_experimental_delta_kernel_rs {#allow_experimental_delta_kernel_rs} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

実験的な delta-kernel-rs 実装を有効にします。

## allow_experimental_delta_lake_writes {#allow_experimental_delta_lake_writes} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

delta-kernel の書き込み機能を有効にします。

## allow_experimental_full_text_index {#allow_experimental_full_text_index} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "実験的なテキストインデックスを有効化"}]}]}/>

true に設定すると、実験的なテキストインデックスを使用できるようになります。

## allow_experimental_funnel_functions {#allow_experimental_funnel_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

ファネル分析向けの実験的関数を有効にします。

## allow_experimental_hash_functions {#allow_experimental_hash_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

実験的なハッシュ関数を有効化します

## allow_experimental_iceberg_compaction {#allow_experimental_iceberg_compaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting "}]}]}/>

Iceberg テーブルに対して `OPTIMIZE` を明示的に使用できるようにします。

## allow_experimental_insert_into_iceberg {#allow_experimental_insert_into_iceberg} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

Iceberg への `INSERT` クエリの実行を許可します。

## allow_experimental_join_right_table_sorting {#allow_experimental_join_right_table_sorting} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "この設定が true に設定されていて、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件を満たす場合、LEFT または INNER ハッシュ結合のパフォーマンスを向上させるために、右テーブルをキーで並べ替えます"}]}]}/>

この設定が true に設定されていて、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件を満たす場合、LEFT または INNER ハッシュ結合のパフォーマンスを向上させるために、右テーブルをキーで並べ替えます。

## allow_experimental_kafka_offsets_storage_in_keeper {#allow_experimental_kafka_offsets_storage_in_keeper} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "コミット済みオフセットを ClickHouse Keeper に保存する実験的 Kafka ストレージエンジンの使用を許可"}]}]}/>

Kafka に関連するオフセットを ClickHouse Keeper に保存する実験的機能を有効にします。有効化すると、Kafka テーブルエンジンに ClickHouse Keeper のパスとレプリカ名を指定できるようになります。これにより、通常の Kafka エンジンの代わりに、コミット済みオフセットを主に ClickHouse Keeper に保存する新しいタイプのストレージエンジンが使用されます。

## allow_experimental_kusto_dialect {#allow_experimental_kusto_dialect} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

SQL の代替となる Kusto Query Language (KQL) を有効にします。

## allow_experimental_materialized_postgresql_table {#allow_experimental_materialized_postgresql_table} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

MaterializedPostgreSQL テーブルエンジンの使用を有効にします。実験的な機能であるため、デフォルトでは無効になっています。

## allow_experimental_nlp_functions {#allow_experimental_nlp_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

自然言語処理向けの実験的関数を有効にします。

## allow_experimental_parallel_reading_from_replicas {#allow_experimental_parallel_reading_from_replicas} 

<BetaBadge/>

**エイリアス**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

SELECT クエリの実行において、各シャードから最大 `max_parallel_replicas` 個のレプリカを使用します。読み取りは並列化され、動的に協調制御されます。0 - 無効、1 - 有効（失敗時は例外を投げずに暗黙的に無効化）、2 - 有効（失敗時は例外をスロー）

## allow_experimental_prql_dialect {#allow_experimental_prql_dialect} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

PRQL（SQL の代替となるクエリ言語）を有効にします。

## allow_experimental_qbit_type {#allow_experimental_qbit_type} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

[QBit](../../sql-reference/data-types/qbit.md) データ型を作成できるようにします。

## allow_experimental_query_deduplication {#allow_experimental_query_deduplication} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

パーツの UUID に基づく SELECT クエリ向けの実験的なデータの重複排除機能

## allow_experimental_statistics {#allow_experimental_statistics} 

<ExperimentalBadge/>

**エイリアス**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "この設定の名前が変更されました。以前の名前は `allow_experimental_statistic` です。"}]}]}/>

[statistics](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table) を利用するカラムの定義および [statistics の操作](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)を許可します。

## allow_experimental_time_series_aggregate_functions {#allow_experimental_time_series_aggregate_functions} 

<ExperimentalBadge/>

**別名**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "実験的な timeSeries* 集約関数を有効化する新しい設定です。"}]}]}/>

Prometheus ライクな時系列データのリサンプリング、レートおよびデルタの計算を行うための実験的な timeSeries* 集約関数です。

## allow_experimental_time_series_table {#allow_experimental_time_series_table} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Added new setting to allow the TimeSeries table engine"}]}]}/>

[TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを使用するテーブルの作成を許可します。設定可能な値:

- 0 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは無効です。
- 1 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは有効です。

## allow_experimental_time_time64_type {#allow_experimental_time_time64_type} 

<ExperimentalBadge/>

**別名**: `enable_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定です。新しい実験的な Time および Time64 データ型の使用を許可します。"}]}]}/>

[Time](../../sql-reference/data-types/time.md) および [Time64](../../sql-reference/data-types/time64.md) データ型の作成を許可します。

## allow_experimental_window_view {#allow_experimental_window_view} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

WINDOW VIEW を有効にします。まだ十分に安定していません。

## allow_experimental_ytsaurus_dictionary_source {#allow_experimental_ytsaurus_dictionary_source} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

YTsaurus との統合向けの実験的な辞書ソース。

## allow_experimental_ytsaurus_table_engine {#allow_experimental_ytsaurus_table_engine} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}]}/>

YTsaurus と統合するための実験的テーブルエンジン。

## allow_experimental_ytsaurus_table_function {#allow_experimental_ytsaurus_table_function} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

YTsaurus との統合用の実験的なテーブルエンジンです。

## allow_general_join_planning {#allow_general_join_planning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを利用可能にします。"}]}]}/>

ハッシュ結合でのみ使用できるが、より複雑な条件も扱える、より汎用的な結合計画アルゴリズムを有効にします。ハッシュ結合が有効になっていない場合は、この設定値にかかわらず通常の結合計画アルゴリズムが使用されます。

## allow_get_client_http_header {#allow_get_client_http_header} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新しい関数を導入。"}]}]}/>

現在の HTTP リクエストのヘッダー値を取得できる関数 `getClientHTTPHeader` の使用を許可します。`Cookie` など機密情報を含む可能性のあるヘッダーがあるため、セキュリティ上の理由からデフォルトでは有効になっていません。なお、`X-ClickHouse-*` ヘッダーおよび `Authentication` ヘッダーは常に取得が制限されており、この関数で取得することはできません。

## allow_hyperscan {#allow_hyperscan} 

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan ライブラリを使用する関数を許可します。コンパイル時間の増大や過度なリソース使用を避けたい場合は無効にします。

## allow_introspection_functions {#allow_introspection_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリプロファイリング用の[イントロスペクション関数](../../sql-reference/functions/introspection.md)を有効または無効にします。

設定可能な値:

- 1 — イントロスペクション関数を有効にする
- 0 — イントロスペクション関数を無効にする

**関連項目**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- システムテーブル [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select {#allow_materialized_view_with_bad_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "存在しないカラムやテーブルを参照する MV の作成を禁止"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "CREATE MATERIALIZED VIEW におけるより厳格な検証をサポート（ただしまだ有効化はしない）"}]}]}/>

存在しないテーブルまたはカラムを参照する SELECT クエリを伴う CREATE MATERIALIZED VIEW を許可します。クエリは構文的に正しい必要があります。リフレッシュ可能な MV には適用されません。SELECT クエリから MV のスキーマを推論する必要がある場合（つまり、CREATE にカラムリストも TO テーブルも指定されていない場合）には適用されません。ソーステーブルより先に MV（マテリアライズドビュー）を作成する場合に利用できます。

## allow_named_collection_override_by_default {#allow_named_collection_override_by_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きコレクションのフィールドの上書きをデフォルトで許可します。

## allow_non_metadata_alters {#allow_non_metadata_alters} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルのメタデータだけでなく、ディスク上のデータにも影響を与える `ALTER` 操作の実行を許可します

## allow_nonconst_timezone_arguments {#allow_nonconst_timezone_arguments} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() などの一部の時間関連の関数で、定数ではないタイムゾーン引数を許可します。"}]}]}/>

toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() などの一部の時間関連の関数で、定数ではないタイムゾーン引数を許可します。
この設定は互換性のためだけに存在します。ClickHouse では、タイムゾーンはデータ型のプロパティであり、それに対応するカラムのプロパティでもあります。
この設定を有効にすると、1 つのカラム内で値ごとに異なるタイムゾーンを持てるかのような誤った印象を与えます。
したがって、この設定は有効化しないでください。

## allow&#95;nondeterministic&#95;mutations

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッドテーブル上のミューテーションで、`dictGet` などの非決定的関数を使用できるようにするユーザーレベルの設定です。

たとえばディクショナリはノード間で同期されていない可能性があるため、その値を取得するミューテーションは、デフォルトではレプリケーテッドテーブル上では許可されていません。この設定を有効にするとこの挙動が許可され、使用されるデータがすべてのノード間で同期されていることを保証する責任はユーザー側に移ります。

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

シャーディングキーで非決定的な関数（`rand` や `dictGet` など。後者は更新時にいくつか注意点があります）の使用を許可します。

設定可能な値:

- 0 — 許可しない。
- 1 — 許可する。

## allow_not_comparable_types_in_comparison_functions {#allow_not_comparable_types_in_comparison_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "デフォルトで比較関数で比較不能な型の使用を許可しない"}]}]}/>

比較関数 `equal/less/greater/etc` で、JSON や AggregateFunction などの比較不能な型を使用できるかどうかを許可または制限します。

## allow_not_comparable_types_in_order_by {#allow_not_comparable_types_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "デフォルトで比較不可能な型の ORDER BY での使用を許可しない"}]}]}/>

JSON や AggregateFunction などの比較不可能な型を ORDER BY キーで使用できるかどうかを制御します。

## allow_prefetched_read_pool_for_local_filesystem {#allow_prefetched_read_pool_for_local_filesystem} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパーツがローカルファイルシステム上にある場合、プリフェッチ済みのスレッドプールを優先的に使用します。

## allow_prefetched_read_pool_for_remote_filesystem {#allow_prefetched_read_pool_for_remote_filesystem} 

<SettingsInfoBlock type="Bool" default_value="1" />

すべてのパーツがリモートファイルシステム上にある場合、プリフェッチ読み取り用スレッドプールを優先して使用します

## allow_push_predicate_ast_for_distributed_subqueries {#allow_push_predicate_ast_for_distributed_subqueries} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

アナライザが有効な分散サブクエリに対して、AST レベルでの述語プッシュを許可します

## allow_push_predicate_when_subquery_contains_with {#allow_push_predicate_when_subquery_contains_with} 

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに WITH 句が含まれている場合に述語プッシュダウンを許可します

## allow_reorder_prewhere_conditions {#allow_reorder_prewhere_conditions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

WHERE から PREWHERE へ条件を移動する際、フィルタリングを最適化できるよう条件の並び替えを許可します

## allow&#95;settings&#95;after&#95;format&#95;in&#95;insert

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "INSERT クエリにおいて FORMAT の後に SETTINGS を許可しません。これは、ClickHouse が SETTINGS を値として解釈してしまい、誤解を招く可能性があるためです。"}]}]} />

`INSERT` クエリで `FORMAT` の後に `SETTINGS` を許可するかどうかを制御します。`SETTINGS` の一部が値として解釈されてしまう可能性があるため、この設定の使用は推奨されません。

例:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

ただし、次のクエリが動作するのは、`allow_settings_after_format_in_insert` が有効になっている場合のみです。

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

取り得る値:

* 0 — 不許可
* 1 — 許可

:::note
古い構文に依存するユースケースがある場合の後方互換性のためにのみ、この設定を使用してください。
:::


## allow_simdjson {#allow_simdjson} 

<SettingsInfoBlock type="Bool" default_value="1" />

AVX2 命令が利用可能な場合に、`JSON*` 関数で simdjson ライブラリの使用を許可します。無効にした場合は rapidjson が使用されます。

## allow_special_serialization_kinds_in_output_formats {#allow_special_serialization_kinds_in_output_formats} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "一部の出力フォーマットで Sparse/Replicated のような特殊なカラム表現を直接出力できるようにする"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Sparse/Replicated などの特殊なカラム表現を、完全なカラム表現に変換せずに出力できるようにする設定を追加"}]}]}/>

Sparse や Replicated などの特殊なシリアル化種別を持つカラムを、完全なカラム表現に変換せずに出力できるようにします。
これにより、フォーマット処理中の不要なデータコピーを回避できます。

## allow_statistics_optimize {#allow_statistics_optimize} 

<ExperimentalBadge/>

**Aliases**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "設定名が変更されました。以前の名前は `allow_statistic_optimize` です。"}]}]}/>

クエリの最適化に統計を使用することを許可します。

## allow_suspicious_codecs {#allow_suspicious_codecs} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "無意味な圧縮コーデックの指定を許可しない"}]}]}/>

true に設定すると、無意味な圧縮コーデックも指定できるようになります。

## allow_suspicious_fixed_string_types {#allow_suspicious_fixed_string_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE TABLE ステートメントで、FixedString(n) 型かつ n > 256 の列を作成できるようにします。長さが 256 以上の FixedString は不審と見なされ、多くの場合は誤用である可能性があります。

## allow_suspicious_indices {#allow_suspicious_indices} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "true の場合、同一の式でインデックスを定義できます"}]}]}/>

同一の式を持つ primary/secondary インデックスおよびソートキーを拒否します

## allow_suspicious_low_cardinality_types {#allow_suspicious_low_cardinality_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

8 バイト以下の固定サイズを持つデータ型（数値型および `FixedString(8_bytes_or_less)`）と [LowCardinality](../../sql-reference/data-types/lowcardinality.md) の併用を許可または制限します。

小さな固定長値に対しては、各行に対して ClickHouse が数値インデックスを保存するため、`LowCardinality` を使用しても通常は非効率です。その結果:

- ディスク使用量が増加する可能性があります。
- 辞書サイズによっては、RAM 使用量が多くなる可能性があります。
- 追加のエンコード／デコード処理が発生するため、一部の関数が遅くなる場合があります。

上記のすべての理由により、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルではマージ処理時間が長くなる可能性があります。

設定可能な値:

- 1 — `LowCardinality` の使用を制限しません。
- 0 — `LowCardinality` の使用を制限します。

## allow_suspicious_primary_key {#allow_suspicious_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "MergeTree（例: SimpleAggregateFunction）に対する問題のある PRIMARY KEY/ORDER BY を禁止"}]}]}/>

MergeTree（例: SimpleAggregateFunction）に対する問題のある `PRIMARY KEY` / `ORDER BY` を許可します。

## allow_suspicious_ttl_expressions {#allow_suspicious_ttl_expressions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "これは新しい設定であり、以前のバージョンでは常に「許可」と同等の動作でした。"}]}]}/>

テーブルのいずれのカラムにも依存しない TTL 式を拒否します。これはほとんどの場合、ユーザーの誤りであることを示します。

## allow_suspicious_types_in_group_by {#allow_suspicious_types_in_group_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトでは GROUP BY で Variant/Dynamic 型を許可しない"}]}]}/>

GROUP BY 句のキーとして [Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を使用できるかどうかを制御します。

## allow_suspicious_types_in_order_by {#allow_suspicious_types_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトで ORDER BY での Variant/Dynamic 型の使用を許可しない"}]}]}/>

ORDER BY キーで [Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を使用することを許可するかどうかを制御します。

## allow_suspicious_variant_types {#allow_suspicious_variant_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "デフォルトでは、疑わしいバリアント型を含む Variant 型の作成を許可しない"}]}]}/>

この設定を有効にすると、`CREATE TABLE` 文で、類似したバリアント型（たとえば、異なる数値型や日付型など）を持つ `Variant` 型を指定できるようになります。この設定を有効にすると、類似した型の値を扱う際に曖昧さが生じる可能性があります。

## allow_unrestricted_reads_from_keeper {#allow_unrestricted_reads_from_keeper} 

<SettingsInfoBlock type="Bool" default_value="0" />

`system.zookeeper` テーブルに対して、パス条件なしの無制限な読み取りを許可します。便利な場合もありますが、`ZooKeeper` に対して安全ではありません。

## alter_move_to_space_execute_async {#alter_move_to_space_execute_async} 

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE MOVE ... TO [DISK|VOLUME] を非同期で実行します

## alter&#95;partition&#95;verbose&#95;result

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションおよびパーツに対する操作が正常に適用されたパーツに関する情報の表示を有効または無効にします。
[ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) および [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) に適用されます。

設定可能な値:

* 0 — 詳細表示を無効にします。
* 1 — 詳細表示を有効にします。

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

**エイリアス**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

[ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md)、[TRUNCATE](../../sql-reference/statements/truncate.md) クエリによってレプリカ上で実行されるアクションについて、完了をどの程度待機するかを設定します。

設定可能な値:

- `0` — 待機しない。
- `1` — 自身のレプリカでの実行が完了するまで待機する。
- `2` — すべてのレプリカでの実行が完了するまで待機する。

Cloud 環境でのデフォルト値: `1`。

:::note
`alter_sync` は `Replicated` テーブルにのみ適用され、`Replicated` ではないテーブルに対する ALTER には影響しません。
:::

## alter_update_mode {#alter_update_mode} 

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

`UPDATE` コマンドを含む `ALTER` クエリの動作モードです。

指定可能な値:

- `heavy` - 通常のミューテーションを実行します。
- `lightweight` - 可能であれば軽量アップデートを実行し、それ以外の場合は通常のミューテーションを実行します。
- `lightweight_force` - 可能であれば軽量アップデートを実行し、それ以外の場合は例外をスローします。

## analyze_index_with_space_filling_curves {#analyze_index_with_space_filling_curves} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルのインデックスが空間充填曲線（例：`ORDER BY mortonEncode(x, y)` や `ORDER BY hilbertEncode(x, y)`）を使用しており、クエリにその引数に対する条件（例：`x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`）が含まれている場合は、インデックス解析に空間充填曲線を利用します。

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested {#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

`Nested` カラムに複合識別子を追加できるようにします。クエリ結果が変化するため、互換性に関する設定です。無効にすると、`SELECT a.b.c FROM table ARRAY JOIN a` は使用できず、`SELECT a FROM table` の結果にも、`Nested a` の結果として `a.b.c` 列が含まれなくなります。

## analyzer_compatibility_join_using_top_level_identifier {#analyzer_compatibility_join_using_top_level_identifier} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "JOIN USING 内の識別子を Projection から解決する動作を強制する"}]}]}/>

JOIN USING 内で使用される識別子を Projection から解決するよう強制します（例えば `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` の場合、結合は `t1.b = t2.b` ではなく `t1.a + 1 = t2.b` を条件として実行されます）。

## any_join_distinct_right_table_keys {#any_join_distinct_right_table_keys} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "ANY RIGHT と ANY FULL JOIN による不整合を避けるため、デフォルトで無効化"}]}]}/>

`ANY INNER|LEFT JOIN` 演算において、従来の ClickHouse サーバーのレガシーな動作を有効にします。

:::note
レガシーな `JOIN` の動作に依存するユースケースがある場合にのみ、後方互換性のためにこの設定を使用してください。
:::

レガシー動作が有効な場合：

- ClickHouse が左テーブルから右テーブルへのキーの多対一マッピングロジックを使用するため、`t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` の結果は等しくなりません。
- `ANY INNER JOIN` の結果には、`SEMI LEFT JOIN` と同様に、左テーブルからのすべての行が含まれます。

レガシー動作が無効な場合：

- ClickHouse が `ANY RIGHT JOIN` 演算においてキーの一対多マッピングを行うロジックを使用するため、`t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` の結果は等しくなります。
- `ANY INNER JOIN` の結果には、左テーブルおよび右テーブルの両方から、各キーにつき 1 行のみが含まれます。

取りうる値:

- 0 — レガシー動作は無効。
- 1 — レガシー動作は有効。

関連項目:

- [JOIN の厳密さ](/sql-reference/statements/select/join#settings)

## apply_deleted_mask {#apply_deleted_mask} 

<SettingsInfoBlock type="Bool" default_value="1" />

軽量 DELETE で削除された行をフィルタリングします。無効にすると、クエリからそれらの行を読み取れるようになります。デバッグや「削除の取り消し」シナリオで有用です。

## apply_mutations_on_fly {#apply_mutations_on_fly} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合は、データパーツにマテリアライズされていないミューテーション（UPDATE および DELETE）が SELECT 時に適用されます。

## apply_patch_parts {#apply_patch_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、軽量な更新を表すパッチパーツが SELECT クエリ実行時に適用されます。

## apply_patch_parts_join_cache_buckets {#apply_patch_parts_join_cache_buckets} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Join モードでパッチパーツを適用する際に使用される一時キャッシュのバケット数。

## apply_settings_from_server {#apply_settings_from_server} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "クライアント側コード（例: INSERT 入力データのパースやクエリ出力のフォーマット）が、サーバーと同じ設定（サーバー設定ファイル由来の設定を含む）を使用するようになります。"}]}]}/>

クライアントがサーバーから送られてくる設定を受け入れるかどうかを指定します。

これはクライアント側で実行される処理のみに影響します。特に、INSERT の入力データのパースやクエリ結果のフォーマットに影響します。クエリ実行の大部分はサーバー側で行われ、この設定の影響を受けません。

通常、この設定はユーザープロファイル（`users.xml` または `ALTER USER` のようなクエリ）で設定すべきであり、クライアント側（クライアントのコマンドライン引数、`SET` クエリ、`SELECT` クエリの `SETTINGS` セクション）から設定すべきではありません。クライアントからは、この値を `false` に変更することはできますが、`true` に変更することはできません（ユーザープロファイルで `apply_settings_from_server = false` が設定されている場合、サーバーは設定値を送信しないためです）。

なお、当初（24.12）にはサーバー側設定（`send_settings_to_client`）が存在していましたが、その後、使い勝手を向上させるため、このクライアント側設定に置き換えられました。

## arrow_flight_request_descriptor_type {#arrow_flight_request_descriptor_type} 

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "新しい設定。Arrow Flight リクエストで使用するディスクリプターの種別: 'path' または 'command'。Dremio では 'command' が必須です。"}]}]}/>

Arrow Flight リクエストで使用するディスクリプターの種別。'path' はデータセット名を path ディスクリプターとして送信します。'command' は SQL クエリを command ディスクリプターとして送信します（Dremio では必須）。

指定可能な値:

- 'path' — FlightDescriptor::Path を使用します（デフォルト。ほとんどの Arrow Flight サーバーで動作します）
- 'command' — FlightDescriptor::Command を SELECT クエリと共に使用します（Dremio では必須）

## asterisk_include_alias_columns {#asterisk_include_alias_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）で [ALIAS](../../sql-reference/statements/create/table.md/#alias) カラムを含めるかどうかを設定します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## asterisk_include_materialized_columns {#asterisk_include_materialized_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）に [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) 列を含めるかどうかを制御します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## async_insert {#async_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリのデータはキューに保存され、その後バックグラウンドでテーブルに書き込まれます。wait_for_async_insert が false の場合、INSERT クエリはほぼ即座に処理されます。そうでない場合、クライアントはデータがテーブルに書き込まれるまで待機します。

## async_insert_busy_timeout_decrease_rate {#async_insert_busy_timeout_decrease_rate} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "適応型非同期挿入タイムアウトが減少していく際の指数的変化率"}]}]}/>

適応型非同期挿入タイムアウトが減少していく際の指数的変化率

## async_insert_busy_timeout_increase_rate {#async_insert_busy_timeout_increase_rate} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "適応型非同期挿入タイムアウトの増加に使われる指数的成長率"}]}]}/>

適応型非同期挿入タイムアウトの増加に使われる指数的成長率

## async_insert_busy_timeout_max_ms {#async_insert_busy_timeout_max_ms} 

**別名**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "ミリ秒単位で指定する非同期挿入タイムアウトの最小値。async_insert_busy_timeout_ms は async_insert_busy_timeout_max_ms の別名です。"}]}]}/>

最初のデータが現れてから、クエリごとに収集されたデータをフラッシュするまでに待機する最大時間です。

## async_insert_busy_timeout_min_ms {#async_insert_busy_timeout_min_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "非同期 INSERT のタイムアウトの最小値（ミリ秒単位）。適応アルゴリズムにより後から増加する可能性がある初期値としても使用されます"}]}]}/>

`async_insert_use_adaptive_busy_timeout` によって自動調整が有効になっている場合、最初のデータが現れてから、クエリ単位で収集されたデータをフラッシュ（書き出し）するまでに待機する最短時間です。また、適応アルゴリズムに対する初期値としても機能します。

## async_insert_deduplicate {#async_insert_deduplicate} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートテーブルに対する非同期 INSERT クエリで、挿入されるブロックの重複排除を行うかどうかを指定します。

## async_insert_max_data_size {#async_insert_max_data_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "以前の値は小さすぎると判断されました。"}]}]}/>

挿入前にクエリごとに収集される未解析データの最大サイズ（バイト単位）。

## async_insert_max_query_number {#async_insert_max_query_number} 

<SettingsInfoBlock type="UInt64" default_value="450" />

挿入が実行される前に蓄積される挿入クエリの最大数。
設定 [`async_insert_deduplicate`](#async_insert_deduplicate) が 1 の場合にのみ有効です。

## async_insert_poll_timeout_ms {#async_insert_poll_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "非同期挿入キューからデータをポーリングするためのタイムアウト時間（ミリ秒）"}]}]}/>

非同期挿入キューからデータをポーリングするためのタイムアウト時間

## async_insert_use_adaptive_busy_timeout {#async_insert_use_adaptive_busy_timeout} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "アダプティブな非同期挿入タイムアウトを使用"}]}]}/>

true に設定すると、非同期挿入に対してアダプティブなビジータイムアウトを使用します。

## async_query_sending_for_remote {#async_query_sending_for_remote} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "シャード間で非同期に接続を確立し、クエリを送信"}]}]}/>

リモートクエリ実行時に、接続の確立とクエリ送信を非同期で行えるようにします。

デフォルトで有効です。

## async_socket_for_remote {#async_socket_for_remote} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "すべての問題を修正し、リモートクエリのソケットからの非同期読み取りを再びデフォルトで有効にする"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "いくつかの問題により、リモートクエリのソケットからの非同期読み取りを無効にする"}]}]}/>

リモートクエリの実行時に、ソケットからの非同期読み取りを有効にします。

デフォルトで有効です。

## azure_allow_parallel_part_upload {#azure_allow_parallel_part_upload} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Azure マルチパートアップロードに複数のスレッドを使用します。"}]}]}/>

Azure マルチパートアップロードに複数のスレッドを使用します。

## azure_check_objects_after_upload {#azure_check_objects_after_upload} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "アップロードが成功したことを確認するために、Azure Blob Storage にアップロードされた各オブジェクトを検証します"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "アップロードが成功したことを確認するために、Azure Blob Storage にアップロードされた各オブジェクトを検証します"}]}]}/>

アップロードが成功したことを確認するために、Azure Blob Storage にアップロードされた各オブジェクトを検証します

## azure_connect_timeout_ms {#azure_connect_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

Azure ディスク上のホストへの接続タイムアウト時間。

## azure_create_new_file_on_insert {#azure_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Azure エンジンのテーブルで、各 `INSERT` ごとに新しいファイルを作成するかどうかを有効または無効にします

## azure_ignore_file_doesnt_exist {#azure_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、例外をスローせずに 0 行を返せるようにする"}]}]}/>

特定のキーを読み取る際、対応するファイルが存在しない場合でもエラーとせずに無視します。

設定可能な値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## azure_list_object_keys_size {#azure_list_object_keys_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

1 回の ListObject リクエストでバッチとして返されるファイル数の最大値

## azure_max_blocks_in_multipart_upload {#azure_max_blocks_in_multipart_upload} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure のマルチパートアップロードで使用できるブロック数の上限。"}]}]}/>

Azure のマルチパートアップロードで使用できるブロック数の上限。

## azure_max_get_burst {#azure_max_get_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

1 秒あたりのリクエスト数の上限に達する前に、同時に発行できる最大リクエスト数です。デフォルト値 (0) の場合、`azure_max_get_rps` と同じ値になります。

## azure_max_get_rps {#azure_max_get_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

スロットリングが行われる前の、Azure に対する 1 秒あたりの GET リクエスト数の上限値です。0 の場合は無制限を意味します。

## azure_max_inflight_parts_for_one_file {#azure_max_inflight_parts_for_one_file} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "マルチパートアップロードリクエストで同時にアップロードされるパーツの最大数です。0 を指定すると無制限になります。"}]}]}/>

マルチパートアップロードリクエストで同時にアップロードされるパーツの最大数です。0 を指定すると無制限になります。

## azure_max_put_burst {#azure_max_put_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

1 秒あたりのリクエスト数制限に達する前に、同時に発行できる最大リクエスト数。デフォルト値 0 の場合は、`azure_max_put_rps` と同一です。

## azure_max_put_rps {#azure_max_put_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

スロットリングが行われる前の、Azure への 1 秒あたりの PUT リクエスト数の上限です。0 は無制限を意味します。

## azure_max_redirects {#azure_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

Azure リダイレクトで許可されるホップ数の上限。

## azure_max_single_part_copy_size {#azure_max_single_part_copy_size} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "単一パートコピーで Azure Blob Storage にコピーできるオブジェクトの最大サイズ。"}]}]}/>

単一パートコピーで Azure Blob Storage にコピーできるオブジェクトの最大サイズ。

## azure_max_single_part_upload_size {#azure_max_single_part_upload_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Align with S3"}]}]}/>

Azure Blob Storage への単一パートアップロードでアップロードできるオブジェクトの最大サイズ。

## azure_max_single_read_retries {#azure_max_single_read_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の Azure Blob Storage 読み取り処理時の最大リトライ回数。

## azure_max_unexpected_write_error_retries {#azure_max_unexpected_write_error_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Azure Blob Storage への書き込み中に予期しないエラーが発生した場合の最大再試行回数"}]}]}/>

Azure Blob Storage への書き込み中に予期しないエラーが発生した場合の最大再試行回数

## azure_max_upload_part_size {#azure_max_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Azure Blob Storage へのマルチパートアップロード時にアップロードするパートの最大サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時にアップロードするパートの最大サイズ。

## azure_min_upload_part_size {#azure_min_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Azure Blob Storage へのマルチパートアップロードで使用するパートの最小サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロードで使用するパートの最小サイズ。

## azure_request_timeout_ms {#azure_request_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Azure とのデータ送受信における非アクティブ状態のタイムアウトです。1 回の TCP 読み取りまたは書き込み呼び出しがこの時間だけブロックされた場合は失敗とみなします。

## azure_sdk_max_retries {#azure_sdk_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK の最大リトライ回数"}]}]}/>

Azure SDK の最大リトライ回数

## azure_sdk_retry_initial_backoff_ms {#azure_sdk_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK の再試行間における最小バックオフ時間"}]}]}/>

Azure SDK の再試行間における最小バックオフ時間

## azure_sdk_retry_max_backoff_ms {#azure_sdk_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Azure SDK の再試行間の最大バックオフ時間"}]}]}/>

Azure SDK の再試行間の最大バックオフ時間

## azure_skip_empty_files {#azure_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Allow to skip empty files in azure table engine"}]}]}/>

Azure テーブルエンジンで空のファイルをスキップするかどうかを有効または無効にします。

取り得る値:

- 0 — 要求されたフォーマットと互換性のない空ファイルがある場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## azure_strict_upload_part_size {#azure_strict_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの厳密なサイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの厳密なサイズ。

## azure_throw_on_zero_files_match {#azure_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "AzureBlobStorage エンジンで ListObjects リクエストがいずれのファイルとも一致しない場合に、空のクエリ結果を返すのではなくエラーをスローできるようにする"}]}]}/>

グロブ展開ルールに従って一致したファイルが 0 件の場合にエラーをスローします。

設定値:

- 1 — `SELECT` が例外をスローします。
- 0 — `SELECT` が空の結果を返します。

## azure_truncate_on_insert {#azure_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

azure エンジンテーブルでの挿入前のトランケート処理を有効または無効にします。

## azure_upload_part_size_multiply_factor {#azure_upload_part_size_multiply_factor} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "Azure Blob Storage への 1 回の書き込みで azure_multiply_parts_count_threshold 個のパーツがアップロードされるたびに、azure_min_upload_part_size にこの係数を掛けます。"}]}]}/>

Azure Blob Storage への 1 回の書き込みで azure_multiply_parts_count_threshold 個のパーツがアップロードされるたびに、azure_min_upload_part_size にこの係数を掛けます。

## azure_upload_part_size_multiply_parts_count_threshold {#azure_upload_part_size_multiply_parts_count_threshold} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "この数のパーツが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size は azure_upload_part_size_multiply_factor 倍に増加します。"}]}]}/>

この数のパーツが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size は azure_upload_part_size_multiply_factor 倍に増加します。

## azure_use_adaptive_timeouts {#azure_use_adaptive_timeouts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、すべての Azure リクエストにおいて、最初の 2 回の試行は送信および受信タイムアウトが短いタイムアウト値で行われます。
`false` に設定すると、すべての試行で同一のタイムアウト値が使用されます。

## backup_restore_batch_size_for_keeper_multi {#backup_restore_batch_size_for_keeper_multi} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

バックアップまたはリストア時に [Zoo]Keeper へ送信される multi リクエストの、1バッチあたりの最大サイズ

## backup_restore_batch_size_for_keeper_multiread {#backup_restore_batch_size_for_keeper_multiread} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

バックアップまたはリストアの際に [Zoo]Keeper へ送信される multiread リクエストの最大バッチサイズ

## backup_restore_failure_after_host_disconnected_for_seconds {#backup_restore_failure_after_host_disconnected_for_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "新しい設定。"}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER の操作中に、ホストがこの時間内に ZooKeeper 内の一時的な `alive` ノードを再作成しない場合、そのバックアップまたはリストア全体は失敗したものとみなされます。
この値は、障害発生後にホストが ZooKeeper に再接続するための妥当な時間よりも大きく設定する必要があります。
0 は無制限を意味します。

## backup_restore_finish_timeout_after_error_sec {#backup_restore_finish_timeout_after_error_sec} 

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "New setting."}]}]}/>

イニシエーターが、他のホストが `error` ノードを検知して現在の `BACKUP ON CLUSTER` または `RESTORE ON CLUSTER` 操作での処理を停止するまで待機する時間。

## backup_restore_keeper_fault_injection_probability {#backup_restore_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

バックアップまたはリストア中の keeper リクエストに対する障害発生のおおよその確率。有効な値は [0.0f, 1.0f] の範囲です。

## backup_restore_keeper_fault_injection_seed {#backup_restore_keeper_fault_injection_seed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 の場合はランダムシード、それ以外の場合は設定値を使用

## backup_restore_keeper_max_retries {#backup_restore_keeper_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "一時的な [Zoo]Keeper 障害が途中で発生しても BACKUP または RESTORE 操作全体が失敗しないように、十分に大きな値である必要があります。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "一時的な [Zoo]Keeper 障害が途中で発生しても BACKUP または RESTORE 操作全体が失敗しないように、十分に大きな値である必要があります。"}]}]}/>

BACKUP または RESTORE 操作の実行中に行われる [Zoo]Keeper 操作の最大リトライ回数。
一時的な [Zoo]Keeper 障害によって操作全体が失敗しないように、十分に大きな値を設定する必要があります。

## backup_restore_keeper_max_retries_while_handling_error {#backup_restore_keeper_max_retries_while_handling_error} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作のエラー処理中に実行される [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_max_retries_while_initializing {#backup_restore_keeper_max_retries_while_initializing} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作の初期化中に実行される [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_retry_initial_backoff_ms {#backup_restore_keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

バックアップまたはリストア中の [Zoo]Keeper 操作に対するバックオフの初期待機時間

## backup_restore_keeper_retry_max_backoff_ms {#backup_restore_keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

バックアップまたはリストア処理中の [Zoo]Keeper 操作におけるバックオフの最大待機時間

## backup_restore_keeper_value_max_size {#backup_restore_keeper_value_max_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックアップ時の [Zoo]Keeper ノードのデータの最大サイズ

## backup_restore_s3_retry_attempts {#backup_restore_s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Aws::Client::RetryStrategy のための設定です。Aws::Client 側でリトライ処理を行い、0 を指定するとリトライは行われません。バックアップ／リストア時にのみ有効です。"}]}]}/>

Aws::Client::RetryStrategy のための設定です。Aws::Client 側でリトライ処理を行い、0 を指定するとリトライは行われません。バックアップ／リストア時にのみ有効です。

## backup_restore_s3_retry_initial_backoff_ms {#backup_restore_s3_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

バックアップおよびリストア中の最初のリトライを行う前の初期待機時間（ミリ秒単位）。その後の各リトライでは、`backup_restore_s3_retry_max_backoff_ms` で指定された最大値まで、待機時間が指数関数的に増加します。

## backup_restore_s3_retry_jitter_factor {#backup_restore_s3_retry_jitter_factor} 

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "New setting"}]}]}/>

バックアップおよびリストア処理中に、`Aws::Client::RetryStrategy` のリトライバックオフ遅延に適用されるジッタ係数です。計算されたバックオフ遅延は、範囲 [1.0, 1.0 + jitter] の乱数係数を掛けた値となり、最大で `backup_restore_s3_retry_max_backoff_ms` まで増加します。値は [0.0, 1.0] の範囲で指定する必要があります。

## backup_restore_s3_retry_max_backoff_ms {#backup_restore_s3_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

バックアップおよびリストア処理でのリトライ間隔の最大遅延時間（ミリ秒単位）。

## backup_slow_all_threads_after_retryable_s3_error {#backup_slow_all_threads_after_retryable_s3_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで設定を無効化"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントに対して S3 リクエストを実行しているすべてのスレッドが、どれか 1 つの S3 リクエストで「Slow Down」などの再試行可能な S3 エラーが発生した後に、まとめてスローダウンされます。
`false` に設定すると、各スレッドは他のスレッドとは独立して S3 リクエストのバックオフを処理します。

## cache_warmer_threads {#cache_warmer_threads} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

ClickHouse Cloud でのみ有効です。[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) が有効な場合に、新しいデータパートをファイルキャッシュに先行的にダウンロードするバックグラウンドスレッド数を指定します。0 を指定すると無効になります。

## calculate_text_stack_trace {#calculate_text_stack_trace} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行中に例外が発生した場合に、テキスト形式のスタックトレースを取得します。これがデフォルト設定です。大量の誤ったクエリを実行するファジングテストでは、シンボルの解決処理が必要になるため、処理が遅くなる可能性があります。通常は、このオプションを無効にしないでください。

## cancel_http_readonly_queries_on_client_close {#cancel_http_readonly_queries_on_client_close} 

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントがレスポンスを待たずに接続を閉じたときに、HTTP 経由の読み取り専用クエリ（例：SELECT）をキャンセルします。

Cloud におけるデフォルト値: `0`。

## cast_ipv4_ipv6_default_on_conversion_error {#cast_ipv4_ipv6_default_on_conversion_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "関数 cast(value, 'IPv4') および cast(value, 'IPv6') の動作を toIPv4 関数および toIPv6 関数と同じにする"}]}]}/>

CAST 演算子による IPv4 型および IPv6 型への変換、および toIPv4、toIPv6 関数は、変換エラーが発生した場合に例外をスローするのではなく、デフォルト値を返します。

## cast&#95;keep&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

[CAST](/sql-reference/functions/type-conversion-functions#cast) 演算において、`Nullable` データ型を保持するかどうかを制御します。

この設定が有効で、`CAST` 関数の引数の型が `Nullable` の場合、結果も `Nullable` 型に変換されます。設定が無効な場合、結果は常に指定された変換先のデータ型になります。

設定可能な値:

* 0 — `CAST` の結果は、指定された変換先データ型と完全に一致します。
* 1 — 引数の型が `Nullable` の場合、`CAST` の結果は `Nullable(DestinationDataType)` に変換されます。

**使用例**

次のクエリでは、結果のデータ型は変換先のデータ型と完全に一致します。

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

次のクエリでは、出力先のデータ型に `Nullable` 修飾子が付きます。

```sql
SET cast_keep_nullable = 1;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

結果：

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Nullable(Int32)                                   │
└───┴───────────────────────────────────────────────────┘
```

**関連項目**

* [CAST](/sql-reference/functions/type-conversion-functions#cast) 関数


## cast_string_to_date_time_mode {#cast_string_to_date_time_mode} 

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "String から DateTime へのキャストで異なる DateTime パースモードを使用できるようにする"}]}]}/>

String からのキャスト時に、日付と時刻のテキスト表現を解釈するパーサーを選択できます。

指定可能な値:

- `'best_effort'` — 拡張的なパースを有効にします。

    ClickHouse は、基本形式 `YYYY-MM-DD HH:MM:SS` と、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日付・時刻形式をパースできます。例: `'2018-06-08T01:02:03.000Z'`。

- `'best_effort_us'` — `best_effort` とほぼ同じです（違いについては [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus) を参照）。

- `'basic'` — 基本パーサーを使用します。

    ClickHouse は、基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみをパースできます。例: `2019-08-20 10:18:56` または `2019-08-20`。

関連項目:

- [DateTime データ型](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference {#cast_string_to_dynamic_use_inference} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "文字列を解析して Dynamic 型に変換できるようにする設定を追加"}]}]}/>

String から Dynamic への変換時に型推論を行います

## cast_string_to_variant_use_inference {#cast_string_to_variant_use_inference} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "String から Variant への CAST 時に型推論を有効／無効にする新しい設定"}]}]}/>

String から Variant への変換時に型推論を行います。

## check_query_single_value_result {#check_query_single_value_result} 

<SettingsInfoBlock type="Bool" default_value="1" />

`MergeTree` ファミリーエンジンに対する [CHECK TABLE](/sql-reference/statements/check-table) クエリ結果の詳細度を定義します。

設定可能な値:

- 0 — クエリはテーブル内の各データパーツごとのチェック結果を表示します。
- 1 — クエリはテーブル全体のチェック結果を表示します。

## check_referential_table_dependencies {#check_referential_table_dependencies} 

<SettingsInfoBlock type="Bool" default_value="0" />

DDL クエリ（`DROP TABLE` や `RENAME` など）が参照テーブルの依存関係を壊さないことをチェックします

## check_table_dependencies {#check_table_dependencies} 

<SettingsInfoBlock type="Bool" default_value="1" />

DDL クエリ（`DROP TABLE` や `RENAME` など）が依存関係を破壊しないことを確認します。

## checksum_on_read {#checksum_on_read} 

<SettingsInfoBlock type="Bool" default_value="1" />

読み込み時にチェックサムを検証します。これはデフォルトで有効になっており、本番環境では常に有効にしておく必要があります。この設定を無効にしても利点はありません。実験やベンチマーク用途でのみ使用してください。この設定は MergeTree ファミリーのテーブルにのみ適用されます。他のテーブルエンジンや、ネットワーク経由でデータを受信する場合には、チェックサムは常に検証されます。

## cloud_mode {#cloud_mode} 

<SettingsInfoBlock type="Bool" default_value="0" />

クラウドモード

## cloud_mode_database_engine {#cloud_mode_database_engine} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

Cloud で許可されるデータベースエンジン。1 の場合は DDL を Replicated データベースを使用するように書き換え、2 の場合は DDL を Shared データベースを使用するように書き換える。

## cloud_mode_engine {#cloud_mode_engine} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Cloud で使用を許可されるエンジンファミリー。

- 0 - すべてのエンジンを許可する
- 1 - DDL を書き換えて *ReplicatedMergeTree を使用する
- 2 - DDL を書き換えて SharedMergeTree を使用する
- 3 - 明示的に指定された remote disk がある場合を除き、DDL を書き換えて SharedMergeTree を使用する

公開部分を最小化するために UInt64 型を使用

## cluster_for_parallel_replicas {#cluster_for_parallel_replicas} 

<BetaBadge/>

現在のサーバーが存在するシャード用のクラスタ

## cluster_function_process_archive_on_multiple_nodes {#cluster_function_process_archive_on_multiple_nodes} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、クラスタ関数におけるアーカイブ処理のパフォーマンスが向上します。以前のバージョンでアーカイブを伴うクラスタ関数を使用している場合は、互換性を保ち、25.7 以降へのアップグレード時のエラーを回避するために `false` に設定してください。

## cluster_table_function_buckets_batch_size {#cluster_table_function_buckets_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting."}]}]}/>

`bucket` 単位での分割粒度を持つクラスタテーブル関数において、タスクの分散処理に使用されるバッチのおおよそのサイズ（バイト単位）を指定します。システムは、少なくともこの値に達するまでデータを蓄積します。実際のサイズは、データ境界に揃えるためにわずかに大きくなる場合があります。

## cluster_table_function_split_granularity {#cluster_table_function_split_granularity} 

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

CLUSTER TABLE FUNCTION を実行する際に、データがタスクにどのように分割されるかを制御します。

この設定は、クラスタ全体における作業分配の粒度を定義します：

- `file` — 各タスクがファイル全体を処理します。
- `bucket` — タスクがファイル内の内部データブロックごとに作成されます（例えば、Parquet の行グループ）。

より細かい粒度（`bucket` など）を選択すると、少数の巨大なファイルを扱う場合に並列性を高めることができます。
例えば、1 つの Parquet ファイルに複数の行グループが含まれている場合、`bucket` 粒度を有効にすると、各グループを異なるワーカーが独立して処理できるようになります。

## collect_hash_table_stats_during_aggregation {#collect_hash_table_stats_during_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

メモリ割り当てを最適化するために、ハッシュテーブルの統計情報を収集します

## collect_hash_table_stats_during_joins {#collect_hash_table_stats_during_joins} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

メモリ割り当てを最適化するために、ハッシュテーブル統計の収集を有効にします。

## compatibility {#compatibility} 

`compatibility` 設定は、設定値として指定した過去バージョンの ClickHouse のデフォルト設定を ClickHouse に使用させます。

設定がデフォルト以外の値に変更されている場合は、その値が優先されます（`compatibility` 設定の影響を受けるのは、変更されていない設定のみです）。

この設定には、`22.3` や `22.8` のように ClickHouse のバージョン番号を文字列として指定します。空の値は、この設定が無効であることを意味します。

デフォルトでは無効です。

:::note
ClickHouse Cloud では、サービスレベルのデフォルトの `compatibility` 設定は ClickHouse Cloud サポートによって設定される必要があります。設定を希望する場合は、[ケースを作成](https://clickhouse.cloud/support)してください。
ただし、ユーザー、ロール、プロファイル、クエリ、またはセッション単位では、`SET compatibility = '22.3'`（セッション内）や `SETTINGS compatibility = '22.3'`（クエリ内）のような、標準的な ClickHouse の設定機構を用いて `compatibility` 設定をオーバーライドできます。
:::

## compatibility_ignore_auto_increment_in_create_table {#compatibility_ignore_auto_increment_in_create_table} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、カラム定義内の AUTO_INCREMENT キーワードを無視し、それ以外の場合はエラーを返します。これにより、MySQL からの移行が容易になります。

## compatibility_ignore_collation_in_create_table {#compatibility_ignore_collation_in_create_table} 

<SettingsInfoBlock type="Bool" default_value="1" />

`CREATE TABLE` の照合順序設定を無視する互換性オプション

## compile_aggregate_expressions {#compile_aggregate_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約関数をネイティブコードに JIT コンパイルするかどうかを有効または無効にします。有効にするとパフォーマンスが向上する場合があります。

設定可能な値:

- 0 — 集約は JIT コンパイルなしで実行されます。
- 1 — 集約は JIT コンパイルを使用して実行されます。

**関連項目**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions {#compile_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "JIT コンパイラを支える LLVM インフラストラクチャは、この設定をデフォルトで有効にしても十分に安定していると判断しています。"}]}]}/>

一部のスカラー関数および演算子をネイティブコードにコンパイルします。

## compile_sort_description {#compile_sort_description} 

<SettingsInfoBlock type="Bool" default_value="1" />

ソート記述子をネイティブコードにコンパイルします。

## connect_timeout {#connect_timeout} 

<SettingsInfoBlock type="Seconds" default_value="10" />

レプリカが存在しない場合の接続タイムアウト

## connect_timeout_with_failover_ms {#connect_timeout_with_failover_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default connect timeout because of async connect"}]}]}/>

`shard` セクションと `replica` セクションがクラスタ定義で使用されている場合に、Distributed テーブルエンジンがリモートサーバーに接続するためのタイムアウト時間（ミリ秒単位）です。
接続に失敗した場合は、異なるレプリカへの接続が複数回試行されます。

## connect_timeout_with_failover_secure_ms {#connect_timeout_with_failover_secure_ms} 

<SettingsInfoBlock type="ミリ秒" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "非同期接続に対応するため、セキュア接続のタイムアウトのデフォルト値を増加"}]}]}/>

最初の正常なレプリカを選択する際の接続タイムアウト（セキュア接続時）。

## connection_pool_max_wait_ms {#connection_pool_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

接続プールが満杯のときに、接続確立を待機する時間（ミリ秒）。

取りうる値:

- 正の整数。
- 0 — 無制限のタイムアウト。

## connections_with_failover_max_tries {#connections_with_failover_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Distributed テーブルエンジンにおいて、各レプリカごとの接続試行回数の上限。

## convert&#95;query&#95;to&#95;cnf

<SettingsInfoBlock type="Bool" default_value="0" />

`true` に設定すると、`SELECT` クエリは連言標準形（CNF: Conjunctive Normal Form）に変換されます。クエリを CNF に書き換えることで、より高速に実行される場合があります（詳しくは、この [GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/11749) を参照してください）。

たとえば、デフォルトの動作では次の `SELECT` クエリは変換されません。

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

`convert_query_to_cnf` を `true` に設定して、何が変わるか確認してみましょう。

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

`WHERE` 句が CNF に書き換えられている点に注目してください。ただし、結果セットは同一であり、ブール論理は変わっていません。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "新しい設定。デコリレーション後のクエリプランにおけるデフォルトの結合種別。"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "新しい設定。デコリレーション後のクエリプランにおけるデフォルトの結合種別。"}]}]}/>

デコリレーション後のクエリプランにおける結合種別を制御します。デフォルト値は `right` であり、これはデコリレーション後のプランにおいて、サブクエリの入力が右側に位置する RIGHT JOIN が含まれることを意味します。

取り得る値:

- `left` - デコリレーション処理は LEFT JOIN を生成し、入力テーブルは左側に配置されます。
- `right` - デコリレーション処理は RIGHT JOIN を生成し、入力テーブルは右側に配置されます。

## correlated_subqueries_substitute_equivalent_expressions {#correlated_subqueries_substitute_equivalent_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "相関サブクエリのプランニング最適化のための新しい設定。"}]}]}/>

CROSS JOIN を作成する代わりに、フィルター式から等価な式を推論してそれらに置き換えます。

## count_distinct_implementation {#count_distinct_implementation} 

<SettingsInfoBlock type="String" default_value="uniqExact" />

`COUNT(DISTINCT ...)` 構文を実行する際に使用する `uniq*` 関数を指定します。参照: [COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count)

指定可能な値:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization {#count_distinct_optimization} 

<SettingsInfoBlock type="Bool" default_value="0" />

`COUNT(DISTINCT ...)` を `GROUP BY` を用いたサブクエリに書き換えます

## count_matches_stop_at_empty_match {#count_matches_stop_at_empty_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`countMatches` 関数で、パターンが長さ 0（空文字列）にマッチした時点でカウントを停止します。

## create_if_not_exists {#create_if_not_exists} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`CREATE` ステートメントに対して、デフォルトで `IF NOT EXISTS` を有効にします。この設定または `IF NOT EXISTS` のいずれかが指定されていて、指定された名前のテーブルがすでに存在する場合、例外は発生しません。

## create_index_ignore_unique {#create_index_ignore_unique} 

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE UNIQUE INDEX における UNIQUE キーワードを無視します。SQL 互換性テスト向けの設定です。

## create_replicated_merge_tree_fault_injection_probability {#create_replicated_merge_tree_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

ZooKeeper でメタデータを作成した後のテーブル作成時に、障害注入が行われる確率

## create_table_empty_primary_key_by_default {#create_table_empty_primary_key_by_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

ORDER BY および PRIMARY KEY が指定されていない場合に、PRIMARY KEY が空の *MergeTree テーブルの作成を許可します

## cross_join_min_bytes_to_compress {#cross_join_min_bytes_to_compress} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "CROSS JOIN で圧縮対象とするブロックの最小サイズ。値を 0 にすると、このしきい値は無効になります。行数またはバイト数のいずれかのしきい値に達した時点で、そのブロックが圧縮されます。"}]}]}/>

CROSS JOIN で圧縮対象とするブロックの最小サイズ。値を 0 にすると、このしきい値は無効になります。行数またはバイト数のいずれかのしきい値に達した時点で、そのブロックが圧縮されます。

## cross_join_min_rows_to_compress {#cross_join_min_rows_to_compress} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "CROSS JOIN 時にブロックを圧縮する際の最小行数。0 を指定すると、このしきい値は無効化されます。行数またはバイト数のいずれか一方のしきい値に達した時点で、このブロックは圧縮されます。"}]}]}/>

CROSS JOIN 時にブロックを圧縮する際の最小行数。0 を指定すると、このしきい値は無効化されます。行数またはバイト数のいずれか一方のしきい値に達した時点で、このブロックは圧縮されます。

## data_type_default_nullable {#data_type_default_nullable} 

<SettingsInfoBlock type="Bool" default_value="0" />

カラム定義で明示的な修飾子 [NULL または NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) が指定されていないデータ型を、[Nullable](/sql-reference/data-types/nullable) 型として扱うかどうかを制御します。

設定可能な値:

- 1 — カラム定義内のデータ型は、デフォルトで `Nullable` に設定されます。
- 0 — カラム定義内のデータ型は、デフォルトで `Nullable` ではない型に設定されます。

## database_atomic_wait_for_drop_and_detach_synchronously {#database_atomic_wait_for_drop_and_detach_synchronously} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべての `DROP` および `DETACH` クエリに修飾子 `SYNC` を追加します。

設定可能な値:

- 0 — クエリは遅延して実行されます。
- 1 — クエリは遅延なしで実行されます。

## database_replicated_allow_explicit_uuid {#database_replicated_allow_explicit_uuid} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "テーブルの UUID の明示的な指定を禁止する新しい設定を追加"}]}]}/>

0 - Replicated データベース内のテーブルに対して UUID を明示的に指定することを許可しない。1 - 許可する。2 - 許可するが、指定された UUID は無視して代わりにランダムな UUID を生成する。

## database_replicated_allow_heavy_create {#database_replicated_allow_heavy_create} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Replicated データベースエンジンでは、長時間実行される DDL クエリ（CREATE AS SELECT や POPULATE）は禁止されていました"}]}]}/>

Replicated データベースエンジンで、長時間実行される DDL クエリ（CREATE AS SELECT や POPULATE）を許可します。DDL キューを長時間にわたってブロックする可能性がある点に注意してください。

## database_replicated_allow_only_replicated_engine {#database_replicated_allow_only_replicated_engine} 

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated エンジンのデータベース内では、Replicated テーブルのみ作成できるように制限します

## database_replicated_allow_replicated_engine_arguments {#database_replicated_allow_replicated_engine_arguments} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "デフォルトでは明示的な引数を許可しない"}]}]}/>

0 - Replicated データベース内の *MergeTree テーブルで ZooKeeper パスおよびレプリカ名を明示的に指定することを許可しない。1 - 許可する。2 - 許可するが、指定されたパスは無視してデフォルトのパスを使用する。3 - 許可し、警告をログに出力しない。

## database_replicated_always_detach_permanently {#database_replicated_always_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="0" />

データベースエンジンが Replicated の場合、`DETACH TABLE` を `DETACH TABLE PERMANENTLY` として実行します。

## database_replicated_enforce_synchronous_settings {#database_replicated_enforce_synchronous_settings} 

<SettingsInfoBlock type="Bool" default_value="0" />

一部のクエリに対して、同期的な完了待ちを強制します（`database_atomic_wait_for_drop_and_detach_synchronously`、`mutations_sync`、`alter_sync` も参照）。これらの設定を有効化することは推奨されません。

## database_replicated_initial_query_timeout_sec {#database_replicated_initial_query_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="300" />

最初の DDL クエリが、Replicated データベースによる先行する DDL キューエントリの処理完了を待機する時間を秒単位で設定します。

指定可能な値:

- 正の整数。
- 0 — 無制限。

## database_shared_drop_table_delay_seconds {#database_shared_drop_table_delay_seconds} 

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "New setting."}]}]}/>

Shared データベースからドロップされたテーブルが実際に削除されるまでの遅延時間（秒単位）。この時間内であれば、`UNDROP TABLE` ステートメントを使用してテーブルを復元できます。

## decimal_check_overflow {#decimal_check_overflow} 

<SettingsInfoBlock type="Bool" default_value="1" />

10 進数型の算術演算および比較演算におけるオーバーフローをチェックする

## deduplicate_blocks_in_dependent_materialized_views {#deduplicate_blocks_in_dependent_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated\* テーブルからデータを受け取るマテリアライズドビューに対する重複排除チェックを有効または無効にします。

設定可能な値:

0 — 無効。
      1 — 有効。

有効にすると、ClickHouse は Replicated\* テーブルに依存するマテリアライズドビュー内のブロックの重複排除処理を行います。
この設定は、障害により挿入操作がリトライされている場合に、マテリアライズドビューに重複データが含まれないようにするのに役立ちます。

**関連項目**

- [IN 演算子における NULL の処理](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## default_materialized_view_sql_security {#default_materialized_view_sql_security} 

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "マテリアライズドビュー作成時の SQL SECURITY オプションのデフォルト値を設定します"}]}]}/>

マテリアライズドビューを作成する際の SQL SECURITY オプションのデフォルト値を設定します。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `DEFINER` です。

## default_max_bytes_in_join {#default_max_bytes_in_join} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

制限が必要だが `max_bytes_in_join` が設定されていない場合に適用される、結合の右側テーブルの最大サイズ。

## default_normal_view_sql_security {#default_normal_view_sql_security} 

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "通常ビューを作成する際のデフォルトの `SQL SECURITY` オプションを設定します"}]}]}/>

通常ビューを作成する際のデフォルトの `SQL SECURITY` オプションを設定します。[SQL SECURITY の詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `INVOKER` です。

## default&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "より使いやすくするために、デフォルトのテーブルエンジンを MergeTree に設定"}]}]} />

`CREATE` 文で `ENGINE` が設定されていない場合に使用されるデフォルトのテーブルエンジン。

可能な値:

* 任意の有効なテーブルエンジン名を表す文字列

Cloud でのデフォルト値: `SharedMergeTree`.

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

この例では、`Engine` を指定していない新しく作成されるテーブルはすべて、`Log` テーブルエンジンを使用します。

クエリ:

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


## default&#95;temporary&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

一時テーブルに対する設定であり、[default&#95;table&#95;engine](#default_table_engine) と同様です。

この例では、`Engine` を指定していない新しい一時テーブルはすべて、`Log` テーブルエンジンを使用します。

クエリ:

```sql
SET default_temporary_table_engine = 'Log';

CREATE TEMPORARY TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TEMPORARY TABLE my_table;
```

結果:

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "ビュー作成時のデフォルトの `DEFINER` オプションを設定できるようにします"}]}]}/>

ビュー作成時のデフォルトの `DEFINER` オプションを設定できます。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `CURRENT_USER` です。

## delta_lake_enable_engine_predicate {#delta_lake_enable_engine_predicate} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

delta-kernel の内部データのプルーニングを有効にします。

## delta_lake_enable_expression_visitor_logging {#delta_lake_enable_expression_visitor_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Delta Lake の expression visitor に対するテストレベルのログ出力を有効にします。これらのログは、テスト用ログとしても冗長になりすぎる可能性があります。

## delta_lake_insert_max_bytes_in_data_file {#delta_lake_insert_max_bytes_in_data_file} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

Delta Lake で挿入される単一のデータファイルのサイズ上限（バイト数）を定義します。

## delta_lake_insert_max_rows_in_data_file {#delta_lake_insert_max_rows_in_data_file} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新しい設定。"}]}]}/>

Delta Lake において、1 回の挿入で作成される 1 つのデータファイルに含める行数の上限を指定します。

## delta_lake_log_metadata {#delta_lake_log_metadata} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

Delta Lake のメタデータファイルを system テーブルにログとして記録できるようにします。

## delta_lake_snapshot_version {#delta_lake_snapshot_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "New setting"}]}]}/>

読み込む Delta Lake スナップショットのバージョン。値 -1 は最新バージョンを読み込むことを意味します（0 も有効なスナップショットバージョンです）。

## delta_lake_throw_on_engine_predicate_error {#delta_lake_throw_on_engine_predicate_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

delta-kernel でスキャン述語を解析中にエラーが発生した場合に、例外をスローするかどうかを指定します。

## describe_compact_output {#describe_compact_output} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、DESCRIBE クエリの結果には列名と型のみが含まれます

## describe_include_subcolumns {#describe_include_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="0" />

[DESCRIBE](../../sql-reference/statements/describe-table.md) クエリでサブカラムを出力するかどうかを制御します。たとえば、[Tuple](../../sql-reference/data-types/tuple.md) のメンバーや、[Map](/sql-reference/data-types/map#reading-subcolumns-of-map)、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null)、[Array](../../sql-reference/data-types/array.md/#array-size) データ型のサブカラムなどです。

設定可能な値:

- 0 — サブカラムは `DESCRIBE` クエリに含まれません。
- 1 — サブカラムは `DESCRIBE` クエリに含まれます。

**Example**

[DESCRIBE](../../sql-reference/statements/describe-table.md) ステートメントの例を参照してください。

## describe_include_virtual_columns {#describe_include_virtual_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、テーブルの仮想カラムも DESCRIBE クエリの結果に含まれます

## dialect {#dialect} 

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

クエリの解析に使用する dialect

## dictionary_validate_primary_key_type {#dictionary_validate_primary_key_type} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "辞書の主キー型を検証します。デフォルトでは、simple レイアウトでは id の型が暗黙的に UInt64 に変換されます。"}]}]}/>

辞書の主キー型を検証します。デフォルトでは、simple レイアウトでは id の型が暗黙的に UInt64 に変換されます。

## distinct_overflow_mode {#distinct_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限値を超えたときの動作を設定します。

指定可能な値:

- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、入力元データが尽きたかのように部分的な結果を返します。

## distributed_aggregation_memory_efficient {#distributed_aggregation_memory_efficient} 

<SettingsInfoBlock type="Bool" default_value="1" />

分散アグリゲーションのメモリ効率化モードを有効にするかどうかを指定します。

## distributed_background_insert_batch {#distributed_background_insert_batch} 

**別名**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

挿入されたデータをバッチで送信するかどうかを制御します。

バッチ送信が有効な場合、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンは、挿入データの複数のファイルを個別に送信するのではなく、1 回の操作でまとめて送信しようとします。バッチ送信により、サーバーおよびネットワークリソースをより有効に活用できるため、クラスターのパフォーマンスが向上します。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

## distributed_background_insert_max_sleep_time_ms {#distributed_background_insert_max_sleep_time_ms} 

**別名**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信するための最大間隔です。設定 [`distributed_background_insert_sleep_time_ms`](#distributed_background_insert_sleep_time_ms) で指定された間隔の指数的な増加を制限します。

設定可能な値:

- ミリ秒単位の正の整数値。

## distributed_background_insert_sleep_time_ms {#distributed_background_insert_sleep_time_ms} 

**別名**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信する際の基準となる間隔です。エラーが発生した場合、実際の間隔は指数関数的に増加します。

設定可能な値:

- ミリ秒単位の正の整数値。

## distributed_background_insert_split_batch_on_failure {#distributed_background_insert_split_batch_on_failure} 

**別名**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

失敗時にバッチを分割するかどうかを有効／無効にします。

特定のバッチをリモートシャードへ送信する際、後段の複雑なパイプライン（例: `GROUP BY` を含む `MATERIALIZED VIEW`）が原因で、`Memory limit exceeded` などのエラーにより失敗することがあります。この場合、リトライしても状況は改善せず（そのテーブルの分散送信が詰まったままになります）が、そのバッチ内のファイルを 1 件ずつ送信すれば INSERT が成功する場合があります。

そのため、この設定を `1` にすると、そのようなバッチに対してバッチ処理を無効化します（すなわち、失敗したバッチに対して一時的に `distributed_background_insert_batch` を無効化します）。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

:::note
この設定は、壊れたバッチにも影響します（これはサーバー（マシン）の異常終了と、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンで `fsync_after_insert` / `fsync_directories` を行っていないことが原因で発生することがあります）。
:::

:::note
自動バッチ分割に依存すべきではありません。性能を損なう可能性があります。
:::

## distributed_background_insert_timeout {#distributed_background_insert_timeout} 

**エイリアス**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

`Distributed` テーブルへの挿入クエリのタイムアウトです。`insert_distributed_sync` が有効な場合にのみ使用されます。値が 0 の場合はタイムアウトなしを意味します。

## distributed_cache_alignment {#distributed_cache_alignment} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "distributed_cache_read_alignment の名称変更"}]}]}/>

ClickHouse Cloud でのみ有効です。テスト目的の設定であり、変更しないでください。

## distributed_cache_bypass_connection_pool {#distributed_cache_bypass_connection_pool} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache の接続プールをバイパスできるようにします。

## distributed_cache_connect_backoff_max_ms {#distributed_cache_connect_backoff_max_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続の確立時に使用されるバックオフ時間の最大値（ミリ秒）です。

## distributed_cache_connect_backoff_min_ms {#distributed_cache_connect_backoff_min_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続を確立する際のバックオフ時間の最小値（ミリ秒単位）を指定します。

## distributed_cache_connect_max_tries {#distributed_cache_connect_max_tries} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "設定値の変更"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Cloud 限定"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "ClickHouse Cloud 専用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュへの接続が失敗した場合に行う再試行の回数です。

## distributed_cache_connect_timeout_ms {#distributed_cache_connect_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへの接続時の接続タイムアウトです。

## distributed_cache_credentials_refresh_period_seconds {#distributed_cache_credentials_refresh_period_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

ClickHouse Cloud でのみ有効です。認証情報の更新間隔です。

## distributed_cache_data_packet_ack_window {#distributed_cache_data_packet_ack_window} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の分散キャッシュ読み取りリクエストにおける DataPacket シーケンスに対して ACK を送信するためのウィンドウを指定します。

## distributed_cache_discard_connection_if_unread_data {#distributed_cache_discard_connection_if_unread_data} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。未読み取りのデータがある場合は接続を破棄します。

## distributed_cache_fetch_metrics_only_from_current_az {#distributed_cache_fetch_metrics_only_from_current_az} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。system.distributed_cache_metrics および system.distributed_cache_events において、現在のアベイラビリティゾーンからのみメトリクスを取得します。

## distributed_cache_log_mode {#distributed_cache_log_mode} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。system.distributed_cache_log への書き込みモードを指定します。

## distributed_cache_max_unacked_inflight_packets {#distributed_cache_max_unacked_inflight_packets} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の distributed cache 読み取りリクエスト内における、未 ACK の in-flight パケット数の上限を指定します。

## distributed_cache_min_bytes_for_seek {#distributed_cache_min_bytes_for_seek} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しいプライベート設定。"}]}]}/>

ClickHouse Cloud のみで効果があります。分散キャッシュでシークを実行する際の最小バイト数を指定します。

## distributed_cache_pool_behaviour_on_limit {#distributed_cache_pool_behaviour_on_limit} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud only"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ効果があります。プールの上限に達した際に、分散キャッシュ接続がどのように動作するかを指定します。

## distributed_cache_prefer_bigger_buffer_size {#distributed_cache_prefer_bigger_buffer_size} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem_cache_prefer_bigger_buffer_size と同様ですが、分散キャッシュ用の設定です。

## distributed_cache_read_only_from_current_az {#distributed_cache_read_only_from_current_az} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。現在のアベイラビリティゾーン内のキャッシュサーバーからの読み取りだけを許可します。無効にすると、すべてのアベイラビリティゾーン内のすべてのキャッシュサーバーから読み取ります。

## distributed_cache_read_request_max_tries {#distributed_cache_read_request_max_tries} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "Changed setting value"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュリクエストが失敗した場合に再試行する回数を指定します。

## distributed_cache_receive_response_wait_milliseconds {#distributed_cache_receive_response_wait_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュからリクエストに対するデータを受信するまでの待機時間をミリ秒単位で指定します。

## distributed_cache_receive_timeout_milliseconds {#distributed_cache_receive_timeout_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュから何らかの応答を受信するまでの待機時間をミリ秒で指定します。

## distributed_cache_receive_timeout_ms {#distributed_cache_receive_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーからデータを受信する際のタイムアウトをミリ秒単位で指定します。この時間内に 1 バイトもデータを受信しなかった場合、例外がスローされます。

## distributed_cache_send_timeout_ms {#distributed_cache_send_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "新しい設定"}]}]}/>

ClickHouse Cloud でのみ効果があります。分散キャッシュサーバーへのデータ送信タイムアウトをミリ秒単位で指定します。クライアントがデータを送信する必要があるにもかかわらず、この時間内に 1 バイトも送信できなかった場合は、例外がスローされます。

## distributed_cache_tcp_keep_alive_timeout_ms {#distributed_cache_tcp_keep_alive_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "新規設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへの接続がアイドル状態になってから、TCP が keepalive プローブの送信を開始するまでの時間をミリ秒単位で指定します。

## distributed_cache_throw_on_error {#distributed_cache_throw_on_error} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュとの通信中に発生した例外、または分散キャッシュから受信した例外を再スローします。それ以外の場合は、エラー時に分散キャッシュをスキップするフォールバック動作になります。

## distributed_cache_wait_connection_from_pool_milliseconds {#distributed_cache_wait_connection_from_pool_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。`distributed_cache_pool_behaviour_on_limit` が `wait` の場合に、接続プールから接続を取得するまでの待機時間（ミリ秒）を指定します。

## distributed_connections_pool_size {#distributed_connections_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

1 つの Distributed テーブルに対するすべてのクエリを分散処理する際に使用される、リモートサーバーへの同時接続数の上限です。クラスター内のサーバー数以上の値を設定することを推奨します。

## distributed_ddl_entry_format_version {#distributed_ddl_entry_format_version} 

<SettingsInfoBlock type="UInt64" default_value="5" />

分散 DDL（`ON CLUSTER`）クエリの互換性バージョン

## distributed_ddl_output_mode {#distributed_ddl_output_mode} 

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

分散 DDL クエリの結果形式を設定します。

設定可能な値:

- `throw` — クエリが完了したすべてのホストについて、クエリ実行ステータスを含む結果セットを返します。クエリが一部のホストで失敗した場合は、最初の例外を再スローします。クエリが一部のホストでまだ完了しておらず、[distributed_ddl_task_timeout](#distributed_ddl_task_timeout) を超過した場合は、`TIMEOUT_EXCEEDED` 例外をスローします。
- `none` — `throw` と同様ですが、分散 DDL クエリは結果セットを返しません。
- `null_status_on_timeout` — 対応するホストでクエリが完了していない場合に `TIMEOUT_EXCEEDED` をスローする代わりに、結果セット内の一部の行の実行ステータスとして `NULL` を返します。
- `never_throw` — 一部のホストでクエリが失敗しても `TIMEOUT_EXCEEDED` をスローせず、例外も再スローしません。
- `none_only_active` - `none` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。注意: このモードでは、一部のレプリカでクエリが実行されておらず、バックグラウンドで実行されることになる状況を把握することはできません。
- `null_status_on_timeout_only_active` — `null_status_on_timeout` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。
- `throw_only_active` — `throw` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。

Cloud におけるデフォルト値: `throw`。

## distributed_ddl_task_timeout {#distributed_ddl_task_timeout} 

<SettingsInfoBlock type="Int64" default_value="180" />

クラスタ内のすべてのホストからの DDL クエリ応答に対するタイムアウト時間を設定します。DDL リクエストがすべてのホストで実行されていない場合、応答にはタイムアウトエラーが含まれ、リクエストは非同期モードで実行されます。負の値は無限を意味します。

取りうる値:

- 正の整数。
- 0 — 非同期モード。
- 負の整数 — 無限のタイムアウト。

## distributed_foreground_insert {#distributed_foreground_insert} 

**別名**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

[Distributed](/engines/table-engines/special/distributed) テーブルへの同期的なデータ挿入を有効または無効にします。

デフォルトでは、`Distributed` テーブルにデータを挿入すると、ClickHouse サーバーはバックグラウンドモードでクラスターノードにデータを送信します。`distributed_foreground_insert=1` の場合、データは同期的に処理され、すべてのデータがすべてのシャード上に保存された後にのみ `INSERT` 操作が成功します（`internal_replication` が true の場合は、各シャードについて少なくとも 1 つのレプリカに保存されている必要があります）。

設定可能な値:

- `0` — データはバックグラウンドモードで挿入されます。
- `1` — データは同期モードで挿入されます。

Cloud でのデフォルト値: `0`。

**関連項目**

- [Distributed テーブルエンジン](/engines/table-engines/special/distributed)
- [Distributed テーブルの管理](/sql-reference/statements/system#managing-distributed-tables)

## distributed&#95;group&#95;by&#95;no&#95;merge

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリ処理において、異なるサーバーからの集約状態をマージしません。シャードごとに異なるキーが存在することが明らかな場合に使用できます。

可能な値:

* `0` — 無効（最終的なクエリ処理はイニシエーターノードで実行されます）。
* `1` - 分散クエリ処理において、異なるサーバーからの集約状態をマージしません（クエリはシャード側で完全に処理され、イニシエーターノードはデータを中継するだけです）。シャードごとに異なるキーが存在することが明らかな場合に使用できます。
* `2` - `1` と同様ですが、イニシエーターノード側で `ORDER BY` および `LIMIT` を適用します（`distributed_group_by_no_merge=1` の場合のように、クエリがリモートノード上だけで完全に処理される場合には不可能です）。`ORDER BY` および/または `LIMIT` を含むクエリで使用できます。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "true の場合、Distributed への INSERT で読み取り専用レプリカをスキップします"}]}]}/>

Distributed テーブルへの INSERT クエリで読み取り専用レプリカをスキップできるようにします。

設定可能な値:

- 0 — INSERT は通常どおり行われ、読み取り専用レプリカに送信された場合は失敗します
- 1 — クエリの発行元ノードは、データをシャードに送信する前に読み取り専用レプリカをスキップします。

## distributed_plan_default_reader_bucket_count {#distributed_plan_default_reader_bucket_count} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリで並列読み取りを行うタスク数のデフォルト値です。タスクはレプリカ間で分散されます。

## distributed_plan_default_shuffle_join_bucket_count {#distributed_plan_default_shuffle_join_bucket_count} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新しい実験的な設定です。"}]}]}/>

分散シャッフルハッシュ結合におけるバケット数のデフォルト値。

## distributed_plan_execute_locally {#distributed_plan_execute_locally} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプラン内のすべてのタスクをローカルで実行します。テストやデバッグに有用です。

## distributed_plan_force_exchange_kind {#distributed_plan_force_exchange_kind} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "New experimental setting."}]}]}/>

分散クエリステージ間で、指定した種類の Exchange オペレーターを使用するよう強制します。

可能な値:

- '' - いずれの種類の Exchange オペレーターも強制せず、オプティマイザに選択を任せる
 - 'Persisted' - オブジェクトストレージ内の一時ファイルを使用する
 - 'Streaming' - Exchange のデータをネットワーク経由でストリーミングする

## distributed_plan_force_shuffle_aggregation {#distributed_plan_force_shuffle_aggregation} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい実験的な設定"}]}]}/>

分散クエリプランにおいて、PartialAggregation + Merge の代わりに Shuffle 集約戦略を使用します。

## distributed_plan_max_rows_to_broadcast {#distributed_plan_max_rows_to_broadcast} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランにおいて、シャッフル結合ではなくブロードキャスト結合を使用するかどうかを判断する際の最大行数。

## distributed_plan_optimize_exchanges {#distributed_plan_optimize_exchanges} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New experimental setting."}]}]}/>

分散クエリプラン内の不要な Exchange を削除します。デバッグ用途では無効にしてください。

## distributed_product_mode {#distributed_product_mode} 

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

[分散サブクエリ](../../sql-reference/operators/in.md)の動作を変更します。

クエリに分散テーブルの積（product）が含まれている場合、つまり分散テーブルに対するクエリの中に、その分散テーブルに対する非 `GLOBAL` なサブクエリが含まれている場合に、ClickHouse はこの設定を適用します。

制約:

- `IN` および `JOIN` のサブクエリに対してのみ適用されます。
- `FROM` 句で、複数シャードを含む分散テーブルを使用している場合にのみ適用されます。
- サブクエリの対象が、複数シャードを含む分散テーブルである場合にのみ適用されます。
- テーブル値関数である [remote](../../sql-reference/table-functions/remote.md) 関数には使用されません。

設定値:

- `deny` — デフォルト値。この種のサブクエリの使用を禁止します（`Double-distributed in/JOIN subqueries is denied` という例外を返します）。
- `local` — サブクエリ内のデータベースおよびテーブルを、宛先サーバー（シャード）のローカルなものに置き換え、通常の `IN`/`JOIN` のままにします。
- `global` — `IN`/`JOIN` クエリを `GLOBAL IN`/`GLOBAL JOIN` に置き換えます。
- `allow` — この種のサブクエリの使用を許可します。

## distributed_push_down_limit {#distributed_push_down_limit} 

<SettingsInfoBlock type="UInt64" default_value="1" />

各シャードごとに個別に [LIMIT](#limit) を適用するかどうかを制御します。

これにより、次のことを回避できます:

- 余分な行をネットワーク経由で送信すること
- イニシエーター側で、LIMIT を超えた行を処理すること

バージョン 21.9 以降では、`distributed_push_down_limit` がクエリ実行を変更するのは、少なくとも次の条件のいずれかが満たされる場合に限られるため、不正確な結果が返されることはありません。

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0。
- クエリに `GROUP BY` / `DISTINCT` / `LIMIT BY` **がなく**、`ORDER BY` / `LIMIT` がある。
- クエリに `GROUP BY` / `DISTINCT` / `LIMIT BY` と `ORDER BY` / `LIMIT` **があり**、かつ:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効。
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) が有効。

取りうる値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap {#distributed_replica_error_cap} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 種別: 符号なし整数
- デフォルト値: 1000

各レプリカのエラー数はこの値で上限が設けられ、単一のレプリカが過度に多くのエラーを蓄積するのを防ぎます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life {#distributed_replica_error_half_life} 

<SettingsInfoBlock type="Seconds" default_value="60" />

- 種類: 秒
- デフォルト値: 60 秒

分散テーブルにおけるエラー数がどの程度の速さでゼロにリセットされるかを制御します。あるレプリカがしばらくの間利用不能となり、エラーを 5 回蓄積し、`distributed_replica_error_half_life` が 1 秒に設定されている場合、そのレプリカは最後のエラーから 3 秒後に正常と見なされます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors {#distributed_replica_max_ignored_errors} 

<SettingsInfoBlock type="UInt64" default_value="0" />

- 型: 符号なし整数
- デフォルト値: 0

レプリカを選択する際に（`load_balancing` アルゴリズムに従って）、無視されるエラーの件数。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final {#do_not_merge_across_partitions_select_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

`FINAL` 付きの `SELECT` クエリで、1 つのパーティション内のパーツのみをマージする

## empty_result_for_aggregation_by_constant_keys_on_empty_set {#empty_result_for_aggregation_by_constant_keys_on_empty_set} 

<SettingsInfoBlock type="Bool" default_value="1" />

空集合を定数キーで集約する場合は、空の結果を返します。

## empty_result_for_aggregation_by_empty_set {#empty_result_for_aggregation_by_empty_set} 

<SettingsInfoBlock type="Bool" default_value="0" />

空の集合に対してキーを指定しない集計を実行した場合に、空の結果を返します。

## enable_adaptive_memory_spill_scheduler {#enable_adaptive_memory_spill_scheduler} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定。状況に応じてメモリ上のデータを外部ストレージにスピルすることを有効化します。"}]}]}/>

プロセッサをトリガーして、状況に応じてデータを外部ストレージにスピルします。現在は grace join がサポートされています。

## enable_add_distinct_to_in_subqueries {#enable_add_distinct_to_in_subqueries} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "分散 IN サブクエリで転送される一時テーブルのサイズを削減するための新しい設定。"}]}]}/>

`IN` サブクエリに対して `DISTINCT` を有効にします。これはトレードオフとなる設定です。有効化すると、分散 IN サブクエリで転送される一時テーブルのサイズを大幅に削減し、一意な値だけが送信されるようにすることで、シャード間のデータ転送を大幅に高速化できます。
ただし、この設定を有効にすると、各ノードでのマージ処理が追加で発生します。重複排除（DISTINCT）を実行する必要があるためです。ネットワーク転送がボトルネックとなっており、追加のマージコストが許容できる場合に、この設定を使用してください。

## enable_blob_storage_log {#enable_blob_storage_log} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "BLOB ストレージの操作情報を system.blob_storage_log テーブルに書き込む"}]}]}/>

BLOB ストレージの操作情報を system.blob_storage_log テーブルに書き込む

## enable_deflate_qpl_codec {#enable_deflate_qpl_codec} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、DEFLATE_QPL コーデックを列の圧縮に使用できます。

## enable_early_constant_folding {#enable_early_constant_folding} 

<SettingsInfoBlock type="Bool" default_value="1" />

関数やサブクエリの結果を評価し、定数と判断できる部分がある場合にクエリを書き換える最適化を有効にします

## enable_extended_results_for_datetime_functions {#enable_extended_results_for_datetime_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` 型と比較して値域が拡張された `Date32` 型、または `DateTime` 型と比較して値域が拡張された `DateTime64` 型の結果を返すかどうかを制御します。

指定可能な値:

- `0` — すべての種類の引数に対して、関数は `Date` または `DateTime` を返します。
- `1` — `Date32` または `DateTime64` の引数に対しては、関数は `Date32` または `DateTime64` を返し、それ以外の場合は `Date` または `DateTime` を返します。

下表は、さまざまな日時関数に対するこの設定の動作を示しています。

| 関数                        | `enable_extended_results_for_datetime_functions = 0`             | `enable_extended_results_for_datetime_functions = 1`                                                                   |
| ------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | `Date` または `DateTime` 型を返す                                       | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返す       |
| `toStartOfISOYear`        | `Date` または `DateTime` を返します。                                     | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` 型を返します<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` 型を返します |
| `toStartOfQuarter`        | `Date` または `DateTime` を返します                                      | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` 型を返す<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` 型を返す     |
| `toStartOfMonth`          | `Date` または `DateTime` を返します。                                     | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返す       |
| `toStartOfWeek`           | `Date` または `DateTime` 型を返す                                       | `Date`/`DateTime` 型の入力に対しては `Date`/`DateTime` 型を返します<br />`Date32`/`DateTime64` 型の入力に対しては `Date32`/`DateTime64` 型を返します |
| `toLastDayOfWeek`         | `Date` または `DateTime` を返します。                                     | `Date`/`DateTime` を入力とした場合は `Date`/`DateTime` を返す<br />`Date32`/`DateTime64` を入力とした場合は `Date32`/`DateTime64` を返す       |
| `toLastDayOfMonth`        | `Date` または `DateTime` 型を返す                                       | `Date`/`DateTime` 型の入力に対して `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `Date32`/`DateTime64` を返します     |
| `toMonday`                | `Date` または `DateTime` を返します                                      | `Date`/`DateTime` 型の入力に対して `Date`/`DateTime` を返します<br />`Date32`/`DateTime64` 型の入力に対して `Date32`/`DateTime64` を返します     |
| `toStartOfDay`            | 戻り値は `DateTime` 型です<br />*注意: 1970～2149年の範囲外の値では誤った結果が返されます*     | `Date`/`DateTime` の入力に対して `DateTime` を返します<br />`Date32`/`DateTime64` の入力に対して `DateTime64` を返します                       |
| `toStartOfHour`           | `DateTime` を返します<br />*注: 1970～2149 年の範囲外の値では誤った結果が返されます*        | `Date`/`DateTime` 型の入力に対しては `DateTime` 型を返します<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` 型を返します                 |
| `toStartOfFifteenMinutes` | `DateTime` を返します<br />*注意: 1970〜2149年の範囲外の値では正しくない結果が返されます*      | `Date`/`DateTime` 型の入力に対しては `DateTime` を返す<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` を返す                       |
| `toStartOfTenMinutes`     | `DateTime` を返します<br />*注: 1970〜2149 年の範囲外の値の場合は誤った結果を返します*       | `Date`/`DateTime` の入力に対して `DateTime` を返す<br />`Date32`/`DateTime64` の入力に対して `DateTime64` を返す                           |
| `toStartOfFiveMinutes`    | `DateTime` を返します<br />*注: 1970～2149 年の範囲外の値では誤った結果が返されます*        | `Date`/`DateTime` 型の入力では `DateTime` 型を返す<br />`Date32`/`DateTime64` 型の入力では `DateTime64` 型を返す                           |
| `toStartOfMinute`         | `DateTime` を返す<br />*注意: 1970〜2149 年の範囲外の値では誤った結果になります*          | `Date`/`DateTime` 型の入力に対しては `DateTime` 型を返します<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` 型を返します                 |
| `timeSlot`                | Returns `DateTime`<br />*注意: 1970〜2149 の範囲外の値では誤った結果になる可能性があります* | `Date`/`DateTime` 型の入力に対しては `DateTime` 型を返します<br />`Date32`/`DateTime64` 型の入力に対しては `DateTime64` 型を返します                 |

## enable_filesystem_cache {#enable_filesystem_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムに対してキャッシュを使用します。この設定自体はディスク用キャッシュのオン／オフを切り替えるものではなく（それはディスク設定で行う必要があります）、必要に応じて一部のクエリでキャッシュをバイパスできるようにします。

## enable_filesystem_cache_log {#enable_filesystem_cache_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

各クエリごとにファイルシステムキャッシュのログを記録できるようにします。

## enable_filesystem_cache_on_write_operations {#enable_filesystem_cache_on_write_operations} 

<SettingsInfoBlock type="Bool" default_value="0" />

`write-through` キャッシュを有効または無効にします。`false` に設定すると、書き込み処理に対する `write-through` キャッシュは無効になります。`true` に設定すると、サーバー設定ファイルのキャッシュディスク設定セクションで `cache_on_write_operations` が有効になっている限り、`write-through` キャッシュが有効になります。
詳細については「[ローカルキャッシュの使用](/operations/storing-data#using-local-cache)」を参照してください。

## enable_filesystem_read_prefetches_log {#enable_filesystem_read_prefetches_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ実行中に `system.filesystem_prefetch_log` にログを出力します。テストやデバッグ目的のみに使用してください。デフォルトで有効にしておくことは推奨されません。

## enable_global_with_statement {#enable_global_with_statement} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "デフォルトで WITH 句を UNION クエリおよびすべてのサブクエリに伝播"}]}]}/>

WITH 句を UNION クエリおよびすべてのサブクエリに伝播させます

## enable_hdfs_pread {#enable_hdfs_pread} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

HDFS ファイルに対して pread を有効または無効にします。デフォルトでは `hdfsPread` が使用されます。無効にした場合、HDFS ファイルの読み取りには `hdfsRead` と `hdfsSeek` が使用されます。

## enable_http_compression {#enable_http_compression} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "一般的に有用です"}]}]}/>

HTTP リクエストへのレスポンスで、データ圧縮を有効または無効にします。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## enable_job_stack_trace {#enable_job_stack_trace} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パフォーマンスへの影響を避けるため、デフォルトで無効になりました。"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "ジョブのスケジューリング時のスタックトレース収集を有効にします。パフォーマンスへの影響を避けるため、デフォルトで無効になっています。"}]}]}/>

ジョブが例外で終了した場合に、そのジョブを作成した側のスタックトレースを出力します。パフォーマンスへの影響を避けるため、デフォルトでは無効になっています。

## enable_join_runtime_filters {#enable_join_runtime_filters} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

実行時に右側から収集した JOIN キーの集合を用いて左側をフィルタリングします。

## enable_lazy_columns_replication {#enable_lazy_columns_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "デフォルトで JOIN および ARRAY JOIN における遅延カラムレプリケーションを有効化"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "JOIN および ARRAY JOIN において遅延カラムレプリケーションを有効にするための設定を追加"}]}]}/>

JOIN および ARRAY JOIN において遅延カラムレプリケーションを有効にします。これにより、同一行がメモリ上で不要に複数回コピーされるのを防ぎます。

## enable_lightweight_delete {#enable_lightweight_delete} 

**別名**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルで軽量な DELETE mutation を有効にします。

## enable_lightweight_update {#enable_lightweight_update} 

<BetaBadge/>

**別名**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "軽量更新が Beta 段階に移行しました。設定「allow_experimental_lightweight_update」のエイリアスが追加されました。"}]}]}/>

軽量更新の使用を許可します。

## enable_memory_bound_merging_of_aggregation_results {#enable_memory_bound_merging_of_aggregation_results} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約処理に対して、メモリ制約付きのマージ戦略を有効化します。

## enable_multiple_prewhere_read_steps {#enable_multiple_prewhere_read_steps} 

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 句から PREWHERE 句により多くの条件を移動し、AND で結合された複数の条件がある場合は、ディスクからの読み取りとフィルタリングを複数段階に分けて実行します

## enable_named_columns_in_function_tuple {#enable_named_columns_in_function_tuple} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "すべての名前が一意で、引用符なしの識別子として扱える場合に、tuple() 関数で名前付きタプルを生成します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "ユーザビリティ改善が完了するまで無効化"}]}]}/>

すべての名前が一意で、引用符なしの識別子として扱える場合に、tuple() 関数で名前付きタプルを生成します。

## enable_optimize_predicate_expression {#enable_optimize_predicate_expression} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

`SELECT` クエリにおける述語プッシュダウンを有効にします。

述語プッシュダウンは、分散クエリのネットワークトラフィックを大幅に削減できる場合があります。

可能な値:

- 0 — 無効。
- 1 — 有効。

使用方法

次のクエリを考えてみます:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

`enable_optimize_predicate_expression = 1` の場合、ClickHouse は処理時にサブクエリに対して `WHERE` を適用するため、これら 2 つのクエリの実行時間は同じになります。

`enable_optimize_predicate_expression = 0` の場合、`WHERE` 句はサブクエリの実行完了後にすべてのデータに適用されるため、2 番目のクエリの実行時間ははるかに長くなります。

## enable_optimize_predicate_expression_to_final_subquery {#enable_optimize_predicate_expression_to_final_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

述語を final サブクエリにプッシュダウンできるようにします。

## enable&#95;order&#95;by&#95;all

<SettingsInfoBlock type="Bool" default_value="1" />

`ORDER BY ALL` 構文によるソートを有効または無効にします。詳細は [ORDER BY](../../sql-reference/statements/select/order-by.md) を参照してください。

設定可能な値:

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

分散クエリにのみ影響します。有効にすると、ブロックはイニシエーターに送信する前後でパイプラインスレッド上で（デ）シリアライズおよび（デ）圧縮されます（つまり、デフォルトよりも高い並列性で処理されます）。

## enable_parsing_to_custom_serialization {#enable_parsing_to_custom_serialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、テーブルから取得したシリアライズ方式に関するヒント情報に基づいて、データを（Sparse などの）カスタムシリアライズ方式を持つカラムに直接パースできます。

## enable&#95;positional&#95;arguments

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "Enable positional arguments feature by default"}]}]} />

[GROUP BY](/sql-reference/statements/select/group-by)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) ステートメントで位置引数のサポートを有効または無効にします。

設定可能な値:

* 0 — 位置引数はサポートされません。
* 1 — 位置引数がサポートされます。列名の代わりに列番号を使用できます。

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


## enable_producing_buckets_out_of_order_in_aggregation {#enable_producing_buckets_out_of_order_in_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

メモリ効率の高い集約（`distributed_aggregation_memory_efficient` を参照）が、バケットを順不同で生成することを許可します。
レプリカが、まだ小さい ID の重いバケットを処理している間に、より大きな ID を持つバケットをイニシエーターに送信できるようにすることで、集約バケットのサイズに偏りがある場合のパフォーマンスを向上させる可能性があります。
欠点として、メモリ使用量が増加する可能性があります。

## enable_reads_from_query_cache {#enable_reads_from_query_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効化すると、`SELECT` クエリの結果が[クエリキャッシュ](../query-cache.md)から取得されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enable_s3_requests_logging {#enable_s3_requests_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />

S3 リクエストの非常に詳細なログ記録を有効にします。デバッグ時にのみ有効です。

## enable_scalar_subquery_optimization {#enable_scalar_subquery_optimization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "スカラー副問い合わせによる大きなスカラー値のシリアル化/デシリアル化を防ぎ、同じ副問い合わせを複数回実行せずに済む場合があります"}]}]}/>

true に設定されている場合、大きなスカラー値に対するスカラー副問い合わせのシリアル化/デシリアル化を防ぎ、同じ副問い合わせを複数回実行せずに済む場合があります。

## enable_scopes_for_with_statement {#enable_scopes_for_with_statement} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}]}/>

この設定を無効にすると、親の WITH 句で行われた宣言は、現在のスコープ内で宣言されたものと同じスコープに属するものとして扱われます。

これは新しいアナライザー用の互換性設定であり、旧アナライザーでも実行できていた一部の不正なクエリを新しいアナライザーでも実行可能にするためのものです。

## enable&#95;shared&#95;storage&#95;snapshot&#95;in&#95;query

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でストレージスナップショットを共有するための新しい設定。"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "1"},{"label": "一貫性の保証を改善。"}]}]} />

有効にすると、単一のクエリ内のすべてのサブクエリは、各テーブルに対して同じ `StorageSnapshot` を共有します。
これにより、同じテーブルに複数回アクセスする場合でも、クエリ全体で一貫したデータビューが保証されます。

これは、データパーツの内部一貫性が重要となるクエリで必須となる設定です。例:

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

この設定を行わない場合、外側のクエリと内側のクエリが異なるデータスナップショットを参照して動作し、誤った結果につながる可能性があります。

:::note
この設定を有効にすると、プランニング段階が完了した後にスナップショットから不要なデータパーツを削除する最適化が無効化されます。
その結果、長時間実行されるクエリが、その実行期間全体にわたって古いパーツを保持し続ける可能性があり、パーツのクリーンアップが遅延し、ストレージへの負荷が増大します。

この設定は現在、MergeTree ファミリーのテーブルにのみ適用されます。
:::

設定可能な値:

* 0 - 無効
* 1 - 有効


## enable_sharing_sets_for_mutations {#enable_sharing_sets_for_mutations} 

<SettingsInfoBlock type="Bool" default_value="1" />

同じミューテーション内の異なるタスク間で、IN サブクエリ用に構築されたセットオブジェクトを共有できるようにします。これにより、メモリ使用量と CPU 使用量を削減できます。

## enable_software_prefetch_in_aggregation {#enable_software_prefetch_in_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約処理でソフトウェアによるプリフェッチを有効にします。

## enable_unaligned_array_join {#enable_unaligned_array_join} 

<SettingsInfoBlock type="Bool" default_value="0" />

異なるサイズの複数の配列に対する ARRAY JOIN を許可します。この設定を有効にすると、配列は最も長い配列の長さに合わせてリサイズされます。

## enable_url_encoding {#enable_url_encoding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "既存の設定のデフォルト値を変更"}]}]}/>

[URL](../../engines/table-engines/special/url.md) エンジンのテーブルで、URI 内パスのエンコード／デコード処理を有効／無効にします。

デフォルトでは無効です。

## enable_vertical_final {#enable_vertical_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "バグ修正後に vertical final をデフォルトで再度有効化"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "vertical final をデフォルトで有効化"}]}]}/>

有効にすると、FINAL 処理時に行をマージする代わりに、重複した行に削除フラグを付け、その後のフィルタリングで重複行を除去します

## enable_writes_to_query_cache {#enable_writes_to_query_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、`SELECT` クエリの結果が[クエリキャッシュ](../query-cache.md)に保存されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enable_zstd_qat_codec {#enable_zstd_qat_codec} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "新しい ZSTD_QAT コーデックを追加"}]}]}/>

この設定を有効にすると、`ZSTD_QAT` コーデックを使用して列を圧縮できます。

## enforce_strict_identifier_format {#enforce_strict_identifier_format} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

有効にすると、英数字とアンダースコアのみを含む識別子が許可されます。

## engine_file_allow_create_multiple_files {#engine_file_allow_create_multiple_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

フォーマットにサフィックス（`JSON`、`ORC`、`Parquet` など）がある場合に、file エンジンテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを制御します。有効にした場合、各 `INSERT` ごとに次のパターンに従った名前の新しいファイルが作成されます。

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` など。

取りうる値:

- 0 — `INSERT` クエリは既存ファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## engine_file_empty_if_not_exists {#engine_file_empty_if_not_exists} 

<SettingsInfoBlock type="Bool" default_value="0" />

基となるファイルが存在しない場合でも、File エンジンテーブルから `SELECT` を実行できるようにします。

可能な値:

- 0 — `SELECT` は例外をスローします。
- 1 — `SELECT` は空の結果を返します。

## engine_file_skip_empty_files {#engine_file_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンのテーブルで、空のファイルをスキップするかどうかを制御します。

設定可能な値:

- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## engine_file_truncate_on_insert {#engine_file_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンのテーブルで、`INSERT` 前にファイルを truncate（内容を削除）するかどうかを有効または無効にします。

設定可能な値:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリはファイルの既存の内容を破棄し、新しいデータで置き換えます。

## engine_url_skip_empty_files {#engine_url_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

[URL](../../engines/table-engines/special/url.md) エンジンテーブルで空ファイルをスキップするかどうかを有効または無効にします。

有効な値:

- 0 — 空ファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## except_default_mode {#except_default_mode} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

EXCEPT クエリのデフォルトモードを設定します。指定可能な値: 空文字列、`ALL`、`DISTINCT`。空文字列を指定した場合、モードが指定されていないクエリは例外をスローします。

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;insert

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]} />

指定されたスキップインデックスを、INSERT 実行時に構築および保存する対象から除外します。除外されたスキップインデックスは、[マージ時](merge-tree-settings.md/#materialize_skip_indexes_on_merge)、または明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリによって、引き続き構築および保存されます。

[materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) が false の場合は、効果はありません。

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

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a は挿入時に更新されません
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- いずれのインデックスも挿入時に更新されません

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- idx_b のみ更新されます

-- セッション設定のため、クエリ単位で設定可能です
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- このクエリでインデックスを明示的にマテリアライズできます

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- 設定をデフォルトにリセットします
```


## execute_exists_as_scalar_subquery {#execute_exists_as_scalar_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

非相関な `EXISTS` サブクエリをスカラサブクエリとして実行します。スカラサブクエリと同様にキャッシュが利用され、結果には定数畳み込みが適用されます。

## external_storage_connect_timeout_sec {#external_storage_connect_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="10" />

接続タイムアウトを秒単位で指定します。現在は MySQL のみに対応しています。

## external_storage_max_read_bytes {#external_storage_max_read_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に読み取る最大バイト数を制限します。現在は MySQL テーブルエンジン、データベースエンジン、および辞書でのみサポートされています。0 を指定した場合、この設定は無効になります。

## external_storage_max_read_rows {#external_storage_max_read_rows} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に読み取る行数の上限を設定します。現在は MySQL テーブルエンジン、データベースエンジン、およびディクショナリでのみサポートされています。0 の場合、この設定は無効になります。

## external_storage_rw_timeout_sec {#external_storage_rw_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="300" />

読み取り/書き込みタイムアウト（秒）。現在は MySQL のみに対応しています

## external_table_functions_use_nulls {#external_table_functions_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="1" />

[mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md)、[odbc](../../sql-reference/table-functions/odbc.md) テーブル関数が Nullable カラムをどのように扱うかを定義します。

指定可能な値:

- 0 — テーブル関数は Nullable カラムを明示的に使用します。
- 1 — テーブル関数は Nullable カラムを暗黙的に使用します。

**使用方法**

設定が `0` の場合、テーブル関数はカラムを Nullable として扱わず、NULL の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

## external_table_strict_query {#external_table_strict_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、外部テーブルに対するクエリにおいて、式をローカルフィルタへ変換することが禁止されます。

## extract_key_value_pairs_max_pairs_per_row {#extract_key_value_pairs_max_pairs_per_row} 

**別名**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "`extractKeyValuePairs` 関数によって生成できるペアの最大数。メモリの過剰消費を防ぐための保護機構として使用されます。"}]}]}/>

`extractKeyValuePairs` 関数によって生成できるペアの最大数。メモリの過剰消費を防ぐための保護機構として使用されます。

## extremes {#extremes} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ結果の列における極値（最小値と最大値）をカウントするかどうかを指定します。0 または 1 を指定できます。既定値は 0（無効）です。
詳細については、「極値」のセクションを参照してください。

## fallback_to_stale_replicas_for_distributed_queries {#fallback_to_stale_replicas_for_distributed_queries} 

<SettingsInfoBlock type="Bool" default_value="1" />

更新されたデータが利用できない場合に、クエリを古い状態のレプリカに対して強制的に実行します。詳細は [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

ClickHouse は、テーブルの古いレプリカの中から最も適切なものを選択します。

レプリケートされたテーブルを参照する分散テーブルに対して `SELECT` を実行するときに使用されます。

デフォルトは 1（有効）です。

## filesystem_cache_allow_background_download {#filesystem_cache_allow_background_download} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "クエリごとのファイルシステムキャッシュにおけるバックグラウンドダウンロードを制御する新しい設定です。"}]}]}/>

リモートストレージから読み取ったデータについて、ファイルシステムキャッシュがバックグラウンドでのダウンロードをキューイングすることを許可します。現在のクエリ／セッションでダウンロードをフォアグラウンドで実行したい場合は無効にします。

## filesystem_cache_boundary_alignment {#filesystem_cache_boundary_alignment} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

ファイルシステムキャッシュの境界合わせ。この設定は、ディスクを伴わない読み取りの場合にのみ適用されます（たとえば、リモートテーブルエンジン／テーブル関数のキャッシュには適用されますが、MergeTree テーブルのストレージ設定には適用されません）。値 0 は境界合わせを行わないことを意味します。

## filesystem_cache_enable_background_download_during_fetch {#filesystem_cache_enable_background_download_during_fetch} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。ファイルシステムキャッシュ内の容量を予約するためにキャッシュをロックする際の待機時間です。

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage {#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem cache で領域を確保するためにキャッシュをロックするまでの待ち時間を制御します。

## filesystem_cache_max_download_size {#filesystem_cache_max_download_size} 

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

1回のクエリでダウンロードできるリモートファイルシステムキャッシュの最大サイズ

## filesystem_cache_name {#filesystem_cache_name} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "ステートレステーブルエンジンまたはデータレイクで使用するファイルシステムキャッシュ名"}]}]}/>

ステートレステーブルエンジンまたはデータレイクで使用するファイルシステムキャッシュ名

## filesystem_cache_prefer_bigger_buffer_size {#filesystem_cache_prefer_bigger_buffer_size} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

filesystem cache が有効な場合、小さなファイルセグメントの書き込みによるキャッシュ性能の低下を避けるため、より大きなバッファサイズの使用を優先します。一方、この設定を有効にするとメモリ使用量が増加する可能性があります。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds {#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "ファイルシステムキャッシュで領域を予約するためにキャッシュのロック取得を待機する時間"}]}]}/>

ファイルシステムキャッシュで領域を予約するためにキャッシュのロック取得を待機する時間

## filesystem_cache_segments_batch_size {#filesystem_cache_segments_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="20" />

キャッシュから読み取りバッファが要求できる、単一バッチ内のファイルセグメントのサイズ上限です。値が小さすぎるとキャッシュへの要求が過剰になり、逆に大きすぎるとキャッシュからの削除（エビクション）処理が遅くなる可能性があります。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit {#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit} 

**別名**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "設定 skip_download_if_exceeds_query_cache_limit の名称変更"}]}]}/>

クエリキャッシュサイズを超える場合は、リモートファイルシステムからのダウンロードをスキップします。

## filesystem_prefetch_max_memory_usage {#filesystem_prefetch_max_memory_usage} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

プリフェッチで使用されるメモリの最大使用量。

## filesystem_prefetch_step_bytes {#filesystem_prefetch_step_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

プリフェッチのステップサイズをバイト数で指定します。ゼロの場合は `auto` を意味し、おおよそ最適なプリフェッチステップが自動的に推定されますが、必ずしも完全に最適とは限りません。実際の値は、設定 `filesystem_prefetch_min_bytes_for_single_read_task` によって異なる場合があります。

## filesystem_prefetch_step_marks {#filesystem_prefetch_step_marks} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マーク単位のプリフェッチステップを指定します。0 を指定すると `auto` を意味し、おおよそ最適なプリフェッチステップが自動で推定されますが、必ずしも 100% 最適とは限りません。実際の値は、設定 `filesystem_prefetch_min_bytes_for_single_read_task` によって変わる場合があります。

## filesystem_prefetches_limit {#filesystem_prefetches_limit} 

<SettingsInfoBlock type="UInt64" default_value="200" />

プリフェッチの最大数です。0 を指定すると無制限になります。プリフェッチを制限したい場合は、`filesystem_prefetches_max_memory_usage` 設定の使用をより推奨します。

## final

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内の、[FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を適用可能なすべてのテーブルに対して、結合テーブル、サブクエリ内のテーブル、および分散テーブルも含めて、自動的に [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を適用します。

取りうる値:

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


## flatten&#95;nested

<SettingsInfoBlock type="Bool" default_value="1" />

[ネスト](../../sql-reference/data-types/nested-data-structures/index.md)列のデータ形式を設定します。

指定可能な値:

* 1 — ネスト列を個別の配列にフラット化します。
* 0 — ネスト列をタプルの単一配列のままにします。

**使用方法**

この設定が `0` の場合、任意のレベルまで入れ子にできます。

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


## force_aggregate_partitions_independently {#force_aggregate_partitions_independently} 

<SettingsInfoBlock type="Bool" default_value="0" />

適用可能であるにもかかわらず、ヒューリスティクスにより使用しないと判断された最適化を強制的に有効化します

## force_aggregation_in_order {#force_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は、分散クエリをサポートするためにサーバー内部で使用されます。通常の動作が損なわれるため、手動で変更しないでください。（分散集約時に、リモートノードでの順序付き集約の利用を強制します）。

## force&#95;data&#95;skipping&#95;indices

指定された data skipping インデックスが使用されなかった場合、クエリ実行を行いません。

次の例を考えます。

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

引数が集約キーとして使用されていない場合、GROUPING 関数が 1 を返します

## force_index_by_date {#force_index_by_date} 

<SettingsInfoBlock type="Bool" default_value="0" />

インデックスを日付で使用できない場合に、クエリの実行を禁止します。

MergeTree ファミリーのテーブルで動作します。

`force_index_by_date=1` の場合、ClickHouse はクエリにデータ範囲の絞り込みに使用できる日付キーに対する条件があるかどうかを確認します。適切な条件がない場合は、例外をスローします。ただし、その条件によって実際に読み取るデータ量が減少するかどうかはチェックしません。たとえば、条件 `Date != ' 2000-01-01 '` は、テーブル内のすべてのデータに一致する場合（つまり、クエリの実行に全件スキャンが必要な場合）でも許容されます。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_optimize_projection {#force_optimize_projection} 

<SettingsInfoBlock type="Bool" default_value="0" />

[projections](../../engines/table-engines/mergetree-family/mergetree.md/#projections) の最適化が有効な場合（[optimize_use_projections](#optimize_use_projections) 設定を参照）、`SELECT` クエリでプロジェクションの使用を必須にするかどうかを制御します。

取り得る値:

- 0 — プロジェクション最適化は必須ではありません。
- 1 — プロジェクション最適化は必須です。

## force_optimize_projection_name {#force_optimize_projection_name} 

空文字列ではない値が設定されている場合、その projection がクエリで少なくとも一度は使用されているかをチェックします。

指定可能な値:

- string: クエリで使用される projection の名前

## force_optimize_skip_unused_shards {#force_optimize_skip_unused_shards} 

<SettingsInfoBlock type="UInt64" default_value="0" />

[optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効で、未使用シャードをスキップできない場合に、クエリの実行を許可するかどうかを制御します。スキップできず、この設定が有効な場合は、例外がスローされます。

可能な値:

- 0 — 無効。ClickHouse は例外をスローしません。
- 1 — 有効。テーブルにシャーディングキーがある場合にのみ、クエリの実行が無効になります。
- 2 — 有効。テーブルにシャーディングキーが定義されているかどうかに関係なく、クエリの実行が無効になります。

## force_optimize_skip_unused_shards_nesting {#force_optimize_skip_unused_shards_nesting} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリのネストレベル（`Distributed` テーブルが別の `Distributed` テーブルを参照するケース）に応じて、[`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) の動作を制御します（そのため、[`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) 自体も有効になっている必要があります）。

可能な値:

- 0 - 無効。`force_optimize_skip_unused_shards` は常に動作します。
- 1 — 第 1 レベルに対してのみ `force_optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `force_optimize_skip_unused_shards` を有効にします。

## force_primary_key {#force_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

プライマリキーによるインデックス付けができない場合、そのクエリの実行を禁止します。

MergeTree ファミリーに属するテーブルで有効です。

`force_primary_key=1` の場合、ClickHouse はクエリにデータ範囲の絞り込みに利用できるプライマリキー条件が含まれているかどうかをチェックします。適切な条件が存在しない場合、例外をスローします。ただし、その条件が読み取るデータ量を実際に削減するかどうかはチェックしません。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_remove_data_recursively_on_drop {#force_remove_data_recursively_on_drop} 

<SettingsInfoBlock type="Bool" default_value="0" />

DROP クエリでデータを再帰的に削除します。`Directory not empty` エラーを回避しますが、切り離されたデータが通知なしに削除されてしまう可能性があります

## formatdatetime_e_with_space_padding {#formatdatetime_e_with_space_padding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `formatDateTime` におけるフォーマッタ `%e` は、1 桁の日を先頭にスペースを付けて出力します（例: `'2'` ではなく `' 2'`）。

## formatdatetime_f_prints_scale_number_of_digits {#formatdatetime_f_prints_scale_number_of_digits} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

関数 `formatDateTime` におけるフォーマット指定子 `%f` は、固定の 6 桁ではなく、DateTime64 のスケールで指定された桁数のみを出力します。

## formatdatetime_f_prints_single_zero {#formatdatetime_f_prints_single_zero} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "MySQL の DATE_FORMAT()/STR_TO_DATE() との互換性を向上"}]}]}/>

`formatDateTime` 関数のフォーマッタ `%f` は、フォーマット対象に小数秒が含まれない場合、6 個の 0 ではなく 1 個の 0 を出力します。

## formatdatetime_format_without_leading_zeros {#formatdatetime_format_without_leading_zeros} 

<SettingsInfoBlock type="Bool" default_value="0" />

関数 'formatDateTime' におけるフォーマッタ '%c'、'%l'、'%k' は、月および時刻を先頭のゼロを付けずに出力します。

## formatdatetime_parsedatetime_m_is_month_name {#formatdatetime_parsedatetime_m_is_month_name} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "MySQL DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

`formatDateTime` 関数および `parseDateTime` 関数におけるフォーマット指定子 `%M` は、分ではなく月名を出力／解析します。

## fsync_metadata {#fsync_metadata} 

<SettingsInfoBlock type="Bool" default_value="1" />

`.sql` ファイルを書き込む際に [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) を有効または無効にします。既定では有効です。

サーバー上で、非常に小さいテーブルが何百万個も継続的に作成および破棄されている場合には、これを無効にすることが有効な場合があります。

## function_date_trunc_return_type_behavior {#function_date_trunc_return_type_behavior} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "dateTrunc 関数の従来の挙動を保持するための新しい設定を追加"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "負の値に対して正しい結果を得るため、dateTrunc 関数における DateTime64/Date32 引数の結果型を、時間単位に関わらず DateTime64/Date32 に変更"}]}]}/>

`dateTrunc` 関数の結果型の挙動を変更できるようにします。

設定可能な値:

- 0 - 第 2 引数が `DateTime64/Date32` の場合、戻り値の型は第 1 引数の時間単位に関わらず `DateTime64/Date32` になります。
- 1 - `Date32` の場合、結果は常に `Date` になります。`DateTime64` の場合、時間単位が `second` 以上のとき、結果は `DateTime` になります。

## function_implementation {#function_implementation} 

特定のターゲットまたはバリアント向けの関数実装を選択します（実験的）。空のままにすると、すべてが有効になります。

## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;complex

<SettingsInfoBlock type="Bool" default_value="0" />

`json_value` 関数が struct、array、map などの複合型を返すことを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1行取得。経過時間: 0.001秒
```

指定可能な値:

* true — 許可する。
* false — 許可しない。


## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

JSON&#95;VALUE 関数で、値が存在しない場合に `NULL` を返すことを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

取り得る値：

* true — 許可する。
* false — 許可しない。


## function_locate_has_mysql_compatible_argument_order {#function_locate_has_mysql_compatible_argument_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "MySQL の locate 関数との互換性を向上。"}]}]}/>

関数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) の引数の順序を制御します。

設定可能な値:

- 0 — 関数 `locate` は引数 `(haystack, needle[, start_pos])` を受け取ります。
- 1 — 関数 `locate` は引数 `(needle, haystack, [, start_pos])` を受け取ります (MySQL 互換動作)。

## function_range_max_elements_in_block {#function_range_max_elements_in_block} 

<SettingsInfoBlock type="UInt64" default_value="500000000" />

関数 [range](/sql-reference/functions/array-functions#range) によって生成されるデータ量に対する安全のためのしきい値を設定します。データの 1 ブロックあたりで関数によって生成される値の最大数（ブロック内の各行に対する配列サイズの合計）を定義します。

設定可能な値:

- 正の整数。

**関連項目**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block {#function_sleep_max_microseconds_per_block} 

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "以前のバージョンでは、3 秒という最大スリープ時間の制限は `sleep` にのみ適用され、`sleepEachRow` 関数には適用されていませんでした。新しいバージョンでは、この設定を導入しています。互換性を以前のバージョンに合わせた場合、この制限は完全に無効化されます。"}]}]}/>

関数 `sleep` が各ブロックごとにスリープできる最大マイクロ秒数です。ユーザーがそれより大きい値で呼び出した場合には、例外をスローします。これは安全性を確保するための閾値です。

## function_visible_width_behavior {#function_visible_width_behavior} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "`visibleWidth` のデフォルト動作をより正確なものに変更しました"}]}]}/>

`visibleWidth` の動作バージョン。0 - コードポイント数のみをカウントする。1 - ゼロ幅文字および結合文字を正しくカウントし、全角文字は 2 文字分として扱い、タブ幅を推定し、削除文字もカウントする。

## geo_distance_returns_float64_on_float64_arguments {#geo_distance_returns_float64_on_float64_arguments} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "既定の精度を向上しました。"}]}]}/>

`geoDistance`、`greatCircleDistance`、`greatCircleAngle` 関数の4つの引数すべてが Float64 の場合、戻り値は Float64 となり、内部計算には倍精度で処理を行います。以前の ClickHouse のバージョンでは、これらの関数は常に Float32 を返していました。

## geotoh3_argument_order {#geotoh3_argument_order} 

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "lon と lat の引数の順序を従来の動作に合わせて設定するための新しい設定項目"}]}]}/>

関数 `geoToH3` は、`lon_lat` に設定されている場合は (lon, lat)、`lat_lon` に設定されている場合は (lat, lon) を引数として取ります。

## glob_expansion_max_elements {#glob_expansion_max_elements} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

許可されるアドレス数の上限（外部ストレージやテーブル関数など）。

## grace_hash_join_initial_buckets {#grace_hash_join_initial_buckets} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Grace ハッシュ結合における初期バケット数

## grace_hash_join_max_buckets {#grace_hash_join_max_buckets} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Grace Hash Join で使用するバケット数の上限

## group_by_overflow_mode {#group_by_overflow_mode} 

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

集約における一意キーの数が上限を超えたときの動作を設定します。

- `throw`: 例外をスローする
- `break`: クエリの実行を停止し、部分的な結果を返す
- `any`: 集合に含まれているキーについては集約を続行するが、新しいキーは集合に追加しない

`any` を指定すると、GROUP BY の近似的な処理を実行できます。
この近似の精度は、データの統計的な性質に依存します。

## group_by_two_level_threshold {#group_by_two_level_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

キー数がいくつ以上になったら 2 レベル集約を開始するかを指定します。0 の場合、しきい値は設定されません。

## group_by_two_level_threshold_bytes {#group_by_two_level_threshold_bytes} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

集約状態のサイズ（バイト数）がどの程度以上になったときに二段階集約を使用し始めるかを指定します。0 の場合、しきい値は設定されません。いずれかのしきい値が満たされた場合に二段階集約が使用されます。

## group_by_use_nulls {#group_by_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="0" />

[GROUP BY 句](/sql-reference/statements/select/group-by) における集約キー型の扱い方を変更します。
`ROLLUP`、`CUBE`、`GROUPING SETS` 指定子が使用されている場合、一部の集約キーは特定の結果行を生成する際に使用されない場合があります。
この設定に応じて、これらのキーに対応する列は、該当する行でデフォルト値または `NULL` で埋められます。

設定値:

- 0 — 欠損値を生成する際に、集約キー型のデフォルト値を使用します。
- 1 — ClickHouse は SQL 標準どおりに `GROUP BY` を実行します。集約キーの型は [Nullable](/sql-reference/data-types/nullable) に変換されます。対応する集約キーの列は、そのキーが使用されなかった行では [NULL](/sql-reference/syntax#null) で埋められます。

関連情報:

- [GROUP BY 句](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order {#h3togeo_lon_lat_result_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

関数 `h3ToGeo` は、true の場合は (lon, lat)、それ以外の場合は (lat, lon) を返します。

## handshake_timeout_ms {#handshake_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

ハンドシェイク時にレプリカから Hello パケットを受信するまでのタイムアウト（ミリ秒）。

## hdfs_create_new_file_on_insert {#hdfs_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

HDFS エンジンテーブルで、挿入ごとに新しいファイルを作成するかどうかを制御します。有効にすると、各 `INSERT` ごとに、次のパターンに類似した名前で新しい HDFS ファイルが作成されます。

初期名: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など

設定可能な値:

- 0 — `INSERT` クエリは既存ファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## hdfs_ignore_file_doesnt_exist {#hdfs_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、HDFS テーブルエンジンで例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み取る際、対象のファイルが存在しない場合は、ファイルが存在しないことを無視します。

取りうる値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## hdfs_replication {#hdfs_replication} 

<SettingsInfoBlock type="UInt64" default_value="0" />

実際のレプリケーション数は、HDFS ファイルの作成時に指定できます。

## hdfs_skip_empty_files {#hdfs_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

[HDFS](../../engines/table-engines/integrations/hdfs.md) エンジンのテーブルで空ファイルをスキップするかどうかを有効または無効にします。

設定可能な値:

- 0 — 空ファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## hdfs_throw_on_zero_files_match {#hdfs_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "HDFS エンジンで ListObjects リクエストがいずれのファイルにもマッチしない場合に、空のクエリ結果ではなくエラーをスローできるようにする設定を追加"}]}]}/>

グロブ展開ルールに従って一致するファイルが 1 件もない場合に、エラーをスローします。

可能な値:

- 1 — `SELECT` は例外をスローします。
- 0 — `SELECT` は空の結果を返します。

## hdfs_truncate_on_insert {#hdfs_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

`hdfs` エンジンテーブルへの `INSERT` 実行前に、ファイルを切り詰め（truncate）るかどうかを制御します。無効な場合、対象の HDFS 上のファイルが既に存在していると、`INSERT` 実行時に例外が送出されます。

Possible values:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリはファイルの既存コンテンツを新しいデータで置き換えます。

## hedged_connection_timeout_ms {#hedged_connection_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "Hedged リクエストで、新しい接続の開始を従来の接続タイムアウトと整合させるため、100 ms ではなく 50 ms 後に行うように変更"}]}]}/>

Hedged リクエストにおいて、レプリカへの接続を確立する際の接続タイムアウト

## hnsw_candidate_list_size_for_search {#hnsw_candidate_list_size_for_search} 

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "新しい設定です。以前は、値は CREATE INDEX で任意指定可能で、デフォルト値は 64 でした。"}]}]}/>

ベクトル類似性インデックスを検索するときの動的候補リストのサイズです。`ef_search` とも呼ばれます。

## hsts_max_age {#hsts_max_age} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS の有効期間。0 は HSTS を無効にします。

## http_connection_timeout {#http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 接続のタイムアウト（秒）。

設定可能な値:

- 任意の正の整数。
- 0 - 無効（タイムアウトなし）。

## http_headers_progress_interval_ms {#http_headers_progress_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP ヘッダー `X-ClickHouse-Progress` を、指定された間隔より短い間隔では送信しません。

## http_make_head_request {#http_make_head_request} 

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 設定は、HTTP からデータを読み込む際に `HEAD` リクエストを実行し、読み取るファイルのサイズなどの情報を取得できるようにします。デフォルトで有効になっているため、サーバーが `HEAD` リクエストをサポートしていない場合などでは、この設定を無効にすることが望ましい場合があります。

## http_max_field_name_size {#http_max_field_name_size} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダー内のフィールド名の最大長

## http_max_field_value_size {#http_max_field_value_size} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダー内のフィールド値の最大長さ

## http_max_fields {#http_max_fields} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP ヘッダー内のフィールド数の上限

## http_max_multipart_form_data_size {#http_max_multipart_form_data_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

multipart/form-data コンテンツのサイズ上限です。この設定は URL パラメータからは指定できず、ユーザープロファイル内で設定する必要があります。コンテンツはクエリ実行開始前にパースされ、外部テーブルがメモリ上に作成される点に注意してください。また、この段階に影響を与えるのはこの制限のみが有効です（`max_memory_usage` や `max_execution_time` などの制限は、HTTP フォームデータを読み込んでいる間は効果がありません）。

## http_max_request_param_data_size {#http_max_request_param_data_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

事前定義された HTTP リクエストで、クエリパラメータとして送信されるリクエストデータのサイズ上限。

## http_max_tries {#http_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

HTTP 経由で読み取る際の最大試行回数。

## http_max_uri_size {#http_max_uri_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

HTTPリクエストのURIの最大長を設定します。

設定可能な値:

- 正の整数

## http_native_compression_disable_checksumming_on_decompress {#http_native_compression_disable_checksumming_on_decompress} 

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントからの HTTP POST データを解凍する際に、チェックサム検証を有効または無効にします。ClickHouse ネイティブ圧縮形式でのみ使用されます（`gzip` や `deflate` では使用されません）。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## http_receive_timeout {#http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "See http_send_timeout."}]}]}/>

HTTP 受信時のタイムアウト時間（秒）。

設定可能な値:

- 任意の正の整数
- 0 - 無効（タイムアウト無制限）

## http_response_buffer_size {#http_response_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HTTP レスポンスをクライアントへ送信する前、または（http_wait_end_of_query が有効な場合に）ディスクへフラッシュする前に、サーバーのメモリでバッファリングするバイト数。

## http_response_headers {#http_response_headers} 

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "新しい設定です。"}]}]}/>

サーバーがクエリを正常に処理した結果を返す際の HTTP レスポンスヘッダーを追加または上書きできます。
これは HTTP インターフェイスにのみ影響します。

ヘッダーが既定で既に設定されている場合は、その値が指定された値で上書きされます。
ヘッダーが既定で設定されていない場合は、そのヘッダーがヘッダー一覧に追加されます。
サーバーによって既定で設定され、この設定で上書きされていないヘッダーはそのまま残ります。

この設定では、ヘッダーを一定の値に固定できます。現時点では、動的に計算された値をヘッダーに設定する方法はありません。

名前または値のどちらにも ASCII 制御文字を含めることはできません。

返されたヘッダーに基づいて処理を行いつつ、ユーザーが設定を変更できる UI アプリケーションを実装する場合は、この設定を読み取り専用に制限することを推奨します。

例: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms {#http_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP 経由での読み取りを再試行する際のバックオフ時間の最小値（ミリ秒）

## http_retry_max_backoff_ms {#http_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

HTTP 経由の読み取りを再試行する際のバックオフ時間の最大値（ミリ秒）

## http_send_timeout {#http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 分はさすがに長すぎます。これはアップロード全体の処理時間ではなく、単一のネットワーク書き込み呼び出しに対するタイムアウトである点に注意してください。"}]}]}/>

HTTP 送信タイムアウト（秒単位）。

Possible values:

- 任意の正の整数。
- 0 - 無効化（タイムアウトなし／無限）。

:::note
これはデフォルトプロファイルにのみ適用されます。変更を反映させるにはサーバーの再起動が必要です。
:::

## http_skip_not_found_url_for_globs {#http_skip_not_found_url_for_globs} 

<SettingsInfoBlock type="Bool" default_value="1" />

HTTP_NOT_FOUND エラーが返されたグロブパターンの URL をスキップする

## http_wait_end_of_query {#http_wait_end_of_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー側で HTTP レスポンスのバッファリングを有効にします。

## http_write_exception_in_output_format {#http_write_exception_in_output_format} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "フォーマット間の一貫性を保つために変更"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "HTTP ストリーミング中の例外発生時に有効な JSON/XML を出力する。"}]}]}/>

例外情報を出力フォーマットで出力し、正しい形式の出力を生成します。JSON および XML フォーマットで機能します。

## http_zlib_compression_level {#http_zlib_compression_level} 

<SettingsInfoBlock type="Int64" default_value="3" />

[enable_http_compression = 1](#enable_http_compression) の場合、HTTP リクエストに対するレスポンスで使用するデータ圧縮レベルを設定します。

取り得る値：1 から 9 までの数値。

## iceberg_delete_data_on_drop {#iceberg_delete_data_on_drop} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

`DROP` 時にすべての Iceberg ファイルを削除するかどうかを制御します。

## iceberg_insert_max_bytes_in_data_file {#iceberg_insert_max_bytes_in_data_file} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新しい設定。"}]}]}/>

INSERT 操作時における Iceberg の Parquet データファイルの最大サイズ（バイト単位）。

## iceberg_insert_max_partitions {#iceberg_insert_max_partitions} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "100"},{"label": "New setting."}]}]}/>

Iceberg テーブルエンジンに対する 1 回の INSERT 操作で許可されるパーティション数の上限。

## iceberg_insert_max_rows_in_data_file {#iceberg_insert_max_rows_in_data_file} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "New setting."}]}]}/>

`INSERT` 操作時に作成される Iceberg Parquet データファイルの最大行数。

## iceberg_metadata_compression_method {#iceberg_metadata_compression_method} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい設定"}]}]}/>

`.metadata.json` ファイルの圧縮方式を指定します。

## iceberg_metadata_log_level {#iceberg_metadata_log_level} 

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

Iceberg テーブルのメタデータログレベルを system.iceberg_metadata_log に対して制御します。
通常はデバッグ目的でのみ変更します。

設定可能な値:

- none - メタデータログを出力しません。
- metadata - ルートの metadata.json ファイル。
- manifest_list_metadata - 上記すべて + スナップショットに対応する avro manifest list からのメタデータ。
- manifest_list_entry - 上記すべて + avro manifest list の各エントリ。
- manifest_file_metadata - 上記すべて + 走査された avro manifest ファイルからのメタデータ。
- manifest_file_entry - 上記すべて + 走査された avro manifest ファイルの各エントリ。

## iceberg_snapshot_id {#iceberg_snapshot_id} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

特定のスナップショット ID を指定して Iceberg テーブルをクエリします。

## iceberg_timestamp_ms {#iceberg_timestamp_ms} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

特定のタイムスタンプ時点でアクティブだったスナップショットを使用して Iceberg テーブルをクエリします。

## idle_connection_timeout {#idle_connection_timeout} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

指定した秒数の経過後に、アイドル状態の TCP 接続を閉じるまでのタイムアウト値です。

設定可能な値:

- 正の整数（0 - 0 秒後、つまり即時に閉じる）。

## ignore_cold_parts_seconds {#ignore_cold_parts_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ有効です。新しいデータパーツを、事前ウォームアップされる（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）か、指定した秒数が経過するまで、SELECT クエリの対象から除外します。Replicated-/SharedMergeTree 用です。

## ignore&#95;data&#95;skipping&#95;indices

クエリで使用されている場合でも、指定されたスキッピングインデックスを無視します。

次の例を考えてみましょう。

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- 正常に動作します。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- 正常に動作します。

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- xy_idxが明示的に無視されているため、クエリはINDEX_NOT_USEDエラーを発生させます。
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

インデックスを無視しない場合のクエリ：

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

Expression ((射影 + ORDER BY 前))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    インデックス:
      プライマリキー
        条件: true
        パート: 1/1
        グラニュール: 1/1
      スキップ
        名前: x_idx
        説明: minmax GRANULARITY 1
        パート: 0/1
        グラニュール: 0/1
      スキップ
        名前: y_idx
        説明: minmax GRANULARITY 1
        パート: 0/0
        グラニュール: 0/0
      スキップ
        名前: xy_idx
        説明: minmax GRANULARITY 1
        パート: 0/0
        グラニュール: 0/0
```

`xy_idx` インデックスを無視する:

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


## ignore_drop_queries_probability {#ignore_drop_queries_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "テスト目的で、サーバーが指定された確率で DROP クエリを無視できるようにする"}]}]}/>

有効にすると、サーバーは指定された確率で、すべての DROP TABLE クエリを無視します（Memory エンジンおよび JOIN エンジンの場合は DROP を TRUNCATE に置き換えます）。テスト目的で使用します。

## ignore_materialized_views_with_dropped_target_table {#ignore_materialized_views_with_dropped_target_table} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "対象テーブルが削除されたマテリアライズドビューを無視できる新しい設定を追加"}]}]}/>

ビューへのプッシュ処理時に、対象テーブルが削除されたマテリアライズドビュー (MV) を無視します

## ignore_on_cluster_for_replicated_access_entities_queries {#ignore_on_cluster_for_replicated_access_entities_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされたアクセスエンティティを管理するクエリで、ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_named_collections_queries {#ignore_on_cluster_for_replicated_named_collections_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "レプリケートされた名前付きコレクションを管理するクエリに対して、ON CLUSTER 句を無視します。"}]}]}/>

レプリケートされた名前付きコレクションを管理するクエリに対して、ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_udf_queries {#ignore_on_cluster_for_replicated_udf_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされた UDF の管理クエリに対して ON CLUSTER 句を無視します。

## implicit_select {#implicit_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A new setting."}]}]}/>

先頭の `SELECT` キーワードなしでシンプルな SELECT クエリを書けるようにします。これにより電卓のような用途で簡単に使うことができ、例えば `1 + 2` のような式も有効なクエリとして扱われます。

`clickhouse-local` ではデフォルトで有効になっており、明示的に無効化することもできます。

## implicit_table_at_top_level {#implicit_table_at_top_level} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "clickhouse-local で使用される新しい設定"}]}]}/>

空でない場合、トップレベルで FROM 句を持たないクエリは、`system.one` ではなくこのテーブルから読み取ります。

これは clickhouse-local における入力データ処理に使用されます。
この設定はユーザーが明示的に指定することもできますが、そのような用途を意図したものではありません。

副問い合わせ（スカラー副問い合わせ、FROM 句や IN 句を含む副問い合わせなど）は、この設定の影響を受けません。
UNION、INTERSECT、EXCEPT のチェーンにおけるトップレベルの SELECT 文は、一様に扱われ、この設定の影響を受けます。これは括弧でどのようにグルーピングされているかに関係ありません。
この設定がビューおよび分散クエリにどのような影響を与えるかは未定義です。

この設定にはテーブル名（その場合、テーブルは現在のデータベースから解決されます）、または 'database.table' 形式の修飾名を指定できます。
database 名と table 名の両方はクォートせずに指定する必要があり、単純識別子のみが許可されます。

## implicit_transaction {#implicit_transaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

有効化されていて、かつ既にトランザクション内で実行されていない場合、クエリを完全なトランザクション（begin + commit または rollback）として実行します

## inject_random_order_for_select_without_order_by {#inject_random_order_for_select_without_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

有効化すると、ORDER BY 句を含まない SELECT クエリに対して 'ORDER BY rand()' を挿入します。
サブクエリの深さが 0 の場合にのみ適用されます。サブクエリおよび INSERT INTO ... SELECT には影響しません。
トップレベルの構文が UNION の場合、'ORDER BY rand()' はすべての子要素に対して個別に挿入されます。
テストおよび開発用途にのみ有用です（ORDER BY が指定されていないことは、クエリ結果を非決定的にする原因となります）。

## input_format_parallel_parsing {#input_format_parallel_parsing} 

<SettingsInfoBlock type="Bool" default_value="1" />

データフォーマットの順序を保持した並列パースを有効または無効にします。[TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットでのみ利用できます。

利用可能な値:

- 1 — 有効。
- 0 — 無効。

## insert_allow_materialized_columns {#insert_allow_materialized_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、INSERT 文で materialized カラムの指定を許可します。

## insert_deduplicate {#insert_deduplicate} 

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` のブロック重複排除（Replicated\* テーブル用）を有効または無効にします。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

デフォルトでは、`INSERT` 文によってレプリケートされたテーブルに挿入されるブロックは重複排除されます（[Data Replication](../../engines/table-engines/mergetree-family/replication.md) を参照）。
レプリケートされたテーブルでは、デフォルトで各パーティションについて直近 100 個のブロックのみが重複排除されます（[replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
レプリケートされていないテーブルについては、[non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

## insert&#95;deduplication&#95;token

この設定により、ユーザーは MergeTree/ReplicatedMergeTree において独自の重複排除セマンティクスを指定できます。
たとえば、各 `INSERT` ステートメントでこの設定に一意な値を指定することで、
同じデータが挿入された場合に、それが重複として扱われて排除されるのを防ぐことができます。

取りうる値:

* 任意の文字列

`insert_deduplication_token` は、空でない場合にのみ重複排除に使用されます。

Replicated テーブルでは、デフォルトで各パーティションについて直近 100 件の INSERT のみが重複排除されます（[replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
非 Replicated テーブルについては [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

:::note
`insert_deduplication_token` はパーティション単位で動作します（`insert_deduplication` チェックサムと同様）。複数のパーティションが同じ `insert_deduplication_token` を持つことができます。
:::

例:

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- 次の挿入は重複排除されません。insert_deduplication_token が異なるためです
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- 次の挿入は重複排除されます。insert_deduplication_token が
-- 以前のいずれかと同じであるためです
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

挿入処理中の keeper リクエストが失敗するおおよその確率。指定できる値は [0.0f, 1.0f] の範囲です。

## insert_keeper_fault_injection_seed {#insert_keeper_fault_injection_seed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 0 の場合はランダムシード、それ以外の場合は設定値をそのまま使用します

## insert&#95;keeper&#95;max&#95;retries

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "INSERT 時に Keeper への再接続を有効化し、信頼性を向上"}]}]} />

この設定は、replicated MergeTree テーブルへの INSERT 時に行われる ClickHouse Keeper（または ZooKeeper）リクエストの最大リトライ回数を設定します。ネットワークエラー、Keeper セッションタイムアウト、またはリクエストタイムアウトが原因で失敗した Keeper リクエストのみがリトライ対象となります。

取りうる値:

* 正の整数。
* 0 — リトライを無効にする

Cloud でのデフォルト値: `20`。

Keeper リクエストのリトライは、一定時間のタイムアウト後に実行されます。タイムアウトは次の設定で制御されます: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`。
最初のリトライは `insert_keeper_retry_initial_backoff_ms` のタイムアウト後に実行されます。以降のタイムアウトは次のように計算されます:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

例えば、`insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000`、`insert_keeper_max_retries=8` の場合、タイムアウト値は `100, 200, 400, 800, 1600, 3200, 6400, 10000` となります。

フォールトトレランスに加えて、リトライはユーザーエクスペリエンスの向上も目的としています。例えば Keeper がアップグレードなどにより再起動された場合でも、INSERT の実行中にエラーを返さずに済むようにするためです。


## insert_keeper_retry_initial_backoff_ms {#insert_keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

INSERT クエリ実行中に失敗した Keeper リクエストを再試行するまでの初回待機時間（ミリ秒）

可能な値:

- 正の整数。
- 0 — 待機時間なし

## insert_keeper_retry_max_backoff_ms {#insert_keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

INSERT クエリの実行中に失敗した Keeper リクエストを再試行する際の最大タイムアウト時間（ミリ秒）。

設定可能な値:

- 正の整数。
- 0 — 最大タイムアウトを無制限にする。

## insert_null_as_default {#insert_null_as_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

[NULL](/sql-reference/syntax#null) の代わりに、[Nullable](/sql-reference/data-types/nullable) ではないデータ型のカラムに [default values](/sql-reference/statements/create/table#default_values) を挿入するかどうかを制御します。
カラムの型が Nullable ではなく、この設定が無効になっている場合、`NULL` を挿入すると例外が発生します。カラムの型が Nullable の場合、この設定に関わらず `NULL` の値はそのまま挿入されます。

この設定は [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリに適用されます。`SELECT` サブクエリは `UNION ALL` 句で連結される場合があることに注意してください。

可能な値:

- 0 — Nullable ではないカラムに `NULL` を挿入すると例外が発生します。
- 1 — `NULL` の代わりにカラムのデフォルト値が挿入されます。

## insert_quorum {#insert_quorum} 

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
この設定は SharedMergeTree には適用されません。詳細は [SharedMergeTree の一貫性](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム書き込みを有効にします。

- `insert_quorum < 2` の場合、クォーラム書き込みは無効です。
- `insert_quorum >= 2` の場合、クォーラム書き込みは有効です。
- `insert_quorum = 'auto'` の場合、クォーラム数として過半数（`number_of_replicas / 2 + 1`）を使用します。

クォーラム書き込み

`INSERT` は、ClickHouse が `insert_quorum_timeout` の間に `insert_quorum` 個のレプリカへ正しくデータを書き込めた場合にのみ成功します。何らかの理由で書き込みに成功したレプリカ数が `insert_quorum` に達しない場合、その書き込みは失敗と見なされ、ClickHouse はすでにデータが書き込まれているすべてのレプリカから挿入済みブロックを削除します。

`insert_quorum_parallel` が無効な場合、クォーラム内のすべてのレプリカは整合しています。つまり、すべての過去の `INSERT` クエリのデータを保持しています（`INSERT` のシーケンスは線形化されます）。`insert_quorum` を使用して書き込まれたデータを読み取り、かつ `insert_quorum_parallel` が無効な場合、[`select_sequential_consistency`](#select_sequential_consistency) を使用して `SELECT` クエリに逐次一貫性を有効にできます。

ClickHouse は次の場合に例外をスローします:

- クエリ時点で利用可能なレプリカ数が `insert_quorum` 未満の場合。
- `insert_quorum_parallel` が無効な状態で、前のブロックがまだレプリカの `insert_quorum` に挿入されていないうちにデータを書き込もうとした場合。この状況は、ユーザーが、`insert_quorum` を指定した前の `INSERT` が完了する前に、同じテーブルに対して別の `INSERT` クエリを実行しようとしたときに発生する可能性があります。

あわせて参照:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel {#insert_quorum_parallel} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで並列クォーラム INSERT を使用します。これは逐次クォーラム INSERT よりもはるかに便利です"}]}]}/>

:::note
この設定は SharedMergeTree には適用されません。詳しくは [SharedMergeTree の一貫性](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム付き `INSERT` クエリに対する並列実行を有効または無効にします。有効な場合、前のクエリがまだ完了していなくても、追加の `INSERT` クエリを送信できます。無効な場合、同じテーブルへの追加の書き込みは拒否されます。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout {#insert_quorum_timeout} 

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

クオラムへの書き込みのタイムアウトをミリ秒単位で指定します。タイムアウトまでに書き込みが行われなかった場合、ClickHouse は例外をスローし、クライアントは同じブロックを同じレプリカまたは別のレプリカに書き込むためにクエリを再実行する必要があります。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert&#95;shard&#95;id

<SettingsInfoBlock type="UInt64" default_value="0" />

`0` 以外の場合、データを同期的に挿入する [Distributed](/engines/table-engines/special/distributed) テーブルのシャードを指定します。

`insert_shard_id` の値が正しくない場合、サーバーは例外を送出します。

`requested_cluster` 上のシャード数を取得するには、サーバー構成を確認するか、次のクエリを使用します。

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

指定可能な値:

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


## interactive_delay {#interactive_delay} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

リクエストの実行がキャンセルされているかを確認し、進捗情報を送信するための間隔（マイクロ秒単位）。

## intersect_default_mode {#intersect_default_mode} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

INTERSECT クエリにおけるデフォルトモードを設定します。指定可能な値: 空文字列、'ALL'、'DISTINCT'。空文字列に設定した場合、モードを指定しないクエリは例外をスローします。

## jemalloc_collect_profile_samples_in_trace_log {#jemalloc_collect_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

jemalloc によるメモリ割り当ておよび解放のサンプルをトレースログ内に収集します。

## jemalloc_enable_profiler {#jemalloc_enable_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

クエリに対して jemalloc プロファイラを有効にします。jemalloc はメモリ割り当てをサンプリングし、サンプリングされた割り当てに対するすべての解放を記録します。
プロファイルは、メモリ割り当ての分析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を使用してフラッシュできます。
サンプルは、設定 jemalloc_collect_global_profile_samples_in_trace_log、またはクエリ設定 jemalloc_collect_profile_samples_in_trace_log を使用して system.trace_log に保存することもできます。
詳細は [アロケーションプロファイリング](/operations/allocation-profiling) を参照してください。

## join_algorithm {#join_algorithm} 

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' は明示的に指定された join アルゴリズムを使う方式に置き換えられて非推奨となり、また parallel_hash が hash よりも推奨されるようになりました"}]}]}/>

使用される [JOIN](../../sql-reference/statements/select/join.md) アルゴリズムを指定します。

複数のアルゴリズムを指定でき、クエリごとに種類/厳密さとテーブルエンジンに基づいて利用可能なものが選択されます。

指定可能な値:

- grace_hash

[Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join) が使用されます。Grace hash は、メモリ使用量を制限しつつ複雑な join を高い性能で実行できるアルゴリズムの選択肢です。

Grace join の第 1 フェーズでは右テーブルを読み取り、キー列のハッシュ値に応じて N 個のバケットに分割します (初期値の N は `grace_hash_join_initial_buckets`)。これは、それぞれのバケットを独立して処理できるようにするためです。最初のバケットの行はインメモリのハッシュテーブルに追加され、残りはディスクに保存されます。ハッシュテーブルがメモリ制限 (例えば [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join) で設定された値) を超えて成長した場合、バケット数が増加し、各行に割り当てられるバケットが再計算されます。現在のバケットに属さない行はフラッシュされて再割り当てされます。

`INNER/LEFT/RIGHT/FULL ALL/ANY JOIN` をサポートします。

- hash

[Hash join アルゴリズム](https://en.wikipedia.org/wiki/Hash_join) が使用されます。種類と厳密さのあらゆる組み合わせ、および `JOIN ON` 節で `OR` で結合される複数の join キーをサポートする最も汎用的な実装です。

`hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM にロードされます。

- parallel_hash

データをバケットに分割し、1 つではなく複数のハッシュテーブルを並行して構築することで処理を高速化する、`hash` join のバリエーションです。

`parallel_hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM にロードされます。

- partial_merge

[ソートマージアルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) の変種で、右テーブルのみが完全にソートされます。

`RIGHT JOIN` と `FULL JOIN` は `ALL` 厳密さでのみサポートされます (`SEMI`、`ANTI`、`ANY`、`ASOF` はサポートされません)。

`partial_merge` アルゴリズムを使用する場合、ClickHouse はデータをソートしてディスクに書き出します。ClickHouse における `partial_merge` アルゴリズムは、古典的な実装とは若干異なります。まず、ClickHouse は右テーブルを join キーでブロック単位にソートし、ソート済みブロックに対して min-max インデックスを作成します。次に、左テーブルの一部を `join key` でソートし、右テーブルと join します。このとき、不要な右テーブルブロックをスキップするために min-max インデックスも使用されます。

- direct

右テーブルのストレージがキー値リクエストをサポートしている場合に適用できるアルゴリズムです。

`direct` アルゴリズムは、左テーブルの行をキーとして使用し、右テーブルをルックアップします。これは [Dictionary](/engines/table-engines/special/dictionary) や [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) のような特殊なストレージでのみサポートされ、かつ `LEFT` および `INNER` JOIN のみが対象です。

- auto

`auto` に設定すると、最初に `hash` join が試行され、メモリ制限に違反した場合には、その場で別のアルゴリズムに切り替えられます。

- full_sorting_merge

結合前に両テーブルを完全にソートしてから実行する [ソートマージアルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) です。

- prefer_partial_merge

可能な場合は常に `partial_merge` join を使用し、それ以外の場合は `hash` を使用します。*非推奨* で、`partial_merge,hash` と同じです。

- default (deprecated)

レガシーな値のため、今後は使用しないでください。
`direct,hash` と同じであり、(この順序で) direct join と hash join の利用を試行します。

## join_any_take_last_row {#join_any_take_last_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

`ANY` 厳密モードの JOIN の動作を変更します。

:::note
この設定は、[Join](../../engines/table-engines/special/join.md) エンジンのテーブルに対する `JOIN` 演算にのみ適用されます。
:::

設定可能な値:

- 0 — 右側のテーブルに複数の一致する行がある場合、最初に見つかった 1 行だけが結合されます。
- 1 — 右側のテーブルに複数の一致する行がある場合、最後に見つかった 1 行だけが結合されます。

関連項目:

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness {#join_default_strictness} 

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

[JOIN 句](/sql-reference/statements/select/join)のデフォルトの厳密さを設定します。

設定可能な値:

- `ALL` — 右側のテーブルに複数の一致する行がある場合、ClickHouse はそれらの行から[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成します。これは標準 SQL における通常の `JOIN` の動作です。
- `ANY` — 右側のテーブルに複数の一致する行がある場合、最初に見つかった 1 行だけが結合されます。右側のテーブルに一致する行が 1 行しかない場合、`ANY` と `ALL` の結果は同じになります。
- `ASOF` — 一致があいまいなシーケンスを結合するために使用します。
- `Empty string` — クエリ内で `ALL` または `ANY` が指定されていない場合、ClickHouse は例外をスローします。

## join_on_disk_max_files_to_merge {#join_on_disk_max_files_to_merge} 

<SettingsInfoBlock type="UInt64" default_value="64" />

ディスク上で実行される `MergeJoin` 処理において、並列ソートに使用できるファイル数の上限を指定します。

この設定値が大きいほど、より多くのメモリが使用されますが、必要なディスク I/O は少なくなります。

設定可能な値:

- 2 以上の任意の正の整数。

## join_output_by_rowlist_perkey_rows_threshold {#join_output_by_rowlist_perkey_rows_threshold} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "ハッシュ結合において行リスト出力を行うかどうかを判定するための、右テーブルにおけるキーごとの平均行数の下限値。"}]}]}/>

ハッシュ結合において行リスト出力を行うかどうかを判定するための、右テーブルにおけるキーごとの平均行数の下限値。

## join_overflow_mode {#join_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

次のいずれかの結合制限に到達したときに、ClickHouse が実行する挙動を定義します:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

指定可能な値:

- `THROW` — ClickHouse は例外をスローし、処理を中断します。
- `BREAK` — ClickHouse は処理を中断し、例外はスローしません。

デフォルト値: `THROW`

**関連項目**

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes {#join_runtime_bloom_filter_bytes} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

JOIN ランタイムフィルターとして使用される Bloom フィルターのサイズ（バイト単位）。`enable_join_runtime_filters` 設定を参照。

## join_runtime_bloom_filter_hash_functions {#join_runtime_bloom_filter_hash_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "新しい設定"}]}]}/>

JOIN のランタイムフィルターとして使用される Bloom フィルターにおけるハッシュ関数の数（enable_join_runtime_filters 設定を参照）。

## join_runtime_filter_exact_values_limit {#join_runtime_filter_exact_values_limit} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

ランタイムフィルタ内で、そのまま set として格納される要素数の上限。このしきい値を超えると、ランタイムフィルタは Bloom フィルタ方式に切り替わります。

## join_to_sort_maximum_table_rows {#join_to_sort_maximum_table_rows} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "LEFT JOIN または INNER JOIN において、右テーブルをキーで再ソートするかどうかを判断するための、右テーブルの最大行数"}]}]}/>

LEFT JOIN または INNER JOIN において、右テーブルをキーで再ソートするかどうかを判断するための、右テーブルの最大行数。

## join_to_sort_minimum_perkey_rows {#join_to_sort_minimum_perkey_rows} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "左結合または内部結合において、右テーブルをキーで再ソートするかどうかを判断するための、右テーブル側のキーごとの平均行数の下限値。この設定により、キー分布がスパースなテーブルに対してはこの最適化が適用されないようにします"}]}]}/>

左結合または内部結合において、右テーブルをキーで再ソートするかどうかを判断するための、右テーブル側のキーごとの平均行数の下限値。この設定により、キー分布がスパースなテーブルに対してはこの最適化が適用されないようにします

## join_use_nulls {#join_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="0" />

[JOIN](../../sql-reference/statements/select/join.md) の動作の種類を設定します。テーブルを結合すると、空のセルが発生する場合があります。この設定に応じて、ClickHouse はそれらを異なる方法で埋めます。

取りうる値:

- 0 — 空のセルは、対応するフィールド型のデフォルト値で埋められます。
- 1 — `JOIN` は標準 SQL と同じように動作します。対応するフィールドの型は [Nullable](/sql-reference/data-types/nullable) に変換され、空のセルは [NULL](/sql-reference/syntax) で埋められます。

## joined_block_split_single_row {#joined_block_split_single_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

左テーブルの単一行に対応する行単位で、ハッシュ結合結果をチャンクに分割できるようにします。
これは、右テーブル側に多数のマッチを持つ行が存在する場合のメモリ使用量を削減するのに役立ちますが、CPU 使用量が増加する可能性があります。
この設定を有効に機能させるには、`max_joined_block_size_rows != 0` であることが必須です。
この設定と組み合わせて使用する `max_joined_block_size_bytes` は、右テーブル側に多数のマッチを持つ大きな行を含むような偏りのあるデータの場合に、過剰なメモリ使用を回避するのに役立ちます。

## joined_subquery_requires_alias {#joined_subquery_requires_alias} 

<SettingsInfoBlock type="Bool" default_value="1" />

正しく名前を修飾するために、結合に用いるサブクエリおよびテーブル関数にはエイリアスの指定を必須とします。

## kafka_disable_num_consumers_limit {#kafka_disable_num_consumers_limit} 

<SettingsInfoBlock type="Bool" default_value="0" />

利用可能な CPU コア数に依存する `kafka_num_consumers` の制限を無効にします。

## kafka_max_wait_ms {#kafka_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[Kafka](/engines/table-engines/integrations/kafka) からメッセージを読み取る際に、再試行を行うまで待機する時間（ミリ秒単位）。

可能な値：

- 正の整数。
- 0 — タイムアウトなし（無制限）。

関連項目：

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode {#keeper_map_strict_mode} 

<SettingsInfoBlock type="Bool" default_value="0" />

KeeperMap に対する操作時に追加のチェックを行います。例えば、すでに存在するキーを挿入しようとした場合には例外をスローします。

## keeper_max_retries {#keeper_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "一般的な Keeper 操作に対する最大再試行回数"}]}]}/>

一般的な Keeper 操作に対する最大再試行回数

## keeper_retry_initial_backoff_ms {#keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "Keeper の一般的な操作に対するリトライの初期バックオフ待機時間"}]}]}/>

Keeper の一般的な操作に対するリトライの初期バックオフ待機時間

## keeper_retry_max_backoff_ms {#keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "一般的な Keeper 操作向けバックオフの最大タイムアウト"}]}]}/>

一般的な Keeper 操作向けバックオフの最大タイムアウト

## least_greatest_legacy_null_behavior {#least_greatest_legacy_null_behavior} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

有効にすると、`least` 関数および `greatest` 関数は、いずれかの引数が NULL の場合に NULL を返します。

## legacy_column_name_of_tuple_literal {#legacy_column_name_of_tuple_literal} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "互換性のためだけに追加された設定です。バージョン 21.7 未満からそれ以降のバージョンへクラスタをローリングアップデートする際にのみ、'true' に設定する意味があります。"}]}]}/>

大きなタプルリテラルについて、要素名をハッシュではなく列名としてすべて列挙します。この設定は互換性のためだけに存在します。バージョン 21.7 未満からそれ以降のバージョンへクラスタをローリングアップデートする際にのみ、'true' に設定する意味があります。

## lightweight_delete_mode {#lightweight_delete_mode} 

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "新しい設定"}]}]}/>

軽量削除の一部として実行される、内部の UPDATE クエリのモードです。

設定可能な値:

- `alter_update` - 重いミューテーションを作成する `ALTER UPDATE` クエリを実行します。
- `lightweight_update` - 可能であれば軽量更新を実行し、不可能な場合は `ALTER UPDATE` を実行します。
- `lightweight_update_force` - 可能であれば軽量更新を実行し、不可能な場合は例外をスローします。

## lightweight_deletes_sync {#lightweight_deletes_sync} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "The same as 'mutation_sync', but controls only execution of lightweight deletes"}]}]}/>

[`mutations_sync`](#mutations_sync) と同様ですが、`lightweight delete` の実行のみを制御します。

設定可能な値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | mutation は非同期で実行されます。                                                                                                                     |
| `1`   | クエリは、現在のサーバー上で `lightweight delete` が完了するまで待機します。                                                                          |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で `lightweight delete` が完了するまで待機します。                                                          |
| `3`   | クエリはアクティブなレプリカのみを待機します。`SharedMergeTree` でのみサポートされます。`ReplicatedMergeTree` では `mutations_sync = 2` と同様に動作します。|

**関連項目**

- [ALTER クエリの同期性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Mutations](../../sql-reference/statements/alter/index.md/#mutations)

## limit {#limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ結果から取得する行数の上限を設定します。クエリ内で設定された [LIMIT](/sql-reference/statements/select/limit) 句の値に対する上限として機能し、クエリで指定された上限がこの設定で定めた上限を超えないようにします。

設定可能な値:

- 0 — 行数を制限しません。
- 正の整数。

## load_balancing {#load_balancing} 

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

分散クエリ処理で使用するレプリカ選択アルゴリズムを指定します。

ClickHouse は、レプリカを選択するためのアルゴリズムとして次の方式をサポートします。

- [Random（ランダム）](#load_balancing-random)（デフォルト）
- [Nearest hostname（最も近いホスト名）](#load_balancing-nearest_hostname)
- [Hostname levenshtein distance（ホスト名のレーベンシュタイン距離）](#load_balancing-hostname_levenshtein_distance)
- [In order（順番どおり）](#load_balancing-in_order)
- [First or random（先頭またはランダム）](#load_balancing-first_or_random)
- [Round robin（ラウンドロビン）](#load_balancing-round_robin)

関連項目：

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### ランダム（デフォルト）

```sql
load_balancing = random
```

エラー数は各レプリカごとにカウントされます。クエリはエラー数が最も少ないレプリカに送信され、該当するレプリカが複数ある場合はいずれか 1 つに送信されます。
欠点: サーバー間の近接性は考慮されません。また、レプリカごとに保持しているデータが異なる場合、取得されるデータも異なります。


### 最寄りのホスト名

```sql
load_balancing = nearest_hostname
```

エラー数は各レプリカごとにカウントされます。5分ごとに、エラー数は整数除算で 2 で割られます。これにより、エラー数は直近の期間に対して指数平滑化された形で算出されます。1 つのレプリカだけが最小のエラー数である場合（つまり、他のレプリカでは最近エラーが発生している場合）、クエリはそのレプリカに送信されます。同じ最小エラー数を持つレプリカが複数ある場合、クエリは設定ファイル内で定義されたサーバーのホスト名と最も類似したホスト名を持つレプリカに送信されます（両方のホスト名のうち短い方の長さまで、同じ位置にある文字の相違数に基づいて判断します）。

たとえば、example01-01-1 と example01-01-2 は 1 文字だけ異なりますが、example01-01-1 と example01-02-2 は 2 か所異なります。
この方法は単純に見えるかもしれませんが、ネットワークトポロジーに関する外部データを必要とせず、また IPv6 アドレスでは扱いが複雑になる IP アドレスの比較も行いません。

したがって、レプリカが同等である場合は、ホスト名が最も近いものが優先されます。
また、障害がない限り、同じサーバーにクエリを送信すると、分散クエリも同じサーバー群に送られるとみなせます。そのため、たとえレプリカに配置されているデータが異なっていても、クエリはほぼ同じ結果を返します。


### ホスト名のレーベンシュタイン距離

```sql
load_balancing = hostname_levenshtein_distance
```

`nearest_hostname` と同様ですが、ホスト名を [レーベンシュタイン距離](https://en.wikipedia.org/wiki/Levenshtein_distance) に基づいて比較します。例えば、次のようになります：

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### この順序で

```sql
load_balancing = in_order
```

エラー数が同じレプリカには、設定で指定された順序どおりにアクセスされます。
この方式は、どのレプリカを優先すべきかを正確に把握している場合に適しています。


### 先頭 または ランダム

```sql
load_balancing = first_or_random
```

このアルゴリズムは、セット内の最初のレプリカを選択し、最初のレプリカが利用できない場合はランダムなレプリカを選択します。クロスレプリケーショントポロジの構成では有効ですが、その他の構成では有効ではありません。

`first_or_random` アルゴリズムは、`in_order` アルゴリズムの問題を解決します。`in_order` では、1 つのレプリカがダウンすると、次のレプリカが通常の 2 倍の負荷を受け、その間も残りのレプリカは通常どおりのトラフィック量のみを処理します。`first_or_random` アルゴリズムを使用すると、まだ利用可能なレプリカ間で負荷が均等に分散されます。

設定項目 `load_balancing_first_offset` を使用して、どのレプリカを「最初の」レプリカとみなすかを明示的に定義できます。これにより、レプリカ間でのクエリワークロードの再分散を、より細かく制御できるようになります。


### ラウンドロビン

```sql
load_balancing = round_robin
```

このアルゴリズムでは、エラー数が同じレプリカ間でラウンドロビン方式を用います（対象となるのは `round_robin` ポリシーが指定されたクエリのみです）。


## load_balancing_first_offset {#load_balancing_first_offset} 

<SettingsInfoBlock type="UInt64" default_value="0" />

FIRST_OR_RANDOM ロードバランシング戦略を使用する際に、優先的にクエリを送信するレプリカの番号。

## load_marks_asynchronously {#load_marks_asynchronously} 

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree のマークを非同期で読み込む

## local_filesystem_read_method {#local_filesystem_read_method} 

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

ローカルファイルシステムからデータを読み取る方法です。次のいずれかを指定します: read, pread, mmap, io_uring, pread_threadpool。

`io_uring` メソッドは実験的なものであり、Log、TinyLog、StripeLog、File、Set、Join など、追記可能なファイルを持つテーブルに対しては、読み取りと書き込みが同時に行われる状況では動作しません。
インターネット上の `io_uring` に関するさまざまな記事を読んでも、それらに惑わされないでください。`io_uring` は、大量の小さな IO リクエストが発生するケース（ClickHouse では該当しないケース）を除いて、ファイル読み取りにおいて特に優れた方法ではありません。`io_uring` を有効化する理由はありません。

## local_filesystem_read_prefetch {#local_filesystem_read_prefetch} 

<SettingsInfoBlock type="Bool" default_value="0" />

ローカルファイルシステムからデータを読み込む際にプリフェッチを使用するかどうかを指定します。

## lock_acquire_timeout {#lock_acquire_timeout} 

<SettingsInfoBlock type="Seconds" default_value="120" />

ロックリクエストが失敗するまで待機する秒数を定義します。

ロックタイムアウトは、テーブルに対する読み取り/書き込み操作の実行中にデッドロックを防ぐために使用されます。タイムアウトに達してロックリクエストが失敗すると、ClickHouse サーバーはエラーコード `DEADLOCK_AVOIDED` とともに、例外 "Locking attempt timed out! Possible deadlock avoided. Client should retry." をスローします。

設定可能な値:

- 正の整数（秒）。
- 0 — ロックタイムアウトなし。

## log&#95;comment

[system.query&#95;log](../system-tables/query_log.md) テーブルの `log_comment` フィールドの値と、サーバーログ用のコメントテキストを指定します。

サーバーログの可読性を向上させるために使用できます。さらに、[clickhouse-test](../../development/tests.md) の実行後に `system.query_log` からテストに関連するクエリを抽出するのにも役立ちます。

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


## log_formatted_queries {#log_formatted_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

フォーマット済みクエリを [system.query_log](../../operations/system-tables/query_log.md) システムテーブルにログとして記録できるようにします（[system.query_log](../../operations/system-tables/query_log.md) の `formatted_query` 列に値を設定します）。

設定可能な値:

- 0 — フォーマット済みクエリはシステムテーブルに記録されません。
- 1 — フォーマット済みクエリはシステムテーブルに記録されます。

## log_processors_profiles {#log_processors_profiles} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "既定で有効"}]}]}/>

プロセッサが実行中およびデータ待機中に費やした時間を、`system.processors_profile_log` テーブルに書き込みます。

関連項目:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events {#log_profile_events} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリのパフォーマンスに関する統計情報を、`query_log`、`query_thread_log`、`query_views_log` に記録します。

## log&#95;queries

<SettingsInfoBlock type="Bool" default_value="1" />

クエリログの設定を行います。

この設定を有効にすると、ClickHouse に送信されたクエリは、[query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) サーバー設定パラメータのルールに従って記録されます。

例：

```text
log_queries=1
```


## log_queries_cut_to_length {#log_queries_cut_to_length} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

クエリの長さが指定したしきい値（バイト数）を超える場合、クエリログへの書き込み時にクエリを途中で切ります。また、通常のテキストログに出力されるクエリ文字列の長さも制限します。

## log_queries_min_query_duration_ms {#log_queries_min_query_duration_ms} 

<SettingsInfoBlock type="ミリ秒" default_value="0" />

有効になっている場合（0 以外）、この設定値より速く完了したクエリはログに記録されません（[MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html) における `long_query_time` のようなものと考えることができます）。つまり、それらのクエリは次のテーブルには含まれません。

- `system.query_log`
- `system.query_thread_log`

次のタイプを持つクエリのみがログに記録されます。

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- タイプ: ミリ秒
- デフォルト値: 0（すべてのクエリ）

## log&#95;queries&#95;min&#95;type

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

`query_log` に書き込むレコードの最小タイプ。

利用可能な値:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

`query_log` に記録される対象を制限するために使用できます。たとえば、エラーのみに関心がある場合は `EXCEPTION_WHILE_PROCESSING` を使用します。

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability {#log_queries_probability} 

<SettingsInfoBlock type="Float" default_value="1" />

指定した確率に基づいて、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、および [query_views_log](../../operations/system-tables/query_views_log.md) システムテーブルに記録されるクエリのうち、一部のみをランダムにサンプリングして書き込むようにします。1 秒あたりのクエリ数が非常に多い場合の負荷軽減に役立ちます。

取り得る値は次のとおりです。

- 0 — システムテーブルにはクエリが記録されません。
- [0..1] の範囲の正の浮動小数点数。例えば設定値が `0.5` の場合、おおよそ半分のクエリがシステムテーブルに記録されます。
- 1 — すべてのクエリがシステムテーブルに記録されます。

## log_query_settings {#log_query_settings} 

<SettingsInfoBlock type="Bool" default_value="1" />

query_log と OpenTelemetry の span ログにクエリ設定を記録します。

## log&#95;query&#95;threads

<SettingsInfoBlock type="Bool" default_value="0" />

クエリスレッドのログ記録を構成します。

クエリスレッドは [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) テーブルにログ出力されます。この設定は [log&#95;queries](#log_queries) が true の場合にのみ有効です。この設定により ClickHouse が実行するクエリのスレッドは、[query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) サーバー設定パラメータで定義されたルールに従って記録されます。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

```text
log_query_threads=1
```


## log&#95;query&#95;views

<SettingsInfoBlock type="Bool" default_value="1" />

クエリビューのログ記録を設定します。

この設定を有効にした状態で ClickHouse によって実行されたクエリに関連するビュー（マテリアライズドビューまたはライブビュー）がある場合、それらは [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) サーバー設定パラメータに記録されます。

例:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format {#low_cardinality_allow_in_native_format} 

<SettingsInfoBlock type="Bool" default_value="1" />

[Native](/interfaces/formats/Native) フォーマットで [LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型を使用できるかどうかを制御します。

`LowCardinality` の使用が制限されている場合、ClickHouse サーバーは `SELECT` クエリに対して `LowCardinality` 列を通常の列に変換し、`INSERT` クエリに対して通常の列を `LowCardinality` 列に変換します。

この設定は主に、`LowCardinality` データ型をサポートしていないサードパーティクライアント向けに必要となります。

可能な値:

- 1 — `LowCardinality` の使用は制限されません。
- 0 — `LowCardinality` の使用は制限されます。

## low_cardinality_max_dictionary_size {#low_cardinality_max_dictionary_size} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型用の共有グローバル辞書について、ストレージファイルシステムに書き込むことができる最大サイズ（行数）を設定します。この設定により、辞書が無制限に増加した場合の RAM に関する問題を防止します。最大辞書サイズの制限によりエンコードできないデータはすべて、ClickHouse によって通常の方法で書き込まれます。

取り得る値:

- 任意の正の整数。

## low_cardinality_use_single_dictionary_for_part {#low_cardinality_use_single_dictionary_for_part} 

<SettingsInfoBlock type="Bool" default_value="0" />

データパートに対して単一の辞書のみを使用するかどうかを有効または無効にします。

デフォルトでは、ClickHouse サーバーは辞書のサイズを監視し、ある辞書がオーバーフローすると次の辞書への書き込みを開始します。複数の辞書の作成を禁止するには、`low_cardinality_use_single_dictionary_for_part = 1` を設定します。

設定可能な値:

- 1 — データパートに対して複数の辞書を作成することを禁止します。
- 0 — データパートに対して複数の辞書を作成することを禁止しません。

## low_priority_query_wait_time_ms {#low_priority_query_wait_time_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

クエリの優先順位付けメカニズムが使用されている場合（設定 `priority` を参照）、低優先度のクエリは高優先度のクエリが終了するまで待機します。この設定で、その待機時間を指定します。

## make_distributed_plan {#make_distributed_plan} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

分散クエリプランを作成します。

## materialize_skip_indexes_on_insert {#materialize_skip_indexes_on_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時にスキップインデックスの具体化を無効化できる新しい設定を追加"}]}]}/>

この設定が有効な場合、`INSERT` 時にスキップインデックスが構築・保存されます。無効な場合、スキップインデックスは [マージ時](merge-tree-settings.md/#materialize_skip_indexes_on_merge) もしくは明示的な [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) によってのみ構築および保存されます。

[exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert) も参照してください。

## materialize_statistics_on_insert {#materialize_statistics_on_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時に統計のマテリアライズを無効化できる新しい設定を追加"}]}]}/>

有効な場合、`INSERT` 実行時に統計情報が構築されて書き込まれます。無効な場合は、統計情報はマージ処理中、または明示的な `MATERIALIZE STATISTICS` によって構築および保存されます。

## materialize_ttl_after_modify {#materialize_ttl_after_modify} 

<SettingsInfoBlock type="Bool" default_value="1" />

ALTER MODIFY TTL クエリの実行後に、古いデータへ TTL を適用します。

## materialized_views_ignore_errors {#materialized_views_ignore_errors} 

<SettingsInfoBlock type="Bool" default_value="0" />

MATERIALIZED VIEW で発生したエラーを無視し、マテリアライズドビューに関係なく元のブロックをテーブルに書き込めるようにします

## materialized_views_squash_parallel_inserts {#materialized_views_squash_parallel_inserts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "必要に応じて従来の動作を維持するための設定を追加。"}]}]}/>

単一の INSERT クエリでマテリアライズドビューの宛先テーブルに対して行われる並列インサートをまとめ、生成されるパーツ数を削減します。
false に設定され、かつ `parallel_view_processing` が有効な場合、INSERT クエリは宛先テーブルに対して `max_insert_thread` の各スレッドごとにパーツを生成します。

## max_analyze_depth {#max_analyze_depth} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

インタープリタが行う解析の最大数です。

## max_ast_depth {#max_ast_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

クエリの構文木における最大のネスト深さです。これを超えると例外がスローされます。

:::note
現時点では、解析中ではなく、クエリの解析後にのみチェックされます。
つまり、解析中に深さが深すぎる構文木が生成される可能性がありますが、
その場合、そのクエリは失敗します。
:::

## max_ast_elements {#max_ast_elements} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

クエリの構文木に含めることができる要素数の上限です。これを超えると例外がスローされます。

:::note
現時点では、構文解析中ではなく、クエリの構文解析が完了した後にのみチェックされます。
つまり、構文解析の過程で深さが大きすぎる構文木が生成される可能性がありますが、
その場合、そのクエリは失敗します。
:::

## max_autoincrement_series {#max_autoincrement_series} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

`generateSerialID` 関数によって作成されるシリーズ数の上限です。

各シリーズは Keeper 内のノードを表すため、その数は数百万程度を上限とすることを推奨します。

## max_backup_bandwidth {#max_backup_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバー上の特定のバックアップの最大読み取り速度（バイト/秒）。0 の場合は無制限です。

## max_block_size {#max_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

ClickHouse では、データはブロック単位で処理されます。ブロックとは、複数のカラムパーツの集合です。1 つのブロックに対する内部処理サイクルは効率的ですが、各ブロックを処理する際には無視できないコストが発生します。

`max_block_size` 設定は、テーブルからデータを読み込む際に 1 つのブロックに含める推奨の最大行数を示します。常に `max_block_size` の大きさのブロックがテーブルから読み込まれるとは限りません。ClickHouse が、取得すべきデータ量がより少ないと判断した場合には、より小さいブロックが処理されます。

ブロックサイズが小さすぎると、各ブロックの処理にかかるコストが目立つようになります。一方で、ブロックサイズが大きすぎると、最初のブロックを処理した後に LIMIT 句付きクエリで結果をすばやく返すことが難しくなります。`max_block_size` を設定する際の目的は、多数のカラムを複数スレッドで抽出する際でも過剰なメモリ消費を避けるとともに、少なくともある程度のキャッシュ局所性を維持することです。

## max_bytes_before_external_group_by {#max_bytes_before_external_group_by} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クラウドでのデフォルト値: レプリカごとのメモリ量の半分。

`GROUP BY` 句の外部メモリ上での実行を有効または無効にします。
（[外部メモリでの GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory) を参照）

設定可能な値:

- 単一の [GROUP BY](/sql-reference/statements/select/group-by) 処理で使用可能な RAM の最大容量（バイト単位）。
- `0` — 外部メモリでの `GROUP BY` を無効化。

:::note
GROUP BY の実行中にメモリ使用量がこの閾値（バイト単位）を超えた場合、
「外部集約」モードを有効化し（データをディスクに書き出します）、処理を継続します。

推奨値は、利用可能なシステムメモリの半分です。
:::

## max_bytes_before_external_sort {#max_bytes_before_external_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud のデフォルト値: レプリカごとに利用可能なメモリ量の半分。

`ORDER BY` 句を外部メモリで実行するかどうかを切り替えます。詳細は [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details) を参照してください。
`ORDER BY` 実行中のメモリ使用量が、このしきい値（バイト数）を超えた場合、外部ソートモード（ディスクへのスピル）が有効になります。

設定可能な値:

- 単一の [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作で使用可能な RAM の最大容量（バイト数）。
  推奨値は利用可能なシステムメモリの半分です。
- `0` — 外部メモリでの `ORDER BY` を無効にします。

## max_bytes_before_remerge_sort {#max_bytes_before_remerge_sort} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

ORDER BY と LIMIT を伴うクエリで、メモリ使用量が指定されたしきい値を超えた場合には、最終マージの前にブロックを追加でマージし、上位 LIMIT 行のみを保持します。

## max_bytes_in_distinct {#max_bytes_in_distinct} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`DISTINCT` を使用する際に、メモリ上のハッシュテーブルが保持する状態データ（非圧縮バイト数）の最大サイズ。

## max_bytes_in_join {#max_bytes_in_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルを結合する際に使用されるハッシュテーブルの最大サイズ（バイト数）。

この設定は [SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join table engine](/engines/table-engines/special/join) に適用されます。

クエリに JOIN が含まれている場合、ClickHouse はすべての中間結果に対してこの設定を確認します。

制限に達したときに ClickHouse がどのように動作するかは複数の選択肢があります。
[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 設定を使用して動作を選択します。

設定可能な値:

- 正の整数。
- 0 — メモリ使用量の制御を無効にする。

## max_bytes_in_set {#max_bytes_in_set} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サブクエリから作成された `IN` 句内の set が使用する（非圧縮データの）最大バイト数。

## max_bytes_ratio_before_external_group_by {#max_bytes_ratio_before_external_group_by} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "デフォルトでディスクへの自動スピルを有効にします。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`GROUP BY` で使用を許可する利用可能メモリの比率です。この閾値に達すると、
集約処理に外部メモリが使用されます。

例えば `0.6` に設定した場合、実行開始時点で `GROUP BY` は利用可能メモリ
（サーバー / ユーザー / マージ用）の 60% まで使用できます。その後は、
外部集約の利用を開始します。

## max_bytes_ratio_before_external_sort {#max_bytes_ratio_before_external_sort} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Enable automatic spilling to disk by default."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

利用可能なメモリのうち、`ORDER BY` で使用することを許可する割合です。この割合に達すると、外部ソートが使用されます。

例えば `0.6` に設定した場合、`ORDER BY` は実行開始時点で利用可能なメモリ（サーバー / ユーザー / マージ用）の `60%` までを使用し、その後は外部ソートの使用を開始します。

`max_bytes_before_external_sort` は引き続き有効である点に注意してください。ディスクへのスピルは、ソートブロックが `max_bytes_before_external_sort` よりも大きい場合にのみ行われます。

## max_bytes_to_read {#max_bytes_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリを実行するときに、テーブルから読み取ることができる非圧縮データの最大バイト数です。
この制限は処理される各データチャンクごとにチェックされ、最も深いテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合には、そのリモートサーバー側でのみチェックされます。

## max_bytes_to_read_leaf {#max_bytes_to_read_leaf} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行する際に、リーフノード上のローカルテーブルから読み取ることができる非圧縮データの最大バイト数です。分散クエリは各シャード（リーフ）に対して複数のサブクエリを発行できますが、この制限はリーフノードでの読み取り段階でのみチェックされ、ルートノードでの結果マージ段階では無視されます。

たとえば、クラスタが 2 つのシャードで構成されており、各シャードには 100 バイトのデータを持つテーブルがあるとします。両方のテーブルからすべてのデータを読み取る分散クエリを `max_bytes_to_read=150` を指定して実行すると、合計で 200 バイトになるため失敗します。一方、`max_bytes_to_read_leaf=150` を指定したクエリは、リーフノードが最大 100 バイトまでしか読み取らないため成功します。

この制限は、処理されるデータチャンクごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合、動作が不安定になります。
:::

## max_bytes_to_sort {#max_bytes_to_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ソート時に処理できる非圧縮データの最大バイト数です。ORDER BY の処理で、この設定値を超える非圧縮バイト数を処理する必要がある場合、挙動は `sort_overflow_mode` によって決まり、デフォルトでは `throw` に設定されています。

## max_bytes_to_transfer {#max_bytes_to_transfer} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`GLOBAL IN` / `JOIN` セクションが実行されるときに、リモートサーバーに送信するか一時テーブルに保存できる非圧縮データの最大バイト数。

## max_columns_to_read {#max_columns_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1回のクエリでテーブルから読み取ることができる列の最大数です。
クエリでこの設定値で指定した列数を超える列の読み取りが必要な場合は、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリを防ぐのに役立ちます。
:::

`0` を指定した場合は無制限になります。

## max_compress_block_size {#max_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

テーブルへの書き込み時に、圧縮前のデータブロックの最大サイズです。デフォルトは 1,048,576 (1 MiB) です。より小さいブロックサイズを指定すると、通常、圧縮率はわずかに低下しますが、キャッシュ局所性により圧縮および伸長の速度はわずかに向上し、メモリ消費量は削減されます。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないでください。
:::

圧縮用のブロック（バイトから成るメモリチャンク）と、クエリ処理用のブロック（テーブルの行の集合）を混同しないようにしてください。

## max&#95;concurrent&#95;queries&#95;for&#95;all&#95;users

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定値が現在同時に処理中のクエリ数以下になると、例外をスローします。

例: すべてのユーザーに対して `max_concurrent_queries_for_all_users` を 99 に設定し、データベース管理者はサーバーが過負荷のときでも調査用クエリを実行できるよう、自身については 100 に設定できます。

1 つのクエリまたはユーザーに対して設定を変更しても、他のクエリやユーザーには影響しません。

取りうる値:

* 正の整数。
* 0 — 制限なし。

**例**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**関連項目**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max&#95;concurrent&#95;queries&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

ユーザーごとに同時に処理できるクエリ数の最大値。

設定可能な値:

* 正の整数。
* 0 — 無制限。

**例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections {#max_distributed_connections} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

単一の Distributed テーブルに対する 1 件のクエリを分散処理する際に、リモートサーバーとの同時接続数の上限を表します。クラスター内のサーバー数以上の値に設定することを推奨します。

次のパラメータは Distributed テーブルの作成時（およびサーバー起動時）にのみ使用されるため、実行時に変更しても意味がありません。

## max_distributed_depth {#max_distributed_depth} 

<SettingsInfoBlock type="UInt64" default_value="5" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルに対する再帰クエリの最大深度を制限します。

値がこの上限を超えた場合、サーバーは例外を送出します。

設定可能な値:

- 正の整数
- 0 — 深さに制限なし

## max_download_buffer_size {#max_download_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

各スレッドにおける並列ダウンロード（例: URL エンジン）用バッファの最大サイズ。

## max_download_threads {#max_download_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="4" />

データをダウンロードするためのスレッド数の上限（例：URL エンジンで使用）。

## max_estimated_execution_time {#max_estimated_execution_time} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "max_execution_time と max_estimated_execution_time を分離"}]}]}/>

クエリの推定実行時間の最大値を秒単位で指定します。  
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が期限切れになると、各データブロックでチェックされます。

## max_execution_speed {#max_execution_speed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりに実行される行数の上限です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
の値に達するたびに、各データブロックごとにチェックされます。実行速度が高すぎる場合は、実行速度が抑制されます。

## max_execution_speed_bytes {#max_execution_speed_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最大実行バイト数です。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) が
満了するたびに、各データブロックごとにチェックされます。実行速度が高すぎる場合、実行速度は抑えられます。

## max_execution_time {#max_execution_time} 

<SettingsInfoBlock type="Seconds" default_value="0" />

クエリの最大実行時間（秒単位）です。

`max_execution_time` パラメータは少し分かりにくい場合があります。
これは、現在のクエリ実行速度に対する補間に基づいて動作します
（この挙動は [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) によって制御されます）。

ClickHouse は、予測される実行時間が指定した `max_execution_time` を超える場合、
クエリを中断します。デフォルトでは `timeout_before_checking_execution_speed`
は 10 秒に設定されています。つまり、クエリ実行から 10 秒経過すると、ClickHouse は
総実行時間の見積もりを開始します。例えば、`max_execution_time` を 3600 秒（1 時間）
に設定している場合、予測時間がこの 3600 秒の制限を超えると、ClickHouse はクエリを
終了します。`timeout_before_checking_execution_speed` を 0 に設定すると、
ClickHouse は `max_execution_time` の基準として経過時間を使用します。

クエリの実行時間が指定した秒数を超えた場合の動作は、
`timeout_overflow_mode` によって決まり、デフォルトでは `throw` に設定されています。

:::note
タイムアウトはデータ処理中の特定の箇所でのみチェックされ、そのタイミングでのみクエリを停止できます。
現在のところ、集約状態のマージ処理中やクエリ解析中には停止できないため、
実際の実行時間はこの設定値より長くなります。
:::

## max&#95;execution&#95;time&#95;leaf

<SettingsInfoBlock type="Seconds" default_value="0" />

意味的には [`max_execution_time`](#max_execution_time) と似ていますが、
分散クエリやリモートクエリにおいてリーフノードにのみ適用されます。

例えば、リーフノードでの実行時間を `10s` に制限しつつ、
初期ノード側では制限を設けたくない場合は、ネストされたサブクエリの設定で
`max_execution_time` を指定する代わりに、次のようにします：

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

クエリ設定としては `max_execution_time_leaf` を使用できます。

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements {#max_expanded_ast_elements} 

<SettingsInfoBlock type="UInt64" default_value="500000" />

エイリアスおよびアスタリスクの展開後のクエリ構文木におけるノード数の最大値。

## max_fetch_partition_retries_count {#max_fetch_partition_retries_count} 

<SettingsInfoBlock type="UInt64" default_value="5" />

別のホストからパーティションを取得する際の再試行回数の上限。

## max_final_threads {#max_final_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子付きの `SELECT` クエリにおけるデータ読み取りフェーズの最大並列スレッド数を設定します。

指定できる値:

- 正の整数。
- 0 または 1 — 無効。`SELECT` クエリは単一スレッドで実行されます。

## max_http_get_redirects {#max_http_get_redirects} 

<SettingsInfoBlock type="UInt64" default_value="0" />

許可される HTTP GET リダイレクトの最大ホップ数です。悪意のあるサーバーがリクエストを予期しないサービスへリダイレクトすることを防ぐための追加のセキュリティ対策です。\n\n外部サーバーが別のアドレスにリダイレクトし、そのアドレスが会社のインフラストラクチャ内のアドレスであるように見える場合があります。その結果、内部サーバーへ HTTP リクエストを送信して、内部ネットワークから認証を迂回して内部 API を呼び出したり、さらには Redis や Memcached などの他のサービスに対してクエリを実行できてしまう可能性があります。内部インフラストラクチャ（localhost 上で動作しているものを含む）を持っていない場合や、サーバーを信頼している場合には、リダイレクトを許可しても安全です。ただし、URL が HTTPS ではなく HTTP を使用している場合には、リモートサーバーだけでなく ISP やその間に存在するすべてのネットワークも信頼する必要があることに注意してください。

## max&#95;hyperscan&#95;regexp&#95;length

<SettingsInfoBlock type="UInt64" default_value="0" />

[hyperscan multi-match functions](/sql-reference/functions/string-search-functions#multiMatchAny) における各正規表現の最大長さを定義します。

設定可能な値:

* 正の整数。
* 0 - 長さを制限しません。

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


## max&#95;hyperscan&#95;regexp&#95;total&#95;length

<SettingsInfoBlock type="UInt64" default_value="0" />

各 [hyperscan multi-match function](/sql-reference/functions/string-search-functions#multiMatchAny) で、すべての正規表現の合計の長さの最大値を設定します。

取り得る値:

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

クエリ:

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
この設定が適用されるのは、サーバー側でブロックを作成する場合のみです。
たとえば HTTP インターフェイス経由の INSERT では、サーバーがデータフォーマットをパースし、指定されたサイズのブロックを作成します。
一方、clickhouse-client を使用する場合、クライアント側でデータをパースするため、サーバー側の `max_insert_block_size` 設定は挿入されるブロックサイズに影響しません。
また、INSERT SELECT を使用する場合にもこの設定は有効に機能しません。これは、SELECT 実行後に形成されたブロックと同じブロックを使ってデータが挿入されるためです。

デフォルト値は `max_block_size` よりわずかに大きくなっています。これは、特定のテーブルエンジン（`*MergeTree`）が、挿入される各ブロックごとにディスク上にデータパーツを作成し、このデータパーツ自体がかなり大きな単位であるためです。同様に、`*MergeTree` テーブルは挿入時にデータをソートし、十分に大きなブロックサイズを指定することで、より多くのデータを RAM 内でソートできるようになります。

## max_insert_delayed_streams_for_parallel_write {#max_insert_delayed_streams_for_parallel_write} 

<SettingsInfoBlock type="UInt64" default_value="0" />

最終パートのフラッシュを遅延させるためのストリーム（カラム）の最大数。デフォルトは自動で、基盤ストレージが S3 などのように並列書き込みをサポートしている場合は 100、それ以外の場合は無効。

## max_insert_threads {#max_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT SELECT` クエリを実行するスレッドの最大数。

設定可能な値:

- 0 (または 1) — `INSERT SELECT` は並列実行しない。
- 正の整数。1 より大きい値。

Cloud におけるデフォルト値:

- メモリ 8 GiB のノードでは `1`
- メモリ 16 GiB のノードでは `2`
- それより大きいノードでは `4`

並列 `INSERT SELECT` が有効になるのは、`SELECT` 部分が並列実行される場合のみです。[`max_threads`](#max_threads) 設定を参照してください。
値を大きくするとメモリ使用量が増加します。

## max_joined_block_size_bytes {#max_joined_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "New setting"}]}]}/>

JOIN 結果の最大ブロックサイズ（JOIN アルゴリズムがサポートしている場合）。単位はバイト。0 を指定すると無制限になります。

## max_joined_block_size_rows {#max_joined_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN の結果に対する最大ブロックサイズ（結合アルゴリズムが対応している場合）。0 を指定すると無制限になります。

## max_limit_for_vector_search_queries {#max_limit_for_vector_search_queries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

この設定値を超える LIMIT を指定した SELECT クエリでは、ベクトル類似性インデックスを使用できません。ベクトル類似性インデックスにおけるメモリオーバーフローの発生を防ぐための設定です。

## max_local_read_bandwidth {#max_local_read_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル読み取りの最大速度（1 秒あたりのバイト数）。

## max_local_write_bandwidth {#max_local_write_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルへの書き込み速度の最大値（1 秒あたりのバイト数）。

## max_memory_usage {#max_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クラウドでのデフォルト値: レプリカのRAM容量に依存します。

単一サーバー上でクエリを実行する際に使用できるRAMの最大量です。
`0` の場合は無制限を意味します。

この設定は、利用可能なメモリ量やマシン上の総メモリ量を考慮しません。
制限は単一サーバー内の単一クエリに対して適用されます。

各クエリの現在のメモリ消費量を確認するには、`SHOW PROCESSLIST` を使用できます。
各クエリのピークメモリ消費量は追跡され、ログに書き込まれます。

次の集約関数については、`String` および `Array` 引数をとる状態に対して、
メモリ使用量が完全には追跡されません:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

メモリ消費量は、[`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
および [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage) のパラメータによっても制限されます。

## max&#95;memory&#95;usage&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

単一サーバー上で特定ユーザーのクエリを実行する際に使用できる RAM の最大量です。0 は無制限を意味します。

デフォルトでは、この量は制限されていません（`max_memory_usage_for_user = 0`）。

[`max_memory_usage`](/operations/settings/settings#max_memory_usage) の説明も参照してください。

たとえば `clickhouse_read` という名前のユーザーに対して `max_memory_usage_for_user` を 1000 バイトに設定するには、次のステートメントを使用します。

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

クライアントから一度ログアウトして再度ログインし、その後で `getSetting` 関数を使用することで、正しく動作していることを確認できます。

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth {#max_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でのデータ交換速度を、1 秒あたりのバイト数で制限します。この設定はすべてのクエリに適用されます。

設定可能な値:

- 正の整数値。
- 0 — 帯域幅制御を無効にします。

## max_network_bandwidth_for_all_users {#max_network_bandwidth_for_all_users} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でデータが転送される速度を、1 秒あたりのバイト数で制限します。この設定は、サーバー上で同時に実行されているすべてのクエリに適用されます。

指定可能な値:

- 正の整数。
- 0 — データ転送速度の制御を無効にします。

## max_network_bandwidth_for_user {#max_network_bandwidth_for_user} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク経由でのデータ交換速度を、1 秒あたりのバイト数で制限します。この設定は、1 人のユーザーによって同時に実行されるすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — データ転送速度の制御を無効にします。

## max_network_bytes {#max_network_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの実行時に、ネットワーク経由で受信または送信されるデータ量（バイト数）を制限します。この設定は各クエリごとに個別に適用されます。

設定可能な値:

- 正の整数
- 0 — データ量の制御を無効にします。

## max_number_of_partitions_for_independent_aggregation {#max_number_of_partitions_for_independent_aggregation} 

<SettingsInfoBlock type="UInt64" default_value="128" />

最適化を適用できるテーブル内パーティション数の最大値

## max_os_cpu_wait_time_ratio_to_throw {#max_os_cpu_wait_time_ratio_to_throw} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリを拒否するかどうかを判断するために用いる、OS レベルの CPU 待ち時間（OSCPUWaitMicroseconds メトリクス）とビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の比の上限。確率の計算には最小比と最大比の間での線形補間が使用され、この最大比に達した時点で確率は 1 になります。

## max_parallel_replicas {#max_parallel_replicas} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "デフォルトで最大 1000 個の並列レプリカを使用します。"}]}]}/>

クエリ実行時に、各シャードで使用される最大レプリカ数。

設定可能な値:

- 正の整数。

**補足情報**

この設定は、他の設定との組み合わせによって、異なる結果を生じる場合があります。

:::note
この設定は、結合やサブクエリが関係し、かつすべてのテーブルが特定の要件を満たしていない場合、誤った結果を生成する可能性があります。詳細については、[Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas) を参照してください。
:::

### `SAMPLE` キーを使用した並列処理

クエリは複数のサーバー上で並列に実行することで、高速に処理できる場合があります。ただし、次のような場合にはクエリのパフォーマンスが低下することがあります。

- サンプリングキーのパーティショニングキー内での位置が、効率的なレンジスキャンを行うのに適していない場合。
- テーブルにサンプリングキーを追加したことで、他の列によるフィルタリングが非効率になる場合。
- サンプリングキーが計算コストの高い式である場合。
- クラスターのレイテンシ分布にロングテールがあり、より多くのサーバーにクエリを送るほどクエリ全体のレイテンシが増加してしまう場合。

### [parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用した並列処理

この設定は、あらゆるレプリケーテッドテーブルで有用です。

## max_parser_backtracks {#max_parser_backtracks} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Limiting the complexity of parsing"}]}]}/>

パーサーがバックトラックできる最大回数（再帰下降構文解析の過程で異なる選択肢を試す回数の上限）。

## max_parser_depth {#max_parser_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

再帰下降パーサーにおける再帰処理の最大深度を制限します。スタックサイズを制御するために使用します。

取りうる値:

- 正の整数。
- 0 — 再帰深度は無制限となります。

## max_parsing_threads {#max_parsing_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "ファイルからの並列パース時のスレッド数を制御するための個別設定を追加"}]}]}/>

並列パースをサポートする入力フォーマットでデータを解析する際に使用されるスレッド数の最大値を指定します。デフォルトでは自動的に決定されます。

## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリでパーティションを削除する際の制限です。値が `0` の場合は、制限なくパーティションを削除できます。

Cloud におけるデフォルト値: 1 TB。

:::note
このクエリ設定は、対応するサーバー設定を上書きします。 [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop) を参照してください。
:::

## max_partitions_per_insert_block {#max_partitions_per_insert_block} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "1つのブロック内のパーティション数に上限を追加"}]}]}/>

単一の挿入ブロックに含めることができるパーティション数の最大値を制限し、
ブロックに含まれるパーティション数が多すぎる場合は例外をスローします。

- 正の整数。
- `0` — パーティション数は無制限。

**詳細**

データ挿入時、ClickHouse は挿入ブロック内のパーティション数を計算します。
パーティション数が `max_partitions_per_insert_block` を超える場合、
ClickHouse は `throw_on_max_partitions_per_insert_block` の設定に応じて
警告をログに記録するか、または例外をスローします。例外メッセージは次のとおりです:

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
この設定は、多数のパーティションを使用することが一般的な誤解であるために設けられた、安全性のためのしきい値です。
:::

## max_partitions_to_read {#max_partitions_to_read} 

<SettingsInfoBlock type="Int64" default_value="-1" />

1 つのクエリでアクセスできるパーティションの最大数を制限します。

テーブル作成時に指定した設定値は、クエリ単位の設定で上書きできます。

設定可能な値は次のとおりです:

- 正の整数
- `-1` - 無制限（デフォルト）

:::note
テーブルの設定で、MergeTree の設定項目 [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) を指定することもできます。
:::

## max_parts_to_move {#max_parts_to_move} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "New setting"}]}]}/>

1 回のクエリで移動できるパーツの数を制限します。0 の場合は無制限です。

## max_projection_rows_to_use_projection_index {#max_projection_rows_to_use_projection_index} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

プロジェクションインデックスから読み取る行数がこのしきい値以下の場合、ClickHouse はクエリ実行中にプロジェクションインデックスの適用を試みます。

## max_query_size {#max_query_size} 

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL パーサーが解析できるクエリ文字列の最大バイト数です。
INSERT クエリの VALUES 句内のデータは、別のストリームパーサー（RAM を O(1) しか消費しない）によって処理され、この制限の対象にはなりません。

:::note
`max_query_size` は SQL クエリ内（例: `SELECT now() SETTINGS max_query_size=10000`）では設定できません。ClickHouse はクエリを解析するためのバッファを事前に確保する必要があり、そのバッファサイズは `max_query_size` 設定によって決定されます。このため、この設定はクエリが実行される前に構成しておく必要があります。
:::

## max_read_buffer_size {#max_read_buffer_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

ファイルシステムから読み込む際に使用されるバッファの最大サイズ。

## max_read_buffer_size_local_fs {#max_read_buffer_size_local_fs} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

ローカルファイルシステムから読み込む際のバッファの最大サイズです。0 に設定すると、`max_read_buffer_size` が使用されます。

## max_read_buffer_size_remote_fs {#max_read_buffer_size_remote_fs} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートファイルシステムから読み込む際のバッファの最大サイズです。0 に設定した場合は、`max_read_buffer_size` が使用されます。

## max_recursive_cte_evaluation_depth {#max_recursive_cte_evaluation_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "再帰CTE評価の最大深度"}]}]}/>

再帰CTE評価の最大深度

## max_remote_read_network_bandwidth {#max_remote_read_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時にネットワーク経由で行うデータ交換の最大速度（バイト/秒）。

## max_remote_write_network_bandwidth {#max_remote_write_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み用にネットワーク経由でデータを送信する際の最大速度（1 秒あたりのバイト数）。

## max_replica_delay_for_distributed_queries {#max_replica_delay_for_distributed_queries} 

<SettingsInfoBlock type="UInt64" default_value="300" />

分散クエリに対して、遅延しているレプリカを除外します。 [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

秒数で設定します。レプリカのラグがこの値以上の場合、そのレプリカは使用されません。

設定可能な値は次のとおりです:

- 正の整数値。
- 0 — レプリカのラグはチェックされません。

ラグが 0 でないすべてのレプリカの使用を防ぐには、このパラメータを 1 に設定します。

レプリケーテッドテーブルを指す分散テーブルに対して `SELECT` を実行する際に使用されます。

## max_result_bytes {#max_result_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

結果のサイズ（非圧縮）をバイト単位で制限します。しきい値に達した場合、クエリはデータブロック 1 つ分の処理を終えた時点で停止しますが、
結果の最後のブロックは途中で切り捨てられないため、結果のサイズがしきい値より大きくなる場合があります。

**注意事項**

このしきい値では、メモリ上における結果サイズが考慮されます。
結果サイズ自体が小さくても、メモリ上のより大きなデータ構造
（LowCardinality カラムの辞書や AggregateFunction カラムの Arenas など）
を参照している可能性があり、その場合は結果サイズが小さくても、しきい値を超えることがあります。

:::warning
この設定はかなり低レベルなものであり、慎重に使用する必要があります
:::

## max_result_rows {#max_result_rows} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クラウドでのデフォルト値: `0`。

結果の行数の上限を制限します。サブクエリおよび、分散クエリの一部をリモートサーバー上で実行する際にもチェックされます。
値が `0` の場合は制限が適用されません。

しきい値に達した場合、クエリはデータブロックを 1 つ処理し終えた時点で停止しますが、
結果の最後のブロックを途中で切り捨てることはないため、最終的な結果の行数は
しきい値を上回る場合があります。

## max_reverse_dictionary_lookup_cache_size_bytes {#max_reverse_dictionary_lookup_cache_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "104857600"},{"label": "新しい設定。関数 `dictGetKeys` が使用する、クエリごとの逆引き辞書ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュは、同一クエリ内で辞書を再スキャンしないように、属性値ごとにシリアル化されたキーのタプルを保存します。"}]}]}/>

関数 `dictGetKeys` が使用する、クエリごとの逆引き辞書ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュは、同一クエリ内で辞書を再スキャンしないように、属性値ごとにシリアル化されたキーのタプルを保存します。上限に達した場合、エントリは LRU 方式で削除されます。キャッシュを無効にするには 0 に設定します。

## max_rows_in_distinct {#max_rows_in_distinct} 

<SettingsInfoBlock type="UInt64" default_value="0" />

DISTINCT 使用時に許容される異なる行数の上限。

## max_rows_in_join {#max_rows_in_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

結合に使用されるハッシュテーブル内の行数を制限します。

この設定は、[SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join](/engines/table-engines/special/join) テーブルエンジンに適用されます。

クエリに複数の結合が含まれている場合、ClickHouse は各中間結果に対してこの設定を確認します。

上限に達したとき、ClickHouse は異なる動作を取ることができます。
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 設定を使用して動作を選択します。

設定可能な値:

- 正の整数。
- `0` — 行数は無制限。

## max_rows_in_set {#max_rows_in_set} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サブクエリから生成される `IN` 句のデータセットに対する行数の上限。

## max_rows_in_set_to_optimize_join {#max_rows_in_set_to_optimize_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "結合の最適化を無効化します。これは読み取り順序の最適化を妨げるためです"}]}]}/>

結合の前に、互いの行セットに基づいて結合対象のテーブルをフィルタリングする際に使用される `set` の最大サイズ。

設定可能な値:

- 0 — 無効。
- 任意の正の整数。

## max_rows_to_group_by {#max_rows_to_group_by} 

<SettingsInfoBlock type="UInt64" default_value="0" />

集約で得られる一意キーの最大数です。この設定により、
集約処理時のメモリ使用量を制限できます。

GROUP BY 中の集約によって生成される行の数（一意な GROUP BY キー）が
指定した値を超えた場合の動作は `group_by_overflow_mode` によって決まり、
デフォルトでは `throw` ですが、近似的な GROUP BY モードに切り替えることもできます。

## max_rows_to_read {#max_rows_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの実行時に、テーブルから読み取ることができる行数の最大値です。
この制限は処理されるそれぞれのデータチャンクごとにチェックされ、最下位のテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合は、リモートサーバー側でのみチェックされます。

## max_rows_to_read_leaf {#max_rows_to_read_leaf} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行する際に、リーフノード上のローカルテーブルから読み取ることができる最大行数です。分散クエリは各シャード（リーフ）に対して複数のサブクエリを発行できますが、この制限がチェックされるのはリーフノードでの読み取り段階のみであり、ルートノードでの結果マージ段階では無視されます。

例えば、2 つのシャードから成るクラスターがあり、各シャードに 100 行を含むテーブルがあるとします。両方のテーブルからすべてのデータを読み取ることを目的とした分散クエリを、設定 `max_rows_to_read=150` で実行すると、合計で 200 行になるため失敗します。一方、`max_rows_to_read_leaf=150` を指定したクエリは成功します。リーフノードごとに最大でも 100 行しか読み取られないためです。

この制限は、処理される各データチャンクごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合、動作が安定しません。
:::

## max_rows_to_sort {#max_rows_to_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ソートを行う前の最大行数です。これにより、ソート時のメモリ消費量を制限できます。
ORDER BY 操作で処理しなければならないレコード数が指定した数を超えた場合の挙動は、
`sort_overflow_mode` 設定によって決まり、デフォルト値は `throw` です。

## max_rows_to_transfer {#max_rows_to_transfer} 

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN 句が実行される際に、リモートサーバーに渡すか一時テーブルに保存できるデータの最大行数。

## max&#95;sessions&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

認証済みユーザーごとに許可される、ClickHouseサーバーへの同時セッション数の上限。

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
    <!-- ユーザーAliceは一度に1つのセッションのみでClickHouseサーバーに接続できます。 -->
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

取りうる値：

* 正の整数
* `0` - 同時セッション数が無制限（デフォルト）


## max_size_to_preallocate_for_aggregation {#max_size_to_preallocate_for_aggregation} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "より大きなテーブル向けの最適化を有効にします。"}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "パフォーマンスを最適化します。"}]}]}/>

集計前に、すべてのハッシュテーブルで事前に領域を確保することを許可する要素数の合計上限を指定します。

## max_size_to_preallocate_for_joins {#max_size_to_preallocate_for_joins} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "新しい設定です"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "大規模テーブル向けの最適化を有効にします"}]}]}/>

結合を実行する前に、すべてのハッシュテーブルを合計して何要素分の領域を事前割り当てできるかを指定します。

## max_streams_for_merge_tree_reading {#max_streams_for_merge_tree_reading} 

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定が 0 以外の値に設定されている場合、MergeTree テーブルの読み取りストリーム数を制限します。

## max_streams_multiplier_for_merge_tables {#max_streams_multiplier_for_merge_tables} 

<SettingsInfoBlock type="Float" default_value="5" />

Merge テーブルから読み取る際に、使用するストリーム数を増やします。ストリームは、Merge テーブルが参照する各テーブルに分散されます。これにより、スレッド間で作業がより均等に分配され、特にマージ対象となるテーブル同士のサイズが異なる場合に効果的です。

## max_streams_to_max_threads_ratio {#max_streams_to_max_threads_ratio} 

<SettingsInfoBlock type="Float" default_value="1" />

スレッド数より多くのソースを使用して、処理をスレッド間でより均等に分散できるようにします。これは一時的な対処であり、将来的にはソース数をスレッド数と同数に保ちつつ、各ソースが利用可能な処理を動的に選択できるようにすることが想定されています。

## max_subquery_depth {#max_subquery_depth} 

<SettingsInfoBlock type="UInt64" default_value="100" />

クエリ内のネストされたサブクエリの数が、指定された値を超えた場合に
例外をスローします。

:::tip
これにより、クラスタのユーザーが過度に複雑なクエリを書くことを防ぐための
健全性チェックとして機能します。
:::

## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時にテーブルを削除する際の制限を設定します。値 `0` は、制限なしにすべてのテーブルを削除できることを意味します。

ClickHouse Cloud でのデフォルト値: 1 TB。

:::note
このクエリ設定はサーバー設定の同名パラメータを上書きします。詳細は [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop) を参照してください。
:::

## max_temporary_columns {#max_temporary_columns} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの実行時に、定数カラムを含めて同時に RAM 内に保持する必要がある一時カラム数の最大値です。クエリの中間計算の結果としてメモリ内に生成される一時カラム数がこの値を超えた場合、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリの実行を防ぐのに役立ちます。
:::

`0` の場合は無制限を意味します。

## max_temporary_data_on_disk_size_for_query {#max_temporary_data_on_disk_size_for_query} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行中のすべてのクエリで、ディスク上の一時ファイルにより消費されるデータ量の上限（バイト単位）。

可能な値:

- 正の整数
- `0` — 無制限（デフォルト）

## max_temporary_data_on_disk_size_for_user {#max_temporary_data_on_disk_size_for_user} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行されているすべてのユーザークエリに対し、ディスク上の一時ファイルによるデータ使用量の上限（バイト単位）。

設定可能な値:

- 正の整数。
- `0` — 無制限（デフォルト）

## max_temporary_non_const_columns {#max_temporary_non_const_columns} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`max_temporary_columns` と同様に、クエリ実行時に同時に RAM 内に保持しておく必要がある一時カラムの最大数ですが、定数カラムは数えません。

:::note
クエリ実行時には定数カラムはかなり頻繁に生成されますが、ほとんど計算リソースを消費しません。
:::

## max_threads {#max_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

クエリ処理スレッドの最大数を指定します。リモートサーバーからデータを取得するためのスレッドは含みません（`max_distributed_connections` パラメータを参照）。

このパラメータは、クエリ処理パイプラインの同一ステージを並列に実行するスレッドに適用されます。
たとえばテーブルから読み込む際に、関数による式の評価、WHERE でのフィルタ処理、および GROUP BY のための事前集約を、少なくとも `max_threads` 個のスレッドを用いて並列に実行できる場合は、`max_threads` の値だけスレッドが使用されます。

LIMIT によりすぐに完了するクエリでは、`max_threads` を小さく設定できます。たとえば、必要な件数のエントリがそれぞれのブロック内に存在し、`max_threads = 8` の場合、実際には 1 ブロックを読むだけで十分であっても 8 ブロックが読み込まれます。

`max_threads` の値を小さくするほど、消費メモリ量は少なくなります。

ClickHouse Cloud におけるデフォルト値: `auto(3)`

## max_threads_for_indexes {#max_threads_for_indexes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

インデックス処理に使用されるスレッド数の上限。

## max_untracked_memory {#max_untracked_memory} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

小さなメモリアロケーションおよび解放はスレッドローカル変数で集約され、（絶対値での）合計量が指定された値を超えた場合にのみ追跡またはプロファイルされます。指定した値が `memory_profiler_step` より大きい場合は、実質的に `memory_profiler_step` の値に引き下げられます。

## memory_overcommit_ratio_denominator {#memory_overcommit_ratio_denominator} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "メモリのオーバーコミット機能をデフォルトで有効化"}]}]}/>

グローバルなハードリミットに到達したときのソフトメモリ上限を表します。
この値は、クエリのオーバーコミット比率を計算するために使用されます。
ゼロの場合はクエリをスキップします。
詳細は[メモリのオーバーコミット](memory-overcommit.md)を参照してください。

## memory_overcommit_ratio_denominator_for_user {#memory_overcommit_ratio_denominator_for_user} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "メモリのオーバーコミット機能をデフォルトで有効化"}]}]}/>

ユーザーレベルでハードリミットに達したときに適用されるソフトメモリ上限を表します。
この値は、クエリごとのオーバーコミット率を計算するために使用されます。
値が 0 の場合、そのクエリはスキップされます。
詳細は、[メモリのオーバーコミット](memory-overcommit.md)を参照してください。

## memory_profiler_sample_max_allocation_size {#memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`memory_profiler_sample_probability` に等しい確率で、サイズが指定した値以下であるメモリアロケーションをランダムに収集します。0 は無効を意味します。このしきい値が期待どおりに動作するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_min_allocation_size {#memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

指定した値以上のサイズのメモリアロケーションを、`memory_profiler_sample_probability` に等しい確率でランダムに収集します。0 に設定すると無効になります。このしきい値が意図したとおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_probability {#memory_profiler_sample_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

ランダムに選択したメモリの割り当ておよび解放を収集し、それらを `system.trace_log` に `trace_type` として `MemorySample` で書き込みます。確率は、割り当てサイズに関係なく、すべての alloc/free に対して適用されます（`memory_profiler_sample_min_allocation_size` および `memory_profiler_sample_max_allocation_size` で変更できます）。サンプリングは、未追跡メモリ量が `max_untracked_memory` を超えたときにのみ行われる点に注意してください。より細かい粒度でサンプリングを行いたい場合は、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_step {#memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

メモリプロファイラのステップ幅（しきい値間隔）をバイト単位で設定します。クエリのメモリ使用量が、各ステップのしきい値を超えるたびに、メモリプロファイラは割り当て元のスタックトレースを収集し、それを [trace_log](/operations/system-tables/trace_log) に書き込みます。

設定可能な値:

- 正の整数（バイト数）。

- 0 の場合、メモリプロファイラを無効にします。

## memory_tracker_fault_probability {#memory_tracker_fault_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

例外安全性のテストのために、指定した確率でメモリを割り当てるたびに例外をスローします。

## memory_usage_overcommit_max_wait_microseconds {#memory_usage_overcommit_max_wait_microseconds} 

<SettingsInfoBlock type="UInt64" default_value="5000000" />

ユーザーレベルでメモリのオーバーコミットが発生した場合に、メモリが解放されるまでスレッドが待機する最大時間です。
タイムアウトに達してもメモリが解放されない場合、例外がスローされます。
詳細については、[メモリのオーバーコミット](memory-overcommit.md)を参照してください。

## merge_table_max_tables_to_look_for_schema_inference {#merge_table_max_tables_to_look_for_schema_inference} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

`Merge` テーブルを明示的なスキーマを指定せずに作成する場合、または `merge` テーブル関数を使用する場合、スキーマは一致するテーブルのうち最大で指定された数のテーブルを対象として、その和集合として推論されます。
テーブル数がそれより多い場合、スキーマは最初の指定された数のテーブルから推論されます。

## merge_tree_coarse_index_granularity {#merge_tree_coarse_index_granularity} 

<SettingsInfoBlock type="UInt64" default_value="8" />

データを検索する際、ClickHouse はインデックスファイル内のデータマークをチェックします。必要なキーがある範囲内に存在すると判断すると、その範囲を `merge_tree_coarse_index_granularity` 個のサブレンジに分割し、その中で必要なキーを再帰的に検索します。

設定可能な値:

- 正の偶数である任意の整数値。

## merge_tree_compact_parts_min_granules_to_multibuffer_read {#merge_tree_compact_parts_min_granules_to_multibuffer_read} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

ClickHouse Cloud でのみ有効です。MergeTree テーブルのコンパクトパートのストライプ内に含まれる granule の数を指定し、この値に基づいて並列読み取りとプリフェッチをサポートするマルチバッファリーダーを使用します。リモートファイルシステムから読み取る場合、マルチバッファリーダーの使用により読み取り要求数が増加します。

## merge_tree_determine_task_size_by_prewhere_columns {#merge_tree_determine_task_size_by_prewhere_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

読み取りタスクのサイズを決定する際に、prewhere 列のサイズのみを使用するかどうかを制御します。

## merge_tree_max_bytes_to_use_cache {#merge_tree_max_bytes_to_use_cache} 

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

ClickHouse が 1 つのクエリで `merge_tree_max_bytes_to_use_cache` バイトを超えて読み込む必要がある場合、非圧縮ブロックのキャッシュは使用されません。

非圧縮ブロックのキャッシュには、クエリのために抽出されたデータが保存されます。ClickHouse は、このキャッシュを使用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、多量のデータを読み込むクエリによってキャッシュが無駄に消費されるのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定は、非圧縮ブロックのキャッシュのサイズを設定します。

可能な値:

- 任意の正の整数。

## merge_tree_max_rows_to_use_cache {#merge_tree_max_rows_to_use_cache} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ClickHouse が 1 回のクエリで `merge_tree_max_rows_to_use_cache` 行を超えて読み取る場合、非圧縮ブロックキャッシュは使用されません。

非圧縮ブロックキャッシュには、クエリ用に抽出されたデータが保存されます。ClickHouse は、このキャッシュを利用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、大量のデータを読み取るクエリによってキャッシュが無駄に占有されることを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定は、非圧縮ブロックキャッシュのサイズを定義します。

設定可能な値:

- 任意の正の整数。

## merge_tree_min_bytes_for_concurrent_read {#merge_tree_min_bytes_for_concurrent_read} 

<SettingsInfoBlock type="UInt64" default_value="251658240" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルにおいて、1 つのファイルから読み取るバイト数が `merge_tree_min_bytes_for_concurrent_read` を超える場合、ClickHouse はこのファイルを複数スレッドで並行して読み込もうとします。

設定可能な値:

- 正の整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem {#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み取る際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが読み取りを並列化できるようになるために、1つのファイルから読み取る必要がある最小バイト数です。この設定の使用は推奨されません。

使用可能な値:

- 正の整数。

## merge_tree_min_bytes_for_seek {#merge_tree_min_bytes_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の距離が `merge_tree_min_bytes_for_seek` バイト未満の場合、ClickHouse は両方のブロックを含むファイルの範囲を連続して読み取り、追加のシークを回避します。

取りうる値:

- 任意の正の整数値。

## merge_tree_min_bytes_per_task_for_remote_reading {#merge_tree_min_bytes_per_task_for_remote_reading} 

**別名**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "値は `filesystem_prefetch_min_bytes_for_single_read_task` と統一されています"}]}]}/>

各タスクで読み取る最小バイト数。

## merge_tree_min_read_task_size {#merge_tree_min_read_task_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "New setting"}]}]}/>

タスクサイズの厳密な下限値です（グラニュール数が少なく、利用可能なスレッド数が多い場合でも、この値より小さいタスクは割り当てません）。

## merge_tree_min_rows_for_concurrent_read {#merge_tree_min_rows_for_concurrent_read} 

<SettingsInfoBlock type="UInt64" default_value="163840" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのファイルから読み取る行数が `merge_tree_min_rows_for_concurrent_read` を超えると、ClickHouse はこのファイルを複数スレッドで並行して読み取ろうとします。

取りうる値:

- 正の整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem {#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み込む際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが読み取りを並列化できるようになるために、1 つのファイルから読み込む必要がある最小行数です。この設定の使用は推奨されません。

設定可能な値:

- 正の整数

## merge_tree_min_rows_for_seek {#merge_tree_min_rows_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の行数の差が `merge_tree_min_rows_for_seek` 行未満の場合、ClickHouse はファイル内をシークせず、データを連続して読み込みます。

指定可能な値:

- 任意の正の整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability {#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "`PartsSplitter` のテスト用。指定された確率で、MergeTree から読み取るたびに読み取り範囲を交差するものと交差しないものに分割します。"}]}]}/>

`PartsSplitter` のテスト用。指定された確率で、MergeTree から読み取るたびに読み取り範囲を交差するものと交差しないものに分割します。

## merge_tree_storage_snapshot_sleep_ms {#merge_tree_storage_snapshot_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でのストレージスナップショットの一貫性をデバッグするための新しい設定"}]}]}/>

MergeTree テーブルのストレージスナップショットを作成する際に、ミリ秒単位の意図的な遅延を挿入します。
テストおよびデバッグの目的でのみ使用します。

取りうる値:

- 0 - 遅延なし（デフォルト）
- N - ミリ秒単位の遅延

## merge_tree_use_const_size_tasks_for_remote_reading {#merge_tree_use_const_size_tasks_for_remote_reading} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートテーブルからの読み取りに一定サイズのタスクを使用するかどうかを制御します。

## merge_tree_use_deserialization_prefixes_cache {#merge_tree_use_deserialization_prefixes_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree におけるデシリアライズ用プレフィックスキャッシュの使用を制御するための新しい設定"}]}]}/>

MergeTree でリモートディスクから読み込む際に、ファイルプレフィックスから取得される列メタデータをキャッシュします。

## merge_tree_use_prefixes_deserialization_thread_pool {#merge_tree_use_prefixes_deserialization_thread_pool} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree におけるプレフィックスの並列デシリアライズでスレッドプールを使用するかどうかを制御する新しい設定"}]}]}/>

MergeTree の Wide パーツにおけるプレフィックスの並列読み取りでスレッドプールの使用を有効化します。このスレッドプールのサイズは、サーバー設定 `max_prefixes_deserialization_thread_pool_size` によって制御されます。

## merge_tree_use_v1_object_and_dynamic_serialization {#merge_tree_use_v1_object_and_dynamic_serialization} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "JSON 型および Dynamic 型向けの新しいシリアライゼーション V2 バージョンを追加"}]}]}/>

有効にすると、MergeTree では JSON 型および Dynamic 型に対して V2 ではなく V1 のシリアライゼーションバージョンが使用されます。この設定の変更は、サーバーの再起動後にのみ反映されます。

## metrics_perf_events_enabled {#metrics_perf_events_enabled} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、クエリの実行中を通して一部の perf イベントが計測されます。

## metrics_perf_events_list {#metrics_perf_events_list} 

クエリ実行中に計測する perf メトリクスをカンマ区切りで指定するリストです。空の場合は、すべてのイベントが対象になります。利用可能なイベントについては、ソースコード中の PerfEventInfo を参照してください。

## min_bytes_to_use_direct_io {#min_bytes_to_use_direct_io} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ストレージディスクに対して direct I/O アクセスを使用する際に必要となる最小データ量です。

ClickHouse はテーブルからデータを読み取る際にこの設定を使用します。読み取るすべてのデータの合計容量が `min_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は `O_DIRECT` オプションを使用してストレージディスクからデータを読み取ります。

設定可能な値:

- 0 — direct I/O を無効にする。
- 正の整数。

## min_bytes_to_use_mmap_io {#min_bytes_to_use_mmap_io} 

<SettingsInfoBlock type="UInt64" default_value="0" />

これは実験的な設定です。カーネルからユーザ空間へのデータコピーを行わずに大きなファイルを読み込む際に使用する、最小メモリ量を設定します。推奨されるしきい値は約 64 MB です。これは [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) が低速であるためです。大きなファイルに対してのみ有効であり、データがページキャッシュ上に存在する場合にのみ効果があります。

可能な値:

- 正の整数。
- 0 — 大きなファイルは、カーネルからユーザ空間へのデータコピーのみを用いて読み込まれます。

## min_chunk_bytes_for_parallel_parsing {#min_chunk_bytes_for_parallel_parsing} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- 型: unsigned int
- デフォルト値: 1 MiB

各スレッドが並列に解析するチャンクの最小サイズ（バイト単位）。

## min_compress_block_size {#min_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルに適用されます。クエリ処理時のレイテンシを削減するため、次のマークを書き込む際に、そのサイズが `min_compress_block_size` 以上であればブロックは圧縮されます。デフォルトは 65,536 です。

実際のブロックサイズは、非圧縮データが `max_compress_block_size` 未満である場合、この値以上であり、かつ 1 つのマークに対応するデータ量以上になります。

例を見てみましょう。テーブル作成時に `index_granularity` を 8192 に設定したとします。

UInt32 型のカラム（1 値あたり 4 バイト）を書き込むとします。8192 行を書き込むと、合計で 32 KB のデータになります。`min_compress_block_size = 65,536` なので、2 つのマークごとに 1 つの圧縮ブロックが形成されます。

String 型の URL カラム（平均サイズは 1 値あたり 60 バイト）を書き込むとします。8192 行を書き込むと、平均して 500 KB 弱のデータになります。これは 65,536 より大きいため、各マークごとに 1 つの圧縮ブロックが形成されます。この場合、ディスクから単一マークの範囲のデータを読み込むときに、余分なデータを伸長する必要はありません。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更すべきではありません。
:::

## min_count_to_compile_aggregate_expression {#min_count_to_compile_aggregate_expression} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同一の集約式に対して JIT コンパイルを開始するための最小個数です。[compile_aggregate_expressions](#compile_aggregate_expressions) 設定が有効な場合にのみ機能します。

設定可能な値:

- 正の整数。
- 0 — 同一の集約式は常に JIT コンパイルされます。

## min_count_to_compile_expression {#min_count_to_compile_expression} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同じ式がコンパイル対象となるまでに必要な、その式の最小実行回数。

## min_count_to_compile_sort_description {#min_count_to_compile_sort_description} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同一のソート記述が JIT コンパイルされるまでに必要な回数

## min_execution_speed {#min_execution_speed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの行数で表される最小実行速度です。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
の制限時間が経過するたびに、各データブロックごとにチェックされます。実行速度がこの値より低い場合、例外がスローされます。

## min_execution_speed_bytes {#min_execution_speed_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最小実行バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が満了するたびに、すべてのデータブロックでチェックされます。実行速度がこれを下回る場合、例外がスローされます。

## min_external_table_block_size_bytes {#min_external_table_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを指定したバイト数のサイズになるようにまとめます。"}]}]}/>

ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを指定したバイト数のサイズになるようにまとめます。

## min_external_table_block_size_rows {#min_external_table_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "外部テーブルに渡されるブロックが十分な大きさでない場合、指定した行数にまとめる"}]}]}/>

外部テーブルに渡されるブロックが十分な大きさでない場合、指定した行数にまとめます。

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを許可しつつ、INSERT によって使用されずに維持される空きディスク容量（バイト数）を確保します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

INSERT を実行する際に必要な最小の空きディスク容量（バイト数）。

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを引き続き許可しつつ、INSERT によって消費されないように保持しておく空きディスク容量を、総ディスク容量に対する比率で指定します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

INSERT を実行する際に必要となる最小の空きディスク容量の比率です。

## min_free_disk_space_for_temporary_data {#min_free_disk_space_for_temporary_data} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部ソートおよび集約で使用される一時データを書き込む際に、確保しておく必要がある最小のディスク空き容量。

## min_hit_rate_to_use_consecutive_keys_optimization {#min_hit_rate_to_use_consecutive_keys_optimization} 

<SettingsInfoBlock type="Float" default_value="0.5" />

集約処理において連続キー最適化に使用されるキャッシュの最小ヒット率。この値以上である限り、最適化は有効のまま維持されます。

## min_insert_block_size_bytes {#min_insert_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

`INSERT` クエリによってテーブルに挿入できるブロックの最小バイト数を設定します。これより小さいサイズのブロックは、より大きなブロックにまとめられます。

設定可能な値:

- 正の整数。
- 0 — まとめ処理を無効にします。

## min_insert_block_size_bytes_for_materialized_views {#min_insert_block_size_bytes_for_materialized_views} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリによってテーブルに挿入できるブロックの最小バイト数を設定します。より小さいサイズのブロックは、より大きなブロックにまとめられます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、マテリアライズドビューへの書き込み時のブロックのまとめ方を制御し、過剰なメモリ使用量を回避できます。

可能な値:

- 任意の正の整数。
- 0 — ブロックのまとめ処理を無効にします。

**参照**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows {#min_insert_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

`INSERT` クエリでテーブルに挿入できるブロック内の最小行数を設定します。より小さいブロックは、より大きなブロックにまとめられます。

設定可能な値:

- 正の整数。
- 0 — まとめ処理を無効にします。

## min_insert_block_size_rows_for_materialized_views {#min_insert_block_size_rows_for_materialized_views} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリでテーブルに挿入できるブロック内の最小行数を設定します。より小さいブロックは、より大きなブロックにまとめられます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、マテリアライズドビューへの書き込み時のブロックのまとめ方を制御し、過剰なメモリ使用を回避できます。

取りうる値:

- 任意の正の整数。
- 0 — まとめ処理を無効にする。

**参照**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes {#min_joined_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "新しい設定。"}]}]}/>

JOIN の入力および出力ブロック（JOIN アルゴリズムがサポートしている場合）に対する最小ブロックサイズ（バイト単位）。小さいブロックはまとめられます。0 を指定すると無制限を意味します。

## min_joined_block_size_rows {#min_joined_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

JOIN の入力および出力ブロックに対する行数単位の最小ブロックサイズ（JOIN アルゴリズムがこれをサポートする場合）。小さいブロックはまとめられます。0 は無制限を意味します。

## min_os_cpu_wait_time_ratio_to_throw {#min_os_cpu_wait_time_ratio_to_throw} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリを拒否するかどうかを判断する際に使用される、OS の CPU 待機時間（`OSCPUWaitMicroseconds` メトリクス）とビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）の最小比率。拒否確率の計算には、最小比率と最大比率の間の線形補間が使用され、この比率では確率は 0 になります。

## min_outstreams_per_resize_after_split {#min_outstreams_per_resize_after_split} 

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "New setting."}]}]}/>

パイプライン生成時に行われる分割処理の後における `Resize` または `StrictResize` プロセッサの出力ストリーム数の最小値を指定します。結果として得られるストリーム数がこの値より小さい場合、分割処理は実行されません。

### Resize ノードとは

`Resize` ノードは、クエリパイプライン内でパイプラインを流れるデータストリームの本数を調整するプロセッサです。スレッドやプロセッサ間でワークロードを均等化するために、ストリーム数を増減させることができます。たとえば、クエリでより高い並列性が必要な場合、`Resize` ノードは単一のストリームを複数のストリームに分割できます。逆に、複数のストリームをより少ないストリームに統合して、データ処理を集約することもできます。

`Resize` ノードは、データブロックの構造を維持しながら、データがストリーム間で均等に分配されるようにします。これにより、リソース利用が最適化され、クエリパフォーマンスが向上します。

### Resize ノードを分割する必要がある理由

パイプライン実行中、集中ハブとなっている `Resize` ノードの ExecutingGraph::Node::status_mutex に対して、特にコア数の多い環境では激しい競合が発生し、この競合により次の問題が生じます。

1. ExecutingGraph::updateNode のレイテンシが増加し、クエリ性能に直接悪影響を与える。
2. スピンロックでの競合（native_queued_spin_lock_slowpath）によって過剰な CPU サイクルが消費され、効率が低下する。
3. CPU 利用率が低下し、並列実行性とスループットが制限される。

### Resize ノードが分割される仕組み

1. 出力ストリーム数を確認し、分割を実行できるかどうかを検証します。具体的には、各分割後のプロセッサの出力ストリーム数が `min_outstreams_per_resize_after_split` の閾値以上である必要があります。
2. `Resize` ノードは、同一のポート数を持つ複数の小さな `Resize` ノードに分割され、それぞれが入力・出力ストリームの一部を担当します。
3. 各グループは独立して処理されるため、ロック競合が軽減されます。

### 任意の入力／出力を持つ Resize ノードの分割

入力／出力の数が分割後の `Resize` ノード数で割り切れない場合には、一部の入力を `NullSource` に、一部の出力を `NullSink` に接続します。これにより、全体のデータフローに影響を与えることなく分割を行うことができます。

### この設定の目的

`min_outstreams_per_resize_after_split` 設定は、`Resize` ノードの分割が十分な効果を持つようにし、ストリーム数が少なすぎる状態になることを防ぐためのものです。ストリーム数が少なすぎると並列処理の効率が低下する可能性があります。出力ストリームの最小数を強制することで、この設定は並列性とオーバーヘッドのバランスを維持し、ストリームの分割やマージを伴うシナリオにおけるクエリ実行を最適化します。

### 設定の無効化

`Resize` ノードの分割を無効にするには、この設定値を 0 にします。これにより、パイプライン生成中に `Resize` ノードが分割されることがなくなり、より小さなノードに分割されず元の構造を保持できるようになります。

## min_table_rows_to_use_projection_index {#min_table_rows_to_use_projection_index} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

テーブルから読み取る行数の推定値がこのしきい値以上の場合、クエリ実行中に ClickHouse はプロジェクションインデックスを使用しようとします。

## mongodb_throw_on_unsupported_query {#mongodb_throw_on_unsupported_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

有効にすると、MongoDB テーブルは MongoDB クエリを構築できない場合にエラーを返します。無効にすると、ClickHouse はテーブル全体を読み取り、ローカルで処理します。このオプションは `allow_experimental_analyzer=0` のときには適用されません。

## move_all_conditions_to_prewhere {#move_all_conditions_to_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 句から PREWHERE 句へ、適用可能なすべての条件を移動します

## move_primary_key_columns_to_end_of_prewhere {#move_primary_key_columns_to_end_of_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

PRIMARY KEY 列を含む PREWHERE 条件を、AND で連結された条件の末尾へ移動します。これらの条件は主キー解析の段階で考慮される可能性が高く、そのため PREWHERE によるフィルタリング効果はそれほど大きくありません。

## multiple_joins_try_to_keep_original_names {#multiple_joins_try_to_keep_original_names} 

<SettingsInfoBlock type="Bool" default_value="0" />

複数の JOIN を書き換える際に、トップレベルの式リストにエイリアスを追加しない

## mutations_execute_nondeterministic_on_initiator {#mutations_execute_nondeterministic_on_initiator} 

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、定数である非決定的関数（例: 関数 `now()`）はイニシエータ側で実行され、`UPDATE` および `DELETE` クエリ内ではリテラルに置き換えられます。これにより、定数の非決定的関数を用いたミューテーションを実行する際に、レプリカ間のデータを同期した状態に保つのに役立ちます。デフォルト値: `false`。

## mutations_execute_subqueries_on_initiator {#mutations_execute_subqueries_on_initiator} 

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、スカラーサブクエリはイニシエーター側で実行され、`UPDATE` および `DELETE` クエリ内でリテラルに置き換えられます。デフォルト値: `false`。

## mutations_max_literal_size_to_replace {#mutations_max_literal_size_to_replace} 

<SettingsInfoBlock type="UInt64" default_value="16384" />

`UPDATE` および `DELETE` クエリで置換対象となる、シリアル化されたリテラル値の最大サイズ（バイト単位）。この設定は、上記 2 つの設定のうち少なくとも 1 つが有効になっている場合にのみ適用されます。デフォルト値は 16384 (16 KiB) です。

## mutations_sync {#mutations_sync} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` クエリ（[mutation](../../sql-reference/statements/alter/index.md/#mutations)）を同期的に実行するかどうかを制御します。

設定可能な値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | mutation を非同期で実行します。                                                                                                                       |
| `1`   | クエリは、現在のサーバー上のすべての mutation が完了するまで待機します。                                                                              |
| `2`   | クエリは、すべてのレプリカ（存在する場合）での mutation が完了するまで待機します。                                                                    |
| `3`   | クエリはアクティブなレプリカのみを待機します。`SharedMergeTree` でのみサポートされます。`ReplicatedMergeTree` では `mutations_sync = 2` と同じ動作になります。|

## mysql_datatypes_support_level {#mysql_datatypes_support_level} 

MySQL の型が対応する ClickHouse の型にどのように変換されるかを定義します。`decimal`、`datetime64`、`date2Date32`、`date2String` を任意に組み合わせて指定するカンマ区切りのリストです。

- `decimal`: 精度が許す場合に `NUMERIC` および `DECIMAL` 型を `Decimal` に変換します。
- `datetime64`: 精度が `0` でない場合に `DATETIME` および `TIMESTAMP` 型を `DateTime` ではなく `DateTime64` に変換します。
- `date2Date32`: `DATE` を `Date` ではなく `Date32` に変換します。`date2String` より優先されます。
- `date2String`: `DATE` を `Date` ではなく `String` に変換します。`datetime64` によって上書きされます。

## mysql_map_fixed_string_to_text_in_show_columns {#mysql_map_fixed_string_to_text_in_show_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse を BI ツールに接続するための設定作業を軽減します。"}]}]}/>

有効にすると、[FixedString](../../sql-reference/data-types/fixedstring.md) ClickHouse データ型は、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) で `TEXT` として表示されます。

MySQL ワイヤープロトコル経由の接続時にのみ有効です。

- 0 - `BLOB` を使用。
- 1 - `TEXT` を使用。

## mysql_map_string_to_text_in_show_columns {#mysql_map_string_to_text_in_show_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse を BI ツールに接続する際の設定作業を軽減します。"}]}]}/>

有効にすると、ClickHouse の [String](../../sql-reference/data-types/string.md) データ型は、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) で `TEXT` として表示されます。

MySQL ワイヤプロトコル経由で接続された場合にのみ有効です。

- 0 - `BLOB` を使用。
- 1 - `TEXT` を使用。

## mysql_max_rows_to_insert {#mysql_max_rows_to_insert} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL ストレージエンジンでのバッチ挿入における最大行数

## network_compression_method {#network_compression_method} 

<SettingsInfoBlock type="String" default_value="LZ4" />

クライアント/サーバー間およびサーバー間通信を圧縮するためのコーデック。

指定可能な値は次のとおりです:

- `NONE` — 圧縮しない。
- `LZ4` — LZ4 コーデックを使用する。
- `LZ4HC` — LZ4HC コーデックを使用する。
- `ZSTD` — ZSTD コーデックを使用する。

**関連項目**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level {#network_zstd_compression_level} 

<SettingsInfoBlock type="Int64" default_value="1" />

ZSTD 圧縮のレベルを調整します。[network_compression_method](#network_compression_method) が `ZSTD` に設定されている場合にのみ使用されます。

可能な値:

- 1 から 15 までの正の整数

## normalize_function_names {#normalize_function_names} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "関数名をカノニカルな名前に正規化します。これはプロジェクションクエリのルーティングのために必要となりました"}]}]}/>

関数名をカノニカルな名前に正規化します

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ミューテーション対象のテーブルに未完了のミューテーションがこの数以上存在する場合、テーブルのミューテーションを意図的に遅延させます。0 の場合は無効です。

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ミューテーション対象のテーブルに、未完了のミューテーションがこの値以上ある場合に「Too many mutations ...」例外をスローします。0 の場合は無効です。

## odbc_bridge_connection_pool_size {#odbc_bridge_connection_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC ブリッジにおいて、各接続設定文字列ごとの接続プールサイズ。

## odbc_bridge_use_connection_pooling {#odbc_bridge_use_connection_pooling} 

<SettingsInfoBlock type="Bool" default_value="1" />

ODBC ブリッジでコネクションプーリングを使用します。`false` に設定すると、その都度新しい接続が確立されます。

## offset

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで行の返却を開始する前にスキップする行数を設定します。[OFFSET](/sql-reference/statements/select/offset) 句で設定されたオフセットに対して調整を行い、この 2 つの値が合算されるようにします。

指定可能な値:

* 0 — 行をスキップしません。
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

（親の [trace context](https://www.w3.org/TR/trace-context/) が渡されていない場合に）ClickHouse が実行されたクエリに対してトレースを開始できる確率を設定します。

指定可能な値:

- 0 — （親の trace context が渡されていない場合に）すべての実行されたクエリに対するトレースを無効にします。
- [0..1] の範囲の正の浮動小数点数。たとえば設定値が `0,5` の場合、ClickHouse は平均してクエリの半分に対してトレースを開始できます。
- 1 — すべての実行されたクエリに対するトレースを有効にします。

## opentelemetry_trace_cpu_scheduling {#opentelemetry_trace_cpu_scheduling} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "`cpu_slot_preemption` 機能をトレースするための新しい設定。"}]}]}/>

ワークロードのプリエンプティブ CPU スケジューリングに関する OpenTelemetry のスパンを収集します。

## opentelemetry_trace_processors {#opentelemetry_trace_processors} 

<SettingsInfoBlock type="Bool" default_value="0" />

プロセッサ用の OpenTelemetry スパンを収集します。

## optimize_aggregation_in_order {#optimize_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルで、対応する順序でデータを集計する際の [SELECT](../../sql-reference/statements/select/index.md) クエリにおける [GROUP BY](/sql-reference/statements/select/group-by) の最適化を有効にします。

取り得る値:

- 0 — `GROUP BY` の最適化を無効にします。
- 1 — `GROUP BY` の最適化を有効にします。

**関連項目**

- [GROUP BY の最適化](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys {#optimize_aggregators_of_group_by_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT 句において、GROUP BY キーに対する min/max/any/anyLast 集約関数を除去します

## optimize_and_compare_chain {#optimize_and_compare_chain} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

`AND` チェーン内の定数を用いた比較条件を補完し、フィルタリングの効果を高めます。演算子 `<`、`<=`、`>`、`>=`、`=` およびそれらの組み合わせをサポートします。例えば、`(a < b) AND (b < c) AND (c < 5)` は `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)` となります。

## optimize_append_index {#optimize_append_index} 

<SettingsInfoBlock type="Bool" default_value="0" />

インデックス条件を追加するために[制約](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルトは `false` です。

指定可能な値:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions {#optimize_arithmetic_operations_in_aggregate_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約関数の外に算術演算を移動する

## optimize_const_name_size {#optimize_const_name_size} 

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "大きな定数をスカラー値に置き換え、名前としてハッシュを使用する（サイズは名前の長さで推定）"}]}]}/>

大きな定数をスカラー値に置き換え、名前としてハッシュを使用します（サイズは名前の長さに基づいて推定されます）。

取り得る値:

- 正の整数 — 名前の最大長,
- 0 — 常に置き換える,
- 負の整数 — 置き換えを行わない。

## optimize_count_from_files {#optimize_count_from_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

さまざまな入力フォーマットのファイルに対する行数カウント処理の最適化を有効または無効にします。テーブル関数/エンジン `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` に適用されます。

設定可能な値:

- 0 — 最適化を無効にする。
- 1 — 最適化を有効にする。

## optimize_distinct_in_order {#optimize_distinct_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

`DISTINCT` で使用される一部のカラムがソートキーの先頭部分（プレフィックス）になっている場合に、`DISTINCT` の最適化を有効にします。たとえば、MergeTree のソートキーや、`ORDER BY` 句で指定したソートキーの先頭部分などです。

## optimize_distributed_group_by_sharding_key {#optimize_distributed_group_by_sharding_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

イニシエータサーバー上でコストの高い集約処理を回避することで、`GROUP BY sharding_key` クエリを最適化します（これにより、イニシエータサーバー上でのクエリのメモリ使用量が削減されます）。

次の種類のクエリがサポートされます（およびそれらのあらゆる組み合わせ）:

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

次の種類のクエリはサポートされません（一部については今後サポートが追加される可能性があります）:

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
現時点では `optimize_skip_unused_shards` が必要です。理由は、将来的にこの設定がデフォルトで有効化される可能性があり、その場合、データが Distributed テーブル経由で挿入されている、つまりデータが sharding_key に従って分散されている場合にのみ正しく動作するためです。
:::

## optimize_empty_string_comparisons {#optimize_empty_string_comparisons} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

`col = ''` や `'' = col` のような式を `empty(col)` に、`col != ''` や `'' != col` のような式を `notEmpty(col)` に変換します。ただし、`col` が `String` または `FixedString` 型の場合にのみ有効です。

## optimize_extract_common_expressions {#optimize_extract_common_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "WHERE、PREWHERE、ON、HAVING、QUALIFY の各式に対して、論理和で結合された論理積式から共通部分式を抽出して最適化します。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "WHERE、PREWHERE、ON、HAVING、QUALIFY の各式に対して、論理和で結合された論理積式から共通部分式を抽出して最適化するための設定を導入します。"}]}]}/>

WHERE、PREWHERE、ON、HAVING、QUALIFY の各式において、論理和から共通部分式を抽出できるようにします。`(A AND B) OR (A AND C)` のような論理式は `A AND (B OR C)` の形に書き換えることができ、次の点で有利になる可能性があります:

- 単純なフィルタリング式でのインデックス利用
- CROSS JOIN を INNER JOIN に変換する最適化

## optimize_functions_to_subcolumns {#optimize_functions_to_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "デフォルトで有効な設定"}]}]}/>

一部の関数をサブカラムの読み取りに変換することで、最適化を有効または無効にします。これにより、読み取るデータ量を削減できます。

次の関数が変換の対象になります:

- [length](/sql-reference/functions/array-functions#length) — [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み取ります。
- [empty](/sql-reference/functions/array-functions#empty) — [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み取ります。
- [notEmpty](/sql-reference/functions/array-functions#notEmpty) — [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み取ります。
- [isNull](/sql-reference/functions/functions-for-nulls#isNull) — [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み取ります。
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) — [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み取ります。
- [count](/sql-reference/aggregate-functions/reference/count) — [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み取ります。
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapkeys) — [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムを読み取ります。
- [mapValues](/sql-reference/functions/tuple-map-functions#mapvalues) — [values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムを読み取ります。

設定値:

- 0 — 最適化を無効にします。
- 1 — 最適化を有効にします。

## optimize_group_by_constant_keys {#optimize_group_by_constant_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "デフォルトで定数キーを用いた GROUP BY を最適化"}]}]}/>

ブロック内のすべてのキーが定数値である場合に GROUP BY を最適化します

## optimize_group_by_function_keys {#optimize_group_by_function_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

GROUP BY 句内における他のキーへの関数適用を除去します

## optimize_if_chain_to_multiif {#optimize_if_chain_to_multiif} 

<SettingsInfoBlock type="Bool" default_value="0" />

if(cond1, then1, if(cond2, ...)) のチェーンを multiIf に置き換えます。現時点では数値型に対してはメリットがありません。

## optimize_if_transform_strings_to_enum {#optimize_if_transform_strings_to_enum} 

<SettingsInfoBlock type="Bool" default_value="0" />

`If` および `Transform` 内の文字列型引数を `enum` に置き換えます。分散クエリで一貫性のない変更が発生し、クエリが失敗する可能性があるため、デフォルトでは無効です。

## optimize_injective_functions_in_group_by {#optimize_injective_functions_in_group_by} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "アナライザ内の GROUP BY セクションで、単射関数をその引数に置き換える"}]}]}/>

GROUP BY セクション内の単射関数をその引数に置き換えます

## optimize_injective_functions_inside_uniq {#optimize_injective_functions_inside_uniq} 

<SettingsInfoBlock type="Bool" default_value="1" />

uniq*() 関数内にある、1 つの引数を取る単射関数を削除します。

## optimize_min_equality_disjunction_chain_length {#optimize_min_equality_disjunction_chain_length} 

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr = x1 OR ... expr = xN` という式が最適化の対象となるための最小長

## optimize_min_inequality_conjunction_chain_length {#optimize_min_inequality_conjunction_chain_length} 

<SettingsInfoBlock type="UInt64" default_value="3" />

式 `expr <> x1 AND ... expr <> xN` が最適化の対象となるための最小長

## optimize_move_to_prewhere {#optimize_move_to_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

[SELECT](../../sql-reference/statements/select/index.md) クエリにおける自動 [`PREWHERE`](../../sql-reference/statements/select/prewhere.md) 最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ動作します。

可能な値:

- 0 — 自動 `PREWHERE` 最適化を無効にします。
- 1 — 自動 `PREWHERE` 最適化を有効にします。

## optimize_move_to_prewhere_if_final {#optimize_move_to_prewhere_if_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子を含む [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、自動的な [PREWHERE](../../sql-reference/statements/select/prewhere.md) 最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ動作します。

設定可能な値:

- 0 — `FINAL` 修飾子を持つ `SELECT` クエリでの自動 `PREWHERE` 最適化を無効にします。
- 1 — `FINAL` 修飾子を持つ `SELECT` クエリでの自動 `PREWHERE` 最適化を有効にします。

**関連項目**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 設定

## optimize_multiif_to_if {#optimize_multiif_to_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

1 つだけ条件を持つ `multiIf` を `if` に置き換えます。

## optimize_normalize_count_variants {#optimize_normalize_count_variants} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "デフォルトで、意味上 count() と同等の集約関数を count() に書き換える"}]}]}/>

意味上 `count()` と同等の集約関数を `count()` に書き換えます。

## optimize&#95;on&#95;insert

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "INSERT 時のデータ最適化をデフォルトで有効にし、ユーザーエクスペリエンスを向上させる"}]}]} />

挿入前に、（テーブルエンジンに従って）このブロックに対してマージが実行されたかのようにデータ変換を行うかどうかを制御します。

取りうる値:

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

結果：

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

この設定は、[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) の動作に影響します。


## optimize_or_like_chain {#optimize_or_like_chain} 

<SettingsInfoBlock type="Bool" default_value="0" />

複数の OR LIKE を multiMatchAny に最適化します。この最適化は、場合によってはインデックスの解析を妨げるため、デフォルトでは有効化すべきではありません。

## optimize_qbit_distance_function_reads {#optimize_qbit_distance_function_reads} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

`QBit` データ型に対する距離関数を、計算に必要な列のみをストレージから読み取る同等の関数に置き換えます。

## optimize_read_in_order {#optimize_read_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルからデータを読み取る [SELECT](../../sql-reference/statements/select/index.md) クエリにおける [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) の最適化を有効にします。

設定可能な値:

- 0 — `ORDER BY` の最適化を無効にします。
- 1 — `ORDER BY` の最適化を有効にします。

**関連項目**

- [ORDER BY 句](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order {#optimize_read_in_window_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルでデータを指定された順序で読み取れるように、ウィンドウ句の ORDER BY の最適化を有効にします。

## optimize_redundant_functions_in_order_by {#optimize_redundant_functions_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="1" />

引数も ORDER BY に含まれている関数を ORDER BY から削除します

## optimize_respect_aliases {#optimize_respect_aliases} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、WHERE/GROUP BY/ORDER BY 句内のエイリアスが考慮されるようになり、パーティションプルーニング／セカンダリインデックス／optimize_aggregation_in_order／optimize_read_in_order／optimize_trivial_count の最適化に役立ちます。

## optimize_rewrite_aggregate_function_with_if {#optimize_rewrite_aggregate_function_with_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

論理的に等価である場合、引数として `if` 式を取る集約関数を書き換えます。
例えば、`avg(if(cond, col, null))` は `avgOrNullIf(cond, col)` に書き換えることができます。これにより、パフォーマンスが向上する可能性があります。

:::note
アナライザー（`enable_analyzer = 1`）使用時のみサポートされます。
:::

## optimize_rewrite_array_exists_to_has {#optimize_rewrite_array_exists_to_has} 

<SettingsInfoBlock type="Bool" default_value="0" />

`arrayExists()` 関数を、論理的に等価な場合には `has()` に書き換えます。たとえば、`arrayExists(x -> x = 1, arr)` は `has(arr, 1)` に書き換えることができます。

## optimize_rewrite_like_perfect_affix {#optimize_rewrite_like_perfect_affix} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新しい設定"}]}]}/>

完全な前方一致または後方一致の LIKE 式（例: `col LIKE 'ClickHouse%'`）を、`startsWith` や `endsWith` 関数（例: `startsWith(col, 'ClickHouse')`）の呼び出しに書き換えます。

## optimize_rewrite_regexp_functions {#optimize_rewrite_regexp_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

正規表現関連の関数をより単純で効率的な形に書き換えます

## optimize_rewrite_sum_if_to_count_if {#optimize_rewrite_sum_if_to_count_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Only available for the analyzer, where it works correctly"}]}]}/>

論理的に同値である場合、`sumIf()` 関数および `sum(if())` 関数を `countIf()` 関数に書き換えます。

## optimize_skip_merged_partitions {#optimize_skip_merged_partitions} 

<SettingsInfoBlock type="Bool" default_value="0" />

`level > 0` のパーツが 1 つだけ存在し、そのパーツに期限切れ TTL がない場合に、[OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) クエリの最適化を有効化するかどうかを制御します。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

デフォルトでは、`OPTIMIZE TABLE ... FINAL` クエリは、パーツが 1 つしかない場合でもそのパーツを再書き込みします。

設定値:

- 1 - 最適化を有効にする。
- 0 - 最適化を無効にする。

## optimize_skip_unused_shards {#optimize_skip_unused_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

`WHERE/PREWHERE` にシャーディングキー条件が含まれる [SELECT](../../sql-reference/statements/select/index.md) クエリについて、未使用シャードをスキップするかどうかを制御します（データがシャーディングキーで分散されていることを前提としており、そうでない場合はクエリ結果が不正確になります）。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## optimize_skip_unused_shards_limit {#optimize_skip_unused_shards_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

シャーディングキー値の数に対する上限。この上限に達すると、`optimize_skip_unused_shards` は無効になります。

値の数が多すぎると処理コストが大きくなりますが、その効果はあまり期待できません。`IN (...)` に非常に多くの値が含まれている場合、結局のところクエリはすべてのシャードに送信される可能性が高いためです。

## optimize_skip_unused_shards_nesting {#optimize_skip_unused_shards_nesting} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリのネストレベル（ある `Distributed` テーブルが別の `Distributed` テーブルを参照しているケース）に応じて [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) の動作を制御します（そのため、[`optimize_skip_unused_shards`](#optimize_skip_unused_shards) 自体を有効にしておく必要があります）。

可能な値:

- 0 — 無効。`optimize_skip_unused_shards` は常に動作します。
- 1 — 最初のレベルに対してのみ `optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `optimize_skip_unused_shards` を有効にします。

## optimize_skip_unused_shards_rewrite_in {#optimize_skip_unused_shards_rewrite_in} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートシャードへのクエリ内にある `IN` 述語を書き換え、そのシャードに属さない値を除外します（`optimize_skip_unused_shards` が有効である必要があります）。

可能な値:

- 0 — 無効。
- 1 — 有効。

## optimize_sorting_by_input_stream_properties {#optimize_sorting_by_input_stream_properties} 

<SettingsInfoBlock type="Bool" default_value="1" />

入力ストリームのソート特性を利用してソートを最適化する

## optimize_substitute_columns {#optimize_substitute_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

列の置換に [constraints](../../sql-reference/statements/create/table.md/#constraints) を使用します。デフォルト値は `false` です。

設定可能な値:

- true, false

## optimize&#95;syntax&#95;fuse&#95;functions

<SettingsInfoBlock type="Bool" default_value="0" />

同一の引数を持つ集約関数を統合して処理できるようにします。クエリ内に、同一の引数を持つ [sum](/sql-reference/aggregate-functions/reference/sum)、[count](/sql-reference/aggregate-functions/reference/count)、または [avg](/sql-reference/aggregate-functions/reference/avg) が 2 つ以上含まれている場合、それらを [sumCount](/sql-reference/aggregate-functions/reference/sumcount) に書き換えます。

指定可能な値:

* 0 — 同一の引数を持つ関数は統合されません。
* 1 — 同一の引数を持つ関数は統合されます。

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

デフォルトでは、`OPTIMIZE` は何も行わなかった場合でも正常終了します。この設定により、そのような状況を判別し、例外メッセージとしてその理由を取得できます。

可能な値:

- 1 — 例外をスローする。
- 0 — 例外をスローしない。

## optimize_time_filter_with_preimage {#optimize_time_filter_with_preimage} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "関数を型変換なしで等価な比較式に変換することで、Date および DateTime の述語を最適化します（例: toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'）"}]}]}/>

関数を型変換なしで等価な比較式に変換することで、Date および DateTime の述語を最適化します（例: `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`）

## optimize_trivial_approximate_count_query {#optimize_trivial_approximate_count_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

EmbeddedRocksDB など、その種の推定をサポートするストレージに対する単純な `count` クエリの最適化に、近似値を使用します。

取りうる値:

- 0 — 最適化を無効化。
   - 1 — 最適化を有効化。

## optimize_trivial_count_query {#optimize_trivial_count_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree のメタデータを使用して、`SELECT count() FROM table` のような単純なクエリを最適化するかどうかを切り替えます。行レベルセキュリティを使用する場合は、この設定を無効にしてください。

設定可能な値:

- 0 — 最適化を無効にする。
   - 1 — 最適化を有効にする。

関連項目:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select {#optimize_trivial_insert_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "多くの場合、この最適化には意味がありません。"}]}]}/>

単純な `INSERT INTO table SELECT ... FROM TABLES` クエリの最適化

## optimize_uniq_to_count {#optimize_uniq_to_count} 

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに `DISTINCT` または `GROUP BY` 句がある場合、`uniq` とその派生関数（`uniqUpTo` を除く）を `count` に変換します。

## optimize_use_implicit_projections {#optimize_use_implicit_projections} 

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` クエリのために暗黙のプロジェクションを自動的に選択します

## optimize_use_projection_filtering {#optimize_use_projection_filtering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新しい設定"}]}]}/>

SELECT クエリの実行にプロジェクションが選択されていない場合でも、パート範囲のフィルタリングにプロジェクションを使用できるようにします。

## optimize_use_projections {#optimize_use_projections} 

**別名**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` クエリを処理する際に、[projection](../../engines/table-engines/mergetree-family/mergetree.md/#projections) の最適化を有効または無効にします。

設定可能な値:

- 0 — projection の最適化を無効にします。
- 1 — projection の最適化を有効にします。

## optimize_using_constraints {#optimize_using_constraints} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの最適化に[制約](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルトは `false` です。

取りうる値:

- true, false

## os_threads_nice_value_materialized_view {#os_threads_nice_value_materialized_view} 

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

マテリアライズドビューのスレッドに対する Linux の nice 値を指定します。値が低いほど CPU の優先度が高くなります。

CAP_SYS_NICE ケイパビリティが必要で、付与されていない場合は何も行われません。

取りうる値：-20〜19。

## os_threads_nice_value_query {#os_threads_nice_value_query} 

**別名**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

クエリ処理スレッドに対する Linux の nice 値です。値が低いほど CPU の優先度は高くなります。

CAP_SYS_NICE ケーパビリティが必要であり、ない場合は効果はありません。

取り得る値: -20 ～ 19。

## output_format_compression_level {#output_format_compression_level} 

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "クエリ出力の圧縮レベルを変更できるようにする"}]}]}/>

クエリ出力が圧縮される場合のデフォルトの圧縮レベルです。`SELECT` クエリに `INTO OUTFILE` が指定されている場合、またはテーブル関数 `file`、`url`、`hdfs`、`s3`、`azureBlobStorage` へ書き込む場合に、この設定が適用されます。

設定可能な値: `1` から `22` まで

## output_format_compression_zstd_window_log {#output_format_compression_zstd_window_log} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "zstd 圧縮使用時に、クエリ出力の zstd window log を変更できるようにする"}]}]}/>

出力の圧縮方式が `zstd` の場合に使用できます。`0` より大きい値を設定すると、この設定により圧縮ウィンドウサイズ（`2` のべき乗）が明示的に指定され、zstd 圧縮の long-range モードが有効になります。これにより、より高い圧縮率を達成できる場合があります。

取りうる値: 0 以上の整数。値が小さすぎる、または大きすぎる場合、`zstdlib` は例外を送出します。典型的な値は `20`（ウィンドウサイズ = `1MB`）から `30`（ウィンドウサイズ = `1GB`）の範囲です。

## output_format_parallel_formatting {#output_format_parallel_formatting} 

<SettingsInfoBlock type="Bool" default_value="1" />

データ形式のフォーマット処理を並列実行するかどうかを切り替えます。[TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) 形式でのみサポートされます。

取りうる値:

- 1 — 有効。
- 0 — 無効。

## page_cache_block_size {#page_cache_block_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "この設定をクエリ単位で調整可能にしました。"}]}]}/>

ユーザー空間ページキャッシュに保存するファイルチャンクのサイズ（バイト単位）。キャッシュを経由するすべての読み取りは、このサイズの倍数に切り上げられます。

この設定はクエリ単位で調整できますが、異なるブロックサイズをもつキャッシュエントリは再利用できません。この設定を変更すると、事実上既存のキャッシュエントリは無効化されます。

1 MiB などの大きな値は高スループットなクエリに適しており、64 KiB などの小さな値は低レイテンシなポイントクエリに適しています。

## page_cache_inject_eviction {#page_cache_inject_eviction} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Added userspace page cache"}]}]}/>

ユーザースペースのページキャッシュがランダムに一部のページを無効化します。テスト用途向けです。

## page_cache_lookahead_blocks {#page_cache_lookahead_blocks} 

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "クエリ単位でこの設定を調整できるようにしました。"}]}]}/>

ユーザー空間ページキャッシュのミスが発生した場合、キャッシュに存在しない連続したブロックを、基盤となるストレージから最大でこの数だけ一度に読み込みます。各ブロックのサイズは page_cache_block_size バイトです。

この設定値を大きくするとスループット重視のクエリには有利ですが、低レイテンシなポイントクエリでは、先読みを行わない方が適しています。

## parallel_distributed_insert_select {#parallel_distributed_insert_select} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

分散 `INSERT ... SELECT` クエリの並列実行を有効にします。

`INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` クエリを実行する際に、両方のテーブルが同じクラスターを使用しており、かつ両方のテーブルがどちらも[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md)テーブル、またはどちらも非レプリケートテーブルである場合、このクエリは各シャード上でローカルに処理されます。

設定値:

- `0` — 無効。
- `1` — `SELECT` は distributed エンジンの基礎となるテーブルに対して、各シャード上で実行されます。
- `2` — `SELECT` と `INSERT` は distributed エンジンの基礎となるテーブルに対して/から、各シャード上で実行されます。

この設定を使用する場合は、`enable_parallel_replicas = 1` を設定する必要があります。

## parallel_hash_join_threshold {#parallel_hash_join_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定"}]}]}/>

ハッシュベースの結合アルゴリズムが適用される場合、このしきい値は（右側のテーブルのサイズを推定できる場合に限り）`hash` と `parallel_hash` のどちらを使用するかを決定するために用いられます。
右側のテーブルのサイズがこのしきい値より小さいと分かっている場合は、前者が使用されます。

## parallel_replica_offset {#parallel_replica_offset} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは内部用の設定であり、直接指定して使用することは想定されていません。「parallel replicas」モードの実装上の詳細を表します。この設定は、並列レプリカのうちクエリ処理に参加するレプリカのインデックスに対して、分散クエリのイニシエータサーバーによって自動的に設定されます。

## parallel_replicas_allow_in_with_subquery {#parallel_replicas_allow_in_with_subquery} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "true の場合、IN 述語のサブクエリはすべてのフォロワーレプリカで実行されます"}]}]}/>

true の場合、IN 述語のサブクエリはすべてのフォロワーレプリカで実行されます。

## parallel_replicas_connect_timeout_ms {#parallel_replicas_connect_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Separate connection timeout for parallel replicas queries"}]}]}/>

parallel replicas を用いたクエリ実行時に、リモートレプリカへの接続に使用されるタイムアウトをミリ秒単位で指定します。タイムアウトに達した場合、そのレプリカはクエリ実行には使用されません。

## parallel_replicas_count {#parallel_replicas_count} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは内部設定であり、直接使用することは想定されておらず、`parallel replicas` モードの実装上の詳細を表します。この設定は、分散クエリにおいてクエリ処理に参加する並列レプリカの数に応じて、イニシエーターサーバーによって自動的に設定されます。

## parallel_replicas_custom_key {#parallel_replicas_custom_key} 

<BetaBadge/>

特定のテーブルに対して、レプリカ間で処理を分割するために使用できる任意の整数式です。
値には任意の整数式を指定できます。

主キーを用いた単純な式が推奨されます。

この設定を、単一シャードかつ複数レプリカで構成されるクラスタで使用した場合、それらのレプリカは仮想シャードに変換されます。
それ以外の場合は `SAMPLE` キーと同様に動作し、各シャードの複数レプリカを使用します。

## parallel_replicas_custom_key_range_lower {#parallel_replicas_custom_key_range_lower} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "並列レプリカを動的シャードと併用する際の range フィルタの範囲を制御する設定を追加"}]}]}/>

フィルタタイプ `range` が、カスタム範囲 `[parallel_replicas_custom_key_range_lower, INT_MAX]` に基づいて、レプリカ間で処理を均等に分散できるようにします。

[parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` について、フィルタがレプリカ間で処理を均等に分散できるようになります。

注意：この設定によってクエリ処理中に追加のデータがフィルタリングされることはありません。代わりに、並列処理のために範囲フィルタが `[0, INT_MAX]` を分割する境界ポイントが変更されます。

## parallel_replicas_custom_key_range_upper {#parallel_replicas_custom_key_range_upper} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "動的シャードで parallel replicas を使用する際の range フィルタを制御する設定を追加。値 0 は上限を無効化"}]}]}/>

フィルター種別 `range` が、カスタム範囲 `[0, parallel_replicas_custom_key_range_upper]` に基づいて、レプリカ間で処理負荷を均等に分割できるようにします。値が 0 の場合は上限が無効となり、カスタムキー式の最大値が上限として使用されます。

[parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` について、レプリカ間で処理負荷を均等に分割できるようになります。

注意: この設定によってクエリ処理中に追加のデータがフィルタリングされることはなく、`[0, INT_MAX]` の範囲を並列処理のために range フィルタが分割する境界点が変わるだけです。

## parallel_replicas_for_cluster_engines {#parallel_replicas_for_cluster_engines} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "新しい設定です。"}]}]}/>

テーブル関数エンジンを、対応する `-Cluster` 版に置き換えます

## parallel_replicas_for_non_replicated_merge_tree {#parallel_replicas_for_non_replicated_merge_tree} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、ClickHouse はレプリケーションされていない MergeTree テーブルに対しても parallel replicas アルゴリズムを使用します

## parallel_replicas_index_analysis_only_on_coordinator {#parallel_replicas_index_analysis_only_on_coordinator} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "インデックス解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効な場合にのみ機能します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "インデックス解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効な場合にのみ機能します。"}]}]}/>

インデックス解析はレプリカコーディネーター上でのみ実行され、他のレプリカではスキップされます。parallel_replicas_local_plan が有効な場合にのみ機能します。

## parallel_replicas_insert_select_local_pipeline {#parallel_replicas_insert_select_local_pipeline} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "並列レプリカを用いた分散 INSERT SELECT の実行時にローカルパイプラインを使用する。現在はパフォーマンス上の問題により無効になっている"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "並列レプリカを用いた分散 INSERT SELECT の実行時にローカルパイプラインを使用する。現在はパフォーマンス上の問題により無効になっている"}]}]}/>

並列レプリカを用いた分散 INSERT SELECT の実行時にローカルパイプラインを使用する

## parallel_replicas_local_plan {#parallel_replicas_local_plan} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "並列レプリカを使用するクエリで、ローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "並列レプリカを使用するクエリで、ローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "並列レプリカを使用するクエリで、ローカルレプリカに対してローカルプランを使用する"}]}]}/>

ローカルレプリカ用のローカルプランを構築する

## parallel_replicas_mark_segment_size {#parallel_replicas_mark_segment_size} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "この設定の値は現在自動的に決定されます"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "parallel replicas コーディネーターの新実装におけるセグメントサイズを制御する設定を追加"}]}]}/>

パーツは、並列読み取りのためにレプリカ間で分散される仮想的なセグメントに分割されます。この設定は、これらのセグメントのサイズを制御します。何をしているか完全に理解している場合を除き、変更することは推奨されません。値は [128; 16384] の範囲である必要があります。

## parallel_replicas_min_number_of_rows_per_replica {#parallel_replicas_min_number_of_rows_per_replica} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで使用されるレプリカ数を、(読み取りが想定される行数 / min_number_of_rows_per_replica) に制限します。最大値は引き続き `max_parallel_replicas` によって制限されます。

## parallel_replicas_mode {#parallel_replicas_mode} 

<BetaBadge/>

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "この設定は parallel replicas 機能をベータ版とする際に導入されました"}]}]}/>

parallel replicas 用のカスタムキーに対して使用するフィルターの種類を指定します。`default` — カスタムキーに対して剰余（modulo）演算を使用します。`range` — カスタムキーの値型で取り得るすべての値を使って、カスタムキーに対するレンジフィルターを使用します。

## parallel_replicas_only_with_analyzer {#parallel_replicas_only_with_analyzer} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "並列レプリカは analyzer が有効な場合にのみサポートされます"}]}]}/>

並列レプリカを使用するには、analyzer を有効化する必要があります。analyzer が無効な場合、並列レプリカからの読み取りが有効になっていても、クエリ実行はローカル実行にフォールバックします。analyzer を有効化せずに並列レプリカを使用することはサポートされません。

## parallel_replicas_prefer_local_join {#parallel_replicas_prefer_local_join} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "true の場合に、JOIN が parallel replicas アルゴリズムで実行可能で、かつ JOIN の右側部分のすべてのストレージが *MergeTree のとき、GLOBAL JOIN の代わりにローカル JOIN が使用されます。"}]}]}/>

true の場合に、JOIN が parallel replicas アルゴリズムで実行可能で、かつ JOIN の右側部分のすべてのストレージが *MergeTree のとき、GLOBAL JOIN の代わりにローカル JOIN が使用されます。

## parallel_replicas_support_projection {#parallel_replicas_support_projection} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定。プロジェクションの最適化を並列レプリカで適用できます。parallel_replicas_local_plan が有効であり、かつ aggregation_in_order が無効な場合にのみ有効です。"}]}]}/>

プロジェクションの最適化を並列レプリカで適用できます。これは、parallel_replicas_local_plan が有効であり、かつ aggregation_in_order が無効な場合にのみ有効です。

## parallel_view_processing {#parallel_view_processing} 

<SettingsInfoBlock type="Bool" default_value="0" />

アタッチされたビューへのプッシュ処理を、順次ではなく並行して実行できるようにします。

## parallelize_output_from_storages {#parallelize_output_from_storages} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "file/url/S3 などから読み取るクエリ実行時に並列処理を許可します。行の順序が変わる可能性があります。"}]}]}/>

ストレージからの読み取りステップの出力を並列化します。可能な場合は、ストレージからの読み取り直後からクエリ処理を並列実行できるようにします。

## parsedatetime_e_requires_space_padding {#parsedatetime_e_requires_space_padding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `parseDateTime` におけるフォーマッタ `%e` では、1 桁の日付はスペースでパディングされている必要があります。たとえば `' 2'` は受け付けられますが、`'2'` はエラーになります。

## parsedatetime_parse_without_leading_zeros {#parsedatetime_parse_without_leading_zeros} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "MySQL DATE_FORMAT/STR_TO_DATE との互換性が向上"}]}]}/>

`parseDateTime` 関数では、フォーマット指定子 `%c`、`%l`、`%k` は先頭のゼロなしで月および時を解析します。

## partial_merge_join_left_table_buffer_bytes {#partial_merge_join_left_table_buffer_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 以外の場合、部分マージ結合において左テーブル側のブロックを、より大きなブロックにまとめます。結合スレッドごとに、指定されたメモリ量の最大 2 倍まで使用します。

## partial_merge_join_rows_in_right_blocks {#partial_merge_join_rows_in_right_blocks} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

部分マージ結合アルゴリズムにおける [JOIN](../../sql-reference/statements/select/join.md) クエリの右側の結合データブロックのサイズを制限します。

ClickHouse サーバーは次の処理を行います。

1.  右側の結合データを、指定された行数までのブロックに分割します。
2.  各ブロックを、その最小値と最大値でインデックス付けします。
3.  可能な場合は、準備済みブロックをディスクに書き出します。

設定可能な値:

- 任意の正の整数。推奨範囲: \[1000, 100000\]。

## partial_result_on_first_cancel {#partial_result_on_first_cancel} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリがキャンセルされた後に部分的な結果を返すことを許可します。

## parts_to_delay_insert {#parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルに、1 つのパーティション内でこの数以上のアクティブパーツが含まれている場合、テーブルへの挿入処理を意図的に遅延させます。

## parts_to_throw_insert {#parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルの1つのパーティション内でアクティブなパーツ数がこの値を超えた場合、'Too many parts ...' という例外をスローします。

## per_part_index_stats {#per_part_index_stats} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

パートごとのインデックス統計をログに記録します

## poll_interval {#poll_interval} 

<SettingsInfoBlock type="UInt64" default_value="10" />

サーバー側のクエリ待機ループで、指定された秒数だけ処理をブロックします。

## postgresql_connection_attempt_timeout {#postgresql_connection_attempt_timeout} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 接続の 'connect_timeout' パラメータを制御可能にしました。"}]}]}/>

PostgreSQL エンドポイントへの 1 回の接続試行における接続タイムアウト（秒）。
この値は接続 URL の `connect_timeout` パラメータとして渡されます。

## postgresql_connection_pool_auto_close_connection {#postgresql_connection_pool_auto_close_connection} 

<SettingsInfoBlock type="Bool" default_value="0" />

接続をプールに戻す前に接続を閉じます。

## postgresql_connection_pool_retries {#postgresql_connection_pool_retries} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL のコネクションプールにおけるリトライ回数を制御する設定です。"}]}]}/>

PostgreSQL テーブルエンジンおよびデータベースエンジンにおける、コネクションプールの push/pop のリトライ回数。

## postgresql_connection_pool_size {#postgresql_connection_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

PostgreSQL のテーブルエンジンおよびデータベースエンジンで使用する接続プールのサイズ。

## postgresql_connection_pool_wait_timeout {#postgresql_connection_pool_wait_timeout} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL テーブルエンジンおよびデータベースエンジンにおいて、接続プールが空の場合の push/pop 操作のタイムアウトです。デフォルトでは、プールが空のときブロックされたままになります。

## postgresql_fault_injection_probability {#postgresql_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定"}]}]}/>

レプリケーション用の内部 PostgreSQL クエリが失敗する、おおよその確率です。有効な値の範囲は [0.0f, 1.0f] です。

## prefer&#95;column&#95;name&#95;to&#95;alias

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの式および句の中で、エイリアスではなく元のカラム名を使用するかどうかを切り替えます。特に、エイリアスがカラム名と同じ場合に重要です。詳細は [Expression Aliases](/sql-reference/syntax#notes-on-usage) を参照してください。ClickHouse のエイリアス構文ルールを、ほとんどの他のデータベースエンジンとより互換性の高いものにするには、この設定を有効にします。

設定可能な値:

* 0 — カラム名はエイリアスで置き換えられます。
* 1 — カラム名はエイリアスで置き換えられません。

**例**

有効／無効の違い:

クエリ:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果：

```text
サーバーから例外を受信しました (バージョン 21.5.1):
コード: 184. DB::Exception: localhost:9000 から受信。DB::Exception: クエリ内で集約関数 avg(number) が別の集約関数内に検出されました: avg(number) AS number の処理中。
```

クエリ：

```sql
SET prefer_column_name_to_alias = 1;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果:

```text
┌─number─┬─max(number)─┐
│    4.5 │           9 │
└────────┴─────────────┘
```


## prefer_external_sort_block_bytes {#prefer_external_sort_block_bytes} 

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "外部ソートで使用するブロックの最大サイズを優先し、マージ時のメモリ使用量を抑えます。"}]}]}/>

外部ソートで使用するブロックの最大サイズを優先し、マージ時のメモリ使用量を抑えます。

## prefer_global_in_and_join {#prefer_global_in_and_join} 

<SettingsInfoBlock type="Bool" default_value="0" />

`IN`/`JOIN` 演算子を `GLOBAL IN`/`GLOBAL JOIN` に置き換えることを有効にします。

設定可能な値:

- 0 — 無効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられません。
- 1 — 有効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられます。

**使用方法**

`SET distributed_product_mode=global` は分散テーブルに対するクエリの挙動を変更できますが、ローカルテーブルや外部リソース由来のテーブルには適していません。ここで `prefer_global_in_and_join` 設定が役立ちます。

たとえば、分散に適さないローカルテーブルを保持しているクエリ処理ノードがあるとします。分散処理中に `GLOBAL` キーワード（`GLOBAL IN`/`GLOBAL JOIN`）を用いて、そのデータをオンザフライで分散させる必要があります。

`prefer_global_in_and_join` の別のユースケースは、外部エンジンによって作成されたテーブルへのアクセスです。この設定は、そのようなテーブルを結合する際に外部ソースへの呼び出し回数を削減するのに役立ちます。クエリあたり 1 回の呼び出しで済むようになります。

**関連項目:**

- `GLOBAL IN`/`GLOBAL JOIN` の使用方法の詳細については、[Distributed subqueries](/sql-reference/operators/in#distributed-subqueries) を参照してください。

## prefer_localhost_replica {#prefer_localhost_replica} 

<SettingsInfoBlock type="Bool" default_value="1" />

分散クエリを処理するときに、`localhost` レプリカを優先的に使用するかどうかを有効／無効にします。

設定値:

- 1 — `localhost` レプリカが存在する場合、ClickHouse は常にそのレプリカにクエリを送信します。
- 0 — ClickHouse は [load_balancing](#load_balancing) 設定で指定されたバランシング戦略を使用します。

:::note
[parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用せずに [max_parallel_replicas](#max_parallel_replicas) を使用する場合は、この設定を無効にしてください。
[parallel_replicas_custom_key](#parallel_replicas_custom_key) が設定されている場合は、複数のレプリカを含む複数のシャードからなるクラスタで使用する場合にのみ、この設定を無効にしてください。
単一シャードかつ複数レプリカのクラスタで使用する場合にこの設定を無効にすると、悪影響を及ぼします。
:::

## prefer_warmed_unmerged_parts_seconds {#prefer_warmed_unmerged_parts_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ有効です。マージ済みパーツがこの値（秒）より新しく、かつ事前ウォームされていない場合（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）、ただしその元となるすべてのパーツが利用可能で事前ウォーム済みであれば、SELECT クエリは代わりにそれらのパーツから読み取ります。Replicated-/SharedMergeTree のみ対象です。これは CacheWarmer がそのパーツを処理したかどうかだけを確認する点に注意してください。パーツが他の処理によってキャッシュにフェッチされていたとしても、CacheWarmer が処理するまではコールドとして扱われます。また、一度ウォームされた後にキャッシュからエビクト（追い出し）された場合でも、ウォーム済みとして扱われます。

## preferred_block_size_bytes {#preferred_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

この設定はクエリ処理時のデータブロックサイズを調整するもので、より大まかな `max_block_size` 設定に対する追加の細かなチューニングを行います。カラムが大きく、`max_block_size` 行を含むブロックのサイズが指定されたバイト数を超えそうな場合には、CPU キャッシュの局所性を高めるためにブロックサイズが小さく調整されます。

## preferred_max_column_in_block_size_bytes {#preferred_max_column_in_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時における、ブロック内のカラムの最大サイズの上限値です。キャッシュミスの回数を減らすのに役立ちます。L2 キャッシュサイズに近い値にすることを推奨します。

## preferred_optimize_projection_name {#preferred_optimize_projection_name} 

空でない文字列が設定されている場合、ClickHouse はクエリで指定されたプロジェクションを適用しようとします。

設定可能な値:

- string: 優先するプロジェクションの名前

## prefetch_buffer_size {#prefetch_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ファイルシステムから読み込む際に使用するプリフェッチバッファの最大サイズ。

## print&#95;pretty&#95;type&#95;names

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "より良いユーザーエクスペリエンス。"}]}]} />

`DESCRIBE` クエリおよび `toTypeName()` 関数で、入れ子構造の深い型名をインデント付きで見やすく出力できるようにします。

例：

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

クエリの優先度。1 が最も高く、値が大きいほど優先度は低くなります。0 の場合は優先度制御を行いません。

## promql_database {#promql_database} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的設定"}]}]}/>

'promql' 方言で使用するデータベース名を指定します。空文字列の場合は、現在のデータベースを使用します。

## promql_evaluation_time {#promql_evaluation_time} 

<ExperimentalBadge/>

**エイリアス**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "設定名が変更されました。以前の名前は `evaluation_time` です。"}]}]}/>

PromQL ダイアレクトで使用する評価時刻を設定します。`auto` は現在時刻を意味します。

## promql_table {#promql_table} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的な設定"}]}]}/>

「promql」方言で使用される TimeSeries テーブルの名前を指定します。

## push_external_roles_in_interserver_queries {#push_external_roles_in_interserver_queries} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

クエリの実行中に、発行元ノードから他のノードへユーザーロールをプッシュできるようにします。

## query_cache_compress_entries {#query_cache_compress_entries} 

<SettingsInfoBlock type="Bool" default_value="1" />

[query cache](../query-cache.md) 内のエントリを圧縮します。クエリキャッシュへの挿入およびクエリキャッシュからの読み取りが遅くなる代わりに、クエリキャッシュのメモリ消費を抑えます。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_max_entries {#query_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) に保存できるクエリ結果の最大数です。0 は無制限を意味します。

設定可能な値:

- 0 以上の整数。

## query_cache_max_size_in_bytes {#query_cache_max_size_in_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) 内で確保できるメモリの最大量（バイト単位）。0 は無制限を意味します。

設定可能な値:

- 0 以上の整数。

## query_cache_min_query_duration {#query_cache_min_query_duration} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

クエリ結果が[クエリキャッシュ](../query-cache.md)に保存されるための条件となる、クエリの最小実行時間（ミリ秒単位）。

取りうる値:

- 0 以上の正の整数。

## query_cache_min_query_runs {#query_cache_min_query_runs} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`SELECT` クエリの結果が[クエリキャッシュ](../query-cache.md)に保存されるまでに、そのクエリが実行される必要がある最小回数です。

取り得る値:

- 0 以上の正の整数。

## query_cache_nondeterministic_function_handling {#query_cache_nondeterministic_function_handling} 

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

[クエリキャッシュ](../query-cache.md) が、`rand()` や `now()` のような非決定的関数を含む `SELECT` クエリをどのように扱うかを制御します。

設定値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_share_between_users {#query_cache_share_between_users} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効化すると、[query cache](../query-cache.md) にキャッシュされた `SELECT` クエリの結果を他のユーザーが読み取れるようになります。
セキュリティ上の理由から、この設定を有効にすることは推奨されません。

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_squash_partial_results {#query_cache_squash_partial_results} 

<SettingsInfoBlock type="Bool" default_value="1" />

部分結果ブロックを、サイズが [max_block_size](#max_block_size) のブロックにまとめます。[query cache](../query-cache.md) への挿入パフォーマンスは低下しますが、キャッシュエントリの圧縮効率が向上します（[query_cache_compress-entries](#query_cache_compress_entries) を参照）。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_system_table_handling {#query_cache_system_table_handling} 

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "クエリキャッシュは、system テーブルに対するクエリ結果をキャッシュしなくなりました"}]}]}/>

`system.*` および `information_schema.*` データベース内のテーブル、つまり system テーブルに対する `SELECT` クエリを [query cache](../query-cache.md) がどのように扱うかを制御します。

設定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_tag {#query_cache_tag} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "クエリキャッシュエントリにラベルを付けるための新しい設定。"}]}]}/>

[クエリキャッシュ](../query-cache.md) のエントリに対するラベルとして機能する文字列です。
同じクエリでもタグが異なる場合、クエリキャッシュでは別のものとして扱われます。

設定可能な値:

- 任意の文字列

## query_cache_ttl {#query_cache_ttl} 

<SettingsInfoBlock type="Seconds" default_value="60" />

この秒数が経過すると、[query cache](../query-cache.md) 内のエントリは古いものと見なされます。

取り得る値:

- 0 以上の整数。

## query_condition_cache_store_conditions_as_plaintext {#query_condition_cache_store_conditions_as_plaintext} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

[query condition cache](/operations/query-condition-cache) のフィルタ条件を平文で保存します。
有効にすると、system.query_condition_cache にフィルタ条件がそのまま表示されるため、キャッシュに関する問題のデバッグが容易になります。
フィルタ条件を平文で保存すると機密情報が露出する可能性があるため、デフォルトでは無効になっています。

取りうる値:

- 0 - 無効
- 1 - 有効

## query_metric_log_interval {#query_metric_log_interval} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "新しい設定です。"}]}]}/>

個々のクエリに対して [query_metric_log](../../operations/system-tables/query_metric_log.md) が収集される間隔（ミリ秒単位）。

負の値に設定した場合は、[query_metric_log 設定](/operations/server-configuration-parameters/settings#query_metric_log) の `collect_interval_milliseconds` の値が使用され、その設定が存在しない場合はデフォルトで 1000 が使用されます。

単一のクエリに対する収集を無効化するには、`query_metric_log_interval` を 0 に設定します。

デフォルト値: -1

## query_plan_aggregation_in_order {#query_plan_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "クエリプランに関する一部のリファクタリングを有効にする"}]}]}/>

クエリプランレベルでの集約処理のインオーダー最適化を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効です。

:::note
これは開発者がデバッグ用途でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されるか、削除される可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_convert_any_join_to_semi_or_anti_join {#query_plan_convert_any_join_to_semi_or_anti_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

JOIN 後のフィルタが、マッチしなかった行またはマッチした行に対して常に false と評価される場合に、ANY JOIN を SEMI JOIN または ANTI JOIN に変換できるようにします

## query_plan_convert_join_to_in {#query_plan_convert_join_to_in} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

出力列が左側のテーブルのみに結び付いている場合に、`JOIN` を `IN` を用いたサブクエリへ変換することを許可します。ANY 以外の JOIN（たとえばデフォルトである ALL JOIN）の場合には、誤った結果になる可能性があります。

## query_plan_convert_outer_join_to_inner_join {#query_plan_convert_outer_join_to_inner_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "JOIN の後段のフィルタが常にデフォルト値を除外する場合に OUTER JOIN を INNER JOIN に変換することを許可"}]}]}/>

JOIN の後段のフィルタが常にデフォルト値を除外する場合に `OUTER JOIN` を `INNER JOIN` に変換することを許可する

## query_plan_direct_read_from_text_index {#query_plan_direct_read_from_text_index} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

クエリプラン内で転置インデックスのみを使用して全文検索のフィルタリングを実行できるようにします。

## query_plan_display_internal_aliases {#query_plan_display_internal_aliases} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN で、元のクエリで指定されたエイリアスではなく、内部エイリアス（`__table1` など）を表示します。

## query_plan_enable_multithreading_after_window_functions {#query_plan_enable_multithreading_after_window_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数の評価後にマルチスレッド処理を有効にして、ストリーム処理を並列に実行できるようにします

## query_plan_enable_optimizations {#query_plan_enable_optimizations} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでのクエリ最適化を切り替えます。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - クエリプランレベルでのすべての最適化を無効にする
- 1 - クエリプランレベルでの最適化を有効にする（ただし、個々の最適化は、対応する個別の設定によって無効化されている場合があります）

## query_plan_execute_functions_after_sorting {#query_plan_execute_functions_after_sorting} 

<SettingsInfoBlock type="Bool" default_value="1" />

ソート処理ステップの後に式を移動する、クエリプランレベルの最適化を有効／無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的で使用することのみを想定したエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_filter_push_down {#query_plan_filter_push_down} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの最適化を有効にし、フィルタを実行プラン内のより下位の段階へ移動します。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 に設定されている場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向け設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_join_shard_by_pk_ranges {#query_plan_join_shard_by_pk_ranges} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

両方のテーブルで、JOIN キーが `PRIMARY KEY` の先頭部分（プレフィックス）を含む場合に、JOIN に対してシャーディングを適用します。`hash`、`parallel_hash`、`full_sorting_merge` アルゴリズムをサポートします。通常はクエリの高速化にはつながりませんが、メモリ消費量を抑えられる可能性があります。

## query_plan_join_swap_table {#query_plan_join_swap_table} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "新しい設定。これまでは常に右テーブルが選択されていました。"}]}]}/>

結合のどちら側のテーブルをビルドテーブル（インナーテーブルとも呼ばれ、ハッシュ結合でハッシュテーブルに挿入される側）としてクエリプランで使用するかを決定します。この設定は、`JOIN ON` 句を伴う `ALL` 結合の厳密さでのみサポートされます。取りうる値は次のとおりです。

- `auto`: どちらのテーブルをビルドテーブルとして使用するかをプランナーに任せます。
    - `false`: テーブルを入れ替えません（右テーブルがビルドテーブルになります）。
    - `true`: 常にテーブルを入れ替えます（左テーブルがビルドテーブルになります）。

## query_plan_lift_up_array_join {#query_plan_lift_up_array_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

ARRAY JOIN を実行計画内のより上位の段階に移動する、クエリプランレベルの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。今後、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

Possible values:

- 0 - 無効
- 1 - 有効

## query_plan_lift_up_union {#query_plan_lift_up_union} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの最適化を切り替えます。この最適化は、さらなる最適化を可能にするために、クエリプラン上のより大きなサブツリーを union に持ち上げて配置します。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向け設定です。今後、この設定は後方互換性のない形で変更されるか、削除される可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_max_limit_for_lazy_materialization {#query_plan_max_limit_for_lazy_materialization} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "遅延マテリアライゼーション最適化でクエリプランを使用できる最大値を制御する新しい設定を追加しました。0 の場合、上限はありません"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "100"},{"label": "より最適化されました"}]}]}/>

遅延マテリアライゼーション最適化でクエリプランを使用できる最大値を制御します。0 の場合、上限はありません。

## query_plan_max_optimizations_to_apply {#query_plan_max_optimizations_to_apply} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

クエリプランに適用される最適化の総数を制限します。設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) を参照してください。
複雑なクエリで最適化に時間がかかりすぎることを防ぐのに役立ちます。
EXPLAIN PLAN クエリでは、この上限に達した時点でそれ以上の最適化を行うのをやめ、その時点のプランをそのまま返します。
通常のクエリ実行では、実際に行われた最適化の回数がこの設定値を超えた場合、例外がスローされます。

:::note
これは開発者がデバッグ用途でのみ使用すべき上級者向けの設定です。この設定は将来、後方互換性のない形で変更されたり削除されたりする可能性があります。
:::

## query_plan_max_step_description_length {#query_plan_max_step_description_length} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN におけるステップ説明の最大長。

## query_plan_merge_expressions {#query_plan_merge_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

連続するフィルターをマージするクエリプランレベルの最適化を切り替えます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは、開発者がデバッグ用途でのみ使用すべきエキスパート向け設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_merge_filter_into_join_condition {#query_plan_merge_filter_into_join_condition} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "フィルターを結合条件にマージする新しい設定を追加"}]}]}/>

フィルターを `JOIN` の条件にマージし、`CROSS JOIN` を `INNER JOIN` に変換できるようにします。

## query_plan_merge_filters {#query_plan_merge_filters} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "クエリプラン内でフィルターをマージできるようにします"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "クエリプラン内でフィルターをマージできるようにします。これは新しいアナライザーでのフィルタープッシュダウンを正しくサポートするために必要です。"}]}]}/>

クエリプラン内でフィルターをマージできるようにします。

## query_plan_optimize_join_order_limit {#query_plan_optimize_join_order_limit} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

同一サブクエリ内の結合順序を最適化します。現在はごく限られたケースでのみサポートされています。
    値は、最適化を行うテーブル数の上限です。

## query_plan_optimize_lazy_materialization {#query_plan_optimize_lazy_materialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "クエリプランを用いて遅延マテリアライゼーションを最適化する新しい設定を追加"}]}]}/>

遅延マテリアライゼーションの最適化にクエリプランを使用します。

## query_plan_optimize_prewhere {#query_plan_optimize_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "サポートされているストレージでフィルタを PREWHERE 式にプッシュダウンできるようにします"}]}]}/>

サポートされているストレージでフィルタを PREWHERE 式にプッシュダウンできるようにします

## query_plan_push_down_limit {#query_plan_push_down_limit} 

<SettingsInfoBlock type="Bool" default_value="1" />

実行計画内で `LIMIT` を下位ノードに移動する、クエリプランレベルの最適化機能の有効／無効を切り替えます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向け設定です。将来的に後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order {#query_plan_read_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの「順序どおり読み取り」最適化を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途のみに使用すべき上級者向けの設定です。将来的に後方互換性のない形で変更されたり、削除される可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_distinct {#query_plan_remove_redundant_distinct} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Remove redundant Distinct step in query plan"}]}]}/>

冗長な DISTINCT ステップを削除するクエリプランレベルの最適化を有効／無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_sorting {#query_plan_remove_redundant_sorting} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "クエリプラン内の冗長なソートを削除します。例えば、サブクエリ内の ORDER BY 句に関連するソートステップなどが対象です"}]}]}/>

クエリプランレベルで、サブクエリなどにおける冗長なソートステップを削除する最適化を有効／無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途に限定されるべき上級者向け設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

指定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_unused_columns {#query_plan_remove_unused_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新しい設定。クエリプラン内の未使用列を削除する最適化を追加。"}]}]}/>

クエリプランレベルで、クエリプランのステップから未使用の列（入力列・出力列の両方）を削除しようとする最適化の有効／無効を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグの目的にのみ使用すべき上級者向けの設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_reuse_storage_ordering_for_window_functions {#query_plan_reuse_storage_ordering_for_window_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数のソート時にストレージのソート順を利用する、クエリプランレベルの最適化を有効／無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_split_filter {#query_plan_split_filter} 

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

フィルタを個々の式に分割する、クエリプランレベルの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_try_use_vector_search {#query_plan_try_use_vector_search} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

ベクトル類似性インデックスの利用を試みる、クエリプランレベルの最適化の有効／無効を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途にのみ使用すべき、上級者向けの設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_use_new_logical_join_step {#query_plan_use_new_logical_join_step} 

**別名**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新しいステップを有効化"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい JOIN ステップ、内部的な変更"}]}]}/>

クエリプランにおいて論理 JOIN ステップを使用します。  
注: 設定 `query_plan_use_new_logical_join_step` は非推奨です。代わりに `query_plan_use_logical_join_step` を使用してください。

## query_profiler_cpu_time_period_ns {#query_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) の CPU クロックタイマーの周期を設定します。このタイマーは CPU 時間のみをカウントします。

設定可能な値:

- 正の整数で表されるナノ秒数。

    推奨値:

            - 単一クエリには 10000000（1 秒間に 100 回）ナノ秒以上。
            - クラスター全体のプロファイリングには 1000000000（1 秒に 1 回）。

- 0 を指定すると、タイマーを無効化します。

**ClickHouse Cloud では一時的に無効化されています。**

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns {#query_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) のリアルクロックタイマーの周期を設定します。リアルクロックタイマーはウォールクロック時間を計測します。

設定可能な値:

- 正の整数値（ナノ秒単位）。

    推奨値:

            - 単一クエリ向けには 10000000 ナノ秒（1 秒間に 100 回）以下。
            - クラスター全体のプロファイリングには 1000000000 ナノ秒（1 秒に 1 回）。

- 0 を指定するとタイマーを無効にします。

**ClickHouse Cloud では一時的に無効化されています。**

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms {#queue_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

同時リクエスト数が上限を超えた場合に、リクエストキューで待機する時間。

## rabbitmq_max_wait_ms {#rabbitmq_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

RabbitMQ からの読み取りを再試行する前に待機する時間。

## read_backoff_max_throughput {#read_backoff_max_throughput} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

読み取り速度が低下した場合にスレッド数を削減するための設定です。読み取り帯域幅が 1 秒あたりこの値のバイト数未満になったときにイベントをカウントします。

## read_backoff_min_concurrency {#read_backoff_min_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="1" />

低速な読み取りが発生した場合でも、利用するスレッド数がこの最小値を下回らないようにするための設定です。

## read_backoff_min_events {#read_backoff_min_events} 

<SettingsInfoBlock type="UInt64" default_value="2" />

低速な読み取りが発生した場合にスレッド数を減らすための設定です。スレッド数を減らすきっかけとなるイベント数を指定します。

## read_backoff_min_interval_between_events_ms {#read_backoff_min_interval_between_events_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

読み取りが遅い場合に、スレッド数を削減するための設定です。前回のイベントから一定時間が経過していない場合は、そのイベントを無視します。

## read_backoff_min_latency_ms {#read_backoff_min_latency_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

低速な読み取りが発生した場合にスレッド数を減らすための設定です。この値以上の時間がかかった読み取りのみを考慮します。

## read_from_distributed_cache_if_exists_otherwise_bypass_cache {#read_from_distributed_cache_if_exists_otherwise_bypass_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。`read_from_filesystem_cache_if_exists_otherwise_bypass_cache` と同様の設定ですが、分散キャッシュに対して動作します。

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache {#read_from_filesystem_cache_if_exists_otherwise_bypass_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルシステムキャッシュをパッシブモードで利用できるようにします。既存のキャッシュエントリは利用しますが、新しいエントリはキャッシュに追加しません。重いアドホッククエリに対してこの設定を有効にし、短時間のリアルタイムクエリでは無効のままにしておくことで、負荷の高いクエリによるキャッシュのスラッシングを回避し、システム全体の効率を向上させることができます。

## read_from_page_cache_if_exists_otherwise_bypass_cache {#read_from_page_cache_if_exists_otherwise_bypass_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザースペースページキャッシュを追加"}]}]}/>

`read_from_filesystem_cache_if_exists_otherwise_bypass_cache` と同様に、パッシブモードでユーザースペースのページキャッシュを使用します。

## read_in_order_two_level_merge_threshold {#read_in_order_two_level_merge_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100" />

プライマリキー順でのマルチスレッド読み取り時に、事前マージステップを実行するために読み込むパーツ数の最小個数。

## read_in_order_use_buffering {#read_in_order_use_buffering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "主キー順で読み取る際にマージ前にバッファリングを使用する"}]}]}/>

主キー順で読み取る際に、マージの前にバッファリングを使用します。これによりクエリ実行の並列度が向上します。

## read_in_order_use_virtual_row {#read_in_order_use_virtual_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "主キーまたはその単調関数に基づく順序で読み取る際に仮想行を使用します。複数のパーツにまたがって検索する場合に、関連するものだけにアクセスできるため有用です。"}]}]}/>

主キーまたはその単調関数に基づく順序で読み取る際に仮想行を使用します。複数のパーツにまたがって検索する場合に、関連するものだけにアクセスできるため有用です。

## read_overflow_mode {#read_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

制限を超えた場合にどのように処理するかを指定します。

## read_overflow_mode_leaf {#read_overflow_mode_leaf} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

読み取ったデータ量がいずれかのリーフ制限を超えた場合の動作を設定します。

指定可能なオプション:

- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、部分的な結果を返す。

## read_priority {#read_priority} 

<SettingsInfoBlock type="Int64" default_value="0" />

ローカルファイルシステムまたはリモートファイルシステムからデータを読み込む際の優先度。ローカルファイルシステムでは `pread_threadpool` メソッド、リモートファイルシステムでは `threadpool` メソッドでのみサポートされます。

## read_through_distributed_cache {#read_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュからの読み取りを許可します。

## readonly {#readonly} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 読み取り専用の制限なし。1 - 読み取りリクエストのみ許可され、さらに明示的に許可された設定のみ変更可能。2 - 読み取りリクエストのみ許可され、`readonly` 設定を除くすべての設定変更が可能。

## receive_data_timeout_ms {#receive_data_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

レプリカから最初のデータパケット、または正の進捗を示すパケットを受信するまでの接続タイムアウト

## receive_timeout {#receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークからデータを受信する際のタイムアウト時間（秒）です。この間に1バイトも受信されなかった場合、例外がスローされます。クライアント側でこの設定を行うと、対応するサーバー側接続のソケットに対しても `send_timeout` が設定されます。

## regexp_max_matches_per_row {#regexp_max_matches_per_row} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

1 行内で 1 つの正規表現がマッチできる最大回数を設定します。貪欲な正規表現を [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 関数で使用する際のメモリ過負荷を防ぐために使用します。

設定可能な値:

- 正の整数

## reject_expensive_hyperscan_regexps {#reject_expensive_hyperscan_regexps} 

<SettingsInfoBlock type="Bool" default_value="1" />

NFA の状態爆発により hyperscan での評価コストが高くなると予想されるパターンを拒否します

## remerge_sort_lowered_memory_bytes_ratio {#remerge_sort_lowered_memory_bytes_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

リマージ後のメモリ使用量がこの比率までには減少しない場合、リマージは無効化されます。

## remote_filesystem_read_method {#remote_filesystem_read_method} 

<SettingsInfoBlock type="String" default_value="threadpool" />

リモートファイルシステムからデータを読み込む方法です。`read` または `threadpool` のいずれかを指定します。

## remote_filesystem_read_prefetch {#remote_filesystem_read_prefetch} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムからデータを読み込む際にプリフェッチを行うかどうかを指定します。

## remote_fs_read_backoff_max_tries {#remote_fs_read_backoff_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="5" />

バックオフを伴う読み取りの最大試行回数

## remote_fs_read_max_backoff_ms {#remote_fs_read_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

リモートディスクからデータを読み取る際の最大待機時間

## remote_read_min_bytes_for_seek {#remote_read_min_bytes_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

シークを行うためにリモート読み取り（url、S3）に必要な最小バイト数。この値未満の場合は、シークせずに読み飛ばしによる読み取りを行います。

## rename_files_after_processing {#rename_files_after_processing} 

- **Type:** 文字列

- **Default value:** 空文字列

この設定では、`file` テーブル関数で処理されたファイルに適用するファイル名の変更パターンを指定できます。オプションが設定されている場合、`file` テーブル関数によって読み込まれたすべてのファイルは、処理が正常に完了した場合に限り、指定されたプレースホルダ付きパターンに従ってリネームされます。

### プレースホルダー

- `%a` — 元のフルファイル名（例: "sample.csv"）。
- `%f` — 拡張子を除いた元のファイル名（例: "sample"）。
- `%e` — 先頭にドットを含む元の拡張子（例: ".csv"）。
- `%t` — タイムスタンプ（マイクロ秒単位）。
- `%%` — パーセント記号 ("%")。

### 例

- オプション：`--rename_files_after_processing="processed_%f_%t%e"`

- クエリ：`SELECT * FROM file('sample.csv')`

`sample.csv` の読み取りに成功すると、ファイルは `processed_sample_1683473210851438.csv` に名前が変更されます

## replace_running_query {#replace_running_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP インターフェイスを使用する場合、`query_id` パラメータを渡すことができます。これはクエリ識別子として機能する任意の文字列です。
同一ユーザーから同じ `query_id` を持つクエリがその時点ですでに存在する場合、その動作は `replace_running_query` パラメータに依存します。

`0`（デフォルト） – 例外をスローします（同じ `query_id` のクエリがすでに実行中の場合、新しいクエリの実行を許可しません）。

`1` – 以前のクエリをキャンセルして新しいクエリの実行を開始します。

セグメンテーション条件に対するサジェスト機能を実装する場合、このパラメータを 1 に設定します。次の文字が入力されたとき、古いクエリがまだ完了していなければ、それがキャンセルされるようにします。

## replace_running_query_max_wait_ms {#replace_running_query_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[replace_running_query](#replace_running_query) 設定が有効な場合に、同じ `query_id` を持つ実行中のクエリが終了するまで待機する時間。

設定可能な値:

- 正の整数。
- 0 — サーバーがすでに同じ `query_id` のクエリを実行している場合、新しいクエリの実行を許可しない例外をスローする。

## replication_wait_for_inactive_replica_timeout {#replication_wait_for_inactive_replica_timeout} 

<SettingsInfoBlock type="Int64" default_value="120" />

非アクティブなレプリカが [`ALTER`](../../sql-reference/statements/alter/index.md)、[`OPTIMIZE`](../../sql-reference/statements/optimize.md)、または [`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリを実行するまで待機する時間（秒）を指定します。

設定可能な値:

- `0` — 待機しません。
- 負の整数 — 無制限に待機します。
- 正の整数 — 待機する秒数。

## restore_replace_external_dictionary_source_to_null {#restore_replace_external_dictionary_source_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

リストア時に外部ディクショナリのソースを Null に置き換えます。テスト目的に有用です。

## restore_replace_external_engines_to_null {#restore_replace_external_engines_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "New setting."}]}]}/>

テスト目的で使用する設定です。すべての外部エンジンを Null に置き換え、外部接続が確立されないようにします。

## restore_replace_external_table_functions_to_null {#restore_replace_external_table_functions_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "New setting."}]}]}/>

テスト目的で使用する設定です。すべての外部テーブル関数を Null に置き換え、外部接続が確立されないようにします。

## restore_replicated_merge_tree_to_shared_merge_tree {#restore_replicated_merge_tree_to_shared_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

RESTORE 実行時にテーブルエンジンを Replicated*MergeTree から Shared*MergeTree に置き換えます。

## result&#95;overflow&#95;mode

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Cloud におけるデフォルト値: `throw`

結果の量がいずれかの制限を超えた場合にどうするかを設定します。

設定可能な値:

* `throw`: 例外をスローする（デフォルト）。
* `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

`break` を使用することは LIMIT 句を使用することに似ています。`break` はブロックレベルでのみ実行を中断します。つまり、返される行数は
[`max_result_rows`](/operations/settings/settings#max_result_rows) より多く、[`max_block_size`](/operations/settings/settings#max_block_size) の倍数であり、
[`max_threads`](/operations/settings/settings#max_threads) に依存します。

**例**

```sql title="Query"
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

```text title="Result"
6666行のデータセット。...
```


## rewrite_count_distinct_if_with_count_distinct_implementation {#rewrite_count_distinct_if_with_count_distinct_implementation} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "count_distinct_implementation 設定を使用して countDistinctIf を書き換える設定"}]}]}/>

`countDistcintIf` を [count_distinct_implementation](#count_distinct_implementation) 設定で書き換えられるようにします。

可能な値:

- true — 許可する。
- false — 許可しない。

## rewrite_in_to_join {#rewrite_in_to_join} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

「x IN subquery」のような式を JOIN を用いたものに書き換えます。JOIN の順序変更によってクエリ全体を最適化するのに役立つ可能性があります。

## s3_allow_multipart_copy {#s3_allow_multipart_copy} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting."}]}]}/>

S3 のマルチパートコピーを有効にします。

## s3_allow_parallel_part_upload {#s3_allow_parallel_part_upload} 

<SettingsInfoBlock type="Bool" default_value="1" />

S3 のマルチパートアップロードに複数スレッドを使用します。メモリ使用量がわずかに増加する可能性があります。

## s3_check_objects_after_upload {#s3_check_objects_after_upload} 

<SettingsInfoBlock type="Bool" default_value="0" />

アップロード済みの各オブジェクトに対して S3 に HEAD リクエストを送信し、アップロードが成功したことを確認します

## s3_connect_timeout_ms {#s3_connect_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "S3 接続タイムアウト用の専用設定を追加"}]}]}/>

S3 ディスクで使用するホスト接続のタイムアウト。

## s3_create_new_file_on_insert {#s3_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

S3 エンジンテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを制御します。有効な場合、各 `INSERT` ごとに次のパターンのようなキーで新しい S3 オブジェクトが作成されます:

initial: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

取り得る値:

- 0 — `INSERT` クエリは、新しいファイルを作成するか、ファイルが既に存在していて s3_truncate_on_insert が設定されていない場合は失敗します。
- 1 — `INSERT` クエリは、s3_truncate_on_insert が設定されていない場合、（2 回目以降の挿入から）サフィックスを使用して、各 `INSERT` ごとに新しいファイルを作成します。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_disable_checksum {#s3_disable_checksum} 

<SettingsInfoBlock type="Bool" default_value="0" />

S3 にファイルを送信するときにチェックサムを計算しません。これにより、ファイルに対する余分な処理パスを回避することで、書き込みを高速化します。MergeTree テーブルのデータはそもそも ClickHouse によってチェックサムが計算されているため、これはほとんどのケースで安全であり、さらに S3 に HTTPS でアクセスする場合、ネットワーク経由で転送する際のデータ完全性はすでに TLS レイヤーによって保証されています。一方で、S3 上で追加のチェックサムを行うことは、防御の層を厚くすることにもなります。

## s3_ignore_file_doesnt_exist {#s3_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、S3 テーブルエンジンで例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み取る際に、ファイルが存在しない場合は、そのファイルが存在しないことを無視します。

設定可能な値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## s3_list_object_keys_size {#s3_list_object_keys_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストで 1 回のバッチで返されるファイル数の最大値

## s3_max_connections {#s3_max_connections} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

サーバーごとの最大接続数。

## s3_max_get_burst {#s3_max_get_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数制限に達する前に、同時に発行できる最大リクエスト数です。デフォルト値の 0 は `s3_max_get_rps` と同じです。

## s3_max_get_rps {#s3_max_get_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットリングが適用される前の、1 秒あたりの S3 GET リクエスト数の上限です。0 は無制限を意味します。

## s3_max_inflight_parts_for_one_file {#s3_max_inflight_parts_for_one_file} 

<SettingsInfoBlock type="UInt64" default_value="20" />

マルチパートアップロードリクエストで同時にアップロードされるパーツ数の最大値。0 を指定すると無制限になります。

## s3_max_part_number {#s3_max_part_number} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "S3 アップロード時のパート番号の上限"}]}]}/>

S3 アップロード時のパート番号の上限。

## s3_max_put_burst {#s3_max_put_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

` s3_max_put_rps` で設定された 1 秒あたりのリクエスト数の上限に達する前に、同時に発行できる最大リクエスト数。デフォルト値 (0) の場合は `s3_max_put_rps` と同じ値になります。

## s3_max_put_rps {#s3_max_put_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットリングが行われる前の、1 秒あたりの S3 PUT リクエストレートの上限です。0 の場合は無制限を意味します。

## s3_max_single_operation_copy_size {#s3_max_single_operation_copy_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "S3 での単一コピー操作の最大サイズ"}]}]}/>

S3 での単一操作コピーの最大サイズです。この設定は s3_allow_multipart_copy が true の場合にのみ有効です。

## s3_max_single_part_upload_size {#s3_max_single_part_upload_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

single-part アップロード方式を使用して S3 にアップロードするオブジェクトの最大サイズ。

## s3_max_single_read_retries {#s3_max_single_read_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の S3 読み取り時に行う最大リトライ回数。

## s3_max_unexpected_write_error_retries {#s3_max_unexpected_write_error_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

S3 への書き込み中に予期しないエラーが発生した場合に行う再試行の最大回数。

## s3_max_upload_part_size {#s3_max_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

S3 へのマルチパートアップロード時にアップロードする各パートの最大サイズ。

## s3_min_upload_part_size {#s3_min_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

マルチパートアップロードで S3 に送信するパートの最小サイズです。

## s3_request_timeout_ms {#s3_request_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

S3 へのデータ送受信時に適用される無通信状態のタイムアウト。単一の TCP 読み取りまたは書き込み呼び出しがこの時間以上ブロックされた場合は失敗とみなします。

## s3_skip_empty_files {#s3_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "より良い UX を提供できることを期待しています"}]}]}/>

[S3](../../engines/table-engines/integrations/s3.md) エンジンテーブルで空のファイルをスキップするかどうかを制御します。

設定可能な値:

- 0 — 空のファイルが要求されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空のファイルに対して、`SELECT` は空の結果を返します。

## s3_slow_all_threads_after_network_error {#s3_slow_all_threads_after_network_error} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントに対して S3 リクエストを実行しているすべてのスレッドの処理が、
ソケットタイムアウトのようなリトライ可能なネットワークエラーが 1 つの S3 リクエストで発生した後に遅くなります。
`false` に設定すると、各スレッドは他のスレッドとは独立して S3 リクエストのバックオフを処理します。

## s3_strict_upload_part_size {#s3_strict_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マルチパートアップロードで S3 にアップロードするパートの厳密なサイズを指定します（一部の実装では可変サイズのパートをサポートしていません）。

## s3_throw_on_zero_files_match {#s3_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

ListObjects リクエストで一致するファイルが 1 件も見つからない場合にエラーをスローします

## s3_truncate_on_insert {#s3_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

s3 エンジンテーブルへの挿入前にトランケート（truncate）を行うかどうかを有効または無効にします。無効にした場合、S3 オブジェクトがすでに存在しているときに挿入しようとすると、例外がスローされます。

指定可能な値:

- 0 — `INSERT` クエリは新しいファイルを作成するか、ファイルが存在していて `s3_create_new_file_on_insert` が設定されていない場合は失敗します。
- 1 — `INSERT` クエリは、そのファイルの既存の内容を新しいデータで置き換えます。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_upload_part_size_multiply_factor {#s3_upload_part_size_multiply_factor} 

<SettingsInfoBlock type="UInt64" default_value="2" />

S3 への 1 回の書き込みからアップロードされたパーツ数が s3_multiply_parts_count_threshold に達するたびに、s3_min_upload_part_size にこの係数を乗じます。

## s3_upload_part_size_multiply_parts_count_threshold {#s3_upload_part_size_multiply_parts_count_threshold} 

<SettingsInfoBlock type="UInt64" default_value="500" />

この数のパートが S3 にアップロードされるたびに、`s3_min_upload_part_size` は `s3_upload_part_size_multiply_factor` によって乗算されます。

## s3_use_adaptive_timeouts {#s3_use_adaptive_timeouts} 

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定すると、すべての S3 リクエストに対して、最初の 2 回の試行は送信および受信タイムアウトを低めにして実行されます。
`false` に設定すると、すべての試行で同一のタイムアウト値が使用されます。

## s3_validate_request_settings {#s3_validate_request_settings} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "S3 リクエスト設定の検証を無効化できるようにする"}]}]}/>

S3 リクエスト設定の検証を有効にします。
設定可能な値：

- 1 — 設定を検証する。
- 0 — 設定を検証しない。

## s3queue_default_zookeeper_path {#s3queue_default_zookeeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue エンジン用の ZooKeeper パスのデフォルトプレフィックス

## s3queue_enable_logging_to_s3queue_log {#s3queue_enable_logging_to_s3queue_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

system.s3queue_log への書き込みを有効にします。テーブル設定を使用して、テーブルごとにこの設定値を上書きできます。

## s3queue_keeper_fault_injection_probability {#s3queue_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

S3Queue 用 Keeper のフォールトインジェクション確率。

## s3queue_migrate_old_metadata_to_buckets {#s3queue_migrate_old_metadata_to_buckets} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

S3Queueテーブルの古いメタデータ構造を新しい構造に移行します

## schema_inference_cache_require_modification_time_for_url {#schema_inference_cache_require_modification_time_for_url} 

<SettingsInfoBlock type="Bool" default_value="1" />

最終更新時刻の検証を行ったうえで、URL 向けにキャッシュされたスキーマを使用します（`Last-Modified` ヘッダーを持つ URL 向け）

## schema_inference_use_cache_for_azure {#schema_inference_use_cache_for_azure} 

<SettingsInfoBlock type="Bool" default_value="1" />

Azure テーブル関数使用時のスキーマ推論でキャッシュを使用する

## schema_inference_use_cache_for_file {#schema_inference_use_cache_for_file} 

<SettingsInfoBlock type="Bool" default_value="1" />

file テーブル関数を使用する際、スキーマ推論時にキャッシュを利用します。

## schema_inference_use_cache_for_hdfs {#schema_inference_use_cache_for_hdfs} 

<SettingsInfoBlock type="Bool" default_value="1" />

hdfs テーブル関数でスキーマを推論する際にキャッシュを使用する

## schema_inference_use_cache_for_s3 {#schema_inference_use_cache_for_s3} 

<SettingsInfoBlock type="Bool" default_value="1" />

S3 テーブル関数を使用する際に、スキーマ推論でキャッシュを使用するかどうかを指定します

## schema_inference_use_cache_for_url {#schema_inference_use_cache_for_url} 

<SettingsInfoBlock type="Bool" default_value="1" />

`url` テーブル関数でスキーマ推論を行う際にキャッシュを使用する。

## secondary_indices_enable_bulk_filtering {#secondary_indices_enable_bulk_filtering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "データスキッピングインデックスを用いたフィルタリングの新しいアルゴリズム"}]}]}/>

インデックスに対する一括フィルタリングアルゴリズムを有効にします。常により良い動作が期待されていますが、互換性および制御のためにこの設定が用意されています。

## select_sequential_consistency {#select_sequential_consistency} 

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
この設定は SharedMergeTree と ReplicatedMergeTree で動作が異なります。SharedMergeTree における `select_sequential_consistency` の動作の詳細については、[SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

`SELECT` クエリに対する逐次一貫性を有効または無効にします。`insert_quorum_parallel` が無効であることが必要です（デフォルトでは有効）。

可能な値:

- 0 — 無効。
- 1 — 有効。

使用方法

逐次一貫性が有効な場合、ClickHouse はクライアントに対し、`insert_quorum` を有効にして実行されたすべての以前の `INSERT` クエリのデータを保持しているレプリカに対してのみ `SELECT` クエリを実行することを許可します。クライアントが不完全なレプリカを参照しようとした場合、ClickHouse は例外をスローします。`SELECT` クエリには、まだクォーラムレプリカに書き込まれていないデータは含まれません。

`insert_quorum_parallel` が有効（デフォルト）な場合、`select_sequential_consistency` は機能しません。これは、並列な `INSERT` クエリが異なるクォーラムレプリカ集合に書き込まれる可能性があるため、単一のレプリカがすべての書き込みを受け取っていることを保証できないためです。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level {#send_logs_level} 

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

指定した最小レベル以上のサーバーのテキストログをクライアントに送信します。有効な値: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp {#send_logs_source_regexp} 

指定した正規表現にマッチするログソース名のサーバーのテキストログを送信します。空の場合はすべてのソースが対象になります。

## send_profile_events {#send_profile_events} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新しい設定。クライアントにプロファイルイベントを送信するかどうかを制御します。"}]}]}/>

[ProfileEvents](/native-protocol/server.md#profile-events) パケットをクライアントに送信するかどうかを有効または無効にします。

プロファイルイベントを必要としないクライアント向けには、ネットワークトラフィックを削減するために無効化できます。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_progress_in_http_headers {#send_progress_in_http_headers} 

<SettingsInfoBlock type="Bool" default_value="0" />

`clickhouse-server` のレスポンスで、`X-ClickHouse-Progress` HTTPレスポンスヘッダーを有効または無効にします。

詳細については、[HTTPインターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_timeout {#send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークへのデータ送信におけるタイムアウト時間（秒）です。クライアントがデータを送信する必要があるにもかかわらず、この時間内に 1 バイトも送信できなかった場合、例外がスローされます。この設定をクライアント側で指定すると、対応するサーバー側接続のソケットにも `receive_timeout` が設定されます。

## serialize_query_plan {#serialize_query_plan} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

分散処理のためにクエリプランをシリアル化します

## session&#95;timezone

<BetaBadge />

現在のセッションまたはクエリの暗黙的なタイムゾーンを設定します。
暗黙的なタイムゾーンとは、明示的なタイムゾーンが指定されていない DateTime/DateTime64 型の値に適用されるタイムゾーンです。
この設定は、グローバルに構成された（サーバーレベルの）暗黙的なタイムゾーンよりも優先して適用されます。
値が &#39;&#39;（空文字列）の場合、現在のセッションまたはクエリの暗黙的なタイムゾーンは [サーバーのタイムゾーン](../server-configuration-parameters/settings.md/#timezone) と同じになります。

セッションのタイムゾーンとサーバーのタイムゾーンを取得するには、`timeZone()` および `serverTimeZone()` 関数を使用できます。

設定可能な値:

* `system.time_zones` に含まれる任意のタイムゾーン名（例: `Europe/Berlin`、`UTC`、`Zulu`）

例:

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

セッションのタイムゾーン「America/Denver」を、タイムゾーン未指定の内部 DateTime に適用します：

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
DateTime/DateTime64 をパースする関数の中には `session_timezone` を考慮しないものがあります。その結果、気付きにくい不具合が発生する可能性があります。
以下の例と説明を参照してください。
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

これは、異なるパース処理パイプラインによって生じます。

* 明示的なタイムゾーンを指定せずに、最初の `SELECT` クエリ内で使用された `toDateTime()` では、`session_timezone` 設定とグローバルタイムゾーンが適用されます。
* 2つ目のクエリでは、DateTime は String からパースされ、既存の列 `d` の型とタイムゾーンを継承します。そのため、`session_timezone` 設定とグローバルタイムゾーンは適用されません。

**関連項目**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode {#set_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えた場合の動作を設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように途中までの結果を返します。

## shared_merge_tree_sync_parts_on_partition_operations {#shared_merge_tree_sync_parts_on_partition_operations} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "新しい設定です。デフォルトではパーツは常に同期されます"}]}]}/>

SMT テーブルに対する MOVE | REPLACE | ATTACH パーティション操作の後に、データパーツの集合を自動的に同期します。Cloud 環境でのみ有効です

## short_circuit_function_evaluation {#short_circuit_function_evaluation} 

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

[if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)、[and](/sql-reference/functions/logical-functions#and)、および [or](/sql-reference/functions/logical-functions#or) 関数を、[ショートサーキット評価](https://en.wikipedia.org/wiki/Short-circuit_evaluation)に従って評価できるようにします。これにより、これらの関数内で複雑な式の実行を最適化し、（想定されていないゼロ除算などの）例外の発生を防ぐのに役立ちます。

取り得る値:

- `enable` — 該当する関数（例外をスローする可能性がある、または計算コストが高いもの）に対して、関数のショートサーキット評価を有効にします。
- `force_enable` — すべての関数に対して、関数のショートサーキット評価を有効にします。
- `disable` — 関数のショートサーキット評価を無効にします。

## short_circuit_function_evaluation_for_nulls {#short_circuit_function_evaluation_for_nulls} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Nullable 引数を持つ関数を、すべての引数が非 NULL 値である行に対してのみ実行できるようにする"}]}]}/>

いずれかの引数が NULL の場合に NULL を返す関数の評価を最適化します。関数の引数に含まれる NULL 値の割合が short_circuit_function_evaluation_for_nulls_threshold を超えると、システムは関数を行単位で評価することを省略します。その代わり、すべての行に対して即座に NULL を返し、不要な計算を回避します。

## short_circuit_function_evaluation_for_nulls_threshold {#short_circuit_function_evaluation_for_nulls_threshold} 

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "NULL 値を含む行の割合に対するしきい値。`Nullable` 引数を持つ関数を、すべての引数が非 NULL 値である行に対してのみ実行します。`short_circuit_function_evaluation_for_nulls` 設定が有効な場合に適用されます。"}]}]}/>

NULL 値を含む行の割合に対するしきい値。`Nullable` 引数を持つ関数を、すべての引数が非 NULL 値である行に対してのみ実行します。`short_circuit_function_evaluation_for_nulls` 設定が有効な場合に適用されます。
NULL 値を含む行数と全行数との比率がこのしきい値を超えると、NULL 値を含む行は評価対象から除外されます。

## show_data_lake_catalogs_in_system_tables {#show_data_lake_catalogs_in_system_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで system テーブル内のカタログ表示を無効化"}]}]}/>

system テーブルでデータレイクカタログを表示できるようにします。

## show_processlist_include_internal {#show_processlist_include_internal} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

`SHOW PROCESSLIST` クエリの出力に、内部の補助プロセスを表示します。

内部プロセスには、ディクショナリのリロード、リフレッシュ可能なマテリアライズドビューのリロード、`SHOW ...` クエリ内で実行される補助的な `SELECT`、破損したテーブルに対処するために内部的に実行される補助的な `CREATE DATABASE ...` クエリなどが含まれます。

## show_table_uuid_in_table_create_query_if_not_nil {#show_table_uuid_in_table_create_query_if_not_nil} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Engine=Atomic の場合、テーブルの CREATE クエリでテーブル UUID を表示しないように変更"}]}]}/>

`SHOW TABLE` クエリの表示内容を設定します。

指定可能な値:

- 0 — クエリはテーブル UUID を含めずに表示されます。
- 1 — クエリはテーブル UUID を含めて表示されます。

## single_join_prefer_left_table {#single_join_prefer_left_table} 

<SettingsInfoBlock type="Bool" default_value="1" />

単一の JOIN の場合、識別子があいまいなときは左側のテーブルを優先します

## skip&#95;redundant&#95;aliases&#95;in&#95;udf

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "有効にすると、同じテーブル内の複数のマテリアライズドカラムに対して、同じユーザー定義関数を複数回利用できるようになります。"}]}]} />

ユーザー定義関数の利用を簡素化するため、冗長なエイリアスは UDF 内では使用・展開されません。

設定可能な値:

* 1 — UDF 内でエイリアスをスキップ（展開せずに処理）します。
* 0 — UDF 内でエイリアスをスキップしません（通常どおり扱います）。

**例**

有効時と無効時の違い:

クエリ:

```sql
SET skip_redundant_aliases_in_udf = 0;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

結果:

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


## skip_unavailable_shards {#skip_unavailable_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

利用できないシャードをエラーなくスキップするかどうかを有効または無効にします。

すべてのレプリカが利用できない場合、そのシャードは利用不可と見なされます。レプリカが利用不可と見なされるのは、次のような場合です。

- 何らかの理由で ClickHouse がレプリカに接続できない。

    レプリカへの接続時、ClickHouse は複数回の接続試行を行います。これらの試行がすべて失敗した場合、そのレプリカは利用不可と見なされます。

- レプリカが DNS を通じて名前解決できない。

    レプリカのホスト名が DNS で名前解決できない場合、次のような状況を示している可能性があります。

    - レプリカのホストに DNS レコードが存在しない。これは動的 DNS を用いるシステム、たとえば [Kubernetes](https://kubernetes.io) ではよくあることであり、ノードがダウンタイム中に名前解決できなくなっても、それ自体はエラーではありません。

    - 設定ミス。ClickHouse の設定ファイルに誤ったホスト名が記載されている。

取りうる値:

- 1 — スキップを有効。

    シャードが利用不可の場合、ClickHouse は一部のデータに基づいた結果を返し、ノードの可用性に関する問題を報告しません。

- 0 — スキップを無効。

    シャードが利用不可の場合、ClickHouse は例外をスローします。

## sleep_after_receiving_query_ms {#sleep_after_receiving_query_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler でクエリを受信した後に待機する時間

## sleep_in_send_data_ms {#sleep_in_send_data_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler におけるデータ送信時のスリープ時間

## sleep_in_send_tables_status_ms {#sleep_in_send_tables_status_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler でテーブルステータス応答を送信する際にスリープする時間

## sort_overflow_mode {#sort_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

ソート前に受信した行数がいずれかの制限を超えた場合の動作を設定します。

指定可能な値:

- `throw`: 例外をスローします。
- `break`: クエリの実行を停止し、部分的な結果を返します。

## split_intersecting_parts_ranges_into_layers_final {#split_intersecting_parts_ranges_into_layers_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化中に、互いに重なり合うパーツ範囲をレイヤーに分割できるようにする"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化中に、互いに重なり合うパーツ範囲をレイヤーに分割できるようにする"}]}]}/>

FINAL 最適化中に、互いに重なり合うパーツ範囲をレイヤーに分割します

## split_parts_ranges_into_intersecting_and_non_intersecting_final {#split_parts_ranges_into_intersecting_and_non_intersecting_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化時に、パーツの範囲を交差するものと交差しないものに分割できるようにする"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化時に、パーツの範囲を交差するものと交差しないものに分割できるようにする"}]}]}/>

FINAL 最適化時に、パーツの範囲を交差するものと交差しないものに分割します

## splitby_max_substrings_includes_remaining_string {#splitby_max_substrings_includes_remaining_string} 

<SettingsInfoBlock type="Bool" default_value="0" />

引数 `max_substrings` に 0 より大きい値を指定した場合に、関数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) が結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。

設定可能な値:

- `0` - 残りの文字列は結果配列の最後の要素に含められません。
- `1` - 残りの文字列は結果配列の最後の要素に含められます。これは、Spark の [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 関数および Python の [`string.split()`](https://docs.python.org/3/library/stdtypes.html#str.split) メソッドの動作と同じです。

## stop_refreshable_materialized_views_on_startup {#stop_refreshable_materialized_views_on_startup} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー起動時に、`SYSTEM STOP VIEWS` を実行した場合と同様に、リフレッシュ可能なマテリアライズドビューをスケジュールしないようにします。必要に応じて、その後に `SYSTEM START VIEWS` または `SYSTEM START VIEW &lt;name&gt;` を使用して手動で開始できます。新しく作成されたビューにも適用されます。リフレッシュ非対応のマテリアライズドビューには影響しません。

## storage_file_read_method {#storage_file_read_method} 

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

ストレージファイルからデータを読み取る方法を指定します。指定可能な値は `read`、`pread`、`mmap` のいずれかです。`mmap` メソッドは clickhouse-server では使用できず、clickhouse-local 向けです。

## storage_system_stack_trace_pipe_read_timeout_ms {#storage_system_stack_trace_pipe_read_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

`system.stack_trace` テーブルをクエリする際に、スレッドから情報を受信するためにパイプから読み取ることが許容される最大時間。  
この設定はテスト用途専用であり、ユーザーが変更することは想定されていません。

## stream_flush_interval_ms {#stream_flush_interval_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

タイムアウトが発生した場合、またはスレッドが [max_insert_block_size](#max_insert_block_size) 行を生成した場合に、ストリーミングを行うテーブルで有効になります。

デフォルト値は 7500 です。

値を小さくするほど、テーブルへのデータフラッシュがより頻繁に行われます。値を小さくし過ぎるとパフォーマンスの低下につながります。

## stream_like_engine_allow_direct_select {#stream_like_engine_allow_direct_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "デフォルトでは Kafka/RabbitMQ/FileLog に対する直接の SELECT を許可しない"}]}]}/>

Kafka、RabbitMQ、FileLog、Redis Streams、NATS エンジンに対する直接の SELECT クエリを許可します。マテリアライズドビューがアタッチされている場合、この設定が有効でも SELECT クエリは許可されません。

## stream_like_engine_insert_queue {#stream_like_engine_insert_queue} 

stream-like エンジンが複数のキューからデータを読み出す場合、書き込み時には挿入先とするキューを 1 つ選択する必要があります。Redis Streams や NATS で使用されます。

## stream_poll_timeout_ms {#stream_poll_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="500" />

ストリーミングストレージとの間でデータを送受信する際に行うポーリングのタイムアウト時間。

## system&#95;events&#95;show&#95;zero&#95;values

<SettingsInfoBlock type="Bool" default_value="0" />

[`system.events`](../../operations/system-tables/events.md) から値がゼロのイベントも選択できるようにします。

一部の監視システムでは、メトリクス値がゼロであっても、各チェックポイントごとにすべてのメトリクス値を送信する必要があります。

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
│ QueryMemoryLimitExceeded │     0 │ クエリのメモリ制限を超過した回数。 │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache {#table_engine_read_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ効果があります。テーブルエンジン／テーブル関数（S3、Azure など）を介して分散キャッシュからの読み取りを許可します。

## table_function_remote_max_addresses {#table_function_remote_max_addresses} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

[remote](../../sql-reference/table-functions/remote.md) 関数において、パターンから生成されるアドレス数の最大値を設定します。

設定可能な値:

- 正の整数

## tcp_keep_alive_timeout {#tcp_keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="290" />

TCP がキープアライブプローブの送信を開始するまで、接続がアイドル状態のままでいられる時間（秒）

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds {#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds} 

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "一時データ用にファイルシステムキャッシュ内の領域を予約する際に、キャッシュのロックを待機する時間"}]}]}/>

一時データ用にファイルシステムキャッシュ内の領域を予約する際に、キャッシュのロックを待機する時間

## temporary_files_buffer_size {#temporary_files_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

一時ファイルの書き込み用バッファのサイズです。バッファサイズを大きくするとシステムコールの回数は減りますが、メモリ使用量が増加します。

## temporary_files_codec {#temporary_files_codec} 

<SettingsInfoBlock type="String" default_value="LZ4" />

ディスク上でのソートおよび結合処理で使用される一時ファイルの圧縮コーデックを設定します。

設定可能な値:

- LZ4 — [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 圧縮が適用されます。
- NONE — 圧縮は適用されません。

## text_index_use_bloom_filter {#text_index_use_bloom_filter} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

テスト目的で、テキストインデックスにおける Bloom フィルターの利用を有効化または無効化します。

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert {#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "依存するマテリアライズドビューでの重複排除は、非同期挿入と同時には利用できません。"}]}]}/>

`deduplicate_blocks_in_dependent_materialized_views` 設定が有効な状態で `async_insert` も有効になっている場合、INSERT クエリの実行時に例外をスローします。これらの機能は同時に動作できないため、この設定により処理の正当性が保証されます。

## throw_if_no_data_to_insert {#throw_if_no_data_to_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

空の INSERT を許可するかどうかを制御します。デフォルトでは有効で、空の INSERT に対してエラーをスローします。[`clickhouse-client`](/interfaces/cli) を使用した INSERT、または [gRPC インターフェース](/interfaces/grpc) を使用した INSERT にのみ適用されます。

## throw_on_error_from_cache_on_write_operations {#throw_on_error_from_cache_on_write_operations} 

<SettingsInfoBlock type="Bool" default_value="0" />

書き込み操作（INSERT、マージ）時のキャッシュで発生したエラーを無視します

## throw_on_max_partitions_per_insert_block {#throw_on_max_partitions_per_insert_block} 

<SettingsInfoBlock type="Bool" default_value="1" />

`max_partitions_per_insert_block` に到達したときの挙動を制御します。

取りうる値:

- `true`  - 挿入ブロックが `max_partitions_per_insert_block` に到達したときに、例外を送出します。
- `false` - `max_partitions_per_insert_block` に到達したときに、警告をログ出力します。

:::tip
[`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block) を変更した際に、それがユーザーへ与える影響を把握したい場合に役立ちます。
:::

## throw_on_unsupported_query_inside_transaction {#throw_on_unsupported_query_inside_transaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

トランザクション内でサポートされていないクエリが使用された場合に例外をスローします。

## timeout_before_checking_execution_speed {#timeout_before_checking_execution_speed} 

<SettingsInfoBlock type="Seconds" default_value="10" />

指定された秒数が経過した後、実行速度が遅すぎない（`min_execution_speed` を下回らない）ことをチェックします。

## timeout_overflow_mode {#timeout_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

クエリの実行時間が `max_execution_time` を超えた場合、または推定実行時間が `max_estimated_execution_time` を超える場合にどうするかを指定します。

設定値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

リーフノードでのクエリ実行時間が `max_execution_time_leaf` を超えた場合の動作を設定します。

設定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止して部分的な結果を返します。これは、
ソースデータが尽きた場合と同様の動作です。

## totals_auto_threshold {#totals_auto_threshold} 

<SettingsInfoBlock type="Float" default_value="0.5" />

`totals_mode = 'auto'` のときのしきい値です。
「WITH TOTALS 修飾子」のセクションを参照してください。

## totals_mode {#totals_mode} 

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

HAVING 句が指定されている場合、さらに `max_rows_to_group_by` と `group_by_overflow_mode = 'any'` が設定されている場合に、TOTALS をどのように計算するかを指定します。
「WITH TOTALS 修飾子」セクションを参照してください。

## trace_profile_events {#trace_profile_events} 

<SettingsInfoBlock type="Bool" default_value="0" />

各 `profile event` の更新ごとに、`profile event` の名前とインクリメントされた値とあわせてスタックトレースを収集し、それらを [trace_log](/operations/system-tables/trace_log) に送信するかどうかを切り替えます。

設定可能な値:

- 1 — `profile event` のトレースを有効にします。
- 0 — `profile event` のトレースを無効にします。

## transfer_overflow_mode {#transfer_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えたときの動作を設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止して部分的な結果を返します。ソースデータが尽きた場合と同様の動作になります。

## transform&#95;null&#95;in

<SettingsInfoBlock type="Bool" default_value="0" />

[IN](../../sql-reference/operators/in.md) 演算子において [NULL](/sql-reference/syntax#null) 値同士を等しいものとして扱うかどうかを制御します。

デフォルトでは、`NULL` は未定義値を意味するため、`NULL` 値は比較できません。したがって、`expr = NULL` という比較は常に `false` を返さなければなりません。この設定を有効にすると、`IN` 演算子において `NULL = NULL` が `true` を返すようになります。

指定可能な値:

* 0 — `IN` 演算子における `NULL` 値の比較は `false` を返します。
* 1 — `IN` 演算子における `NULL` 値の比較は `true` を返します。

**例**

次の `null_in` テーブルを使用します:

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

結果:

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "system.remote_data_paths をクエリする際にシャドウディレクトリも走査します。"}]}]}/>

system.remote_data_paths をクエリする際に、実テーブルデータに加えてフリーズされたデータ（シャドウディレクトリ）も走査します。

## union_default_mode {#union_default_mode} 

`SELECT` クエリ結果を結合する際のモードを設定します。`UNION ALL` または `UNION DISTINCT` を明示的に指定していない [UNION](../../sql-reference/statements/select/union.md) と組み合わせて使用される場合にのみ有効です。

可能な値:

- `'DISTINCT'` — クエリを結合した結果から、ClickHouse は重複行を削除して行を出力します。
- `'ALL'` — クエリを結合した結果から、ClickHouse は重複行も含めてすべての行を出力します。
- `''` — `UNION` と共に使用された場合、ClickHouse は例外をスローします。

[UNION](../../sql-reference/statements/select/union.md) の例を参照してください。

## unknown_packet_in_send_data {#unknown_packet_in_send_data} 

<SettingsInfoBlock type="UInt64" default_value="0" />

N 番目のデータパケットを不明なパケットに置き換えて送信する

## update_parallel_mode {#update_parallel_mode} 

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

同時に実行される `UPDATE` クエリの動作を決定します。

設定可能な値:

- `sync` - すべての `UPDATE` クエリを順次実行します。
- `auto` - 同一クエリ内で更新される列と、別のクエリの式で使用される列との間に依存関係がある `UPDATE` クエリのみ、順次実行します。
- `async` - `UPDATE` クエリの実行を同期しません。

## update_sequential_consistency {#update_sequential_consistency} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

true の場合、更新を実行する前にパーツセットが最新バージョンに更新されます。

## use_async_executor_for_materialized_views {#use_async_executor_for_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

マテリアライズドビューのクエリを非同期で、かつ必要に応じてマルチスレッドで実行します。INSERT 時のビュー処理を高速化できますが、メモリ消費量が増える可能性があります。

## use_cache_for_count_from_files {#use_cache_for_count_from_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル関数 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` によるファイルを対象とした `count` 実行時に、行数をキャッシュする機能を有効にします。

デフォルトで有効です。

## use_client_time_zone {#use_client_time_zone} 

<SettingsInfoBlock type="Bool" default_value="0" />

DateTime 文字列値を解釈する際に、サーバー側のタイムゾーンではなくクライアント側のタイムゾーンを使用します。

## use_compact_format_in_distributed_parts_names {#use_compact_format_in_distributed_parts_names} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで Distributed テーブルへの非同期 INSERT にコンパクト形式を使用"}]}]}/>

バックグラウンド（`distributed_foreground_insert`）で `Distributed` エンジンのテーブルに対して実行される INSERT において、ブロックをコンパクトな形式で保存します。

可能な値:

- 0 — `user[:password]@host:port#default_database` というディレクトリ形式を使用します。
- 1 — `[shard{shard_index}[_replica{replica_index}]]` というディレクトリ形式を使用します。

:::note

- `use_compact_format_in_distributed_parts_names=0` の場合、クラスタ定義の変更はバックグラウンド INSERT には適用されません。
- `use_compact_format_in_distributed_parts_names=1` の場合、クラスタ定義内でノードの順序を変更すると `shard_index` / `replica_index` が変更されるため注意してください。
:::

## use_concurrency_control {#use_concurrency_control} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "デフォルトで同時実行制御を有効にする"}]}]}/>

サーバーの同時実行制御（`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` のグローバルサーバー設定を参照）に従います。無効にした場合、サーバーが過負荷状態であっても、より多くのスレッドを使用できるようになります（通常の利用には推奨されず、主にテスト用途で必要になります）。

## use_hedged_requests {#use_hedged_requests} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Hedged Requests 機能をデフォルトで有効化"}]}]}/>

リモートクエリに対して hedged requests のロジックを有効にします。これにより、単一のクエリに対して複数のレプリカへ同時に接続を確立できるようになります。
既存のレプリカへの接続が `hedged_connection_timeout` 以内に確立されなかった場合、または `receive_data_timeout` 以内にデータが受信されなかった場合には、新しい接続が確立されます。クエリは、空でない progress パケット（または `allow_changing_replica_until_first_data_packet` が有効な場合はデータパケット）を最初に送信した接続を使用し、
その他の接続はキャンセルされます。`max_parallel_replicas > 1` のクエリにも対応しています。

デフォルトで有効です。

Cloud でのデフォルト値: `1`

## use_hive_partitioning {#use_hive_partitioning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "この設定がデフォルトで有効になりました。"}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "File、URL、S3、AzureBlobStorage、HDFS エンジンで Hive パーティショニングを使用できるようにします。"}]}]}/>

有効にすると、ClickHouse はファイル系テーブルエンジン [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) のパス内 (`/name=value/`) にある Hive 形式のパーティショニングを検出し、クエリ内でパーティション列を仮想列として使用できるようにします。これらの仮想列は、パーティションのパス内の列と同じ名前を持ちますが、先頭に `_` が付きます。

## use_iceberg_metadata_files_cache {#use_iceberg_metadata_files_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、Iceberg テーブル関数および Iceberg ストレージで Iceberg メタデータファイルキャッシュを利用できます。

指定可能な値:

- 0 - 無効
- 1 - 有効

## use_iceberg_partition_pruning {#use_iceberg_partition_pruning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Iceberg パーティションプルーニングをデフォルトで有効にします。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Iceberg パーティションプルーニング用の新しい設定です。"}]}]}/>

Iceberg テーブルで Iceberg パーティションプルーニングを使用します

## use_index_for_in_with_subqueries {#use_index_for_in_with_subqueries} 

<SettingsInfoBlock type="Bool" default_value="1" />

`IN` 演算子の右辺にサブクエリまたはテーブル式がある場合に、インデックスの利用を試みます。

## use_index_for_in_with_subqueries_max_values {#use_index_for_in_with_subqueries_max_values} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`IN` 演算子の右辺にある集合について、フィルタリングにテーブルインデックスを使用する際の最大サイズを指定します。このサイズを超える場合は、テーブルインデックスを使用しません。大規模なクエリで追加のデータ構造を準備することによるパフォーマンス低下やメモリ使用量の増加を回避するための設定です。0 は制限なしを意味します。

## use_join_disjunctions_push_down {#use_join_disjunctions_push_down} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

OR で結合された JOIN 条件の一部を、対応する入力側にプッシュダウンすることを有効にします（「部分的プッシュダウン」）。
これによりストレージエンジンがより早い段階でフィルタリングを実行でき、読み取るデータ量を削減できる場合があります。
この最適化はクエリの意味を変えないものであり、各トップレベルの OR ブランチが、対象側に対して少なくとも 1 つの決定的な述語を含む場合にのみ適用されます。

## use_legacy_to_time {#use_legacy_to_time} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新しい設定。`toTimeWithFixedDate` として動作する従来の `toTime` 関数ロジックを引き続き使用できるようにします。"}]}]}/>

有効化すると、従来の `toTime` 関数を使用できるようになります。この関数は、日時を固定の日付に変換しつつ、時刻部分を保持します。
無効にすると、新しい `toTime` 関数が使用され、さまざまな型のデータを `Time` 型に変換します。
従来の関数は、`toTimeWithFixedDate` として常に利用可能です。

## use_page_cache_for_disks_without_file_cache {#use_page_cache_for_disks_without_file_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザー空間ページキャッシュを追加"}]}]}/>

ファイルシステムキャッシュが有効になっていないリモートディスクに対して、ユーザー空間ページキャッシュを使用します。

## use_page_cache_with_distributed_cache {#use_page_cache_with_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

分散キャッシュ使用時にユーザー空間のページキャッシュを使用します。

## use_paimon_partition_pruning {#use_paimon_partition_pruning} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

Paimon テーブル関数で Paimon のパーティションプルーニングを使用します

## use_query_cache {#use_query_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、`SELECT` クエリで [クエリキャッシュ](../query-cache.md) を利用できるようになります。パラメータ [enable_reads_from_query_cache](#enable_reads_from_query_cache) と [enable_writes_to_query_cache](#enable_writes_to_query_cache) によって、キャッシュの使用方法をより詳細に制御できます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_query_condition_cache {#use_query_condition_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新しい最適化"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

[query condition cache](/operations/query-condition-cache) を有効にします。キャッシュは、`WHERE` 句内の条件を満たさないデータパート内のグラニュールの範囲を保存し、
その後のクエリで一時的なインデックスとしてこの情報を再利用します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_roaring_bitmap_iceberg_positional_deletes {#use_roaring_bitmap_iceberg_positional_deletes} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Iceberg の位置指定削除に Roaring Bitmap を使用します。

## use_skip_indexes {#use_skip_indexes} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行時にデータスキップインデックスを使用します。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final {#use_skip_indexes_if_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

クエリで `FINAL` 修飾子を使用して実行する際に、スキップインデックスを使用するかどうかを制御します。

スキップインデックスは、最新のデータを含む行（グラニュール単位）を除外してしまう可能性があり、その結果、`FINAL` 修飾子付きクエリで誤った結果を返す場合があります。この設定が有効な場合は、`FINAL` 修飾子が指定されていてもスキップインデックスが適用され、パフォーマンスが向上する可能性がありますが、直近の更新を取りこぼすリスクがあります。この設定は、設定 `use_skip_indexes_if_final_exact_mode`（デフォルトで有効）と同期して有効にする必要があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final_exact_mode {#use_skip_indexes_if_final_exact_mode} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "設定のデフォルト値の変更"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "FINAL クエリがスキップインデックス使用時にも正しい結果を返せるようにするために導入された設定"}]}]}/>

FINAL 修飾子付きクエリを実行する際に、スキップインデックスによって返されたグラニュールを、より新しいパーツにも展開して読み取り、正しい結果を返すかどうかを制御します。

スキップインデックスを使用すると、最新データを含む行（グラニュール）が除外されてしまい、その結果が不正確になる可能性があります。この設定を有効にすると、スキップインデックスによって返された範囲と重複する、より新しいパーツをスキャンすることで、正しい結果が返されるようにできます。スキップインデックスを参照して得られる近似的な結果で問題ないアプリケーションの場合にのみ、この設定を無効にしてください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_on_data_read {#use_skip_indexes_on_data_read} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

データ読み取り時にデータスキップインデックスを使用するかどうかを制御します。

有効にすると、クエリ実行開始前に事前解析されるのではなく、各データグラニュールが読み取られるタイミングでスキップインデックスが動的に評価されます。これにより、クエリ開始時のレイテンシを削減できる場合があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_statistics_cache {#use_statistics_cache} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

各パーツの統計情報を読み込む際のオーバーヘッドを避けるために、クエリで統計キャッシュを使用します

## use_structure_from_insertion_table_in_table_functions {#use_structure_from_insertion_table_in_table_functions} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "テーブル関数で挿入先テーブルの構造を使用する動作の改善"}]}]}/>

データからスキーマを推論するのではなく、挿入先テーブルの構造を使用します。設定可能な値: 0 - 無効, 1 - 有効, 2 - 自動

## use_text_index_dictionary_cache {#use_text_index_dictionary_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズされたテキストインデックス辞書ブロックのキャッシュを使用するかどうかを指定します。
テキストインデックス辞書ブロックキャッシュを使用すると、大量のテキストインデックスクエリを処理する際のレイテンシを大幅に削減し、スループットを向上させることができます。

## use_text_index_header_cache {#use_text_index_header_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズ済みテキストインデックスヘッダーのキャッシュを使用するかどうかを制御します。
テキストインデックスヘッダーキャッシュを使用すると、多数のテキストインデックスクエリを処理する場合に、レイテンシーを大幅に削減し、スループットを向上させることができます。

## use_text_index_postings_cache {#use_text_index_postings_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

逆シリアル化されたテキストインデックスのポスティングリストのキャッシュを使用するかどうかを指定します。
このキャッシュを有効にすると、大量のテキストインデックスクエリを処理する際のレイテンシを大幅に削減し、スループットを向上させることができます。

## use_uncompressed_cache {#use_uncompressed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

非圧縮ブロックのキャッシュを使用するかどうかを指定します。0 または 1 を受け付けます。デフォルトは 0（無効）です。
非圧縮キャッシュ（MergeTree ファミリーのテーブルでのみ有効）を使用すると、多数の短いクエリを処理する際のレイテンシを大幅に低減し、スループットを向上させることができます。頻繁に短いリクエストを送信するユーザー向けに、この設定を有効にしてください。また、[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 構成パラメータ（設定ファイルでのみ指定可能）にも注意してください。これは非圧縮キャッシュブロックのサイズを表し、デフォルトは 8 GiB です。非圧縮キャッシュは必要に応じて格納され、使用頻度の低いデータは自動的に削除されます。

ある程度以上のデータ量（100 万行以上）を読み取るクエリでは、小さなクエリのための領域を確保するために、非圧縮キャッシュは自動的に無効になります。したがって、`use_uncompressed_cache` 設定は常に 1 に設定したままにしておくことができます。

## use&#95;variant&#95;as&#95;common&#95;type

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "引数に共通の型がない場合に if/multiIf/array/map で Variant 型を結果型として使用可能にする"}]}]} />

引数型に共通の型が存在しない場合に、[if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 関数の結果型として `Variant` 型を使用できるようにします。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ORDER BY 句において WITH FILL 列より前に指定された列は、ソートプレフィックスを構成します。ソートプレフィックスの値が異なる行は、それぞれ独立して補完されます"}]}]}/>

ORDER BY 句において WITH FILL 列より前に指定された列は、ソートプレフィックスを構成します。ソートプレフィックスの値が異なる行は、それぞれ独立して補完されます

## validate_enum_literals_in_operators {#validate_enum_literals_in_operators} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効にすると、`IN`、`NOT IN`、`==`、`!=` などの演算子で使用される列挙型リテラルを、その列挙型の定義に対して検証し、リテラルが有効な列挙値でない場合は例外を発生させます。

## validate_mutation_query {#validate_mutation_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "ミューテーションクエリをデフォルトで検証するための新しい設定。"}]}]}/>

ミューテーションクエリを受け付ける前に検証します。ミューテーションはバックグラウンドで実行されるため、無効なクエリを実行するとミューテーションが停止したままになり、手動での対応が必要になります。

後方互換性のないバグに遭遇した場合にのみ、この設定を変更してください。

## validate_polygons {#validate_polygons} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "デフォルトで、誤った結果を返す可能性がある挙動の代わりに、関数 pointInPolygon で不正なポリゴンに対して例外をスローするように変更"}]}]}/>

ポリゴンが自己交差または自己接触している場合に、[pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 関数で例外をスローするかどうかを有効または無効にします。

設定可能な値:

- 0 — 例外のスローを無効にします。`pointInPolygon` は不正なポリゴンを受け付け、それらに対して誤った結果を返す可能性があります。
- 1 — 例外のスローを有効にします。

## vector_search_filter_strategy {#vector_search_filter_strategy} 

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

ベクター検索クエリに `WHERE` 句が含まれる場合、この設定は、その `WHERE` 句を先に評価するか（プリフィルタリング）、あるいは先にベクター類似度インデックスを参照するか（ポストフィルタリング）を決定します。指定可能な値は次のとおりです。

- 'auto' - ポストフィルタリング（将来、厳密な意味は変更される可能性があります）。
- 'postfilter' - まずベクター類似度インデックスを使用して最近傍を特定し、その後に他のフィルターを適用します。
- 'prefilter' - まず他のフィルターを評価し、その後に総当たり検索で近傍を特定します。

## vector_search_index_fetch_multiplier {#vector_search_index_fetch_multiplier} 

**別名**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "設定 'vector_search_postfilter_multiplier' の別名"}]}]}/>

ベクトル類似度インデックスから取得する最近傍ベクトルの件数を、この値で乗算します。ほかの述語との組み合わせによる後段のフィルタ処理（post-filtering）時、または設定 'vector_search_with_rescoring = 1' の場合にのみ適用されます。

## vector_search_with_rescoring {#vector_search_with_rescoring} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse がベクトル類似度インデックスを使用するクエリに対してリスコアリングを実行するかどうかを制御します。
リスコアリングを行わない場合、ベクトル類似度インデックスは最良のマッチを含む行だけを直接返します。
リスコアリングを行う場合、行はグラニュール単位のレベルにまで拡張され、そのグラニュール内のすべての行が再度チェックされます。
ほとんどの状況では、リスコアリングは精度の向上にはわずかにしか寄与せず、ベクトル検索クエリのパフォーマンスを大きく低下させます。
注意: リスコアリングなし・並列レプリカ有効で実行されたクエリは、リスコアリングにフォールバックする場合があります。

## wait_changes_become_visible_after_commit_mode {#wait_changes_become_visible_after_commit_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

コミット済みの変更が最新のスナップショットに実際に反映されて見えるようになるまで待機します

## wait_for_async_insert {#wait_for_async_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期挿入の処理が完了するまで待機します。

## wait_for_async_insert_timeout {#wait_for_async_insert_timeout} 

<SettingsInfoBlock type="Seconds" default_value="120" />

非同期挿入処理を待機する際のタイムアウト

## wait_for_window_view_fire_signal_timeout {#wait_for_window_view_fire_signal_timeout} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

イベント時刻処理において、window view の発火シグナルを待機する際のタイムアウト

## window_view_clean_interval {#window_view_clean_interval} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

ウィンドウビューで古いデータを削除するためのクリーン処理の実行間隔（秒単位）。

## window_view_heartbeat_interval {#window_view_heartbeat_interval} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

監視クエリが生存していることを示すためのハートビート間隔（秒単位）。

## workload {#workload} 

<SettingsInfoBlock type="String" default_value="default" />

リソースにアクセスするために使用するワークロード名

## write_full_path_in_iceberg_metadata {#write_full_path_in_iceberg_metadata} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

Iceberg メタデータファイルに、フルパス（s3:// を含む）を書き込みます。

## write_through_distributed_cache {#write_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ効果があります。分散キャッシュへの書き込みを許可します（S3 への書き込みも分散キャッシュ経由で行われます）。

## write_through_distributed_cache_buffer_size {#write_through_distributed_cache_buffer_size} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New cloud setting"}]}]}/>

ClickHouse Cloud でのみ効果があります。write-through 方式の distributed cache のバッファサイズを設定します。0 の場合、distributed cache がない場合に使用されるバッファサイズが使用されます。

## zstd_window_log_max {#zstd_window_log_max} 

<SettingsInfoBlock type="Int64" default_value="0" />

ZSTD の最大ウィンドウログ値を選択できます（MergeTree ファミリーのテーブルでは使用されません）。