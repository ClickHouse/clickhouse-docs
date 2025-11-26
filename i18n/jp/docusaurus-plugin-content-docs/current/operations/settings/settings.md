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


## add_http_cors_header \{#add_http_cors_header\} 

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP CORS ヘッダーを追加します。

## additional&#95;result&#95;filter

`SELECT` クエリの結果に適用する追加のフィルタ式。
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


## additional&#95;table&#95;filters

<SettingsInfoBlock type="Map" default_value="{}" />

指定されたテーブルの読み込み後に適用される追加のフィルター式です。

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

クエリ内のすべての集約関数を書き換え、[-OrNull](/sql-reference/aggregate-functions/combinators#-ornull) サフィックスを付与するかどうかを切り替えます。SQL 標準との互換性のために有効化します。
分散クエリで一貫した結果を得るために、[count&#95;distinct&#95;implementation](#count_distinct_implementation) 設定と同様、クエリの書き換えによって実装されています。

指定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

次のような集約関数を含むクエリを考えます:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

`aggregate_functions_null_for_empty = 0` に設定すると、次のような結果になります：

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

`aggregate_functions_null_for_empty = 1` を設定すると、結果は次のようになります。

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes \{#aggregation_in_order_max_block_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

プライマリキー順での集約処理中に蓄積されるブロックの最大サイズ（バイト単位）。ブロックサイズを小さくすると、集約の最終マージ段階をより高い並列度で実行できます。

## aggregation_memory_efficient_merge_threads \{#aggregation_memory_efficient_merge_threads\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

メモリ効率モードで中間集約結果をマージする際に使用するスレッド数。値を大きくすると消費メモリ量も増加します。0 の場合、`max_threads` と同じ値が使用されます。

## allow_aggregate_partitions_independently \{#allow_aggregate_partitions_independently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションキーが `GROUP BY` キーとよく対応している場合に、パーティションを別々のスレッドで独立して集約することを有効にします。パーティション数がコア数に近く、かつ各パーティションのサイズがおおよそ同程度の場合に有効です。

## allow_archive_path_syntax \{#allow_archive_path_syntax\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "アーカイブパス構文を無効化できる新しい設定を追加しました。"}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "アーカイブパス構文を無効化できる新しい設定を追加しました。"}]}]}/>

File/S3 エンジンおよびテーブル関数は、アーカイブの拡張子が適切な場合、'::' を含むパスを `<archive> :: <file>` として解析します。

## allow_asynchronous_read_from_io_pool_for_merge_tree \{#allow_asynchronous_read_from_io_pool_for_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

バックグラウンド I/O プールを使用して MergeTree テーブルからデータを読み込みます。この設定により、I/O がボトルネックとなっているクエリのパフォーマンスが向上する可能性があります。

## allow_changing_replica_until_first_data_packet \{#allow_changing_replica_until_first_data_packet\} 

<SettingsInfoBlock type="Bool" default_value="0" />

これを有効にすると、ヘッジ付きリクエストにおいて、すでにある程度進捗があった場合でも（ただしその進捗が `receive_data_timeout` の間更新されていない場合）、最初のデータパケットを受信するまで新しい接続を開始できます。無効な場合は、最初に進捗があった時点以降はレプリカの変更を行いません。

## allow_create_index_without_type \{#allow_create_index_without_type\} 

<SettingsInfoBlock type="Bool" default_value="0" />

TYPE を指定しない CREATE INDEX クエリを許可します。クエリは無視されます。SQL 互換性テストのための設定です。

## allow_custom_error_code_in_throwif \{#allow_custom_error_code_in_throwif\} 

<SettingsInfoBlock type="Bool" default_value="0" />

関数 throwIf() でカスタムエラーコードを有効にします。true の場合、送出される例外のエラーコードが想定外の値になる可能性があります。

## allow_ddl \{#allow_ddl\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定されている場合、ユーザーは DDL クエリを実行できます。

## allow_deprecated_database_ordinary \{#allow_deprecated_database_ordinary\} 

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨の Ordinary データベースエンジンを使用したデータベースの作成を許可する

## allow_deprecated_error_prone_window_functions \{#allow_deprecated_error_prone_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "非推奨で誤りを招きやすいウィンドウ関数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）の使用を許可"}]}]}/>

非推奨で誤りを招きやすいウィンドウ関数（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）の使用を許可

## allow_deprecated_snowflake_conversion_functions \{#allow_deprecated_snowflake_conversion_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "非推奨関数 snowflakeToDateTime[64] と dateTime[64]ToSnowflake を無効化しました。"}]}]}/>

関数 `snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake`、`dateTime64ToSnowflake` は非推奨であり、既定では無効になっています。
代わりに `snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID`、`dateTime64ToSnowflakeID` を使用してください。

非推奨の関数を再度有効化する場合（たとえば移行期間中など）は、この設定値を `true` に設定してください。

## allow_deprecated_syntax_for_merge_tree \{#allow_deprecated_syntax_for_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

非推奨となっているエンジン定義構文を使用して *MergeTree テーブルを作成できるようにします

## allow_distributed_ddl \{#allow_distributed_ddl\} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、ユーザーは分散 DDL クエリを実行できるようになります。

## allow_drop_detached \{#allow_drop_detached\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE ... DROP DETACHED PART[ITION] ... クエリの実行を許可します

## allow_dynamic_type_in_join_keys \{#allow_dynamic_type_in_join_keys\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで JOIN キーでの Dynamic 型の使用を禁止"}]}]}/>

JOIN キーで Dynamic 型を使用できるようにします。互換性のために追加された設定です。ほかの型との比較時に予期しない結果を招く可能性があるため、JOIN キーで Dynamic 型を使用することは推奨されません。

## allow_execute_multiif_columnar \{#allow_execute_multiif_columnar\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`multiIf` 関数をカラム指向で実行することを許可します。

## allow_experimental_alias_table_engine \{#allow_experimental_alias_table_engine\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Alias テーブルエンジンを使用したテーブルの作成を許可します。

## allow_experimental_analyzer \{#allow_experimental_analyzer\} 

**エイリアス**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルトで analyzer と planner を有効にします。"}]}]}/>

新しいクエリアナライザを有効にします。

## allow_experimental_codecs \{#allow_experimental_codecs\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、実験的な圧縮コーデックを指定できるようになります（ただし、現時点ではそのようなコーデックは存在せず、この設定は効果がありません）。

## allow_experimental_correlated_subqueries \{#allow_experimental_correlated_subqueries\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "相関サブクエリのサポートを Beta として扱います。"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "相関サブクエリを実行できる新しい設定を追加しました。"}]}]}/>

相関サブクエリの実行を許可します。

## allow_experimental_database_glue_catalog \{#allow_experimental_database_glue_catalog\} 

<BetaBadge/>

**別名**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'glue' を持つ実験的なデータベースエンジン DataLakeCatalog の使用を許可"}]}]}/>

catalog_type = 'glue' を持つ実験的なデータベースエンジン DataLakeCatalog の使用を許可します

## allow_experimental_database_hms_catalog \{#allow_experimental_database_hms_catalog\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "catalog_type = 'hive' を持つ実験的なデータベースエンジン DataLakeCatalog を許可"}]}]}/>

catalog_type = 'hms' を持つ実験的なデータベースエンジン DataLakeCatalog を許可します

## allow_experimental_database_iceberg \{#allow_experimental_database_iceberg\} 

<BetaBadge/>

**Aliases**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

catalog_type = 'iceberg' の実験的なデータベースエンジン DataLakeCatalog の利用を許可します。

## allow_experimental_database_materialized_postgresql \{#allow_experimental_database_materialized_postgresql\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Engine=MaterializedPostgreSQL(...) を使用したデータベースの作成を許可します。

## allow_experimental_database_unity_catalog \{#allow_experimental_database_unity_catalog\} 

<BetaBadge/>

**別名**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "catalog_type = 'unity' の実験的なデータベースエンジン DataLakeCatalog を許可します"}]}]}/>

catalog_type = 'unity' の実験的なデータベースエンジン DataLakeCatalog を許可します

## allow_experimental_delta_kernel_rs \{#allow_experimental_delta_kernel_rs\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

実験的な delta-kernel-rs 実装を有効にします。

## allow_experimental_delta_lake_writes \{#allow_experimental_delta_lake_writes\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

Delta Kernel の書き込み機能を有効にします。

## allow_experimental_full_text_index \{#allow_experimental_full_text_index\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Enable experimental text index"}]}]}/>

`true` に設定すると、実験的なテキストインデックスを利用できるようになります。

## allow_experimental_funnel_functions \{#allow_experimental_funnel_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

ファネル分析向けの実験的関数を有効化します。

## allow_experimental_hash_functions \{#allow_experimental_hash_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

実験的なハッシュ関数を有効化します

## allow_experimental_iceberg_compaction \{#allow_experimental_iceberg_compaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting "}]}]}/>

Iceberg テーブルに対して `OPTIMIZE` を明示的に実行できるようにします。

## allow_experimental_insert_into_iceberg \{#allow_experimental_insert_into_iceberg\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

iceberg への `insert` クエリの実行を許可します。

## allow_experimental_join_right_table_sorting \{#allow_experimental_join_right_table_sorting\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "true に設定し、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件を満たしている場合、左結合または内部ハッシュ結合のパフォーマンスを向上させるために、右側テーブルをキーで再ソートします"}]}]}/>

true に設定し、`join_to_sort_minimum_perkey_rows` と `join_to_sort_maximum_table_rows` の条件を満たしている場合、左結合または内部ハッシュ結合のパフォーマンスを向上させるために、右側テーブルをキーで再ソートします。

## allow_experimental_kafka_offsets_storage_in_keeper \{#allow_experimental_kafka_offsets_storage_in_keeper\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "ClickHouse Keeper にコミット済みオフセットを保存する実験的な Kafka ストレージエンジンの使用を許可"}]}]}/>

Kafka 関連のオフセットを ClickHouse Keeper に保存する実験的な機能を許可します。この機能を有効にすると、Kafka テーブルエンジンに対して ClickHouse Keeper のパスおよびレプリカ名を指定できるようになります。その結果、通常の Kafka エンジンの代わりに、コミット済みオフセットを ClickHouse Keeper に保存する新しいタイプのストレージエンジンが使用されます。

## allow_experimental_kusto_dialect \{#allow_experimental_kusto_dialect\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

SQL の代替となる Kusto Query Language (KQL) を有効にします。

## allow_experimental_materialized_postgresql_table \{#allow_experimental_materialized_postgresql_table\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

MaterializedPostgreSQL テーブルエンジンを使用できるようにします。実験的な機能であるため、デフォルトでは無効になっています。

## allow_experimental_nlp_functions \{#allow_experimental_nlp_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

自然言語処理向けの実験的な関数を有効にします。

## allow_experimental_parallel_reading_from_replicas \{#allow_experimental_parallel_reading_from_replicas\} 

<BetaBadge/>

**別名**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

SELECT クエリの実行時に、各シャードから最大 `max_parallel_replicas` 個のレプリカを使用します。読み取り処理は並列化され、動的に協調制御されます。0 - 無効、1 - 有効（失敗時はエラーを出さずに静かに無効化）、2 - 有効（失敗時に例外をスロー）

## allow_experimental_prql_dialect \{#allow_experimental_prql_dialect\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

SQL の代替言語である PRQL を有効にします。

## allow_experimental_qbit_type \{#allow_experimental_qbit_type\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい実験的な設定"}]}]}/>

[QBit](../../sql-reference/data-types/qbit.md) データ型を作成できるようにします。

## allow_experimental_query_deduplication \{#allow_experimental_query_deduplication\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

パーツの UUID に基づいて SELECT クエリのデータを実験的に重複排除します

## allow_experimental_statistics \{#allow_experimental_statistics\} 

<ExperimentalBadge/>

**エイリアス**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "設定名が変更されました。以前の名前は `allow_experimental_statistic` です。"}]}]}/>

カラムに[統計情報](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table)を定義し、[統計情報を操作](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)できるようにします。

## allow_experimental_time_series_aggregate_functions \{#allow_experimental_time_series_aggregate_functions\} 

<ExperimentalBadge/>

**別名**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "実験的な timeSeries* 集約関数を有効化するための新しい設定。"}]}]}/>

Prometheus 風の時系列の再サンプリングや rate・delta 計算を行うための実験的な timeSeries* 集約関数。

## allow_experimental_time_series_table \{#allow_experimental_time_series_table\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "TimeSeries テーブルエンジンの利用を許可する新しい設定を追加"}]}]}/>

[TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを使用するテーブルの作成を許可します。設定可能な値:

- 0 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを無効にします。
- 1 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを有効にします。

## allow_experimental_window_view \{#allow_experimental_window_view\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

WINDOW VIEW を有効にします。まだ機能として十分に成熟していません。

## allow_experimental_ytsaurus_dictionary_source \{#allow_experimental_ytsaurus_dictionary_source\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

YTsaurus と統合するための実験的な辞書ソースです。

## allow_experimental_ytsaurus_table_engine \{#allow_experimental_ytsaurus_table_engine\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

YTsaurus との統合向けの実験的なテーブルエンジン。

## allow_experimental_ytsaurus_table_function \{#allow_experimental_ytsaurus_table_function\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

YTsaurus との統合用の実験的なテーブルエンジンです。

## allow_general_join_planning \{#allow_general_join_planning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合プラン作成アルゴリズムを許可します。"}]}]}/>

より複雑な条件も処理できる、より汎用的な結合プラン作成アルゴリズムを有効にしますが、ハッシュ結合と組み合わせた場合にのみ動作します。ハッシュ結合が有効でない場合は、この設定値に関係なく通常の結合プラン作成アルゴリズムが使用されます。

## allow_get_client_http_header \{#allow_get_client_http_header\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "新しい関数を導入しました。"}]}]}/>

現在の HTTP リクエストのヘッダーの値を取得できる関数 `getClientHTTPHeader` の使用を許可します。`Cookie` など一部のヘッダーには機微な情報が含まれる可能性があるため、セキュリティ上の理由からデフォルトでは有効になっていません。`X-ClickHouse-*` ヘッダーおよび `Authentication` ヘッダーは常に制限されており、この関数で取得することはできない点に注意してください。

## allow_hyperscan \{#allow_hyperscan\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Hyperscan ライブラリを利用する関数の使用を許可します。無効にすると、コンパイルに長時間を要したり、過剰なリソース消費が発生する可能性を回避できます。

## allow_introspection_functions \{#allow_introspection_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリプロファイリング用の[イントロスペクション関数](../../sql-reference/functions/introspection.md)を有効または無効にします。

取り得る値:

- 1 — イントロスペクション関数を有効にします。
- 0 — イントロスペクション関数を無効にします。

**関連項目**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- システムテーブル [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \{#allow_materialized_view_with_bad_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "存在しないカラムまたはテーブルを参照する MV の作成を許可しない"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "CREATE MATERIALIZED VIEW におけるより厳密な検証をサポート（ただしまだ有効化はされない）"}]}]}/>

存在しないテーブルまたはカラムを参照する SELECT クエリを伴う CREATE MATERIALIZED VIEW を許可します。ただし、構文的に正しい必要があります。refreshable MV には適用されません。SELECT クエリから MV のスキーマを推論する必要がある場合（つまり、CREATE にカラムリストも TO テーブルもない場合）には適用されません。ソーステーブルより先に MV を作成する場合に利用できます。

## allow_named_collection_override_by_default \{#allow_named_collection_override_by_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

名前付きコレクションのフィールドの上書きをデフォルトで許可します。

## allow_non_metadata_alters \{#allow_non_metadata_alters\} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルのメタデータだけでなく、ディスク上のデータにも影響を与える `ALTER` 文の実行を許可します

## allow_nonconst_timezone_arguments \{#allow_nonconst_timezone_arguments\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "特定の時間関連関数 (toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() など) で非定数のタイムゾーン引数を許可します。"}]}]}/>

toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*() などの特定の時間関連関数で、非定数のタイムゾーン引数を許可します。
この設定は互換性の目的のみで存在します。ClickHouse では、タイムゾーンはデータ型、つまりカラムのプロパティです。
この設定を有効にすると、1 つのカラム内で値ごとに異なるタイムゾーンを持つことができるかのような誤った印象を与えます。
したがって、この設定は有効にしないでください。

## allow&#95;nondeterministic&#95;mutations

<SettingsInfoBlock type="Bool" default_value="0" />

`dictGet` などの非決定的関数を、レプリケートテーブルに対するミューテーションで使用できるようにするユーザーレベル設定です。

たとえば辞書はノード間で内容が同期していない可能性があるため、それらから値を取得するミューテーションは、デフォルトではレプリケートテーブルでは許可されていません。この設定を有効にすると、そのような動作が許可され、その場合はすべてのノード間で使用されるデータの同期を保証する責任がユーザーに移ります。

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

シャーディングキーで非決定的な関数（`rand` や `dictGet` など。後者には更新時にいくつか注意点があります）の使用を許可します。

設定値：

- 0 — 不許可。
- 1 — 許可。

## allow_not_comparable_types_in_comparison_functions \{#allow_not_comparable_types_in_comparison_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "デフォルトで、比較できない型を比較関数で使用することを許可しない"}]}]}/>

`JSON` や `AggregateFunction` のような比較できない型を、`equal`/`less`/`greater` などの比較関数で使用することを許可または禁止します。

## allow_not_comparable_types_in_order_by \{#allow_not_comparable_types_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "デフォルトで ORDER BY で比較できない型を許可しない"}]}]}/>

JSON や AggregateFunction などの比較できない型を ORDER BY キーとして使用することを許可するかどうかを制御します。

## allow_prefetched_read_pool_for_local_filesystem \{#allow_prefetched_read_pool_for_local_filesystem\} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべてのパーツがローカルファイルシステム上にある場合、プリフェッチ済み読み取り用のスレッドプールの使用を優先します

## allow_prefetched_read_pool_for_remote_filesystem \{#allow_prefetched_read_pool_for_remote_filesystem\} 

<SettingsInfoBlock type="Bool" default_value="1" />

すべてのパーツがリモートファイルシステム上にある場合、プリフェッチ用のスレッドプールを優先的に使用します。

## allow_push_predicate_ast_for_distributed_subqueries \{#allow_push_predicate_ast_for_distributed_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

analyzer が有効化されている分散サブクエリに対して、AST レベルでの述語プッシュダウンを許可します

## allow_push_predicate_when_subquery_contains_with \{#allow_push_predicate_when_subquery_contains_with\} 

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに WITH 句が含まれている場合に述語プッシュダウンを許可します

## allow_reorder_prewhere_conditions \{#allow_reorder_prewhere_conditions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

WHERE から PREWHERE へ条件を移動する際に、フィルタリングを最適化できるよう条件の並び替えを許可する。

## allow&#95;settings&#95;after&#95;format&#95;in&#95;insert

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "INSERT クエリで FORMAT の後に SETTINGS を書くことを許可しません。これは、ClickHouse が SETTINGS を値として解釈してしまい、誤解を招くためです。"}]}]} />

`INSERT` クエリで `FORMAT` の後に `SETTINGS` を書くことを許可するかどうかを制御します。`SETTINGS` の一部が値として解釈される可能性があるため、この設定を有効にすることは推奨されません。

例:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

ただし、次のクエリを実行できるのは、`allow_settings_after_format_in_insert` が有効な場合のみです。

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

取り得る値:

* 0 — 許可しない
* 1 — 許可する

:::note
古い構文に依存するユースケースがある場合にのみ、後方互換性のためにこの設定を使用してください。
:::


## allow_simdjson \{#allow_simdjson\} 

<SettingsInfoBlock type="Bool" default_value="1" />

AVX2 命令が利用可能な場合に、`JSON*` 関数で simdjson ライブラリを使用できるようにします。無効な場合は rapidjson が使用されます。

## allow_special_serialization_kinds_in_output_formats \{#allow_special_serialization_kinds_in_output_formats\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "一部の出力フォーマットで Sparse/Replicated のような特殊なカラム表現をそのまま直接出力できるようにする"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Sparse/Replicated のような特殊なカラム表現をフルカラムに変換せずに出力できるようにする設定を追加"}]}]}/>

Sparse や Replicated などの特殊なシリアル化種別を持つカラムを、フルカラム表現に変換せずに出力できるようにします。
これにより、フォーマット処理時の不要なデータコピーを回避できます。

## allow_statistics_optimize \{#allow_statistics_optimize\} 

<ExperimentalBadge/>

**エイリアス**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "設定名が変更されました。以前の名前は `allow_statistic_optimize` です。"}]}]}/>

クエリの最適化に統計情報を使用できるようにします。

## allow_suspicious_codecs \{#allow_suspicious_codecs\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "意味のない圧縮コーデックの指定を許可しない"}]}]}/>

true に設定すると、意味のない圧縮コーデックも指定できるようになります。

## allow_suspicious_fixed_string_types \{#allow_suspicious_fixed_string_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE TABLE ステートメントで、FixedString(n) 型かつ n > 256 の列を作成できるようにします。長さが 256 以上の FixedString は疑わしいと見なされ、多くの場合は誤用を示しています。

## allow_suspicious_indices \{#allow_suspicious_indices\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "true の場合、同一の式でインデックスを定義できます"}]}]}/>

同一の式を持つ主キー／セカンダリインデックスおよびソートキーを拒否します

## allow_suspicious_low_cardinality_types \{#allow_suspicious_low_cardinality_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

固定サイズが 8 バイト以下のデータ型（数値型および `FixedString(8_bytes_or_less)`）で [LowCardinality](../../sql-reference/data-types/lowcardinality.md) を使用することを許可または禁止します。

サイズの小さい固定長の値に対して `LowCardinality` を使用すると、通常は非効率的です。これは ClickHouse が各行に対して数値インデックスを保存するためです。その結果として、次のような影響があります:

- ディスク使用量が増加する可能性があります。
- 辞書サイズによっては、RAM 消費量が増える可能性があります。
- 追加のエンコード/デコード処理が必要になるため、一部の関数が遅くなる可能性があります。

上記のすべての理由により、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンのテーブルにおけるマージ処理時間が長くなる可能性があります。

設定可能な値:

- 1 — `LowCardinality` の使用を制限しません。
- 0 — `LowCardinality` の使用を制限します。

## allow_suspicious_primary_key \{#allow_suspicious_primary_key\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "MergeTree テーブルに対する疑わしい PRIMARY KEY/ORDER BY（例: SimpleAggregateFunction）を禁止"}]}]}/>

MergeTree テーブルに対する疑わしい `PRIMARY KEY`/`ORDER BY`（例: `SimpleAggregateFunction`）を許可します。

## allow_suspicious_ttl_expressions \{#allow_suspicious_ttl_expressions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "新しい設定です。以前のバージョンでは、許可されているのと同じ動作でした。"}]}]}/>

テーブルのどの列にも依存しない TTL 式を拒否します。これは多くの場合、ユーザーの設定ミスを示します。

## allow_suspicious_types_in_group_by \{#allow_suspicious_types_in_group_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトで GROUP BY 句のキーとしての Variant/Dynamic 型の使用を許可しない"}]}]}/>

GROUP BY 句のキーとして [Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を使用できるかどうかを制御します。

## allow_suspicious_types_in_order_by \{#allow_suspicious_types_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "デフォルトでは ORDER BY で Variant/Dynamic 型を許可しない"}]}]}/>

[Variant](../../sql-reference/data-types/variant.md) 型および [Dynamic](../../sql-reference/data-types/dynamic.md) 型を ORDER BY キーで使用することを許可するかどうかを制御します。

## allow_suspicious_variant_types \{#allow_suspicious_variant_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "デフォルトでは、紛らわしいバリアントを含む Variant 型の作成を許可しない"}]}]}/>

この設定を有効にすると、CREATE TABLE ステートメントで、似通ったバリアント型（たとえば異なる数値型や日付型）を持つ Variant 型を指定できるようになります。この設定を有効にすると、類似した型の値を扱う際に解釈があいまいになる可能性があります。

## allow_unrestricted_reads_from_keeper \{#allow_unrestricted_reads_from_keeper\} 

<SettingsInfoBlock type="Bool" default_value="0" />

system.zookeeper テーブルに対する（パス条件なしの）制限のない読み取りを許可します。便利な場合もありますが、ZooKeeper にとって安全ではありません。

## alter_move_to_space_execute_async \{#alter_move_to_space_execute_async\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ALTER TABLE MOVE ... TO [DISK|VOLUME] を非同期で実行する

## alter&#95;partition&#95;verbose&#95;result

<SettingsInfoBlock type="Bool" default_value="0" />

パーティションおよびパーツに対する操作が正常に適用されたパーツについて、その情報を表示するかどうかを制御します。
[ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) および [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) に適用されます。

設定可能な値:

* 0 — 詳細表示を無効にする。
* 1 — 詳細表示を有効にする。

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

**エイリアス**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

[ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md)、[TRUNCATE](../../sql-reference/statements/truncate.md) クエリによってレプリカ上で実行されるアクションを、どの程度待機するかを設定します。

設定可能な値:

- `0` — 待機しない。
- `1` — 自身での実行完了まで待機する。
- `2` — すべてのレプリカでの実行完了まで待機する。

Cloud におけるデフォルト値: `1`。

:::note
`alter_sync` は `Replicated` テーブルにのみ適用され、`Replicated` でないテーブルに対する ALTER には何も行いません。
:::

## alter_update_mode \{#alter_update_mode\} 

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

`UPDATE` コマンドを含む `ALTER` クエリのモード。

設定可能な値:

- `heavy` - 通常のミューテーションを実行します。
- `lightweight` - 可能であれば軽量更新を実行し、それ以外の場合は通常のミューテーションを実行します。
- `lightweight_force` - 可能であれば軽量更新を実行し、それ以外の場合はエラーをスローします。

## analyze_index_with_space_filling_curves \{#analyze_index_with_space_filling_curves\} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブルのインデックスが空間充填曲線で定義されている場合（例: `ORDER BY mortonEncode(x, y)` や `ORDER BY hilbertEncode(x, y)`）に、その引数（x, y）に対する条件（例: `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`）を含むクエリがあると、インデックスの解析に空間充填曲線を使用します。

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

ネストに複合識別子を追加できるようにします。これはクエリ結果が変化するための互換性設定です。無効にすると、`SELECT a.b.c FROM table ARRAY JOIN a` は動作せず、`SELECT a FROM table` を実行しても、結果の `Nested a` 列に `a.b.c` 列が含まれなくなります。

## analyzer_compatibility_join_using_top_level_identifier \{#analyzer_compatibility_join_using_top_level_identifier\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "JOIN USING での識別子をプロジェクションから解決するよう強制"}]}]}/>

JOIN USING で使用される識別子を、プロジェクションから解決するよう強制します（たとえば `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` の場合、結合は `t1.b = t2.b` ではなく `t1.a + 1 = t2.b` によって行われます）。

## any_join_distinct_right_table_keys \{#any_join_distinct_right_table_keys\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "Disable ANY RIGHT and ANY FULL JOINs by default to avoid inconsistency"}]}]}/>

`ANY INNER|LEFT JOIN` 演算において、従来の ClickHouse サーバーの動作を有効にします。

:::note
従来の `JOIN` の動作に依存しているユースケースで後方互換性が必要な場合にのみ、この設定を使用してください。
:::

従来動作が有効な場合:

- `t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` 演算の結果は等しくありません。これは、ClickHouse が多対一の「左テーブルから右テーブル」へのテーブルキーのマッピングロジックを使用するためです。
- `ANY INNER JOIN` 演算の結果には、`SEMI LEFT JOIN` 演算と同様に、左テーブルのすべての行が含まれます。

従来動作が無効な場合:

- `t1 ANY LEFT JOIN t2` と `t2 ANY RIGHT JOIN t1` 演算の結果は等しくなります。これは、ClickHouse が `ANY RIGHT JOIN` 演算において、一対多のキーのマッピングを行うロジックを使用するためです。
- `ANY INNER JOIN` 演算の結果には、左テーブルと右テーブルの両方について、キーごとに 1 行のみが含まれます。

設定値:

- 0 — 従来動作を無効にします。
- 1 — 従来動作を有効にします。

関連項目:

- [JOIN strictness](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \{#apply_deleted_mask\} 

<SettingsInfoBlock type="Bool" default_value="1" />

lightweight DELETE によって削除された行を除外するフィルタリングを有効にします。無効にすると、クエリでそれらの行も読み取れるようになります。これはデバッグや「削除の取り消し」シナリオに役立ちます。

## apply_mutations_on_fly \{#apply_mutations_on_fly\} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、データパーツにまだマテリアライズされていないミューテーション（UPDATE および DELETE）は、SELECT の実行時に適用されます。

## apply_patch_parts \{#apply_patch_parts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい設定"}]}]}/>

true の場合、軽量な更新を表す patch parts が SELECT クエリの実行時に適用されます。

## apply_patch_parts_join_cache_buckets \{#apply_patch_parts_join_cache_buckets\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Join モードでパッチパーツを適用するために使用される一時キャッシュのバケット数。

## apply_settings_from_server \{#apply_settings_from_server\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "クライアント側のコード（例: INSERT の入力データのパースおよびクエリ出力のフォーマット）が、サーバー設定からのものを含め、サーバーと同じ設定を使用するようになります。"}]}]}/>

クライアントがサーバーから送信される設定を受け入れるかどうか。

これはクライアント側で実行される処理のみに影響します。特に、INSERT 入力データのパースおよびクエリ結果のフォーマットに影響します。クエリ実行の大部分はサーバー側で行われ、この設定の影響は受けません。

通常、この設定はユーザープロファイル（users.xml や `ALTER USER` のようなクエリ）で指定し、クライアント側（クライアントのコマンドライン引数、`SET` クエリ、`SELECT` クエリの `SETTINGS` セクション）から指定すべきではありません。クライアント側からは、この値を `false` に変更することはできますが、`true` に変更することはできません（ユーザープロファイルで `apply_settings_from_server = false` になっている場合、サーバーは設定を送信しないためです）。

なお、当初（24.12）にはサーバー側の設定（`send_settings_to_client`）が存在していましたが、その後、使い勝手を向上させるために、このクライアント側の設定に置き換えられました。

## arrow_flight_request_descriptor_type \{#arrow_flight_request_descriptor_type\} 

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "新しい設定。Arrow Flight リクエストで使用するディスクリプタのタイプ: 'path' または 'command'。Dremio では 'command' が必要です。"}]}]}/>

Arrow Flight リクエストで使用するディスクリプタのタイプを指定します。'path' はデータセット名をパスディスクリプタとして送信します。'command' は SQL クエリをコマンドディスクリプタとして送信します（Dremio では必須）。

指定可能な値:

- 'path' — FlightDescriptor::Path を使用（デフォルト。ほとんどの Arrow Flight サーバーで動作）
- 'command' — SELECT クエリと共に FlightDescriptor::Command を使用（Dremio では必須）

## asterisk_include_alias_columns \{#asterisk_include_alias_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）で [ALIAS](../../sql-reference/statements/create/table.md/#alias) 列も含めます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## asterisk_include_materialized_columns \{#asterisk_include_materialized_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ワイルドカードクエリ（`SELECT *`）で、[MATERIALIZED](/sql-reference/statements/create/view#materialized-view) カラムを結果に含めるかどうかを制御します。

指定可能な値:

- 0 - 無効
- 1 - 有効

## async_insert \{#async_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、INSERT クエリからのデータはキューに蓄えられ、その後バックグラウンドでテーブルにフラッシュされます。wait_for_async_insert が false の場合、INSERT クエリはほぼ即座に処理され、それ以外の場合は、クライアントはデータがテーブルにフラッシュされるまで待機します。

## async_insert_busy_timeout_decrease_rate \{#async_insert_busy_timeout_decrease_rate\} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "適応型非同期挿入タイムアウトが減少する際の指数的な減少率"}]}]}/>

適応型非同期挿入タイムアウトが減少する際の指数的な減少率

## async_insert_busy_timeout_increase_rate \{#async_insert_busy_timeout_increase_rate\} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "アダプティブな非同期 INSERT タイムアウトを指数的に増加させる割合"}]}]}/>

アダプティブな非同期 INSERT タイムアウトを指数的に増加させる割合

## async_insert_busy_timeout_max_ms \{#async_insert_busy_timeout_max_ms\} 

**別名**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "非同期挿入タイムアウトの最小値（ミリ秒）。async_insert_busy_timeout_ms は async_insert_busy_timeout_max_ms の別名です"}]}]}/>

最初のデータが出現してから、クエリごとに収集されたデータをフラッシュするまで待機する最大時間。

## async_insert_busy_timeout_min_ms \{#async_insert_busy_timeout_min_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "非同期挿入タイムアウトの最小値（ミリ秒）。また、後で適応アルゴリズムによって増加される可能性のある初期値としても使用されます"}]}]}/>

async_insert_use_adaptive_busy_timeout による自動調整が有効化されている場合、最初のデータが現れてから、クエリごとに収集されたデータをダンプするまでに待機する最小時間です。また、適応アルゴリズムの初期値としても使用されます

## async_insert_deduplicate \{#async_insert_deduplicate\} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケーテッドテーブルに対する非同期 INSERT クエリで、挿入ブロックの重複排除を行うかどうかを指定します。

## async_insert_max_data_size \{#async_insert_max_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "以前の値は小さすぎると判断されました。"}]}]}/>

クエリごとに挿入前に蓄積される未解析データの最大サイズ（バイト単位）

## async_insert_max_query_number \{#async_insert_max_query_number\} 

<SettingsInfoBlock type="UInt64" default_value="450" />

実際に挿入が行われるまでにバッファリングされる insert クエリの最大数。
設定 [`async_insert_deduplicate`](#async_insert_deduplicate) が 1 の場合にのみ有効です。

## async_insert_poll_timeout_ms \{#async_insert_poll_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "非同期挿入キューからデータをポーリングする際のタイムアウト（ミリ秒単位）"}]}]}/>

非同期挿入キューからデータをポーリングする際のタイムアウト

## async_insert_use_adaptive_busy_timeout \{#async_insert_use_adaptive_busy_timeout\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "適応的な非同期挿入タイムアウトを使用"}]}]}/>

true に設定されている場合、非同期挿入に対して適応的なビジータイムアウトを使用します。

## async_query_sending_for_remote \{#async_query_sending_for_remote\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "Create connections and send query async across shards"}]}]}/>

リモートクエリの実行時に、接続の確立およびクエリの送信を非同期で行えるようにします。

デフォルトで有効です。

## async_socket_for_remote \{#async_socket_for_remote\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "Fix all problems and turn on asynchronous reads from socket for remote queries by default again"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "Turn off asynchronous reads from socket for remote queries because of some problems"}]}]}/>

リモートクエリ実行時にソケットからの非同期読み取りを有効にします。

デフォルトで有効です。

## azure_allow_parallel_part_upload \{#azure_allow_parallel_part_upload\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Azure マルチパートアップロードで複数スレッドを使用します。"}]}]}/>

Azure マルチパートアップロードで複数スレッドを使用します。

## azure_check_objects_after_upload \{#azure_check_objects_after_upload\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "アップロードが成功したことを確認するために、Azure Blob Storage の各アップロード済みオブジェクトを確認します"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "アップロードが成功したことを確認するために、Azure Blob Storage の各アップロード済みオブジェクトを確認します"}]}]}/>

アップロードが成功したことを確認するために、Azure Blob Storage の各アップロード済みオブジェクトを確認します

## azure_connect_timeout_ms \{#azure_connect_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

Azure ディスク上のホストへの接続タイムアウト時間。

## azure_create_new_file_on_insert \{#azure_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

azure エンジンのテーブルへの各 `INSERT` ごとに新しいファイルを作成するかどうかを有効または無効にします。

## azure_ignore_file_doesnt_exist \{#azure_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、AzureBlobStorage テーブルエンジンが例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み込む際、対象のファイルが存在しない場合でもエラーとせず無視します。

設定可能な値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## azure_list_object_keys_size \{#azure_list_object_keys_size\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストで 1 度のバッチとして返されるファイル数の最大値

## azure_max_blocks_in_multipart_upload \{#azure_max_blocks_in_multipart_upload\} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Azure のマルチパートアップロードで使用できるブロック数の最大値。"}]}]}/>

Azure のマルチパートアップロードで使用できるブロック数の最大値。

## azure_max_get_burst \{#azure_max_get_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定"}]}]}/>

1 秒あたりのリクエスト数の上限に達する前に、同時に発行できるリクエストの最大数です。デフォルト値 (0) の場合は、`azure_max_get_rps` と同じになります。

## azure_max_get_rps \{#azure_max_get_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

スロットリングが発生する前の、1 秒あたりの Azure GET リクエスト数の上限。0 の場合は無制限です。

## azure_max_inflight_parts_for_one_file \{#azure_max_inflight_parts_for_one_file\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "マルチパートアップロード要求で同時にアップロードされるパートの最大数。0 は無制限を意味します。"}]}]}/>

マルチパートアップロード要求で同時にアップロードされるパートの最大数。0 は無制限を意味します。

## azure_max_put_burst \{#azure_max_put_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

1 秒あたりのリクエスト数制限に達する前に同時に送信できる最大リクエスト数。デフォルト値 (0) の場合は `azure_max_put_rps` と同じ値になります。

## azure_max_put_rps \{#azure_max_put_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

スロットリングが発生する前の 1 秒あたりの Azure PUT リクエスト数の上限です。0 は無制限を意味します。

## azure_max_redirects \{#azure_max_redirects\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

許可される Azure リダイレクトのホップ数の上限。

## azure_max_single_part_copy_size \{#azure_max_single_part_copy_size\} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "single part copy を使用して Azure Blob Storage にコピーできるオブジェクトの最大サイズ。"}]}]}/>

single part copy を使用して Azure Blob Storage にコピーできるオブジェクトの最大サイズ。

## azure_max_single_part_upload_size \{#azure_max_single_part_upload_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "S3 と整合"}]}]}/>

単一パートアップロードで Azure Blob Storage にアップロードするオブジェクトの最大サイズ。

## azure_max_single_read_retries \{#azure_max_single_read_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

1 回の Azure Blob Storage 読み取り処理における再試行の最大回数。

## azure_max_unexpected_write_error_retries \{#azure_max_unexpected_write_error_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Azure Blob Storage への書き込み中に予期しないエラーが発生した場合の最大再試行回数"}]}]}/>

Azure Blob Storage への書き込み中に予期しないエラーが発生した場合の最大再試行回数

## azure_max_upload_part_size \{#azure_max_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの最大サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの最大サイズ。

## azure_min_upload_part_size \{#azure_min_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの最小サイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの最小サイズ。

## azure_request_timeout_ms \{#azure_request_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Azure との間でデータを送受信する際のアイドルタイムアウトです。単一の TCP 読み取りまたは書き込み呼び出しがこの時間以上ブロックされた場合、失敗と見なされます。

## azure_sdk_max_retries \{#azure_sdk_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK での最大リトライ回数"}]}]}/>

Azure SDK での最大リトライ回数

## azure_sdk_retry_initial_backoff_ms \{#azure_sdk_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Azure SDK におけるリトライ間の最小バックオフ時間"}]}]}/>

Azure SDK におけるリトライ間の最小バックオフ時間

## azure_sdk_retry_max_backoff_ms \{#azure_sdk_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Azure SDK のリトライ間に適用される最大バックオフ時間"}]}]}/>

Azure SDK のリトライ間に適用される最大バックオフ時間

## azure_skip_empty_files \{#azure_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "azure table エンジンで空ファイルをスキップできるようにする"}]}]}/>

S3 エンジンで空ファイルをスキップするかどうかを制御します。

設定可能な値:

- 0 — 空ファイルが要求された形式と互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## azure_strict_upload_part_size \{#azure_strict_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの厳密なサイズ。"}]}]}/>

Azure Blob Storage へのマルチパートアップロード時にアップロードする各パートの厳密なサイズ。

## azure_throw_on_zero_files_match \{#azure_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "ListObjects リクエストが Azure Blob Storage エンジン内のいずれのファイルとも一致しない場合に、空のクエリ結果ではなくエラーをスローできるようにする"}]}]}/>

グロブ展開ルールに従った結果、一致するファイルが 0 件の場合にエラーをスローします。

可能な値:

- 1 — `SELECT` は例外をスローします。
- 0 — `SELECT` は空の結果を返します。

## azure_truncate_on_insert \{#azure_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Azure エンジンのテーブルに挿入する前にテーブルを切り詰め（TRUNCATE）するかどうかを有効または無効にします。

## azure_upload_part_size_multiply_factor \{#azure_upload_part_size_multiply_factor\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "単一の書き込み操作から Azure Blob Storage に対して azure_multiply_parts_count_threshold 個のパーツがアップロードされるたびに、azure_min_upload_part_size にこの係数を掛けます。"}]}]}/>

単一の書き込み操作から Azure Blob Storage に対して azure_multiply_parts_count_threshold 個のパーツがアップロードされるたびに、azure_min_upload_part_size にこの係数を掛けます。

## azure_upload_part_size_multiply_parts_count_threshold \{#azure_upload_part_size_multiply_parts_count_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "この数のパートが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size は azure_upload_part_size_multiply_factor 倍に更新されます。"}]}]}/>

この数のパートが Azure Blob Storage にアップロードされるたびに、azure_min_upload_part_size は azure_upload_part_size_multiply_factor 倍に更新されます。

## azure_use_adaptive_timeouts \{#azure_use_adaptive_timeouts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、すべての Azure リクエストに対して、最初の 2 回の試行は送信および受信タイムアウト値を短くして行われます。
`false` に設定すると、すべての試行で同一のタイムアウト値が使用されます。

## backup_restore_batch_size_for_keeper_multi \{#backup_restore_batch_size_for_keeper_multi\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

バックアップまたはリストア時に [Zoo]Keeper へ送信される multi リクエストの最大バッチサイズ

## backup_restore_batch_size_for_keeper_multiread \{#backup_restore_batch_size_for_keeper_multiread\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

バックアップまたはリストア中に [Zoo]Keeper への multiread リクエストで使用されるバッチの最大サイズ

## backup_restore_failure_after_host_disconnected_for_seconds \{#backup_restore_failure_after_host_disconnected_for_seconds\} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER の実行中に、ホストがこの時間のあいだ ZooKeeper 内のエフェメラルな `alive` ノードを再作成しなかった場合、そのバックアップまたはリストア全体は失敗したものと見なされます。
この値は、障害発生後にホストが ZooKeeper に再接続するまでの妥当な時間よりも大きく設定する必要があります。
0 の場合は無制限を意味します。

## backup_restore_finish_timeout_after_error_sec \{#backup_restore_finish_timeout_after_error_sec\} 

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "新しい設定。"}]}]}/>

イニシエーターが、`error` ノードへの他のホストの反応と、現在の BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作の停止を、どれだけの時間待つかを指定します。

## backup_restore_keeper_fault_injection_probability \{#backup_restore_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

バックアップまたはリストア中の keeper リクエストに対する障害発生のおおよその確率。指定可能な値は [0.0f, 1.0f] の範囲です。

## backup_restore_keeper_fault_injection_seed \{#backup_restore_keeper_fault_injection_seed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 の場合はランダムシード。それ以外の場合は、その値が設定値として使用されます

## backup_restore_keeper_max_retries \{#backup_restore_keeper_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "一時的な [Zoo]Keeper の障害が途中で発生しても、BACKUP または RESTORE 操作全体が失敗しないように、十分大きな値にする必要があります。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "一時的な [Zoo]Keeper の障害が途中で発生しても、BACKUP または RESTORE 操作全体が失敗しないように、十分大きな値にする必要があります。"}]}]}/>

BACKUP または RESTORE 操作の途中で実行される [Zoo]Keeper 操作の最大リトライ回数。
一時的な [Zoo]Keeper の障害が発生しても操作全体が失敗しないよう、十分大きな値にする必要があります。

## backup_restore_keeper_max_retries_while_handling_error \{#backup_restore_keeper_max_retries_while_handling_error\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "新しい設定です。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "新しい設定です。"}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER の操作において、エラー処理中に行われる [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_max_retries_while_initializing \{#backup_restore_keeper_max_retries_while_initializing\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

BACKUP ON CLUSTER または RESTORE ON CLUSTER の初期化中における [Zoo]Keeper 操作の最大再試行回数。

## backup_restore_keeper_retry_initial_backoff_ms \{#backup_restore_keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

バックアップまたはリストア中の [Zoo]Keeper 操作に対するバックオフの初期待機時間

## backup_restore_keeper_retry_max_backoff_ms \{#backup_restore_keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

バックアップまたはリストア中の [Zoo]Keeper 操作に対する最大バックオフ時間

## backup_restore_keeper_value_max_size \{#backup_restore_keeper_value_max_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

バックアップ時の [Zoo]Keeper ノードデータの最大サイズ

## backup_restore_s3_retry_attempts \{#backup_restore_s3_retry_attempts\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Aws::Client::RetryStrategy の設定です。Aws::Client が内部でリトライを実行し、0 はリトライなしを意味します。バックアップ／リストア時にのみ有効です。"}]}]}/>

Aws::Client::RetryStrategy の設定です。Aws::Client が内部でリトライを実行し、0 はリトライなしを意味します。バックアップ／リストア時にのみ有効です。

## backup_restore_s3_retry_initial_backoff_ms \{#backup_restore_s3_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

バックアップおよびリストア中の、最初の再試行の前に待機する初期待ち時間（ミリ秒単位）。その後の各再試行では、`backup_restore_s3_retry_max_backoff_ms` で指定された最大値に達するまで、この待ち時間が指数関数的に増加します。

## backup_restore_s3_retry_jitter_factor \{#backup_restore_s3_retry_jitter_factor\} 

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "New setting"}]}]}/>

バックアップおよびリストア処理中に、Aws::Client::RetryStrategy におけるリトライ時のバックオフ遅延に適用されるジッタ係数です。計算されたバックオフ遅延は、`backup_restore_s3_retry_max_backoff_ms` を上限として、[1.0, 1.0 + jitter] の範囲のランダムな係数を掛け合わせることで決定されます。値は [0.0, 1.0] の範囲である必要があります。

## backup_restore_s3_retry_max_backoff_ms \{#backup_restore_s3_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

バックアップおよびリストア処理中の再試行間の最大遅延時間（ミリ秒単位）を指定します。

## backup_slow_all_threads_after_retryable_s3_error \{#backup_slow_all_threads_after_retryable_s3_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable the setting by default"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントに対して S3 リクエストを実行しているすべてのスレッドが、いずれかの S3 リクエストで `Slow Down` のような再試行可能な S3 エラーが発生した後にスローダウンするようになります。
`false` に設定すると、各スレッドは他のスレッドとは独立して、S3 リクエストのバックオフ処理を行います。

## cache_warmer_threads \{#cache_warmer_threads\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

ClickHouse Cloud でのみ有効です。[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) が有効な場合に、新しいデータパーツをファイルキャッシュに先行してダウンロードするバックグラウンドスレッドの数を指定します。0 を指定すると無効になります。

## calculate_text_stack_trace \{#calculate_text_stack_trace\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行中に例外が発生した場合に、テキスト形式のスタックトレースを生成します。これがデフォルトの動作です。大量の誤ったクエリを実行するファジングテストでは、シンボルのルックアップが必要になるため、処理が遅くなる可能性があります。通常のケースでは、このオプションは無効化しないことを推奨します。

## cancel_http_readonly_queries_on_client_close \{#cancel_http_readonly_queries_on_client_close\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントがレスポンスを待たずに接続を閉じた場合に、HTTP経由の読み取り専用クエリ（例: SELECT）をキャンセルします。

Cloudのデフォルト値: `0`。

## cast_ipv4_ipv6_default_on_conversion_error \{#cast_ipv4_ipv6_default_on_conversion_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "関数 cast(value, 'IPv4') および cast(value, 'IPv6') を toIPv4 関数および toIPv6 関数と同じ動作にする"}]}]}/>

IPv4 型および IPv6 型への CAST 演算子と toIPv4、toIPv6 関数は、変換エラーが発生した場合、例外をスローする代わりにデフォルト値を返します。

## cast&#95;keep&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

[CAST](/sql-reference/functions/type-conversion-functions#cast) 操作において、`Nullable` データ型を保持するかどうかを切り替えます。

この設定が有効で、`CAST` 関数の引数が `Nullable` の場合、結果も `Nullable` 型に変換されます。設定が無効な場合、結果は常に指定された変換先の型と完全に一致します。

可能な値:

* 0 — `CAST` の結果は、指定された変換先の型と完全に一致します。
* 1 — 引数の型が `Nullable` の場合、`CAST` の結果は `Nullable(DestinationDataType)` に変換されます。

**例**

次のクエリでは、結果のデータ型は変換先のデータ型と完全に一致します。

```sql
SET cast_keep_nullable = 0;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

結果:

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Int32                                             │
└───┴───────────────────────────────────────────────────┘
```

次のクエリを実行すると、宛先データ型に `Nullable` 修飾子が付きます。

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


## cast_string_to_date_time_mode \{#cast_string_to_date_time_mode\} 

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

String から DateTime へのキャスト時に、日付と時刻の文字列表現を解析するパーサーを選択できるようにします。

指定可能な値:

- `'best_effort'` — 拡張された解析を有効にします。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` に加えて、すべての [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 日付および時刻形式を解析できます。たとえば `'2018-06-08T01:02:03.000Z'` です。

- `'best_effort_us'` — `best_effort` と同様です（相違点については [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus) を参照してください）。

- `'basic'` — 基本パーサーを使用します。

    ClickHouse は基本形式 `YYYY-MM-DD HH:MM:SS` または `YYYY-MM-DD` のみを解析できます。たとえば `2019-08-20 10:18:56` や `2019-08-20` です。

関連項目:

- [DateTime データ型。](../../sql-reference/data-types/datetime.md)
- [日付と時刻を扱う関数。](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \{#cast_string_to_dynamic_use_inference\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "String から Dynamic への変換時に、パースにより変換を許可する設定を追加"}]}]}/>

String から Dynamic への変換時に型推論を使用します。

## cast_string_to_variant_use_inference \{#cast_string_to_variant_use_inference\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "String 型から Variant 型への CAST 時に型推論を有効／無効にする新しい設定"}]}]}/>

String 型から Variant 型への変換時に型推論を使用します。

## check_query_single_value_result \{#check_query_single_value_result\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "CHECK TABLE をより有用にするために設定を変更"}]}]}/>

`MergeTree` ファミリーエンジンに対する [CHECK TABLE](/sql-reference/statements/check-table) クエリ結果の詳細レベルを定義します。

設定可能な値:

- 0 — クエリはテーブルの各データパーツごとのチェックステータスを表示します。
- 1 — クエリはテーブル全体のチェックステータスを表示します。

## check_referential_table_dependencies \{#check_referential_table_dependencies\} 

<SettingsInfoBlock type="Bool" default_value="0" />

DDL クエリ（`DROP TABLE` や `RENAME` など）が参照上の依存関係を損なわないことを検査します

## check_table_dependencies \{#check_table_dependencies\} 

<SettingsInfoBlock type="Bool" default_value="1" />

DROP TABLE や RENAME などの DDL クエリによって依存関係が壊れないことを確認します

## checksum_on_read \{#checksum_on_read\} 

<SettingsInfoBlock type="Bool" default_value="1" />

読み取り時にチェックサムを検証します。デフォルトで有効になっており、本番環境では常に有効にしておく必要があります。この設定を無効にしても利点はありません。実験やベンチマーク目的でのみ使用してください。この設定は MergeTree ファミリーに属するテーブルにのみ適用されます。その他のテーブルエンジン、およびネットワーク経由でデータを受信する場合には、常にチェックサムが検証されます。

## cloud_mode \{#cloud_mode\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Cloud モード

## cloud_mode_database_engine \{#cloud_mode_database_engine\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

Cloud 環境で許可されるデータベースエンジン。1 - DDL を書き換えて Replicated データベースを使用する、2 - DDL を書き換えて Shared データベースを使用する。

## cloud_mode_engine \{#cloud_mode_engine\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Cloud で使用が許可されるエンジンファミリー。

- 0 - すべてを許可
- 1 - DDL 文を *ReplicatedMergeTree を使用するように書き換える
- 2 - DDL 文を SharedMergeTree を使用するように書き換える
- 3 - 明示的に指定された remote ディスクが渡された場合を除き、DDL 文を SharedMergeTree を使用するように書き換える

公開される部分を最小限に抑えるための UInt64 型

## cluster_for_parallel_replicas \{#cluster_for_parallel_replicas\} 

<BetaBadge/>

現在のサーバーが属しているシャード用のクラスター

## cluster_function_process_archive_on_multiple_nodes \{#cluster_function_process_archive_on_multiple_nodes\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、クラスタ関数でアーカイブを処理する際のパフォーマンスが向上します。以前のバージョンでアーカイブを利用するクラスタ関数を使用している場合は、25.7 以降にアップグレードする際の互換性を確保し、エラーを回避するために、この設定を `false` にしておいてください。

## cluster_table_function_buckets_batch_size \{#cluster_table_function_buckets_batch_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting."}]}]}/>

`bucket` 分割粒度を持つクラスタテーブル関数におけるタスクの分散処理で使用される、バッチのおおよそのサイズ（バイト単位）を定義します。システムは、この値以上になるまでデータを蓄積します。実際のサイズは、データ境界に揃えるためにこれよりわずかに大きくなる場合があります。

## cluster_table_function_split_granularity \{#cluster_table_function_split_granularity\} 

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "新しい設定。"}]}]}/>

CLUSTER TABLE FUNCTION を実行する際に、データをタスク単位にどのように分割するかを制御します。

この設定は、クラスター全体での処理分散の粒度を定義します。

- `file` — 各タスクが 1 つのファイル全体を処理します。
- `bucket` — ファイル内の内部データブロック（例: Parquet の row group（行グループ））ごとにタスクが作成されます。

より細かい粒度（`bucket` など）を選択すると、少数の大きなファイルを扱う場合に並列性を向上させることができます。
たとえば、1 つの Parquet ファイルに複数の row group（行グループ）が含まれている場合、`bucket` の粒度を有効にすると、各行グループを異なるワーカーが独立して処理できるようになります。

## collect_hash_table_stats_during_aggregation \{#collect_hash_table_stats_during_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

メモリ割り当てを最適化するために、ハッシュテーブルの統計情報を収集する機能を有効にします。

## collect_hash_table_stats_during_joins \{#collect_hash_table_stats_during_joins\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

メモリ割り当てを最適化するために、ハッシュテーブルの統計情報の収集を有効にする設定です。

## compatibility \{#compatibility\} 

`compatibility` 設定は、設定値として指定された過去バージョンの ClickHouse のデフォルト設定を ClickHouse で使用するようにします。

設定項目がデフォルト以外の値に明示的に設定されている場合、それらの設定はそのまま優先されます（`compatibility` 設定の影響を受けるのは、変更されていない設定のみです）。

この設定は、`22.3` や `22.8` のような文字列として ClickHouse のバージョン番号を受け取ります。空文字列を指定した場合、この設定は無効になります。

デフォルトでは無効です。

:::note
ClickHouse Cloud では、サービスレベルのデフォルト `compatibility` 設定は ClickHouse Cloud サポートによって設定される必要があります。設定を依頼するには、[サポートケースを作成](https://clickhouse.cloud/support) してください。
なお、`compatibility` 設定は、標準的な ClickHouse の設定機構（セッションで `SET compatibility = '22.3'` を実行する、クエリ内で `SETTINGS compatibility = '22.3'` を指定するなど）を用いて、ユーザー、ロール、プロファイル、クエリ、またはセッションのレベルで上書きできます。
:::

## compatibility_ignore_auto_increment_in_create_table \{#compatibility_ignore_auto_increment_in_create_table\} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、カラム定義中の AUTO_INCREMENT キーワードを無視し、false の場合はエラーを返します。MySQL からの移行を簡略化します。

## compatibility_ignore_collation_in_create_table \{#compatibility_ignore_collation_in_create_table\} 

<SettingsInfoBlock type="Bool" default_value="1" />

互換性のために CREATE TABLE での照合順序指定を無視する

## compile_aggregate_expressions \{#compile_aggregate_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約関数をネイティブコードに JIT コンパイルするかどうかを制御します。有効にするとパフォーマンスが向上する場合があります。

設定可能な値:

- 0 — 集約は JIT コンパイルなしで実行されます。
- 1 — 集約は JIT コンパイルを使用して実行されます。

**関連項目**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \{#compile_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "JIT コンパイラを支える LLVM インフラストラクチャは、この設定をデフォルトで有効にできるだけの十分な安定性に達したと判断しています。"}]}]}/>

一部のスカラ関数や演算子をネイティブコードにコンパイルします。

## compile_sort_description \{#compile_sort_description\} 

<SettingsInfoBlock type="Bool" default_value="1" />

ソート記述をネイティブコードとしてコンパイルします。

## connect_timeout \{#connect_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="10" />

レプリカが存在しない場合の接続タイムアウト値です。

## connect_timeout_with_failover_ms \{#connect_timeout_with_failover_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default connect timeout because of async connect"}]}]}/>

クラスタ定義で `shard` および `replica` セクションが使用されている場合の、`Distributed` テーブルエンジンにおけるリモートサーバーへの接続タイムアウト値（ミリ秒単位）です。
接続に失敗した場合は、複数のレプリカに対して接続を複数回試行します。

## connect_timeout_with_failover_secure_ms \{#connect_timeout_with_failover_secure_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "非同期接続に対応するため、デフォルトのセキュア接続タイムアウトを延長"}]}]}/>

セキュア接続時に、最初の正常なレプリカを選択するための接続タイムアウト。

## connection_pool_max_wait_ms \{#connection_pool_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

接続プールが満杯のときに、接続を確立するまで待機する時間（ミリ秒）。

取りうる値:

- 正の整数。
- 0 — タイムアウトなし（無期限）。

## connections_with_failover_max_tries \{#connections_with_failover_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Distributed テーブルエンジンで、各レプリカごとの接続試行の最大回数。

## convert&#95;query&#95;to&#95;cnf

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を `true` にすると、`SELECT` クエリは連言標準形 (CNF: Conjunctive Normal Form) に変換されます。クエリを CNF に書き換えることで、より高速に実行される場合があります（詳しくは [GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/11749) を参照してください）。

たとえば、次の `SELECT` クエリが変更されていないことに注目してください（これがデフォルトの動作です）:

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

`convert_query_to_cnf` を `true` に設定し、どのように変化するか確認してみましょう。

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

`WHERE` 句は CNF 形に書き換えられていますが、結果セットは同一であり、ブール論理も変わりません。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "New setting. Default join kind for decorrelated query plan."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "New setting. Default join kind for decorrelated query plan."}]}]}/>

デコリレーションされたクエリプランにおける結合の種類を制御します。デフォルト値は `right` であり、デコリレーションされたプランにはサブクエリ入力が右側にある RIGHT JOIN が含まれます。

指定可能な値:

- `left` - デコリレーション処理では LEFT JOIN が生成され、入力テーブルは左側に配置されます。
- `right` - デコリレーション処理では RIGHT JOIN が生成され、入力テーブルは右側に配置されます。

## correlated_subqueries_substitute_equivalent_expressions \{#correlated_subqueries_substitute_equivalent_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "相関サブクエリのプランニング最適化用の新しい設定。"}]}]}/>

フィルター式を使用して等価な式を推論し、CROSS JOIN を作成する代わりにそれらを代入します。

## count_distinct_implementation \{#count_distinct_implementation\} 

<SettingsInfoBlock type="String" default_value="uniqExact" />

[COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count) 構文を実行する際に、どの `uniq*` 関数を使用するかを指定します。

可能な値:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \{#count_distinct_optimization\} 

<SettingsInfoBlock type="Bool" default_value="0" />

COUNT(DISTINCT ...) を GROUP BY を用いたサブクエリに書き換えます

## count_matches_stop_at_empty_match \{#count_matches_stop_at_empty_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

`countMatches` 関数で、パターンが長さ 0 の文字列（空文字列）にマッチした時点でカウントを停止します。

## create_if_not_exists \{#create_if_not_exists\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

`CREATE` ステートメントに対して、デフォルトで `IF NOT EXISTS` を有効にします。この設定を有効にするか、あるいは明示的に `IF NOT EXISTS` を指定した場合、指定された名前のテーブルがすでに存在していても、例外はスローされません。

## create_index_ignore_unique \{#create_index_ignore_unique\} 

<SettingsInfoBlock type="Bool" default_value="0" />

CREATE UNIQUE INDEX ステートメント内の UNIQUE キーワードを無視します。SQL の互換性テスト用に用意された設定です。

## create_replicated_merge_tree_fault_injection_probability \{#create_replicated_merge_tree_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

ZooKeeper でメタデータを作成した後、テーブル作成時に障害注入を行う確率

## create_table_empty_primary_key_by_default \{#create_table_empty_primary_key_by_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

ORDER BY と PRIMARY KEY が指定されていない場合、空のプライマリキーを持つ *MergeTree テーブル* の作成を許可します

## cross_join_min_bytes_to_compress \{#cross_join_min_bytes_to_compress\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "CROSS JOIN で圧縮対象とするブロックの最小サイズ。0 を指定した場合、このしきい値は無効になります。このブロックは、行数またはバイト数のいずれかのしきい値に達したときに圧縮されます。"}]}]}/>

CROSS JOIN で圧縮対象とするブロックの最小サイズ。0 を指定した場合、このしきい値は無効になります。このブロックは、行数またはバイト数のいずれかのしきい値に達したときに圧縮されます。

## cross_join_min_rows_to_compress \{#cross_join_min_rows_to_compress\} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "CROSS JOIN においてブロックを圧縮するための最小行数。0 を指定した場合、このしきい値は無効化されます。ブロックは、行数またはバイト数のいずれかのしきい値に達した時点で圧縮されます。"}]}]}/>

CROSS JOIN においてブロックを圧縮するための最小行数。0 を指定した場合、このしきい値は無効化されます。ブロックは、行数またはバイト数のいずれかのしきい値に達した時点で圧縮されます。

## data_type_default_nullable \{#data_type_default_nullable\} 

<SettingsInfoBlock type="Bool" default_value="0" />

カラム定義で明示的な修飾子 [NULL または NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) が指定されていないデータ型を、[Nullable](/sql-reference/data-types/nullable) として扱います。

設定可能な値:

- 1 — カラム定義内のデータ型は、デフォルトで `Nullable` に設定されます。
- 0 — カラム定義内のデータ型は、デフォルトで非 `Nullable` に設定されます。

## database_atomic_wait_for_drop_and_detach_synchronously \{#database_atomic_wait_for_drop_and_detach_synchronously\} 

<SettingsInfoBlock type="Bool" default_value="0" />

すべての `DROP` および `DETACH` クエリに修飾子 `SYNC` を追加します。

設定可能な値:

- 0 — クエリは遅延を伴って実行されます。
- 1 — クエリは遅延なしで実行されます。

## database_replicated_allow_explicit_uuid \{#database_replicated_allow_explicit_uuid\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "テーブルの UUID を明示的に指定できないようにする新しい設定を追加"}]}]}/>

0 - Replicated データベース内のテーブルに対して UUID を明示的に指定することを許可しない。1 - 許可する。2 - 許可するが、指定された UUID は無視して代わりにランダムな UUID を生成する。

## database_replicated_allow_heavy_create \{#database_replicated_allow_heavy_create\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Replicated データベースエンジンに対する長時間実行される DDL クエリ (CREATE AS SELECT および POPULATE) は禁止された"}]}]}/>

Replicated データベースエンジンで長時間実行される DDL クエリ (CREATE AS SELECT および POPULATE) を許可します。DDL キューが長時間ブロックされる可能性がある点に注意してください。

## database_replicated_allow_only_replicated_engine \{#database_replicated_allow_only_replicated_engine\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`Replicated` エンジンのデータベースでは、`Replicated` テーブルのみを作成できるようにします。

## database_replicated_allow_replicated_engine_arguments \{#database_replicated_allow_replicated_engine_arguments\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "デフォルトでは明示的な引数の指定を許可しない"}]}]}/>

0 - Replicated データベース内の *MergeTree テーブルに対して、ZooKeeper パスおよびレプリカ名を明示的に指定することを許可しない。1 - 許可する。2 - 許可するが、指定されたパスは無視し、代わりにデフォルトのパスを使用する。3 - 許可し、警告をログ出力しない。

## database_replicated_always_detach_permanently \{#database_replicated_always_detach_permanently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

データベースエンジンが Replicated の場合、`DETACH TABLE` を `DETACH TABLE PERMANENTLY` として実行します

## database_replicated_enforce_synchronous_settings \{#database_replicated_enforce_synchronous_settings\} 

<SettingsInfoBlock type="Bool" default_value="0" />

一部のクエリに対して同期的な完了待ちを強制します（`database_atomic_wait_for_drop_and_detach_synchronously`、`mutations_sync`、`alter_sync` も参照）。これらの設定を有効にすることは推奨されません。

## database_replicated_initial_query_timeout_sec \{#database_replicated_initial_query_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

初期の DDL クエリが、Replicated データベースでそれ以前の DDL キュー内のエントリの処理が完了するのを待機する時間を秒単位で設定します。

設定可能な値:

- 正の整数。
- 0 — 無制限。

## database_shared_drop_table_delay_seconds \{#database_shared_drop_table_delay_seconds\} 

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "New setting."}]}]}/>

Shared データベースからテーブルが実際に削除されるまでの猶予時間（秒）。この時間内であれば、`UNDROP TABLE` ステートメントを使用してテーブルを復元できます。

## decimal_check_overflow \{#decimal_check_overflow\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Decimal 型の算術演算および比較演算におけるオーバーフローを検査する

## deduplicate_blocks_in_dependent_materialized_views \{#deduplicate_blocks_in_dependent_materialized_views\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Replicated\* テーブルからデータを受け取るマテリアライズドビューに対する重複排除チェックを有効または無効にします。

指定可能な値:

0 — 無効。
      1 — 有効。

有効にすると、ClickHouse は Replicated\* テーブルに依存するマテリアライズドビュー内のブロックの重複排除を実行します。
この設定は、障害により挿入操作が再試行される場合でも、マテリアライズドビューに重複データが含まれないようにするのに役立ちます。

**関連項目**

- [IN 演算子における NULL の処理](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## default_materialized_view_sql_security \{#default_materialized_view_sql_security\} 

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "マテリアライズドビュー作成時の SQL SECURITY オプションのデフォルト値を設定できます"}]}]}/>

マテリアライズドビュー作成時の SQL SECURITY オプションのデフォルト値を設定できます。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `DEFINER` です。

## default_max_bytes_in_join \{#default_max_bytes_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

制限が必要な場合に使用される右側テーブルの最大サイズ（`max_bytes_in_join` が未設定の場合）。

## default_normal_view_sql_security \{#default_normal_view_sql_security\} 

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "通常ビューを作成する際の `SQL SECURITY` オプションのデフォルト値を設定します"}]}]}/>

通常ビューを作成する際の `SQL SECURITY` オプションのデフォルト値を設定します。[`SQL SECURITY` の詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `INVOKER` です。

## default&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "デフォルトのテーブルエンジンを MergeTree に設定し、使いやすさを向上させる"}]}]} />

`CREATE` ステートメント内で `ENGINE` が設定されていない場合に使用されるデフォルトのテーブルエンジン。

取り得る値:

* 任意の有効なテーブルエンジン名を表す文字列

Cloud 環境でのデフォルト値: `SharedMergeTree`。

**例**

クエリ:

```sql
SET default_table_engine = 'Log';

SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine';
```

結果:

```response
┌─name─────────────────┬─value─┬─changed─┐
│ default_table_engine │ Log   │       1 │
└──────────────────────┴───────┴─────────┘
```

この例では、`Engine` を指定していない新しいテーブルはすべて、`Log` テーブルエンジンを使用します。

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


## default&#95;temporary&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

一時テーブル用の [default&#95;table&#95;engine](#default_table_engine) と同じ設定です。

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "ビュー作成時のデフォルトの `DEFINER` オプションを設定できます"}]}]}/>

ビューを作成する際のデフォルトの `DEFINER` オプションを設定できます。 [SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `CURRENT_USER` です。

## delta_lake_enable_engine_predicate \{#delta_lake_enable_engine_predicate\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

delta-kernel の内部データのプルーニングを有効にします。

## delta_lake_enable_expression_visitor_logging \{#delta_lake_enable_expression_visitor_logging\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

DeltaLake の expression visitor に対するテストレベルのログを有効にします。これらのログは、テストログとしても冗長になりすぎる場合があります。

## delta_lake_insert_max_bytes_in_data_file \{#delta_lake_insert_max_bytes_in_data_file\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新しい設定。"}]}]}/>

Delta Lake で挿入される単一のデータファイルのサイズ上限（バイト数）を定義します。

## delta_lake_insert_max_rows_in_data_file \{#delta_lake_insert_max_rows_in_data_file\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "新しい設定。"}]}]}/>

Delta Lake において、1 つの挿入されるデータファイルごとの行数上限を定義します。

## delta_lake_log_metadata \{#delta_lake_log_metadata\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

Delta Lake のメタデータファイルを system テーブルに記録できるようにします。

## delta_lake_snapshot_version \{#delta_lake_snapshot_version\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "New setting"}]}]}/>

読み取る Delta Lake スナップショットのバージョン。値が -1 の場合は最新バージョンを読み取ります（0 も有効なスナップショット バージョンです）。

## delta_lake_throw_on_engine_predicate_error \{#delta_lake_throw_on_engine_predicate_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

delta-kernel でスキャン述語を解析する際にエラーが発生した場合に、例外をスローするようにします。

## describe_compact_output \{#describe_compact_output\} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、DESCRIBE クエリの結果には列名と型のみが含まれます。

## describe_include_subcolumns \{#describe_include_subcolumns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[DESCRIBE](../../sql-reference/statements/describe-table.md) クエリでサブカラムを出力に含めるかどうかを制御します。たとえば、[Tuple](../../sql-reference/data-types/tuple.md) のメンバーや、[Map](/sql-reference/data-types/map#reading-subcolumns-of-map)、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null)、[Array](../../sql-reference/data-types/array.md/#array-size) 型のサブカラムなどです。

設定可能な値:

- 0 — サブカラムを `DESCRIBE` クエリに含めません。
- 1 — サブカラムを `DESCRIBE` クエリに含めます。

**例**

[DESCRIBE](../../sql-reference/statements/describe-table.md) ステートメントの例を参照してください。

## describe_include_virtual_columns \{#describe_include_virtual_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

true の場合、テーブルの仮想カラムも DESCRIBE クエリの結果に含まれます

## dialect \{#dialect\} 

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

クエリを解析する際に使用するダイアレクト

## dictionary_validate_primary_key_type \{#dictionary_validate_primary_key_type\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "辞書の主キー型を検証します。既定では、simple レイアウトにおける id 型は暗黙的に UInt64 に変換されます。"}]}]}/>

辞書の主キー型を検証します。既定では、simple レイアウトにおける id 型は暗黙的に UInt64 に変換されます。

## distinct_overflow_mode \{#distinct_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの上限を超えたときの動作を設定します。

使用可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きた場合と同様に、その時点までの部分的な結果を返します。

## distributed_aggregation_memory_efficient \{#distributed_aggregation_memory_efficient\} 

<SettingsInfoBlock type="Bool" default_value="1" />

分散集約のメモリ節約モードを有効にするかどうかを指定します。

## distributed_background_insert_batch \{#distributed_background_insert_batch\} 

**別名**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

挿入されたデータをバッチで送信するかどうかを有効/無効にします。

バッチ送信が有効な場合、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンは、挿入データの複数ファイルを個別に送信するのではなく、1 回の操作でまとめて送信しようとします。バッチ送信により、サーバーおよびネットワークリソースをより有効に活用することで、クラスターのパフォーマンスが向上します。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

## distributed_background_insert_max_sleep_time_ms \{#distributed_background_insert_max_sleep_time_ms\} 

**別名**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信するための最大時間間隔。設定項目 [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) で指定される間隔の指数関数的な増加を制限します。

設定可能な値:

- 正の整数のミリ秒数。

## distributed_background_insert_sleep_time_ms \{#distributed_background_insert_sleep_time_ms\} 

**別名**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信する際の基準となる間隔です。エラーが発生した場合、実際の間隔は指数関数的に増加します。

設定可能な値:

- 正の整数のミリ秒数。

## distributed_background_insert_split_batch_on_failure \{#distributed_background_insert_split_batch_on_failure\} 

**エイリアス**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

失敗時にバッチを分割するかどうかを有効/無効にします。

特定のバッチをリモートシャードに送信する際、後段の複雑なパイプライン（例: `GROUP BY` を含む `MATERIALIZED VIEW`）によって `Memory limit exceeded` などのエラーが発生し、失敗する場合があります。この場合、再試行しても状況は改善されず（そのテーブルに対する Distributed 送信がブロックされてしまいます）が、そのバッチ内のファイルを 1 件ずつ送信すれば INSERT が成功する可能性があります。

そのため、この設定を `1` にすると、そのようなバッチに対してはバッチ処理が無効化されます（つまり、失敗したバッチに対して一時的に `distributed_background_insert_batch` が無効になります）。

取りうる値:

- 1 — 有効。
- 0 — 無効。

:::note
この設定は、破損したバッチにも影響します（異常なサーバー（マシン）停止や、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンに対して `fsync_after_insert` / `fsync_directories` が行われていないことにより発生する可能性があります）。
:::

:::note
パフォーマンス低下を招く可能性があるため、自動バッチ分割に依存すべきではありません。
:::

## distributed_background_insert_timeout \{#distributed_background_insert_timeout\} 

**エイリアス**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

`Distributed` テーブルへの挿入クエリのタイムアウト。`insert_distributed_sync` が有効な場合にのみ使用されます。0 を指定した場合は、タイムアウトなしを意味します。

## distributed_cache_alignment \{#distributed_cache_alignment\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Rename of distributed_cache_read_alignment"}]}]}/>

ClickHouse Cloud でのみ有効です。テスト目的のための設定であり、変更しないでください。

## distributed_cache_bypass_connection_pool \{#distributed_cache_bypass_connection_pool\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュの接続プールをバイパスできるようにします。

## distributed_cache_connect_backoff_max_ms \{#distributed_cache_connect_backoff_max_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続の作成時に適用される最大バックオフ時間（ミリ秒）です。

## distributed_cache_connect_backoff_min_ms \{#distributed_cache_connect_backoff_min_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ接続の確立における最小バックオフ時間（ミリ秒単位）を指定します。

## distributed_cache_connect_max_tries \{#distributed_cache_connect_max_tries\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "設定値の変更"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "ClickHouse Cloud 専用"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュへの接続に失敗した場合の再試行回数を指定します。

## distributed_cache_connect_timeout_ms \{#distributed_cache_connect_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーへの接続タイムアウトを指定します。

## distributed_cache_credentials_refresh_period_seconds \{#distributed_cache_credentials_refresh_period_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

ClickHouse Cloud でのみ有効です。認証情報の更新間隔を指定します。

## distributed_cache_data_packet_ack_window \{#distributed_cache_data_packet_ack_window\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ効果があります。分散キャッシュの単一の読み取りリクエスト内で送信される DataPacket シーケンスに対する ACK のウィンドウを指定します。

## distributed_cache_discard_connection_if_unread_data \{#distributed_cache_discard_connection_if_unread_data\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。未読のデータがある場合は接続を破棄します。

## distributed_cache_fetch_metrics_only_from_current_az \{#distributed_cache_fetch_metrics_only_from_current_az\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ有効です。`system.distributed_cache_metrics` と `system.distributed_cache_events` では、現在のアベイラビリティゾーン内からのみメトリクスを取得します。

## distributed_cache_log_mode \{#distributed_cache_log_mode\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。system.distributed_cache_log への書き込みモードを指定します。

## distributed_cache_max_unacked_inflight_packets \{#distributed_cache_max_unacked_inflight_packets\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。単一の分散キャッシュ読み取りリクエストにおける未確認インフライトパケットの最大数を指定します。

## distributed_cache_min_bytes_for_seek \{#distributed_cache_min_bytes_for_seek\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しいプライベート設定。"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュでシーク処理を行う際に使用する最小バイト数です。

## distributed_cache_pool_behaviour_on_limit \{#distributed_cache_pool_behaviour_on_limit\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud のみ"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。プールの上限に達したときに distributed cache 接続がどのように動作するかを定義します。

## distributed_cache_prefer_bigger_buffer_size \{#distributed_cache_prefer_bigger_buffer_size\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem_cache_prefer_bigger_buffer_size と同様ですが、distributed cache 向けです。

## distributed_cache_read_only_from_current_az \{#distributed_cache_read_only_from_current_az\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。現在のアベイラビリティゾーン内のキャッシュサーバーからのみ読み取りを許可します。無効にすると、すべてのアベイラビリティゾーンにあるすべてのキャッシュサーバーから読み取ります。

## distributed_cache_read_request_max_tries \{#distributed_cache_read_request_max_tries\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "設定値を変更"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "新規設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュリクエストが失敗した場合に再試行する回数を指定します。

## distributed_cache_receive_response_wait_milliseconds \{#distributed_cache_receive_response_wait_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "ClickHouse Cloud 向けの設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュからリクエストに対するデータを受信するまでの待機時間をミリ秒で指定します。

## distributed_cache_receive_timeout_milliseconds \{#distributed_cache_receive_timeout_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュから何らかの応答を受信するまでの待ち時間（ミリ秒）を指定します。

## distributed_cache_receive_timeout_ms \{#distributed_cache_receive_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーからデータを受信する際のタイムアウト時間（ミリ秒単位）です。この時間内に 1 バイトも受信できなかった場合、例外がスローされます。

## distributed_cache_send_timeout_ms \{#distributed_cache_send_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュサーバーにデータを送信する際のタイムアウト時間をミリ秒で指定します。クライアントがデータを送信する必要があるにもかかわらず、この時間内に 1 バイトも送信できなかった場合、例外がスローされます。

## distributed_cache_tcp_keep_alive_timeout_ms \{#distributed_cache_tcp_keep_alive_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。TCP がキープアライブプローブの送信を開始するまで、distributed cache サーバーへの接続をアイドル状態のまま維持する必要がある時間（ミリ秒）です。

## distributed_cache_throw_on_error \{#distributed_cache_throw_on_error\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache との通信中に発生した例外、または distributed cache から受信した例外を再スローします。それ以外の場合は、エラー発生時には distributed cache をスキップするフォールバック動作になります。

## distributed_cache_wait_connection_from_pool_milliseconds \{#distributed_cache_wait_connection_from_pool_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ効果があります。`distributed_cache_pool_behaviour_on_limit` が `wait` の場合に、コネクションプールからコネクションを取得できるまで待機する時間を、ミリ秒単位で指定します。

## distributed_connections_pool_size \{#distributed_connections_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

単一の Distributed テーブルに対するすべてのクエリを分散処理する際の、リモートサーバーへの同時接続の最大数です。クラスタ内のサーバー数以上に設定することを推奨します。

## distributed_ddl_entry_format_version \{#distributed_ddl_entry_format_version\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

分散 DDL（`ON CLUSTER`）クエリの互換性バージョン

## distributed_ddl_output_mode \{#distributed_ddl_output_mode\} 

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

分散 DDL クエリ結果の形式を設定します。

指定可能な値:

- `throw` — クエリが完了したすべてのホストに対するクエリ実行ステータスを含む結果セットを返します。クエリが一部のホストで失敗した場合、最初の例外を再スローします。クエリが一部のホストでまだ完了しておらず、[distributed_ddl_task_timeout](#distributed_ddl_task_timeout) を超過した場合は、`TIMEOUT_EXCEEDED` 例外をスローします。
- `none` — `throw` と同様ですが、分散 DDL クエリは結果セットを返しません。
- `null_status_on_timeout` — 対応するホストでクエリが完了していない場合でも `TIMEOUT_EXCEEDED` をスローせず、結果セットの一部の行における実行ステータスとして `NULL` を返します。
- `never_throw` — 一部のホストでクエリが失敗しても、`TIMEOUT_EXCEEDED` をスローせず、例外も再スローしません。
- `none_only_active` - `none` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。注意: このモードでは、クエリが一部のレプリカで実行されておらず、バックグラウンドで実行されることを把握することはできません。
- `null_status_on_timeout_only_active` — `null_status_on_timeout` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。
- `throw_only_active` — `throw` と同様ですが、`Replicated` データベースの非アクティブなレプリカを待ちません。

Cloud でのデフォルト値: `throw`。

## distributed_ddl_task_timeout \{#distributed_ddl_task_timeout\} 

<SettingsInfoBlock type="Int64" default_value="180" />

クラスタ内のすべてのホストからの DDL クエリ応答のタイムアウトを設定します。DDL リクエストがすべてのホストで完了していない場合、応答にはタイムアウトエラーが含まれ、リクエストは非同期モードで実行されます。負の値を指定すると無制限を意味します。

設定可能な値:

- 正の整数。
- 0 — 非同期モード。
- 負の整数 — 無制限のタイムアウト。

## distributed_foreground_insert \{#distributed_foreground_insert\} 

**エイリアス**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

[Distributed](/engines/table-engines/special/distributed) テーブルへの同期的なデータ挿入を有効または無効にします。

デフォルトでは、`Distributed` テーブルにデータを挿入する際、ClickHouse サーバーはクラスターノードへデータをバックグラウンドモードで送信します。`distributed_foreground_insert=1` の場合、データは同期的に処理され、すべてのデータがすべてのシャード（`internal_replication` が true の場合は各シャードの少なくとも 1 つのレプリカ）に保存されて初めて `INSERT` 操作が成功します。

設定可能な値:

- `0` — データはバックグラウンドモードで挿入されます。
- `1` — データは同期モードで挿入されます。

Cloud のデフォルト値: `0`。

**参照**

- [Distributed テーブルエンジン](/engines/table-engines/special/distributed)
- [Distributed テーブルの管理](/sql-reference/statements/system#managing-distributed-tables)

## distributed&#95;group&#95;by&#95;no&#95;merge

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリ処理において、異なるサーバーからの集約状態をマージしないようにします。異なるシャードごとに異なるキーが存在することが確実な場合に使用できます。

設定可能な値:

* `0` — 無効（最終的なクエリ処理はイニシエーターノードで実行されます）。
* `1` - 分散クエリ処理において、異なるサーバーからの集約状態をマージしません（クエリは完全にシャード側で処理され、イニシエーターノードはデータをプロキシするだけです）。異なるシャードごとに異なるキーが存在することが確実な場合に使用できます。
* `2` - `1` と同様ですが、イニシエーターノード側で `ORDER BY` と `LIMIT` を適用します（`distributed_group_by_no_merge=1` の場合のように、クエリが完全にリモートノードで処理されるときには適用できません）。`ORDER BY` および/または `LIMIT` を含むクエリに使用できます。

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


## distributed_insert_skip_read_only_replicas \{#distributed_insert_skip_read_only_replicas\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "true の場合、Distributed への INSERT で読み取り専用レプリカをスキップします"}]}]}/>

Distributed テーブルへの INSERT クエリで、読み取り専用レプリカをスキップできるようにします。

設定可能な値:

- 0 — 通常どおり INSERT を行います。読み取り専用レプリカに書き込みを行おうとした場合は失敗します。
- 1 — クエリのイニシエータは、データをシャードに送信する前に読み取り専用レプリカをスキップします。

## distributed_plan_default_reader_bucket_count \{#distributed_plan_default_reader_bucket_count\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "New experimental setting."}]}]}/>

分散クエリにおける並列読み取りのタスク数のデフォルト値です。タスクはレプリカ間に分散されます。

## distributed_plan_default_shuffle_join_bucket_count \{#distributed_plan_default_shuffle_join_bucket_count\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "新しい実験的な設定です。"}]}]}/>

分散 shuffle-hash-join のデフォルトのバケット数。

## distributed_plan_execute_locally \{#distributed_plan_execute_locally\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

分散クエリプランに含まれるすべてのタスクをローカルで実行します。テストやデバッグに有用です。

## distributed_plan_force_exchange_kind \{#distributed_plan_force_exchange_kind\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "新しい実験的設定。"}]}]}/>

分散クエリの各ステージ間で使用する Exchange 演算子の種類を強制します。

設定可能な値:

- '' - どの種類の Exchange 演算子も強制せず、オプティマイザに選択を任せる
 - 'Persisted' - オブジェクトストレージ内の一時ファイルを使用する
 - 'Streaming' - Exchange データをネットワーク経由でストリーミングする

## distributed_plan_force_shuffle_aggregation \{#distributed_plan_force_shuffle_aggregation\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "新しい実験的な設定"}]}]}/>

分散クエリプランにおいて、`PartialAggregation + Merge` の代わりに `Shuffle` 集約戦略を使用します。

## distributed_plan_max_rows_to_broadcast \{#distributed_plan_max_rows_to_broadcast\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "新しい実験的設定。"}]}]}/>

分散クエリプランで、シャッフル結合ではなくブロードキャスト結合を使用するための最大行数。

## distributed_plan_optimize_exchanges \{#distributed_plan_optimize_exchanges\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランから不要な exchange 演算を削除します。デバッグの際には無効にしてください。

## distributed_product_mode \{#distributed_product_mode\} 

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

[分散サブクエリ](../../sql-reference/operators/in.md) の挙動を変更します。

クエリに分散テーブル同士の積が含まれる場合、つまり分散テーブルに対するクエリの中に、その分散テーブルに対する非 GLOBAL なサブクエリが含まれている場合に、ClickHouse はこの設定を適用します。

制約:

- IN および JOIN サブクエリに対してのみ適用されます。
- FROM 句で、複数シャードを含む分散テーブルが使用されている場合にのみ適用されます。
- サブクエリが対象とするテーブルが、複数シャードを含む分散テーブルである場合にのみ適用されます。
- テーブル値関数である [remote](../../sql-reference/table-functions/remote.md) 関数には使用されません。

取り得る値:

- `deny` — デフォルト値。この種のサブクエリの使用を禁止します（"Double-distributed IN/JOIN subqueries is denied" という例外を返します）。
- `local` — サブクエリ内のデータベースおよびテーブルを、宛先サーバー（シャード）上のローカルなものに置き換え、通常の `IN`/`JOIN` のままにします。
- `global` — `IN`/`JOIN` クエリを `GLOBAL IN`/`GLOBAL JOIN` に置き換えます。
- `allow` — この種のサブクエリの使用を許可します。

## distributed_push_down_limit \{#distributed_push_down_limit\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

[LIMIT](#limit) を各シャードに個別に適用するかどうかを制御します。

これにより、次のことを回避できます。

- 余分な行をネットワーク越しに送信すること。
- イニシエーター側で LIMIT を超えた行を処理すること。

バージョン 21.9 以降では、`distributed_push_down_limit` は、次のいずれかの条件を満たす場合にのみクエリの実行方法を変更するため、不正確な結果を得ることはなくなりました。

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0。
- クエリに `GROUP BY`/`DISTINCT`/`LIMIT BY` **がなく**、`ORDER BY`/`LIMIT` がある場合。
- クエリに `GROUP BY`/`DISTINCT`/`LIMIT BY` と `ORDER BY`/`LIMIT` **があり**、かつ次の条件を満たす場合:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効。
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) が有効。

設定可能な値は次のとおりです。

- 0 — 無効。
- 1 — 有効。

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \{#distributed_replica_error_cap\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

- 型: 符号なし整数 (unsigned int)
- デフォルト値: 1000

各レプリカのエラー件数はこの値で上限が設定され、単一のレプリカにエラーが過剰に蓄積されるのを防ぎます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \{#distributed_replica_error_half_life\} 

<SettingsInfoBlock type="Seconds" default_value="60" />

- タイプ: 秒
- デフォルト値: 60 秒

分散テーブルにおけるエラーを、どの程度の速度でゼロとして扱うかを制御します。あるレプリカがしばらくの間利用できず、エラーが 5 回蓄積されていて、distributed_replica_error_half_life が 1 秒に設定されている場合、そのレプリカは最後のエラーから 3 秒後に正常と見なされます。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \{#distributed_replica_max_ignored_errors\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

- 型: 符号なし整数 (unsigned int)
- デフォルト値: 0

レプリカを選択する際に（`load_balancing` アルゴリズムに従って）、無視されるエラーの数です。

関連項目:

- [load_balancing](#load_balancing-round_robin)
- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \{#do_not_merge_across_partitions_select_final\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`SELECT FINAL` 実行時に、同一パーティション内のパーツのみをマージします

## empty_result_for_aggregation_by_constant_keys_on_empty_set \{#empty_result_for_aggregation_by_constant_keys_on_empty_set\} 

<SettingsInfoBlock type="Bool" default_value="1" />

空集合を定数キーで集約する場合、空の結果を返します。

## empty_result_for_aggregation_by_empty_set \{#empty_result_for_aggregation_by_empty_set\} 

<SettingsInfoBlock type="Bool" default_value="0" />

空の集合に対してキーなしで集約を行う場合に、空の結果を返します。

## enable_adaptive_memory_spill_scheduler \{#enable_adaptive_memory_spill_scheduler\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定。メモリ内データを状況に応じて外部ストレージへスピルする機能を有効にします。"}]}]}/>

プロセッサに対して、メモリ上のデータを状況に応じて外部ストレージへスピルするようトリガーします。現在は grace join のみがサポートされています。

## enable_add_distinct_to_in_subqueries \{#enable_add_distinct_to_in_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "分散 IN サブクエリで転送される一時テーブルのサイズを削減するための新しい設定。"}]}]}/>

`IN` サブクエリで `DISTINCT` を有効にします。これはトレードオフが存在する設定です。有効化すると、分散 IN サブクエリで転送される一時テーブルのサイズを大幅に削減でき、一意な値のみを送信することで、シャード間のデータ転送を大きく高速化できます。
ただし、この設定を有効にすると、各ノードで重複排除（DISTINCT）を実行する必要があるため、追加のマージ処理が発生します。ネットワーク転送がボトルネックとなっており、その追加のマージコストを許容できる場合にこの設定を使用してください。

## enable_blob_storage_log \{#enable_blob_storage_log\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "BLOB ストレージ操作の情報を system.blob_storage_log テーブルに書き込みます"}]}]}/>

BLOB ストレージ操作の情報を system.blob_storage_log テーブルに書き込みます

## enable_deflate_qpl_codec \{#enable_deflate_qpl_codec\} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、DEFLATE_QPL コーデックを使用して列を圧縮できます。

## enable_early_constant_folding \{#enable_early_constant_folding\} 

<SettingsInfoBlock type="Bool" default_value="1" />

関数やサブクエリの結果を解析し、それらが定数である場合にクエリを書き換える最適化を有効にします

## enable_extended_results_for_datetime_functions \{#enable_extended_results_for_datetime_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`Date` 型と比較して拡張された範囲を持つ `Date32` 型、
または `DateTime` 型と比較して拡張された範囲を持つ `DateTime64` 型の結果を返すかどうかを制御します。

設定可能な値:

- `0` — すべての種類の引数に対して、関数は `Date` または `DateTime` を返します。
- `1` — 関数は `Date32` または `DateTime64` の引数に対しては `Date32` または `DateTime64` を返し、それ以外の場合は `Date` または `DateTime` を返します。

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

## enable_filesystem_cache \{#enable_filesystem_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムに対してキャッシュを使用します。この設定自体ではディスクのキャッシュの有効化／無効化は行われません（それはディスク設定で行う必要があります）が、必要に応じて一部のクエリでキャッシュを迂回できるようにします。

## enable_filesystem_cache_log \{#enable_filesystem_cache_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

各クエリごとにファイルシステムキャッシュのログを記録できるようにします。

## enable_filesystem_cache_on_write_operations \{#enable_filesystem_cache_on_write_operations\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`write-through` キャッシュを有効または無効にします。`false` に設定すると、書き込み処理に対する `write-through` キャッシュは無効になります。`true` に設定すると、サーバー設定のキャッシュディスク設定セクションで `cache_on_write_operations` が有効になっている限り、`write-through` キャッシュが有効になります。
詳細については、["Using local cache"](/operations/storing-data#using-local-cache) を参照してください。

## enable_filesystem_read_prefetches_log \{#enable_filesystem_read_prefetches_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ実行中に `system.filesystem` の `prefetch_log` にログを記録します。テストまたはデバッグ用途にのみ使用すべきであり、デフォルトで有効にすることは推奨されません。

## enable_global_with_statement \{#enable_global_with_statement\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "WITH 句をデフォルトで UNION クエリおよびすべてのサブクエリに伝播"}]}]}/>

WITH 句をデフォルトで UNION クエリおよびすべてのサブクエリに伝播させます

## enable_hdfs_pread \{#enable_hdfs_pread\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

HDFS ファイルに対する pread の有効／無効を切り替えます。デフォルトでは `hdfsPread` が使用されます。無効にすると、HDFS ファイルの読み取りには `hdfsRead` と `hdfsSeek` が使用されます。

## enable_http_compression \{#enable_http_compression\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "一般的に有用です"}]}]}/>

HTTP リクエストへの応答でデータ圧縮を有効または無効にします。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## enable_job_stack_trace \{#enable_job_stack_trace\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "パフォーマンスへの影響を避けるため、この設定はデフォルトで無効になりました。"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "ジョブのスケジューリング時のスタックトレース収集を有効にします。パフォーマンスへの影響を避けるため、デフォルトでは無効です。"}]}]}/>

ジョブが例外で終了した場合に、そのジョブを作成した側のスタックトレースを出力します。パフォーマンスへの影響を避けるため、デフォルトでは無効です。

## enable_join_runtime_filters \{#enable_join_runtime_filters\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

実行時に右側から収集した JOIN キーの集合を用いて、左側の行をフィルタリングします。

## enable_lazy_columns_replication \{#enable_lazy_columns_replication\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "デフォルトで JOIN および ARRAY JOIN における遅延カラム複製を有効化"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "JOIN および ARRAY JOIN における遅延カラム複製を有効化するための設定を追加"}]}]}/>

JOIN および ARRAY JOIN で遅延カラム複製を有効化します。これにより、メモリ上で同じ行を何度も余分にコピーすることを回避できます。

## enable_lightweight_delete \{#enable_lightweight_delete\} 

**Aliases**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルに対する軽量な DELETE ミューテーションを有効にします。

## enable_lightweight_update \{#enable_lightweight_update\} 

<BetaBadge/>

**別名**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Lightweight update が Beta に移行されました。設定 \"allow_experimental_lightweight_update\" の別名が追加されました。"}]}]}/>

Lightweight update 機能を有効にします。

## enable_memory_bound_merging_of_aggregation_results \{#enable_memory_bound_merging_of_aggregation_results\} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約結果に対するメモリ上限ベースのマージ戦略を有効にします。

## enable_multiple_prewhere_read_steps \{#enable_multiple_prewhere_read_steps\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`WHERE` から `PREWHERE` により多くの条件を移動し、条件が `AND` で結合された複数条件である場合に、ディスクからの読み取りとフィルタリングを複数回に分けて実行します

## enable_named_columns_in_function_tuple \{#enable_named_columns_in_function_tuple\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "すべての名前が一意であり、引用符なしの識別子として扱える場合に、関数 tuple() で名前付きタプルを生成します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "ユーザビリティ改善のため無効化"}]}]}/>

すべての名前が一意であり、引用符なしの識別子として扱える場合に、関数 tuple() で名前付きタプルを生成します。

## enable_optimize_predicate_expression \{#enable_optimize_predicate_expression\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

`SELECT` クエリで述語プッシュダウンを有効にします。

述語プッシュダウンにより、分散クエリのネットワークトラフィックを大幅に削減できる場合があります。

可能な値:

- 0 — 無効。
- 1 — 有効。

使用方法

次のクエリを考えてみます:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

`enable_optimize_predicate_expression = 1` の場合、ClickHouse はサブクエリを処理する際に `WHERE` をサブクエリに適用するため、これら 2 つのクエリの実行時間は同等になります。

`enable_optimize_predicate_expression = 0` の場合、サブクエリの実行が完了した後に `WHERE` 句がすべてのデータに対して適用されるため、2 番目のクエリの実行時間は大幅に長くなります。

## enable_optimize_predicate_expression_to_final_subquery \{#enable_optimize_predicate_expression_to_final_subquery\} 

<SettingsInfoBlock type="Bool" default_value="1" />

述語の最終サブクエリへのプッシュダウンを有効にします。

## enable&#95;order&#95;by&#95;all

<SettingsInfoBlock type="Bool" default_value="1" />

`ORDER BY ALL` 構文でのソートを有効または無効にします。`ORDER BY` の詳細は [ORDER BY](../../sql-reference/statements/select/order-by.md) を参照してください。

設定可能な値:

* 0 — ORDER BY ALL を無効にする。
* 1 — ORDER BY ALL を有効にする。

**例**

クエリ:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- ALLが曖昧であるエラーを返す

SELECT * FROM TAB ORDER BY ALL SETTINGS enable_order_by_all = 0;
```

結果:

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

分散クエリにのみ影響します。有効にすると、ブロックのシリアライズ/デシリアライズおよび圧縮/解凍は、イニシエーターへ送信する前後でパイプラインスレッド上で行われます。つまり、デフォルトよりも高い並列度で処理されます。

## enable_parsing_to_custom_serialization \{#enable_parsing_to_custom_serialization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` の場合、テーブルから取得したシリアライズ方式に関するヒントに従って、Sparse などのカスタムシリアライズ方式を持つ列へデータを直接パースできます。

## enable&#95;positional&#95;arguments

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "位置引数機能をデフォルトで有効化"}]}]} />

[GROUP BY](/sql-reference/statements/select/group-by)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) ステートメントで位置引数をサポートするかどうかを切り替えます。

取りうる値:

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


## enable_producing_buckets_out_of_order_in_aggregation \{#enable_producing_buckets_out_of_order_in_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

メモリ効率の良い集計（`distributed_aggregation_memory_efficient` を参照）が、バケットを順不同で生成することを許可します。
これにより、集計バケットのサイズに偏りがある場合に、レプリカが低い ID を持つ重いバケットをイニシエーター側でまだ処理している間でも、より高い ID のバケットを先にイニシエーターへ送信できるようになり、パフォーマンスが向上する可能性があります。
短所として、メモリ使用量が増加する可能性があります。

## enable_reads_from_query_cache \{#enable_reads_from_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効にすると、`SELECT` クエリの結果は [クエリキャッシュ](../query-cache.md) から取得されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enable_s3_requests_logging \{#enable_s3_requests_logging\} 

<SettingsInfoBlock type="Bool" default_value="0" />

S3 リクエストの非常に詳細なログ出力を有効にします。デバッグ時にのみ利用してください。

## enable_scalar_subquery_optimization \{#enable_scalar_subquery_optimization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "スカラー副問い合わせによる大きなスカラー値のシリアル化およびデシリアル化を防ぎ、同じ副問い合わせを複数回実行せずに済む場合があります"}]}]}/>

true に設定すると、スカラー副問い合わせによる大きなスカラー値のシリアル化およびデシリアル化を防ぎ、同じ副問い合わせを複数回実行せずに済む場合があります。

## enable_scopes_for_with_statement \{#enable_scopes_for_with_statement\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "旧アナライザーとの後方互換性のための新しい設定。"}]}]}/>

無効化すると、親の WITH 句で宣言された定義は、現在のスコープで宣言されたかのように同じスコープとして扱われます。

これは、新しいアナライザーにおいて、旧アナライザーでは実行可能だった一部の本来は不正なクエリを実行できるようにするための互換性設定であることに注意してください。

## enable&#95;shared&#95;storage&#95;snapshot&#95;in&#95;query

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でストレージスナップショットを共有するための新しい設定"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "1"},{"label": "一貫性の保証を強化"}]}]} />

有効化すると、単一のクエリ内のすべてのサブクエリは、各テーブルに対して同じ `StorageSnapshot` を共有します。
これにより、同じテーブルに複数回アクセスする場合でも、クエリ全体で一貫したデータのビューが保証されます。

データパーツ間の内部整合性が重要となるクエリでは、この設定を有効にする必要があります。例:

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

この設定がない場合、外側と内側のクエリが異なるデータスナップショットを操作してしまい、その結果、誤った結果につながる可能性があります。

:::note
この設定を有効にすると、プランニング段階の完了後にスナップショットから不要なデータパーツを削除するための最適化が無効化されます。
その結果、長時間実行されるクエリは実行中ずっと古いパーツを保持し続ける可能性があり、パーツのクリーンアップが遅れ、ストレージへの負荷が高まります。

この設定は現在、MergeTree ファミリーのテーブルにのみ適用されます。
:::

取り得る値:

* 0 - 無効
* 1 - 有効


## enable_sharing_sets_for_mutations \{#enable_sharing_sets_for_mutations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

同じミューテーション内の異なるタスク間で、IN サブクエリ用に構築された set オブジェクトを共有できるようにします。これにより、メモリ使用量と CPU 使用量を削減できます。

## enable_software_prefetch_in_aggregation \{#enable_software_prefetch_in_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

集約処理においてソフトウェアプリフェッチを有効にします

## enable_time_time64_type \{#enable_time_time64_type\} 

**Aliases**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "新しい設定。実験的な Time および Time64 データ型を使用できるようにします。"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Time および Time64 型をデフォルトで有効にする"}]}]}/>

[Time](../../sql-reference/data-types/time.md) および [Time64](../../sql-reference/data-types/time64.md) データ型の作成を可能にします。

## enable_unaligned_array_join \{#enable_unaligned_array_join\} 

<SettingsInfoBlock type="Bool" default_value="0" />

サイズが異なる複数の配列に対する ARRAY JOIN を許可します。この設定を有効にすると、配列は最も長い配列の長さに揃うように調整されます。

## enable_url_encoding \{#enable_url_encoding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "既存設定のデフォルト値を変更"}]}]}/>

[URL](../../engines/table-engines/special/url.md) エンジンのテーブルで、URI 内のパスのデコード/エンコードを有効化または無効化します。

デフォルトでは無効です。

## enable_vertical_final \{#enable_vertical_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "バグ修正後、デフォルトで vertical FINAL を再度有効化"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "デフォルトで vertical FINAL を使用"}]}]}/>

この設定を有効にすると、FINAL 実行時に重複行をマージする代わりに、行を削除済みとしてマークし、後続のフィルタリングによって重複行を除去します

## enable_writes_to_query_cache \{#enable_writes_to_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

有効な場合、`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) に保存されます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## enable_zstd_qat_codec \{#enable_zstd_qat_codec\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "新しい ZSTD_QAT コーデックを追加"}]}]}/>

有効にすると、ZSTD_QAT コーデックを使用して列を圧縮できます。

## enforce_strict_identifier_format \{#enforce_strict_identifier_format\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

有効にすると、英数字とアンダースコアのみから成る識別子だけが許可されます。

## engine_file_allow_create_multiple_files \{#engine_file_allow_create_multiple_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

フォーマットにサフィックス（`JSON`、`ORC`、`Parquet` など）が付いている場合に、File エンジンのテーブルへの各挿入ごとに新しいファイルを作成するかどうかを制御します。有効にすると、挿入のたびに次のパターンに従った名前の新しいファイルが作成されます。

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` など。

取り得る値:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## engine_file_empty_if_not_exists \{#engine_file_empty_if_not_exists\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルが存在しない場合に、File エンジンのテーブルに対して `SELECT` を実行できるようにします。

設定可能な値:

- 0 — `SELECT` は例外をスローします。
- 1 — `SELECT` は空の結果を返します。

## engine_file_skip_empty_files \{#engine_file_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンテーブルで空ファイルをスキップするかどうかを有効または無効にします。

設定可能な値:

- 0 — 空ファイルが要求されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果セットを返します。

## engine_file_truncate_on_insert \{#engine_file_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[File](../../engines/table-engines/special/file.md) エンジンのテーブルで、挿入前にファイルを切り詰めるかどうかを有効または無効にします。

設定可能な値:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。

## engine_url_skip_empty_files \{#engine_url_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[URL](../../engines/table-engines/special/url.md) エンジンテーブルで空ファイルをスキップするかどうかを制御します。

指定可能な値:

- 0 — 空ファイルが指定されたフォーマットと互換性がない場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## except_default_mode \{#except_default_mode\} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

EXCEPT クエリのデフォルトモードを設定します。指定可能な値: 空文字列、'ALL'、'DISTINCT'。空文字列の場合、モードを指定しないクエリは例外をスローします。

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;insert

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "新しい設定。"}]}]} />

指定したスキップインデックスを、INSERT 時に構築および保存する対象から除外します。除外されたスキップインデックスも、[マージ時](merge-tree-settings.md/#materialize_skip_indexes_on_merge)や明示的な
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) クエリによっては、引き続き構築および保存されます。

[materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) が false の場合は効果がありません。

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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- idx_b のみが更新されます

-- セッション設定のため、クエリ単位で設定可能です
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- このクエリでインデックスを明示的にマテリアライズできます

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- 設定をデフォルトにリセット
```


## execute_exists_as_scalar_subquery \{#execute_exists_as_scalar_subquery\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

非相関の `EXISTS` サブクエリをスカラーサブクエリとして実行します。スカラーサブクエリと同様に、キャッシュが利用され、定数畳み込みが結果に適用されます。

## external_storage_connect_timeout_sec \{#external_storage_connect_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

秒単位の接続タイムアウト。現在は MySQL のみサポートされています。

## external_storage_max_read_bytes \{#external_storage_max_read_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に読み取ることができる最大バイト数を制限します。現在は MySQL テーブルエンジン、データベースエンジン、およびディクショナリでのみサポートされています。0 の場合、この設定は無効になります。

## external_storage_max_read_rows \{#external_storage_max_read_rows\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部エンジンを使用するテーブルが履歴データをフラッシュする際に読み取る行数の上限を制限します。現在は MySQL テーブルエンジン、データベースエンジン、および辞書にのみサポートされています。0 の場合、この設定は無効になります。

## external_storage_rw_timeout_sec \{#external_storage_rw_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

読み書きのタイムアウト時間（秒）。現在は MySQL でのみサポートされています。

## external_table_functions_use_nulls \{#external_table_functions_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="1" />

[mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md)、[odbc](../../sql-reference/table-functions/odbc.md) のテーブル関数が Nullable 列をどのように扱うかを定義します。

Possible values:

- 0 — テーブル関数は Nullable 列を明示的に使用します。
- 1 — テーブル関数は Nullable 列を暗黙的に使用します。

**Usage**

設定値が `0` の場合、テーブル関数は Nullable 列を作成せず、NULL の代わりにデフォルト値を挿入します。これは配列内の NULL 値にも適用されます。

## external_table_strict_query \{#external_table_strict_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

true に設定すると、外部テーブルに対するクエリで、式をローカルフィルターに変換することは禁止されます。

## extract_key_value_pairs_max_pairs_per_row \{#extract_key_value_pairs_max_pairs_per_row\} 

**別名**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "`extractKeyValuePairs` 関数によって生成されるペアの最大数。メモリの過剰な消費を防ぐための保護用設定です。"}]}]}/>

`extractKeyValuePairs` 関数によって生成されるペアの最大数。メモリの過剰な消費を防ぐための保護用設定です。

## extremes \{#extremes\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ結果の列ごとの極値（最小値と最大値）を集計するかどうかを指定します。0 または 1 を指定します。デフォルト値は 0（無効）です。
詳細については、「Extreme values」セクションを参照してください。

## fallback_to_stale_replicas_for_distributed_queries \{#fallback_to_stale_replicas_for_distributed_queries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

最新のデータが利用できない場合に、クエリの実行先として古いレプリカを強制します。 [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

ClickHouse は、テーブルの古いレプリカの中から最も適切なものを選択します。

レプリケートされたテーブルを参照する分散テーブルに対して `SELECT` を実行するときに使用されます。

デフォルト値は 1（有効）です。

## filesystem_cache_allow_background_download \{#filesystem_cache_allow_background_download\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "クエリ単位でファイルシステムキャッシュにおけるバックグラウンドダウンロードを制御するための新しい設定。"}]}]}/>

リモートストレージから読み取られるデータについて、ファイルシステムキャッシュがバックグラウンドでのダウンロードをキューイングできるようにします。無効にすると、現在のクエリ／セッションではダウンロードはフォアグラウンドで実行されます。

## filesystem_cache_boundary_alignment \{#filesystem_cache_boundary_alignment\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "新しい設定"}]}]}/>

ファイルシステムキャッシュの境界整列を制御する設定です。この設定はディスク以外の読み取り処理に対してのみ適用されます（たとえば、リモートテーブルエンジン／テーブル関数のキャッシュには適用されますが、MergeTree テーブルのストレージ設定には適用されません）。値 0 の場合は、境界整列を行いません。

## filesystem_cache_enable_background_download_during_fetch \{#filesystem_cache_enable_background_download_during_fetch\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。filesystem cache 内で空き容量を確保するためにキャッシュをロックする際の待機時間です。

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。ファイルシステムキャッシュで領域を確保するためにキャッシュをロックするまでの待機時間。

## filesystem_cache_max_download_size \{#filesystem_cache_max_download_size\} 

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

単一のクエリでダウンロード可能なリモートファイルシステムキャッシュの最大サイズ

## filesystem_cache_name \{#filesystem_cache_name\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "ステートレステーブルエンジンまたはデータレイクで使用するファイルシステムキャッシュの名前"}]}]}/>

ステートレステーブルエンジンまたはデータレイクで使用するファイルシステムキャッシュの名前

## filesystem_cache_prefer_bigger_buffer_size \{#filesystem_cache_prefer_bigger_buffer_size\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

ファイルシステムキャッシュが有効な場合、キャッシュ性能を低下させる小さなファイルセグメントの書き込みを避けるため、より大きなバッファサイズを優先して使用します。一方で、この設定を有効にするとメモリ使用量が増加する可能性があります。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "ファイルシステムキャッシュで領域を予約するためにキャッシュをロック取得するまでの待機時間"}]}]}/>

ファイルシステムキャッシュで領域を予約するためにキャッシュをロック取得するまでの待機時間

## filesystem_cache_segments_batch_size \{#filesystem_cache_segments_batch_size\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

キャッシュから読み取りバッファが要求できるファイルセグメント 1 バッチのサイズ上限です。値が小さすぎるとキャッシュへの要求回数が過剰になり、大きすぎるとキャッシュからのエビクション（追い出し）が遅くなる可能性があります。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\} 

**別名**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "設定 skip_download_if_exceeds_query_cache_limit の名称変更"}]}]}/>

クエリキャッシュサイズを超える場合は、リモートファイルシステムからのダウンロードをスキップします。

## filesystem_prefetch_max_memory_usage \{#filesystem_prefetch_max_memory_usage\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

プリフェッチ処理が使用できるメモリの上限。

## filesystem_prefetch_step_bytes \{#filesystem_prefetch_step_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

プリフェッチのステップサイズ（バイト単位）。ゼロの場合は `auto` を意味します。おおよそ最適なプリフェッチステップが自動的に推定されますが、必ずしも 100% 最適とは限りません。実際の値は、設定 `filesystem_prefetch_min_bytes_for_single_read_task` の影響を受けて異なる場合があります。

## filesystem_prefetch_step_marks \{#filesystem_prefetch_step_marks\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

マーク単位でのプリフェッチステップを指定します。0 は `auto` を意味します。この場合、おおよそ最適なプリフェッチステップが自動的に推定されますが、必ずしも 100% 最適とは限りません。実際に使用される値は、設定 `filesystem_prefetch_min_bytes_for_single_read_task` によって異なる場合があります。

## filesystem_prefetches_limit \{#filesystem_prefetches_limit\} 

<SettingsInfoBlock type="UInt64" default_value="200" />

プリフェッチの最大数。0 の場合は無制限です。プリフェッチを制限したい場合は、設定 `filesystem_prefetches_max_memory_usage` の利用がより推奨されます。

## final

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内のすべてのテーブルのうち、[FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を適用できるテーブル（結合されたテーブル、サブクエリ内のテーブル、分散テーブルを含む）に対して、[FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を自動的に適用します。

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


## flatten&#95;nested

<SettingsInfoBlock type="Bool" default_value="1" />

[nested](../../sql-reference/data-types/nested-data-structures/index.md) 型カラムのデータ形式を設定します。

取りうる値:

* 1 — ネスト型カラムを個別の配列にフラット化します。
* 0 — ネスト型カラムをタプルの単一配列のままにします。

**使用方法**

この設定を `0` にすると、任意の深さまでネストできます。

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

クエリ:

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


## force_aggregate_partitions_independently \{#force_aggregate_partitions_independently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

適用可能な最適化について、ヒューリスティクスによって使用しないと判断された場合でも、その適用を強制します。

## force_aggregation_in_order \{#force_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定は、分散クエリをサポートするためにサーバー側で使用されます。通常の動作が損なわれるため、手動で変更しないでください（分散集計時に、リモートノード上での順序付き集計の使用を強制します）。

## force&#95;data&#95;skipping&#95;indices

クエリで指定した data skipping インデックスが使用されなかった場合、クエリの実行を中止します。

次の例を考えてみましょう。

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


## force_grouping_standard_compatibility \{#force_grouping_standard_compatibility\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "GROUPING 関数の出力を SQL 標準および他の DBMS と同じにする"}]}]}/>

GROUPING 関数が、引数が集約キーとして使用されていない場合に 1 を返すようにします

## force_index_by_date \{#force_index_by_date\} 

<SettingsInfoBlock type="Bool" default_value="0" />

インデックスを日付で利用できない場合、クエリの実行を行いません。

MergeTree ファミリーに属するテーブルで有効です。

`force_index_by_date=1` の場合、ClickHouse はクエリにデータ範囲の制限に使用できる日付キー条件が含まれているかどうかをチェックします。適切な条件が存在しない場合は例外をスローします。ただし、その条件によって実際に読み取るデータ量が削減されるかどうかはチェックしません。たとえば、条件 `Date != ' 2000-01-01 '` は、テーブル内のすべてのデータに一致する場合（すなわち、クエリの実行に全表スキャンが必要な場合）でも許容されます。MergeTree テーブル内のデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_optimize_projection \{#force_optimize_projection\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[projections](../../engines/table-engines/mergetree-family/mergetree.md/#projections) の最適化が有効な場合に、`SELECT` クエリで projections を必ず使用するかどうかを有効または無効にします（[optimize_use_projections](#optimize_use_projections) 設定を参照）。

設定可能な値:

- 0 — projections の使用は必須ではありません。
- 1 — projections の使用が必須です。

## force_optimize_projection_name \{#force_optimize_projection_name\} 

空ではない文字列が設定されている場合、指定されたプロジェクションがクエリ内で少なくとも 1 回は使用されているかをチェックします。

取りうる値:

- string: クエリで使用されるプロジェクションの名前

## force_optimize_skip_unused_shards \{#force_optimize_skip_unused_shards\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

[optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効で、未使用シャードのスキップができない場合に、クエリ実行を許可するかどうかを制御します。スキップができず、この設定が有効な場合は、例外がスローされます。

設定可能な値:

- 0 — 無効。ClickHouse は例外をスローしません。
- 1 — 有効。テーブルにシャーディングキーが存在する場合にのみクエリ実行が無効化されます。
- 2 — 有効。テーブルにシャーディングキーが定義されているかどうかに関係なくクエリ実行が無効化されます。

## force_optimize_skip_unused_shards_nesting \{#force_optimize_skip_unused_shards_nesting\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリの入れ子レベル（`Distributed` テーブルが別の `Distributed` テーブルを参照するケース）に応じて [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) の動作を制御します（したがって [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) が有効であることが前提となります）。

使用可能な値:

- 0 — 無効。`force_optimize_skip_unused_shards` は常に動作します。
- 1 — 最初のレベルに対してのみ `force_optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `force_optimize_skip_unused_shards` を有効にします。

## force_primary_key \{#force_primary_key\} 

<SettingsInfoBlock type="Bool" default_value="0" />

主キーによるインデックス付けができない場合に、クエリの実行を禁止します。

MergeTree ファミリーのテーブルで有効です。

`force_primary_key=1` の場合、ClickHouse は、データ範囲の絞り込みに利用できる主キー条件がクエリに含まれているかを確認します。適切な条件がない場合は、例外をスローします。ただし、その条件が読み取るデータ量を削減するかどうかはチェックしません。MergeTree テーブルにおけるデータ範囲の詳細については、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_remove_data_recursively_on_drop \{#force_remove_data_recursively_on_drop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`DROP` クエリでデータを再帰的に削除します。「Directory not empty」エラーを回避しますが、detached なデータを暗黙的に削除してしまう可能性があります。

## formatdatetime_e_with_space_padding \{#formatdatetime_e_with_space_padding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `formatDateTime` におけるフォーマッター '%e' は、1 桁の日を先頭にスペースを 1 文字付けて出力します（例: ' 2' であり '2' ではありません）。

## formatdatetime_f_prints_scale_number_of_digits \{#formatdatetime_f_prints_scale_number_of_digits\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

関数 `formatDateTime` におけるフォーマッタ '%f' は、固定の 6 桁ではなく、DateTime64 のスケールで指定された桁数のみを出力します。

## formatdatetime_f_prints_single_zero \{#formatdatetime_f_prints_single_zero\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "MySQL の DATE_FORMAT()/STR_TO_DATE() との互換性を改善"}]}]}/>

`formatDateTime` 関数におけるフォーマッタ '%f' は、フォーマットされた値に小数秒が含まれない場合、6 個のゼロではなく 1 つのゼロを出力します。

## formatdatetime_format_without_leading_zeros \{#formatdatetime_format_without_leading_zeros\} 

<SettingsInfoBlock type="Bool" default_value="0" />

関数 `formatDateTime` で使用されるフォーマッタ `%c`、`%l`、`%k` は、月および時を先頭のゼロなしで出力します。

## formatdatetime_parsedatetime_m_is_month_name \{#formatdatetime_parsedatetime_m_is_month_name\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `formatDateTime` および `parseDateTime` において、フォーマッタ `%M` は分ではなく月名を出力および解析します。

## fsync_metadata \{#fsync_metadata\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`.sql` ファイルを書き込む際に [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) を有効または無効にします。デフォルトでは有効です。

サーバー上に非常に小さなテーブルが数百万単位で存在し、それらが頻繁に作成および削除されるような場合には、これを無効にすることが妥当な場合があります。

## function_date_trunc_return_type_behavior \{#function_date_trunc_return_type_behavior\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "dateTrunc 関数の従来の動作を保持するための新しい設定を追加"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "負の値に対して正しい結果を得るため、dateTrunc 関数の DateTime64/Date32 引数に対する結果型を、時間単位に関わらず常に DateTime64/Date32 に変更"}]}]}/>

`dateTrunc` 関数の戻り値の型に関する動作を変更できるようにします。

設定可能な値:

- 0 - 第 2 引数が `DateTime64/Date32` の場合、戻り値の型は第 1 引数の時間単位に関わらず `DateTime64/Date32` になります。
- 1 - `Date32` に対しては結果は常に `Date` になります。`DateTime64` に対しては、時間単位が `second` 以上の場合、結果は `DateTime` になります。

## function_implementation \{#function_implementation\} 

特定のターゲットまたはバリアントに対して使用する関数実装を選択します（実験的機能）。空の場合はすべてを有効にします。

## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;complex

<SettingsInfoBlock type="Bool" default_value="0" />

`json_value` 関数で struct、array、map などの複合型を戻り値として許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1行取得。経過時間: 0.001秒
```

取りうる値:

* true — 許可。
* false — 不許可。


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

取りうる値:

* true — 許可。
* false — 不許可。


## function_locate_has_mysql_compatible_argument_order \{#function_locate_has_mysql_compatible_argument_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "MySQL の locate 関数との互換性を向上。"}]}]}/>

関数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) における引数の順序を制御します。

使用可能な値:

- 0 — 関数 `locate` は引数 `(haystack, needle[, start_pos])` を受け取ります。
- 1 — 関数 `locate` は引数 `(needle, haystack, [, start_pos])` を受け取ります (MySQL 互換の動作)。

## function_range_max_elements_in_block \{#function_range_max_elements_in_block\} 

<SettingsInfoBlock type="UInt64" default_value="500000000" />

関数 [range](/sql-reference/functions/array-functions#range) によって生成されるデータ量の安全しきい値を設定します。データ 1 ブロックあたりでこの関数によって生成される値の最大数（ブロック内の各行に対する配列サイズの合計）を定義します。

設定可能な値:

- 正の整数。

**関連項目**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \{#function_sleep_max_microseconds_per_block\} 

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "以前のバージョンでは、最大スリープ時間 3 秒という制限は `sleep` のみに適用され、`sleepEachRow` 関数には適用されていませんでした。新しいバージョンでは、この設定を導入しました。互換性モードで以前のバージョンを指定した場合、この制限は完全に無効化されます。"}]}]}/>

関数 `sleep` が各ブロックごとにスリープできる最大マイクロ秒数です。ユーザーがこれより大きい値を指定して呼び出した場合、例外をスローします。安全性のためのしきい値です。

## function_visible_width_behavior \{#function_visible_width_behavior\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "`visibleWidth` のデフォルト動作を、より精密になるように変更しました"}]}]}/>

`visibleWidth` の動作バージョンを指定します。0 - コードポイント数のみをカウントします。1 - ゼロ幅文字および結合文字を正しくカウントし、全角文字を 2 文字分として数え、タブ幅を推定し、削除文字もカウントします。

## geo_distance_returns_float64_on_float64_arguments \{#geo_distance_returns_float64_on_float64_arguments\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "デフォルト精度の向上。"}]}]}/>

`geoDistance`、`greatCircleDistance`、`greatCircleAngle` 関数への 4 つの引数がすべて Float64 型の場合、Float64 を返し、内部計算には倍精度を使用します。以前の ClickHouse のバージョンでは、これらの関数は常に Float32 を返していました。

## geotoh3_argument_order \{#geotoh3_argument_order\} 

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "経度と緯度の引数の並び順を従来の動作として設定するための新しい設定"}]}]}/>

関数 `geoToH3` は、`lon_lat` に設定されている場合は (lon, lat)、`lat_lon` に設定されている場合は (lat, lon) を引数として受け取ります。

## glob_expansion_max_elements \{#glob_expansion_max_elements\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

許容されるアドレス数の上限（外部ストレージやテーブル関数など）。

## grace_hash_join_initial_buckets \{#grace_hash_join_initial_buckets\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

grace ハッシュ結合における初期バケット数

## grace_hash_join_max_buckets \{#grace_hash_join_max_buckets\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Grace ハッシュ結合のバケット数の上限

## group_by_overflow_mode \{#group_by_overflow_mode\} 

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

集計における一意キーの数が上限を超えたときの挙動を設定します。

- `throw`: 例外をスローする
- `break`: クエリの実行を停止し、部分的な結果を返す
- `any`: セットにすでに含まれているキーについては集計を継続するが、新しいキーをセットに追加しない

`any` を指定すると、GROUP BY の近似的な結果を取得できます。
この近似の精度は、データの統計的な性質に依存します。

## group_by_two_level_threshold \{#group_by_two_level_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

キーの数がいくつ以上になったときに二段階の集約を開始するかを指定します。0 を指定すると、しきい値は設定されません。

## group_by_two_level_threshold_bytes \{#group_by_two_level_threshold_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

集約状態のサイズがバイト単位でこの値以上になると、2 段階集約が使用されます。0 を指定するとしきい値は設定されません。複数あるしきい値のうち少なくとも 1 つが満たされた場合に、2 段階集約が使用されます。

## group_by_use_nulls \{#group_by_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[GROUP BY 句](/sql-reference/statements/select/group-by) における集約キーの型の扱い方を変更します。
`ROLLUP`、`CUBE`、`GROUPING SETS` 指定子が使用されている場合、一部の集約キーは一部の結果行を生成する際に使用されないことがあります。
この設定に応じて、これらのキーの列には、対応する行でデフォルト値または `NULL` が設定されます。

可能な値:

- 0 — 欠損値を生成する際に、集約キー型のデフォルト値が使用されます。
- 1 — ClickHouse は SQL 標準で規定されているのと同じ方法で `GROUP BY` を実行します。集約キーの型は [Nullable](/sql-reference/data-types/nullable) に変換されます。対応する集約キーの列には、それを使用しなかった行に対して [NULL](/sql-reference/syntax#null) が設定されます。

関連項目:

- [GROUP BY 句](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \{#h3togeo_lon_lat_result_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

関数 `h3ToGeo` は、true のときは (lon, lat)、それ以外のときは (lat, lon) を返します。

## handshake_timeout_ms \{#handshake_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

レプリカとのハンドシェイク時に Hello パケットを受信するまでのタイムアウト時間（ミリ秒単位）。

## hdfs_create_new_file_on_insert \{#hdfs_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

HDFS エンジンのテーブルに対する各 `INSERT` ごとに新しいファイルを作成するかどうかを有効化／無効化します。有効な場合は、各 `INSERT` ごとに次のパターンに類似した名前の新しい HDFS ファイルが作成されます:

初期状態: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

取り得る値:

- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追記します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## hdfs_ignore_file_doesnt_exist \{#hdfs_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、HDFS テーブルエンジンで例外を投げる代わりに 0 行を返すことを許可"}]}]}/>

特定のキーを読み取る際、対象のファイルが存在しない場合でも、そのファイルがないことを無視します。

可能な値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## hdfs_replication \{#hdfs_replication\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

実際のレプリカ数は、HDFS ファイルの作成時に指定できます。

## hdfs_skip_empty_files \{#hdfs_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[HDFS](../../engines/table-engines/integrations/hdfs.md) エンジンのテーブルで、空ファイルをスキップするかどうかを切り替えます。

Possible values:

- 0 — 要求されたフォーマットと互換性のない空ファイルがある場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## hdfs_throw_on_zero_files_match \{#hdfs_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "HDFS エンジンで ListObjects リクエストがいずれのファイルにも一致しない場合に、空のクエリ結果ではなくエラーをスローできるようにする"}]}]}/>

グロブ展開ルールに従って一致するファイルが 1 件もない場合にエラーをスローします。

Possible values:

- 1 — `SELECT` が例外をスローします。
- 0 — `SELECT` が空の結果を返します。

## hdfs_truncate_on_insert \{#hdfs_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`hdfs` エンジンのテーブルに対する `INSERT` 実行前に、トランケート（既存ファイル内容の削除）を有効または無効にします。無効になっている場合、HDFS 上にファイルが既に存在するときに `INSERT` を試みると、例外がスローされます。

Possible values:

- 0 — `INSERT` クエリは新しいデータをファイルの末尾に追記します。
- 1 — `INSERT` クエリはファイルの既存コンテンツを新しいデータで置き換えます。

## hedged_connection_timeout_ms \{#hedged_connection_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "以前の接続タイムアウトと整合させるため、ヘッジリクエストでは 100 ms ではなく 50 ms 経過後に新しい接続を開始する"}]}]}/>

ヘッジリクエストにおいてレプリカへの接続を確立する際の接続タイムアウト

## hnsw_candidate_list_size_for_search \{#hnsw_candidate_list_size_for_search\} 

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "新しい設定。以前は CREATE INDEX で任意に指定でき、指定しない場合のデフォルト値は 64 でした。"}]}]}/>

ベクトル類似性インデックスを検索する際の動的な候補リストのサイズです。`ef_search` とも呼ばれます。

## hsts_max_age \{#hsts_max_age\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HSTS の有効期間。0 の場合は HSTS を無効化します。

## http_connection_timeout \{#http_connection_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="1" />

HTTP 接続のタイムアウト時間（秒）。

設定可能な値:

- 任意の正の整数。
- 0 - 無効（無限タイムアウト）。

## http_headers_progress_interval_ms \{#http_headers_progress_interval_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP ヘッダー `X-ClickHouse-Progress` は、指定された間隔より短い間隔では送信されません。

## http_make_head_request \{#http_make_head_request\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`http_make_head_request` 設定は、HTTP 経由でデータを読み取る際に、読み込み対象のファイルサイズなどの情報を取得するために `HEAD` リクエストを実行できるようにします。デフォルトで有効になっているため、サーバーが `HEAD` リクエストをサポートしていない場合などには、この設定を無効にすることが望ましい場合があります。

## http_max_field_name_size \{#http_max_field_name_size\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダー内のフィールド名の最大長

## http_max_field_value_size \{#http_max_field_value_size\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

HTTP ヘッダー内のフィールド値の最大長さ

## http_max_fields \{#http_max_fields\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

HTTP ヘッダー内のフィールド数の上限

## http_max_multipart_form_data_size \{#http_max_multipart_form_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

`multipart/form-data` コンテンツのサイズ上限です。この設定は URL パラメータからは解釈されないため、ユーザープロファイルで設定する必要があります。コンテンツはクエリ実行の開始前に解析され、外部テーブルがメモリ上に作成されることに注意してください。この段階で有効なのはこの制限だけであり、`max_memory_usage` や `max_execution_time` などの制限は、HTTP フォームデータの読み取り中には影響しません。

## http_max_request_param_data_size \{#http_max_request_param_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

事前定義された HTTP リクエストにおいて、クエリパラメータとして使用されるリクエストデータのサイズ制限。

## http_max_tries \{#http_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

HTTP 経由での読み取りの最大試行回数。

## http_max_uri_size \{#http_max_uri_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

HTTP リクエスト URI の最大長を設定します。

設定可能な値:

- 正の整数。

## http_native_compression_disable_checksumming_on_decompress \{#http_native_compression_disable_checksumming_on_decompress\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クライアントからの HTTP POST データを展開する際に、チェックサム検証を行うかどうかを有効または無効にします。ClickHouse ネイティブ圧縮フォーマットでのみ使用されます（`gzip` や `deflate` では使用されません）。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## http_receive_timeout \{#http_receive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "http_send_timeout を参照。"}]}]}/>

HTTP 受信タイムアウト（秒）。

設定可能な値:

- 任意の正の整数。
- 0 - 無効（タイムアウト無制限）。

## http_response_buffer_size \{#http_response_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

HTTPレスポンスをクライアントに送信する前、または（`http_wait_end_of_query` が有効な場合）ディスクにフラッシュする前に、サーバーメモリ内でバッファリングするバイト数。

## http_response_headers \{#http_response_headers\} 

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "New setting."}]}]}/>

サーバーがクエリ結果を正常に返す際の HTTP レスポンスヘッダーを追加または上書きできるようにします。
これは HTTP インターフェイスにのみ影響します。

ヘッダーがすでにデフォルトで設定されている場合、指定した値がそれを上書きします。
ヘッダーがデフォルトで設定されていない場合は、ヘッダー一覧に追加されます。
サーバーによってデフォルトで設定されており、この設定で上書きされないヘッダーはそのまま残ります。

この設定では、ヘッダーを固定値に設定できます。現在のところ、ヘッダーを動的に計算された値に設定する方法はありません。

名前と値のいずれにも ASCII 制御文字を含めることはできません。

返されたヘッダーに基づいて判断を行うと同時に、ユーザーに設定の変更を許可する UI アプリケーションを実装する場合は、この設定を読み取り専用 (readonly) に制限することを推奨します。

例: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \{#http_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

HTTP 経由での読み取りを再試行する際に使用されるバックオフの最小ミリ秒数

## http_retry_max_backoff_ms \{#http_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

HTTP 経由の読み取りを再試行する際のバックオフ時間の最大値（ミリ秒）

## http_send_timeout \{#http_send_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 分はさすがに長すぎます。これはアップロード全体の処理時間ではなく、単一のネットワーク書き込み呼び出しに対するタイムアウトであることに注意してください。"}]}]}/>

HTTP 送信タイムアウト（秒単位）。

指定可能な値:

- 任意の正の整数。
- 0 - 無効（タイムアウト無制限）。

:::note
既定プロファイルにのみ適用されます。変更を反映させるにはサーバーの再起動が必要です。
:::

## http_skip_not_found_url_for_globs \{#http_skip_not_found_url_for_globs\} 

<SettingsInfoBlock type="Bool" default_value="1" />

HTTP_NOT_FOUND エラーが発生したグロブパターンに一致する URL をスキップする

## http_wait_end_of_query \{#http_wait_end_of_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー側での HTTP レスポンスのバッファリングを有効にします。

## http_write_exception_in_output_format \{#http_write_exception_in_output_format\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "形式間の一貫性のために変更"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "HTTP ストリーミング中の例外発生時に有効な JSON/XML を出力。"}]}]}/>

妥当な出力を生成するために、例外を出力フォーマットで出力します。JSON および XML フォーマットで動作します。

## http_zlib_compression_level \{#http_zlib_compression_level\} 

<SettingsInfoBlock type="Int64" default_value="3" />

[enable_http_compression = 1](#enable_http_compression) の場合に、HTTP リクエストに対するレスポンスで使用するデータ圧縮レベルを設定します。

取りうる値: 1 から 9 までの数値。

## iceberg_delete_data_on_drop \{#iceberg_delete_data_on_drop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

`DROP` 実行時にすべての Iceberg ファイルを削除するかどうかを制御します。

## iceberg_insert_max_bytes_in_data_file \{#iceberg_insert_max_bytes_in_data_file\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "新しい設定。"}]}]}/>

INSERT 操作時に生成される Iceberg Parquet データファイルの最大サイズ（バイト数）。

## iceberg_insert_max_partitions \{#iceberg_insert_max_partitions\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Iceberg テーブルエンジンでの 1 回の挿入操作において許可される最大パーティション数。

## iceberg_insert_max_rows_in_data_file \{#iceberg_insert_max_rows_in_data_file\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "New setting."}]}]}/>

INSERT 操作時に作成される Iceberg の Parquet データファイルの最大行数。

## iceberg_metadata_compression_method \{#iceberg_metadata_compression_method\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい設定"}]}]}/>

`.metadata.json` ファイルの圧縮方式。

## iceberg_metadata_log_level \{#iceberg_metadata_log_level\} 

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

Iceberg テーブルのメタデータを system.iceberg_metadata_log に出力する際のログレベルを制御します。
通常、この設定はデバッグ目的で変更します。

設定可能な値:

- none - メタデータログなし。
- metadata - ルートの metadata.json ファイル。
- manifest_list_metadata - 上記すべて + スナップショットに対応する Avro manifest list のメタデータ。
- manifest_list_entry - 上記すべて + Avro manifest list のエントリ。
- manifest_file_metadata - 上記すべて + 走査された Avro manifest file のメタデータ。
- manifest_file_entry - 上記すべて + 走査された Avro manifest file のエントリ。

## iceberg_snapshot_id \{#iceberg_snapshot_id\} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

特定のスナップショット ID を指定して Iceberg テーブルをクエリします。

## iceberg_timestamp_ms \{#iceberg_timestamp_ms\} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

特定のタイムスタンプにおいて有効だったスナップショットを使用して Iceberg テーブルをクエリします。

## idle_connection_timeout \{#idle_connection_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

アイドル状態の TCP 接続を、指定した秒数経過後に閉じるためのタイムアウト値です。

取りうる値:

- 正の整数（0 を指定すると、0 秒後、つまり即時に閉じます）。

## ignore_cold_parts_seconds \{#ignore_cold_parts_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ効果があります。新しいデータパーツは、事前にウォームアップされる（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）か、指定した秒数が経過するまで、SELECT クエリの対象から除外されます。Replicated-/SharedMergeTree 専用です。

## ignore&#95;data&#95;skipping&#95;indices

クエリで使用される場合でも、指定したデータスキッピングインデックスを無視します。

次の例を示します。

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- 正常に実行されます。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- 正常に実行されます。

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- xy_idxが明示的に無視されているため、クエリはINDEX_NOT_USEDエラーを発生させます。
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

いずれのインデックスも無視しないクエリ:

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

MergeTree ファミリーのテーブルで動作します。


## ignore_drop_queries_probability \{#ignore_drop_queries_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "テスト目的で、指定した確率でサーバーが DROP クエリを無視できるようにする"}]}]}/>

この設定を有効にすると、サーバーは指定した確率で、すべての DROP TABLE クエリを無視します（Memory エンジンと JOIN エンジンでは、DROP を TRUNCATE に置き換えます）。テスト目的で使用します。

## ignore_materialized_views_with_dropped_target_table \{#ignore_materialized_views_with_dropped_target_table\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "ターゲットテーブルがドロップされたマテリアライズドビューを無視できるようにする新しい設定を追加"}]}]}/>

ビューへのプッシュ時に、ターゲットテーブルがドロップされた MV を無視します

## ignore_on_cluster_for_replicated_access_entities_queries \{#ignore_on_cluster_for_replicated_access_entities_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケートされたアクセスエンティティを管理するクエリに対しては、ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_named_collections_queries \{#ignore_on_cluster_for_replicated_named_collections_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "レプリケートされた named collection を管理するクエリに対して、ON CLUSTER 句を無視します。"}]}]}/>

レプリケートされた named collection を管理するクエリに対して、ON CLUSTER 句を無視します。

## ignore_on_cluster_for_replicated_udf_queries \{#ignore_on_cluster_for_replicated_udf_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

レプリケート UDF の管理クエリに対して、ON CLUSTER 句を無視します。

## implicit_select \{#implicit_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

先頭の SELECT キーワードなしで簡単な SELECT クエリを書けるようにします。これにより、たとえば `1 + 2` のような式も有効なクエリとして扱えるため、電卓のような用途での利用が容易になります。

`clickhouse-local` ではデフォルトで有効になっており、明示的に無効にできます。

## implicit_table_at_top_level \{#implicit_table_at_top_level\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "clickhouse-local で使用される新しい設定"}]}]}/>

この設定が空でない場合、トップレベルで FROM 句を持たないクエリは、`system.one` の代わりにこのテーブルから読み取ります。

これは clickhouse-local で入力データを処理する目的で使用されます。
この設定はユーザーが明示的に設定することもできますが、そのような用途を意図したものではありません。

副問い合わせ（スカラ副問い合わせ、FROM 句の副問い合わせ、IN 句の副問い合わせのいずれも）は、この設定の影響を受けません。
UNION、INTERSECT、EXCEPT チェーンのトップレベルにある SELECT は、そのかっこでのグルーピングに関係なく一様に扱われ、この設定の影響を受けます。
この設定がビューおよび分散クエリにどのように影響するかは規定されていません。

この設定にはテーブル名（その場合、そのテーブルはカレントデータベースから解決されます）または 'database.table' 形式の修飾名を指定できます。
database 名と table 名はどちらもクォートしてはいけません。単純な識別子のみが許可されます。

## implicit_transaction \{#implicit_transaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

この設定が有効で、かつ現在トランザクション内でない場合、クエリを完全なトランザクション（BEGIN + COMMIT または ROLLBACK）としてラップします。

## inject_random_order_for_select_without_order_by \{#inject_random_order_for_select_without_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

有効化すると、ORDER BY 句を含まない SELECT クエリに対して 'ORDER BY rand()' を挿入します。
サブクエリの深さが 0（トップレベルのクエリ）の場合にのみ適用されます。サブクエリおよび INSERT INTO ... SELECT には影響しません。
最上位の構造が UNION の場合、すべての子要素に対してそれぞれ独立して 'ORDER BY rand()' が挿入されます。
ORDER BY が指定されていないことによる非決定的なクエリ結果を確認するためのテストおよび開発用途にのみ有用です。

## input_format_parallel_parsing \{#input_format_parallel_parsing\} 

<SettingsInfoBlock type="Bool" default_value="1" />

データフォーマットに対する順序保持の並列パースを有効または無効にします。[TabSeparated (TSV)](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、および [JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットでのみサポートされます。

取りうる値:

- 1 — 有効。
- 0 — 無効。

## insert_allow_materialized_columns \{#insert_allow_materialized_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

この設定を有効にすると、INSERT 時にマテリアライズド列を許可します。

## insert_deduplicate \{#insert_deduplicate\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`INSERT` によるブロックの重複排除を有効または無効にします（Replicated\* テーブル用）。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

デフォルトでは、`INSERT` 文によってレプリケートされたテーブルに挿入されるブロックは重複排除されます（[Data Replication](../../engines/table-engines/mergetree-family/replication.md) を参照）。
レプリケートされたテーブルでは、デフォルトで各パーティションにつき直近 100 個のブロックのみが重複排除されます（[replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
レプリケートされていないテーブルについては、[non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

## insert&#95;deduplication&#95;token

この設定により、ユーザーは MergeTree/ReplicatedMergeTree において独自の重複排除ロジックを指定できます。
たとえば、各 INSERT ステートメントごとにこの設定に一意な値を指定することで、
同じデータが挿入された場合でも、それが重複排除されるのを防げます。

取りうる値:

* 任意の文字列

`insert_deduplication_token` は、空でない場合に *のみ* 重複排除に使用されます。

レプリケートされたテーブルでは、デフォルトでは各パーティションに対して直近 100 個の INSERT のみが重複排除されます（[replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window)、[replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds) を参照）。
レプリケートされていないテーブルについては [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window) を参照してください。

:::note
`insert_deduplication_token` はパーティションレベルで動作します（`insert_deduplication` チェックサムと同様）。
複数のパーティションで同じ `insert_deduplication_token` を持つことができます。
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


## insert_keeper_fault_injection_probability \{#insert_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

INSERT 処理中の keeper リクエストが失敗するおおよその確率です。有効な値の範囲は [0.0f, 1.0f] です。

## insert_keeper_fault_injection_seed \{#insert_keeper_fault_injection_seed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 の場合はランダムシード。それ以外の値を指定した場合は、その値がシードとして使用されます。

## insert&#95;keeper&#95;max&#95;retries

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "INSERT 時の Keeper への再接続を有効化し、信頼性を向上"}]}]} />

この設定は、replicated MergeTree への INSERT 実行時に実行される ClickHouse Keeper（または ZooKeeper）リクエストの再試行回数の上限を設定します。ネットワークエラー、Keeper セッションタイムアウト、またはリクエストタイムアウトが原因で失敗した Keeper リクエストのみが再試行の対象となります。

設定可能な値:

* 正の整数
* 0 — 再試行を無効にする

Cloud におけるデフォルト値: `20`。

Keeper リクエストの再試行は、所定のタイムアウト後に行われます。タイムアウトは次の設定で制御されます: `insert_keeper_retry_initial_backoff_ms`、`insert_keeper_retry_max_backoff_ms`。
最初の再試行は `insert_keeper_retry_initial_backoff_ms` のタイムアウト後に行われます。以降のタイムアウトは次のように計算されます:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

例えば、`insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000`、`insert_keeper_max_retries=8` の場合、タイムアウトは `100, 200, 400, 800, 1600, 3200, 6400, 10000` となります。

フォールトトレランスを高めるだけでなく、リトライにはユーザー体験を向上させる狙いもあります。例えばアップグレードに伴う Keeper の再起動時などに、INSERT の実行中にエラーを返さずに済むようにします。


## insert_keeper_retry_initial_backoff_ms \{#insert_keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

INSERT クエリの実行中に失敗した Keeper リクエストを再試行する際の初期待機時間（ミリ秒）

設定可能な値:

- 正の整数。
- 0 — タイムアウトなし

## insert_keeper_retry_max_backoff_ms \{#insert_keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

INSERT クエリの実行中に失敗した Keeper リクエストを再試行する際の最大タイムアウト（ミリ秒）

設定可能な値:

- 正の整数
- 0 — 最大タイムアウトは無制限

## insert_null_as_default \{#insert_null_as_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

[default values](/sql-reference/statements/create/table#default_values) の代わりに、[NULL](/sql-reference/syntax#null) を NULL を許容しないデータ型の列へ挿入するかどうかを制御します。列が [nullable](/sql-reference/data-types/nullable) でない場合、この設定が無効だと `NULL` を挿入すると例外が発生します。列の型が NULL 許容の場合、この設定に関わらず `NULL` 値はそのまま挿入されます。

この設定は [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select) クエリに適用されます。`SELECT` サブクエリは `UNION ALL` 句で連結されている場合があります。

指定可能な値:

- 0 — NULL 非許容列に `NULL` を挿入すると例外が発生します。
- 1 — `NULL` の代わりに列のデフォルト値が挿入されます。

## insert_quorum \{#insert_quorum\} 

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
この設定は SharedMergeTree には適用されません。詳細は [SharedMergeTree の整合性](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム書き込みを制御します。

- `insert_quorum < 2` の場合、クォーラム書き込みは無効になります。
- `insert_quorum >= 2` の場合、クォーラム書き込みは有効になります。
- `insert_quorum = 'auto'` の場合、クォーラム数として過半数（`number_of_replicas / 2 + 1`）が使用されます。

クォーラム書き込み

`INSERT` は、ClickHouse が `insert_quorum_timeout` の間に、指定された数 `insert_quorum` のレプリカへデータを書き込みできた場合にのみ成功します。何らかの理由で、正常に書き込まれたレプリカ数が `insert_quorum` に達しない場合、その書き込みは失敗と見なされ、ClickHouse はすでにデータが書き込まれているすべてのレプリカから挿入済みブロックを削除します。

`insert_quorum_parallel` が無効な場合、クォーラム内のすべてのレプリカは整合性があります。すなわち、これまでのすべての `INSERT` クエリのデータを保持します（`INSERT` のシーケンスは直列化されます）。`insert_quorum` を使用して書き込まれたデータを読み出す際に `insert_quorum_parallel` が無効であれば、[select_sequential_consistency](#select_sequential_consistency) を有効化することで、`SELECT` クエリに対して逐次整合性を確保できます。

ClickHouse は次の場合に例外をスローします。

- クエリ実行時点で利用可能なレプリカ数が `insert_quorum` より少ない場合。
- `insert_quorum_parallel` が無効であり、前のブロックがまだレプリカの `insert_quorum` に挿入されていない状態で書き込みを試みた場合。この状況は、ユーザーが `insert_quorum` 付きの前回の `INSERT` が完了する前に、同じテーブルに対して別の `INSERT` クエリを実行しようとした場合に発生する可能性があります。

関連項目:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \{#insert_quorum_parallel\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで並列クォーラム INSERT を使用します。これは逐次クォーラム INSERT よりもはるかに利用しやすくなります"}]}]}/>

:::note
この設定は SharedMergeTree には適用されません。詳細については、[SharedMergeTree の整合性](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

クォーラム `INSERT` クエリに対する並列実行を有効または無効にします。有効にした場合、前のクエリがまだ完了していなくても、追加の `INSERT` クエリを送信できます。無効にした場合、同じテーブルへの追加の書き込みは拒否されます。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \{#insert_quorum_timeout\} 

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

クォーラムへの書き込みに対するタイムアウト（ミリ秒単位）。このタイムアウトを過ぎても書き込みが行われない場合、ClickHouse は例外をスローし、クライアントは同じブロックを同じレプリカまたは別のレプリカに書き込むためにクエリを再実行する必要があります。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert&#95;shard&#95;id

<SettingsInfoBlock type="UInt64" default_value="0" />

`0` 以外の場合、データを同期的に挿入する先の [Distributed](/engines/table-engines/special/distributed) テーブルのシャードを指定します。

`insert_shard_id` の値が正しくない場合、サーバーは例外をスローします。

`requested_cluster` におけるシャード数を取得するには、サーバー設定を確認するか、次のクエリを使用できます。

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

可能な値:

* 0 — 無効。
* 対応する [Distributed](/engines/table-engines/special/distributed) テーブルの `1` 以上 `shards_num` 以下の任意の数値。

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

リクエスト実行がキャンセルされていないかを確認し、進捗情報を送信するためのチェック間隔（マイクロ秒単位）。

## intersect_default_mode \{#intersect_default_mode\} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

INTERSECT クエリのデフォルトモードを設定します。指定可能な値は空文字列、'ALL'、'DISTINCT' です。空文字列を指定した場合、モードを指定していないクエリは例外を送出します。

## jemalloc_collect_profile_samples_in_trace_log \{#jemalloc_collect_profile_samples_in_trace_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

トレースログにおいて、jemalloc の割り当ておよび解放のサンプルを収集します。

## jemalloc_enable_profiler \{#jemalloc_enable_profiler\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリに対して jemalloc プロファイラを有効にします。jemalloc はメモリアロケーションをサンプリングし、サンプリング対象となったアロケーションに対するすべての解放を追跡します。
プロファイルは、アロケーション分析に利用できる SYSTEM JEMALLOC FLUSH PROFILE を使用してフラッシュできます。
サンプルは、設定 `jemalloc_collect_global_profile_samples_in_trace_log`、またはクエリ設定 `jemalloc_collect_profile_samples_in_trace_log` を使用することで system.trace_log に保存することもできます。
[Allocation Profiling](/operations/allocation-profiling) を参照してください。

## join_algorithm \{#join_algorithm\} 

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' は join アルゴリズムを明示的に指定する方針に伴い非推奨となり、さらに parallel_hash が hash より優先されるようになりました"}]}]}/>

どの [JOIN](../../sql-reference/statements/select/join.md) アルゴリズムを使用するかを指定します。

複数のアルゴリズムを指定でき、クエリごとに種別/厳密さおよびテーブルエンジンに基づいて、利用可能なものの中から 1 つが選択されます。

取り得る値:

- grace_hash

[Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join) を使用します。Grace hash は、メモリ使用量を制限しつつ、複雑な join を高いパフォーマンスで実行できるアルゴリズムオプションです。

Grace hash join の最初のフェーズでは、右テーブルを読み込み、キー列のハッシュ値に応じて N 個のバケットに分割します (初期値の N は `grace_hash_join_initial_buckets`)。これは各バケットを独立して処理できるように行われます。最初のバケットの行はインメモリのハッシュテーブルに追加され、それ以外のバケットはディスクに保存されます。ハッシュテーブルがメモリ制限 (例: [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join) で設定) を超えて成長した場合、バケット数が増やされ、各行に再度バケットが割り当てられます。現在のバケットに属さない行はフラッシュされ、再割り当てされます。

`INNER/LEFT/RIGHT/FULL ALL/ANY JOIN` をサポートします。

- hash

[Hash join アルゴリズム](https://en.wikipedia.org/wiki/Hash_join) を使用します。あらゆる種別と厳密さの組み合わせ、および `JOIN ON` 句で `OR` で結合される複数の join キーをサポートする、最も汎用的な実装です。

`hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM にロードされます。

- parallel_hash

`hash` join のバリエーションであり、データをバケットに分割して、1 つではなく複数のハッシュテーブルを並列に構築することで、この処理を高速化します。

`parallel_hash` アルゴリズムを使用する場合、`JOIN` の右側は RAM にロードされます。

- partial_merge

[sort-merge アルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) のバリエーションであり、右テーブルのみを完全にソートします。

`RIGHT JOIN` と `FULL JOIN` は `ALL` 厳密さでのみサポートされます (`SEMI`、`ANTI`、`ANY`、`ASOF` はサポートされません)。

`partial_merge` アルゴリズムを使用する場合、ClickHouse はデータをソートしてディスクにダンプします。ClickHouse の `partial_merge` アルゴリズムは古典的な実装とは少し異なります。まず、ClickHouse は右テーブルを join キーでブロックごとにソートし、ソート済みブロックに対して min-max インデックスを作成します。次に、左テーブルの一部を `join key` でソートし、それらを右テーブルと結合します。また、min-max インデックスを使用して不要な右テーブルブロックをスキップします。

- direct

右テーブルのストレージがキー・バリュー型の問い合わせをサポートしている場合に適用できるアルゴリズムです。

`direct` アルゴリズムは、左テーブルの行をキーとして使用して右テーブルを検索します。[Dictionary](/engines/table-engines/special/dictionary) や [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) などの特殊なストレージでのみサポートされ、`LEFT` および `INNER` JOIN のみがサポートされます。

- auto

`auto` に設定すると、最初に `hash` join を試し、メモリ制限に違反した場合はオンザフライで別のアルゴリズムに切り替えます。

- full_sorting_merge

結合前に両方のテーブルを完全にソートする [sort-merge アルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join) です。

- prefer_partial_merge

可能な場合は常に `partial_merge` join を使用し、そうでなければ `hash` を使用します。*非推奨* であり、`partial_merge,hash` と同じです。

- default (deprecated)

レガシーな値です。使用しないでください。
`direct,hash` と同じであり、direct join と hash join をこの順序で試行します。

## join_any_take_last_row \{#join_any_take_last_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`ANY` 厳密さを持つ `JOIN` 演算の動作を変更します。

:::note
この設定は、[Join](../../engines/table-engines/special/join.md) エンジンのテーブルに対する `JOIN` 演算にのみ適用されます。
:::

設定可能な値:

- 0 — 右テーブルに複数の一致する行がある場合、最初に見つかった 1 行のみを結合します。
- 1 — 右テーブルに複数の一致する行がある場合、最後に見つかった 1 行のみを結合します。

関連項目:

- [JOIN 句](/sql-reference/statements/select/join)
- [Join テーブルエンジン](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \{#join_default_strictness\} 

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

[JOIN 句](/sql-reference/statements/select/join)におけるデフォルトの厳密さを設定します。

設定可能な値:

- `ALL` — 右側のテーブルに複数の一致する行がある場合、一致する行から[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成します。これは標準 SQL における通常の `JOIN` の動作です。
- `ANY` — 右側のテーブルに複数の一致する行がある場合、最初に見つかった 1 行だけを結合します。右側のテーブルに一致する行が 1 行だけの場合、`ANY` と `ALL` の結果は同じになります。
- `ASOF` — 一致が不確実なシーケンス同士を結合するためのモードです。
- `Empty string` — クエリ内で `ALL` または `ANY` が指定されていない場合、ClickHouse は例外を送出します。

## join_on_disk_max_files_to_merge \{#join_on_disk_max_files_to_merge\} 

<SettingsInfoBlock type="UInt64" default_value="64" />

`MergeJoin` の操作がディスク上で実行される場合に、並列ソートに使用できるファイル数の上限を制御します。

この設定値が大きいほど、使用されるRAMは増えますが、必要なディスクI/Oは減少します。

設定可能な値:

- 2以上の任意の正の整数。

## join_output_by_rowlist_perkey_rows_threshold \{#join_output_by_rowlist_perkey_rows_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "ハッシュ結合において、右側テーブルのキーごとの平均行数が行リスト出力を使用するかどうかを判断するための下限値。"}]}]}/>

ハッシュ結合において、右側テーブルのキーごとの平均行数が行リスト出力を使用するかどうかを判断するための下限値。

## join_overflow_mode \{#join_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

次のいずれかの JOIN 制限に達した場合に、ClickHouse が実行する動作を定義します。

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

指定可能な値:

- `THROW` — ClickHouse は例外を送出し、処理を中断します。
- `BREAK` — ClickHouse は処理を中断しますが、例外は送出しません。

デフォルト値: `THROW`。

**関連項目**

- [JOIN 句](/sql-reference/statements/select/join)
- [JOIN テーブルエンジン](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \{#join_runtime_bloom_filter_bytes\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

JOIN のランタイムフィルターとして使用される Bloom フィルターのサイズ（バイト単位）。`enable_join_runtime_filters` 設定を参照。

## join_runtime_bloom_filter_hash_functions \{#join_runtime_bloom_filter_hash_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

JOIN のランタイムフィルターとして使用される Bloom フィルターで用いるハッシュ関数の数です（`enable_join_runtime_filters` 設定を参照）。

## join_runtime_filter_exact_values_limit \{#join_runtime_filter_exact_values_limit\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

ランタイムフィルター内で、そのまま集合として保存される要素の最大数です。このしきい値を超えると、Bloom フィルターに切り替わります。

## join_to_sort_maximum_table_rows \{#join_to_sort_maximum_table_rows\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "左結合または内部結合において、右テーブルをキーで再ソートするかどうかを判断する際に考慮される右テーブルの最大行数"}]}]}/>

左結合または内部結合において、右テーブルをキーで再ソートするかどうかを判断する際に考慮される右テーブルの最大行数。

## join_to_sort_minimum_perkey_rows \{#join_to_sort_minimum_perkey_rows\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "右テーブルにおけるキーごとの平均行数の下限値です。left join または inner join において、右テーブルをキーで再ソートするかどうかを判定するために使用されます。この設定により、キーが疎なテーブルにはこの最適化が適用されないようにします"}]}]}/>

右テーブルにおけるキーごとの平均行数の下限値です。left join または inner join において、右テーブルをキーで再ソートするかどうかを判定するために使用されます。この設定により、キーが疎なテーブルにはこの最適化が適用されないようにします

## join_use_nulls \{#join_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[JOIN](../../sql-reference/statements/select/join.md) の動作の種類を設定します。テーブルを結合すると、空のセルが発生する場合があります。この設定に応じて、ClickHouse はそれらを異なる方法で補完します。

指定可能な値:

- 0 — 空のセルは、対応するフィールド型のデフォルト値で埋められます。
- 1 — `JOIN` が標準 SQL と同様に動作します。対応するフィールドの型は [Nullable](/sql-reference/data-types/nullable) に変換され、空のセルは [NULL](/sql-reference/syntax) で埋められます。

## joined_block_split_single_row \{#joined_block_split_single_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

左テーブルの単一行に対応する行ごとに、ハッシュ結合結果をチャンクに分割できるようにします。
これは、右テーブル側に多くの一致行を持つ行が存在する場合のメモリ使用量を削減する可能性がありますが、CPU 使用量が増加する可能性があります。
この設定を有効にするには、`max_joined_block_size_rows != 0` であることが必須です。
`max_joined_block_size_bytes` をこの設定と併用することで、右テーブル側に多数の一致を持つ大きな行が一部に偏って存在する（スキューした）データの場合でも、過剰なメモリ使用を回避するのに役立ちます。

## joined_subquery_requires_alias \{#joined_subquery_requires_alias\} 

<SettingsInfoBlock type="Bool" default_value="1" />

JOIN されたサブクエリおよびテーブル関数に対して、名前の修飾を正しく行うためにエイリアスの指定を必須とします。

## kafka_disable_num_consumers_limit \{#kafka_disable_num_consumers_limit\} 

<SettingsInfoBlock type="Bool" default_value="0" />

利用可能な CPU コア数に依存する `kafka_num_consumers` の上限を無効化します。

## kafka_max_wait_ms \{#kafka_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

再試行する前に、[Kafka](/engines/table-engines/integrations/kafka) からメッセージを読み取る際の待機時間（ミリ秒）。

取りうる値:

- 正の整数。
- 0 — 無制限（タイムアウトしない）。

関連項目:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \{#keeper_map_strict_mode\} 

<SettingsInfoBlock type="Bool" default_value="0" />

KeeperMap 上での操作時に追加のチェックを強制します。例えば、すでに存在するキーに対して insert 操作を行った場合に例外をスローします。

## keeper_max_retries \{#keeper_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "一般的な Keeper 操作の最大再試行回数"}]}]}/>

一般的な Keeper 操作の最大再試行回数

## keeper_retry_initial_backoff_ms \{#keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "一般的な Keeper 操作に対する再試行時のバックオフ時間の初期値"}]}]}/>

一般的な Keeper 操作に対する再試行時のバックオフ時間の初期値

## keeper_retry_max_backoff_ms \{#keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "一般的な keeper 操作に対するバックオフ時間の最大値"}]}]}/>

一般的な keeper 操作に対するバックオフ時間の最大値

## least_greatest_legacy_null_behavior \{#least_greatest_legacy_null_behavior\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定"}]}]}/>

この設定を有効にすると、関数 `least` と `greatest` は、引数のいずれかが NULL の場合に NULL を返します。

## legacy_column_name_of_tuple_literal \{#legacy_column_name_of_tuple_literal\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "互換性維持のみを目的として追加された設定です。21.7 未満のバージョンから 21.7 以降のバージョンへクラスタをローリングアップデートする場合にのみ、'true' に設定する意味があります。"}]}]}/>

大きなタプルリテラルについて、ハッシュではなく、各要素の名前を列名としてすべて列挙します。この設定は互換性維持のみを目的として存在します。21.7 未満のバージョンから 21.7 以降のバージョンへクラスタをローリングアップデートする場合にのみ、'true' に設定する意味があります。

## lightweight_delete_mode \{#lightweight_delete_mode\} 

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "A new setting"}]}]}/>

lightweight delete の一部として実行される、内部更新クエリのモードです。

設定可能な値:

- `alter_update` - 重いミューテーションを作成する `ALTER UPDATE` クエリを実行します。
- `lightweight_update` - 可能であれば lightweight update を実行し、それ以外の場合は `ALTER UPDATE` を実行します。
- `lightweight_update_force` - 可能であれば lightweight update を実行し、不可能な場合は例外をスローします。

## lightweight_deletes_sync \{#lightweight_deletes_sync\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "「mutations_sync」と同様ですが、lightweight delete の実行のみを制御します"}]}]}/>

[`mutations_sync`](#mutations_sync) と同様ですが、lightweight delete の実行のみを制御します。

設定可能な値:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | ミューテーションは非同期で実行されます。                                                                                                              |
| `1`   | クエリは、現在のサーバーで lightweight delete が完了するまで待機します。                                                                               |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で lightweight delete が完了するまで待機します。                                                             |
| `3`   | クエリはアクティブなレプリカのみが完了するまで待機します。`SharedMergeTree` でのみサポートされます。`ReplicatedMergeTree` では `mutations_sync = 2` と同じ動作になります。|

**関連項目**

- [ALTER クエリの同期性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Mutations](../../sql-reference/statements/alter/index.md/#mutations)

## limit \{#limit\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ結果から取得する行数の最大値を設定します。クエリで指定された [LIMIT](/sql-reference/statements/select/limit) 句の値に上限を設け、この設定で定めた値を超えないようにします。

設定可能な値:

- 0 — 行数は無制限です。
- 正の整数。

## load_balancing \{#load_balancing\} 

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

分散クエリ処理時に使用するレプリカの選択アルゴリズムを指定します。

ClickHouse は、レプリカを選択するために次のアルゴリズムをサポートしています。

- [ランダム](#load_balancing-random)（デフォルト）
- [最も近いホスト名](#load_balancing-nearest_hostname)
- [ホスト名のレーベンシュタイン距離](#load_balancing-hostname_levenshtein_distance)
- [順番どおり](#load_balancing-in_order)
- [最初またはランダム](#load_balancing-first_or_random)
- [ラウンドロビン](#load_balancing-round_robin)

関連項目：

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### ランダム（デフォルト）

```sql
load_balancing = random
```

エラー数はレプリカごとにカウントされます。クエリはエラー数が最も少ないレプリカに送信され、該当するレプリカが複数ある場合は、そのうちのいずれかに送信されます。
欠点: サーバー間の距離は考慮されません。また、レプリカ間でデータが異なる場合は、取得されるデータも異なります。


### 最寄りのホスト名

```sql
load_balancing = nearest_hostname
```

エラーの数は各レプリカごとにカウントされます。5分ごとに、エラー数は 2 で整数除算されます。したがって、エラー数は直近の時間に対して指数的に平滑化された値として扱われます。最小のエラー数を持つレプリカが 1 つだけ存在する場合（つまり、他のレプリカで最近エラーが発生した場合）、クエリはそのレプリカに送信されます。最小のエラー数を持つレプリカが複数ある場合、クエリは設定ファイル内のサーバーのホスト名に最も類似したホスト名を持つレプリカに送信されます（両方のホスト名のうち短い方の長さまでの、同一位置における異なる文字数に基づきます）。

例えば、example01-01-1 と example01-01-2 は 1 か所だけ異なりますが、example01-01-1 と example01-02-2 は 2 か所異なります。
この方法は単純に見えるかもしれませんが、ネットワークトポロジに関する外部データを必要とせず、また IP アドレスを比較する必要もありません。IPv6 アドレスでは IP アドレスの比較は複雑になります。

したがって、同等の評価となるレプリカが存在する場合は、名前が最も近いレプリカが優先されます。
また、障害がない状況で同じサーバーにクエリを送信する場合、分散クエリも同じサーバー群に送られるとみなせます。そのため、レプリカ間で異なるデータが配置されている場合でも、クエリはほぼ同じ結果を返します。


### ホスト名のレーベンシュタイン距離

```sql
load_balancing = hostname_levenshtein_distance
```

`nearest_hostname` と同様に動作しますが、ホスト名を [Levenshtein 距離](https://en.wikipedia.org/wiki/Levenshtein_distance) に基づいて比較します。例えば次のようになります。

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### In Order（順番どおり）

```sql
load_balancing = in_order
```

同じ数のエラーがあるレプリカには、構成で指定された順序でアクセスされます。
この方法は、どのレプリカを優先すべきかを正確に把握している場合に適しています。


### First または Random

```sql
load_balancing = first_or_random
```

このアルゴリズムは、セット内の最初のレプリカを選択し、そのレプリカが利用できない場合はランダムなレプリカを選択します。クロスレプリケーショントポロジー構成では有効ですが、それ以外の構成ではあまり有用ではありません。

`first_or_random` アルゴリズムは、`in_order` アルゴリズムにおける問題を解決します。`in_order` では、あるレプリカがダウンすると、次のレプリカが通常の 2 倍の負荷を受け、そのほかのレプリカは通常どおりのトラフィック量を処理します。`first_or_random` アルゴリズムを使用すると、利用可能なレプリカ間で負荷が均等に分散されます。

設定 `load_balancing_first_offset` を使用して、最初のレプリカを明示的に定義できます。これにより、レプリカ間でのクエリのワークロードの再バランスを、より柔軟に制御できます。


### ラウンドロビン

```sql
load_balancing = round_robin
```

このアルゴリズムは、同じエラー数のレプリカ間でラウンドロビン方式を使用します（`round_robin` ポリシーが指定されたクエリのみが考慮されます）。


## load_balancing_first_offset \{#load_balancing_first_offset\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

FIRST_OR_RANDOM ロードバランシング戦略が使用されている場合に、クエリの送信先として優先的に選択するレプリカを指定します。

## load_marks_asynchronously \{#load_marks_asynchronously\} 

<SettingsInfoBlock type="Bool" default_value="0" />

MergeTree のマークを非同期に読み込みます

## local_filesystem_read_method \{#local_filesystem_read_method\} 

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

ローカルファイルシステムからデータを読み取る方法を指定します。使用できる値は次のいずれかです: read, pread, mmap, io_uring, pread_threadpool。

'io_uring' メソッドは実験的なものであり、Log、TinyLog、StripeLog、File、Set、Join などのテーブルや、その他の追記可能ファイルを持つテーブルに対して、読み取りと書き込みが並行して行われる状況では動作しません。
インターネット上の 'io_uring' に関するさまざまな記事を読んでも、それらに惑わされないようにしてください。大量の小さな IO リクエストが発生するケース（ClickHouse には当てはまりません）を除き、これはファイル読み取りのより良い方法ではありません。'io_uring' を有効化すべき理由はありません。

## local_filesystem_read_prefetch \{#local_filesystem_read_prefetch\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ローカルファイルシステムからデータを読み取る際にプリフェッチを行うかどうかを指定します。

## lock_acquire_timeout \{#lock_acquire_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="120" />

ロック要求が失敗するまでに待機する秒数を定義します。

ロックのタイムアウトは、テーブルに対する読み取り/書き込み操作の実行中にデッドロックが発生することを防止するために使用されます。タイムアウトが満了してロック要求が失敗すると、ClickHouse サーバーはエラーコード `DEADLOCK_AVOIDED` とともに、例外 "Locking attempt timed out! Possible deadlock avoided. Client should retry." をスローします。

設定可能な値:

- 正の整数（秒）。
- 0 — ロックのタイムアウトなし。

## log&#95;comment

[system.query&#95;log](../system-tables/query_log.md) テーブルの `log_comment` フィールドの値と、サーバーログ用のコメントテキストを指定します。

サーバーログの可読性を向上させるために使用できます。また、[clickhouse-test](../../development/tests.md) を実行した後に `system.query_log` からテストに関連するクエリを抽出する際にも役立ちます。

設定可能な値:

* 長さが [max&#95;query&#95;size](#max_query_size) を超えない任意の文字列。max&#95;query&#95;size を超えた場合、サーバーは例外をスローします。

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


## log_formatted_queries \{#log_formatted_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

整形済みクエリを [system.query_log](../../operations/system-tables/query_log.md) システムテーブルにログとして記録します（[system.query_log](../../operations/system-tables/query_log.md) の `formatted_query` 列を設定します）。

設定可能な値:

- 0 — 整形済みクエリはシステムテーブルに記録されません。
- 1 — 整形済みクエリはシステムテーブルに記録されます。

## log_processors_profiles \{#log_processors_profiles\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

プロセッサが実行している時間およびデータを待機している時間を書き込み先として、`system.processors_profile_log` テーブルに記録します。

関連項目:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \{#log_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行パフォーマンスの統計情報を `query_log`、`query_thread_log`、`query_views_log` に記録します。

## log&#95;queries

<SettingsInfoBlock type="Bool" default_value="1" />

クエリーログを設定します。

この設定を有効にすると、ClickHouse に送信されたクエリーは、[query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log) サーバー設定パラメーターで定義されたルールに従ってログに記録されます。

例:

```text
log_queries=1
```


## log_queries_cut_to_length \{#log_queries_cut_to_length\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

クエリの長さが指定したしきい値（バイト数）を超える場合は、クエリログに書き込む際にクエリを切り詰めます。また、通常のテキストログに出力されるクエリの表示長も制限します。

## log_queries_min_query_duration_ms \{#log_queries_min_query_duration_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

ゼロ以外の値に設定して有効化すると、この設定値より短い時間で完了したクエリはログに記録されません（[MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html) における `long_query_time` と同様のものと考えることができます）。つまり、これらのクエリは次のテーブルには記録されません。

- `system.query_log`
- `system.query_thread_log`

次の種類のクエリのみがログに出力されます。

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- 型: ミリ秒
- デフォルト値: 0（すべてのクエリ）

## log&#95;queries&#95;min&#95;type

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

`query_log` に記録するログ種別の最小値。

可能な値:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

`query_log` に記録されるエントリを制限するために使用できます。たとえばエラーのみに関心がある場合は、`EXCEPTION_WHILE_PROCESSING` を使用できます:

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \{#log_queries_probability\} 

<SettingsInfoBlock type="Float" default_value="1" />

指定した確率に基づいてクエリをランダムにサンプリングし、その一部のみを [query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[query_views_log](../../operations/system-tables/query_views_log.md) システムテーブルに書き込みます。1 秒あたりのクエリ数が多い場合の負荷削減に役立ちます。

可能な値:

- 0 — クエリはシステムテーブルにログとして記録されません。
- [0..1] の範囲の正の浮動小数点数。たとえば、設定値が `0.5` の場合、約半分のクエリがシステムテーブルにログとして記録されます。
- 1 — すべてのクエリがシステムテーブルにログとして記録されます。

## log_query_settings \{#log_query_settings\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`query_log` および OpenTelemetry のスパンログにクエリ設定を記録します。

## log&#95;query&#95;threads

<SettingsInfoBlock type="Bool" default_value="0" />

クエリスレッドのログ記録を設定します。

クエリスレッドは [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md) テーブルに記録されます。この設定は、[log&#95;queries](#log_queries) が true に設定されている場合にのみ有効です。この設定を有効にした状態で ClickHouse によって実行されるクエリスレッドは、[query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) サーバー設定パラメータのルールに従ってログに記録されます。

設定可能な値:

* 0 — 無効。
* 1 — 有効。

**例**

```text
log_query_threads=1
```


## log&#95;query&#95;views

<SettingsInfoBlock type="Bool" default_value="1" />

クエリビューのログ記録を有効にします。

この設定を有効にした状態で ClickHouse が実行したクエリに関連するビュー（マテリアライズドビューまたはライブビュー）がある場合、それらは [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log) サーバー構成パラメータに記録されます。

例:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \{#low_cardinality_allow_in_native_format\} 

<SettingsInfoBlock type="Bool" default_value="1" />

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型を [Native](/interfaces/formats/Native) フォーマットで使用することを許可または制限します。

`LowCardinality` の使用が制限されている場合、ClickHouse サーバーは `SELECT` クエリに対して `LowCardinality` 列を通常の列に変換し、`INSERT` クエリに対して通常の列を `LowCardinality` 列に変換します。

この設定は主に、`LowCardinality` データ型をサポートしていないサードパーティクライアント向けに必要になります。

設定可能な値:

- 1 — `LowCardinality` の使用は制限されません。
- 0 — `LowCardinality` の使用は制限されます。

## low_cardinality_max_dictionary_size \{#low_cardinality_max_dictionary_size\} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型に対して、ストレージファイルシステムに書き込むことができる共有グローバルディクショナリの、行数の最大サイズを設定します。この設定により、ディクショナリが無制限に増大した場合に RAM に問題が発生することを防ぎます。ディクショナリサイズの上限によりエンコードできないデータは、すべて ClickHouse により通常の方法で書き込まれます。

設定可能な値:

- 任意の正の整数。

## low_cardinality_use_single_dictionary_for_part \{#low_cardinality_use_single_dictionary_for_part\} 

<SettingsInfoBlock type="Bool" default_value="0" />

データパートに対して単一の辞書を使用するかどうかを切り替える設定です。

デフォルトでは、ClickHouse サーバーは辞書のサイズを監視し、ある辞書があふれた場合は次の辞書への書き込みを開始します。複数の辞書を作成できないようにするには、`low_cardinality_use_single_dictionary_for_part = 1` を設定します。

設定可能な値:

- 1 — データパートに対して複数の辞書を作成することを禁止します。
- 0 — データパートに対して複数の辞書を作成することを禁止しません。

## low_priority_query_wait_time_ms \{#low_priority_query_wait_time_ms\} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

クエリの優先順位付けメカニズム（設定 `priority` を参照）が使用されている場合、低優先度のクエリは高優先度のクエリが終了するまで待機します。この設定は、その待機時間を指定します。

## make_distributed_plan \{#make_distributed_plan\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "新しい実験的な設定です。"}]}]}/>

分散クエリプランを作成します。

## materialize_skip_indexes_on_insert \{#materialize_skip_indexes_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時のスキップインデックスのマテリアライズを無効化できる新しい設定を追加"}]}]}/>

INSERT 時にスキップインデックスを構築して保存するかどうかを制御する設定です。無効にした場合、スキップインデックスは [マージ処理中](merge-tree-settings.md/#materialize_skip_indexes_on_merge) か、明示的な [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) によってのみ構築・保存されます。

[exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert) も参照してください。

## materialize_statistics_on_insert \{#materialize_statistics_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "INSERT 時に統計量のマテリアライズを無効化できる新しい設定を追加"}]}]}/>

有効な場合、`INSERT` 実行時に統計量が構築され、同時に保存されます。無効にした場合、統計量はマージ処理中、または明示的に `MATERIALIZE STATISTICS` を実行したときに構築および保存されます。

## materialize_ttl_after_modify \{#materialize_ttl_after_modify\} 

<SettingsInfoBlock type="Bool" default_value="1" />

ALTER MODIFY TTL クエリ実行後に、古いデータへ TTL を適用します。

## materialized_views_ignore_errors \{#materialized_views_ignore_errors\} 

<SettingsInfoBlock type="Bool" default_value="0" />

マテリアライズドビューで発生したエラーを無視し、マテリアライズドビューに関係なく元のブロックをテーブルに挿入できるようにします

## materialized_views_squash_parallel_inserts \{#materialized_views_squash_parallel_inserts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "必要に応じて従来の動作を維持できるようにする設定を追加。"}]}]}/>

単一の INSERT クエリに対して、マテリアライズドビューの宛先テーブルに行われる並列 INSERT を 1 つにまとめ、生成されるパーツ数を削減します。  
false に設定され、かつ `parallel_view_processing` が有効化されている場合、INSERT クエリは宛先テーブルに対して `max_insert_thread` ごとにパーツを生成します。

## max_analyze_depth \{#max_analyze_depth\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

インタープリタが実行する解析の最大回数です。

## max_ast_depth \{#max_ast_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

クエリの構文木における最大ネスト深度。これを超えると例外がスローされます。

:::note
現時点では、パース中ではなく、クエリのパースが完了した後にのみチェックされます。
これは、パース中に深さが大きすぎる構文木が作成される場合でも、
そのクエリは失敗することを意味します。
:::

## max_ast_elements \{#max_ast_elements\} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

クエリの構文木内の要素数の上限です。これを超えた場合は例外がスローされます。

:::note
現時点ではパース中にはチェックされず、クエリのパース完了後にのみチェックされます。
これは、パース中に深すぎる構文木が生成される可能性はありますが、
その場合、そのクエリは失敗することを意味します。
:::

## max_autoincrement_series \{#max_autoincrement_series\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "新しい設定"}]}]}/>

`generateSerialID` 関数によって作成されるシリーズ数の上限値。

各シリーズは Keeper 内のノードを表すため、その数は多くても数百万程度にとどめることを推奨します。

## max_backup_bandwidth \{#max_backup_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サーバー上の特定のバックアップに対する 1 秒あたりの最大読み取り速度（バイト単位）。0 の場合は無制限を意味します。

## max_block_size \{#max_block_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

ClickHouse では、データはブロック単位で処理されます。ブロックとは、列の一部の集合です。単一ブロックに対する内部処理サイクル自体は効率的ですが、各ブロックを処理する際には無視できないコストが発生します。

`max_block_size` 設定は、テーブルからデータを読み込む際に、1 つのブロックに含める推奨最大行数を示します。常に `max_block_size` 行のブロックがテーブルから読み込まれるとは限りません。ClickHouse が、取得すべきデータ量がそれより少ないと判断した場合は、より小さいブロックが処理されます。

ブロックサイズが小さすぎると、各ブロック処理のコストが目立つようになります。一方で、ブロックサイズが大きすぎると、最初のブロック処理後に LIMIT 句付きクエリを高速に実行することが難しくなります。`max_block_size` を設定する際の目標は、多数の列を複数スレッドで抽出する場合でも過度にメモリを消費しないようにしつつ、少なくともある程度のキャッシュの局所性を維持することです。

## max_bytes_before_external_group_by \{#max_bytes_before_external_group_by\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud 環境でのデフォルト値: レプリカごとのメモリ量の半分。

`GROUP BY` 句の実行を外部メモリで行うかどうかを有効または無効にします。
（[外部メモリでの GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory) を参照）

設定可能な値:

- 単一の [GROUP BY](/sql-reference/statements/select/group-by) 処理で使用できる RAM の最大容量（バイト単位）。
- `0` — 外部メモリでの `GROUP BY` を無効にします。

:::note
GROUP BY 処理中のメモリ使用量がこのしきい値（バイト数）を超えた場合、
「external aggregation」モードが有効になり（データがディスクにスピルされます）。

推奨値は、利用可能なシステムメモリの半分です。
:::

## max_bytes_before_external_sort \{#max_bytes_before_external_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud でのデフォルト値: 各レプリカあたりのメモリ量の半分。

`ORDER BY` 句を外部メモリで実行するかどうかを有効化または無効化します。詳細は [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details) を参照してください。
ORDER BY 実行中のメモリ使用量が、この閾値（バイト単位）を超えた場合、「外部ソート」モード（ディスクへのスピル）が有効になります。

設定可能な値:

- 単一の [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作で使用できる RAM の最大容量（バイト単位）。
  推奨値は、利用可能なシステムメモリの半分です。
- `0` — 外部メモリでの `ORDER BY` を無効化。

## max_bytes_before_remerge_sort \{#max_bytes_before_remerge_sort\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

ORDER BY と LIMIT を伴うクエリで、メモリ使用量が指定したしきい値を超えた場合、最終的なマージの前にブロックの追加マージを行い、LIMIT で指定された上位行だけを保持します。

## max_bytes_in_distinct \{#max_bytes_in_distinct\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`DISTINCT` を使用する際に、ハッシュテーブルがメモリ上に保持する状態の最大サイズ（非圧縮バイト数）。

## max_bytes_in_join \{#max_bytes_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

JOIN で使用されるハッシュテーブルの最大サイズをバイト数で指定します。

この設定は [SELECT ... JOIN](/sql-reference/statements/select/join)
操作および [Join テーブルエンジン](/engines/table-engines/special/join) に適用されます。

クエリに JOIN が含まれている場合、ClickHouse は中間結果ごとにこの設定を確認します。

上限に達したときに ClickHouse にさまざまな動作を行わせることができます。
[join_overflow_mode](/operations/settings/settings#join_overflow_mode) 設定を使用して動作を選択します。

設定可能な値は次のとおりです:

- 正の整数。
- 0 — メモリ制御を無効にします。

## max_bytes_in_set \{#max_bytes_in_set\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`IN` 句のサブクエリから作成される `set` によって使用される非圧縮データの最大バイト数。

## max_bytes_ratio_before_external_group_by \{#max_bytes_ratio_before_external_group_by\} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "デフォルトでディスクへの自動スピルを有効化。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

`GROUP BY` に対して許可される利用可能メモリの比率です。この値に達すると、集約に外部メモリが使用されます。

たとえば `0.6` に設定した場合、実行開始時点で `GROUP BY` は利用可能メモリ
(サーバー / ユーザー / マージ用) の 60% まで使用でき、その後は
外部集約の使用を開始します。

## max_bytes_ratio_before_external_sort \{#max_bytes_ratio_before_external_sort\} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Enable automatic spilling to disk by default."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

利用可能なメモリのうち、`ORDER BY` に使用を許可する割合です。この割合に達すると、外部ソート（external sort）が使用されます。

例えば `0.6` に設定した場合、`ORDER BY` は実行開始時点で、利用可能なメモリ（サーバー/ユーザー/マージ処理ごと）の `60%` まで使用でき、それを超えると外部ソートを使い始めます。

`max_bytes_before_external_sort` も引き続き有効である点に注意してください。ディスクへのスピルが行われるのは、ソートブロックのサイズが `max_bytes_before_external_sort` より大きい場合に限られます。

## max_bytes_to_read \{#max_bytes_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリを実行する際に、テーブルから読み取ることができる最大バイト数（非圧縮データ）を指定します。
この制限は処理される各データチャンクごとにチェックされ、最も内側のテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合は、リモートサーバー上でのみチェックされます。

## max_bytes_to_read_leaf \{#max_bytes_to_read_leaf\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行する際に、リーフノード上のローカルテーブルから読み取れる
（非圧縮）データの最大バイト数です。分散クエリは各シャード（リーフ）に対して
複数のサブクエリを発行する場合がありますが、この制限がチェックされるのは
リーフノードでの読み取り段階のみであり、ルートノードでの結果マージ段階では
無視されます。

例えば、クラスタが 2 つのシャードで構成されており、各シャードに 100 バイトの
データを含むテーブルがあるとします。両方のテーブルからすべてのデータを読み取る
分散クエリに `max_bytes_to_read=150` を設定すると、合計 200 バイトになるため失敗します。
一方、`max_bytes_to_read_leaf=150` を指定したクエリは、リーフノードが最大 100 バイトまでしか
読み取らないため成功します。

この制限は、処理されるデータの各チャンクごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合、動作が安定しません。
:::

## max_bytes_to_sort \{#max_bytes_to_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ソートの対象となる最大バイト数です。`ORDER BY` 演算で処理する必要がある非圧縮データのバイト数がこの値を超えた場合の動作は、`sort_overflow_mode` によって決まり、デフォルトでは `throw` に設定されています。

## max_bytes_to_transfer \{#max_bytes_to_transfer\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN セクションの実行時に、リモートサーバーへ転送するか一時テーブルに保存できる非圧縮データの最大バイト数。

## max_columns_to_read \{#max_columns_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1回のクエリでテーブルから読み取ることのできる列数の上限です。
クエリで読み取る必要がある列数が、ここで指定した数を超える場合は、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリを防ぐのに役立ちます。
:::

値が `0` の場合は、無制限を意味します。

## max_compress_block_size \{#max_compress_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

テーブルへの書き込み時に圧縮される前の、非圧縮データブロックの最大サイズです。デフォルトは 1,048,576（1 MiB）です。より小さいブロックサイズを指定すると、一般的には圧縮率がわずかに低下する一方で、キャッシュ局所性の向上により圧縮および解凍の速度がやや向上し、メモリ消費量も削減されます。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないでください。
:::

圧縮用のブロック（バイト列から成るメモリのチャンク）と、クエリ処理用のブロック（テーブルからの行の集合）を混同しないでください。

## max&#95;concurrent&#95;queries&#95;for&#95;all&#95;users

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定値が現在同時に処理されているクエリ数以下になると、例外をスローします。

例: すべてのユーザーに対して `max_concurrent_queries_for_all_users` を 99 に設定し、データベース管理者は自分自身には 100 に設定しておくことで、サーバーが過負荷のときでも調査用のクエリを実行できます。

あるクエリまたはユーザーに対してこの設定を変更しても、他のクエリには影響しません。

設定可能な値:

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

ユーザーごとに同時実行できるクエリ数の上限。

設定可能な値:

* 正の整数
* 0 — 制限なし

**例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \{#max_distributed_connections\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

単一の Distributed テーブルに対する 1 つのクエリを分散処理する際に、リモートサーバーとの同時接続数の上限を指定します。値は、クラスター内のサーバー数以上に設定することを推奨します。

次のパラメータは Distributed テーブルの作成時（およびサーバーの起動時）にのみ使用されるため、実行時に変更する必要はありません。

## max_distributed_depth \{#max_distributed_depth\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

[Distributed](../../engines/table-engines/special/distributed.md) テーブルに対する再帰クエリの最大深さを制限します。

この値を超えた場合、サーバーは例外をスローします。

設定可能な値:

- 正の整数。
- 0 — 深さに制限なし。

## max_download_buffer_size \{#max_download_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

URL エンジンなどでの並列ダウンロードに使用される、スレッドごとのバッファの最大サイズ。

## max_download_threads \{#max_download_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="4" />

データをダウンロードするための最大スレッド数です（例: URL エンジン）。

## max_estimated_execution_time \{#max_estimated_execution_time\} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "max_execution_time と max_estimated_execution_time を分離"}]}]}/>

クエリの実行時間の推定上限（秒単位）。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
の有効期限が切れるたびに、各データブロックごとにチェックされます。

## max_execution_speed \{#max_execution_speed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最大処理行数。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
のタイムアウトが発生するたびに、すべてのデータブロックでチェックされます。実行速度が高すぎる場合、実行速度は抑制されます。

## max_execution_speed_bytes \{#max_execution_speed_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりに実行できる最大バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
のタイムアウトが発生するたびに、すべてのデータブロックでチェックされます。実行速度が高すぎる場合は、実行速度が制限されます。

## max_execution_time \{#max_execution_time\} 

<SettingsInfoBlock type="Seconds" default_value="0" />

クエリの最大実行時間（秒単位）を指定します。

`max_execution_time` パラメータは、やや分かりづらい場合があります。
このパラメータは、現在のクエリ実行速度に基づいて推定した値に対して相対的に動作します
（この挙動は [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) によって制御されます）。

ClickHouse は、推定される実行時間が指定した `max_execution_time` を超える場合に
クエリを中断します。デフォルトでは、`timeout_before_checking_execution_speed`
は 10 秒に設定されています。これは、クエリ実行開始から 10 秒経過後に ClickHouse が
総実行時間の推定を開始することを意味します。例えば、`max_execution_time`
を 3600 秒（1 時間）に設定した場合、推定実行時間がこの 3600 秒の上限を超えると
ClickHouse はクエリを中断します。`timeout_before_checking_execution_speed`
を 0 に設定すると、ClickHouse は `max_execution_time` の基準としてクロック時間を使用します。

クエリの実行時間が指定した秒数を超えた場合の挙動は、
`timeout_overflow_mode` によって決定されます。デフォルト値は `throw` です。

:::note
タイムアウトは、データ処理中の特定の箇所でのみチェックされ、そのタイミングでクエリを停止できます。
現在のところ、集約状態のマージ中やクエリ解析中には停止できず、
実際の実行時間はこの設定値より長くなります。
:::

## max&#95;execution&#95;time&#95;leaf

<SettingsInfoBlock type="Seconds" default_value="0" />

[`max_execution_time`](#max_execution_time) と意味的には類似していますが、分散クエリまたはリモートクエリに対してはリーフノードにのみ適用されます。

たとえば、リーフノードでの実行時間を `10s` に制限しつつ、初期ノードには制限を設けたくない場合、入れ子のサブクエリの設定で `max_execution_time` を指定する代わりに次のようにします:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

クエリ設定としては `max_execution_time_leaf` を使用できます。

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \{#max_expanded_ast_elements\} 

<SettingsInfoBlock type="UInt64" default_value="500000" />

エイリアスやアスタリスクを展開した後の、クエリ構文木に含まれるノード数の上限。

## max_fetch_partition_retries_count \{#max_fetch_partition_retries_count\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

別のホストからパーティションを取得する際の再試行回数。

## max_final_threads \{#max_final_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子付き `SELECT` クエリのデータ読み取りフェーズにおける並列スレッド数の上限を設定します。

指定可能な値:

- 正の整数。
- 0 または 1 — 無効。`SELECT` クエリは単一スレッドで実行されます。

## max_http_get_redirects \{#max_http_get_redirects\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

許可される HTTP GET リダイレクトの最大ホップ数です。悪意のあるサーバーがリクエストを予期しないサービスへリダイレクトすることを防止するための追加のセキュリティ対策です。\n\nたとえば、外部サーバーが別のアドレスにリダイレクトするものの、そのアドレスが会社のインフラストラクチャ内部のものに見える場合が挙げられます。その結果、内部サーバーに HTTP リクエストを送信することで、認証をバイパスして内部ネットワーク上の内部 API を呼び出したり、Redis や Memcached などの他のサービスへ問い合わせたりできてしまう可能性があります。自社に内部インフラストラクチャ（localhost 上で稼働しているものを含む）が存在しない場合、またはサーバーを信頼している場合は、リダイレクトを許可しても安全です。ただし、URL が HTTPS ではなく HTTP を使用している場合は、リモートサーバーだけでなく、ISP やその間に存在するすべてのネットワークも信頼しなければならない点に留意してください。

## max&#95;hyperscan&#95;regexp&#95;length

<SettingsInfoBlock type="UInt64" default_value="0" />

[hyperscan multi-match functions](/sql-reference/functions/string-search-functions#multiMatchAny) 内で使用される各正規表現の最大長さを定義します。

可能な値:

* 正の整数。
* 0 - 長さに制限はありません。

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

各 [hyperscan multi-match 関数](/sql-reference/functions/string-search-functions#multiMatchAny)で使用されるすべての正規表現の合計長の上限を設定します。

設定可能な値:

* 正の整数。
* 0 - 長さを制限しません。

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
例外: 正規表現の合計長が大きすぎます。
```

**関連項目**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \{#max_insert_block_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

テーブルへの挿入時に作成されるブロックのサイズ（行数単位）を指定します。
この設定が適用されるのは、サーバー側でブロックを作成する場合のみです。
例えば、HTTP インターフェイス経由の INSERT では、サーバーがデータフォーマットをパースし、指定したサイズのブロックを作成します。
一方、clickhouse-client を使用する場合、クライアント側でデータをパースするため、サーバー側の `max_insert_block_size` 設定は挿入されるブロックのサイズに影響しません。
また、INSERT SELECT を使用する場合にも、この設定には意味がありません。SELECT 後に形成されたブロックと同じブロックを使ってデータが挿入されるためです。

デフォルト値は `max_block_size` より少し大きくなっています。これは、特定のテーブルエンジン（`*MergeTree`）が、挿入される各ブロックごとにディスク上にデータパートを作成し、これが比較的大きな単位となるためです。同様に、`*MergeTree` テーブルは挿入時にデータをソートし、十分に大きなブロックサイズであれば、より多くのデータを RAM 上でソートできるためです。

## max_insert_delayed_streams_for_parallel_write \{#max_insert_delayed_streams_for_parallel_write\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

最終パートのフラッシュを遅延させるストリーム（カラム）の最大数。デフォルト値は自動（基盤となるストレージが並列書き込みをサポートしている場合は 100、そうでない場合は無効）

## max_insert_threads \{#max_insert_threads\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT SELECT` クエリを実行する際の最大スレッド数。

設定可能な値:

- 0（または 1）— `INSERT SELECT` を並列実行しない。
- 正の整数。1 より大きい値。

Cloud でのデフォルト値:

- メモリ 8 GiB のノードでは `1`
- メモリ 16 GiB のノードでは `2`
- それより大きいノードでは `4`

並列 `INSERT SELECT` が有効になるのは、`SELECT` 部分が並列実行される場合のみです。[`max_threads`](#max_threads) 設定を参照してください。
より大きな値を設定すると、メモリ使用量が増加します。

## max_joined_block_size_bytes \{#max_joined_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "New setting"}]}]}/>

JOIN の結果に対する最大ブロックサイズ（バイト単位）（JOIN アルゴリズムがサポートしている場合）。0 の場合は無制限を意味します。

## max_joined_block_size_rows \{#max_joined_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

JOIN の結果に対する最大ブロックサイズ（JOIN アルゴリズムがサポートしている場合）。0 を指定すると無制限。

## max_limit_for_vector_search_queries \{#max_limit_for_vector_search_queries\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

この設定値を超える `LIMIT` を指定した `SELECT` クエリでは、ベクトル類似性インデックスを使用できません。ベクトル類似性インデックスでのメモリオーバーフローの防止に役立ちます。

## max_local_read_bandwidth \{#max_local_read_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカル読み取りの最大速度（秒あたりのバイト数）。

## max_local_write_bandwidth \{#max_local_write_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ローカルへの書き込み速度の上限（1 秒あたりのバイト数）。

## max_memory_usage \{#max_memory_usage\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Cloud でのデフォルト値は、レプリカの RAM 量に依存します。

1 台のサーバー上でクエリを実行する際に使用できる RAM の最大量を指定します。
`0` の値は無制限を意味します。

この設定は、利用可能なメモリ量やマシン上のメモリ総量は考慮しません。
制限は、1 台のサーバー内での 1 つのクエリに適用されます。

`SHOW PROCESSLIST` を使用して、各クエリの現在のメモリ使用量を確認できます。
各クエリごとにピークメモリ使用量が追跡され、ログに書き込まれます。

`String` および `Array` 引数を持つ次の集約関数の状態に対しては、
メモリ使用量が完全には追跡されません。

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

メモリ使用量は、パラメータ [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
および [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage) によっても制限されます。

## max&#95;memory&#95;usage&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

単一サーバー上で、特定ユーザーのクエリを実行する際に使用できる RAM の最大量です。0 は無制限を意味します。

デフォルトでは、この値には制限がありません（`max_memory_usage_for_user = 0`）。

[`max_memory_usage`](/operations/settings/settings#max_memory_usage) の説明も参照してください。

例えば、`clickhouse_read` という名前のユーザーに対して `max_memory_usage_for_user` を 1000 バイトに設定したい場合、次のステートメントを使用します。

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

クライアントから一度ログアウトして再度ログインし、そのうえで `getSetting` 関数を実行して、正しく動作していることを確認してください。

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \{#max_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でのデータ交換速度を、バイト/秒単位で制限します。この設定はすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — 帯域幅制御を無効にします。

## max_network_bandwidth_for_all_users \{#max_network_bandwidth_for_all_users\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク経由でのデータ転送速度を、1 秒あたりのバイト数で制限します。この設定は、サーバー上で同時に実行されているすべてのクエリに適用されます。

取りうる値:

- 正の整数。
- 0 — データ転送速度の制御を行いません。

## max_network_bandwidth_for_user \{#max_network_bandwidth_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ネットワーク上でのデータ転送速度を、1 秒あたりのバイト数で制限します。この設定は、1 人のユーザーによって同時に実行されているすべてのクエリに適用されます。

設定可能な値:

- 正の整数。
- 0 — データ速度の制御を無効にします。

## max_network_bytes \{#max_network_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリを実行する際に、ネットワーク経由で送受信されるデータ量（バイト数）を制限します。この設定は各クエリに個別に適用されます。

設定可能な値:

- 正の整数
- 0 — データ量の制御を無効にします。

## max_number_of_partitions_for_independent_aggregation \{#max_number_of_partitions_for_independent_aggregation\} 

<SettingsInfoBlock type="UInt64" default_value="128" />

最適化を適用できるテーブル内パーティションの最大数

## max_os_cpu_wait_time_ratio_to_throw \{#max_os_cpu_wait_time_ratio_to_throw\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリを拒否するかどうかを判断するために使用される、OS の CPU 待機時間（`OSCPUWaitMicroseconds` メトリクス）と CPU ビジー時間（`OSCPUVirtualTimeMicroseconds` メトリクス）との最大比率です。最小比率と最大比率の間では線形補間により確率が計算され、最大比率では確率は 1 になります。

## max_parallel_replicas \{#max_parallel_replicas\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "デフォルトで最大 1000 個の並列レプリカを使用します。"}]}]}/>

クエリ実行時に、各シャードで使用されるレプリカの最大数。

設定可能な値:

- 正の整数。

**追加情報**

この設定は、併用する他の設定に応じて異なる結果を生成します。

:::note
この設定は、JOIN やサブクエリが関与していて、すべてのテーブルが特定の要件を満たしていない場合、誤った結果を生成します。詳細については、[Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas) を参照してください。
:::

### `SAMPLE` キーを使用した並列処理

クエリは複数のサーバー上で並列に実行することで、高速に処理できる場合があります。ただし、次のような場合にはクエリのパフォーマンスが低下することがあります。

- サンプリングキーのパーティショニングキー内での位置が、効率的なレンジスキャンを行うのに適していない場合。
- テーブルにサンプリングキーを追加したことで、他の列によるフィルタリングが非効率になる場合。
- サンプリングキーが計算コストの高い式である場合。
- クラスターのレイテンシ分布にロングテールがあり、より多くのサーバーにクエリを送るほどクエリ全体のレイテンシが増加してしまう場合。

### [parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用した並列処理

この設定は、あらゆるレプリケーテッドテーブルで有用です。

## max_parser_backtracks \{#max_parser_backtracks\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "解析の複雑さの制限"}]}]}/>

パーサーがバックトラックを行う最大回数（再帰下降構文解析の過程で、異なる選択肢を試行する回数）。

## max_parser_depth \{#max_parser_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

再帰下降パーサーにおける最大再帰深度を制限します。スタックサイズを制御するために使用します。

可能な値:

- 正の整数。
- 0 — 再帰深度が無制限。

## max_parsing_threads \{#max_parsing_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "ファイルからの並列パース時のスレッド数を制御するための個別設定を追加"}]}]}/>

並列パースをサポートする入力フォーマットでデータをパースする際に使用されるスレッド数の上限です。デフォルトでは自動的に決定されます。

## max_partition_size_to_drop \{#max_partition_size_to_drop\} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時にパーティションを削除する際の制限です。値 `0` は、制限なしでパーティションを削除できることを意味します。

Cloud におけるデフォルト値: 1 TB。

:::note
このクエリ設定は、サーバー設定の同名パラメータを上書きします。詳細は [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop) を参照してください。
:::

## max_partitions_per_insert_block \{#max_partitions_per_insert_block\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "1つのブロック内のパーティション数に上限を追加"}]}]}/>

単一の挿入ブロックに含めることができるパーティション数の最大値を制限し、
ブロックに含まれるパーティション数が多すぎる場合は例外をスローします。

- 正の整数。
- `0` — パーティション数に制限なし。

**詳細**

データを挿入する際、ClickHouseは挿入ブロック内のパーティション数を計算します。
パーティション数が `max_partitions_per_insert_block` を超える場合、
ClickHouseは `throw_on_max_partitions_per_insert_block` の設定に応じて
警告をログに出力するか、例外をスローします。例外メッセージは次のとおりです。

> "1回のINSERTブロックに対するパーティション数が多すぎます（`partitions_count`個のパーティション、上限は " + toString(max_partitions) + " です）。
  この上限は 'max_partitions_per_insert_block' 設定で制御されます。
  非常に多くのパーティションを使用することは、よくある誤解です。これは重大な
  性能低下を招き、サーバー起動の遅延、INSERTクエリの遅延、
  SELECTクエリの遅延などを引き起こします。テーブルあたりの推奨パーティション総数は
  1000〜10000未満です。なお、パーティションはSELECTクエリを高速化することを
  想定した仕組みではありません（範囲クエリを高速化するには ORDER BY キーで十分です）。
  パーティションはデータ操作（DROP PARTITION など）のためのものです。"

:::note
この設定は、安全のためのしきい値です。多数のパーティションを使用することは、よくある誤解だからです。
:::

## max_partitions_to_read \{#max_partitions_to_read\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

1つのクエリでアクセスできるパーティションの最大数を制限します。

テーブル作成時に指定した設定値は、クエリごとの設定で上書きできます。

設定値の範囲:

- 正の整数
- `-1` - 無制限（デフォルト）

:::note
テーブルの設定で、MergeTree の設定項目 [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) を指定することもできます。
:::

## max_parts_to_move \{#max_parts_to_move\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "New setting"}]}]}/>

1 回のクエリで移動できるパーツ数の上限を設定します。0 を指定した場合は無制限です。

## max_projection_rows_to_use_projection_index \{#max_projection_rows_to_use_projection_index\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "新しい設定"}]}]}/>

プロジェクションインデックスから読み込む行数がこのしきい値以下の場合、ClickHouse はクエリの実行時にプロジェクションインデックスを適用しようとします。

## max_query_size \{#max_query_size\} 

<SettingsInfoBlock type="UInt64" default_value="262144" />

SQL パーサーによって解析されるクエリ文字列の最大バイト数です。
INSERT クエリの VALUES 句内のデータは、別のストリームパーサー（RAM を O(1) しか消費しない）によって処理され、この制限の対象にはなりません。

:::note
`max_query_size` は SQL クエリ内（例: `SELECT now() SETTINGS max_query_size=10000`）で設定できません。クエリを解析するために ClickHouse はバッファを割り当てる必要があり、そのバッファサイズは `max_query_size` 設定によって決まります。この設定はクエリの実行前に構成されている必要があります。
:::

## max_read_buffer_size \{#max_read_buffer_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

ファイルシステムから読み取るためのバッファサイズの上限。

## max_read_buffer_size_local_fs \{#max_read_buffer_size_local_fs\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

ローカルファイルシステムからの読み取りに使用されるバッファの最大サイズです。0 に設定した場合は、max_read_buffer_size が使用されます。

## max_read_buffer_size_remote_fs \{#max_read_buffer_size_remote_fs\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

リモートファイルシステムからの読み込みに使用するバッファの最大サイズ。0 に設定した場合は `max_read_buffer_size` が使用されます。

## max_recursive_cte_evaluation_depth \{#max_recursive_cte_evaluation_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "再帰CTEの評価深さの上限"}]}]}/>

再帰CTEの評価深さの上限

## max_remote_read_network_bandwidth \{#max_remote_read_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時にネットワーク経由でデータを交換する際の最大速度（1 秒あたりのバイト数）。

## max_remote_write_network_bandwidth \{#max_remote_write_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

書き込み時におけるネットワーク経由のデータ交換の最大速度（1 秒あたりのバイト数）。

## max_replica_delay_for_distributed_queries \{#max_replica_delay_for_distributed_queries\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

分散クエリで遅延しているレプリカを除外します。詳細は [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

遅延時間を秒単位で指定します。レプリカの遅延が設定値以上の場合、そのレプリカは使用されません。

設定可能な値:

- 正の整数。
- 0 — レプリカの遅延はチェックされません。

ゼロ以外の遅延があるレプリカを一切使用しないようにするには、このパラメータを 1 に設定します。

レプリケートされたテーブルを参照する分散テーブルから `SELECT` を実行する際に使用されます。

## max_result_bytes \{#max_result_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

結果のサイズを、バイト数（非圧縮）で制限します。しきい値に達した場合、クエリはデータブロックの処理を完了した時点で停止しますが、結果の最後のブロックを途中で切り捨てることはないため、結果のサイズがしきい値より大きくなる可能性があります。

**注意事項**

このしきい値では、メモリ上に保持される結果のサイズが考慮されます。
結果サイズが小さい場合でも、メモリ上でより大きなデータ構造を参照している可能性があります。
たとえば、LowCardinality カラムの辞書や、AggregateFunction カラムの Arena などです。
そのため、結果サイズが小さく見えても、しきい値を超えることがあります。

:::warning
この設定はかなり低レベルなものであり、使用には注意が必要です。
:::

## max_result_rows \{#max_result_rows\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クラウドでのデフォルト値: `0`。

結果に含める行数の上限を設定します。サブクエリや、分散クエリの一部を実行するリモートサーバーでもチェックされます。
値が `0` の場合は上限は適用されません。

しきい値に達した場合、クエリはデータブロックの処理後に停止しますが、
結果の最後のブロックを途中で切り捨てることはないため、結果サイズは
しきい値より大きくなる可能性があります。

## max_reverse_dictionary_lookup_cache_size_bytes \{#max_reverse_dictionary_lookup_cache_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "新しい設定。関数 `dictGetKeys` で使用される、クエリごとの逆引き辞書ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュは、同一クエリ内で辞書を再スキャンすることを避けるために、属性値ごとのシリアライズされたキーのタプルを保存します。"}]}]}/>

関数 `dictGetKeys` で使用される、クエリごとの逆引き辞書ルックアップキャッシュの最大サイズ（バイト単位）。このキャッシュは、同一クエリ内で辞書を再スキャンすることを避けるために、属性値ごとのシリアライズされたキーのタプルを保存します。制限に達した場合、エントリは LRU ポリシーで削除されます。0 に設定するとキャッシュは無効化されます。

## max_rows_in_distinct \{#max_rows_in_distinct\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

DISTINCT 使用時に許可される異なる行の最大数。

## max_rows_in_join \{#max_rows_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

テーブルを結合する際に使用されるハッシュテーブル内の行数を制限します。

この設定は、[SELECT ... JOIN](/sql-reference/statements/select/join)
クエリおよび [Join](/engines/table-engines/special/join) テーブルエンジンに適用されます。

クエリに複数の JOIN が含まれている場合、ClickHouse はすべての中間結果に対してこの設定をチェックします。

上限に達した際、ClickHouse は異なる動作を実行できます。
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode) 設定を使用して動作を選択します。

設定可能な値:

- 正の整数。
- `0` — 行数に制限なし。

## max_rows_in_set \{#max_rows_in_set\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

サブクエリから作成される `IN` 句内のデータセットで許可される最大行数。

## max_rows_in_set_to_optimize_join \{#max_rows_in_set_to_optimize_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "順序読み取りの最適化を阻害するため、結合の最適化を無効化"}]}]}/>

結合を実行する前に、互いの行集合に基づいて結合対象テーブルをフィルタリングする際に使用されるセットの最大サイズ。

設定可能な値:

- 0 — 無効。
- 任意の正の整数。

## max_rows_to_group_by \{#max_rows_to_group_by\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

集約で受け取る一意キーの最大数です。この設定により、
集約時のメモリ消費量を制限できます。

GROUP BY による集約で、指定した行数（一意な GROUP BY キーの数）を超えて
行が生成された場合の動作は `group_by_overflow_mode` によって決まり、
デフォルトでは `throw` ですが、近似的な GROUP BY モードに切り替えることもできます。

## max_rows_to_read \{#max_rows_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリ実行時にテーブルから読み取ることができる行数の最大値。
この制限は処理される各データチャンクごとに検証され、最も内側のテーブル式にのみ適用されます。また、リモートサーバーから読み取る場合は、そのリモートサーバー上でのみ検証されます。

## max_rows_to_read_leaf \{#max_rows_to_read_leaf\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリを実行するときに、リーフノード上のローカルテーブルから読み取ることができる最大行数を指定します。分散クエリは各シャード（リーフ）に対して複数のサブクエリを発行できますが、この制限はリーフノードでの読み取り段階でのみチェックされ、ルートノードでの結果のマージ段階では無視されます。

たとえば、2 つのシャードから成るクラスタがあり、それぞれのシャードに 100 行を含むテーブルがあるとします。両方のテーブルからすべてのデータを読み取ることを想定した分散クエリに対して `max_rows_to_read=150` を設定すると、合計で 200 行となるため失敗します。一方で `max_rows_to_read_leaf=150` を設定したクエリは成功します。これは、リーフノードが最大でも 100 行までしか読み取らないためです。

この制限は、処理される各データチャンクごとにチェックされます。

:::note
この設定は `prefer_localhost_replica=1` の場合、動作が安定しません。
:::

## max_rows_to_sort \{#max_rows_to_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ソート対象となる行数の上限を指定します。これにより、ソート時のメモリ消費を制限できます。
ORDER BY 操作で処理する必要がある行数がこの値を超える場合、
挙動は `sort_overflow_mode` によって決まり、デフォルトでは `throw` に設定されています。

## max_rows_to_transfer \{#max_rows_to_transfer\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

GLOBAL IN/JOIN 句の実行時に、リモートサーバーに送信するか一時テーブルに保存できるデータの最大行数。

## max&#95;sessions&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

認証済みユーザーごとに、ClickHouse サーバーに対して確立できる同時セッション数の上限。

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

設定可能な値:

* 正の整数
* `0` - 同時セッション数が無制限になる（デフォルト）


## max_size_to_preallocate_for_aggregation \{#max_size_to_preallocate_for_aggregation\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "大規模テーブル向けの最適化を有効にします。"}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "パフォーマンスを最適化します。"}]}]}/>

集約の前に、すべてのハッシュテーブルで合計何要素分までメモリ領域を事前確保することを許可するかを指定します。

## max_size_to_preallocate_for_joins \{#max_size_to_preallocate_for_joins\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "新しい設定。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "より大きなテーブル向けの最適化を有効にする。"}]}]}/>

結合処理の実行前に、すべてのハッシュテーブルの合計で事前確保を許可する要素数の上限を指定します。

## max_streams_for_merge_tree_reading \{#max_streams_for_merge_tree_reading\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

この設定がゼロ以外の場合、MergeTree テーブルの読み取りストリーム数を制限します。

## max_streams_multiplier_for_merge_tables \{#max_streams_multiplier_for_merge_tables\} 

<SettingsInfoBlock type="Float" default_value="5" />

Merge テーブルから読み取る際に、より多くのストリームをリクエストします。ストリームは、Merge テーブルが参照する各テーブルに分散されます。これにより、スレッド間での処理負荷をより均等に分散でき、特にマージ対象テーブルのサイズが異なる場合に有用です。

## max_streams_to_max_threads_ratio \{#max_streams_to_max_threads_ratio\} 

<SettingsInfoBlock type="Float" default_value="1" />

スレッド数より多くのソースを使用できるようにし、スレッド間で処理をより均等に分散できるようにします。将来的にはソース数をスレッド数と等しくしつつ、各ソースが自ら利用可能な処理を動的に選択できるようにすることが想定されているため、これは暫定的な解決策とみなされています。

## max_subquery_depth \{#max_subquery_depth\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

クエリに指定した数を超える入れ子のサブクエリが含まれている場合、例外をスローします。

:::tip
これにより、クラスタのユーザーによる過度に複雑なクエリの作成を防ぐための健全性チェックを行うことができます。
:::

## max_table_size_to_drop \{#max_table_size_to_drop\} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

クエリ実行時にテーブルを削除する際の制限です。値 `0` は、制限なくすべてのテーブルを削除できることを意味します。

Cloud のデフォルト値: 1 TB。

:::note
このクエリ設定は、対応するサーバー設定を上書きします。詳細は [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop) を参照してください。
:::

## max_temporary_columns \{#max_temporary_columns\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの実行時に、定数カラムを含めて同時に RAM 上に保持される一時カラムの最大数です。クエリの中間計算の結果としてメモリ内に生成される一時カラム数がこの値を超えた場合、例外がスローされます。

:::tip
この設定は、過度に複雑なクエリの実行を防ぐのに役立ちます。
:::

`0` を指定した場合は無制限を意味します。

## max_temporary_data_on_disk_size_for_query \{#max_temporary_data_on_disk_size_for_query\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行中のすべてのクエリについて、ディスク上の一時ファイルが使用できる最大データ量（バイト単位）。

設定可能な値:

- 正の整数
- `0` — 無制限（デフォルト）

## max_temporary_data_on_disk_size_for_user \{#max_temporary_data_on_disk_size_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

同時に実行中のすべてのユーザークエリに対して、ディスク上の一時ファイルが使用できるデータ量の最大値（バイト単位）。

取り得る値:

- 正の整数
- `0` — 無制限（デフォルト）

## max_temporary_non_const_columns \{#max_temporary_non_const_columns\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`max_temporary_columns` と同様に、クエリ実行時に同時に RAM 内に保持しておく必要がある一時カラムの最大数ですが、このとき定数カラムはカウントしません。

:::note
定数カラムはクエリ実行時にかなり頻繁に生成されますが、計算リソースはほとんど必要ありません。
:::

## max_threads \{#max_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

クエリ処理用スレッドの最大数です。リモートサーバーからデータを取得するためのスレッドは含みません（'max_distributed_connections' パラメータを参照）。

このパラメータは、クエリ処理パイプラインの同一ステージを並列に実行するスレッドに適用されます。
たとえばテーブル読み取り時に、関数を使った式の評価、WHERE でのフィルタ処理、および GROUP BY の事前集計を、少なくとも 'max_threads' 個のスレッドで並列に実行できる場合、'max_threads' が使用されます。

LIMIT によって短時間で完了するクエリについては、より小さい 'max_threads' を設定できます。たとえば、必要な件数の行が各ブロックに存在し、max_threads = 8 の場合、1 ブロックだけ読めば十分であっても 8 ブロックが取得されます。

`max_threads` の値が小さいほど、消費されるメモリも少なくなります。

クラウド環境でのデフォルト値: `auto(3)`

## max_threads_for_indexes \{#max_threads_for_indexes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

インデックス処理に使用されるスレッド数の上限。

## max_untracked_memory \{#max_untracked_memory\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

小さなメモリの割り当ておよび解放はスレッドローカル変数にまとめられ、その絶対値の合計が指定された値より大きくなったときにのみ追跡またはプロファイルされます。値が `memory_profiler_step` より大きい場合は、実質的に `memory_profiler_step` まで切り下げられます。

## memory_overcommit_ratio_denominator \{#memory_overcommit_ratio_denominator\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

これは、グローバルレベルでハードリミットに達したときのソフトメモリ上限を表します。
この値は、クエリのオーバーコミット比率を計算するために使用されます。
値が 0 の場合、そのクエリはスキップされます。
[メモリオーバーコミット](memory-overcommit.md)の詳細をご覧ください。

## memory_overcommit_ratio_denominator_for_user \{#memory_overcommit_ratio_denominator_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

これは、ユーザーレベルでハードリミットに達した場合に適用されるソフトメモリ上限を表します。
この値は、クエリに対するメモリのオーバーコミット率を計算するために使用されます。
ゼロを指定すると、そのクエリはスキップされます。
[メモリのオーバーコミット](memory-overcommit.md)の詳細を参照してください。

## memory_profiler_sample_max_allocation_size \{#memory_profiler_sample_max_allocation_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

指定した値以下のサイズのメモリ割り当てを、`memory_profiler_sample_probability` と同じ確率でランダムにサンプリングして収集します。0 は無効を意味します。このしきい値が期待どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_min_allocation_size \{#memory_profiler_sample_min_allocation_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`memory_profiler_sample_probability` と同じ確率で、サイズが指定した値以上のメモリアロケーションをランダムにサンプリングします。0 は無効を意味します。このしきい値が想定どおりに機能するようにするには、`max_untracked_memory` を 0 に設定することを検討してください。

## memory_profiler_sample_probability \{#memory_profiler_sample_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

ランダムに選択されたメモリアロケーションおよび解放を収集し、`trace_type` が `MemorySample` の行として `system.trace_log` に書き込みます。確率は、アロケーションサイズに関係なく、各 alloc/free の操作ごとに適用されます（`memory_profiler_sample_min_allocation_size` および `memory_profiler_sample_max_allocation_size` で変更可能）。サンプリングは、未トラッキングメモリ量が `max_untracked_memory` を超えた場合にのみ行われる点に注意してください。より細かい粒度でサンプリングを行いたい場合は、`max_untracked_memory` を 0 に設定するとよいでしょう。

## memory_profiler_step \{#memory_profiler_step\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

メモリプロファイラのステップ幅を設定します。クエリのメモリ使用量が、バイト単位の次のステップ値を超えるたびに、メモリプロファイラは割り当て元のスタックトレースを収集し、それを [trace_log](/operations/system-tables/trace_log) に書き込みます。

取りうる値:

- バイト数を表す正の整数。

- 0 — メモリプロファイラを無効にします。

## memory_tracker_fault_probability \{#memory_tracker_fault_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

例外安全性のテスト用設定です。メモリ割り当てを行うたびに、指定した確率で例外をスローします。

## memory_usage_overcommit_max_wait_microseconds \{#memory_usage_overcommit_max_wait_microseconds\} 

<SettingsInfoBlock type="UInt64" default_value="5000000" />

ユーザーレベルでメモリオーバーコミットが発生した場合に、スレッドがメモリ解放を待機する最大時間です。
タイムアウトに達してもメモリが解放されない場合は、例外がスローされます。
[メモリオーバーコミット](memory-overcommit.md)の詳細を参照してください。

## merge_table_max_tables_to_look_for_schema_inference \{#merge_table_max_tables_to_look_for_schema_inference\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

明示的なスキーマを指定せずに `Merge` テーブルを作成する場合、または `merge` テーブル関数を使用する場合、スキーマは、指定された最大数以内の一致するテーブルのユニオンとして推論されます。
テーブル数がその上限を超える場合、スキーマは先頭から指定された数のテーブルのみを対象として推論されます。

## merge_tree_coarse_index_granularity \{#merge_tree_coarse_index_granularity\} 

<SettingsInfoBlock type="UInt64" default_value="8" />

データを検索する際、ClickHouse はインデックスファイル内のデータマークを確認します。ClickHouse が必要なキーがある範囲内に存在すると判断した場合、その範囲を `merge_tree_coarse_index_granularity` 個の部分範囲に分割し、その中で必要なキーを再帰的に検索します。

設定可能な値:

- 正の偶数の整数

## merge_tree_compact_parts_min_granules_to_multibuffer_read \{#merge_tree_compact_parts_min_granules_to_multibuffer_read\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

ClickHouse Cloud でのみ効果があります。MergeTree テーブルのコンパクトパート内のストライプに含まれる granule 数がこの値以上の場合に、並列読み取りとプリフェッチをサポートする multibuffer リーダーを使用します。リモートファイルシステムから読み取る場合、multibuffer リーダーを使用すると読み取りリクエスト数が増加します。

## merge_tree_determine_task_size_by_prewhere_columns \{#merge_tree_determine_task_size_by_prewhere_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

読み取りタスクのサイズを決定する際に、PREWHERE 列のサイズのみを基準として使用するかどうかを指定します。

## merge_tree_max_bytes_to_use_cache \{#merge_tree_max_bytes_to_use_cache\} 

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

1 つのクエリで ClickHouse が `merge_tree_max_bytes_to_use_cache` バイトを超えて読み込む場合、非圧縮ブロックのキャッシュは使用されません。

非圧縮ブロックのキャッシュには、クエリのために抽出されたデータが格納されます。ClickHouse はこのキャッシュを使用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、大量のデータを読み込むクエリによってキャッシュが無駄に消費されるのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定によって、非圧縮ブロックキャッシュのサイズを指定します。

可能な値:

- 任意の正の整数。

## merge_tree_max_rows_to_use_cache \{#merge_tree_max_rows_to_use_cache\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ClickHouse が 1 回のクエリで `merge_tree_max_rows_to_use_cache` 行を超えて読み取る場合、非圧縮ブロックのキャッシュは使用されません。

非圧縮ブロックのキャッシュには、クエリ用に抽出されたデータが保存されます。ClickHouse は、このキャッシュを使用して、繰り返し実行される小さなクエリへの応答を高速化します。この設定は、大量のデータを読み取るクエリによってキャッシュが不要に消費されるのを防ぎます。[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) サーバー設定によって、非圧縮ブロックキャッシュのサイズが定義されます。

可能な値:

- 任意の正の整数。

## merge_tree_min_bytes_for_concurrent_read \{#merge_tree_min_bytes_for_concurrent_read\} 

<SettingsInfoBlock type="UInt64" default_value="251658240" />

1 つの [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンテーブルの単一ファイルから読み取るバイト数が `merge_tree_min_bytes_for_concurrent_read` を超える場合、ClickHouse はそのファイルを複数スレッドで並行して読み取ろうとします。

設定可能な値:

- 正の整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み取る際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが読み取りを並列化できるようになる前に、1 つのファイルから読み込む必要がある最小バイト数。この設定の使用は推奨されません。

設定可能な値:

- 正の整数。

## merge_tree_min_bytes_for_seek \{#merge_tree_min_bytes_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の距離が `merge_tree_min_bytes_for_seek` バイト未満の場合、ClickHouse は両方のブロックを含むファイル範囲をシーケンシャルに読み取り、余分なシークを回避します。

設定可能な値:

- 任意の正の整数。

## merge_tree_min_bytes_per_task_for_remote_reading \{#merge_tree_min_bytes_per_task_for_remote_reading\} 

**別名**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "値は `filesystem_prefetch_min_bytes_for_single_read_task` と統一されています"}]}]}/>

各タスクで読み取る最小バイト数。

## merge_tree_min_read_task_size \{#merge_tree_min_read_task_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "新しい設定"}]}]}/>

タスクサイズに対するハードな下限制限です（グラニュール数が少なく利用可能なスレッド数が多い場合でも、これより小さいタスクは割り当てられません）。

## merge_tree_min_rows_for_concurrent_read \{#merge_tree_min_rows_for_concurrent_read\} 

<SettingsInfoBlock type="UInt64" default_value="163840" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルのファイルから読み込む行数が `merge_tree_min_rows_for_concurrent_read` を超える場合、ClickHouse は複数スレッドでこのファイルを並列に読み込もうとします。

取り得る値:

- 正の整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

リモートファイルシステムから読み込む際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンが並列読み込みを行うようになる前に、1 つのファイルから読み込む最小行数を指定します。この設定の使用は推奨しません。

取り得る値:

- 正の整数。

## merge_tree_min_rows_for_seek \{#merge_tree_min_rows_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 つのファイル内で読み取る 2 つのデータブロック間の行数の差が `merge_tree_min_rows_for_seek` 行未満の場合、ClickHouse はファイル内をシークせず、データを連続して読み込みます。

取りうる値:

- 任意の正の整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "`PartsSplitter` のテスト用 — 指定した確率で、MergeTree から読み取るたびに読み取り範囲を互いに交差するものと交差しないものに分割します。"}]}]}/>

`PartsSplitter` のテスト用 — 指定した確率で、MergeTree から読み取るたびに読み取り範囲を互いに交差するものと交差しないものに分割します。

## merge_tree_storage_snapshot_sleep_ms \{#merge_tree_storage_snapshot_sleep_ms\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "クエリ内でのストレージスナップショットの一貫性をデバッグするための新しい設定"}]}]}/>

MergeTree テーブルのストレージスナップショットを作成する際に、擬似的な遅延（ミリ秒）を挿入します。
テストおよびデバッグ目的でのみ使用します。

指定可能な値:

- 0 - 遅延なし（デフォルト）
- N - ミリ秒単位の遅延

## merge_tree_use_const_size_tasks_for_remote_reading \{#merge_tree_use_const_size_tasks_for_remote_reading\} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートテーブルからの読み取りに固定サイズのタスクを使用するかどうかを指定します。

## merge_tree_use_deserialization_prefixes_cache \{#merge_tree_use_deserialization_prefixes_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree における deserialization prefixes キャッシュの使用を制御する新しい設定"}]}]}/>

MergeTree でリモートディスクから読み込む際に、ファイル prefixes から列メタデータをキャッシュできるようにします。

## merge_tree_use_prefixes_deserialization_thread_pool \{#merge_tree_use_prefixes_deserialization_thread_pool\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "MergeTree における接頭辞の並列デシリアライズでスレッドプールの使用を制御する新しい設定"}]}]}/>

MergeTree の Wide パーツにおける接頭辞の並列読み込みに、スレッドプールの利用を有効化します。このスレッドプールのサイズは、サーバー設定 `max_prefixes_deserialization_thread_pool_size` によって制御されます。

## merge_tree_use_v1_object_and_dynamic_serialization \{#merge_tree_use_v1_object_and_dynamic_serialization\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "JSON および Dynamic 型向けのシリアル化バージョン V2 を追加"}]}]}/>

有効にすると、MergeTree では JSON および Dynamic 型に対して V2 ではなく V1 のシリアル化バージョンが使用されます。この設定の変更は、サーバーの再起動後にのみ有効になります。

## metrics_perf_events_enabled \{#metrics_perf_events_enabled\} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、一部の perf イベントがクエリの実行全体を通して計測されます。

## metrics_perf_events_list \{#metrics_perf_events_list\} 

クエリの実行全体を通して計測される perf メトリクスのカンマ区切りリスト。空の場合はすべてのイベントを意味します。利用可能なイベントについてはソースコード内の PerfEventInfo を参照してください。

## min_bytes_to_use_direct_io \{#min_bytes_to_use_direct_io\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ストレージディスクに対して direct I/O アクセスを使用する際に必要となる最小データ量。

ClickHouse はテーブルからデータを読み取る際にこの設定を使用します。読み取るすべてのデータの合計量が `min_bytes_to_use_direct_io` バイトを超える場合、ClickHouse は `O_DIRECT` オプションを使用してストレージディスクからデータを読み取ります。

設定可能な値:

- 0 — direct I/O は無効になります。
- 正の整数。

## min_bytes_to_use_mmap_io \{#min_bytes_to_use_mmap_io\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

これは実験的な設定です。カーネルからユーザー空間へのデータコピーを行わずに大きなファイルを読み取るために必要な最小メモリ容量を設定します。推奨されるしきい値は約 64 MB です。これは [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) が遅いためです。大きなファイルに対してのみ意味があり、データがページキャッシュ内に存在する場合にのみ効果があります。

設定可能な値:

- 正の整数。
- 0 — 大きなファイルは、カーネルからユーザー空間へのデータコピーのみで読み取られます。

## min_chunk_bytes_for_parallel_parsing \{#min_chunk_bytes_for_parallel_parsing\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- Type: unsigned int
- Default value: 1 MiB

各スレッドが並列に解析する際の、バイト単位で指定する最小チャンクサイズ。

## min_compress_block_size \{#min_compress_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブル用の設定です。クエリ処理時のレイテンシを削減するため、次のマークを書き出すタイミングで、そのサイズが `min_compress_block_size` 以上であればブロックが圧縮されます。デフォルトは 65,536 です。

非圧縮データが `max_compress_block_size` より小さい場合、ブロックの実際のサイズはこの値以上であり、かつ 1 つのマークに対応するデータ量以上になります。

例を見てみましょう。テーブル作成時に `index_granularity` を 8192 に設定したとします。

UInt32 型のカラム（1 値あたり 4 バイト）を書き込む場合を考えます。8192 行を書き込むと、合計で 32 KB のデータになります。`min_compress_block_size = 65,536` であるため、2 つのマークごとに 1 つの圧縮ブロックが形成されます。

次に、String 型の URL カラム（1 値あたり平均 60 バイト）を書き込む場合を考えます。8192 行を書き込むと、平均で 500 KB より少し小さいデータ量になります。これは 65,536 より大きいため、各マークごとに 1 つの圧縮ブロックが形成されます。この場合、1 つのマークの範囲でディスクからデータを読み込む際に、余分なデータが伸長されることはありません。

:::note
これはエキスパート向けの設定であり、ClickHouse を使い始めたばかりの場合は変更しないことを推奨します。
:::

## min_count_to_compile_aggregate_expression \{#min_count_to_compile_aggregate_expression\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同一の集約式に対して JIT コンパイルを開始するために必要な最小個数を指定します。[compile_aggregate_expressions](#compile_aggregate_expressions) 設定が有効な場合にのみ機能します。

有効な値:

- 正の整数。
- 0 — 同一の集約式は常に JIT コンパイルされます。

## min_count_to_compile_expression \{#min_count_to_compile_expression\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同じ式がコンパイルされる前に必要となる最小の実行回数。

## min_count_to_compile_sort_description \{#min_count_to_compile_sort_description\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

同一のソート記述が JIT コンパイルされるまでに必要な出現回数

## min_execution_speed \{#min_execution_speed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最小実行速度（行/秒）。[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
のタイムアウトが発生したタイミングで、各データブロックごとにチェックされます。実行速度がこの値を下回る場合、例外がスローされます。

## min_execution_speed_bytes \{#min_execution_speed_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりの最小実行バイト数です。
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
が満了するたびに、各データブロックごとにチェックされます。実行速度がこの値を下回る場合、例外がスローされます。

## min_external_table_block_size_bytes \{#min_external_table_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを結合して、指定されたバイト数のサイズに揃えます。"}]}]}/>

ブロックが十分な大きさでない場合、外部テーブルに渡されるブロックを結合して、指定されたバイト数のサイズに揃えます。

## min_external_table_block_size_rows \{#min_external_table_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "外部テーブルに渡されるブロックが十分に大きくない場合、所定の行数になるようにまとめる"}]}]}/>

外部テーブルに渡されるブロックが十分に大きくない場合、所定の行数になるようにまとめます。

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "一時的な書き込みを許可しつつ、挿入では消費されない空きディスク容量（バイト数）を維持します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

挿入を実行する際に必要となる最小の空きディスク容量（バイト数）。

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "挿入時に消費されず、一時的な書き込みを行うために確保しておくディスク空き容量を、総ディスク容量に対する比率として維持します。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

挿入を実行するために必要な最小ディスク空き容量の比率を指定します。

## min_free_disk_space_for_temporary_data \{#min_free_disk_space_for_temporary_data\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

外部ソートおよび集約で使用される一時データを書き込む際に、確保しておく最小限のディスク空き容量です。

## min_hit_rate_to_use_consecutive_keys_optimization \{#min_hit_rate_to_use_consecutive_keys_optimization\} 

<SettingsInfoBlock type="Float" default_value="0.5" />

集約における連続キー最適化に利用されるキャッシュの最小ヒット率。この値を下回ると、その最適化は無効化されます。

## min_insert_block_size_bytes \{#min_insert_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

`INSERT` クエリでテーブルに挿入できるブロックの最小バイト数を設定します。これより小さいサイズのブロックは、より大きなブロックにまとめられます。

設定可能な値:

- 正の整数。
- 0 — ブロックのまとめを無効にします。

## min_insert_block_size_bytes_for_materialized_views \{#min_insert_block_size_bytes_for_materialized_views\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリによってテーブルに挿入できるブロックの最小サイズ（バイト数）を設定します。より小さいサイズのブロックは、より大きなブロックにまとめられます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、マテリアライズドビューへの書き込み時のブロックのまとめ方を制御し、過剰なメモリ使用を回避できます。

設定可能な値:

- 任意の正の整数。
- 0 — まとめ処理を無効化。

**こちらも参照**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \{#min_insert_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

`INSERT` クエリでテーブルに挿入できるブロック内の最小行数を設定します。これより小さいブロックは、より大きなブロックに統合されます。

設定可能な値:

- 正の整数。
- 0 — 統合処理を無効にする。

## min_insert_block_size_rows_for_materialized_views \{#min_insert_block_size_rows_for_materialized_views\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`INSERT` クエリでテーブルに挿入できるブロック内の最小行数を設定します。これより小さいサイズのブロックは、より大きなブロックにまとめられます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md) に挿入されるブロックに対してのみ適用されます。この設定を調整することで、マテリアライズドビューへの書き込み時のブロックのまとめ方を制御し、不要なメモリ使用を回避できます。

Possible values:

- 任意の正の整数。
- 0 — まとめ処理を無効化。

**See Also**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \{#min_joined_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "New setting."}]}]}/>

JOIN の入力および出力ブロック（結合アルゴリズムがサポートしている場合）の最小ブロックサイズ（バイト単位）。小さなブロックは統合されます。0 は無制限を意味します。

## min_joined_block_size_rows \{#min_joined_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "新しい設定。"}]}]}/>

JOIN の入力ブロックおよび出力ブロックに対する、行数単位での最小ブロックサイズ（JOIN アルゴリズムがサポートしている場合）。小さいブロックはまとめられます。0 を指定すると無制限になります。

## min_os_cpu_wait_time_ratio_to_throw \{#min_os_cpu_wait_time_ratio_to_throw\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "設定値が変更され、25.4 にバックポートされました"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

クエリを拒否するかどうかを判断する際に用いられる、OS の CPU 待機時間（OSCPUWaitMicroseconds メトリクス）とビジー時間（OSCPUVirtualTimeMicroseconds メトリクス）の比率の下限値です。確率は最小比率と最大比率の間を線形補間して計算され、この値では確率は 0 になります。

## min_outstreams_per_resize_after_split \{#min_outstreams_per_resize_after_split\} 

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "新しい設定。"}]}]}/>

パイプライン生成中に分割が行われた後の `Resize` または `StrictResize` プロセッサの出力ストリーム数の最小値を指定します。結果として得られるストリーム数がこの値より小さい場合、分割処理は実行されません。

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

## min_table_rows_to_use_projection_index \{#min_table_rows_to_use_projection_index\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

テーブルから読み取る行数の推定値がこのしきい値以上の場合、ClickHouse はクエリ実行時にプロジェクションインデックスの利用を試みます。

## mongodb_throw_on_unsupported_query \{#mongodb_throw_on_unsupported_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting."}]}]}/>

有効にすると、MongoDB テーブルは MongoDB クエリを構築できない場合にエラーを返します。無効にすると、ClickHouse はテーブル全体を読み取り、ローカルで処理します。このオプションは `allow_experimental_analyzer=0` の場合には適用されません。

## move_all_conditions_to_prewhere \{#move_all_conditions_to_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

WHERE 句から PREWHERE 句へ、適用可能なすべての条件を移動します

## move_primary_key_columns_to_end_of_prewhere \{#move_primary_key_columns_to_end_of_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

主キー列を含む `PREWHERE` 条件を、`AND` 連鎖の末尾に移動します。これらの条件は主キー解析の際に既に考慮されている可能性が高く、そのため `PREWHERE` フィルタリングへの追加的な効果は大きくありません。

## multiple_joins_try_to_keep_original_names \{#multiple_joins_try_to_keep_original_names\} 

<SettingsInfoBlock type="Bool" default_value="0" />

複数の JOIN を書き換える際に、トップレベルの式リストにエイリアスを追加しない

## mutations_execute_nondeterministic_on_initiator \{#mutations_execute_nondeterministic_on_initiator\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、非決定的な定数関数（例: 関数 `now()`）はイニシエーター側で実行され、`UPDATE` および `DELETE` クエリ内でリテラルに置き換えられます。これにより、非決定的な定数関数を用いたミューテーションを実行する際に、レプリカ間でデータを同期した状態に保つのに役立ちます。デフォルト値: `false`。

## mutations_execute_subqueries_on_initiator \{#mutations_execute_subqueries_on_initiator\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、`UPDATE` および `DELETE` クエリ内のスカラー副問い合わせはイニシエーター側で実行され、リテラルに置き換えられます。既定値: `false`。

## mutations_max_literal_size_to_replace \{#mutations_max_literal_size_to_replace\} 

<SettingsInfoBlock type="UInt64" default_value="16384" />

`UPDATE` および `DELETE` クエリで置換されるシリアル化されたリテラルの最大サイズ（バイト単位）。上記 2 つのいずれかの設定が有効になっている場合にのみ有効です。デフォルト値：16384（16 KiB）。

## mutations_sync \{#mutations_sync\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` クエリ（[mutations](../../sql-reference/statements/alter/index.md/#mutations)）を同期的に実行するかどうかを制御します。

Possible values:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | mutation を非同期で実行します。                                                                                                                       |
| `1`   | クエリは、現在のサーバー上で mutation がすべて完了するまで待機します。                                                                                |
| `2`   | クエリは、すべてのレプリカ（存在する場合）で mutation が完了するまで待機します。                                                                      |
| `3`   | クエリはアクティブなレプリカのみを待機します。`SharedMergeTree` の場合にのみサポートされます。`ReplicatedMergeTree` に対しては `mutations_sync = 2` と同じ動作になります。|

## mysql_datatypes_support_level \{#mysql_datatypes_support_level\} 

MySQL 型が対応する ClickHouse 型にどのように変換されるかを定義します。`decimal`、`datetime64`、`date2Date32`、`date2String` をカンマ区切りで任意の組み合わせとして指定します。

- `decimal`: 精度が許す場合、`NUMERIC` および `DECIMAL` 型を `Decimal` に変換します。
- `datetime64`: 精度が `0` でない場合、`DATETIME` および `TIMESTAMP` 型を `DateTime` ではなく `DateTime64` に変換します。
- `date2Date32`: `DATE` を `Date` ではなく `Date32` に変換します。`date2String` よりも優先されます。
- `date2String`: `DATE` を `Date` ではなく `String` に変換します。`datetime64` によって無効化されます。

## mysql_map_fixed_string_to_text_in_show_columns \{#mysql_map_fixed_string_to_text_in_show_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse を BI ツールに接続する際の設定作業を軽減します。"}]}]}/>

有効にすると、ClickHouse の [FixedString](../../sql-reference/data-types/fixedstring.md) データ型が、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) では `TEXT` として表示されます。

MySQL のワイヤプロトコル経由で接続されている場合にのみ効果があります。

- 0 - `BLOB` を使用。
- 1 - `TEXT` を使用。

## mysql_map_string_to_text_in_show_columns \{#mysql_map_string_to_text_in_show_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "ClickHouse を BI ツールに接続する際の設定作業を削減します。"}]}]}/>

有効にすると、ClickHouse の [String](../../sql-reference/data-types/string.md) データ型は、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) で `TEXT` として表示されます。

MySQL ワイヤープロトコル経由で接続されている場合にのみ効果があります。

- 0 - `BLOB` を使用。
- 1 - `TEXT` を使用。

## mysql_max_rows_to_insert \{#mysql_max_rows_to_insert\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

MySQL ストレージエンジンによるバッチ挿入時の最大行数

## network_compression_method \{#network_compression_method\} 

<SettingsInfoBlock type="String" default_value="LZ4" />

クライアント/サーバー間およびサーバー間通信を圧縮するためのコーデックです。

指定可能な値:

- `NONE` — 圧縮しません。
- `LZ4` — LZ4 コーデックを使用します。
- `LZ4HC` — LZ4HC コーデックを使用します。
- `ZSTD` — ZSTD コーデックを使用します。

**関連項目**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \{#network_zstd_compression_level\} 

<SettingsInfoBlock type="Int64" default_value="1" />

ZSTD 圧縮のレベルを調整します。[network_compression_method](#network_compression_method) が `ZSTD` に設定されている場合にのみ使用されます。

指定可能な値:

- 1 から 15 までの正の整数。

## normalize_function_names \{#normalize_function_names\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "関数名を正準名に正規化します。これはプロジェクションクエリのルーティングに必要でした"}]}]}/>

関数名を正準名に正規化します

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ミューテーション対象のテーブルに未完了のミューテーションがこの値以上ある場合、そのテーブルに対するミューテーション処理を意図的に遅延させます。0 の場合は無効です。

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

ミューテーション対象のテーブルに未完了のミューテーションがこの値以上存在する場合、「Too many mutations ...」という例外をスローします。0 の場合は無効です。

## odbc_bridge_connection_pool_size \{#odbc_bridge_connection_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

ODBC ブリッジで、各接続設定文字列ごとに使用する接続プールのサイズ。

## odbc_bridge_use_connection_pooling \{#odbc_bridge_use_connection_pooling\} 

<SettingsInfoBlock type="Bool" default_value="1" />

ODBC ブリッジでコネクションプーリングを使用します。`false` に設定すると、毎回新しい接続が確立されます。

## offset

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリの結果を返し始める前にスキップする行数を設定します。[OFFSET](/sql-reference/statements/select/offset) 句で設定されたオフセットを調整し、2つの値が合算されるようにします。

設定可能な値:

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


## opentelemetry_start_trace_probability \{#opentelemetry_start_trace_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

親の [trace context](https://www.w3.org/TR/trace-context/) が提供されていない場合に、ClickHouse が実行するクエリに対してトレースを開始できる確率を設定します。

取りうる値:

- 0 — 親の trace context が提供されていない場合、実行されるすべてのクエリに対するトレースを無効にします。
- [0..1] の範囲の正の浮動小数点数。たとえば、設定値が `0,5` の場合、ClickHouse は平均してクエリの半分に対してトレースを開始できます。
- 1 — 実行されるすべてのクエリに対するトレースを有効にします。

## opentelemetry_trace_cpu_scheduling \{#opentelemetry_trace_cpu_scheduling\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "`cpu_slot_preemption` 機能をトレースするための新しい設定です。"}]}]}/>

ワークロードのプリエンプティブ CPU スケジューリングに関する OpenTelemetry スパンを収集します。

## opentelemetry_trace_processors \{#opentelemetry_trace_processors\} 

<SettingsInfoBlock type="Bool" default_value="0" />

プロセッサ向けの OpenTelemetry スパンを収集します。

## optimize_aggregation_in_order \{#optimize_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルにおいて、対応する順序でデータを集約する [SELECT](../../sql-reference/statements/select/index.md) クエリに対する [GROUP BY](/sql-reference/statements/select/group-by) の最適化を有効にします。

設定可能な値:

- 0 — `GROUP BY` の最適化を無効にします。
- 1 — `GROUP BY` の最適化を有効にします。

**関連項目**

- [GROUP BY の最適化](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys \{#optimize_aggregators_of_group_by_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

SELECT 句において、GROUP BY キーに対する min/max/any/anyLast 集約関数を削除します。

## optimize_and_compare_chain \{#optimize_and_compare_chain\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

AND チェーン内の定数を含む比較条件を補完して、フィルタリング性能を向上させます。演算子 `<`, `<=`, `>`, `>=`, `=` およびそれらを組み合わせた条件をサポートします。たとえば、`(a < b) AND (b < c) AND (c < 5)` は `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)` になります。

## optimize_append_index \{#optimize_append_index\} 

<SettingsInfoBlock type="Bool" default_value="0" />

インデックス条件を付加するために[制約](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルトは `false` です。

設定可能な値:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \{#optimize_arithmetic_operations_in_aggregate_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

算術演算を集約関数の外で実行する

## optimize_const_name_size \{#optimize_const_name_size\} 

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "大きな定数をスカラーに置き換え、名前としてハッシュを使用する（サイズは名前の長さによって推定）"}]}]}/>

大きな定数をスカラー値に置き換え、その名前としてハッシュを使用します（サイズは名前の長さで見積もられます）。

使用可能な値:

- 正の整数 — 名前の最大長。
- 0 — 常に置き換える。
- 負の整数 — 置き換えを行わない。

## optimize_count_from_files \{#optimize_count_from_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

さまざまな入力フォーマットのファイルに対する行数カウント処理の最適化を有効または無効にします。この設定は、テーブル関数/エンジン `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` に適用されます。

設定可能な値:

- 0 — 最適化を無効にします。
- 1 — 最適化を有効にします。

## optimize_distinct_in_order \{#optimize_distinct_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`DISTINCT` 句で指定した列の一部がソートの先頭部分を構成している場合に、`DISTINCT` の最適化を有効にします。例えば、MergeTree におけるソートキーの先頭部分や、ORDER BY 句で指定した並び替えキーの先頭部分などです。

## optimize_distributed_group_by_sharding_key \{#optimize_distributed_group_by_sharding_key\} 

<SettingsInfoBlock type="Bool" default_value="1" />

イニシエータサーバー上での高コストな集約処理を回避することで、`GROUP BY sharding_key` クエリを最適化します（これにより、イニシエータサーバー上でのクエリのメモリ使用量が削減されます）。

次の種類のクエリがサポートされます（およびそれらのあらゆる組み合わせ）:

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

設定可能な値:

- 0 — 無効
- 1 — 有効

関連項目:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
現時点では `optimize_skip_unused_shards` が必須です。これは、将来的にこの設定がデフォルトで有効になる可能性があり、その場合でも正しく動作するのは、データが Distributed テーブル経由で挿入され、つまり sharding_key に従って分散されている場合に限られるためです。
:::

## optimize_empty_string_comparisons \{#optimize_empty_string_comparisons\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "新しい設定です。"}]}]}/>

`col = ''` や `'' = col` のような式を `empty(col)` に、`col != ''` や `'' != col` を `notEmpty(col)` に変換します。
この変換が行われるのは、`col` が `String` 型または `FixedString` 型の場合にのみです。

## optimize_extract_common_expressions \{#optimize_extract_common_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "WHERE、PREWHERE、ON、HAVING、QUALIFY 句において、論理和 (OR) の中の論理積 (AND) から共通部分式を抽出して最適化します。"}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "WHERE、PREWHERE、ON、HAVING、QUALIFY 句において、論理和 (OR) の中の論理積 (AND) から共通部分式を抽出して最適化する設定を導入します。"}]}]}/>

WHERE、PREWHERE、ON、HAVING、QUALIFY 句において、論理和 (OR) から共通部分式を抽出できるようにします。`(A AND B) OR (A AND C)` のような論理式は `A AND (B OR C)` に書き換えることができ、次のような最適化に役立つ可能性があります。

- 単純なフィルタリング式でのインデックスの利用
- CROSS JOIN から INNER JOIN への最適化

## optimize_functions_to_subcolumns \{#optimize_functions_to_subcolumns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Enabled settings by default"}]}]}/>

一部の関数をサブカラムの読み取りに変換して行う最適化を有効または無効にします。これにより、読み取るデータ量を削減できます。

次の関数が変換されます:

- [length](/sql-reference/functions/array-functions#length) — [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み込みます。
- [empty](/sql-reference/functions/array-functions#empty) — [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み込みます。
- [notEmpty](/sql-reference/functions/array-functions#notEmpty) — [size0](../../sql-reference/data-types/array.md/#array-size) サブカラムを読み込みます。
- [isNull](/sql-reference/functions/functions-for-nulls#isNull) — [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み込みます。
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) — [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み込みます。
- [count](/sql-reference/aggregate-functions/reference/count) — [null](../../sql-reference/data-types/nullable.md/#finding-null) サブカラムを読み込みます。
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapkeys) — [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムを読み込みます。
- [mapValues](/sql-reference/functions/tuple-map-functions#mapvalues) — [values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムを読み込みます。

設定可能な値:

- 0 — 最適化を無効にします。
- 1 — 最適化を有効にします。

## optimize_group_by_constant_keys \{#optimize_group_by_constant_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "デフォルトで定数キーのみの GROUP BY を最適化"}]}]}/>

ブロック内のすべてのキーが定数である場合に、GROUP BY を最適化します。

## optimize_group_by_function_keys \{#optimize_group_by_function_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

GROUP BY 句内で、他のキーに対する関数を除去します。

## optimize_if_chain_to_multiif \{#optimize_if_chain_to_multiif\} 

<SettingsInfoBlock type="Bool" default_value="0" />

if(cond1, then1, if(cond2, ...)) という形式のチェーンを multiIf に置き換えます。現時点では数値型に対してはメリットがありません。

## optimize_if_transform_strings_to_enum \{#optimize_if_transform_strings_to_enum\} 

<SettingsInfoBlock type="Bool" default_value="0" />

If および transform 関数内の文字列型引数を Enum 型に置き換えます。分散クエリにおいて一貫性のない変更を引き起こし、クエリの失敗につながる可能性があるため、デフォルトでは無効になっています。

## optimize_injective_functions_in_group_by \{#optimize_injective_functions_in_group_by\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "アナライザーの GROUP BY 句では、単射関数をその引数に置き換えます"}]}]}/>

GROUP BY 句では単射関数をその引数に置き換えます

## optimize_injective_functions_inside_uniq \{#optimize_injective_functions_inside_uniq\} 

<SettingsInfoBlock type="Bool" default_value="1" />

uniq*() 関数内の 1 引数の単射関数を削除します。

## optimize_min_equality_disjunction_chain_length \{#optimize_min_equality_disjunction_chain_length\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

`expr = x1 OR ... expr = xN` のような式を最適化する際の最小長

## optimize_min_inequality_conjunction_chain_length \{#optimize_min_inequality_conjunction_chain_length\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

式 `expr <> x1 AND ... expr <> xN` に対して最適化を行うために必要な、条件連結の最小数。

## optimize_move_to_prewhere \{#optimize_move_to_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

[SELECT](../../sql-reference/statements/select/index.md) クエリにおける自動 [PREWHERE](../../sql-reference/statements/select/prewhere.md) 最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみ動作します。

設定可能な値:

- 0 — 自動 `PREWHERE` 最適化を無効にします。
- 1 — 自動 `PREWHERE` 最適化を有効にします。

## optimize_move_to_prewhere_if_final \{#optimize_move_to_prewhere_if_final\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子を含む [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、[PREWHERE](../../sql-reference/statements/select/prewhere.md) の自動最適化を有効または無効にします。

[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルでのみサポートされます。

設定可能な値:

- 0 — `FINAL` 修飾子付き `SELECT` クエリでの `PREWHERE` の自動最適化を無効にします。
- 1 — `FINAL` 修飾子付き `SELECT` クエリでの `PREWHERE` の自動最適化を有効にします。

**関連項目**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 設定

## optimize_multiif_to_if \{#optimize_multiif_to_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

条件が1つしかない `multiIf` を `if` に置き換えます。

## optimize_normalize_count_variants \{#optimize_normalize_count_variants\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "意味的に count() と等価な集計関数を、デフォルトで count() に書き換えます"}]}]}/>

意味的に count() と等価な集計関数を、count() に書き換えます。

## optimize&#95;on&#95;insert

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで INSERT 時のデータ最適化を有効化し、ユーザーエクスペリエンスを向上させる"}]}]} />

挿入前に、テーブルエンジンに従って、このブロックに対してマージが実行されたかのようなデータ変換を有効化または無効化します。

可能な値:

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

この設定は [マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) の動作に影響することに注意してください。


## optimize_or_like_chain \{#optimize_or_like_chain\} 

<SettingsInfoBlock type="Bool" default_value="0" />

複数の OR LIKE を multiMatchAny に最適化します。この最適化は、一部のケースではインデックスの解析を損なうため、デフォルトで有効化すべきではありません。

## optimize_qbit_distance_function_reads \{#optimize_qbit_distance_function_reads\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

`QBit` データ型に対する距離関数を、計算に必要な列だけをストレージから読み取る等価な関数に置き換えるようにします。

## optimize_read_in_order \{#optimize_read_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルからデータを読み取る際の [SELECT](../../sql-reference/statements/select/index.md) クエリにおいて、[ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) の最適化を有効にします。

設定可能な値:

- 0 — `ORDER BY` の最適化を無効にします。
- 1 — `ORDER BY` の最適化を有効にします。

**関連項目**

- [ORDER BY 句](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order \{#optimize_read_in_window_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree テーブルでデータを対応する順序で読み取れるように、WINDOW 句における ORDER BY の最適化を有効にします。

## optimize_redundant_functions_in_order_by \{#optimize_redundant_functions_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="1" />

引数も ORDER BY に含まれている場合、ORDER BY からその関数呼び出しを削除します

## optimize_respect_aliases \{#optimize_respect_aliases\} 

<SettingsInfoBlock type="Bool" default_value="1" />

true に設定すると、WHERE/GROUP BY/ORDER BY においてエイリアスが考慮されます。これにより、パーティションプルーニング、セカンダリインデックス、optimize_aggregation_in_order、optimize_read_in_order、optimize_trivial_count の最適化に役立ちます。

## optimize_rewrite_aggregate_function_with_if \{#optimize_rewrite_aggregate_function_with_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

論理的に等価である場合、`if` 式を引数に取る集約関数を別の形に書き換えます。
例えば、`avg(if(cond, col, null))` は `avgOrNullIf(cond, col)` に書き換えることができます。これによりパフォーマンスが向上する可能性があります。

:::note
アナライザ (`enable_analyzer = 1`) 使用時のみ有効です。
:::

## optimize_rewrite_array_exists_to_has \{#optimize_rewrite_array_exists_to_has\} 

<SettingsInfoBlock type="Bool" default_value="0" />

論理的に等価な場合、arrayExists() 関数を has() 関数に書き換えます。たとえば、arrayExists(x -> x = 1, arr) は has(arr, 1) に書き換えられます。

## optimize_rewrite_like_perfect_affix \{#optimize_rewrite_like_perfect_affix\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

厳密な接頭辞または接尾辞パターンを持つ LIKE 式（例: `col LIKE 'ClickHouse%'`）を、`startsWith` や `endsWith` 関数（例: `startsWith(col, 'ClickHouse')`）の呼び出しに書き換えます。

## optimize_rewrite_regexp_functions \{#optimize_rewrite_regexp_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定"}]}]}/>

正規表現に関連する関数を、より単純で効率的な形式に書き換えます

## optimize_rewrite_sum_if_to_count_if \{#optimize_rewrite_sum_if_to_count_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "アナライザ使用時にのみ利用可能であり、その場合に正しく動作します"}]}]}/>

論理的に等価な場合、sumIf() および sum(if()) 関数を countIf() 関数に書き換えます。

## optimize_skip_merged_partitions \{#optimize_skip_merged_partitions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

[OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md) クエリに対して、レベル > 0 のパーツが 1 つだけ存在し、そのパーツに有効期限切れの TTL が設定されていない場合に、最適化を有効にするかどうかを制御します。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

デフォルトでは、`OPTIMIZE TABLE ... FINAL` クエリは、パーツが 1 つしかない場合でもそのパーツを書き換えます。

設定値:

- 1 - 最適化を有効にする。
- 0 - 最適化を無効にする。

## optimize_skip_unused_shards \{#optimize_skip_unused_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`WHERE/PREWHERE` 句にシャーディングキー条件を含む [SELECT](../../sql-reference/statements/select/index.md) クエリに対して、未使用シャードをスキップするかどうかを制御します（データがシャーディングキーで分散されていることが前提です。そうでない場合、クエリ結果は不正確になります）。

設定値:

- 0 — 無効。
- 1 — 有効。

## optimize_skip_unused_shards_limit \{#optimize_skip_unused_shards_limit\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

シャーディングキーの値の個数に対する上限値。この上限に達すると、`optimize_skip_unused_shards` は無効になります。

値が多すぎる場合、処理にかなりのコストがかかる可能性がありますが、その効果は疑わしくなります。`IN (...)` に非常に多くの値が含まれている場合、結局のところクエリはすべてのシャードに送信される可能性が高いためです。

## optimize_skip_unused_shards_nesting \{#optimize_skip_unused_shards_nesting\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

分散クエリのネストレベル（`Distributed` テーブルが別の `Distributed` テーブルを参照するケース）に応じて、[`optimize_skip_unused_shards`](#optimize_skip_unused_shards) の動作を制御します（そのため、事前に [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) が有効になっている必要があります）。

設定可能な値:

- 0 — 無効。`optimize_skip_unused_shards` は常に適用されます。
- 1 — 第 1 レベルに対してのみ `optimize_skip_unused_shards` を有効にします。
- 2 — 第 2 レベルまで `optimize_skip_unused_shards` を有効にします。

## optimize_skip_unused_shards_rewrite_in \{#optimize_skip_unused_shards_rewrite_in\} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートシャードに対するクエリ中の IN を書き換え、そのシャードに属さない値を除外します（`optimize_skip_unused_shards` が必要です）。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## optimize_sorting_by_input_stream_properties \{#optimize_sorting_by_input_stream_properties\} 

<SettingsInfoBlock type="Bool" default_value="1" />

入力ストリームのソート特性に基づいてソートを最適化します

## optimize_substitute_columns \{#optimize_substitute_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

列の代替に [constraints](../../sql-reference/statements/create/table.md/#constraints) を使用します。デフォルト値は `false` です。

設定可能な値:

- true, false

## optimize&#95;syntax&#95;fuse&#95;functions

<SettingsInfoBlock type="Bool" default_value="0" />

同一の引数を持つ集約関数を 1 つの関数に統合できるように有効化します。クエリ内に、同一の引数を持つ [sum](/sql-reference/aggregate-functions/reference/sum)、[count](/sql-reference/aggregate-functions/reference/count)、または [avg](/sql-reference/aggregate-functions/reference/avg) が少なくとも 2 つ含まれている場合、それらを [sumCount](/sql-reference/aggregate-functions/reference/sumcount) に書き換えます。

設定可能な値:

* 0 — 同一の引数を持つ関数は統合されません。
* 1 — 同一の引数を持つ関数が統合されます。

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

設定可能な値:

- 1 — 例外のスローを有効にする。
- 0 — 例外のスローを無効にする。

## optimize_time_filter_with_preimage \{#optimize_time_filter_with_preimage\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "関数呼び出しを、追加の変換を伴わない等価な比較式に置き換えることで、Date および DateTime の述語を最適化します（例: toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'）。"}]}]}/>

関数呼び出しを、追加の変換を伴わない等価な比較式に置き換えることで、Date および DateTime の述語を最適化します（例: `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`）

## optimize_trivial_approximate_count_query \{#optimize_trivial_approximate_count_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

EmbeddedRocksDB など、この種の推定をサポートするストレージに対して、単純な `count` クエリの最適化に近似値を使用します。

使用可能な値:

- 0 — 最適化を無効にする。
   - 1 — 最適化を有効にする。

## optimize_trivial_count_query \{#optimize_trivial_count_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

MergeTree のメタデータを使用して、単純なクエリ `SELECT count() FROM table` を最適化するかどうかを切り替えます。行レベルセキュリティを使用する必要がある場合は、この設定を無効にしてください。

可能な値:

- 0 — 最適化を無効にする。
   - 1 — 最適化を有効にする。

関連項目:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \{#optimize_trivial_insert_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "多くの場合、この最適化は有効ではありません。"}]}]}/>

単純な `INSERT INTO table SELECT ... FROM TABLES` クエリを最適化します。

## optimize_uniq_to_count \{#optimize_uniq_to_count\} 

<SettingsInfoBlock type="Bool" default_value="1" />

サブクエリに `DISTINCT` または `GROUP BY` 句が含まれている場合、`uniq` およびその派生関数（`uniqUpTo` を除く）を `count` に書き換えます。

## optimize_use_implicit_projections \{#optimize_use_implicit_projections\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` クエリの実行に暗黙的プロジェクションを自動的に選択します

## optimize_use_projection_filtering \{#optimize_use_projection_filtering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

`SELECT` クエリの実行でプロジェクションが選択されていない場合でも、パート範囲のフィルタリングにプロジェクションを使用できるようにします。

## optimize_use_projections \{#optimize_use_projections\} 

**エイリアス**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

`SELECT` クエリを処理する際に、[プロジェクション](../../engines/table-engines/mergetree-family/mergetree.md/#projections)最適化を有効または無効にします。

設定可能な値:

- 0 — プロジェクション最適化を無効にする。
- 1 — プロジェクション最適化を有効にする。

## optimize_using_constraints \{#optimize_using_constraints\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリの最適化に[制約](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルト値は `false` です。

指定可能な値:

- true, false

## os_threads_nice_value_materialized_view \{#os_threads_nice_value_materialized_view\} 

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

マテリアライズドビューのスレッドに対する Linux の nice 値です。値が小さいほど CPU の優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要です。付与されていない場合は何も行われません。

取り得る値の範囲: -20 〜 19。

## os_threads_nice_value_query \{#os_threads_nice_value_query\} 

**別名**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

クエリ処理スレッド用の Linux の nice 値。値が小さいほど CPU 優先度が高くなります。

CAP_SYS_NICE ケーパビリティが必要で、ない場合は何も行われません。

指定可能な値: -20 ～ 19。

## output_format_compression_level \{#output_format_compression_level\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "Allow to change compression level in the query output"}]}]}/>

クエリ出力が圧縮される場合の既定の圧縮レベルです。`SELECT` クエリに `INTO OUTFILE` が指定されている場合、またはテーブル関数 `file`、`url`、`hdfs`、`s3`、`azureBlobStorage` に書き込む場合に、この設定が適用されます。

指定できる値: `1` から `22`

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "zstd 圧縮使用時に、クエリ出力の zstd ウィンドウログを変更できるようにする"}]}]}/>

出力の圧縮方式が `zstd` の場合に使用できます。`0` より大きい場合、この設定は圧縮ウィンドウサイズ（`2` の累乗）を明示的に設定し、zstd 圧縮のロングレンジモードを有効にします。これにより、より高い圧縮率を達成できる場合があります。

取りうる値: 非負の整数値。値が小さすぎる、または大きすぎる場合は `zstdlib` が例外をスローします。典型的な値は `20`（ウィンドウサイズ = `1MB`）から `30`（ウィンドウサイズ = `1GB`）の範囲です。

## output_format_parallel_formatting \{#output_format_parallel_formatting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

データ形式の並列フォーマットを有効または無効にします。[TSV](/interfaces/formats/TabSeparated)、[TSKV](/interfaces/formats/TSKV)、[CSV](/interfaces/formats/CSV)、[JSONEachRow](/interfaces/formats/JSONEachRow) 形式でのみサポートされています。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

## page_cache_block_size \{#page_cache_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "この設定をクエリ単位で調整可能にしました。"}]}]}/>

ユーザー空間のページキャッシュに保存するファイルチャンクのサイズ（バイト単位）です。キャッシュを経由するすべての読み出しは、このサイズの倍数に切り上げられます。

この設定はクエリ単位で調整できますが、異なるブロックサイズを持つキャッシュエントリは再利用できません。この設定を変更すると、事実上キャッシュ内の既存エントリは無効になります。

1 MiB のような大きな値はスループットの高いクエリに適しており、64 KiB のような小さな値はレイテンシの低いポイントクエリに適しています。

## page_cache_inject_eviction \{#page_cache_inject_eviction\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザースペースのページキャッシュを追加"}]}]}/>

ユーザースペース ページキャッシュは、ランダムにいくつかのページを無効化します。テスト目的での使用を想定しています。

## page_cache_lookahead_blocks \{#page_cache_lookahead_blocks\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "Made this setting adjustable on a per-query level."}]}]}/>

ユーザー空間ページキャッシュでミスが発生した場合に、キャッシュに存在しない連続したブロックを、下位ストレージから一度に読み込む最大ブロック数を指定します。各ブロックのサイズは page_cache_block_size バイトです。

値を大きくするとスループット重視のクエリに有利になり、一方で低レイテンシを要するポイントクエリでは、先読みを行わないほうがより良く動作します。

## parallel_distributed_insert_select \{#parallel_distributed_insert_select\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

並列分散 `INSERT ... SELECT` クエリの実行を有効化します。

`INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` クエリを実行する際に、両方のテーブルが同じクラスターを使用しており、かつ両方のテーブルが [レプリケートテーブル](../../engines/table-engines/mergetree-family/replication.md) であるか、または両方とも非レプリケートテーブルである場合、このクエリは各シャード上でローカルに処理されます。

設定可能な値:

- `0` — 無効。
- `1` — 分散エンジンの基礎となるテーブルに対して、各シャード上で `SELECT` が実行されます。
- `2` — 分散エンジンの基礎となるテーブルに対して、各シャード上で `SELECT` および `INSERT` が実行されます。

この設定を使用する場合は、`enable_parallel_replicas = 1` を設定する必要があります。

## parallel_hash_join_threshold \{#parallel_hash_join_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

ハッシュベースの結合アルゴリズムが適用される場合、このしきい値は、`hash` と `parallel_hash` のどちらを使用するかを判断するために利用されます（右テーブルのサイズを見積もることが可能な場合のみ有効です）。
右テーブルのサイズがこのしきい値より小さいと分かっている場合は、前者が使用されます。

## parallel_replica_offset \{#parallel_replica_offset\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは直接使用すべきではない内部設定であり、`parallel replicas` モードの実装上の詳細を表します。分散クエリにおいて、並列レプリカのうちクエリ処理に参加する各レプリカのインデックスは、この設定によってイニシエータサーバーが自動的に設定します。

## parallel_replicas_allow_in_with_subquery \{#parallel_replicas_allow_in_with_subquery\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "`true` の場合、IN 述語のサブクエリは各フォロワーレプリカ上で実行されます"}]}]}/>

`true` の場合、IN 述語のサブクエリは各フォロワーレプリカ上で実行されます。

## parallel_replicas_connect_timeout_ms \{#parallel_replicas_connect_timeout_ms\} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "parallel replicas クエリ用の個別の接続タイムアウト"}]}]}/>

parallel replicas を用いたクエリ実行時に、リモートレプリカへ接続する際のタイムアウト時間をミリ秒で指定します。タイムアウトに達した場合、そのレプリカはクエリ実行には使用されません。

## parallel_replicas_count \{#parallel_replicas_count\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

これは「parallel replicas」モードの実装上の詳細を表す内部設定であり、ユーザーが直接使用することは想定されていません。分散クエリに対しては、クエリ処理に参加する並列レプリカの数を表す値として、この設定がイニシエーターとなるサーバーによって自動的に設定されます。

## parallel_replicas_custom_key \{#parallel_replicas_custom_key\} 

<BetaBadge/>

特定のテーブルに対して、レプリカ間で処理を分割するために使用できる任意の整数式です。
値には任意の整数式を指定できます。

可能であれば、主キーを用いた単純な式を使用することが推奨されます。

この設定が、単一のシャードで構成され複数のレプリカを持つクラスタで使用される場合、それらのレプリカは仮想シャードに変換されます。
それ以外の場合は `SAMPLE` キーの場合と同様に動作し、各シャードの複数のレプリカを使用します。

## parallel_replicas_custom_key_range_lower \{#parallel_replicas_custom_key_range_lower\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Add settings to control the range filter when using parallel replicas with dynamic shards"}]}]}/>

フィルタータイプ `range` が、カスタム範囲 `[parallel_replicas_custom_key_range_lower, INT_MAX]` に基づいてレプリカ間で処理を均等に分割できるようにします。

[parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` に対して、フィルターがレプリカ間で処理を均等に分割できるようになります。

注記: この設定によって、クエリ処理中に余分なデータが追加でフィルタリングされることはありません。代わりに、並列処理のために範囲フィルターが範囲 `[0, INT_MAX]` をどのポイントで分割するかが変更されます。

## parallel_replicas_custom_key_range_upper \{#parallel_replicas_custom_key_range_upper\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "動的シャードで parallel replicas を使用する際の range フィルタを制御するための設定を追加。値 0 は上限を無効化します"}]}]}/>

フィルタータイプ `range` が、カスタム範囲 `[0, parallel_replicas_custom_key_range_upper]` に基づいて、レプリカ間で処理を均等に分割できるようにします。設定値が 0 の場合は上限が無効化され、カスタムキー式の最大値が使用されます。

[parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) と併用すると、範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` に対して、レプリカ間で処理を均等に分割できるようになります。

注意: この設定によって、クエリ処理中に追加のデータがフィルタリングされることはありません。その代わり、並列処理のために range フィルタが範囲 `[0, INT_MAX]` をどの位置で分割するかが変わります。

## parallel_replicas_for_cluster_engines \{#parallel_replicas_for_cluster_engines\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

テーブル関数エンジンを、それぞれ対応する -Cluster 版に置き換えます

## parallel_replicas_for_non_replicated_merge_tree \{#parallel_replicas_for_non_replicated_merge_tree\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

`true` の場合、ClickHouse はレプリケーションされていない MergeTree テーブルに対しても parallel replicas アルゴリズムを使用します。

## parallel_replicas_index_analysis_only_on_coordinator \{#parallel_replicas_index_analysis_only_on_coordinator\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "インデックス解析はレプリカコーディネーター上でのみ実行され、他のレプリカでは実行されません。parallel_replicas_local_plan が有効な場合にのみ有効です。"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "インデックス解析はレプリカコーディネーター上でのみ実行され、他のレプリカでは実行されません。parallel_replicas_local_plan が有効な場合にのみ有効です。"}]}]}/>

インデックス解析はレプリカコーディネーター上でのみ実行され、他のレプリカでは実行されません。parallel_replicas_local_pla

## parallel_replicas_insert_select_local_pipeline \{#parallel_replicas_insert_select_local_pipeline\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "並列レプリカ使用時の分散 INSERT SELECT でローカルパイプラインを使用します。現在はパフォーマンス上の問題により無効になっています"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "並列レプリカ使用時の分散 INSERT SELECT でローカルパイプラインを使用します。現在はパフォーマンス上の問題により無効になっています"}]}]}/>

並列レプリカ使用時の分散 INSERT SELECT でローカルパイプラインを使用します

## parallel_replicas_local_plan \{#parallel_replicas_local_plan\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "並列レプリカを使用するクエリにおいて、ローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "並列レプリカを使用するクエリにおいて、ローカルレプリカに対してローカルプランを使用する"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "並列レプリカを使用するクエリにおいて、ローカルレプリカに対してローカルプランを使用する"}]}]}/>

ローカルレプリカ用のローカルプランを生成します。

## parallel_replicas_mark_segment_size \{#parallel_replicas_mark_segment_size\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "この設定値は現在、自動的に決定されます"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "新しい parallel replicas コーディネーター実装でセグメントサイズを制御するための新規設定を追加"}]}]}/>

パーツは、レプリカ間で分散して並列読み取りを行うため、仮想的にセグメントに分割されます。この設定は、これらのセグメントのサイズを制御します。この挙動を十分に理解していない限り、変更することは推奨されません。値は [128, 16384] の範囲で指定する必要があります。

## parallel_replicas_min_number_of_rows_per_replica \{#parallel_replicas_min_number_of_rows_per_replica\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

クエリで使用されるレプリカ数を、(読み取りが見込まれる行数 / min_number_of_rows_per_replica) に制限します。上限は引き続き `max_parallel_replicas` によって制御されます。

## parallel_replicas_mode \{#parallel_replicas_mode\} 

<BetaBadge/>

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "この設定は、parallel replicas 機能を Beta 化する一環として導入されました"}]}]}/>

parallel replicas でカスタムキーを使用する際のフィルタ種別を指定します。`default` の場合はカスタムキーに対して modulo 演算を使用します。`range` の場合は、カスタムキーの値型で取り得るすべての値を対象として、カスタムキーにレンジフィルタを適用します。

## parallel_replicas_only_with_analyzer \{#parallel_replicas_only_with_analyzer\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "parallel replicas はアナライザー有効時にのみサポートされます"}]}]}/>

parallel replicas を使用するには、アナライザーを有効にしておく必要があります。アナライザーが無効な場合、たとえレプリカからの並列読み取りが有効になっていても、クエリ実行はローカル実行にフォールバックします。アナライザーを有効にしない状態での parallel replicas の使用はサポートされていません。

## parallel_replicas_prefer_local_join \{#parallel_replicas_prefer_local_join\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "true の場合、JOIN が parallel replicas アルゴリズムで実行可能であり、かつ右側の JOIN 部分のすべてのストレージが *MergeTree の場合、GLOBAL JOIN の代わりにローカル JOIN が使用されます。"}]}]}/>

true の場合、JOIN が parallel replicas アルゴリズムで実行可能であり、かつ右側の JOIN 部分のすべてのストレージが *MergeTree の場合、GLOBAL JOIN の代わりにローカル JOIN が使用されます。

## parallel_replicas_support_projection \{#parallel_replicas_support_projection\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定です。プロジェクションの最適化を並列レプリカに適用できます。parallel_replicas_local_plan が有効であり、かつ aggregation_in_order が無効な場合にのみ効果があります。"}]}]}/>

プロジェクションの最適化を並列レプリカに適用できます。parallel_replicas_local_plan が有効であり、かつ aggregation_in_order が無効な場合にのみ効果があります。

## parallel_view_processing \{#parallel_view_processing\} 

<SettingsInfoBlock type="Bool" default_value="0" />

アタッチされているビューへのプッシュを、逐次ではなく並列に実行できるようにします。

## parallelize_output_from_storages \{#parallelize_output_from_storages\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ファイル / URL / S3 などから読み取るクエリを実行する際の並列化を許可します。これにより行の順序が変わる可能性があります。"}]}]}/>

ストレージからの読み取りステップにおける出力を並列化します。可能な場合、ストレージからの読み取り直後からクエリ処理を並列実行できるようにします。

## parsedatetime_e_requires_space_padding \{#parsedatetime_e_requires_space_padding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 'parseDateTime' におけるフォーマット指定子 '%e' は、1 桁の日がスペースでパディングされていることを要求します。たとえば ' 2' は受け入れられますが、'2' はエラーになります。

## parsedatetime_parse_without_leading_zeros \{#parsedatetime_parse_without_leading_zeros\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "MySQL の DATE_FORMAT/STR_TO_DATE との互換性を改善"}]}]}/>

関数 `parseDateTime` におけるフォーマット指定子 '%c'、'%l'、'%k' は、先頭のゼロを付けずに月と時を解析します。

## partial_merge_join_left_table_buffer_bytes \{#partial_merge_join_left_table_buffer_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 以外に設定すると、部分マージ結合において左側テーブルのブロックをより大きなブロックにまとめます。結合を行う各スレッドごとに、設定したメモリ量の最大 2 倍まで使用します。

## partial_merge_join_rows_in_right_blocks \{#partial_merge_join_rows_in_right_blocks\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

部分マージ結合アルゴリズムを使用する [JOIN](../../sql-reference/statements/select/join.md) クエリにおいて、右側の結合データブロックの行数の上限を制限します。

ClickHouse サーバーは次の処理を行います:

1.  右側の結合データを、指定された行数以内のブロックに分割します。
2.  各ブロックに対して、最小値と最大値でインデックスを作成します。
3.  可能であれば、準備済みブロックをディスクに退避します。

設定可能な値:

- 任意の正の整数。推奨値の範囲: \[1000, 100000\]。

## partial_result_on_first_cancel \{#partial_result_on_first_cancel\} 

<SettingsInfoBlock type="Bool" default_value="0" />

クエリのキャンセル時に、部分的な結果を返すことを許可します。

## parts_to_delay_insert \{#parts_to_delay_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルが単一パーティション内にこの数以上のアクティブなパーツを含んでいる場合、テーブルへの挿入を意図的に遅延させます。

## parts_to_throw_insert \{#parts_to_throw_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

宛先テーブルの単一パーティション内に存在するアクティブパーツの数がこの値を超えた場合、「Too many parts ...」という例外がスローされます。

## per_part_index_stats \{#per_part_index_stats\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

パート単位でインデックス統計情報をログに記録します

## poll_interval \{#poll_interval\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

サーバーのクエリ待機ループにおいて、指定した秒数間ブロックします。

## postgresql_connection_attempt_timeout \{#postgresql_connection_attempt_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 接続の `connect_timeout` パラメータを制御するための設定です。"}]}]}/>

PostgreSQL エンドポイントへの 1 回の接続試行に対するタイムアウト値（秒単位）。
この値は接続 URL の `connect_timeout` パラメータとして渡されます。

## postgresql_connection_pool_auto_close_connection \{#postgresql_connection_pool_auto_close_connection\} 

<SettingsInfoBlock type="Bool" default_value="0" />

接続をプールに返す前に接続を閉じます。

## postgresql_connection_pool_retries \{#postgresql_connection_pool_retries\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "PostgreSQL 接続プールにおける再試行回数を制御できるようになりました。"}]}]}/>

PostgreSQL テーブルエンジンおよびデータベースエンジンにおける接続プールの push/pop の再試行回数を指定します。

## postgresql_connection_pool_size \{#postgresql_connection_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

PostgreSQL テーブルエンジンおよびデータベースエンジンで使用される接続プールのサイズ。

## postgresql_connection_pool_wait_timeout \{#postgresql_connection_pool_wait_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

PostgreSQL テーブルエンジンおよびデータベースエンジンにおいて、接続プールが空の場合に、プールに対する push/pop 操作で待機するタイムアウト時間です。既定では、プールが空の場合はブロックされます。

## postgresql_fault_injection_probability \{#postgresql_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

レプリケーション用の内部 PostgreSQL クエリが失敗する確率のおおよその値です。有効な値は [0.0f, 1.0f] の範囲です。

## prefer&#95;column&#95;name&#95;to&#95;alias

<SettingsInfoBlock type="Bool" default_value="0" />

クエリ内の式および句で、エイリアスではなく元のカラム名を使用するかどうかを切り替えます。特にエイリアスがカラム名と同一である場合に重要です。詳しくは [Expression Aliases](/sql-reference/syntax#notes-on-usage) を参照してください。この設定を有効にすると、ClickHouse におけるエイリアス構文のルールが、ほとんどの他のデータベースエンジンとより互換性の高いものになります。

取りうる値:

* 0 — カラム名はエイリアスで置き換えられます。
* 1 — カラム名はエイリアスで置き換えられません。

**例**

有効時と無効時の違い:

クエリ:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果:

```text
サーバーから例外を受信しました (バージョン 21.5.1):
コード: 184. DB::Exception: localhost:9000 から受信。DB::Exception: クエリ内で集約関数 avg(number) が別の集約関数内に検出されました: avg(number) AS number の処理中。
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


## prefer_external_sort_block_bytes \{#prefer_external_sort_block_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "外部ソート時にブロックの最大バイト数を優先して使用し、マージ時のメモリ使用量を削減します。"}]}]}/>

外部ソート時にブロックの最大バイト数を優先して使用し、マージ時のメモリ使用量を削減します。

## prefer_global_in_and_join \{#prefer_global_in_and_join\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`IN`/`JOIN` 演算子を `GLOBAL IN`/`GLOBAL JOIN` に置き換えることを有効にします。

取りうる値:

- 0 — 無効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられません。
- 1 — 有効。`IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられます。

**使用方法**

`SET distributed_product_mode=global` は分散テーブルに対するクエリの挙動を変更できますが、ローカルテーブルや外部リソース由来のテーブルには適していません。そのような場合に `prefer_global_in_and_join` 設定が役立ちます。

例えば、ローカルテーブルを保持していて分散には適さないクエリ処理ノードがあるとします。分散処理時には、`GLOBAL` キーワード（`GLOBAL IN`/`GLOBAL JOIN`）を用いて、そのデータをオンザフライで分散させる必要があります。

`prefer_global_in_and_join` の別のユースケースは、外部エンジンによって作成されたテーブルへのアクセスです。この設定により、そのようなテーブルを結合する際の外部ソースへの呼び出し回数を削減できます。クエリごとに 1 回の呼び出しのみで済みます。

**参照:**

- `GLOBAL IN`/`GLOBAL JOIN` の使用方法の詳細については、[Distributed subqueries](/sql-reference/operators/in#distributed-subqueries) を参照してください。

## prefer_localhost_replica \{#prefer_localhost_replica\} 

<SettingsInfoBlock type="Bool" default_value="1" />

分散クエリを処理する際に、`localhost` レプリカを優先的に使用するかどうかを切り替えます。

設定値:

- 1 — `localhost` レプリカが存在する場合、ClickHouse は常にそのレプリカにクエリを送信します。
- 0 — ClickHouse は [load_balancing](#load_balancing) 設定で指定されたバランシング戦略を使用します。

:::note
[parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用せずに [max_parallel_replicas](#max_parallel_replicas) を使用する場合は、この設定を無効にしてください。
[parallel_replicas_custom_key](#parallel_replicas_custom_key) が設定されている場合は、複数シャードにそれぞれ複数レプリカが存在するクラスタで使用しているときのみ、この設定を無効にしてください。
単一シャードかつ複数レプリカ構成のクラスタで使用している場合にこの設定を無効にすると、悪影響を及ぼします。
:::

## prefer_warmed_unmerged_parts_seconds \{#prefer_warmed_unmerged_parts_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

ClickHouse Cloud でのみ有効です。マージ済みパーツがこの設定値（秒）より新しく、かつ事前ウォームされておらず（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を参照）、一方で、その元となるすべてのパーツが利用可能かつ事前ウォームされている場合、SELECT クエリは代わりにそれらの元パーツから読み取ります。Replicated-/SharedMergeTree の場合のみ有効です。これは CacheWarmer がそのパーツを処理したかどうかだけを確認する点に注意してください。そのパーツが他の処理によってキャッシュにフェッチされていた場合でも、CacheWarmer が処理するまではコールドと見なされます。また、ウォームされた後にキャッシュから追い出された場合でも、ウォーム済みとして扱われます。

## preferred_block_size_bytes \{#preferred_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

この設定はクエリ処理におけるデータブロックサイズを調整するもので、より粗い制御を行う `max_block_size` に対する追加の微調整を行います。カラムが大きく、`max_block_size` 行を単位とした場合にブロックサイズが指定したバイト数を超えて大きくなりそうな場合には、CPU キャッシュの局所性を高めるために、そのサイズがより小さくなるように調整されます。

## preferred_max_column_in_block_size_bytes \{#preferred_max_column_in_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

読み取り時における、ブロック内の列サイズの最大値を制限します。キャッシュミスの回数を減らすのに役立ちます。L2 キャッシュサイズに近い値を指定することを推奨します。

## preferred_optimize_projection_name \{#preferred_optimize_projection_name\} 

空でない文字列が設定されている場合、ClickHouse はクエリで指定された projection を適用しようとします。

設定可能な値:

- string: 優先する projection の名前

## prefetch_buffer_size \{#prefetch_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

ファイルシステムからの読み取りに使用されるプリフェッチバッファの最大サイズ。

## print&#95;pretty&#95;type&#95;names

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "より良いユーザーエクスペリエンス。"}]}]} />

`DESCRIBE` クエリおよび `toTypeName()` 関数で、深くネストした型名をインデントを付けて見やすく出力します。

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

クエリの優先度。1 が最も高く、値が大きくなるほど優先度は低くなります。0 の場合、優先度は無効になります。

## promql_database \{#promql_database\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的設定"}]}]}/>

`promql` 方言が使用するデータベース名を指定します。空文字列を指定した場合は、現在のデータベースが使用されます。

## promql_evaluation_time \{#promql_evaluation_time\} 

<ExperimentalBadge/>

**別名**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "設定名が変更されました。以前の名前は `evaluation_time` です。"}]}]}/>

promql 方言で使用する評価時刻を設定します。`auto` は現在時刻を意味します。

## promql_table \{#promql_table\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "新しい実験的設定"}]}]}/>

`promql` ダイアレクトで使用される TimeSeries テーブルの名前を指定します。

## push_external_roles_in_interserver_queries \{#push_external_roles_in_interserver_queries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "新しい設定です。"}]}]}/>

クエリ実行時に、発行元ノードから他のノードへユーザーロールをプッシュできるようにします。

## query_cache_compress_entries \{#query_cache_compress_entries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

[クエリキャッシュ](../query-cache.md)内のエントリを圧縮します。クエリキャッシュのメモリ使用量を抑えますが、その代わりキャッシュへの挿入およびキャッシュからの読み取りが遅くなります。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_max_entries \{#query_cache_max_entries\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) に保存できるクエリ結果の最大数です。0 の場合は無制限を意味します。

指定可能な値:

- 0 以上の整数。

## query_cache_max_size_in_bytes \{#query_cache_max_size_in_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

現在のユーザーが [query cache](../query-cache.md) で使用できるメモリの最大量（バイト単位）。0 は無制限を意味します。

取り得る値:

- 0 以上の整数。

## query_cache_min_query_duration \{#query_cache_min_query_duration\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

クエリ結果を[クエリキャッシュ](../query-cache.md)に保存するために必要な、クエリの最小実行時間（ミリ秒単位）。

設定可能な値:

- 0 以上の整数。

## query_cache_min_query_runs \{#query_cache_min_query_runs\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`SELECT` クエリの結果が[クエリキャッシュ](../query-cache.md)に保存されるために必要な、そのクエリの最小実行回数。

設定可能な値:

- 0 以上の整数。

## query_cache_nondeterministic_function_handling \{#query_cache_nondeterministic_function_handling\} 

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

[クエリキャッシュ](../query-cache.md) が、`rand()` や `now()` のような非決定論的関数を含む `SELECT` クエリをどのように扱うかを制御します。

設定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_share_between_users \{#query_cache_share_between_users\} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効にすると、[クエリキャッシュ](../query-cache.md) にキャッシュされた `SELECT` クエリの結果を他のユーザーが参照できるようになります。
セキュリティ上の理由から、この設定を有効にすることは推奨しません。

取り得る値:

- 0 - 無効
- 1 - 有効

## query_cache_squash_partial_results \{#query_cache_squash_partial_results\} 

<SettingsInfoBlock type="Bool" default_value="1" />

部分的な結果ブロックを、[max_block_size](#max_block_size) のサイズのブロックに統合します。[query cache](../query-cache.md) への挿入パフォーマンスは低下しますが、キャッシュエントリの圧縮効率が向上します（[query_cache_compress-entries](#query_cache_compress_entries) を参照）。

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_system_table_handling \{#query_cache_system_table_handling\} 

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "クエリキャッシュは system テーブルに対するクエリ結果をキャッシュしなくなりました"}]}]}/>

[クエリキャッシュ](../query-cache.md) が、`system.*` および `information_schema.*` データベース内のテーブル、すなわちシステムテーブルに対する `SELECT` クエリをどのように処理するかを制御します。

設定可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_tag \{#query_cache_tag\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "クエリキャッシュ設定にラベルを付けるための新しい設定。"}]}]}/>

[query cache](../query-cache.md) のエントリに対するラベルとして機能する文字列です。
同じクエリでも、異なるタグが付与されている場合は、クエリキャッシュでは別のクエリとして扱われます。

設定可能な値:

- 任意の文字列

## query_cache_ttl \{#query_cache_ttl\} 

<SettingsInfoBlock type="Seconds" default_value="60" />

この秒数が経過すると、[query cache](../query-cache.md) 内のエントリは古くなったと見なされます。

指定可能な値:

- 0 以上の整数。

## query_condition_cache_store_conditions_as_plaintext \{#query_condition_cache_store_conditions_as_plaintext\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

[クエリ条件キャッシュ](/operations/query-condition-cache) 用のフィルター条件を平文で保存します。
有効にすると、system.query_condition_cache にフィルター条件がそのまま表示され、キャッシュに関する問題のデバッグが容易になります。
フィルター条件を平文で保存すると機微な情報が露出する可能性があるため、デフォルトでは無効になっています。

可能な値:

- 0 - 無効
- 1 - 有効

## query_metric_log_interval \{#query_metric_log_interval\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "New setting."}]}]}/>

個々のクエリごとに [query_metric_log](../../operations/system-tables/query_metric_log.md) が収集される間隔（ミリ秒単位）。

負の値が設定された場合は、[query_metric_log 設定](/operations/server-configuration-parameters/settings#query_metric_log) の `collect_interval_milliseconds` の値が使用され、これが存在しない場合はデフォルトで 1000 が使用されます。

単一のクエリに対する収集を無効にするには、`query_metric_log_interval` を 0 に設定します。

デフォルト値: -1

## query_plan_aggregation_in_order \{#query_plan_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "クエリプランに関する一部のリファクタリングを有効化"}]}]}/>

クエリプランレベルでの「インオーダー集約」最適化の有効／無効を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効です。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級者向けの設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_convert_any_join_to_semi_or_anti_join \{#query_plan_convert_any_join_to_semi_or_anti_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

JOIN の後のフィルタが、マッチしなかった行またはマッチした行に対して常に false と評価される場合に、ANY JOIN を SEMI JOIN または ANTI JOIN に変換できるようにします

## query_plan_convert_join_to_in \{#query_plan_convert_join_to_in\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

出力カラムが左テーブルのみに結び付いている場合に、`JOIN` を `IN` を用いたサブクエリに変換できるようにします。ANY 以外の JOIN（デフォルトの ALL JOIN など）では、誤った結果になる可能性があります。

## query_plan_convert_outer_join_to_inner_join \{#query_plan_convert_outer_join_to_inner_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "JOIN 後のフィルターが常にデフォルト値を除外する場合に、OUTER JOIN を INNER JOIN へ変換することを許可"}]}]}/>

`JOIN` の後に適用されるフィルターが常にデフォルト値を除外する場合に、`OUTER JOIN` を `INNER JOIN` へ変換することを許可します

## query_plan_direct_read_from_text_index \{#query_plan_direct_read_from_text_index\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

クエリプラン内でテキストの倒立インデックスのみを用いて全文検索のフィルタ処理を行えるようにします。

## query_plan_display_internal_aliases \{#query_plan_display_internal_aliases\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

`EXPLAIN PLAN` で、元のクエリで指定されたエイリアスの代わりに、`__table1` などの内部エイリアスを表示します。

## query_plan_enable_multithreading_after_window_functions \{#query_plan_enable_multithreading_after_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数の評価後のマルチスレッド化を有効にし、ストリームを並列に処理できるようにします

## query_plan_enable_optimizations \{#query_plan_enable_optimizations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでのクエリ最適化を切り替えます。

:::note
これは開発者によるデバッグのためにのみ使用すべき高度な設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - クエリプランレベルでのすべての最適化を無効にする
- 1 - クエリプランレベルでの最適化を有効にする（ただし、個々の最適化はそれぞれの設定で無効化されている場合があります）

## query_plan_execute_functions_after_sorting \{#query_plan_execute_functions_after_sorting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

ソート処理ステップの後に式を移動する、クエリプランレベルの最適化を有効／無効にします。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 設定が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき上級ユーザー向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_filter_push_down \{#query_plan_filter_push_down\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルでの最適化を切り替えます。この最適化は、フィルター条件を実行計画内のより下位の段階へ移動させます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは、開発者がデバッグ目的でのみ使用すべきエキスパート向け設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_join_shard_by_pk_ranges \{#query_plan_join_shard_by_pk_ranges\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "新しい設定"}]}]}/>

両方のテーブルで、JOIN キーにそれぞれの PRIMARY KEY のプレフィックスが含まれている場合に、JOIN にシャーディングを適用します。`hash`、`parallel_hash`、`full_sorting_merge` アルゴリズムでサポートされます。通常はクエリの高速化にはつながりませんが、メモリ消費を抑えられる場合があります。

## query_plan_join_swap_table \{#query_plan_join_swap_table\} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "新しい設定。以前は常に右側のテーブルが選択されていました。"}]}]}/>

クエリプラン内で、結合のどちら側をビルドテーブル（インナーテーブルとも呼ばれ、ハッシュ結合でハッシュテーブルに挿入される側）にするかを決定します。この設定は、`JOIN ON` 句を伴う `ALL` 結合厳格性でのみサポートされます。取りうる値は次のとおりです。

- 'auto': どのテーブルをビルドテーブルとして使用するかをプランナーに任せます。
    - 'false': テーブルを入れ替えません（右側のテーブルがビルドテーブルになります）。
    - 'true': 常にテーブルを入れ替えます（左側のテーブルがビルドテーブルになります）。

## query_plan_lift_up_array_join \{#query_plan_lift_up_array_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの最適化機能を切り替えます。この最適化では、実行プラン内の ARRAY JOIN をより上位の段階に移動します。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取りうる値:

- 0 - 無効
- 1 - 有効

## query_plan_lift_up_union \{#query_plan_lift_up_union\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランのより大きなサブツリーを `UNION` 内に移動し、さらなる最適化を可能にする、クエリプランレベルの最適化を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

Possible values:

- 0 - 無効
- 1 - 有効

## query_plan_max_limit_for_lazy_materialization \{#query_plan_max_limit_for_lazy_materialization\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "クエリプランを遅延マテリアライズ最適化に使用できる最大制限値を制御するための新しい設定を追加しました。0 の場合、制限はありません"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "100"},{"label": "さらに最適化されました"}]}]}/>

クエリプランを遅延マテリアライズ最適化に使用できる最大制限値を制御します。0 の場合、制限はありません。

## query_plan_max_optimizations_to_apply \{#query_plan_max_optimizations_to_apply\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

クエリプランに適用される最適化の総数を制限します。設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) を参照してください。
複雑なクエリに対して、最適化に時間がかかり過ぎることを防ぐのに役立ちます。
EXPLAIN PLAN クエリでは、この上限に達した時点で最適化の適用を中止し、その時点のプランをそのまま返します。
通常のクエリ実行では、実際に適用された最適化の数がこの設定値を超えた場合、例外がスローされます。

:::note
これは開発者がデバッグの目的でのみ使用すべきエキスパート向けの設定です。この設定は将来的に後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

## query_plan_max_step_description_length \{#query_plan_max_step_description_length\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

EXPLAIN PLAN 内のステップ説明の最大長。

## query_plan_merge_expressions \{#query_plan_merge_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

連続するフィルターをマージするクエリプランレベルの最適化を有効／無効にする設定です。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途にのみ使用すべき、エキスパート向けの設定です。この設定は将来、後方互換性のない形で変更されるか、削除される可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_merge_filter_into_join_condition \{#query_plan_merge_filter_into_join_condition\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "フィルターを結合条件に統合する新しい設定を追加"}]}]}/>

`JOIN` の条件にフィルターを統合し、`CROSS JOIN` を `INNER JOIN` に変換できるようにします。

## query_plan_merge_filters \{#query_plan_merge_filters\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "クエリプラン内でフィルタのマージを許可する"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "クエリプラン内でフィルタのマージを許可する。これは、新しいアナライザーでのフィルタプッシュダウンを正しくサポートするために必要です。"}]}]}/>

クエリプラン内でフィルタのマージを許可します。

## query_plan_optimize_join_order_limit \{#query_plan_optimize_join_order_limit\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "より多くのテーブルに対する JOIN の並べ替えをデフォルトで許可"}]}]}/>

同一サブクエリ内の JOIN の順序を最適化します。現在はごく限られたケースでのみサポートされています。
    値は最適化を行うテーブル数の最大値です。

## query_plan_optimize_lazy_materialization \{#query_plan_optimize_lazy_materialization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "遅延マテリアライゼーションを最適化するためにクエリプランを使用する新しい設定を追加しました"}]}]}/>

遅延マテリアライゼーションを最適化するためにクエリプランを使用します。

## query_plan_optimize_prewhere \{#query_plan_optimize_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "サポートされているストレージに対して、フィルタ条件を PREWHERE 式へプッシュダウンできるようにする"}]}]}/>

サポートされているストレージに対して、フィルタ条件を PREWHERE 式へプッシュダウンできるようにする

## query_plan_push_down_limit \{#query_plan_push_down_limit\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの最適化を有効／無効にします。この最適化では、`LIMIT` を実行プラン内でより下位のステージへ押し下げて配置します。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効です。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order \{#query_plan_read_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリプランレベルの「順序どおり読み取り」最適化の有効／無効を切り替えます。
[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) 設定が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ用途でのみ使用すべき上級者向け設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_distinct \{#query_plan_remove_redundant_distinct\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "クエリプランから冗長な DISTINCT ステップを削除"}]}]}/>

クエリプランレベルで冗長な DISTINCT ステップを削除する最適化を切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべき高度な設定です。今後、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_sorting \{#query_plan_remove_redundant_sorting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "クエリプラン内の冗長なソート処理を削除します。たとえば、サブクエリ内の ORDER BY 句に関連するソートステップなど"}]}]}/>

サブクエリなどにおける冗長なソートステップを削除する、クエリプランレベルの最適化を有効／無効切り替えます。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは、開発者がデバッグ用途でのみ使用すべきエキスパート向けの設定です。将来、後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_unused_columns \{#query_plan_remove_unused_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting. Add optimization to remove unused columns in query plan."}]}]}/>

クエリプラン内で未使用の列（入力列と出力列の両方）を削除しようとする、クエリプランレベルの最適化を有効／無効にします。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者によるデバッグ用途のみに使用すべきエキスパート向け設定です。将来、後方互換性のない形で変更されたり、削除される可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_reuse_storage_ordering_for_window_functions \{#query_plan_reuse_storage_ordering_for_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

ウィンドウ関数のソート処理において、ストレージの並び順を利用するクエリプランレベルの最適化を有効／無効にします。
この設定は、[`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは、開発者がデバッグ目的でのみ使用すべきエキスパート向け設定です。将来、後方互換性のない形で変更されたり、削除される可能性があります。
:::

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_split_filter \{#query_plan_split_filter\} 

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
これは開発者がデバッグ目的でのみ使用すべき高度な設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

フィルターを式に分割する、クエリプラン単位の最適化を切り替えます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

取り得る値:

- 0 - 無効
- 1 - 有効

## query_plan_text_index_add_hint \{#query_plan_text_index_add_hint\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

クエリプランにおいて、反転テキストインデックスに基づくフィルタリングのためのヒント（追加述語）を追加できるようにします。

## query_plan_try_use_vector_search \{#query_plan_try_use_vector_search\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "新しい設定です。"}]}]}/>

ベクター類似性インデックスの利用を試みる、クエリプランレベルの最適化を有効／無効にします。
設定 [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) が 1 の場合にのみ有効になります。

:::note
これは開発者がデバッグ目的でのみ使用すべきエキスパート向けの設定です。将来、この設定は後方互換性のない形で変更されたり、削除されたりする可能性があります。
:::

設定可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_use_new_logical_join_step \{#query_plan_use_new_logical_join_step\} 

**エイリアス**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新しいステップを有効にする"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい join ステップ、内部的な変更"}]}]}/>

クエリプランで論理結合（logical join）ステップを使用します。  
注意: 設定 `query_plan_use_new_logical_join_step` は非推奨です。代わりに `query_plan_use_logical_join_step` を使用してください。

## query_profiler_cpu_time_period_ns \{#query_profiler_cpu_time_period_ns\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) の CPU クロックタイマーの周期を設定します。このタイマーは CPU 時間のみをカウントします。

取りうる値:

- ナノ秒で表した正の整数値。

    推奨値:

            - 単一クエリの場合は 10000000 ナノ秒以上（1 秒間に 100 回）。
            - クラスター全体のプロファイリングには 1000000000 ナノ秒（1 秒に 1 回）。

- 0 でタイマーを無効化します。

**ClickHouse Cloud では一時的に無効化されています。**

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \{#query_profiler_real_time_period_ns\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

[query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) の実時間クロックタイマーの周期を設定します。実時間クロックタイマーはウォールクロック時間をカウントします。

取りうる値:

- 正の整数値（ナノ秒単位）。

    推奨値:

            - 10000000（1 秒間に 100 回）ナノ秒以下 — 単一クエリ向け。
            - 1000000000（1 秒に 1 回）— クラスター全体のプロファイリング向け。

- 0 — タイマーを無効にします。

**ClickHouse Cloud では一時的に無効化されています。**

関連項目:

- システムテーブル [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \{#queue_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

同時実行リクエスト数が最大値を超えた場合に、リクエストキュー内で発生する待ち時間。

## rabbitmq_max_wait_ms \{#rabbitmq_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

RabbitMQ からの読み取りを再試行する前に待機する時間。

## read_backoff_max_throughput \{#read_backoff_max_throughput\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

読み取りが遅い場合にスレッド数を減らすための設定です。読み取り帯域幅が 1 秒あたりこのバイト数を下回った場合にイベントをカウントします。

## read_backoff_min_concurrency \{#read_backoff_min_concurrency\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

低速な読み取りが発生した場合に維持しようとするスレッド数の下限を指定する設定です。

## read_backoff_min_events \{#read_backoff_min_events\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

読み取りが遅い場合にスレッド数を削減するための設定です。スレッド数の削減を開始するまでに必要なイベント数を指定します。

## read_backoff_min_interval_between_events_ms \{#read_backoff_min_interval_between_events_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

低速な読み取りが発生した場合に、スレッド数を削減するための設定です。前回のイベントから一定時間が経過していない場合は、そのイベントを考慮しません。

## read_backoff_min_latency_ms \{#read_backoff_min_latency_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

低速な読み取りが発生した場合に、スレッド数を削減するための設定です。この時間以上かかった読み取りのみが対象となります。

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。read_from_filesystem_cache_if_exists_otherwise_bypass_cache と同様ですが、分散キャッシュ向けの設定です。

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルシステムキャッシュをパッシブモードで使用できるようにします。既存のキャッシュエントリは利用しますが、新しいエントリはキャッシュに追加しません。重いアドホッククエリに対してこの設定を有効にし、短いリアルタイムクエリでは無効のままにしておくことで、負荷の高すぎるクエリによるキャッシュのスラッシングを回避し、システム全体の効率を向上させることができます。

## read_from_page_cache_if_exists_otherwise_bypass_cache \{#read_from_page_cache_if_exists_otherwise_bypass_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザー空間のページキャッシュを追加"}]}]}/>

`read_from_filesystem_cache_if_exists_otherwise_bypass_cache` と同様に、パッシブモードでユーザー空間のページキャッシュを使用します。

## read_in_order_two_level_merge_threshold \{#read_in_order_two_level_merge_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

主キー順でのマルチスレッド読み取り時に、事前マージ処理を実行するために読み込む必要があるパーツ数の最小値。

## read_in_order_use_buffering \{#read_in_order_use_buffering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "主キー順に読み取る際にマージ前のバッファリングを使用"}]}]}/>

主キー順に読み取る際に、マージの前にバッファリングを行います。これにより、クエリ実行の並列性が向上します。

## read_in_order_use_virtual_row \{#read_in_order_use_virtual_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "主キー、またはその単調関数に基づく順序で読み取る際に仮想行を使用します。これは、複数のパートにまたがって検索する場合に、関連するパートにしかアクセスしないため有用です。"}]}]}/>

主キー、またはその単調関数に基づく順序で読み取る際に仮想行を使用します。これは、複数のパートにまたがって検索する場合に、関連するパートにしかアクセスしないため有用です。

## read_overflow_mode \{#read_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

上限を超えた場合の動作を指定します。

## read_overflow_mode_leaf \{#read_overflow_mode_leaf\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

読み取るデータ量が、いずれかのリーフ制限を超えた場合の動作を設定します。

指定可能なオプション:

- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止して部分的な結果を返す。

## read_priority \{#read_priority\} 

<SettingsInfoBlock type="Int64" default_value="0" />

ローカルファイルシステムまたはリモートファイルシステムからデータを読み取る際の優先度を設定します。ローカルファイルシステムでは `pread_threadpool` メソッド、リモートファイルシステムでは `threadpool` メソッドの場合にのみ有効です。

## read_through_distributed_cache \{#read_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "ClickHouse Cloud 用の設定"}]}]}/>

ClickHouse Cloud でのみ有効です。分散キャッシュ経由での読み取りを許可します。

## readonly \{#readonly\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - 読み取り専用の制限はなし。1 - 読み取りリクエストのみ許可され、明示的に許可された設定のみ変更可能。2 - 読み取りリクエストのみ許可され、`readonly` 設定以外の設定は変更可能。

## receive_data_timeout_ms \{#receive_data_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

レプリカから最初のデータパケット、または正の進捗を示すパケットを受信する際の接続タイムアウト時間

## receive_timeout \{#receive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークからデータを受信する際のタイムアウト値（秒単位）です。この間に 1 バイトも受信しなかった場合、例外がスローされます。クライアント側でこの設定を行うと、対応するサーバー側の接続でも、そのソケットの `send_timeout` が設定されます。

## regexp_max_matches_per_row \{#regexp_max_matches_per_row\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

単一の正規表現について、1 行あたりの最大マッチ数を設定します。貪欲な正規表現を使用する [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal) 関数の利用時に、メモリの過負荷を防ぐために使用します。

設定可能な値:

- 正の整数。

## reject_expensive_hyperscan_regexps \{#reject_expensive_hyperscan_regexps\} 

<SettingsInfoBlock type="Bool" default_value="1" />

NFA の状態数が爆発的に増加するため、hyperscan での評価コストが高くなると予想されるパターンを拒否します

## remerge_sort_lowered_memory_bytes_ratio \{#remerge_sort_lowered_memory_bytes_ratio\} 

<SettingsInfoBlock type="Float" default_value="2" />

再マージ後のメモリ使用量がこの比率分だけ低減されない場合、再マージは行われません。

## remote_filesystem_read_method \{#remote_filesystem_read_method\} 

<SettingsInfoBlock type="String" default_value="threadpool" />

リモートファイルシステムからのデータ読み取り方式です。`read` または `threadpool` のいずれかを指定します。

## remote_filesystem_read_prefetch \{#remote_filesystem_read_prefetch\} 

<SettingsInfoBlock type="Bool" default_value="1" />

リモートファイルシステムからデータを読み込む際にプリフェッチを使用するかどうかを指定します。

## remote_fs_read_backoff_max_tries \{#remote_fs_read_backoff_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

バックオフを行いながら実施する読み取りの最大試行回数

## remote_fs_read_max_backoff_ms \{#remote_fs_read_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

リモートディスクからデータを読み取る際の最大バックオフ時間

## remote_read_min_bytes_for_seek \{#remote_read_min_bytes_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

リモート読み取り（url, S3）でシークを行うために必要な最小バイト数です。この値より小さい場合は、シークせずに読み飛ばしながら読み取ります。

## rename_files_after_processing \{#rename_files_after_processing\} 

- **Type:** String

- **Default value:** 空文字列

この設定では、`file` テーブル関数で処理されたファイルの名前変更パターンを指定できます。オプションが設定されている場合、`file` テーブル関数で読み込まれたすべてのファイルは、プレースホルダを含む指定されたパターンに従って、処理が正常に完了した場合にのみリネームされます。

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

## replace_running_query \{#replace_running_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

HTTP インターフェイスを使用する場合、`query_id` パラメータを渡すことができます。これはクエリ識別子として機能する任意の文字列です。
同一ユーザーから、同じ `query_id` を持つクエリがすでに存在している場合、その挙動は `replace_running_query` パラメータによって決まります。

`0` (デフォルト) – 例外をスローします（同じ `query_id` を持つクエリがすでに実行中の場合、新しいクエリの実行は許可されません）。

`1` – 古いクエリをキャンセルし、新しいクエリの実行を開始します。

セグメンテーション条件に対するサジェスト機能を実装する場合は、このパラメータを 1 に設定します。次の文字が入力されたときに、古いクエリがまだ終了していなければ、キャンセルされるようにします。

## replace_running_query_max_wait_ms \{#replace_running_query_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

[replace_running_query](#replace_running_query) 設定が有効な場合に、同じ `query_id` を持つ実行中のクエリが終了するまで待機する時間。

設定可能な値:

- 正の整数。
- 0 — サーバーがすでに同じ `query_id` のクエリを実行している場合、新しいクエリの実行を許可しない例外をスローする。

## replication_wait_for_inactive_replica_timeout \{#replication_wait_for_inactive_replica_timeout\} 

<SettingsInfoBlock type="Int64" default_value="120" />

非アクティブなレプリカによる [`ALTER`](../../sql-reference/statements/alter/index.md)、[`OPTIMIZE`](../../sql-reference/statements/optimize.md)、[`TRUNCATE`](../../sql-reference/statements/truncate.md) クエリの実行をどれだけの時間（秒）待機するかを指定します。

設定可能な値:

- `0` — 待機しません。
- 負の整数 — 無制限に待機します。
- 正の整数 — 待機する秒数です。

## restore_replace_external_dictionary_source_to_null \{#restore_replace_external_dictionary_source_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

復元時に外部ディクショナリのソースを Null に置き換えます。テスト用途に便利です。

## restore_replace_external_engines_to_null \{#restore_replace_external_engines_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

テスト目的で使用する設定です。外部接続が開始されないように、すべての外部エンジンを Null に置き換えます。

## restore_replace_external_table_functions_to_null \{#restore_replace_external_table_functions_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

テスト目的で使用します。外部テーブル関数をすべて Null に置き換え、外部接続が開始されないようにします。

## restore_replicated_merge_tree_to_shared_merge_tree \{#restore_replicated_merge_tree_to_shared_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

RESTORE 実行時にテーブルエンジンを Replicated*MergeTree から Shared*MergeTree に置き換えます。

## result&#95;overflow&#95;mode

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

クラウドでのデフォルト値: `throw`

結果セットのサイズがいずれかの制限を超えた場合にどうするかを設定します。

設定可能な値:

* `throw`: 例外をスローする (デフォルト)。
* `break`: クエリの実行を停止して、ソースデータが尽きたかのように
  部分的な結果を返します。

`break` を使用することは `LIMIT` を使用することに似ています。`break` はブロック単位でのみ実行を中断します。これは、返される行数が
[`max_result_rows`](/operations/settings/settings#max_result_rows) より大きく、[`max_block_size`](/operations/settings/settings#max_block_size) の倍数となり、
[`max_threads`](/operations/settings/settings#max_threads) に依存することを意味します。

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


## rewrite_count_distinct_if_with_count_distinct_implementation \{#rewrite_count_distinct_if_with_count_distinct_implementation\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "count_distinct_implementation 設定を使用して countDistinctIf を書き換え"}]}]}/>

[count_distinct_implementation](#count_distinct_implementation) 設定を使用して `countDistcintIf` を書き換えられるようにします。

設定可能な値:

- true — 許可する。
- false — 許可しない。

## rewrite_in_to_join \{#rewrite_in_to_join\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

`x IN サブクエリ` のような式を JOIN に書き換えます。これは、結合順序の変更によってクエリ全体を最適化するのに役立つ場合があります。

## s3_allow_multipart_copy \{#s3_allow_multipart_copy\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "新しい設定。"}]}]}/>

S3 でのマルチパートコピーを許可します。

## s3_allow_parallel_part_upload \{#s3_allow_parallel_part_upload\} 

<SettingsInfoBlock type="Bool" default_value="1" />

s3 のマルチパートアップロードに複数スレッドを使用します。メモリ使用量がわずかに増加する可能性があります。

## s3_check_objects_after_upload \{#s3_check_objects_after_upload\} 

<SettingsInfoBlock type="Bool" default_value="0" />

アップロードされた各オブジェクトに対して S3 へ HEAD リクエストを送信し、アップロードが正常に完了したことを確認します

## s3_connect_timeout_ms \{#s3_connect_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "S3 接続タイムアウト用の新しい専用設定を導入"}]}]}/>

S3 ディスクが接続するホストに対する接続タイムアウト時間。

## s3_create_new_file_on_insert \{#s3_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

s3 エンジンのテーブルで、各 `INSERT` ごとに新しいファイルを作成するかどうかを制御します。有効にすると、各 `INSERT` 時に次のようなパターンのキーを持つ新しい S3 オブジェクトが作成されます。

初回: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` というように続きます。

設定可能な値:

- 0 — `INSERT` クエリは新しいファイルを作成します。ファイルが既に存在しており、かつ s3_truncate_on_insert が設定されていない場合は失敗します。
- 1 — s3_truncate_on_insert が設定されていない場合、`INSERT` クエリは 2 回目以降の挿入からサフィックスを付与して、各 `INSERT` ごとに新しいファイルを作成します。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_disable_checksum \{#s3_disable_checksum\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ファイルを S3 に送信する際にチェックサムを計算しません。これにより、ファイルに対する余分な処理を行わずに済むため、書き込みが高速化されます。通常は安全です。というのも、MergeTree テーブルのデータは ClickHouse によってすでにチェックサムが計算されており、さらに S3 に HTTPS でアクセスする場合、TLS レイヤーがネットワーク経由の転送中の完全性を担保しているためです。S3 上での追加のチェックサムは、多層防御（defense in depth）として機能します。

## s3_ignore_file_doesnt_exist \{#s3_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "要求されたファイルが存在しない場合に、S3 テーブルエンジンで例外をスローする代わりに 0 行を返せるようにする"}]}]}/>

特定のキーを読み込む際に、対象ファイルが存在しない場合でも、その不在を無視します。

設定可能な値:

- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。

## s3_list_object_keys_size \{#s3_list_object_keys_size\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

ListObject リクエストで一度に返される可能性のあるファイル数の最大値

## s3_max_connections \{#s3_max_connections\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

サーバーごとに確立できる最大接続数です。

## s3_max_get_burst \{#s3_max_get_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数の上限に達する前に、同時に発行できる最大リクエスト数。デフォルト値 (0) の場合は `s3_max_get_rps` と同じ値になります。

## s3_max_get_rps \{#s3_max_get_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットリングが発生する前の1秒あたりの S3 GET リクエスト数の上限。0 は無制限を意味します。

## s3_max_inflight_parts_for_one_file \{#s3_max_inflight_parts_for_one_file\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

マルチパートアップロードリクエストで同時にアップロードされるパーツの最大数です。0 を指定した場合は無制限になります。

## s3_max_part_number \{#s3_max_part_number\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "S3 アップロード時のパートの最大番号"}]}]}/>

S3 アップロード時のパートの最大番号。

## s3_max_put_burst \{#s3_max_put_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

1 秒あたりのリクエスト数の上限に達する前に、同時に発行できるリクエストの最大数。デフォルト値は 0 で、`s3_max_put_rps` と同じ値です。

## s3_max_put_rps \{#s3_max_put_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

スロットリングが発生する前の 1 秒あたりの S3 PUT リクエスト数の上限です。0 の場合は無制限を意味します。

## s3_max_single_operation_copy_size \{#s3_max_single_operation_copy_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "S3 における単一コピー操作の最大サイズ"}]}]}/>

S3 における単一コピー操作の最大サイズです。この設定は、s3_allow_multipart_copy が true の場合にのみ有効です。

## s3_max_single_part_upload_size \{#s3_max_single_part_upload_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

S3 へのシングルパートアップロードでアップロードできるオブジェクトの最大サイズ。

## s3_max_single_read_retries \{#s3_max_single_read_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

単一の S3 読み取り処理での最大再試行回数。

## s3_max_unexpected_write_error_retries \{#s3_max_unexpected_write_error_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

S3 への書き込み中に予期しないエラーが発生した場合に再試行する最大回数。

## s3_max_upload_part_size \{#s3_max_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

S3 へのマルチパートアップロードで使用されるパートの最大サイズ。

## s3_min_upload_part_size \{#s3_min_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

S3 へのマルチパートアップロードにおける各パートの最小サイズ。

## s3_request_timeout_ms \{#s3_request_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

S3 との間でデータを送受信する際の無通信タイムアウト。単一の TCP 読み取りまたは書き込み呼び出しがこの時間以上ブロックされた場合は失敗とみなします。

## s3_skip_empty_files \{#s3_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "より良いユーザーエクスペリエンスを提供することを意図しています"}]}]}/>

[S3](../../engines/table-engines/integrations/s3.md) エンジンのテーブルで空のファイルをスキップするかどうかを切り替えます。

指定可能な値:

- 0 — 要求されたフォーマットと互換性のない空ファイルがある場合、`SELECT` は例外をスローします。
- 1 — 空ファイルに対して、`SELECT` は空の結果を返します。

## s3_slow_all_threads_after_network_error \{#s3_slow_all_threads_after_network_error\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

`true` に設定すると、同じバックアップエンドポイントへの S3 リクエストを実行しているすべてのスレッドは、
ソケットタイムアウトなどのリトライ可能なネットワークエラーが、いずれか 1 つの S3 リクエストで発生した後に遅くなります。
`false` に設定すると、各スレッドは他のスレッドとは独立して S3 リクエストのバックオフを処理します。

## s3_strict_upload_part_size \{#s3_strict_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

S3 へのマルチパートアップロード時にアップロードするパートの厳密なサイズを指定します（一部の実装では可変サイズのパートをサポートしていません）。

## s3_throw_on_zero_files_match \{#s3_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

ListObjects リクエストで一致するファイルが 1 つも見つからなかった場合にエラーをスローします

## s3_truncate_on_insert \{#s3_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

s3 エンジンテーブルへの挿入時に、挿入前にファイルを切り詰め（truncate）するかどうかを有効または無効にします。無効になっている場合、対象の S3 オブジェクトが既に存在するときに挿入を試みると、例外がスローされます。

設定可能な値:

- 0 — `INSERT` クエリは新しいファイルを作成するか、ファイルが既に存在し、かつ s3_create_new_file_on_insert が設定されていない場合は失敗します。
- 1 — `INSERT` クエリは既存ファイルの内容を新しいデータで置き換えます。

詳細は[こちら](/integrations/s3#inserting-data)を参照してください。

## s3_upload_part_size_multiply_factor \{#s3_upload_part_size_multiply_factor\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

1 回の書き込みから S3 にアップロードされたパーツ数が s3_multiply_parts_count_threshold に達するたびに、s3_min_upload_part_size をこの係数倍にします。

## s3_upload_part_size_multiply_parts_count_threshold \{#s3_upload_part_size_multiply_parts_count_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

この数のパートが S3 にアップロードされるたびに、`s3_min_upload_part_size` は `s3_upload_part_size_multiply_factor` 倍になります。

## s3_use_adaptive_timeouts \{#s3_use_adaptive_timeouts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`true` に設定すると、すべての S3 リクエストでは、最初の 2 回の試行について送信および受信タイムアウトが短く設定されます。
`false` に設定すると、すべての試行で同一のタイムアウト値が使用されます。

## s3_validate_request_settings \{#s3_validate_request_settings\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "S3 リクエスト設定の検証を無効化できるようにする"}]}]}/>

S3 リクエスト設定の検証を有効にします。
指定可能な値:

- 1 — 設定を検証する。
- 0 — 設定を検証しない。

## s3queue_default_zookeeper_path \{#s3queue_default_zookeeper_path\} 

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

S3Queue エンジン用の ZooKeeper パスのデフォルトプレフィックス

## s3queue_enable_logging_to_s3queue_log \{#s3queue_enable_logging_to_s3queue_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

system.s3queue_log への書き込みを有効にします。値はテーブル設定でテーブルごとに上書きできます。

## s3queue_keeper_fault_injection_probability \{#s3queue_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

S3Queue の Keeper に対するフォールトインジェクションの発生確率。

## s3queue_migrate_old_metadata_to_buckets \{#s3queue_migrate_old_metadata_to_buckets\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

S3Queue テーブルの古いメタデータ構造を新しい構造に移行します

## schema_inference_cache_require_modification_time_for_url \{#schema_inference_cache_require_modification_time_for_url\} 

<SettingsInfoBlock type="Bool" default_value="1" />

URL の最終更新時刻を検証し（`Last-Modified` ヘッダーを持つ URL に対して）、キャッシュされたスキーマを使用します

## schema_inference_use_cache_for_azure \{#schema_inference_use_cache_for_azure\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Azure テーブル関数を使用したスキーマ推論でキャッシュを使用する

## schema_inference_use_cache_for_file \{#schema_inference_use_cache_for_file\} 

<SettingsInfoBlock type="Bool" default_value="1" />

file テーブル関数を使用したスキーマ推論でキャッシュを使用する。

## schema_inference_use_cache_for_hdfs \{#schema_inference_use_cache_for_hdfs\} 

<SettingsInfoBlock type="Bool" default_value="1" />

HDFS テーブル関数を使用する際、スキーマ推論時にキャッシュを使用する

## schema_inference_use_cache_for_s3 \{#schema_inference_use_cache_for_s3\} 

<SettingsInfoBlock type="Bool" default_value="1" />

S3 テーブル関数を使用する際のスキーマ推論でキャッシュを使用するかどうかを制御します。

## schema_inference_use_cache_for_url \{#schema_inference_use_cache_for_url\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`url` テーブル関数を使用したスキーマ推論でキャッシュを使用する

## secondary_indices_enable_bulk_filtering \{#secondary_indices_enable_bulk_filtering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "データスキップインデックスによるフィルタリングのための新しいアルゴリズム"}]}]}/>

インデックスに対する一括フィルタリングアルゴリズムを有効にします。常により良い結果が得られると想定されていますが、互換性および制御のためにこの設定が用意されています。

## select_sequential_consistency \{#select_sequential_consistency\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
この設定は SharedMergeTree と ReplicatedMergeTree で挙動が異なります。SharedMergeTree における `select_sequential_consistency` の挙動の詳細については、[SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) を参照してください。
:::

`SELECT` クエリに対して逐次一貫性を有効または無効にします。`insert_quorum_parallel` が無効化されている必要があります（`insert_quorum_parallel` はデフォルトで有効）。

取り得る値:

- 0 — 無効。
- 1 — 有効。

使用方法

逐次一貫性が有効な場合、ClickHouse は、`insert_quorum` 付きで実行されたすべての以前の `INSERT` クエリのデータを含むレプリカに対してのみ、クライアントが `SELECT` クエリを実行することを許可します。クライアントが部分的なレプリカを参照した場合、ClickHouse は例外をスローします。`SELECT` クエリには、まだレプリカのクォーラムに書き込まれていないデータは含まれません。

`insert_quorum_parallel` が有効（デフォルト）な場合、`select_sequential_consistency` は機能しません。これは、並列な `INSERT` クエリが異なるクォーラムレプリカ集合に書き込まれる可能性があり、単一のレプリカがすべての書き込みを受け取っているという保証がないためです。

関連項目:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \{#send_logs_level\} 

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

サーバーのテキストログのうち、指定した最小レベル以上のものをクライアントに送信します。有効な値: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp \{#send_logs_source_regexp\} 

指定した正規表現に一致するログソース名を持つサーバーのテキストログを送信します。空の場合はすべてのソースが対象です。

## send_profile_events \{#send_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "新しい設定。クライアントに ProfileEvents を送信するかどうかを指定します。"}]}]}/>

[ProfileEvents](/native-protocol/server.md#profile-events) パケットをクライアントに送信するかどうかを制御します。

ProfileEvents を必要としないクライアント向けには、ネットワークトラフィックを削減するために無効化できます。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_progress_in_http_headers \{#send_progress_in_http_headers\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`clickhouse-server` のレスポンスに含まれる `X-ClickHouse-Progress` HTTP レスポンスヘッダーを有効または無効にします。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## send_timeout \{#send_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="300" />

ネットワークにデータを送信する際のタイムアウト時間（秒単位）です。クライアントがデータを送信する必要があるにもかかわらず、この間隔内に1バイトも送信できなかった場合は、例外がスローされます。この設定をクライアント側で指定すると、そのソケットの `receive_timeout` も、対応するサーバー側接続で設定されます。

## serialize_query_plan \{#serialize_query_plan\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

分散処理用にクエリプランをシリアル化します

## session&#95;timezone

<BetaBadge />

現在のセッションまたはクエリの暗黙的なタイムゾーンを設定します。
暗黙的なタイムゾーンとは、明示的にタイムゾーンが指定されていない DateTime/DateTime64 型の値に適用されるタイムゾーンです。
この設定は、グローバルに設定された（サーバーレベルの）暗黙的なタイムゾーンよりも優先されます。
値が &#39;&#39;（空文字列）の場合、現在のセッションまたはクエリの暗黙的なタイムゾーンは [サーバーのタイムゾーン](../server-configuration-parameters/settings.md/#timezone) と同じになります。

セッションのタイムゾーンおよびサーバーのタイムゾーンを取得するには、関数 `timeZone()` および `serverTimeZone()` を使用できます。

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

明示的にタイムゾーンが指定されていない内部の DateTime に、セッションのタイムゾーン &#39;America/Denver&#39; を適用します：

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
`session_timezone` を考慮しない DateTime/DateTime64 のパース関数もあります。これにより、気付きにくい誤りが発生する可能性があります。
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

これは、異なるパース処理パイプラインが使われているために発生します。

* タイムゾーンを明示的に指定せずに最初の `SELECT` クエリで使用されている `toDateTime()` は、`session_timezone` 設定とグローバルタイムゾーンを利用します。
* 2つ目のクエリでは、`DateTime` は `String` からパースされ、既存のカラム `d` の型とタイムゾーンを継承します。そのため、`session_timezone` 設定およびグローバルタイムゾーンは反映されません。

**関連項目**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \{#set_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの制限を超えた場合の動作を設定します。

設定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、入力データが尽きたかのように部分的な結果を返します。

## shared_merge_tree_sync_parts_on_partition_operations \{#shared_merge_tree_sync_parts_on_partition_operations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "新しい設定。デフォルトではパーツは常に同期されます"}]}]}/>

SMT テーブルでの MOVE|REPLACE|ATTACH パーティション操作の後に、データパーツの集合を自動的に同期します。Cloud 環境でのみ利用可能です

## short_circuit_function_evaluation \{#short_circuit_function_evaluation\} 

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

[if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)、[and](/sql-reference/functions/logical-functions#and)、[or](/sql-reference/functions/logical-functions#or) 関数を[ショートサーキット評価](https://en.wikipedia.org/wiki/Short-circuit_evaluation)に従って計算できるようにします。これにより、これらの関数内で複雑な式の実行を最適化し、（想定されていないゼロ除算などの）例外の発生を防ぐのに役立ちます。

設定可能な値:

- `enable` — ショートサーキット評価が適用に適した関数（例外をスローする可能性がある、または計算コストが高い関数）に対してショートサーキット評価を有効にします。
- `force_enable` — すべての関数に対してショートサーキット評価を有効にします。
- `disable` — ショートサーキット評価を無効にします。

## short_circuit_function_evaluation_for_nulls \{#short_circuit_function_evaluation_for_nulls\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "いずれかの引数が NULL の場合に NULL を返す関数について、Nullable な引数を持つ関数を、すべての引数が非 NULL の行に対してのみ実行できるようにする"}]}]}/>

いずれかの引数が NULL の場合に NULL を返す関数の評価を最適化します。関数の引数に含まれる NULL 値の割合が `short_circuit_function_evaluation_for_nulls_threshold` を超えると、システムは行ごとに関数を評価する処理をスキップします。その代わりに、すべての行に対して即座に NULL を返し、不必要な計算を回避します。

## short_circuit_function_evaluation_for_nulls_threshold \{#short_circuit_function_evaluation_for_nulls_threshold\} 

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Nullable 引数を取る関数を、すべての引数が非 NULL の行に対してのみ実行するための NULL 値の比率のしきい値です。設定 `short_circuit_function_evaluation_for_nulls` が有効な場合に適用されます。"}]}]}/>

Nullable 引数を取る関数を、すべての引数が非 NULL の行に対してのみ実行するための NULL 値の比率のしきい値です。設定 `short_circuit_function_evaluation_for_nulls` が有効な場合に適用されます。
NULL 値を含む行数と総行数の比率がこのしきい値を超えた場合、NULL 値を含むこれらの行は評価されません。

## show_data_lake_catalogs_in_system_tables \{#show_data_lake_catalogs_in_system_tables\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "新しい設定"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "デフォルトで system テーブル内のカタログを非表示にする"}]}]}/>

system テーブルにデータレイクのカタログを表示できるようにします。

## show_processlist_include_internal \{#show_processlist_include_internal\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

`SHOW PROCESSLIST` クエリの出力に内部の補助プロセスを表示します。

内部プロセスには、ディクショナリのリロード、リフレッシュ可能なマテリアライズドビューのリロード、`SHOW ...` クエリ内で実行される補助的な `SELECT`、破損したテーブルに対処するために内部的に実行される補助的な `CREATE DATABASE ...` クエリなどが含まれます。

## show_table_uuid_in_table_create_query_if_not_nil \{#show_table_uuid_in_table_create_query_if_not_nil\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Engine=Atomic のテーブルについて、その CREATE クエリでテーブルの UID を表示しないように変更"}]}]}/>

`SHOW TABLE` クエリでの表示内容を設定します。

設定値:

- 0 — クエリはテーブル UUID を表示しません。
- 1 — クエリはテーブル UUID を表示します。

## single_join_prefer_left_table \{#single_join_prefer_left_table\} 

<SettingsInfoBlock type="Bool" default_value="1" />

単一の JOIN で識別子が曖昧な場合は左側のテーブルを優先する

## skip&#95;redundant&#95;aliases&#95;in&#95;udf

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "有効にすると、同じテーブル内の複数のマテリアライズドカラムに対して、同じユーザー定義関数を複数回使用できるようになります。"}]}]} />

冗長なエイリアスは、UDF の利用を簡素化するため、ユーザー定義関数内では使用されず（置き換えられ）ません。

取り得る値:

* 1 — UDF 内でエイリアスをスキップし（置き換え）ます。
* 0 — UDF 内でエイリアスをスキップしません（置き換えません）。

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


## skip_unavailable_shards \{#skip_unavailable_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

利用不能なシャードを暗黙的にスキップする動作を有効または無効にします。

シャードは、すべてのレプリカが利用不能な場合に利用不能と見なされます。レプリカが利用不能と見なされるのは次のような場合です:

- ClickHouse が何らかの理由でレプリカに接続できない。

    レプリカへの接続時、ClickHouse は複数回の接続試行を行います。これらすべての試行が失敗した場合、そのレプリカは利用不能と見なされます。

- DNS を通じてレプリカの名前解決ができない。

    レプリカのホスト名が DNS で名前解決できない場合、次のような状況が考えられます:

    - レプリカのホストに DNS レコードが存在しない。これは動的 DNS を利用するシステム、たとえば [Kubernetes](https://kubernetes.io) のように、ノードがダウンタイム中に名前解決不能となることがあり、それ自体はエラーではない環境で発生し得ます。

    - 設定ミス。ClickHouse の設定ファイルに誤ったホスト名が記述されている。

取り得る値:

- 1 — スキップを有効。

    シャードが利用不能な場合、ClickHouse は部分的なデータに基づいた結果を返し、ノードの可用性に関する問題を報告しません。

- 0 — スキップを無効。

    シャードが利用不能な場合、ClickHouse は例外をスローします。

## sleep_after_receiving_query_ms \{#sleep_after_receiving_query_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler がクエリを受信した後にスリープする時間

## sleep_in_send_data_ms \{#sleep_in_send_data_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler でデータ送信時にスリープする時間

## sleep_in_send_tables_status_ms \{#sleep_in_send_tables_status_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

TCPHandler がテーブルステータス応答を送信する際にスリープする時間

## sort_overflow_mode \{#sort_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

ソート前に受信した行数がいずれかの制限を超えた場合の動作を設定します。

設定可能な値:

- `throw`: 例外をスローします。
- `break`: クエリの実行を停止し、部分的な結果を返します。

## split_intersecting_parts_ranges_into_layers_final \{#split_intersecting_parts_ranges_into_layers_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化時に交差するパートの範囲をレイヤーに分割できるようにする"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化時に交差するパートの範囲をレイヤーに分割できるようにする"}]}]}/>

FINAL 最適化時に交差するパートの範囲をレイヤーに分割する

## split_parts_ranges_into_intersecting_and_non_intersecting_final \{#split_parts_ranges_into_intersecting_and_non_intersecting_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "FINAL 最適化中にパーツ範囲を交差するものと交差しないものに分割できるようにします"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "FINAL 最適化中にパーツ範囲を交差するものと交差しないものに分割できるようにします"}]}]}/>

FINAL 最適化中にパーツ範囲を交差するものと交差しないものに分割します。

## splitby_max_substrings_includes_remaining_string \{#splitby_max_substrings_includes_remaining_string\} 

<SettingsInfoBlock type="Bool" default_value="0" />

引数 `max_substrings` > 0 を指定した関数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) が、結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。

設定可能な値:

- `0` - 結果配列の最後の要素に残りの文字列は含まれません。
- `1` - 結果配列の最後の要素に残りの文字列が含まれます。これは Spark の [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 関数および Python の ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) メソッドの挙動と同じです。

## stop_refreshable_materialized_views_on_startup \{#stop_refreshable_materialized_views_on_startup\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

サーバー起動時に、`SYSTEM STOP VIEWS` を実行した場合と同様に、リフレッシュ可能なマテリアライズドビューのスケジューリングを行わないようにします。起動後に `SYSTEM START VIEWS` または `SYSTEM START VIEW <name>` を使用して手動で開始できます。新しく作成されたビューにも適用されます。リフレッシュ非対応のマテリアライズドビューには影響しません。

## storage_file_read_method \{#storage_file_read_method\} 

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

ストレージファイルからデータを読み込む方法を指定します。`read`、`pread`、`mmap` のいずれかを指定できます。`mmap` メソッドは clickhouse-server には適用されず、clickhouse-local 向けです。

## storage_system_stack_trace_pipe_read_timeout_ms \{#storage_system_stack_trace_pipe_read_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

`system.stack_trace` テーブルをクエリする際に、スレッドから情報を受信するためにパイプから読み取る際の最大待ち時間。  
この設定はテスト目的で使用されるものであり、ユーザーが変更することは想定されていません。

## stream_flush_interval_ms \{#stream_flush_interval_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

タイムアウトが発生した場合、またはスレッドが [max_insert_block_size](#max_insert_block_size) 行を生成した場合に、ストリーミングを使用するテーブルに対して有効になります。

デフォルト値は 7500 です。

値が小さいほど、データがテーブルにフラッシュされる頻度が高くなります。値を小さくしすぎるとパフォーマンスが低下します。

## stream_like_engine_allow_direct_select \{#stream_like_engine_allow_direct_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "デフォルトでは Kafka/RabbitMQ/FileLog に対する直接の SELECT を許可しない"}]}]}/>

Kafka、RabbitMQ、FileLog、Redis Streams、および NATS エンジンに対する直接の SELECT クエリの実行を許可します。マテリアライズドビューがアタッチされている場合、この設定を有効にしていても SELECT クエリは許可されません。

## stream_like_engine_insert_queue \{#stream_like_engine_insert_queue\} 

stream-like エンジンが複数のキューから読み取る場合、書き込みを行う際に、どのキューに挿入するかを 1 つ選択する必要があります。Redis Streams と NATS で使用されます。

## stream_poll_timeout_ms \{#stream_poll_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="500" />

ストリーミングストレージとの間でデータをポーリングする際のタイムアウト。

## system&#95;events&#95;show&#95;zero&#95;values

<SettingsInfoBlock type="Bool" default_value="0" />

[`system.events`](../../operations/system-tables/events.md) から、値が 0 のイベントも選択できるようにする設定です。

一部の監視システムでは、メトリクス値が 0 であっても、各チェックポイントごとにすべてのメトリクス値を送信する必要があります。

設定可能な値:

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


## table_engine_read_through_distributed_cache \{#table_engine_read_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

ClickHouse Cloud でのみ有効です。table engine / table function（S3、Azure など）経由で分散キャッシュからの読み取りを許可します。

## table_function_remote_max_addresses \{#table_function_remote_max_addresses\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

[remote](../../sql-reference/table-functions/remote.md) 関数に対して、パターンから生成されるアドレス数の最大値を設定します。

設定可能な値:

- 正の整数

## tcp_keep_alive_timeout \{#tcp_keep_alive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="290" />

TCP がキープアライブプローブの送信を開始するまでに、接続がアイドル状態で維持される必要がある時間（秒）

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\} 

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "一時データ用にファイルシステムキャッシュ内の領域を予約するために、キャッシュをロック取得するまでの待ち時間"}]}]}/>

一時データ用にファイルシステムキャッシュ内の領域を予約するために、キャッシュをロック取得するまでの待ち時間

## temporary_files_buffer_size \{#temporary_files_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

一時ファイル書き込み用バッファのサイズです。バッファサイズを大きくするとシステムコールの回数は減少しますが、メモリ使用量は増加します。

## temporary_files_codec \{#temporary_files_codec\} 

<SettingsInfoBlock type="String" default_value="LZ4" />

ディスク上でのソートおよび結合処理で使用される一時ファイルに使用する圧縮コーデックを設定します。

指定可能な値:

- LZ4 — [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 圧縮を適用します。
- NONE — 圧縮を適用しません。

## text_index_hint_max_selectivity \{#text_index_hint_max_selectivity\} 

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "新しい設定"}]}]}/>

反転テキストインデックスに基づいて構築されたヒントを使用するかどうかを判断する際に適用されるフィルタの最大選択度。

## text_index_use_bloom_filter \{#text_index_use_bloom_filter\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

テスト目的で、テキストインデックスにおけるブルームフィルターの使用を有効または無効にします。

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert \{#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "依存するマテリアライズドビューでの重複排除は、非同期インサートと同時には動作しません。"}]}]}/>

`deduplicate_blocks_in_dependent_materialized_views` 設定が `async_insert` と同時に有効化されている場合、INSERT クエリ実行時に例外をスローします。これらの機能は同時に動作できないため、この設定により動作の正当性が保証されます。

## throw_if_no_data_to_insert \{#throw_if_no_data_to_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

空の INSERT を許可するか禁止するかを制御します。デフォルトでは有効であり（空の INSERT に対してエラーをスローします）、[`clickhouse-client`](/interfaces/cli) を使用した INSERT または [gRPC インターフェース](/interfaces/grpc) を使用した INSERT にのみ適用されます。

## throw_on_error_from_cache_on_write_operations \{#throw_on_error_from_cache_on_write_operations\} 

<SettingsInfoBlock type="Bool" default_value="0" />

書き込み操作（INSERT、マージ）時のキャッシュ処理で発生するキャッシュエラーを無視します

## throw_on_max_partitions_per_insert_block \{#throw_on_max_partitions_per_insert_block\} 

<SettingsInfoBlock type="Bool" default_value="1" />

`max_partitions_per_insert_block` に到達したときの動作を制御します。

設定可能な値:

- `true`  - 挿入ブロックが `max_partitions_per_insert_block` に到達したときに、例外をスローします。
- `false` - `max_partitions_per_insert_block` に到達したときに、警告をログに記録します。

:::tip
[`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block) を変更する際に、ユーザーへの影響を把握したい場合に便利です。
:::

## throw_on_unsupported_query_inside_transaction \{#throw_on_unsupported_query_inside_transaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

トランザクション内でサポートされていないクエリが使用された場合は例外をスローします

## timeout_before_checking_execution_speed \{#timeout_before_checking_execution_speed\} 

<SettingsInfoBlock type="Seconds" default_value="10" />

指定した秒数の経過後に、実行速度が遅すぎない（`min_execution_speed` を下回らない）ことをチェックします。

## timeout_overflow_mode \{#timeout_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

クエリの実行時間が `max_execution_time` を超えた場合、または推定実行時間が `max_estimated_execution_time` を超える場合にどうするかを設定します。

指定可能な値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を中断し、ソースデータが尽きた場合と同様に部分的な結果を返します。

## timeout_overflow_mode_leaf \{#timeout_overflow_mode_leaf\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

リーフノードでのクエリ実行時間が `max_execution_time_leaf` を超えた場合の動作を設定します。

指定可能な値:

- `throw`: 例外をスローする（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように途中までの結果を返します。

## totals_auto_threshold \{#totals_auto_threshold\} 

<SettingsInfoBlock type="Float" default_value="0.5" />

`totals_mode = 'auto'` のときのしきい値です。
「WITH TOTALS 修飾子」のセクションを参照してください。

## totals_mode \{#totals_mode\} 

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

HAVING 句が存在する場合、また max_rows_to_group_by および group_by_overflow_mode = 'any' が指定されている場合に、TOTALS をどのように計算するかを指定します。
「WITH TOTALS 修飾子」のセクションを参照してください。

## trace_profile_events \{#trace_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`profile events` の各更新時に、`profile event` の名前およびインクリメント値と共にスタックトレースを収集し、それらを [trace_log](/operations/system-tables/trace_log) に送信するかどうかを制御します。

設定値:

- 1 — `profile events` のトレースを有効にします。
- 0 — `profile events` のトレースを無効にします。

## transfer_overflow_mode \{#transfer_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

データ量がいずれかの上限を超えたときの動作を設定します。

取り得る値:

- `throw`: 例外をスローします（デフォルト）。
- `break`: クエリの実行を停止し、ソースデータが尽きたかのように部分的な結果を返します。

## transform&#95;null&#95;in

<SettingsInfoBlock type="Bool" default_value="0" />

[IN](../../sql-reference/operators/in.md) 演算子において、[NULL](/sql-reference/syntax#null) 値同士を等しいものとして扱うかどうかを制御します。

デフォルトでは、`NULL` は「未定義の値」を意味するため、`NULL` 値は比較できません。そのため、`expr = NULL` という比較は常に `false` を返さなければなりません。この設定を有効にすると、`IN` 演算子において `NULL = NULL` が `true` を返すようになります。

指定可能な値:

* 0 — `IN` 演算子での `NULL` 値の比較は `false` を返します。
* 1 — `IN` 演算子での `NULL` 値の比較は `true` を返します。

**例**

`null_in` テーブルを考えます:

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

クエリ:

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "`system.remote_data_paths` をクエリする際にシャドウディレクトリも走査します。"}]}]}/>

`system.remote_data_paths` をクエリする際、実際のテーブルデータに加えて、フリーズされたデータ（シャドウディレクトリ内）も走査します。

## union_default_mode \{#union_default_mode\} 

`SELECT` クエリ結果を結合するモードを設定します。この設定は、`UNION ALL` または `UNION DISTINCT` を明示的に指定せずに [UNION](../../sql-reference/statements/select/union.md) と併用された場合にのみ使用されます。

設定可能な値:

- `'DISTINCT'` — クエリを結合した結果から重複行を削除し、ClickHouse は行を出力します。
- `'ALL'` — クエリを結合した結果から重複行を含むすべての行を ClickHouse は出力します。
- `''` — `UNION` と併用された場合、ClickHouse は例外を発生させます。

[UNION](../../sql-reference/statements/select/union.md) の例を参照してください。

## unknown_packet_in_send_data \{#unknown_packet_in_send_data\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

N 番目のデータパケットの代わりに未知のパケットを送信します

## update_parallel_mode \{#update_parallel_mode\} 

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

`UPDATE` クエリを同時実行する際の動作を制御します。

設定可能な値:

- `sync` - すべての `UPDATE` クエリを逐次実行します。
- `auto` - あるクエリで更新される列と、別のクエリの式で使用される列との間に依存関係がある `UPDATE` クエリのみを逐次実行します。
- `async` - `UPDATE` クエリの同期を行いません。

## update_sequential_consistency \{#update_sequential_consistency\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

`true` の場合、`UPDATE` を実行する前に、パーツ集合が最新バージョンに更新されます。

## use_async_executor_for_materialized_views \{#use_async_executor_for_materialized_views\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

マテリアライズドビューのクエリを非同期で、場合によってはマルチスレッドで実行します。INSERT 実行中のビュー処理を高速化できますが、その分より多くのメモリを消費します。

## use_cache_for_count_from_files \{#use_cache_for_count_from_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

テーブル関数 `file` / `s3` / `url` / `hdfs` / `azureBlobStorage` でファイルに対して `COUNT` を実行する際に、行数をキャッシュできるようにします。

デフォルトで有効です。

## use_client_time_zone \{#use_client_time_zone\} 

<SettingsInfoBlock type="Bool" default_value="0" />

`DateTime` の文字列値を解釈する際に、サーバー側のタイムゾーンではなくクライアント側のタイムゾーンを使用します。

## use_compact_format_in_distributed_parts_names \{#use_compact_format_in_distributed_parts_names\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "デフォルトで Distributed テーブルへの非同期 INSERT にコンパクト形式を使用"}]}]}/>

`Distributed` エンジンを持つテーブルへのバックグラウンド（`distributed_foreground_insert`）INSERT 時に、ブロックの保存にコンパクト形式を使用します。

取りうる値:

- 0 — `user[:password]@host:port#default_database` というディレクトリ形式を使用します。
- 1 — `[shard{shard_index}[_replica{replica_index}]]` というディレクトリ形式を使用します。

:::note

- `use_compact_format_in_distributed_parts_names=0` の場合、クラスタ定義の変更はバックグラウンド INSERT には反映されません。
- `use_compact_format_in_distributed_parts_names=1` の場合、クラスタ定義内のノードの順序を変更すると `shard_index` / `replica_index` が変化するため、注意が必要です。
:::

## use_concurrency_control \{#use_concurrency_control\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "デフォルトで同時実行制御を有効化"}]}]}/>

サーバー側の同時実行制御（グローバルサーバー設定 `concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` を参照）に従います。無効にすると、サーバーが過負荷でも、より多くのスレッドを使用できるようになります（通常の利用では推奨されず、主にテスト用途で必要になります）。

## use_hedged_requests \{#use_hedged_requests\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Hedged Requests 機能をデフォルトで有効化"}]}]}/>

リモートクエリに対して hedged requests ロジックを有効にします。これにより、1 つのクエリに対して複数のレプリカへの接続を同時に確立できます。
レプリカとの既存の接続が `hedged_connection_timeout` 以内に確立されない場合、または `receive_data_timeout` 以内にデータが受信されない場合に、新しい接続が確立されます。クエリは、最初に空でない progress パケットを送信した接続（または、`allow_changing_replica_until_first_data_packet` が有効な場合は最初のデータパケット）を利用し、
それ以外の接続はキャンセルされます。`max_parallel_replicas > 1` のクエリもサポートされます。

デフォルトで有効です。

クラウド環境でのデフォルト値: `1`

## use_hive_partitioning \{#use_hive_partitioning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "この設定をデフォルトで有効にしました。"}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "File、URL、S3、AzureBlobStorage、HDFS エンジンで Hive スタイルのパーティション分割を使用できるようにします。"}]}]}/>

有効にすると、ClickHouse はファイル系テーブルエンジン [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) のパス内にある Hive スタイルのパーティション分割（`/name=value/`）を検出し、クエリ内でパーティション列を仮想列として使用できるようにします。これらの仮想列は、パーティションパス内の名前と同じですが、先頭に `_` が付きます。

## use_iceberg_metadata_files_cache \{#use_iceberg_metadata_files_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

有効にすると、`iceberg` テーブル関数および `iceberg` ストレージで Iceberg メタデータファイルキャッシュを利用できます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_iceberg_partition_pruning \{#use_iceberg_partition_pruning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "デフォルトで Iceberg パーティションプルーニングを有効にします。"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Iceberg パーティションプルーニング用の新しい設定です。"}]}]}/>

Iceberg テーブルで Iceberg パーティションプルーニングを使用するかどうかを制御します

## use_index_for_in_with_subqueries \{#use_index_for_in_with_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

IN 演算子の右側に副問い合わせまたはテーブル式がある場合に、インデックスの使用を試みます。

## use_index_for_in_with_subqueries_max_values \{#use_index_for_in_with_subqueries_max_values\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

`IN` 演算子の右辺にある集合に対し、テーブルインデックスを用いたフィルタリングを行う際の集合サイズの上限を指定します。これにより、大規模なクエリで追加のデータ構造を準備することによるパフォーマンス低下やメモリ使用量の増加を回避できます。0 を指定すると、上限なしを意味します。

## use_join_disjunctions_push_down \{#use_join_disjunctions_push_down\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

OR で結合された JOIN 条件の一部を、対応する入力側へプッシュダウンする（「部分的プッシュダウン」）ことを有効にします。
これにより、ストレージエンジンがより早い段階でフィルタリングを行えるようになり、読み取るデータ量を削減できる場合があります。
この最適化はクエリの意味を保持したまま行われ、各トップレベルの OR ブランチが、対象側に対して少なくとも 1 つの決定的な述語を提供する場合にのみ適用されます。

## use_legacy_to_time \{#use_legacy_to_time\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "新しい設定。toTimeWithFixedDate として動作する、従来の toTime 関数ロジックをユーザーが利用できるようにします。"}]}]}/>

この設定を有効にすると、従来の `toTime` 関数を使用できます。この関数は、日時を特定の固定日付に変換しつつ、時刻部分を保持します。
無効の場合は、新しい `toTime` 関数が使用され、各種データ型の値を `Time` 型に変換します。
従来の関数は、`toTimeWithFixedDate` として常に利用可能です。

## use_page_cache_for_disks_without_file_cache \{#use_page_cache_for_disks_without_file_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "ユーザースペースページキャッシュを追加"}]}]}/>

ファイルシステムキャッシュが有効になっていないリモートディスクに対してユーザースペースページキャッシュを使用します。

## use_page_cache_with_distributed_cache \{#use_page_cache_with_distributed_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

分散キャッシュが使用されている場合に、ユーザー空間のページキャッシュを使用します。

## use_paimon_partition_pruning \{#use_paimon_partition_pruning\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

Paimon テーブル関数に対して Paimon のパーティション プルーニングを使用します。

## use_query_cache \{#use_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

有効化すると、`SELECT` クエリで [query cache](../query-cache.md) を利用できるようになります。パラメータ [enable_reads_from_query_cache](#enable_reads_from_query_cache)
および [enable_writes_to_query_cache](#enable_writes_to_query_cache) により、キャッシュの使用方法をより細かく制御できます。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_query_condition_cache \{#use_query_condition_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "新しい最適化"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "新しい設定。"}]}]}/>

[query condition cache](/operations/query-condition-cache) を有効にします。キャッシュは、`WHERE` 句の条件を満たさないデータパーツ内のグラニュールの範囲を保存し、
後続のクエリで一時的なインデックスとしてこの情報を再利用します。

設定可能な値:

- 0 - 無効
- 1 - 有効

## use_roaring_bitmap_iceberg_positional_deletes \{#use_roaring_bitmap_iceberg_positional_deletes\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Iceberg の位置ベース削除に Roaring Bitmap を使用します。

## use_skip_indexes \{#use_skip_indexes\} 

<SettingsInfoBlock type="Bool" default_value="1" />

クエリ実行時にデータスキップインデックスを使用します。

指定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final \{#use_skip_indexes_if_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

`FINAL` 修飾子付きのクエリを実行する際に、スキップインデックスを使用するかどうかを制御します。

スキップインデックスは、最新データを含む行（グラニュール）を除外してしまう可能性があり、その結果、`FINAL` 修飾子付きクエリで不正確な結果につながる場合があります。この設定を有効にすると、`FINAL` 修飾子が付いている場合でもスキップインデックスが適用され、最近の更新が見落とされるリスクはありますが、パフォーマンスが向上する可能性があります。この設定は、設定 `use_skip_indexes_if_final_exact_mode`（デフォルトで有効）と連動させて有効化する必要があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final_exact_mode \{#use_skip_indexes_if_final_exact_mode\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "設定のデフォルト値の変更"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "FINAL クエリがスキップインデックス使用時にも正しい結果を返せるようにするために導入された設定"}]}]}/>

この設定は、FINAL 句を付けたクエリを実行する際に、スキップインデックスによって返されたグラニュールを、より新しいパーツで展開して正しい結果を返すかどうかを制御します。

スキップインデックスを使用すると、最新データを含む行（グラニュール）が除外されてしまい、誤った結果につながる可能性があります。この設定を有効にすることで、スキップインデックスによって返された範囲と重複する、より新しいパーツをスキャンし、正しい結果が返されるようにできます。スキップインデックスの検索結果に基づく近似結果で問題ないアプリケーションの場合にのみ、この設定を無効化してください。

取りうる値:

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_on_data_read \{#use_skip_indexes_on_data_read\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

データ読み取り時にデータスキップインデックスを使用するかどうかを制御します。

有効にすると、クエリ実行開始前に事前に解析されるのではなく、各データグラニュールを読み取るタイミングでスキップインデックスが動的に評価されます。これにより、クエリ開始時のレイテンシを削減できる場合があります。

設定可能な値:

- 0 — 無効。
- 1 — 有効。

## use_statistics_cache \{#use_statistics_cache\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

クエリで statistics キャッシュを有効にし、各パーツの統計を都度読み込むオーバーヘッドを回避します

## use_structure_from_insertion_table_in_table_functions \{#use_structure_from_insertion_table_in_table_functions\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "Improve using structure from insertion table in table functions"}]}]}/>

スキーマをデータから推論するのではなく、挿入先テーブルの構造を使用します。設定可能な値：0 - 無効、1 - 有効、2 - 自動

## use_text_index_dictionary_cache \{#use_text_index_dictionary_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズされたテキストインデックス辞書ブロックのキャッシュを使用するかどうかを制御します。
テキストインデックス辞書ブロックキャッシュを有効にすると、大量のテキストインデックスクエリを処理する際のレイテンシーを大幅に削減し、スループットを向上させることができます。

## use_text_index_header_cache \{#use_text_index_header_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズされたテキストインデックスヘッダーのキャッシュを使用するかどうかを指定します。
テキストインデックスヘッダーのキャッシュを使用すると、大量のテキストインデックスクエリを処理する場合に、レイテンシを大幅に低減し、スループットを向上させることができます。

## use_text_index_postings_cache \{#use_text_index_postings_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

デシリアライズされたテキストインデックスのポスティングリスト用キャッシュを使用するかどうかを指定します。
テキストインデックスのポスティングリストキャッシュを使用すると、大量のテキストインデックスクエリを処理する際のレイテンシを大幅に削減し、スループットを向上させることができます。

## use_uncompressed_cache \{#use_uncompressed_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

非圧縮ブロックのキャッシュを使用するかどうかを指定します。`0` または `1` を受け付けます。デフォルトは `0`（無効）です。
非圧縮キャッシュ（MergeTree ファミリーのテーブルに対してのみ有効）を使用すると、短いクエリを大量に処理する場合のレイテンシを大幅に削減し、スループットを向上させることができます。短いリクエストを頻繁に送信するユーザー向けには、この設定を有効にしてください。また、[uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) 設定パラメータ（設定ファイルでのみ指定できます）— 非圧縮キャッシュブロックのサイズ — にも注意してください。デフォルト値は 8 GiB です。非圧縮キャッシュは必要に応じてデータで満たされ、使用頻度の低いデータから自動的に削除されます。

ある程度以上のデータ量（100 万行以上）を読み取るクエリに対しては、真に小規模なクエリのためのスペースを確保するために、非圧縮キャッシュは自動的に無効化されます。つまり、`use_uncompressed_cache` 設定は常に `1` に設定したままにしておくことができます。

## use&#95;variant&#95;as&#95;common&#95;type

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "共通型が存在しない場合に、if/multiIf で Variant を使用できるようにする"}]}]} />

引数型の間に共通の型が存在しない場合に、[if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 関数の結果型として `Variant` 型を使用できるようにします。

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


## use_with_fill_by_sorting_prefix \{#use_with_fill_by_sorting_prefix\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "ORDER BY 句で WITH FILL 列の前にある列はソートプレフィックスを構成します。ソートプレフィックスの値が異なる行は、それぞれ独立して値が補われます"}]}]}/>

ORDER BY 句で WITH FILL 列の前にある列はソートプレフィックスを構成します。ソートプレフィックスの値が異なる行は、それぞれ独立して値が補われます

## validate_enum_literals_in_operators \{#validate_enum_literals_in_operators\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "新しい設定"}]}]}/>

有効にすると、`IN`、`NOT IN`、`==`、`!=` などの演算子内で使用される列挙型リテラルを、その列挙型の型と照合して検証し、リテラルが有効な列挙値でない場合は例外をスローします。

## validate_mutation_query \{#validate_mutation_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "デフォルトでミューテーションクエリを検証するための新しい設定。"}]}]}/>

ミューテーションクエリを受け付ける前に検証します。ミューテーションはバックグラウンドで実行されるため、不正なクエリを実行するとミューテーションが停止した状態になり、手動で対処する必要があります。

後方互換性のないバグに遭遇した場合にのみ、この設定を変更してください。

## validate_polygons \{#validate_polygons\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "pointInPolygon 関数で無効なポリゴンが指定された場合、誤った結果を返す代わりにデフォルトで例外をスローするように変更"}]}]}/>

ポリゴンが自己交差または自己接触している場合に、[pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon) 関数で例外をスローするかどうかを有効または無効にします。

設定可能な値:

- 0 — 例外のスローを無効にします。`pointInPolygon` は無効なポリゴンを受け付け、それらに対して誤った結果を返す可能性があります。
- 1 — 例外のスローを有効にします。

## vector_search_filter_strategy \{#vector_search_filter_strategy\} 

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

ベクター検索クエリに `WHERE` 句が含まれている場合、この設定は、`WHERE` 句を先に評価する（プリフィルタリング）か、ベクター類似度インデックスを先に参照する（ポストフィルタリング）かを決定します。指定可能な値は次のとおりです：

- 'auto' - ポストフィルタリング（正確な動作は今後変更される可能性があります）。
- 'postfilter' - まずベクター類似度インデックスを使用して最近傍を特定し、その後に他のフィルタを適用します。
- 'prefilter' - 先に他のフィルタを評価し、その後に総当たり検索で近傍を特定します。

## vector_search_index_fetch_multiplier \{#vector_search_index_fetch_multiplier\} 

**別名**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "設定 'vector_search_postfilter_multiplier' の別名"}]}]}/>

ベクトル類似度インデックスから取得する最近傍の件数を、この値で乗算します。ほかの述語条件によるポストフィルタリングを行う場合、または設定値 `vector_search_with_rescoring = 1` の場合にのみ適用されます。

## vector_search_with_rescoring \{#vector_search_with_rescoring\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

ClickHouse がベクトル類似度インデックスを使用するクエリに対して再スコアリングを実行するかどうかを制御する設定です。
再スコアリングを行わない場合、ベクトル類似度インデックスは、最も類似したマッチを含む行をそのまま返します。
再スコアリングを行う場合、行はグラニュールレベルまで展開され、そのグラニュール内のすべての行が再度検査されます。
多くの場合、再スコアリングは精度向上への効果はわずかである一方で、ベクトル検索クエリのパフォーマンスを大きく低下させます。
注意: 再スコアリングを無効にしつつ parallel replicas を有効にしたクエリは、フォールバックとして再スコアリングを行う場合があります。

## wait_changes_become_visible_after_commit_mode \{#wait_changes_become_visible_after_commit_mode\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

コミット済みの変更が最新のスナップショットで実際に確認できるようになるまで待機します

## wait_for_async_insert \{#wait_for_async_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

true の場合、非同期挿入処理が完了するまで待機します。

## wait_for_async_insert_timeout \{#wait_for_async_insert_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="120" />

非同期挿入処理を待機する際のタイムアウト

## wait_for_window_view_fire_signal_timeout \{#wait_for_window_view_fire_signal_timeout\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

イベント時刻処理において、window view の fire シグナルを待機する際のタイムアウト。

## window_view_clean_interval \{#window_view_clean_interval\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

古いデータを削除するための、ウィンドウビューのクリーン処理間隔（秒）。

## window_view_heartbeat_interval \{#window_view_heartbeat_interval\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

監視クエリが稼働中であることを示すための、秒単位のハートビート間隔。

## workload \{#workload\} 

<SettingsInfoBlock type="String" default_value="default" />

リソースにアクセスするために使用するワークロード名

## write_full_path_in_iceberg_metadata \{#write_full_path_in_iceberg_metadata\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "新しい設定です。"}]}]}/>

完全なパス（`s3://` を含む）を Iceberg のメタデータファイルに書き込みます。

## write_through_distributed_cache \{#write_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud（ClickHouse Cloud 向けの設定）"}]}]}/>

ClickHouse Cloud でのみ有効です。distributed cache を介した書き込みを有効にします（S3 への書き込みも distributed cache を通じて行われます）。

## write_through_distributed_cache_buffer_size \{#write_through_distributed_cache_buffer_size\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "クラウド専用の新しい設定"}]}]}/>

ClickHouse Cloud でのみ有効です。write-through 分散キャッシュ用のバッファサイズを設定します。0 の場合は、分散キャッシュを使用していない場合と同じバッファサイズが使用されます。

## zstd_window_log_max \{#zstd_window_log_max\} 

<SettingsInfoBlock type="Int64" default_value="0" />

ZSTD の最大ウィンドウログを設定できます（MergeTree ファミリーのテーブルエンジンでは使用されません）