---
title: セッション設定
sidebar_label: セッション設定
slug: /operations/settings/settings
toc_max_heading_level: 2
description: テーブルに見つかる設定。
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudAvailableBadge from '@theme/badges/CloudAvailableBadge';

<!-- 自動生成 -->
下記のすべての設定は、テーブル [system.settings](/docs/operations/system-tables/settings) でも利用可能です。これらの設定は [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp) から自動生成されています。

## add_http_cors_header {#add_http_cors_header}



タイプ: Bool

デフォルト値: 0

HTTP CORS ヘッダーを追加します。

## additional_result_filter {#additional_result_filter}



タイプ: String

デフォルト値:

`SELECT` クエリの結果に適用される追加のフィルター式です。この設定はサブクエリには適用されません。

**例**

``` sql
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

## additional_table_filters {#additional_table_filters}



タイプ: Map

デフォルト値: {}

指定されたテーブルから読み取った後に適用される追加のフィルター式です。

**例**

``` sql
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

## aggregate_functions_null_for_empty {#aggregate_functions_null_for_empty}



タイプ: Bool

デフォルト値: 0

クエリ内のすべての集約関数を書き換え、[-OrNull](../../sql-reference/aggregate-functions/combinators.md/#agg-functions-combinator-ornull) 接尾辞を追加します。SQL標準との互換性のために有効にします。この設定は、分散クエリの一貫した結果を得るためのクエリ書き換えを介して実装されています（[count_distinct_implementation](#count_distinct_implementation) 設定に似ています）。

可能な値:

- 0 — 無効。
- 1 — 有効。

**例**

以下の集約関数を含むクエリを考えてみます。
```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

`aggregate_functions_null_for_empty = 0` の場合、以下のような結果になります。
```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

`aggregate_functions_null_for_empty = 1` の場合、結果は次のようになります。
```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```

## aggregation_in_order_max_block_bytes {#aggregation_in_order_max_block_bytes}



タイプ: UInt64

デフォルト値: 50000000

プライマリキーの順序で集約中に蓄積されるブロックの最大サイズ（バイト）です。ブロックサイズを小さくすると、集約の最終的なマージ段階を並列化できるようになります。

## aggregation_memory_efficient_merge_threads {#aggregation_memory_efficient_merge_threads}



タイプ: UInt64

デフォルト値: 0

メモリ効率の良いモードで中間集約結果をマージするために使用するスレッドの数です。大きくなると、より多くのメモリが消費されます。0 は 'max_threads' と同じ意味です。

## allow_aggregate_partitions_independently {#allow_aggregate_partitions_independently}



タイプ: Bool

デフォルト値: 0

パーティションキーがグループ化キーに適合する場合に、別のスレッドでパーティションの独立した集約を有効にします。パーティションの数がコアの数に近く、パーティションのサイズがほぼ同じ場合に有利です。

## allow_archive_path_syntax {#allow_archive_path_syntax}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 1

File/S3 エンジン/テーブル関数は、アーカイブが正しい拡張子を持つ場合に '::' を含むパスを `<archive> :: <file>\` として解析します。

## allow_asynchronous_read_from_io_pool_for_merge_tree {#allow_asynchronous_read_from_io_pool_for_merge_tree}



タイプ: Bool

デフォルト値: 0

バックグラウンド I/O プールを使用して MergeTree テーブルから読み取ります。この設定は、I/O に依存するクエリのパフォーマンスを向上させる可能性があります。

## allow_changing_replica_until_first_data_packet {#allow_changing_replica_until_first_data_packet}



タイプ: Bool

デフォルト値: 0

有効にすると、ヘッジリクエストでは最初のデータパケットを受信するまで新しい接続を開始できます。すでにいくつかの進行がある場合でも、`receive_data_timeout` のタイムアウトが更新されていない場合に限ります。それ以外の場合は、最初に進行した後のレプリカ変更を無効にします。

## allow_create_index_without_type {#allow_create_index_without_type}



タイプ: Bool

デフォルト値: 0

TYPEなしで CREATE INDEX クエリを許可します。クエリは無視されます。SQL との互換性テスト向けに作成されました。

## allow_custom_error_code_in_throwif {#allow_custom_error_code_in_throwif}



タイプ: Bool

デフォルト値: 0

関数 throwIf() にカスタムエラーコードを有効にします。true の場合、スローされた例外には予期しないエラーコードが含まれることがあります。

## allow_ddl {#allow_ddl}



タイプ: Bool

デフォルト値: 1

これが true に設定されている場合、ユーザーは DDL クエリを実行できます。

## allow_deprecated_database_ordinary {#allow_deprecated_database_ordinary}



タイプ: Bool

デフォルト値: 0

非推奨の Ordinary エンジンでデータベースを作成することを許可します。

## allow_deprecated_error_prone_window_functions {#allow_deprecated_error_prone_window_functions}



タイプ: Bool

デフォルト値: 0

誤動作の可能性がある非推奨のウィンドウ関数の使用を許可します（neighbor、runningAccumulate、runningDifferenceStartingWithFirstValue、runningDifference）。

## allow_deprecated_snowflake_conversion_functions {#allow_deprecated_snowflake_conversion_functions}



タイプ: Bool

デフォルト値: 0

`snowflakeToDateTime`、`snowflakeToDateTime64`、`dateTimeToSnowflake`、および `dateTime64ToSnowflake` 関数は非推奨であり、デフォルトで無効になっています。代わりに `snowflakeIDToDateTime`、`snowflakeIDToDateTime64`、`dateTimeToSnowflakeID`、および `dateTime64ToSnowflakeID` 関数を使用してください。

非推奨の関数を再度有効にするには（例えば、移行期間中に）、この設定を `true` に設定してください。

## allow_deprecated_syntax_for_merge_tree {#allow_deprecated_syntax_for_merge_tree}



タイプ: Bool

デフォルト値: 0

非推奨のエンジン定義構文で *MergeTree テーブルを作成することを許可します。

## allow_distributed_ddl {#allow_distributed_ddl}



タイプ: Bool

デフォルト値: 1

これが true に設定されている場合、ユーザーは分散 DDL クエリを実行できます。

## allow_drop_detached {#allow_drop_detached}



タイプ: Bool

デフォルト値: 0

ALTER TABLE ... DROP DETACHED PART[ITION] ... クエリを許可します。

## allow_execute_multiif_columnar {#allow_execute_multiif_columnar}



タイプ: Bool

デフォルト値: 1

multiIf 関数を列指向で実行することを許可します。

## allow_experimental_analyzer {#allow_experimental_analyzer}



タイプ: Bool

デフォルト値: 1

新しいクエリアナライザーを許可します。

## allow_experimental_codecs {#allow_experimental_codecs}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

これが true に設定されている場合、実験的な圧縮コーデックを指定できます（ただし、現在は存在しないため、このオプションは何もしません）。

## allow_experimental_database_iceberg {#allow_experimental_database_iceberg}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

実験的なデータベースエンジン Iceberg を許可します。

## allow_experimental_database_materialized_postgresql {#allow_experimental_database_materialized_postgresql}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

Engine=MaterializedPostgreSQL(...) でデータベースを作成することを許可します。

## allow_experimental_dynamic_type {#allow_experimental_dynamic_type}
<BetaBadge/>

タイプ: Bool

デフォルト値: 0

[Dynamic](../../sql-reference/data-types/dynamic.md) データ型の作成を許可します。

## allow_experimental_full_text_index {#allow_experimental_full_text_index}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

これが true に設定されている場合、実験的な全文検索インデックスを使用することを許可します。

## allow_experimental_funnel_functions {#allow_experimental_funnel_functions}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

ファネル分析のための実験的な関数を有効にします。

## allow_experimental_hash_functions {#allow_experimental_hash_functions}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

実験的なハッシュ関数を有効にします。

## allow_experimental_inverted_index {#allow_experimental_inverted_index}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

これが true に設定されている場合、実験的な逆インデックスを使用することを許可します。

## allow_experimental_join_condition {#allow_experimental_join_condition}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

左テーブルおよび右テーブルの両方からのカラムを含む不等式条件での結合をサポートします。例: `t1.y < t2.y`。

## allow_experimental_join_right_table_sorting {#allow_experimental_join_right_table_sorting}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

これが true に設定され、`join_to_sort_minimum_perkey_rows` および `join_to_sort_maximum_table_rows` の条件が満たされている場合、キーによって右テーブルの並べ替えを行い、左または内部ハッシュ結合のパフォーマンスを向上させます。

## allow_experimental_json_type {#allow_experimental_json_type}
<BetaBadge/>

タイプ: Bool

デフォルト値: 0

[JSON](../../sql-reference/data-types/newjson.md) データ型の作成を許可します。

## allow_experimental_kafka_offsets_storage_in_keeper {#allow_experimental_kafka_offsets_storage_in_keeper}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

ClickHouse Keeper に Kafka 関連のオフセットを保存する実験的な機能を許可します。これが有効な場合、ClickHouse Keeper パスおよびレプリカ名を Kafka テーブルエンジンに指定できます。その結果、通常の Kafka エンジンの代わりに、コミットされたオフセットを主に ClickHouse Keeper に保存する新しいタイプのストレージエンジンが使用されます。

## allow_experimental_kusto_dialect {#allow_experimental_kusto_dialect}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

Kusto Query Language (KQL) - SQL の代替を有効にします。

## allow_experimental_live_view {#allow_experimental_live_view}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

非推奨の LIVE VIEW の作成を許可します。

可能な値:

- 0 — ライブビューワークが無効です。
- 1 — ライブビューワークが有効です。

## allow_experimental_materialized_postgresql_table {#allow_experimental_materialized_postgresql_table}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

MaterializedPostgreSQL テーブルエンジンを使用することを許可します。デフォルトでは無効で、実験的な機能です。

## allow_experimental_nlp_functions {#allow_experimental_nlp_functions}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

自然言語処理のための実験的な関数を有効にします。

## allow_experimental_object_type {#allow_experimental_object_type}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

廃止された Object データ型を許可します。

## allow_experimental_parallel_reading_from_replicas {#allow_experimental_parallel_reading_from_replicas}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

SELECT クエリの実行のために各シェARDから `max_parallel_replicas` の数のレプリカを使用します。読み取りは並列化され、動的に調整されます。0 - 無効、1 - 有効、障害時には静かに無効、2 - 有効、障害時には例外を発生。

## allow_experimental_prql_dialect {#allow_experimental_prql_dialect}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

PRQL - SQL の代替を有効にします。

## allow_experimental_query_deduplication {#allow_experimental_query_deduplication}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

部分 UUID に基づいた SELECT クエリの実験的なデータ重複排除。

## allow_experimental_shared_set_join {#allow_experimental_shared_set_join}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

ClickHouse Cloud のみ。ShareSet と SharedJoin を作成することを許可します。

## allow_experimental_statistics {#allow_experimental_statistics}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

[統計](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table)を定義し、[統計操作](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics)を行うことを許可します。

## allow_experimental_time_series_table {#allow_experimental_time_series_table}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

[TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンを持つテーブルの作成を許可します。

可能な値:

- 0 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは無効です。
- 1 — [TimeSeries](../../engines/table-engines/integrations/time-series.md) テーブルエンジンは有効です。

## allow_experimental_ts_to_grid_aggregate_function {#allow_experimental_ts_to_grid_aggregate_function}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

Prometheus のような時系列のリサンプリング用の実験的な tsToGrid 集約関数です。Cloud のみ。

## allow_experimental_variant_type {#allow_experimental_variant_type}
<BetaBadge/>

タイプ: Bool

デフォルト値: 0

[Variant](../../sql-reference/data-types/variant.md) データ型の作成を許可します。

## allow_experimental_vector_similarity_index {#allow_experimental_vector_similarity_index}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

実験的なベクトル類似性インデックスを許可します。

## allow_experimental_window_view {#allow_experimental_window_view}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

WINDOW VIEW を有効にします。まだ成熟していません。

## allow_general_join_planning {#allow_general_join_planning}



タイプ: Bool

デフォルト値: 1

より一般的な結合計画アルゴリズムを許可し、より複雑な条件を処理できます。ただし、ハッシュ結合のみに対応しています。ハッシュ結合が有効でない場合は、この設定の値に関係なく通常の結合計画アルゴリズムが使用されます。

## allow_get_client_http_header {#allow_get_client_http_header}



タイプ: Bool

デフォルト値: 0

現在の HTTP リクエストのヘッダーの値を取得する `getClientHTTPHeader` 関数の使用を許可します。セキュリティ上の理由からデフォルトでは無効です。なぜなら、`Cookie` のような一部のヘッダーには機密情報が含まれている可能性があるためです。なお、`X-ClickHouse-*` および `Authentication` ヘッダーは常に制限されており、この関数を使用して取得することはできません。

## allow_hyperscan {#allow_hyperscan}



タイプ: Bool

デフォルト値: 1

Hyperscan ライブラリを使用する関数を許可します。潜在的に長いコンパイル時間や過度のリソース使用を回避するために無効にします。

## allow_introspection_functions {#allow_introspection_functions}



タイプ: Bool

デフォルト値: 0

クエリプロファイリングのための [イントロスペクション関数](../../sql-reference/functions/introspection.md) を有効または無効にします。

可能な値:

- 1 — イントロスペクション関数が有効です。
- 0 — イントロスペクション関数が無効です。

**参照**

- [サンプリングクエリプロファイラー](../../operations/optimizing-performance/sampling-query-profiler.md)
- システムテーブル [trace_log](../../operations/system-tables/trace_log.md/#system_tables-trace_log)

## allow_materialized_view_with_bad_select {#allow_materialized_view_with_bad_select}



タイプ: Bool

デフォルト値: 1

存在しないテーブルやカラムを参照する SELECT クエリで CREATE MATERIALIZED VIEW を許可します。構文的には有効である必要があります。リフレッシュ可能な MV には適用されません。SELECT クエリから MV スキーマを推測する必要がある場合（すなわち、CREATE にカラムリストも TO テーブルもない場合）には適用されません。これは、ソーステーブルの前に MV を作成するために使用できます。

## allow_named_collection_override_by_default {#allow_named_collection_override_by_default}



タイプ: Bool

デフォルト値: 1

デフォルトで名前付きコレクションのフィールド上書きを許可します。

## allow_non_metadata_alters {#allow_non_metadata_alters}



タイプ: Bool

デフォルト値: 1

テーブルのメタデータだけでなく、ディスク上のデータにも影響を与える ALTER を実行することを許可します。

## allow_nonconst_timezone_arguments {#allow_nonconst_timezone_arguments}



タイプ: Bool

デフォルト値: 0

toTimeZone()、fromUnixTimestamp*()、snowflakeToDateTime*() のような特定の時間関連関数で非定数のタイムゾーン引数を許可します。

## allow_nondeterministic_mutations {#allow_nondeterministic_mutations}



タイプ: Bool

デフォルト値: 0

ユーザーレベルの設定で、レプリケーションされたテーブル上で非決定性の関数（例: `dictGet`）を使用した変異を許可します。例えば、辞書はノード間で同期が取れないことがあるため、辞書から値を取得する変異はデフォルトではレプリケーションされたテーブルで禁止されています。この設定を有効にすると、この動作が許可され、使用されるデータがすべてのノードで同期していることを保証するのはユーザーの責任となります。

**例**

``` xml
<profiles>
    <default>
        <allow_nondeterministic_mutations>1</allow_nondeterministic_mutations>

        <!-- ... -->
    </default>

    <!-- ... -->

</profiles>
```

## allow_nondeterministic_optimize_skip_unused_shards {#allow_nondeterministic_optimize_skip_unused_shards}



タイプ: Bool

デフォルト値: 0

シャーディングキー内で非決定的（例えば `rand` または `dictGet` のように、後者は更新時にいくつかの問題がある）関数を許可します。

可能な値:

- 0 — 不許可。
- 1 — 許可。

## allow_not_comparable_types_in_comparison_functions {#allow_not_comparable_types_in_comparison_functions}



タイプ: Bool

デフォルト値: 0

`equal/less/greater/etc` のような比較関数に、比較できない型（例えば JSON/Object/AggregateFunction）の使用を許可または制限します。

## allow_not_comparable_types_in_order_by {#allow_not_comparable_types_in_order_by}



タイプ: Bool

デフォルト値: 0

ORDER BY キーに、比較できない型（例えば JSON/Object/AggregateFunction）の使用を許可または制限します。

## allow_prefetched_read_pool_for_local_filesystem {#allow_prefetched_read_pool_for_local_filesystem}



タイプ: Bool

デフォルト値: 0

すべてのパーツがローカルファイルシステムに存在する場合、プリフェッチされたスレッドプールを優先する。

## allow_prefetched_read_pool_for_remote_filesystem {#allow_prefetched_read_pool_for_remote_filesystem}



タイプ: Bool

デフォルト値: 1

すべてのパーツがリモートファイルシステムに存在する場合、プリフェッチされたスレッドプールを優先する。

## allow_push_predicate_ast_for_distributed_subqueries {#allow_push_predicate_ast_for_distributed_subqueries}



タイプ: Bool

デフォルト値: 1

有効なアナライザーを使用した分散サブクエリのAST レベルでプッシュプレディケートを許可します。

## allow_push_predicate_when_subquery_contains_with {#allow_push_predicate_when_subquery_contains_with}



タイプ: Bool

デフォルト値: 1

サブクエリに WITH 句が含まれている場合、プッシュプレディケートを許可します。

## allow_reorder_prewhere_conditions {#allow_reorder_prewhere_conditions}



タイプ: Bool

デフォルト値: 1

WHERE から PREWHERE への条件の移動時に、それらを最適化するために並べ替えることを許可します。

## allow_settings_after_format_in_insert {#allow_settings_after_format_in_insert}



タイプ: Bool

デフォルト値: 0

`INSERT` クエリで `FORMAT` の後に `SETTINGS` を許可するかどうかを制御します。これは使用を推奨されません。なぜなら、SETTINGS の一部が値として解釈される可能性があるからです。

例:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

以下のクエリは、`allow_settings_after_format_in_insert` でのみ動作します。

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

可能な値:

- 0 — 不許可。
- 1 — 許可。

:::note
この設定は、古い構文に依存するユースケースがある場合のみ、後方互換性のために使用してください。
:::

## allow_simdjson {#allow_simdjson}



タイプ: Bool

デフォルト値: 1

AVX2 命令が利用可能な場合に「JSON*」関数で simdjson ライブラリを使用することを許可します。無効にすると rapidjson が使用されます。

## allow_statistics_optimize {#allow_statistics_optimize}
<ExperimentalBadge/>

タイプ: Bool

デフォルト値: 0

クエリを最適化するために統計を使用することを許可します。

## allow_suspicious_codecs {#allow_suspicious_codecs}



タイプ: Bool

デフォルト値: 0

これが true に設定されている場合、無意味な圧縮コーデックを指定することを許可します。

## allow_suspicious_fixed_string_types {#allow_suspicious_fixed_string_types}



タイプ: Bool

デフォルト値: 0

CREATE TABLE ステートメントで、n > 256 の FixedString(n) 型のカラムを作成することを許可します。長さが >= 256 の FixedString は疑わしく、誤用を示す可能性が高いです。

## allow_suspicious_indices {#allow_suspicious_indices}



タイプ: Bool

デフォルト値: 0

同一の式を持つプライマリ/セカンダリインデックスおよびソートキーを拒否します。

## allow_suspicious_low_cardinality_types {#allow_suspicious_low_cardinality_types}



タイプ: Bool

デフォルト値: 0

8 バイトまたはそれ以下の固定サイズのデータ型の LowCardinality（../../sql-reference/data-types/lowcardinality.md）を使用することを許可または制限します。数値データ型および `FixedString(8_bytes_or_less)`。

小さな固定値の場合、LowCardinality を使用することは通常非効率的です。なぜなら、ClickHouse は各行に対して数値インデックスを保存するからです。その結果、次のような問題が発生します。

- ディスクスペースの使用量が増加する可能性があります。
- 辞書サイズによっては RAM 消費が増える可能性があります。
- 余分なコーディング/エンコーディング操作のため、一部の関数が遅くなる可能性があります。

上記の原因により、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) エンジンテーブルのマージ時間が増加する可能性があります。

可能な値:

- 1 — LowCardinality の使用が制限されていない。
- 0 — LowCardinality の使用が制限されている。

## allow_suspicious_primary_key {#allow_suspicious_primary_key}



タイプ: Bool

デフォルト値: 0

MergeTree 用の疑わしい `PRIMARY KEY`/`ORDER BY` を許可します（すなわち SimpleAggregateFunction）。

## allow_suspicious_ttl_expressions {#allow_suspicious_ttl_expressions}



タイプ: Bool

デフォルト値: 0

テーブルのカラムに依存しない TTL 式を拒否します。このことは、大抵の場合、ユーザーエラーを示します。

## allow_suspicious_types_in_group_by {#allow_suspicious_types_in_group_by}



タイプ: Bool

デフォルト値: 0

GROUP BY キーに [Variant](../../sql-reference/data-types/variant.md) および [Dynamic](../../sql-reference/data-types/dynamic.md) タイプを使用することを許可または制限します。

## allow_suspicious_types_in_order_by {#allow_suspicious_types_in_order_by}



タイプ: Bool

デフォルト値: 0

ORDER BY キーに [Variant](../../sql-reference/data-types/variant.md) および [Dynamic](../../sql-reference/data-types/dynamic.md) タイプを使用することを許可または制限します。

## allow_suspicious_variant_types {#allow_suspicious_variant_types}



タイプ: Bool

デフォルト値: 0

CREATE TABLE ステートメントで、似たようなバリアントタイプ（例えば、異なる数値型や日付型）のバリアント型を指定することを許可します。この設定を有効にすると、似たような型の値を扱う際にいくつかの曖昧さが生じる可能性があります。

## allow_unrestricted_reads_from_keeper {#allow_unrestricted_reads_from_keeper}



タイプ: Bool

デフォルト値: 0

システム.zookeeper テーブルから無条件で（パスの条件なしに）読み取ることを許可します。便利ですが、zookeeper にとっては安全ではありません。

## alter_move_to_space_execute_async {#alter_move_to_space_execute_async}



タイプ: Bool

デフォルト値: 0

ALTER TABLE MOVE ... TO [DISK|VOLUME] を非同期的に実行します。

## alter_partition_verbose_result {#alter_partition_verbose_result}



タイプ: Bool

デフォルト値: 0

パーティションおよびパーツへの操作が正常に適用された情報を表示することを有効または無効にします。[ATTACH PARTITION|PART](../../sql-reference/statements/alter/partition.md/#alter_attach-partition) および [FREEZE PARTITION](../../sql-reference/statements/alter/partition.md/#alter_freeze-partition) に適用されます。

可能な値:

- 0 — 冗長性を無効にする。
- 1 — 冗長性を有効にする。

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



タイプ: UInt64

デフォルト値: 1

[ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md) または [TRUNCATE](../../sql-reference/statements/truncate.md) クエリによってレプリカで実行されるアクションを待つように設定します。

可能な値:

- 0 — 待機しない。
- 1 — 自分の実行を待つ。
- 2 — みんなの実行を待つ。

Cloud のデフォルト値: `0`。

:::note
`alter_sync` は `Replicated` テーブルのみに適用されます。非 `Replicated` テーブルの変更には効果がありません。
:::

## analyze_index_with_space_filling_curves {#analyze_index_with_space_filling_curves}



タイプ: Bool

デフォルト値: 1

テーブルに、例えば `ORDER BY mortonEncode(x, y)` または `ORDER BY hilbertEncode(x, y)` などの空間充填曲線がインデックスにある場合、その引数に対する条件があるときには、インデックス分析のために空間充填曲線を使用します。

## analyzer_compatibility_join_using_top_level_identifier {#analyzer_compatibility_join_using_top_level_identifier}



タイプ: Bool

デフォルト値: 0

JOIN USING で識別子をプロジェクションから解決します（例えば、`SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` の場合、`t1.a + 1 = t2.b` で結合されます。一方で `t1.b = t2.b` とはなりません）。

## any_join_distinct_right_table_keys {#any_join_distinct_right_table_keys}



タイプ: Bool

デフォルト値: 0

`ANY INNER|LEFT JOIN` 操作におけるレガシー ClickHouse サーバーの動作を有効にします。

:::note
レガシー `JOIN` 動作に依存する場合のみこの設定を使用してください。
:::

レガシー動作が有効になっている場合:

- `t1 ANY LEFT JOIN t2` および `t2 ANY RIGHT JOIN t1` 操作の結果は等しくなく、ClickHouse は左から右へのテーブルキーの多対一のマッピングロジックを使用します。
- `ANY INNER JOIN` 操作の結果は、`SEMI LEFT JOIN` 操作と同様に左テーブルのすべての行を含みます。

レガシー動作が無効になっている場合:

- `t1 ANY LEFT JOIN t2` および `t2 ANY RIGHT JOIN t1` 操作の結果は等しくなり、ClickHouse は `ANY RIGHT JOIN` 操作に多対一のキーのマッピングを提供するロジックを使用します。
- `ANY INNER JOIN` 操作の結果は、左テーブルと右テーブルの両方からの各キーあたりの1行を含みます。

可能な値:

- 0 — レガシー動作が無効です。
- 1 — レガシー動作が有効です。

参照:

- [JOIN 厳密さ](../../sql-reference/statements/select/join.md/#join-settings)
## apply_deleted_mask {#apply_deleted_mask}



タイプ: Bool

デフォルト値: 1

軽量削除で削除された行をフィルタリングすることを有効にします。無効にすると、クエリはこれらの行を読み取ることができます。これはデバッグや「元に戻す」シナリオに便利です。

## apply_mutations_on_fly {#apply_mutations_on_fly}



タイプ: Bool

デフォルト値: 0

true の場合、データ部分にマテリアライズされていない変異（UPDATE および DELETE）が SELECT に適用されます。

## apply_settings_from_server {#apply_settings_from_server}



タイプ: Bool

デフォルト値: 1

クライアントがサーバーからの設定を受け入れるべきかどうか。

これはクライアント側での操作にのみ影響し、特に INSERT 入力データの解析やクエリ結果のフォーマットに影響します。クエリの実行のほとんどはサーバーで行われ、この設定には影響されません。

通常、この設定はユーザープロファイル（users.xml や `ALTER USER` のようなクエリ）で設定されるべきであり、クライアントを通じては設定されるべきではありません（クライアントコマンドライン引数、`SET` クエリ、または `SELECT` クエリの `SETTINGS` セクション）。クライアントからは誤って false に変更することができますが、true に変更することはできません（サーバーはユーザープロファイルが `apply_settings_from_server = false` の場合、設定をクライアントに送信しません）。

初めは (24.12) サーバー設定 (`send_settings_to_client`) がありましたが、後にこのクライアント設定に置き換えられました、より使いやすくするために。

## asterisk_include_alias_columns {#asterisk_include_alias_columns}



タイプ: Bool

デフォルト値: 0

ワイルドカードクエリ（`SELECT *`）のために [ALIAS](../../sql-reference/statements/create/table.md/#alias) カラムを含めます。

可能な値:

- 0 - 無効
- 1 - 有効

## asterisk_include_materialized_columns {#asterisk_include_materialized_columns}



タイプ: Bool

デフォルト値: 0

ワイルドカードクエリ（`SELECT *`）のために [MATERIALIZED](../../sql-reference/statements/create/table.md/#materialized) カラムを含めます。

可能な値:

- 0 - 無効
- 1 - 有効

## async_insert {#async_insert}



タイプ: Bool

デフォルト値: 0

true の場合、INSERT クエリからのデータはキューに保存され、後でバックグラウンドでテーブルにフラッシュされます。wait_for_async_insert が false の場合、INSERT クエリはほぼ瞬時に処理されます。それ以外の場合、クライアントはデータがテーブルにフラッシュされるまで待機します。

## async_insert_busy_timeout_decrease_rate {#async_insert_busy_timeout_decrease_rate}



タイプ: Double

デフォルト値: 0.2

適応型非同期挿入タイムアウトが減少する指数的成長率。

## async_insert_busy_timeout_increase_rate {#async_insert_busy_timeout_increase_rate}



タイプ: Double

デフォルト値: 0.2

適応型非同期挿入タイムアウトが増加する指数的成長率。
```
## async_insert_busy_timeout_max_ms {#async_insert_busy_timeout_max_ms}

Type: ミリ秒

Default value: 200

最初のデータが現れてから、クエリごとに収集されたデータをダンプするまでの最大待機時間です。

## async_insert_busy_timeout_min_ms {#async_insert_busy_timeout_min_ms}

Type: ミリ秒

Default value: 50

async_insert_use_adaptive_busy_timeout が有効になっている場合、最初のデータが現れてからクエリごとに収集されたデータをダンプするまでの最小待機時間です。この値は適応アルゴリズムの初期値としても機能します。

## async_insert_deduplicate {#async_insert_deduplicate}

Type: Bool

Default value: 0

レプリケートテーブルでの非同期 INSERT クエリ用に、挿入ブロックの重複排除を行うべきかを指定します。

## async_insert_max_data_size {#async_insert_max_data_size}

Type: UInt64

Default value: 10485760

挿入される前のクエリごとに収集される未解析データの最大サイズ（バイト単位）です。

## async_insert_max_query_number {#async_insert_max_query_number}

Type: UInt64

Default value: 450

挿入される前の挿入クエリの最大数です。

## async_insert_poll_timeout_ms {#async_insert_poll_timeout_ms}

Type: ミリ秒

Default value: 10

非同期挿入キューからデータをポーリングするためのタイムアウトです。

## async_insert_use_adaptive_busy_timeout {#async_insert_use_adaptive_busy_timeout}

Type: Bool

Default value: 1

true に設定されている場合、非同期挿入用に適応型ビジータイムアウトを使用します。

## async_query_sending_for_remote {#async_query_sending_for_remote}

Type: Bool

Default value: 1

リモートクエリを実行中に非同期接続の作成とクエリの送信を有効にします。

デフォルトで有効です。

## async_socket_for_remote {#async_socket_for_remote}

Type: Bool

Default value: 1

リモートクエリを実行中にソケットから非同期読み込みを有効にします。

デフォルトで有効です。

## azure_allow_parallel_part_upload {#azure_allow_parallel_part_upload}

Type: Bool

Default value: 1

Azureマルチパートアップロードに複数スレッドを使用します。

## azure_check_objects_after_upload {#azure_check_objects_after_upload}

Type: Bool

Default value: 0

Azure BLOB ストレージにアップロードされた各オブジェクトを検査し、アップロードが成功したことを確認します。

## azure_create_new_file_on_insert {#azure_create_new_file_on_insert}

Type: Bool

Default value: 0

Azureエンジンテーブルでの各挿入時に新しいファイルを作成するかどうかを有効または無効にします。

## azure_ignore_file_doesnt_exist {#azure_ignore_file_doesnt_exist}

Type: Bool

Default value: 0

特定のキーを読み取る際にファイルが存在しない場合、その欠如を無視します。

可能な値:
- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外を投げます。

## azure_list_object_keys_size {#azure_list_object_keys_size}

Type: UInt64

Default value: 1000

ListObject リクエストによって一度に返されることができるファイルの最大数です。

## azure_max_blocks_in_multipart_upload {#azure_max_blocks_in_multipart_upload}

Type: UInt64

Default value: 50000

Azure におけるマルチパートアップロードの最大ブロック数です。

## azure_max_inflight_parts_for_one_file {#azure_max_inflight_parts_for_one_file}

Type: UInt64

Default value: 20

マルチパートアップロードリクエストにおける、同時にロードされるパーツの最大数です。0は無制限を意味します。

## azure_max_single_part_copy_size {#azure_max_single_part_copy_size}

Type: UInt64

Default value: 268435456

Azure BLOB ストレージに対して、シングルパートコピーを使用してコピーされるオブジェクトの最大サイズです。

## azure_max_single_part_upload_size {#azure_max_single_part_upload_size}

Type: UInt64

Default value: 104857600

Azure BLOB ストレージに対して、シングルパートアップロードを使用してアップロードされるオブジェクトの最大サイズです。

## azure_max_single_read_retries {#azure_max_single_read_retries}

Type: UInt64

Default value: 4

単一の Azure BLOB ストレージ読み込み中の最大リトライ回数です。

## azure_max_unexpected_write_error_retries {#azure_max_unexpected_write_error_retries}

Type: UInt64

Default value: 4

Azure BLOB ストレージ書き込み中の予期しないエラーが発生した場合の最大リトライ回数です。

## azure_max_upload_part_size {#azure_max_upload_part_size}

Type: UInt64

Default value: 5368709120

Azure BLOB ストレージへのマルチパートアップロード中のパーツの最大サイズです。

## azure_min_upload_part_size {#azure_min_upload_part_size}

Type: UInt64

Default value: 16777216

Azure BLOB ストレージへのマルチパートアップロード中のパーツの最小サイズです。

## azure_sdk_max_retries {#azure_sdk_max_retries}

Type: UInt64

Default value: 10

Azure SDK における最大リトライ回数です。

## azure_sdk_retry_initial_backoff_ms {#azure_sdk_retry_initial_backoff_ms}

Type: UInt64

Default value: 10

Azure SDK におけるリトライ間の最小バックオフ時間（ミリ秒単位）です。

## azure_sdk_retry_max_backoff_ms {#azure_sdk_retry_max_backoff_ms}

Type: UInt64

Default value: 1000

Azure SDK におけるリトライ間の最大バックオフ時間（ミリ秒単位）です。

## azure_skip_empty_files {#azure_skip_empty_files}

Type: Bool

Default value: 0

S3エンジンにおける空のファイルをスキップするかどうかを有効または無効にします。

可能な値:
- 0 — 空のファイルがリクエストされた形式と互換性がない場合、`SELECT` は例外を投げます。
- 1 — 空のファイルに対して`SELECT` は空の結果を返します。

## azure_strict_upload_part_size {#azure_strict_upload_part_size}

Type: UInt64

Default value: 0

Azure BLOB ストレージへのマルチパートアップロード中のパーツの正確なサイズです。

## azure_throw_on_zero_files_match {#azure_throw_on_zero_files_match}

Type: Bool

Default value: 0

パターン展開ルールに従ってマッチしたファイルがゼロの場合、エラーを投げます。

可能な値:
- 1 — `SELECT` は例外を投げます。
- 0 — `SELECT` は空の結果を返します。

## azure_truncate_on_insert {#azure_truncate_on_insert}

Type: Bool

Default value: 0

Azureエンジンテーブルでの挿入前にトランケートを有効または無効にします。

## azure_upload_part_size_multiply_factor {#azure_upload_part_size_multiply_factor}

Type: UInt64

Default value: 2

Azure BLOB ストレージに対して、1回の書き込みから azure_multiply_parts_count_threshold パーツがアップロードされるたびに azure_min_upload_part_size にこの係数を掛けます。

## azure_upload_part_size_multiply_parts_count_threshold {#azure_upload_part_size_multiply_parts_count_threshold}

Type: UInt64

Default value: 500

この数のパーツが Azure BLOB ストレージにアップロードされるたびに、azure_min_upload_part_size に azure_upload_part_size_multiply_factor を掛けます。

## backup_restore_batch_size_for_keeper_multi {#backup_restore_batch_size_for_keeper_multi}

Type: UInt64

Default value: 1000

バックアップまたはリストア時に [Zoo]Keeper に対するマルチリクエストの最大バッチサイズです。

## backup_restore_batch_size_for_keeper_multiread {#backup_restore_batch_size_for_keeper_multiread}

Type: UInt64

Default value: 10000

バックアップまたはリストア時に [Zoo]Keeper に対するマルチリードリクエストの最大バッチサイズです。

## backup_restore_failure_after_host_disconnected_for_seconds {#backup_restore_failure_after_host_disconnected_for_seconds}

Type: UInt64

Default value: 3600

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作中にホストがこの時間分、ZooKeeper の一時的な 'alive' ノードを再作成しない場合、バックアップまたはリストア全体が失敗と見なされます。
この値は、ホストが障害からZooKeeperに再接続するのに合理的な時間よりも大きくする必要があります。
ゼロは無制限を意味します。

## backup_restore_finish_timeout_after_error_sec {#backup_restore_finish_timeout_after_error_sec}

Type: UInt64

Default value: 180

イニシエーターが他のホストが「エラー」ノードに反応し、現在の BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作での作業を停止するのを待つ時間です。

## backup_restore_keeper_fault_injection_probability {#backup_restore_keeper_fault_injection_probability}

Type: Float

Default value: 0

バックアップまたはリストア中に keeper リクエストで故障が発生する確率です。有効な値は [0.0f, 1.0f] の範囲です。

## backup_restore_keeper_fault_injection_seed {#backup_restore_keeper_fault_injection_seed}

Type: UInt64

Default value: 0

0 - ランダムシード、それ以外は設定値。

## backup_restore_keeper_max_retries {#backup_restore_keeper_max_retries}

Type: UInt64

Default value: 1000

BACKUP または RESTORE 操作中の [Zoo]Keeper 操作に対する最大リトライ回数です。
一時的な [Zoo]Keeper の障害により、全体の操作が失敗しないように十分大きくする必要があります。

## backup_restore_keeper_max_retries_while_handling_error {#backup_restore_keeper_max_retries_while_handling_error}

Type: UInt64

Default value: 20

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作のエラー処理中の [Zoo]Keeper 操作に対する最大リトライ回数です。

## backup_restore_keeper_max_retries_while_initializing {#backup_restore_keeper_max_retries_while_initializing}

Type: UInt64

Default value: 20

BACKUP ON CLUSTER または RESTORE ON CLUSTER 操作の初期化中の [Zoo]Keeper 操作に対する最大リトライ回数です。

## backup_restore_keeper_retry_initial_backoff_ms {#backup_restore_keeper_retry_initial_backoff_ms}

Type: UInt64

Default value: 100

バックアップまたはリストア中の [Zoo]Keeper 操作に対する初期バックオフタイムアウトです。

## backup_restore_keeper_retry_max_backoff_ms {#backup_restore_keeper_retry_max_backoff_ms}

Type: UInt64

Default value: 5000

バックアップまたはリストア中の [Zoo]Keeper 操作に対する最大バックオフタイムアウトです。

## backup_restore_keeper_value_max_size {#backup_restore_keeper_value_max_size}

Type: UInt64

Default value: 1048576

バックアップ中の [Zoo]Keeper のノードのデータの最大サイズです。

## backup_restore_s3_retry_attempts {#backup_restore_s3_retry_attempts}

Type: UInt64

Default value: 1000

Aws::Client::RetryStrategy の設定で、Aws::Client は自身でリトライします。0 はリトライしないことを意味します。これはバックアップ/リストアのためにのみ適用されます。

## cache_warmer_threads {#cache_warmer_threads}

Type: UInt64

Default value: 4

ClickHouse Cloud のみ利用可能。ファイルキャッシュに新しいデータパーツを投機的にダウンロードするためのバックグラウンドスレッドの数です。 [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) を有効にした場合。ゼロにすると無効になります。

## calculate_text_stack_trace {#calculate_text_stack_trace}

Type: Bool

Default value: 1

クエリ実行中に例外が発生した場合にテキストスタックトレースを計算します。これはデフォルトです。大量の間違ったクエリが実行されると、シンボルのルックアップが必要になり、ファジングテストが遅くなる可能性があります。通常の場合、このオプションを無効にしないでください。

## cancel_http_readonly_queries_on_client_close {#cancel_http_readonly_queries_on_client_close}

Type: Bool

Default value: 0

クライアントが応答を待たずに接続を閉じると、HTTP 読み取り専用クエリ（例： SELECT）をキャンセルします。

Cloud デフォルト値: `1`。

## cast_ipv4_ipv6_default_on_conversion_error {#cast_ipv4_ipv6_default_on_conversion_error}

Type: Bool

Default value: 0

CAST 演算子を IPv4 に、CAST 演算子を IPV6 型に変換するとき、toIPv4、toIPv6 関数は変換エラー時に例外を投げる代わりにデフォルト値を返します。

## cast_keep_nullable {#cast_keep_nullable}

Type: Bool

Default value: 0

[CAST](../../sql-reference/functions/type-conversion-functions.md/#castx-t) 操作で `Nullable` データ型を保持するかどうかを有効または無効にします。

設定が有効で、`CAST` 関数の引数が `Nullable` である場合、結果も `Nullable` 型に変換されます。設定が無効である場合、結果は常に正確に宛先型になります。

可能な値:

- 0 — `CAST` 結果は指定された宛先型と正確に一致します。
- 1 — 引数型が `Nullable` の場合、`CAST` 結果は `Nullable(DestinationDataType)` に変換されます。

**例**

次のクエリは宛先データ型に正確に一致します：

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

次のクエリは宛先データ型の `Nullable` 修飾が適用されます：

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

**参照**

- [CAST](../../sql-reference/functions/type-conversion-functions.md/#type_conversion_function-cast) 関数

## cast_string_to_dynamic_use_inference {#cast_string_to_dynamic_use_inference}

Type: Bool

Default value: 0

String から Dynamic への変換中に型推論を使用します。

## check_query_single_value_result {#check_query_single_value_result}

Type: Bool

Default value: 1

`MergeTree` ファミリーエンジンの [CHECK TABLE](../../sql-reference/statements/check-table.md/#checking-mergetree-tables) クエリ結果の詳細レベルを定義します。

可能な値：

- 0 — クエリはテーブルの個々のデータ部分ごとにチェック状態を表示します。
- 1 — クエリは一般的なテーブルチェック状態を表示します。

## check_referential_table_dependencies {#check_referential_table_dependencies}

Type: Bool

Default value: 0

DDL クエリ（DROP TABLE または RENAME など）が参照依存関係を壊さないことを確認します。

## check_table_dependencies {#check_table_dependencies}

Type: Bool

Default value: 1

DDL クエリ（DROP TABLE または RENAME など）が依存関係を壊さないことを確認します。

## checksum_on_read {#checksum_on_read}

Type: Bool

Default value: 1

読み取り時にチェックサムを検証します。デフォルトで有効になっており、運用環境では常に有効にしておくべきです。この設定を無効にしても利点はありません。実験やベンチマークでのみ使用される可能性があります。この設定は MergeTree ファミリーのテーブルにのみ適用され、他のテーブルエンジンおよびネットワーク経由でデータを受信する際には常にチェックサムが検証されます。

## cloud_mode {#cloud_mode}

Type: Bool

Default value: 0

クラウドモードです。

## cloud_mode_database_engine {#cloud_mode_database_engine}

Type: UInt64

Default value: 1

クラウドで許可されているデータベースエンジンです。1 - Replicated データベースを使用するために DDL を書き換えます、2 - Shared データベースを使用するために DDL を書き換えます。

## cloud_mode_engine {#cloud_mode_engine}

Type: UInt64

Default value: 1

クラウドで許可されているエンジンファミリーです。0 - すべてを許可、1 - *ReplicatedMergeTree を使用するために DDL を書き換えます、2 - SharedMergeTree を使用するために DDL を書き換えます。UInt64 で公共部分を最小化します。

## cluster_for_parallel_replicas {#cluster_for_parallel_replicas}
<BetaBadge/>

Type: String

Default value:

現在のサーバーが位置するシャードのためのクラスターです。

## collect_hash_table_stats_during_aggregation {#collect_hash_table_stats_during_aggregation}

Type: Bool

Default value: 1

メモリアロケーションを最適化するためにハッシュテーブルの統計を収集することを有効にします。

## collect_hash_table_stats_during_joins {#collect_hash_table_stats_during_joins}

Type: Bool

Default value: 1

メモリアロケーションを最適化するためにハッシュテーブルの統計を収集することを有効にします。

## compatibility {#compatibility}

Type: String

Default value:

`compatibility` 設定は、指定された以前の ClickHouse のバージョンに基づいて、ClickHouse がデフォルト設定を使用することを引き起こします。

設定がデフォルト以外の値に設定されている場合、それらの設定が尊重されます（変更されていない設定のみが `compatibility` 設定の影響を受けます）。

この設定は ClickHouse のバージョン番号を文字列として取ります。例えば、`22.3`、`22.8`。空の値は、この設定が無効であることを意味します。

デフォルトで無効です。

:::note
ClickHouse Cloud では、互換性の設定は ClickHouse Cloud サポートによって設定される必要があります。設定してもらうために [お問い合わせ](https://clickhouse.cloud/support) を開いてください。
:::

## compatibility_ignore_auto_increment_in_create_table {#compatibility_ignore_auto_increment_in_create_table}

Type: Bool

Default value: 0

真の場合、カラム宣言の AUTO_INCREMENT キーワードを無視します。そうでなければエラーを返します。MySQL からの移行を簡素化します。

## compatibility_ignore_collation_in_create_table {#compatibility_ignore_collation_in_create_table}

Type: Bool

Default value: 1

テーブル作成時の照合の互換性を無視します。

## compile_aggregate_expressions {#compile_aggregate_expressions}

Type: Bool

Default value: 1

集約関数をネイティブコードに JIT コンパイルすることを有効または無効にします。この設定を有効にするとパフォーマンスが改善される可能性があります。

可能な値：

- 0 — 集約は JIT コンパイルなしで行われます。
- 1 — 集約は JIT コンパイルを使用して行われます。

**参照**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions {#compile_expressions}

Type: Bool

Default value: 0

一部のスカラー関数と演算子をネイティブコードにコンパイルします。LLVM コンパイラインフラストラクチャのバグにより、AArch64 マシンでは nullptr の逆参照を引き起こすことが知られており、その結果サーバーがクラッシュする可能性があります。この設定を有効にしないでください。

## compile_sort_description {#compile_sort_description}

Type: Bool

Default value: 1

ソート記述をネイティブコードにコンパイルします。

## connect_timeout {#connect_timeout}

Type: 秒

Default value: 10

レプリカがない場合の接続タイムアウトです。

## connect_timeout_with_failover_ms {#connect_timeout_with_failover_ms}

Type: ミリ秒

Default value: 1000

クラスタ定義で ‘shard’ と ‘replica’ セクションが使用される場合の、分散テーブルエンジンのリモートサーバーへの接続時のタイムアウト（ミリ秒単位）です。
失敗した場合、さまざまなレプリカに接続を試みます。

## connect_timeout_with_failover_secure_ms {#connect_timeout_with_failover_secure_ms}

Type: ミリ秒

Default value: 1000

健康な最初のレプリカを選択するための接続タイムアウト（セキュア接続用）です。

## connection_pool_max_wait_ms {#connection_pool_max_wait_ms}

Type: ミリ秒

Default value: 0

接続プールが満杯のときの接続待機時間（ミリ秒単位）です。

可能な値：

- 正の整数。
- 0 — 無限タイムアウト。

## connections_with_failover_max_tries {#connections_with_failover_max_tries}

Type: UInt64

Default value: 3

分散テーブルエンジンの各レプリカへの接続試行の最大回数です。

## convert_query_to_cnf {#convert_query_to_cnf}

Type: Bool

Default value: 0

`true` に設定されると、`SELECT` クエリは結合標準形 (CNF) に変換されます。クエリを CNF に書き換えることで、実行が速くなるシナリオがあります（この [GitHub イシュー](https://github.com/ClickHouse/ClickHouse/issues/11749) を参照してください）。

例えば、次の `SELECT` クエリが変更されていないことに注意してください（デフォルトの動作）：

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

結果は以下の通りです：

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

`convert_query_to_cnf` を `true` に設定して変更点を見てみましょう：

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

`WHERE` 句が CNF に書き換えられていることに注意してくださいが、結果セットは同一で、ブール論理は変わりません：

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

可能な値： true、false

## count_distinct_implementation {#count_distinct_implementation}

Type: String

Default value: uniqExact

[`COUNT(DISTINCT ...)`](../../sql-reference/aggregate-functions/reference/count.md/#agg_function-count) 構文を実行するために使用する `uniq*` 関数を指定します。

可能な値：

- [uniq](../../sql-reference/aggregate-functions/reference/uniq.md/#agg_function-uniq)
- [uniqCombined](../../sql-reference/aggregate-functions/reference/uniqcombined.md/#agg_function-uniqcombined)
- [uniqCombined64](../../sql-reference/aggregate-functions/reference/uniqcombined64.md/#agg_function-uniqcombined64)
- [uniqHLL12](../../sql-reference/aggregate-functions/reference/uniqhll12.md/#agg_function-uniqhll12)
- [uniqExact](../../sql-reference/aggregate-functions/reference/uniqexact.md/#agg_function-uniqexact)

## count_distinct_optimization {#count_distinct_optimization}

Type: Bool

Default value: 0

カウントディスティンクトをGROUP BY のサブクエリに書き換えます。

## create_if_not_exists {#create_if_not_exists}

Type: Bool

Default value: 0

`CREATE` ステートメントに対してデフォルトで `IF NOT EXISTS` を有効にします。この設定または `IF NOT EXISTS` が指定され、この名前のテーブルが既に存在する場合、例外はスローされません。

## create_index_ignore_unique {#create_index_ignore_unique}

Type: Bool

Default value: 0

CREATE UNIQUE INDEX の UNIQUE キーワードを無視します。SQL 互換性テスト用に作成されました。

## create_replicated_merge_tree_fault_injection_probability {#create_replicated_merge_tree_fault_injection_probability}

Type: Float

Default value: 0

ZooKeeperでメタデータを作成した後にテーブル作成中に障害注入が発生する確率です。

## create_table_empty_primary_key_by_default {#create_table_empty_primary_key_by_default}

Type: Bool

Default value: 0

ORDER BY および PRIMARY KEY が指定されていない場合に空の主キーを持つ *MergeTree テーブルを作成することを許可します。

## cross_join_min_bytes_to_compress {#cross_join_min_bytes_to_compress}

Type: UInt64

Default value: 1073741824

CROSS JOIN で圧縮するための最小ブロックサイズです。ゼロ値はこの閾値を無効にします。このブロックは、行またはバイトのいずれかの閾値に達したときに圧縮されます。

## cross_join_min_rows_to_compress {#cross_join_min_rows_to_compress}

Type: UInt64

Default value: 10000000

CROSS JOIN で圧縮するための最小行数です。ゼロ値はこの閾値を無効にします。このブロックは、行またはバイトのいずれかの閾値に達したときに圧縮されます。

## data_type_default_nullable {#data_type_default_nullable}

Type: Bool

Default value: 0

カラム定義に明示的修飾子 [NULL または NOT NULL](../../sql-reference/statements/create/table.md/#null-modifiers) がない場合、データ型が [Nullable](../../sql-reference/data-types/nullable.md/#data_type-nullable) になります。

可能な値：

- 1 — カラム定義のデータ型がデフォルトで `Nullable` に設定されます。
- 0 — カラム定義のデータ型がデフォルトで `Nullable` ではないように設定されます。

## database_atomic_wait_for_drop_and_detach_synchronously {#database_atomic_wait_for_drop_and_detach_synchronously}

Type: Bool

Default value: 0

すべての `DROP` および `DETACH` クエリに修飾子 `SYNC` を追加します。

可能な値：

- 0 — クエリは遅延して実行されます。
- 1 — クエリは遅延なしで実行されます。

## database_replicated_allow_explicit_uuid {#database_replicated_allow_explicit_uuid}

Type: UInt64

Default value: 0

0 - レプリケートデータベースのテーブルに対してUUIDを明示的に指定することを許可しません。1 - 許可します。2 - 許可しますが、指定されたUUIDを無視し、代わりにランダムなUUIDを生成します。

## database_replicated_allow_heavy_create {#database_replicated_allow_heavy_create}

Type: Bool

Default value: 0

レプリケートデータベースエンジンで長時間実行されるDDLクエリ（CREATE AS SELECTおよびPOPULATE）を許可します。これはDDLキューを長時間ブロックする可能性があります。

## database_replicated_allow_only_replicated_engine {#database_replicated_allow_only_replicated_engine}

Type: Bool

Default value: 0

レプリケートエンジンを持つデータベースでは、レプリケートテーブルのみを作成することを許可します。

## database_replicated_allow_replicated_engine_arguments {#database_replicated_allow_replicated_engine_arguments}

Type: UInt64

Default value: 0

0 - レプリケートデータベースの *MergeTree テーブルに対し、ZooKeeper パスおよびレプリカ名を明示的に指定することを許可しません。1 - 許可します。2 - 許可しますが、指定されたパスを無視し、デフォルトのものを代わりに使用します。3 - 許可し、警告を記録しません。

## database_replicated_always_detach_permanently {#database_replicated_always_detach_permanently}

Type: Bool

Default value: 0

データベースエンジンがレプリケートである場合、DETACH TABLE を DETACH TABLE PERMANENTLY として実行します。

## database_replicated_enforce_synchronous_settings {#database_replicated_enforce_synchronous_settings}

Type: Bool

Default value: 0

一部のクエリに対して同期的待機を強制します（database_atomic_wait_for_drop_and_detach_synchronously、mutation_sync、alter_sync も参照）。これらの設定を有効にしないことをお勧めします。

## database_replicated_initial_query_timeout_sec {#database_replicated_initial_query_timeout_sec}

Type: UInt64

Default value: 300

初期DDLクエリがレプリケートデータベース内の以前のDDLキューエントリを処理するまでの待機時間を秒単位で設定します。

可能な値：

- 正の整数。
- 0 — 無制限。

## decimal_check_overflow {#decimal_check_overflow}

Type: Bool

Default value: 1

小数の算術/比較操作のオーバーフローをチェックします。

## deduplicate_blocks_in_dependent_materialized_views {#deduplicate_blocks_in_dependent_materialized_views}

Type: Bool

Default value: 0

レプリケートテーブルからデータを受け取るマテリアライズドビューの重複排除チェックを有効または無効にします。

可能な値：

      0 — 無効。
      1 — 有効。

使用法

デフォルトでは、マテリアライズドビューに対して重複排除は行われず、ソーステーブルで行われます。
挿入されたブロックがソーステーブルでの重複排除によりスキップされると、添付されたマテリアライズドビューへの挿入は行われません。この動作は、マテリアライズドビュー集計後に挿入されたブロックが同じである場合（つまり、異なるINSERTから得られる場合）に、高度に集計されたデータをマテリアライズドビューに挿入できるようにするために存在します。
一方で、この動作は `INSERT` の冪等性を「破る」ことがあります。メインテーブルへの `INSERT` が成功し、マテリアライズドビューへの `INSERT` が失敗した場合（例えば、ClickHouse Keeper との通信が失敗したため）、クライアントはエラーを取得し、操作を再試行できます。しかし、マテリアライズドビューは、メイン（ソース）テーブルでの重複排除によって discard されるため、2度目の挿入を受け取りません。設定 `deduplicate_blocks_in_dependent_materialized_views` を使用すると、この動作を変更できます。再試行の際、マテリアライズドビューは再挿入を受け取り、ソーステーブルのチェック結果を無視して独自に重複排除チェックを実行し、最初の失敗により失われた行を挿入します。

## default_materialized_view_sql_security {#default_materialized_view_sql_security}

Type: SQLSecurityType

Default value: DEFINER

マテリアライズドビュー作成時の SQL SECURITY オプションのデフォルト値を設定することを許可します。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `DEFINER` です。

## default_max_bytes_in_join {#default_max_bytes_in_join}

Type: UInt64

Default value: 1000000000

制限が必要な場合の右側テーブルの最大サイズですが、max_bytes_in_join が設定されていない場合に適用されます。

## default_normal_view_sql_security {#default_normal_view_sql_security}

Type: SQLSecurityType

Default value: INVOKER

通常のビュー作成時にデフォルトの `SQL SECURITY` オプションを設定することを許可します。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `INVOKER` です。
## default_table_engine {#default_table_engine}

Type: DefaultTableEngine

Default value: MergeTree

`CREATE` ステートメントで `ENGINE` が設定されない場合に使用するデフォルトのテーブルエンジン。

Possible values:

- 有効なテーブルエンジン名を表す文字列

Cloud default value: `SharedMergeTree`.

**Example**

Query:

```sql
SET default_table_engine = 'Log';

SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine';
```

Result:

```response
┌─name─────────────────┬─value─┬─changed─┐
│ default_table_engine │ Log   │       1 │
└──────────────────────┴───────┴─────────┘
```

この例では、`Engine` を指定していない新しいテーブルは `Log` テーブルエンジンを使用します：

Query:

```sql
CREATE TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TABLE my_table;
```

Result:

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

## default_temporary_table_engine {#default_temporary_table_engine}

Type: DefaultTableEngine

Default value: Memory

一時テーブル用の [default_table_engine](#default_table_engine) と同様ですが、`Engine` が指定されない一時テーブルの場合に使用します。

この例では、`Engine` を指定していない新しい一時テーブルは `Log` テーブルエンジンを使用します：

Query:

```sql
SET default_temporary_table_engine = 'Log';

CREATE TEMPORARY TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TEMPORARY TABLE my_table;
```

Result:

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

Type: String

Default value: CURRENT_USER

ビュー作成時にデフォルトの `DEFINER` オプションを設定します。[SQL セキュリティの詳細](../../sql-reference/statements/create/view.md/#sql_security)。

デフォルト値は `CURRENT_USER` です。

## describe_compact_output {#describe_compact_output}

Type: Bool

Default value: 0

true の場合、DESCRIBE クエリの結果にはカラム名とタイプのみを含めます。

## describe_extend_object_types {#describe_extend_object_types}

Type: Bool

Default value: 0

DESCRIBE クエリで Object 型のカラムの具体的な型を推測します。

## describe_include_subcolumns {#describe_include_subcolumns}

Type: Bool

Default value: 0

[DESCRIBE](../../sql-reference/statements/describe-table.md) クエリに対してサブカラムの記述を有効にします。例えば、[Tuple](../../sql-reference/data-types/tuple.md) のメンバーや、[Map](../../sql-reference/data-types/map.md/#map-subcolumns) のサブカラム、[Nullable](../../sql-reference/data-types/nullable.md/#finding-null) または [Array](../../sql-reference/data-types/array.md/#array-size) データ型のサブカラム。

Possible values:

- 0 — サブカラムは `DESCRIBE` クエリに含まれません。
- 1 — サブカラムは `DESCRIBE` クエリに含まれます。

**Example**

[DESCRIBE](../../sql-reference/statements/describe-table.md) ステートメントの例を参照してください。

## describe_include_virtual_columns {#describe_include_virtual_columns}

Type: Bool

Default value: 0

true の場合、テーブルの仮想カラムが DESCRIBE クエリの結果に含まれます。

## dialect {#dialect}

Type: Dialect

Default value: clickhouse

クエリを解析するために使用される方言。

## dictionary_validate_primary_key_type {#dictionary_validate_primary_key_type}

Type: Bool

Default value: 0

辞書の主キータイプを検証します。デフォルトでは、シンプルなレイアウトの ID タイプは UInt64 に暗黙的に変換されます。

## distinct_overflow_mode {#distinct_overflow_mode}

Type: OverflowMode

Default value: throw

制限を超えた場合に行う動作。

## distributed_aggregation_memory_efficient {#distributed_aggregation_memory_efficient}

Type: Bool

Default value: 1

メモリ節約モードの分散集計が有効になっています。

## distributed_background_insert_batch {#distributed_background_insert_batch}

Type: Bool

Default value: 0

挿入データのバッチ送信を有効/無効にします。

バッチ送信が有効な場合、[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンは、挿入されたデータの複数のファイルを1つの操作で送信し、別々に送信する代わりにより効率的にサーバーとネットワークリソースを利用し、クラスターのパフォーマンスを向上させます。

Possible values:

- 1 — 有効。
- 0 — 無効。

## distributed_background_insert_max_sleep_time_ms {#distributed_background_insert_max_sleep_time_ms}

Type: Milliseconds

Default value: 30000

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信する最大間隔。 [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms) の設定で設定された間隔の指数的成長を制限します。

Possible values:

- 正の整数ミリ秒数。

## distributed_background_insert_sleep_time_ms {#distributed_background_insert_sleep_time_ms}

Type: Milliseconds

Default value: 100

[Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンがデータを送信するための基本間隔。エラーが発生した場合、実際の間隔は指数的に増加します。

Possible values:

- 正の整数ミリ秒数。

## distributed_background_insert_split_batch_on_failure {#distributed_background_insert_split_batch_on_failure}

Type: Bool

Default value: 0

失敗時にバッチを分割することを有効/無効にします。

特定のバッチのリモートシャードへの送信が失敗する場合があります。これは、`MATERIALIZED VIEW` の後の複雑なパイプラインが原因である可能性があり、`Memory limit exceeded` のようなエラーが発生することがあります。この場合は、再試行しても役に立たないことがあり（これにより、テーブルの分散送信がスタックする可能性があります）、そのようなバッチからファイルを1つずつ送信することで成功する場合もあります。

したがって、この設定を `1` に設定すると、そのようなバッチのバッチ処理が無効になります（失敗したバッチに対して `distributed_background_insert_batch` が一時的に無効になります）。

Possible values:

- 1 — 有効。
- 0 — 無効。

:::note
この設定は、異常なサーバー（マシン）の終了や [Distributed](../../engines/table-engines/special/distributed.md) テーブルエンジンの `fsync_after_insert`/`fsync_directories` がない場合に発生するかもしれない壊れたバッチにも影響します。
:::

:::note
自動バッチ分割に依存しないでください。パフォーマンスに悪影響を及ぼす可能性があります。
:::

## distributed_background_insert_timeout {#distributed_background_insert_timeout}

Type: UInt64

Default value: 0

分散の挿入クエリのタイムアウト。 この設定は、insert_distributed_sync が有効な場合にのみ使用されます。ゼロ値はタイムアウトがないことを意味します。

## distributed_cache_bypass_connection_pool {#distributed_cache_bypass_connection_pool}

Type: Bool

Default value: 0

クリックハウスクラウド専用。 分散キャッシュ接続プールをバイパスすることを許可します。

## distributed_cache_connect_max_tries {#distributed_cache_connect_max_tries}

Type: UInt64

Default value: 20

クリックハウスクラウド専用。 接続が失敗した場合、分散キャッシュへの接続の試行回数。

## distributed_cache_data_packet_ack_window {#distributed_cache_data_packet_ack_window}

Type: UInt64

Default value: 5

クリックハウスクラウド専用。 単一の分散キャッシュ読み取り要求における DataPacket シーケンスの ACK を送信するためのウィンドウ。

## distributed_cache_discard_connection_if_unread_data {#distributed_cache_discard_connection_if_unread_data}

Type: Bool

Default value: 1

クリックハウスクラウド専用。 未読データがある場合は接続を破棄します。

## distributed_cache_fetch_metrics_only_from_current_az {#distributed_cache_fetch_metrics_only_from_current_az}

Type: Bool

Default value: 1

クリックハウスクラウド専用。 system.distributed_cache_metrics, system.distributed_cache_events から現在の可用性ゾーンのメトリクスのみを取得します。

## distributed_cache_log_mode {#distributed_cache_log_mode}

Type: DistributedCacheLogMode

Default value: on_error

クリックハウスクラウド専用。 system.distributed_cache_log に書き込むためのモード。

## distributed_cache_max_unacked_inflight_packets {#distributed_cache_max_unacked_inflight_packets}

Type: UInt64

Default value: 10

クリックハウスクラウド専用。 単一の分散キャッシュ読み取り要求での未確認のフライトパケットの最大数。

## distributed_cache_min_bytes_for_seek {#distributed_cache_min_bytes_for_seek}

Type: Bool

Default value: 0

クリックハウスクラウド専用。 分散キャッシュでシークを実行するための最小バイト数です。

## distributed_cache_pool_behaviour_on_limit {#distributed_cache_pool_behaviour_on_limit}

Type: DistributedCachePoolBehaviourOnLimit

Default value: wait

クリックハウスクラウド専用。 プールの制限に達した場合の分散キャッシュ接続の挙動を特定します。

## distributed_cache_read_alignment {#distributed_cache_read_alignment}

Type: UInt64

Default value: 0

クリックハウスクラウド専用。 テスト目的の設定です，変更しないでください。

## distributed_cache_receive_response_wait_milliseconds {#distributed_cache_receive_response_wait_milliseconds}

Type: UInt64

Default value: 60000

クリックハウスクラウド専用。 分散キャッシュからのリクエストのデータを受信するまでの待機時間（ミリ秒）。

## distributed_cache_receive_timeout_milliseconds {#distributed_cache_receive_timeout_milliseconds}

Type: UInt64

Default value: 10000

クリックハウスクラウド専用。 分散キャッシュからの応答を受信するまでの待機時間（ミリ秒）。

## distributed_cache_throw_on_error {#distributed_cache_throw_on_error}

Type: Bool

Default value: 0

クリックハウスクラウド専用。 分散キャッシュとの通信中に発生した例外を再スローするか、または分散キャッシュのエラーをスキップします。そうでない場合は、エラー時に分散キャッシュをスキップするようにフォールバックします。

## distributed_cache_wait_connection_from_pool_milliseconds {#distributed_cache_wait_connection_from_pool_milliseconds}

Type: UInt64

Default value: 100

クリックハウスクラウド専用。 distributed_cache_pool_behaviour_on_limit が wait の場合、接続プールから接続を受け取るまでの待機時間（ミリ秒）。

## distributed_connections_pool_size {#distributed_connections_pool_size}

Type: UInt64

Default value: 1024

単一の Distributed テーブルへのすべてのクエリの分散処理のためのリモートサーバーとの同時接続の最大数。 クラスター内のサーバーの数よりも小さく設定することをお勧めします。

## distributed_ddl_entry_format_version {#distributed_ddl_entry_format_version}

Type: UInt64

Default value: 5

分散 DDL (ON CLUSTER) クエリの互換性バージョン。

## distributed_ddl_output_mode {#distributed_ddl_output_mode}

Type: DistributedDDLOutputMode

Default value: throw

分散 DDL クエリ結果の形式を設定します。

Possible values:

- `throw` — クエリが完了したすべてのホストのクエリ実行ステータスを含む結果セットを返します。もしクエリが一部のホストで失敗した場合は、最初の例外が再スローされます。もしクエリが一部のホストでまだ完了しておらず、[distributed_ddl_task_timeout](#distributed_ddl_task_timeout) に達した場合は、`TIMEOUT_EXCEEDED` 例外をスローします。
- `none` — throw と似ていますが、分散 DDL クエリは結果セットを返しません。
- `null_status_on_timeout` — クエリが対応するホストで完了していない場合、結果セットのいくつかの行の実行ステータスとして `NULL` を返します（`TIMEOUT_EXCEEDED` はスローしません）。
- `never_throw` — `TIMEOUT_EXCEEDED` をスローせず、他のホストでクエリが失敗した場合の例外も再スローしません。
- `none_only_active` — `none` と似ていますが、`Replicated` データベースの非アクティブなレプリカに対しては待機しません。注意: このモードでは、クエリがいくつかのレプリカで実行されなかったことを判断することが不可能であり、バックグラウンドで実行されることになります。
- `null_status_on_timeout_only_active` — `null_status_on_timeout` と似ていますが、`Replicated` データベースの非アクティブなレプリカに対しては待機しません。
- `throw_only_active` — `throw` と似ていますが、`Replicated` データベースの非アクティブなレプリカに対しては待機しません。

Cloud default value: `none`。

## distributed_ddl_task_timeout {#distributed_ddl_task_timeout}

Type: Int64

Default value: 180

クラスター内のすべてのホストからのDDLクエリ応答のタイムアウトを設定します。すべてのホストでDDLリクエストが行われていない場合、応答にはタイムアウトエラーが含まれ、リクエストは非同期モードで実行されます。負の値は無限を意味します。

Possible values:

- 正の整数。
- 0 — 非同期モード。
- 負の整数 — 無限のタイムアウト。

## distributed_foreground_insert {#distributed_foreground_insert}

Type: Bool

Default value: 0

[Distributed](../../engines/table-engines/special/distributed.md/#distributed) テーブルへのデータの同期挿入を有効または無効にします。

デフォルトでは、Distributed テーブルにデータを挿入する場合、ClickHouse サーバーはバックグラウンドモードでデータをクラスターノードに送信します。`distributed_foreground_insert=1` の場合、データは同期的に処理され、全てのシャードにデータが保存されるまで `INSERT` 操作は成功しません（`internal_replication` が true の場合は、各シャードに対して少なくとも1つのレプリカが必要です）。

Possible values:

- 0 — データはバックグラウンドモードで挿入されます。
- 1 — データは同期モードで挿入されます。

Cloud default value: `1`。

**See Also**

- [Distributed Table Engine](../../engines/table-engines/special/distributed.md/#distributed)
- [Managing Distributed Tables](../../sql-reference/statements/system.md/#query-language-system-distributed)

## distributed_group_by_no_merge {#distributed_group_by_no_merge}

Type: UInt64

Default value: 0

分散クエリ処理のために異なるサーバーからの集計状態をマージしないようにします。異なるシャードに異なるキーがあることが確実である場合に使用できます。

Possible values:

- `0` — 無効（最終的なクエリ処理はイニシエータノードで行われます）。
- `1` - 異なるサーバーからの集計状態をマージしない（シャード上でクエリが完全に処理され、イニシエータはデータをプロキシするのみ）、異なるシャードに異なるキーがあることが確実である場合に使用されます。
- `2` - `1` と同様ですが、イニシエータで `ORDER BY` と `LIMIT` を適用します（これは、クエリが完全にリモートノードで処理される場合（たとえば、`distributed_group_by_no_merge=1` の場合）は不可能です）。

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

Type: Bool

Default value: 0

Distributed への INSERT クエリで読み取り専用レプリカをスキップすることを有効または無効にします。

Possible values:

- 0 — 通常通り INSERT され、読み取り専用レプリカに行くと失敗します。
- 1 — イニシエータはデータをシャードに送信する前に読み取り専用レプリカをスキップします。

## distributed_product_mode {#distributed_product_mode}

Type: DistributedProductMode

Default value: deny

[distributed subqueries](../../sql-reference/operators/in.md) の動作を変更します。

ClickHouse は、クエリが分散テーブルの製品を含む場合、すなわち分散テーブルへのクエリが分散テーブルに対する非グローバルなサブクエリを含む場合にこの設定を適用します。

Restrictions:

- IN と JOIN サブクエリのみに適用されます。
- FROM セクションが 1 つ以上のシャードを含む分散テーブルを使用している場合のみ。
- サブクエリが 1 つ以上のシャードを含む分散テーブルに関係している場合。
- テーブル値の [remote](../../sql-reference/table-functions/remote.md) 関数には使用されません。

Possible values:

- `deny` — デフォルト値。これらのタイプのサブクエリの使用を禁止します（「Double-distributed in/JOIN subqueries is denied」例外を返します）。
- `local` — サブクエリ内のデータベースとテーブルを宛先サーバー（シャード）のローカルなものに置き換え、通常の `IN`/`JOIN` を残します。
- `global` — `IN`/`JOIN` クエリを `GLOBAL IN`/`GLOBAL JOIN` に置き換えます。
- `allow` — これらのタイプのサブクエリの使用を許可します。

## distributed_push_down_limit {#distributed_push_down_limit}

Type: UInt64

Default value: 1

各シャードでの [LIMIT](#limit) の適用を有効または無効にします。

これにより、次のことを回避できます：
- ネットワーク越しに余分な行を送信すること；
- イニシエータで制限の後ろの行を処理すること。

21.9 バージョン以降、次のいずれかの条件が満たされるときにのみ、`distributed_push_down_limit` がクエリの実行を変更します：
- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0。
- クエリに `GROUP BY`/`DISTINCT`/`LIMIT BY` が **含まれていない** が `ORDER BY`/`LIMIT` が含まれている。
- クエリに `GROUP BY`/`DISTINCT`/`LIMIT BY` が `ORDER BY`/`LIMIT` と共に含まれており：
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) が有効である。
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) が有効である。

Possible values:

- 0 — 無効。
- 1 — 有効。

See also:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap {#distributed_replica_error_cap}

Type: UInt64

Default value: 1000

- Type: unsigned int
- Default value: 1000

各レプリカのエラー数がこの値に制限され、単一のレプリカがあまりにも多くのエラーを蓄積するのを防ぎます。

See also:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life {#distributed_replica_error_half_life}

Type: Seconds

Default value: 60

- Type: seconds
- Default value: 60 seconds

分散テーブルのエラーがゼロになる速さを制御します。レプリカがしばらく利用できない場合、5つのエラーを蓄積し、distributed_replica_error_half_life が 1 秒に設定されている場合、最後のエラーから 3 秒後にレプリカは正常と見なされます。

See also:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors {#distributed_replica_max_ignored_errors}

Type: UInt64

Default value: 0

- Type: unsigned int
- Default value: 0

レプリカを選択する際に無視されるエラーの数（`load_balancing` アルゴリズムに従って）。

See also:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final {#do_not_merge_across_partitions_select_final}

Type: Bool

Default value: 0

選択の最終的な操作で、パーティション内でのみパーツをマージします。

## empty_result_for_aggregation_by_constant_keys_on_empty_set {#empty_result_for_aggregation_by_constant_keys_on_empty_set}

Type: Bool

Default value: 1

空のセットで定数キーによる集約の際に空の結果を返します。

## empty_result_for_aggregation_by_empty_set {#empty_result_for_aggregation_by_empty_set}

Type: Bool

Default value: 0

空のセットでキーなしに集約する際に空の結果を返します。

## enable_adaptive_memory_spill_scheduler {#enable_adaptive_memory_spill_scheduler}
<ExperimentalBadge/>

Type: Bool

Default value: 0

プロセッサがデータを外部ストレージに適応的にスピルするようにトリガーします。現在のところグレースジョインがサポートされています。

## enable_blob_storage_log {#enable_blob_storage_log}

Type: Bool

Default value: 1

blob ストレージ操作に関する情報を system.blob_storage_log テーブルに書き込みます。

## enable_deflate_qpl_codec {#enable_deflate_qpl_codec}

Type: Bool

Default value: 0

有効にすると、DEFLATE_QPL codec を使用してカラムを圧縮できます。

## enable_early_constant_folding {#enable_early_constant_folding}

Type: Bool

Default value: 1

関数とサブクエリの結果を分析し、定数がある場合にクエリを書き換えるクエリ最適化を有効にします。

## enable_extended_results_for_datetime_functions {#enable_extended_results_for_datetime_functions}

Type: Bool

Default value: 0

次のタイプの結果の返却を有効または無効にします：
- [toStartOfYear](../../sql-reference/functions/date-time-functions.md/#tostartofyear)、[toStartOfISOYear](../../sql-reference/functions/date-time-functions.md/#tostartofisoyear)、[toStartOfQuarter](../../sql-reference/functions/date-time-functions.md/#tostartofquarter)、[toStartOfMonth](../../sql-reference/functions/date-time-functions.md/#tostartofmonth)、[toLastDayOfMonth](../../sql-reference/functions/date-time-functions.md/#tolastdayofmonth)、[toStartOfWeek](../../sql-reference/functions/date-time-functions.md/#tostartofweek)、[toLastDayOfWeek](../../sql-reference/functions/date-time-functions.md/#tolastdayofweek)、および [toMonday](../../sql-reference/functions/date-time-functions.md/#tomonday) の関数に対して、範囲が拡張された `Date32`。
- [toStartOfDay](../../sql-reference/functions/date-time-functions.md/#tostartofday)、[toStartOfHour](../../sql-reference/functions/date-time-functions.md/#tostartofhour)、[toStartOfMinute](../../sql-reference/functions/date-time-functions.md/#tostartofminute)、[toStartOfFiveMinutes](../../sql-reference/functions/date-time-functions.md/#tostartoffiveminutes)、[toStartOfTenMinutes](../../sql-reference/functions/date-time-functions.md/#tostartoftenminutes)、[toStartOfFifteenMinutes](../../sql-reference/functions/date-time-functions.md/#tostartoffifteenminutes)、および [timeSlot](../../sql-reference/functions/date-time-functions.md/#timeslot) の関数に対して、範囲が拡張された `DateTime64`。

Possible values:

- 0 — 関数は全ての引数タイプに対して `Date` または `DateTime` を返します。
- 1 — 関数は `Date32` または `DateTime64` 引数に対して `Date32` または `DateTime64` を返し、それ以外の場合は `Date` または `DateTime` を返します。

## enable_filesystem_cache {#enable_filesystem_cache}

Type: Bool

Default value: 1

リモートファイルシステムのキャッシュを使用します。この設定はディスクのキャッシュをオン/オフするものではなく（ディスク構成で行う必要があります）、意図的にいくつかのクエリのキャッシュをバイパスすることを許可します。

## enable_filesystem_cache_log {#enable_filesystem_cache_log}

Type: Bool

Default value: 0

各クエリのファイルシステムキャッシュログを記録できるようにします。

## enable_filesystem_cache_on_write_operations {#enable_filesystem_cache_on_write_operations}

Type: Bool

Default value: 0

書き込み操作時にキャッシュに書き込みます。この設定が機能するには、ディスク構成にも追加する必要があります。

## enable_filesystem_read_prefetches_log {#enable_filesystem_read_prefetches_log}

Type: Bool

Default value: 0

クエリ中にシステム.filesystem の予測ログに記録します。テストまたはデバッグ用にのみ使用し、デフォルトではオンにしないことをお勧めします。

## enable_global_with_statement {#enable_global_with_statement}

Type: Bool

Default value: 1

UNION クエリやすべてのサブクエリに WITH ステートメントを伝播します。

## enable_http_compression {#enable_http_compression}

Type: Bool

Default value: 0

HTTP リクエストへの応答でのデータ圧縮を有効または無効にします。

詳細については、[HTTP インターフェースの説明](../../interfaces/http.md)を参照してください。

Possible values:

- 0 — 無効。
- 1 — 有効。

## enable_job_stack_trace {#enable_job_stack_trace}

Type: Bool

Default value: 1

ジョブが例外を引き起こしたときに、ジョブ作成者のスタックトレースを出力します。

## enable_lightweight_delete {#enable_lightweight_delete}

Type: Bool

Default value: 1

MergeTree テーブルの軽量 DELETE 変更を有効にします。

## enable_memory_bound_merging_of_aggregation_results {#enable_memory_bound_merging_of_aggregation_results}

Type: Bool

Default value: 1

集計のためのメモリ制約結合戦略を有効にします。

## enable_multiple_prewhere_read_steps {#enable_multiple_prewhere_read_steps}

Type: Bool

Default value: 1

複数の条件が AND で結合されている場合、WHERE から PREWHERE への条件をより多く移動し、ディスクからの読み取りとフィルタリングを複数のステップで行います。

## enable_named_columns_in_function_tuple {#enable_named_columns_in_function_tuple}

Type: Bool

Default value: 0

すべての名前が一意であり、無引用識別子として扱うことができる場合、function tuple() で名前付きタプルを生成します。

## enable_optimize_predicate_expression {#enable_optimize_predicate_expression}

Type: Bool

Default value: 1

`SELECT` クエリでの述語プッシュダウンを有効にします。

述語プッシュダウンは、分散クエリに対するネットワークトラフィックを大幅に削減できます。

Possible values:

- 0 — 無効。
- 1 — 有効。

Usage

次のクエリを考慮してください：

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

`enable_optimize_predicate_expression = 1`の場合、これらのクエリの実行時間は同じになります。ClickHouseは、サブクエリを処理する際に `WHERE` を適用します。

`enable_optimize_predicate_expression = 0` の場合、2 番目のクエリの実行時間ははるかに長くなります。なぜなら、`WHERE` 句はサブクエリが完了した後のすべてのデータに適用されるからです。

## enable_optimize_predicate_expression_to_final_subquery {#enable_optimize_predicate_expression_to_final_subquery}

Type: Bool

Default value: 1

最終サブクエリにプッシュされた述語を許可します。

## enable_order_by_all {#enable_order_by_all}

Type: Bool

Default value: 1

`ORDER BY ALL` 構文によるソートを有効または無効にします。 [ORDER BY](../../sql-reference/statements/select/order-by.md)を参照してください。

Possible values:

- 0 — ORDER BY ALL を無効にします。
- 1 — ORDER BY ALL を有効にします。

**Example**

Query:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- ALL が曖昧であるというエラーが返されます。

SELECT * FROM TAB ORDER BY ALL SETTINGS enable_order_by_all = 0;
```

Result:

```text
┌─C1─┬─C2─┬─ALL─┐
│ 20 │ 20 │  10 │
│ 30 │ 10 │  20 │
│ 10 │ 20 │  30 │
└────┴────┴─────┘
```

## enable_parsing_to_custom_serialization {#enable_parsing_to_custom_serialization}

Type: Bool

Default value: 1

true の場合、データはカラムに対してカスタムシリアル化（例えば、Sparse）で直接解析できます。テーブルから得たシリアル化に関するヒントに従います。

## enable_positional_arguments {#enable_positional_arguments}

Type: Bool

Default value: 1

[GROUP BY](../../sql-reference/statements/select/group-by.md)、[LIMIT BY](../../sql-reference/statements/select/limit-by.md)、[ORDER BY](../../sql-reference/statements/select/order-by.md) ステートメントの位置引数のサポートを有効または無効にします。

Possible values:

- 0 — 位置引数はサポートされません。
- 1 — 位置引数がサポートされます：カラム名の代わりにカラム番号を使用できます。

**Example**

Query:

```sql
CREATE TABLE positional_arguments(one Int, two Int, three Int) ENGINE=Memory();

INSERT INTO positional_arguments VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM positional_arguments ORDER BY 2,3;
```

Result:

```text
┌─one─┬─two─┬─three─┐
│  30 │  10 │   20  │
│  20 │  20 │   10  │
│  10 │  20 │   30  │
└─────┴─────┴───────┘
```

## enable_reads_from_query_cache {#enable_reads_from_query_cache}

Type: Bool

Default value: 1

有効にすると、`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) から取得されます。

Possible values:

- 0 - 無効
- 1 - 有効

## enable_s3_requests_logging {#enable_s3_requests_logging}

Type: Bool

Default value: 0

S3 リクエストの明示的なログを有効にします。デバッグ時にのみ意味があります。

## enable_scalar_subquery_optimization {#enable_scalar_subquery_optimization}

Type: Bool

Default value: 1

true に設定すると、スカラーサブクエリが大きなスカラー値を（デシリアライズ/シリアライズすることなく）回避し、同じサブクエリを2回以上実行することを防ぎます。

## enable_sharing_sets_for_mutations {#enable_sharing_sets_for_mutations}

Type: Bool

Default value: 1

異なるタスクの IN サブクエリのために構築されたセットオブジェクトの共有を許可します。これにより、メモリ使用量と CPU 消費が削減されます。

## enable_software_prefetch_in_aggregation {#enable_software_prefetch_in_aggregation}

Type: Bool

Default value: 1

集計処理にソフトウェアプリフェッチを使用することを有効にします。

## enable_unaligned_array_join {#enable_unaligned_array_join}

Type: Bool

Default value: 0

サイズが異なる複数の配列を持つ ARRAY JOIN を許可します。この設定が有効な場合、配列は最長のものにサイズを合わせます。

## enable_url_encoding {#enable_url_encoding}

Type: Bool

Default value: 1

[URL](../../engines/table-engines/special/url.md) テーブルのエンジンにおけるパスのデコード/エンコードを有効/無効にします。

デフォルトで有効です。

## enable_vertical_final {#enable_vertical_final}

Type: Bool

Default value: 1

有効にすると、FINAL 処理中に重複した行をマージするのではなく、行を削除済みとしてマークし、後でフィルタリングします。

## enable_writes_to_query_cache {#enable_writes_to_query_cache}

Type: Bool

Default value: 1

有効にすると、`SELECT` クエリの結果が [クエリキャッシュ](../query-cache.md) に保存されます。

Possible values:

- 0 - 無効
- 1 - 有効

## enable_zstd_qat_codec {#enable_zstd_qat_codec}

Type: Bool

Default value: 0

有効にした場合、ZSTD_QAT codec を使用してカラムを圧縮できます。

## enforce_strict_identifier_format {#enforce_strict_identifier_format}

Type: Bool

Default value: 0

有効にすると、英数字とアンダースコアを含む識別子のみが許可されます。

## engine_file_allow_create_multiple_files {#engine_file_allow_create_multiple_files}

Type: Bool

Default value: 0

ファイルエンジンテーブルで、フォーマットが接尾辞 (`JSON`, `ORC`, `Parquet` など) を持つ場合、各挿入時に新しいファイルを作成することを有効または無効にします。これを有効にすると、各挿入時に次のパターンに従った名前の新しいファイルが作成されます:

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` など。

Possible values:
- 0 — `INSERT` クエリはファイルの最後に新しいデータを追加します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## engine_file_empty_if_not_exists {#engine_file_empty_if_not_exists}

Type: Bool

Default value: 0

ファイルがないファイルエンジンテーブルからデータを選択することを許可します。

Possible values:
- 0 — `SELECT` は例外を投げます。
- 1 — `SELECT` は空の結果を返します。

## engine_file_skip_empty_files {#engine_file_skip_empty_files}

Type: Bool

Default value: 0

[File](../../engines/table-engines/special/file.md) エンジンテーブルで空のファイルをスキップすることを有効または無効にします。

Possible values:
- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外を投げます。
- 1 — 空のファイルの場合、`SELECT` は空の結果を返します。

## engine_file_truncate_on_insert {#engine_file_truncate_on_insert}

Type: Bool

Default value: 0

[File](../../engines/table-engines/special/file.md) エンジンテーブルで挿入前に切り捨てを有効または無効にします。

Possible values:
- 0 — `INSERT` クエリはファイルの最後に新しいデータを追加します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。

## engine_url_skip_empty_files {#engine_url_skip_empty_files}

Type: Bool

Default value: 0

[URL](../../engines/table-engines/special/url.md) エンジンテーブルで空のファイルをスキップすることを有効または無効にします。

Possible values:
- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外を投げます。
- 1 — 空のファイルの場合、`SELECT` は空の結果を返します。

## except_default_mode {#except_default_mode}

Type: SetOperationMode

Default value: ALL

EXCEPT クエリのデフォルトモードを設定します。Possible values: 空文字列, 'ALL', 'DISTINCT'。空の場合、モードなしのクエリは例外を投げます。

## external_storage_connect_timeout_sec {#external_storage_connect_timeout_sec}

Type: UInt64

Default value: 10

接続タイムアウト（秒）。現在は MySQL のみサポートされています。

## external_storage_max_read_bytes {#external_storage_max_read_bytes}

Type: UInt64

Default value: 0

外部エンジンを持つテーブルが履歴データをフラッシュする際の最大バイト数の制限。現在は MySQL テーブルエンジン、データベースエンジン、および辞書のみサポートされています。0 に等しい場合、この設定は無効です。

## external_storage_max_read_rows {#external_storage_max_read_rows}

Type: UInt64

Default value: 0

外部エンジンを持つテーブルが履歴データをフラッシュする際の最大行数の制限。現在は MySQL テーブルエンジン、データベースエンジン、および辞書のみサポートされています。0 に等しい場合、この設定は無効です。

## external_storage_rw_timeout_sec {#external_storage_rw_timeout_sec}

Type: UInt64

Default value: 300

読み取り/書き込みタイムアウト（秒）。現在は MySQL のみサポートされています。

## external_table_functions_use_nulls {#external_table_functions_use_nulls}

Type: Bool

Default value: 1

[mysql](../../sql-reference/table-functions/mysql.md)、[postgresql](../../sql-reference/table-functions/postgresql.md)、および [odbc](../../sql-reference/table-functions/odbc.md) テーブル関数が Nullable カラムを使用する方法を定義します。

Possible values:
- 0 — テーブル関数は明示的に Nullable カラムを使用します。
- 1 — テーブル関数は暗黙的に Nullable カラムを使用します。

**Usage**

設定が `0` に設定されている場合、テーブル関数は Nullable カラムを作成せず、`NULL` の代わりにデフォルト値を挿入します。これは配列内部の NULL 値にも適用されます。

## external_table_strict_query {#external_table_strict_query}

Type: Bool

Default value: 0

真に設定されている場合、外部テーブルへのクエリのローカルフィルターへの変換表現が禁止されます。

## extract_key_value_pairs_max_pairs_per_row {#extract_key_value_pairs_max_pairs_per_row}

Type: UInt64

Default value: 1000

`extractKeyValuePairs` 関数によって生成される最大ペア数。メモリを過剰に消費しないようにするための保護策として使用されます。

## extremes {#extremes}

Type: Bool

Default value: 0

クエリ結果のカラム内の極端な値（最小値と最大値）をカウントするかどうか。0 または 1 を受け入れます。デフォルトでは、0（無効）。

詳細については、「極端な値」セクションを参照してください。

## fallback_to_stale_replicas_for_distributed_queries {#fallback_to_stale_replicas_for_distributed_queries}

Type: Bool

Default value: 1

更新されたデータが利用できない場合は、古いレプリカへのクエリを強制します。 [Replication](../../engines/table-engines/mergetree-family/replication.md) を参照してください。

ClickHouse は、テーブルの古いレプリカの中から最も関連性の高いものを選択します。

レプリケートされたテーブルを指す分散テーブルから `SELECT` を実行する際に使用されます。

デフォルトでは、1（有効）。

## filesystem_cache_boundary_alignment {#filesystem_cache_boundary_alignment}

Type: UInt64

Default value: 0

ファイルシステムキャッシュの境界アラインメント。この設定は、非ディスク読み取り（リモートテーブルエンジン / テーブル関数のキャッシュ用など）にのみ適用されますが、MergeTreeテーブルのストレージ構成には適用されません。値0はアラインメントなしを意味します。

## filesystem_cache_enable_background_download_during_fetch {#filesystem_cache_enable_background_download_during_fetch}

Type: Bool

Default value: 1

ClickHouse Cloud のみ。ファイルシステムキャッシュでのスペース予約のためのキャッシュをロックするまでの待機時間

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage {#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage}

Type: Bool

Default value: 1

ClickHouse Cloud のみ。ファイルシステムキャッシュでのスペース予約のためのキャッシュをロックするまでの待機時間

## filesystem_cache_max_download_size {#filesystem_cache_max_download_size}

Type: UInt64

Default value: 137438953472

単一のクエリによってダウンロードできる最大リモートファイルシステムキャッシュサイズ

## filesystem_cache_name {#filesystem_cache_name}

Type: String

Default value:

ステートレステーブルエンジンまたはデータレイクに使用するファイルシステムキャッシュの名前

## filesystem_cache_prefer_bigger_buffer_size {#filesystem_cache_prefer_bigger_buffer_size}

Type: Bool

Default value: 1

ファイルシステムキャッシュが有効な場合、キャッシュの性能を低下させる小さなファイルセグメントの書き込みを避けるために大きなバッファサイズを優先します。対照的に、この設定を有効にするとメモリ使用量が増加する可能性があります。

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds {#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds}

Type: UInt64

Default value: 1000

ファイルシステムキャッシュでのスペース予約のためのキャッシュをロックするまでの待機時間

## filesystem_cache_segments_batch_size {#filesystem_cache_segments_batch_size}

Type: UInt64

Default value: 20

読み取りバッファがキャッシュからリクエストできる単一のファイルセグメントのバッチのサイズの制限。値が低すぎるとキャッシュへの過剰なリクエストが発生し、値が高すぎるとキャッシュからの排出が遅くなる可能性があります。

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit {#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit}

Type: Bool

Default value: 1

クエリキャッシュサイズを超えた場合、リモートファイルシステムからのダウンロードをスキップします。

## filesystem_prefetch_max_memory_usage {#filesystem_prefetch_max_memory_usage}

Type: UInt64

Default value: 1073741824

プリフェッチに使用される最大メモリ使用量。

## filesystem_prefetch_step_bytes {#filesystem_prefetch_step_bytes}

Type: UInt64

Default value: 0

バイト単位のプリフェッチステップ。ゼロは `auto` を意味し、最適なプリフェッチステップが自動的に推定されますが、100% 的確なものではない可能性があります。実際の値は `filesystem_prefetch_min_bytes_for_single_read_task` 設定により異なる場合があります。

## filesystem_prefetch_step_marks {#filesystem_prefetch_step_marks}

Type: UInt64

Default value: 0

マーク単位のプリフェッチステップ。ゼロは `auto` を意味し、最適なプリフェッチステップが自動的に推定されますが、100% 的確なものではない可能性があります。実際の値は `filesystem_prefetch_min_bytes_for_single_read_task` 設定により異なる場合があります。

## filesystem_prefetches_limit {#filesystem_prefetches_limit}

Type: UInt64

Default value: 200

プリフェッチの最大数。ゼロは無制限を意味します。プリフェッチの数を制限したい場合は、`filesystem_prefetches_max_memory_usage` 設定を推奨します。

## final {#final}

Type: Bool

Default value: 0

クエリ内のすべてのテーブルに自動的に [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) 修飾子を適用します。この修飾子は、[FINAL](../../sql-reference/statements/select/from.md/#final-modifier) が適用可能なテーブル、結合されたテーブル、およびサブクエリ内のテーブルや分散テーブルにも適用されます。

Possible values:
- 0 - 無効
- 1 - 有効

Example:

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

## flatten_nested {#flatten_nested}

Type: Bool

Default value: 1

[ネスト](../../sql-reference/data-types/nested-data-structures/index.md) カラムのデータ形式を設定します。

Possible values:
- 1 — ネストしたカラムは別々の配列にフラット化されます。
- 0 — ネストしたカラムはタプルの単一の配列のままです。

**Usage**

設定が `0` に設定されている場合、任意のレベルのネストを使用することができます。

**Examples**

Query:

```sql
SET flatten_nested = 1;
CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

Result:

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

Query:

```sql
SET flatten_nested = 0;

CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

Result:

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

Type: Bool

Default value: 0

適用可能な場合の最適化の使用を強制しますが、ヒューリスティックによって使用しないことが決定される場合とは異なります。

## force_aggregation_in_order {#force_aggregation_in_order}

Type: Bool

Default value: 0

この設定は、サーバー自体によって分散クエリをサポートするために使用されます。手動で変更しないでください。通常の操作に支障をきたす可能性があります。（分散集計中にリモートノードでの順序での集計の使用を強制します）。

## force_data_skipping_indices {#force_data_skipping_indices}

Type: String

Default value:

使用されたデータスキッピングインデックスが利用できない場合、クエリの実行を無効にします。

次の例を考えてみましょう：

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
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- クエリは CANNOT_PARSE_TEXT エラーを発生させます。
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- クエリは INDEX_NOT_USED エラーを発生させます。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; --  OK。
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; --  OK（完全機能のパーサーの例）。
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- OK。
```

## force_grouping_standard_compatibility {#force_grouping_standard_compatibility}

Type: Bool

Default value: 1

GROUPING 関数が引数が集計キーとして使用されていない場合に 1 を返すようにします。

## force_index_by_date {#force_index_by_date}

Type: Bool

Default value: 0

インデックスが日付別に使用できない場合、クエリの実行を無効にします。

MergeTree ファミリーのテーブルで機能します。

`force_index_by_date=1` の場合、ClickHouse はクエリにデータ範囲を制限するのに使用できる日付キー条件があるかどうかを確認します。適切な条件が存在しない場合、例外がスローされます。ただし、条件が読まれるデータ量を減少させるかどうかはチェックしません。例えば、条件 `Date != ' 2000-01-01 '` は、テーブル内のすべてのデータと一致する場合でも、受け入れられます（すなわち、クエリの実行にはフルスキャンが必要です）。MergeTree テーブルのデータ範囲についての詳細は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_optimize_projection {#force_optimize_projection}

Type: Bool

Default value: 0

プロジェクション最適化が有効な場合、`SELECT` クエリでの [プロジェクション](../../engines/table-engines/mergetree-family/mergetree.md/#projections) の強制使用を有効または無効にします。

Possible values:
- 0 — プロジェクション最適化は必須ではありません。
- 1 — プロジェクション最適化は必須です。

## force_optimize_projection_name {#force_optimize_projection_name}

Type: String

Default value:

非空の文字列に設定されている場合、このプロジェクションがクエリで少なくとも一度使用されていることを確認します。

Possible values:
- string: クエリに使用されるプロジェクションの名前

## force_optimize_skip_unused_shards {#force_optimize_skip_unused_shards}

Type: UInt64

Default value: 0

[optimize_skip_unused_shards](#force_optimize_skip_unused_shards) が有効であり、未使用のシャードをスキップできない場合にクエリの実行を有効または無効にします。スキップが不可能でこの設定が有効な場合、例外がスローされます。

Possible values:
- 0 — 無効。ClickHouse は例外を投げません。
- 1 — 有効。テーブルにシャーディングキーがある場合のみクエリの実行が無効になります。
- 2 — 有効。テーブルのためにシャーディングキーが定義されているかどうかに関わらず、クエリの実行が無効になります。

## force_optimize_skip_unused_shards_nesting {#force_optimize_skip_unused_shards_nesting}

Type: UInt64

Default value: 0

[`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)（従って [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards）もまだ必要です）が分散クエリのネストレベルに依存します（他の分散テーブルを参照する `Distributed` テーブルがある場合）。

Possible values:
- 0 - 無効、`force_optimize_skip_unused_shards` は常に機能します。
- 1 — 1 階層目のみ `force_optimize_skip_unused_shards` を有効にします。
- 2 — 2 階層目まで `force_optimize_skip_unused_shards` を有効にします。

## force_primary_key {#force_primary_key}

Type: Bool

Default value: 0

プライマリキーによるインデックス作成が不可能な場合、クエリの実行を無効にします。

MergeTree ファミリーのテーブルで機能します。

`force_primary_key=1` の場合、ClickHouse はクエリにデータ範囲を制限するのに使用できるプライマリキー条件があるかどうかを確認します。適切な条件が存在しない場合、例外をスローします。ただし、条件が読まれるデータ量を減少させるかどうかはチェックしません。MergeTree テーブルのデータ範囲についての詳細は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) を参照してください。

## force_remove_data_recursively_on_drop {#force_remove_data_recursively_on_drop}

Type: Bool

Default value: 0

DROP クエリでデータを再帰的に削除します。'Directory not empty' エラーを避けますが、デタッチされたデータを静かに削除してしまう可能性があります。

## formatdatetime_f_prints_scale_number_of_digits {#formatdatetime_f_prints_scale_number_of_digits}

Type: Bool

Default value: 0

関数 'formatDateTime' におけるフォーマッター '%f' は、固定の 6 桁ではなく、DateTime64 のスケール桁数のみを印刷します。

## formatdatetime_f_prints_single_zero {#formatdatetime_f_prints_single_zero}

Type: Bool

Default value: 0

関数 'formatDateTime' においてフォーマッター '%f' は、フォーマットされた値に小数秒が存在しない場合、6 桁のゼロの代わりに単一のゼロを印刷します。

## formatdatetime_format_without_leading_zeros {#formatdatetime_format_without_leading_zeros}

Type: Bool

Default value: 0

関数 'formatDateTime' のフォーマッター '%c', '%l' および '%k' は、先頭のゼロなしで月と時間を印刷します。

## formatdatetime_parsedatetime_m_is_month_name {#formatdatetime_parsedatetime_m_is_month_name}

Type: Bool

Default value: 1

関数 'formatDateTime' と 'parseDateTime' におけるフォーマッター '%M' は、分の代わりに月名を印刷/解析します。

## fsync_metadata {#fsync_metadata}

Type: Bool

Default value: 1

.sql ファイルを書き込む際の [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) を有効または無効にします。デフォルトで有効です。

サーバーに常に生成および破棄される小さなテーブルが数百万ある場合、無効にすることが意味を持つ場合があります。

## function_implementation {#function_implementation}

Type: String

Default value:

特定のターゲットやバリアントのための関数の実装を選択します（実験的）。空の場合は全てを有効にします。

## function_json_value_return_type_allow_complex {#function_json_value_return_type_allow_complex}

Type: Bool

Default value: 0

json_value 関数に対して複雑な型（構造体、配列、マップなど）の返却を許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Possible values:
- true — 許可。
- false — 禁止。

## function_json_value_return_type_allow_nullable {#function_json_value_return_type_allow_nullable}

Type: Bool

Default value: 0

json_value 関数で値が存在しない場合に `NULL` を返却することを許可するかどうかを制御します。

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Possible values:
- true — 許可。
- false — 禁止。

## function_locate_has_mysql_compatible_argument_order {#function_locate_has_mysql_compatible_argument_order}

Type: Bool

Default value: 1

関数 [locate](../../sql-reference/functions/string-search-functions.md/#locate) における引数の順序を制御します。

Possible values:
- 0 — 関数 `locate` は引数 `(haystack, needle[, start_pos])` を受け入れます。
- 1 — 関数 `locate` は引数 `(needle, haystack, [, start_pos])`（MySQL 互換の動作）を受け入れます。

## function_range_max_elements_in_block {#function_range_max_elements_in_block}

Type: UInt64

Default value: 500000000

関数 [range](../../sql-reference/functions/array-functions.md/#range) によって生成されるデータ量の安全閾値を設定します。データブロックごとに生成される最大値の数を定義します（ブロック内の各行の配列サイズの合計）。

Possible values:
- 正の整数。

**See Also**
- [max_block_size](#max_block_size)
- [min_insert_block_size_rows](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block {#function_sleep_max_microseconds_per_block}

Type: UInt64

Default value: 3000000

関数 `sleep` が各ブロックに対してスリープすることを許可されている最大マイクロ秒数です。ユーザーがそれを大きな値で呼び出した場合、例外が発生します。これは安全閾値です。

## function_visible_width_behavior {#function_visible_width_behavior}

Type: UInt64

Default value: 1

`visibleWidth` 動作のバージョン。0 - コードポイントの数のみをカウントします。1 - ゼロ幅と合成文字を正しくカウントし、全幅文字を2つとしてカウントし、タブ幅を推定し、削除文字をカウントします。

## geo_distance_returns_float64_on_float64_arguments {#geo_distance_returns_float64_on_float64_arguments}

Type: Bool

Default value: 1

`geoDistance`、`greatCircleDistance`、`greatCircleAngle` 関数に対するすべての4つの引数が Float64 の場合、Float64 を返し、内部計算にダブル精度を使用します。以前の ClickHouse バージョンでは、これらの関数は常に Float32 を返していました。

## glob_expansion_max_elements {#glob_expansion_max_elements}

Type: UInt64

Default value: 1000

許可される最大アドレス数（外部ストレージ、テーブル関数など）。

## grace_hash_join_initial_buckets {#grace_hash_join_initial_buckets}
<ExperimentalBadge/>

Type: NonZeroUInt64

Default value: 1

グレースハッシュ結合の初期バケット数。

## grace_hash_join_max_buckets {#grace_hash_join_max_buckets}
<ExperimentalBadge/>

Type: NonZeroUInt64

Default value: 1024

グレースハッシュ結合のバケット数の制限。

## group_by_overflow_mode {#group_by_overflow_mode}

Type: OverflowModeGroupBy

Default value: throw

制限を超えたときに何をするか。

## group_by_two_level_threshold {#group_by_two_level_threshold}

Type: UInt64

Default value: 100000

いくつのキーから二階層集約が開始されるか。0 - 閾値は設定されていません。

## group_by_two_level_threshold_bytes {#group_by_two_level_threshold_bytes}

Type: UInt64

Default value: 50000000

集約状態のサイズがバイト単位でどの程度から、二階層集約が使用され始めるか。0 - 閾値は設定されていません。少なくとも1つの閾値がトリガーされると二階層集約が使用されます。

## group_by_use_nulls {#group_by_use_nulls}

Type: Bool

Default value: 0

[GROUP BY 句](/docs/sql-reference/statements/select/group-by.md) の集約キーのタイプの扱いを変更します。
`ROLLUP`、`CUBE`、または `GROUPING SETS` 修飾子が使用されているとき、一部の集約キーは結果行を生成するために使用されない場合があります。
これらのキーのカラムは、この設定に応じて、対応する行に対してデフォルト値または `NULL` で埋められます。

Possible values:
- 0 — 集約キータイプのデフォルト値が欠損値を生成するために使用されます。
- 1 — ClickHouse は SQL 標準が示すように `GROUP BY` を実行します。集約キーカラムの型は [Nullable](/docs/sql-reference/data-types/nullable.md/#data_type-nullable) に変換されます。対応する集約キーのカラムは、そのカラムが使用されていない行に対して [NULL](/docs/sql-reference/syntax.md) で埋められます。

参照：
- [GROUP BY 句](/docs/sql-reference/statements/select/group-by.md)

## h3togeo_lon_lat_result_order {#h3togeo_lon_lat_result_order}

Type: Bool

Default value: 0

関数 'h3ToGeo' は、true の場合 (lon, lat) を返します。そうでない場合は (lat, lon) を返します。

## handshake_timeout_ms {#handshake_timeout_ms}

Type: Milliseconds

Default value: 10000

ハンドシェイク中にレプリカから Hello パケットを受信するためのミリ秒単位のタイムアウト。

## hdfs_create_new_file_on_insert {#hdfs_create_new_file_on_insert}

Type: Bool

Default value: 0

HDFS エンジンテーブルで各挿入時に新しいファイルを作成することを有効または無効にします。これを有効にすると、各挿入時に、次のような名前の新しい HDFS ファイルが作成されます:

初期: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

Possible values:
- 0 — `INSERT` クエリはファイルの最後に新しいデータを追加します。
- 1 — `INSERT` クエリは新しいファイルを作成します。

## hdfs_ignore_file_doesnt_exist {#hdfs_ignore_file_doesnt_exist}

Type: Bool

Default value: 0

特定のキーを読み取る際にファイルが存在しない場合、ファイルの欠如を無視します。

Possible values:
- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外を投げます。

## hdfs_replication {#hdfs_replication}

Type: UInt64

Default value: 0

HDFS ファイルが作成されるときに指定できる実際のレプリケーション数。

## hdfs_skip_empty_files {#hdfs_skip_empty_files}

Type: Bool

Default value: 0

[HDFS](../../engines/table-engines/integrations/hdfs.md) エンジンテーブルで空のファイルをスキップすることを有効または無効にします。

Possible values:
- 0 — 空のファイルが要求された形式と互換性がない場合、`SELECT` は例外を投げます。
- 1 — 空のファイルの場合、`SELECT` は空の結果を返します。

## hdfs_throw_on_zero_files_match {#hdfs_throw_on_zero_files_match}

Type: Bool

Default value: 0

グロブ拡張ルールに従って一致したファイルがゼロの場合、エラーを投げます。

Possible values:
- 1 — `SELECT` は例外を投げます。
- 0 — `SELECT` は空の結果を返します。

## hdfs_truncate_on_insert {#hdfs_truncate_on_insert}

Type: Bool

Default value: 0

hdfs エンジンテーブルでの挿入前に切り捨てを有効または無効にします。無効の場合、HDFS にファイルが既に存在する場合に挿入を試みると例外がスローされます。

Possible values:
- 0 — `INSERT` クエリはファイルの最後に新しいデータを追加します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。

## hedged_connection_timeout_ms {#hedged_connection_timeout_ms}

Type: Milliseconds

Default value: 50

ヘッジリクエストのためにレプリカとの接続を確立する際のタイムアウト。

## hnsw_candidate_list_size_for_search {#hnsw_candidate_list_size_for_search}
<ExperimentalBadge/>

Type: UInt64

Default value: 256

ベクトル類似性インデックスを検索する際の動的候補リストのサイズ。別名 'ef_search'。

## hsts_max_age {#hsts_max_age}

Type: UInt64

Default value: 0

HSTS の有効期限。0 は HSTS を無効にします。

## http_connection_timeout {#http_connection_timeout}

Type: Seconds

Default value: 1

HTTP 接続タイムアウト（秒）。

Possible values:
- 任意の正の整数。
- 0 - 無効（無限タイムアウト）。

## http_headers_progress_interval_ms {#http_headers_progress_interval_ms}

Type: UInt64

Default value: 100

HTTP ヘッダー X-ClickHouse-Progress を指定された間隔でそれ以上頻繁に送信しません。

## http_make_head_request {#http_make_head_request}

Type: Bool

Default value: 1

`http_make_head_request` 設定は、HTTP からデータを読み取る際に `HEAD` リクエストを実行して、読み取るファイルの情報（サイズなど）を取得できるようにします。デフォルトで有効ですが、サーバーが `HEAD` リクエストをサポートしていない場合にはこの設定を無効にすることが望ましい場合があります。

## http_max_field_name_size {#http_max_field_name_size}

Type: UInt64

Default value: 131072

HTTP ヘッダー内のフィールド名の最大長。

## http_max_field_value_size {#http_max_field_value_size}

Type: UInt64

Default value: 131072

HTTP ヘッダー内のフィールド値の最大長。

## http_max_fields {#http_max_fields}

Type: UInt64

Default value: 1000000

HTTP ヘッダー内の最大フィールド数。

## http_max_multipart_form_data_size {#http_max_multipart_form_data_size}

Type: UInt64

Default value: 1073741824

multipart/form-data コンテンツのサイズ制限。この設定は URL パラメータから解析できず、ユーザープロファイルで設定する必要があります。コンテンツは、クエリの実行開始前にメモリ内で解析され、外部テーブルが作成されます。そして、これはその段階で唯一効果のある制限です（最大メモリ使用量や最大実行時間の制限は、HTTP フォームデータの読み取り中に影響を及ぼしません）。

## http_max_request_param_data_size {#http_max_request_param_data_size}

Type: UInt64

Default value: 10485760

事前定義された HTTP リクエスト内でクエリパラメータとして使用されるリクエストデータのサイズ制限。

## http_max_tries {#http_max_tries}

Type: UInt64

Default value: 10

HTTP 経由で読み取る最大試行回数。

## http_max_uri_size {#http_max_uri_size}

Type: UInt64

Default value: 1048576

HTTP リクエストの最大 URI 長を設定します。

Possible values:
- 正の整数。

## http_native_compression_disable_checksumming_on_decompress {#http_native_compression_disable_checksumming_on_decompress}

Type: Bool

Default value: 0

クライアントからの HTTP POST データを解凍する際のチェックサム検証を有効または無効にします。ClickHouse ネイティブ圧縮形式専用（`gzip` や `deflate` では使用しません）。

詳細については、[HTTP インターフェース説明](../../interfaces/http.md)を読む。

Possible values:
- 0 — 無効。
- 1 — 有効。

## http_receive_timeout {#http_receive_timeout}

Type: Seconds

Default value: 30

HTTP 受信タイムアウト（秒）。

Possible values:
- 任意の正の整数。
- 0 - 無効（無限タイムアウト）。

## http_response_buffer_size {#http_response_buffer_size}

Type: UInt64

Default value: 0

クライアントに対して HTTP 応答を送信する前にサーバーメモリ内にバッファリングするバイト数（http_wait_end_of_query が有効な場合、ディスクにフラッシュされます）。
```

## http_response_headers {#http_response_headers}

Type: Map

Default value: {}

成功したクエリ結果と共にサーバが返すHTTPヘッダーを追加または上書きすることを許可します。この設定はHTTPインターフェースのみに影響します。

ヘッダーがデフォルトで既に設定されている場合、提供された値が上書きされます。デフォルトで設定されていなかったヘッダーは、ヘッダーのリストに追加されます。この設定によって上書きされていないデフォルトで設定されたヘッダーは、そのまま残ります。

この設定はヘッダーを定数値に設定することを可能にします。現在、動的に計算された値に設定する方法はありません。

名前や値にはASCII制御文字を含めることはできません。

ユーザーが設定を変更できるUIアプリケーションを実装し、その一方で返されたヘッダーに基づいて決定を下す場合、この設定を読み取り専用に制限することをお勧めします。

例: `SET http_response_headers = '{"Content-Type": "image/png"}'`
## http_retry_initial_backoff_ms {#http_retry_initial_backoff_ms}

Type: UInt64

Default value: 100

HTTP経由での読み取りを再試行する際のバックオフの最小ミリ秒数
## http_retry_max_backoff_ms {#http_retry_max_backoff_ms}

Type: UInt64

Default value: 10000

HTTP経由での読み取りを再試行する際のバックオフの最大ミリ秒数
## http_send_timeout {#http_send_timeout}

Type: Seconds

Default value: 30

HTTP送信タイムアウト（秒単位）。

可能な値:

- 任意の正の整数。
- 0 - 無効（無限のタイムアウト）。

:::note
これはデフォルトプロファイルにのみ適用されます。変更を有効にするにはサーバーの再起動が必要です。
:::
## http_skip_not_found_url_for_globs {#http_skip_not_found_url_for_globs}

Type: Bool

Default value: 1

HTTP_NOT_FOUNDエラーでのグロブのURLをスキップします
## http_wait_end_of_query {#http_wait_end_of_query}

Type: Bool

Default value: 0

サーバー側でのHTTPレスポンスバッファリングを有効にします。
## http_write_exception_in_output_format {#http_write_exception_in_output_format}

Type: Bool

Default value: 1

有効な出力を生成するために出力フォーマットに例外を書き込みます。JSONおよびXMLフォーマットで機能します。
## http_zlib_compression_level {#http_zlib_compression_level}

Type: Int64

Default value: 3

[enable_http_compression = 1](#enable_http_compression)の場合にHTTPリクエストに対するレスポンスのデータ圧縮レベルを設定します。

可能な値: 1から9までの数字。
## idle_connection_timeout {#idle_connection_timeout}

Type: UInt64

Default value: 3600

指定された秒数が経過した後、アイドルTCP接続を閉じるタイムアウト。

可能な値:

- 正の整数（0 - すぐに閉じる、0秒後）。
## ignore_cold_parts_seconds {#ignore_cold_parts_seconds}

Type: Int64

Default value: 0

ClickHouse Cloudでのみ利用可能。新しいデータパーツを、プリウォームされるまで（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)を参照）またはこの秒数が経過するまでSELECTクエリから除外します。Replicated-/SharedMergeTreeのみに適用されます。
## ignore_data_skipping_indices {#ignore_data_skipping_indices}

Type: String

Default value:

クエリで使用された場合、指定されたスキッピングインデックスを無視します。

次の例を考えてみてください：

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- クエリは CANNOT_PARSE_TEXT エラーを生成します。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- OK。
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- OK。

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- クエリは INDEX_NOT_USED エラーを生成します。xy_idx は明示的に無視されています。
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

インデックスを無視しないクエリ：
```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      主キー
        Condition: true
        Parts: 1/1
        Granules: 1/1
      スキップ
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      スキップ
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
      スキップ
        Name: xy_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

`xy_idx`インデックスを無視した場合：
```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      主キー
        Condition: true
        Parts: 1/1
        Granules: 1/1
      スキップ
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      スキップ
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

MergeTreeファミリーのテーブルで機能します。
## ignore_drop_queries_probability {#ignore_drop_queries_probability}

Type: Float

Default value: 0

有効な場合、サーバは指定された確率で全てのDROPテーブルクエリを無視します（MemoryおよびJOINエンジンの場合、DROPがTRUNCATEに置き換えられます）。テスト目的で使用されます。
## ignore_materialized_views_with_dropped_target_table {#ignore_materialized_views_with_dropped_target_table}

Type: Bool

Default value: 0

視覚にプッシュする際、削除されたターゲットテーブルを持つMVを無視します。
## ignore_on_cluster_for_replicated_access_entities_queries {#ignore_on_cluster_for_replicated_access_entities_queries}

Type: Bool

Default value: 0

レプリケーションされたアクセスエンティティ管理クエリに対するON CLUSTER句を無視します。
## ignore_on_cluster_for_replicated_named_collections_queries {#ignore_on_cluster_for_replicated_named_collections_queries}

Type: Bool

Default value: 0

レプリケーションされた名前付きコレクション管理クエリに対するON CLUSTER句を無視します。
## ignore_on_cluster_for_replicated_udf_queries {#ignore_on_cluster_for_replicated_udf_queries}

Type: Bool

Default value: 0

レプリケーションされたUDF管理クエリに対するON CLUSTER句を無視します。
## implicit_select {#implicit_select}

Type: Bool

Default value: 0

先行するSELECTキーワードなしでシンプルなSELECTクエリを書くことを許可します。これにより、計算機スタイルの使用がシンプルになります。例えば、`1 + 2`が有効なクエリになります。

`clickhouse-local`ではデフォルトで有効になっており、明示的に無効にできます。
## implicit_transaction {#implicit_transaction}
<ExperimentalBadge/>

Type: Bool

Default value: 0

有効にすると、トランザクション内でない場合、クエリを完全なトランザクション内にラップします（begin + commitまたはrollback）。
## input_format_parallel_parsing {#input_format_parallel_parsing}

Type: Bool

Default value: 1

データフォーマットの順序保持並列解析を有効または無効にします。[TSV](../../interfaces/formats.md/#tabseparated)、[TSKV](../../interfaces/formats.md/#tskv)、[CSV](../../interfaces/formats.md/#csv)、および[JSONEachRow](../../interfaces/formats.md/#jsoneachrow)フォーマットのみに対応しています。

可能な値:

- 1 — 有効。
- 0 — 無効。
## insert_allow_materialized_columns {#insert_allow_materialized_columns}

Type: Bool

Default value: 0

この設定が有効な場合、INSERTでマテリアライズドカラムを許可します。
## insert_deduplicate {#insert_deduplicate}

Type: Bool

Default value: 1

`INSERT`（Replicated*テーブル用）のブロック重複排除を有効または無効にします。

可能な値:

- 0 — 無効。
- 1 — 有効。

デフォルトでは、`INSERT`ステートメントによってレプリケートされたテーブルに挿入されたブロックは重複排除されます（[データレプリケーション](../../engines/table-engines/mergetree-family/replication.md)を参照）。
レプリケイトされたテーブルに対してデフォルトで、各パーティションに対する最近の100のブロックのみが重複排除されます（[replicated_deduplication_window](merge-tree-settings.md/#replicated-deduplication-window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated-deduplication-window-seconds)を参照）。
レプリケートされていないテーブルについては、[non_replicated_deduplication_window](merge-tree-settings.md/#non-replicated-deduplication-window)を参照してください。
## insert_deduplication_token {#insert_deduplication_token}

Type: String

Default value:

この設定により、ユーザーがMergeTree/ReplicatedMergeTreeで独自の重複排除のセマンティクスを提供できます。
例えば、各INSERT文で設定にユニークな値を提供することにより、ユーザーは同じ挿入データが重複排除されるのを回避できます。

可能な値:

- 任意の文字列

`insert_deduplication_token`は空でない場合のみ重複排除に使用されます。

レプリケートされたテーブルに対してデフォルトでは、各パーティションに対する最近の100の挿入のみが重複排除されます（[replicated_deduplication_window](merge-tree-settings.md/#replicated-deduplication-window)、[replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated-deduplication-window-seconds)を参照）。
レプリケートされていないテーブルについては、[non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication-window)を参照してください。

:::note
`insert_deduplication_token`はパーティションレベルで動作します（`insert_deduplication`チェックサムと同様）。複数のパーティションが同じ`insert_deduplication_token`を持つことができます。
:::

例:

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- 次の挿入は、insert_deduplication_tokenが異なるため重複排除されません
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- 次の挿入は、insert_deduplication_tokenが以前のいずれかと同じため重複排除されます
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

Type: Float

Default value: 0

挿入中のKeeperリクエストに対する障害の確率の近似値。妥当な値は[0.0f, 1.0f]の範囲にあります。
## insert_keeper_fault_injection_seed {#insert_keeper_fault_injection_seed}

Type: UInt64

Default value: 0

0 - ランダムシード、さもなければ設定の値
## insert_keeper_max_retries {#insert_keeper_max_retries}

Type: UInt64

Default value: 20

この設定は、レプリケートされたMergeTreeへの挿入中にClickHouse Keeper（またはZooKeeper）リクエストの最大再試行回数を設定します。ネットワークエラー、Keeperセッションのタイムアウト、またはリクエストのタイムアウトにより失敗したKeeperリクエストのみが再試行の対象となります。

可能な値:

- 正の整数。
- 0 — 再試行は無効

クラウドデフォルト値: `20`。

Keeperリクエストの再試行は、一定のタイムアウト後に行われます。そのタイムアウトは次の設定によって制御されます: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`。
最初の再試行は`insert_keeper_retry_initial_backoff_ms`タイムアウト後に行われます。その後のタイムアウトは次のように計算されます：
```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

例えば、`insert_keeper_retry_initial_backoff_ms=100`、`insert_keeper_retry_max_backoff_ms=10000`および`insert_keeper_max_retries=8`の場合、タイムアウトは`100, 200, 400, 800, 1600, 3200, 6400, 10000`となります。

障害耐性の他に、再試行はユーザーエクスペリエンスの向上を目指しています - Keeperが再起動中のINSERT実行中にエラーを返さずに済むようにします（例えば、アップグレードによる場合）。
## insert_keeper_retry_initial_backoff_ms {#insert_keeper_retry_initial_backoff_ms}

Type: UInt64

Default value: 100

INSERTクエリ実行中に失敗したKeeperリクエストを再試行するための初期タイムアウト（ミリ秒単位）。

可能な値:

- 正の整数。
- 0 — タイムアウトなし
## insert_keeper_retry_max_backoff_ms {#insert_keeper_retry_max_backoff_ms}

Type: UInt64

Default value: 10000

INSERTクエリ実行中に失敗したKeeperリクエストを再試行するための最大タイムアウト（ミリ秒単位）。

可能な値:

- 正の整数。
- 0 — 最大タイムアウトに制限なし
## insert_null_as_default {#insert_null_as_default}

Type: Bool

Default value: 1

非[nullable](../../sql-reference/data-types/nullable.md/#data_type-nullable)データ型のカラムに[NULL](../../sql-reference/syntax.md/#null-literal)の代わりに[デフォルト値](../../sql-reference/statements/create/table.md/#create-default-values)を挿入することを有効または無効にします。
カラム型がnullableでない場合、この設定が無効な場合、NULLを挿入すると例外が発生します。カラム型がnullableの場合、NULL値はこの設定に関係なくそのまま挿入されます。

この設定は[INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select)クエリに適用されます。注意：`SELECT`サブクエリは`UNION ALL`句で連結可能です。

可能な値:

- 0 — 非nullableカラムにNULLを挿入すると例外が発生します。
- 1 — NULLの代わりにデフォルトのカラム値が挿入されます。
## insert_quorum {#insert_quorum}

Type: UInt64Auto

Default value: 0

:::note
この設定はSharedMergeTreeには適用されません。詳細は[SharedMergeTreeの整合性](/docs/cloud/reference/shared-merge-tree/#consistency)をご覧ください。
:::

クオラム書き込みを有効にします。

- `insert_quorum < 2`の場合、クオラム書き込みは無効です。
- `insert_quorum >= 2`の場合、クオラム書き込みは有効です。
- `insert_quorum = 'auto'`の場合、過半数（`number_of_replicas / 2 + 1`）をクオラム数として使用します。

クオラム書き込み

`INSERT`は、ClickHouseが指定された`insert_quorum_timeout`内に`insert_quorum`指定のレプリカに正しくデータを書き込むことに成功した場合のみ成功します。何らかの理由で成功した書き込みのレプリカの数が`insert_quorum`に達しない場合、書き込みは失敗と見なされ、ClickHouseはデータがすでに書き込まれたすべてのレプリカから挿入されたブロックを削除します。

`insert_quorum_parallel`が無効な場合、クオラム内のすべてのレプリカは一貫性があり、すなわち、すべての以前の`INSERT`クエリのデータを含みます（`INSERT`シーケンスは線形化されます）。`insert_quorum`で書き込まれたデータを読み取る際に、`insert_quorum_parallel`が無効な場合、[select_sequential_consistency](#select_sequential_consistency)を使用して`SELECT`クエリの逐次整合性を有効にすることができます。

ClickHouseは例外を生成します：

- クエリ実行時に利用可能なレプリカの数が`insert_quorum`未満の場合。
- `insert_quorum_parallel`が無効なとき、前のブロックが`insert_quorum`のレプリカにまだ挿入されていないときにデータを書き込もうとする試み。この状況は、ユーザーが前の`INSERT`クエリが完了する前に同じテーブルに別の`INSERT`クエリを実行しようとする場合に発生することがあります。

詳細：

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)
## insert_quorum_parallel {#insert_quorum_parallel}

Type: Bool

Default value: 1

:::note
この設定はSharedMergeTreeには適用されません。詳細は[SharedMergeTreeの整合性](/docs/cloud/reference/shared-merge-tree/#consistency)をご覧ください。
:::

クオラム`INSERT`クエリの並列性を有効または無効にします。有効にすると、以前のクエリがまだ終了していない間に追加の`INSERT`クエリを送信できます。無効にすると、同じテーブルへの追加の書き込みは拒否されます。

可能な値：

- 0 — 無効。
- 1 — 有効。

詳細は：

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)
## insert_quorum_timeout {#insert_quorum_timeout}

Type: Milliseconds

Default value: 600000

クオラムへの書き込みタイムアウトをミリ秒単位で指定します。タイムアウトが経過しても書き込みが行われていない場合、ClickHouseは例外を生成し、クライアントは同じブロックを同じまたは他のレプリカに書き込むためにクエリを繰り返す必要があります。

詳細は：

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)
## insert_shard_id {#insert_shard_id}

Type: UInt64

Default value: 0

`0`でない場合、データが同期的に挿入される[分散テーブル](../../engines/table-engines/special/distributed.md/#distributed)のシャードを指定します。

`insert_shard_id`の値が不正な場合、サーバは例外をスローします。

`requested_cluster`のシャード数を取得するには、サーバー構成を確認するか、以下のクエリを使用します。

``` sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

可能な値：

- 0 — 無効。
- 対応する[分散](../../engines/table-engines/special/distributed.md/#distributed)テーブルの`1`から`shards_num`までの任意の数。

**例**

クエリ：

```sql
CREATE TABLE x AS system.numbers ENGINE = MergeTree ORDER BY number;
CREATE TABLE x_dist AS x ENGINE = Distributed('test_cluster_two_shards_localhost', currentDatabase(), x);
INSERT INTO x_dist SELECT * FROM numbers(5) SETTINGS insert_shard_id = 1;
SELECT * FROM x_dist ORDER BY number ASC;
```

結果：

``` text
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

Type: UInt64

Default value: 100000

リクエスト実行がキャンセルされたかどうかを確認し、進行状況を送信する際の間隔（マイクロ秒単位）。
## intersect_default_mode {#intersect_default_mode}

Type: SetOperationMode

Default value: ALL

INTERSECTクエリでのデフォルトモードを設定します。可能な値: 空文字列、'ALL'、'DISTINCT'。空の場合、モードが指定されていないクエリは例外をスローします。
## join_algorithm {#join_algorithm}

Type: JoinAlgorithm

Default value: direct,parallel_hash,hash

使用される[JOIN](../../sql-reference/statements/select/join.md)アルゴリズムを指定します。

いくつかのアルゴリズムを指定でき、利用可能なものが特定のクエリに対して選択されます。

可能な値：

- grace_hash

 [Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join)が使用されます。Grace hashは、メモリ使用量を制限しながらパフォーマンスの高い複雑な結合を提供するアルゴリズムオプションです。

 Grace joinの最初のフェーズは、右テーブルを読み込み、キー列のハッシュ値に基づいてNバケットに分割します（最初はNは`grace_hash_join_initial_buckets`）。
これは、各バケットが個別に処理できるように行われます。最初のバケットからの行はメモリ内のハッシュテーブルに追加され、他の行はディスクに保存されます。ハッシュテーブルがメモリ制限（e.g. [`max_bytes_in_join`](/docs/operations/settings/query-complexity.md/#max_bytes_in_join)で設定された制限）を超えた場合、バケットの数が増加し、各行の割り当てバケットが再設定されます。現在のバケットに所属しない行はフラッシュされ、再割り当てされます。

 `INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`をサポートします。

- hash

 [Hash joinアルゴリズム](https://en.wikipedia.org/wiki/Hash_join)が使用されます。すべての種類および厳格性と複数の結合キーを`JOIN ON`セクションで`OR`で結合するための最も一般的な実装です。

 `hash`アルゴリズムを使用する場合、JOINの右側はRAMにアップロードされます。

- parallel_hash

 データをバケットに分割し、同時に複数のハッシュテーブルを構築することでこのプロセスを加速する`hash`結合の変種です。

 `parallel_hash`アルゴリズムを使用する場合、JOINの右側はRAMにアップロードされます。

- partial_merge

 [ソートマージアルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join)の変種であり、右テーブルのみが完全にソートされます。

 `RIGHT JOIN`および `FULL JOIN`は、`ALL`厳密さのみに対応します（`SEMI`、`ANTI`、`ANY`、および`ASOF`はサポートされていません）。

 `partial_merge`アルゴリズムを使用する際、ClickHouseはデータをソートし、ディスクにダンプします。ClickHouseの`partial_merge`アルゴリズムは、古典的な実現とはやや異なります。最初に、右テーブルは結合キーでブロックごとにソートされ、ソートされたブロックに対してmin-maxインデックスが作成されます。次に、左テーブルの部分を「結合キー」でソートし、右テーブルに対して結合します。min-maxインデックスは、不要な右テーブルブロックをスキップするためにも使用されます。

- direct

 このアルゴリズムは、右テーブルのストレージがキー値リクエストをサポートする場合に適用可能です。

 `direct`アルゴリズムは、左テーブルの行をキーとして使用して右テーブルに対するルックアップを実行します。これは、[Dictionary](../../engines/table-engines/special/dictionary.md/#dictionary)や[EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md)のような特別なストレージによってのみサポートされ、`LEFT`および`INNER` JOINのみに適用されます。

- auto

 `auto`に設定されると、最初に`hash`結合が試行され、メモリ制限が違反されると、他のアルゴリズムに切り替えられます。

- full_sorting_merge

 完全にソートされた結合テーブルによる[ソートマージアルゴリズム](https://en.wikipedia.org/wiki/Sort-merge_join)。

- prefer_partial_merge

 ClickHouseは常に可能な場合は`partial_merge`結合を使用しようとしますが、そうでない場合は`hash`を使用します。*非推奨*、`partial_merge`、`hash`と同様。

- default (deprecated)

 従来の値であり、もはや使用しないでください。
 これは`direct,hash`と同じ、すなわちまず直接結合を使用し、次にハッシュ結合を使用します（この順序で）。
## join_any_take_last_row {#join_any_take_last_row}

Type: Bool

Default value: 0

`ANY`厳密さの結合操作の動作を変更します。

:::note
この設定は[Join](../../engines/table-engines/special/join.md)エンジンテーブルによる`JOIN`操作にのみ適用されます。
:::

可能な値：

- 0 — 右テーブルに複数の一致する行がある場合、見つかった最初の行のみが結合されます。
- 1 — 右テーブルに複数の一致する行がある場合、見つかった最後の行のみが結合されます。

詳細：

- [JOIN句](../../sql-reference/statements/select/join.md/#select-join)
- [Joinテーブルエンジン](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)
## join_default_strictness {#join_default_strictness}

Type: JoinStrictness

Default value: ALL

[JOIN句](../../sql-reference/statements/select/join.md/#select-join)のデフォルト厳密性を設定します。

可能な値：

- `ALL` — 右テーブルにいくつかの一致する行がある場合、ClickHouseは一致する行の[直積](https://en.wikipedia.org/wiki/Cartesian_product)を作成します。これは標準SQLからの通常の`JOIN`動作です。
- `ANY` — 右テーブルにいくつかの一致する行がある場合、見つかった最初の行のみが結合されます。右テーブルに一致する行が1つのみの場合、`ANY`と`ALL`の結果は同じです。
- `ASOF` — 不確実な一致を持つシーケンスの結合です。
- 空文字列 — クエリに`ALL`または`ANY`が指定されていない場合、ClickHouseは例外をスローします。
## join_on_disk_max_files_to_merge {#join_on_disk_max_files_to_merge}

Type: UInt64

Default value: 64

ディスク上で実行されるMergeJoin操作における並列ソートのために許可されるファイルの数を制限します。

設定の値が大きいほど、より多くのRAMが使用され、ディスクI/Oが少なくなります。

可能な値：

- 2から始まる任意の正の整数。
## join_output_by_rowlist_perkey_rows_threshold {#join_output_by_rowlist_perkey_rows_threshold}

Type: UInt64

Default value: 5

ハッシュ結合において、右テーブルの1キーあたりの平均行数の下限を設定し、行リストによる出力を決定します。
## join_overflow_mode {#join_overflow_mode}

Type: OverflowMode

Default value: throw

制限を超えた場合の処理方法。
## join_to_sort_maximum_table_rows {#join_to_sort_maximum_table_rows}
<ExperimentalBadge/>

Type: UInt64

Default value: 10000

左または内部結合において、右テーブルをキーによって再整理するかどうかを決定するための、右テーブルの最大行数。
## join_to_sort_minimum_perkey_rows {#join_to_sort_minimum_perkey_rows}
<ExperimentalBadge/>

Type: UInt64

Default value: 40

左または内部結合において、右テーブルをキーによって再整理するかどうかを決定するための、右テーブルの1キーあたりの平均行数の下限。設定はスパーステーブルキーに対して最適化が適用されないことを保証します。
## join_use_nulls {#join_use_nulls}

Type: Bool

Default value: 0

[JOIN](../../sql-reference/statements/select/join.md)動作のタイプを設定します。テーブルをマージする際、空のセルが現れる場合があります。ClickHouseはこの設定に基づいてそれらを異なった方法で埋めます。

可能な値：

- 0 — 空のセルは対応するフィールド型のデフォルト値で埋められます。
- 1 — `JOIN`は標準SQLと同じ動作をします。対応するフィールド型は[Nullable](../../sql-reference/data-types/nullable.md/#data_type-nullable)に変換され、空のセルは[NULL](../../sql-reference/syntax.md)で埋められます。
## joined_subquery_requires_alias {#joined_subquery_requires_alias}

Type: Bool

Default value: 1

結合されたサブクエリおよびテーブル関数に正しい名前の資格を与えるためにエイリアスを持たせることを強制します。
## kafka_disable_num_consumers_limit {#kafka_disable_num_consumers_limit}

Type: Bool

Default value: 0

利用可能なCPUコアの数に依存するkafka_num_consumersの制限を無効にします。
## kafka_max_wait_ms {#kafka_max_wait_ms}

Type: Milliseconds

Default value: 5000

[Kafka](../../engines/table-engines/integrations/kafka.md/#kafka)からメッセージを読む際の待機時間（ミリ秒単位）を指定します。

可能な値：

- 正の整数。
- 0 — 無限のタイムアウト。

詳細：

- [Apache Kafka](https://kafka.apache.org/)
## keeper_map_strict_mode {#keeper_map_strict_mode}

Type: Bool

Default value: 0

KeeperMap上の操作中に追加のチェックを強制します。例えば、既に存在するキーへの挿入時に例外をスローします。
## keeper_max_retries {#keeper_max_retries}

Type: UInt64

Default value: 10

一般的なKeeper操作の最大再試行回数
## keeper_retry_initial_backoff_ms {#keeper_retry_initial_backoff_ms}

Type: UInt64

Default value: 100

一般的なKeeper操作に対する初期バックオフタイムアウト
## keeper_retry_max_backoff_ms {#keeper_retry_max_backoff_ms}

Type: UInt64

Default value: 5000

一般的なKeeper操作に対する最大バックオフタイムアウト
## least_greatest_legacy_null_behavior {#least_greatest_legacy_null_behavior}

Type: Bool

Default value: 0

有効な場合、'least'および'greatest'関数はその引数の一つがNULLであればNULLを返します。
## legacy_column_name_of_tuple_literal {#legacy_column_name_of_tuple_literal}

Type: Bool

Default value: 0

大きなタプルリテラルのすべての要素の名前を、そのハッシュではなくカラム名にリストします。この設定は互換性のためだけに存在します。バージョン21.7未満から高いバージョンへのクラスターのローリングアップデートを行う際に'true'に設定するのが理にかなっています。
## lightweight_deletes_sync {#lightweight_deletes_sync}

Type: UInt64

Default value: 2

[`mutations_sync`](#mutations_sync)と同様ですが、軽量削除の実行のみを制御します。

可能な値：

- 0 - ミューテーションは非同期で実行されます。
- 1 - クエリは現在のサーバで軽量削除が完了するまで待機します。
- 2 - クエリはすべてのレプリカ（存在する場合）で軽量削除が完了するまで待機します。

**参照**

- [ALTERクエリの同期性](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [ミューテーション](../../sql-reference/statements/alter/index.md/#mutations)
## limit {#limit}

Type: UInt64

Default value: 0

クエリ結果から取得する最大行数を設定します。これは[LIMIT](../../sql-reference/statements/select/limit.md/#limit-clause)句で設定された値を調整し、クエリで指定された制限がこの設定で設定された制限を超えないようにします。

可能な値：

- 0 — 行数に制限なし。
- 正の整数。
## live_view_heartbeat_interval {#live_view_heartbeat_interval}
<ExperimentalBadge/>

Type: Seconds

Default value: 15

ライブクエリが生きていることを示すためのハートビートの間隔（秒単位）。
## load_balancing {#load_balancing}

Type: LoadBalancing

Default value: random

分散クエリ処理におけるレプリカ選択のアルゴリズムを指定します。

ClickHouseはレプリカ選択のために以下のアルゴリズムをサポートします：

- [ランダム](#load_balancing-random) (デフォルト)
- [最寄りのホスト名](#load_balancing-nearest_hostname)
- [ホスト名のレーベンシュタイン距離](#load_balancing-hostname_levenshtein_distance)
- [順番に](#load_balancing-in_order)
- [最初またはランダム](#load_balancing-first_or_random)
- [ラウンドロビン](#load_balancing-round_robin)

詳細：

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)
### ランダム（デフォルト） {#load_balancing-random}

``` sql
load_balancing = random
```

エラーの数は各レプリカに対してカウントされます。クエリはエラーの少ないレプリカに送信され、もし複数存在する場合はその中のいずれかに送信されます。
欠点：サーバの近接性は考慮されず、もしレプリカが異なるデータを持っている場合、異なるデータが返される可能性があります。
```
### Nearest Hostname {#load_balancing-nearest_hostname}

``` sql
load_balancing = nearest_hostname
```

各レプリカのエラー数をカウントします。5分ごとにエラー数は2で割られます。したがって、最近の時間に対してエラー数が指数平滑化された形で計算されます。最小のエラー数を持つレプリカが1つであれば（つまり、他のレプリカでは最近エラーが発生している場合）、クエリはそのレプリカに送信されます。最小のエラー数を持つレプリカが複数ある場合は、設定ファイルのサーバーのホスト名に最も類似したホスト名を持つレプリカにクエリが送信されます（同じ位置における異なる文字の数に基づき、両方のホスト名の最小長さまで）。

例えば、example01-01-1 と example01-01-2 は1つの位置で異なり、example01-01-1 と example01-02-2 は2つの場所で異なります。
この方法は初歩的に見えるかもしれませんが、ネットワークトポロジーに関する外部データを必要とせず、IPアドレスを比較する必要もないため、IPv6アドレスについては複雑さが軽減されます。

したがって、同等のレプリカがある場合、名前で最も近いものが好まれます。
同じサーバーにクエリを送信する際、障害が発生しない限り、分散クエリも同じサーバーに送信されると考えられます。そのため、異なるデータがレプリカに配置されていても、クエリはほぼ同じ結果を返します。

### Hostname levenshtein distance {#load_balancing-hostname_levenshtein_distance}

``` sql
load_balancing = hostname_levenshtein_distance
```

`nearest_hostname` と同様ですが、ホスト名を [レーベンシュタイン距離](https://en.wikipedia.org/wiki/Levenshtein_distance) に基づいて比較します。例えば：

``` text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```

### In Order {#load_balancing-in_order}

``` sql
load_balancing = in_order
```

同じエラー数のレプリカには、設定されている順序でアクセスします。
この方法は、どのレプリカが好ましいかを正確に知っているときに適しています。

### First or Random {#load_balancing-first_or_random}

``` sql
load_balancing = first_or_random
```

このアルゴリズムは、セット内の最初のレプリカを選択するか、最初のレプリカが使用できない場合はランダムなレプリカを選択します。このアルゴリズムは、クロスレプリケーションのトポロジーセットアップに効果的ですが、他の構成では無駄です。

`first_or_random` アルゴリズムは、`in_order` アルゴリズムの問題を解決します。`in_order` の場合、1つのレプリカがダウンすると、次のレプリカは二重の負荷を受け、残りのレプリカは通常のトラフィックを処理します。`first_or_random` アルゴリズムを使用することにより、利用可能なレプリカ間で負荷が均等に分配されます。

最初のレプリカを明示的に定義することは、設定 `load_balancing_first_offset` を使用することで可能です。これにより、レプリカ間でクエリのワークロードを再バランスする制御が強化されます。

### Round Robin {#load_balancing-round_robin}

``` sql
load_balancing = round_robin
```

このアルゴリズムは、同じエラー数のレプリカに対してラウンドロビン方式を使用します（`round_robin` ポリシーのクエリのみがカウントされます）。

## load_balancing_first_offset {#load_balancing_first_offset}

Type: UInt64

Default value: 0

FIRST_OR_RANDOM 負荷分散戦略を使用する場合、どのレプリカに優先的にクエリを送信するかを決定します。

## load_marks_asynchronously {#load_marks_asynchronously}

Type: Bool

Default value: 0

MergeTree マークを非同期に読み込む。

## local_filesystem_read_method {#local_filesystem_read_method}

Type: String

Default value: pread_threadpool

ローカルファイルシステムからデータを読み込むためのメソッド：read, pread, mmap, io_uring, pread_threadpool のいずれか。 'io_uring' メソッドは実験的であり、Log, TinyLog, StripeLog, File, Set, Join などの同時に読み書き可能なファイルを持つテーブルには機能しません。

## local_filesystem_read_prefetch {#local_filesystem_read_prefetch}

Type: Bool

Default value: 0

ローカルファイルシステムからデータを読み込む際にプレフェッチを使用するかどうか。

## lock_acquire_timeout {#lock_acquire_timeout}

Type: Seconds

Default value: 120

ロック要求が失敗する前に待機する秒数を定義します。

ロックタイムアウトは、テーブルと連携した読み取り/書き込み操作の実行中にデッドロックから保護するために使用されます。タイムアウトが切れると、ロック要求は失敗し、ClickHouse サーバーは「ロック取得の試行タイムアウト！デッドロックを回避しました。クライアントは再試行する必要があります。」という例外をスローします。

可能な値：

- 正の整数 (秒単位)。
- 0 — ロックタイムアウト無し。

## log_comment {#log_comment}

Type: String

Default value:

`system.query_log` テーブルの `log_comment` フィールドの値およびサーバーログのコメントテキストを指定します。

これは、サーバーログの可読性を向上させるために使用できます。さらに、[clickhouse-test](../../development/tests.md)を実行した後に、テストに関連するクエリを `system.query_log` から選択するのに役立ちます。

可能な値：

- [max_query_size](#max_query_size) より長くない任意の文字列。max_query_size を超えると、サーバーは例外をスローします。

**例**

クエリ：

``` sql
SET log_comment = 'log_comment test', log_queries = 1;
SELECT 1;
SYSTEM FLUSH LOGS;
SELECT type, query FROM system.query_log WHERE log_comment = 'log_comment test' AND event_date >= yesterday() ORDER BY event_time DESC LIMIT 2;
```

結果：

``` text
┌─type────────┬─query─────┐
│ QueryStart  │ SELECT 1; │
│ QueryFinish │ SELECT 1; │
└─────────────┴───────────┘
```

## log_formatted_queries {#log_formatted_queries}

Type: Bool

Default value: 0

[system.query_log](../../operations/system-tables/query_log.md) システムテーブルにフォーマット済みのクエリをログすることを許可します（`formatted_query` カラムが [system.query_log](../../operations/system-tables/query_log.md)に追加されます）。

可能な値：

- 0 — フォーマット済みのクエリはシステムテーブルにログされません。
- 1 — フォーマット済みのクエリはシステムテーブルにログされます。

## log_processors_profiles {#log_processors_profiles}

Type: Bool

Default value: 1

実行中にプロセッサが費やした時間を書き込む、`system.processors_profile_log` テーブルに。

参照：

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events {#log_profile_events}

Type: Bool

Default value: 1

クエリパフォーマンス統計を `query_log`, `query_thread_log`, `query_views_log` にログします。

## log_queries {#log_queries}

Type: Bool

Default value: 1

クエリのログを設定します。

この設定を使用して ClickHouse に送信されたクエリは、[query_log](../../operations/server-configuration-parameters/settings.md/#query-log) サーバー設定パラメータのルールに従ってログされます。

例：

``` text
log_queries=1
```

## log_queries_cut_to_length {#log_queries_cut_to_length}

Type: UInt64

Default value: 100000

クエリの長さが指定されたしきい値 (バイト単位) を超える場合、クエリを書き込む際に切り捨てます。また、通常のテキストログでのクエリの印刷長さを制限します。

## log_queries_min_query_duration_ms {#log_queries_min_query_duration_ms}

Type: Milliseconds

Default value: 0

有効にすると (非ゼロ)、この設定値よりも速いクエリはログされません（これは、[MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/en/slow-query-log.html) の `long_query_time` のように考えることができます）。これにより、次のテーブルでは見つからなくなります：

- `system.query_log`
- `system.query_thread_log`

以下のタイプのクエリのみがログに記録されます：

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- Type: ミリ秒
- Default value: 0 (あらゆるクエリ)

## log_queries_min_type {#log_queries_min_type}

Type: LogQueriesType

Default value: QUERY_START

`query_log` にログする最小タイプ。

可能な値：
- `QUERY_START` (`=1`)
- `QUERY_FINISH` (`=2`)
- `EXCEPTION_BEFORE_START` (`=3`)
- `EXCEPTION_WHILE_PROCESSING` (`=4`)

これを使用してどのエンティティが `query_log` に記録されるかを制限できます。例えば、エラーのみに興味がある場合は `EXCEPTION_WHILE_PROCESSING` を使用します：

``` text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```

## log_queries_probability {#log_queries_probability}

Type: Float

Default value: 1

ユーザーが、指定した確率で無作為に選択されたクエリのサンプルのみを [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [query_views_log](../../operations/system-tables/query_views_log.md) システムテーブルに書き込むことを許可します。これは、高いボリュームのクエリが一秒間に流れるときの負荷を軽減するのに役立ちます。

可能な値：

- 0 — クエリはシステムテーブルにログされません。
- 0..1 の間の正の浮動小数点数。たとえば、設定値が `0.5` の場合、ほぼ半分のクエリがシステムテーブルにログされます。
- 1 — すべてのクエリがシステムテーブルにログされます。

## log_query_settings {#log_query_settings}

Type: Bool

Default value: 1

クエリ設定を query_log と OpenTelemetry span log にログします。

## log_query_threads {#log_query_threads}

Type: Bool

Default value: 0

クエリスレッドログを設定します。

クエリスレッドは [system.query_thread_log](../../operations/system-tables/query_thread_log.md) テーブルにログされます。この設定は、[log_queries](#log_queries) が true の場合にのみ有効です。この設定での ClickHouse によって実行されるクエリスレッドは、[query_thread_log](../../operations/server-configuration-parameters/settings.md/#query_thread_log) サーバー設定パラメータのルールに従ってログされます。

可能な値：

- 0 — 無効。
- 1 — 有効。

**例**

``` text
log_query_threads=1
```

## log_query_views {#log_query_views}

Type: Bool

Default value: 1

クエリビューのログを設定します。

この設定を有効にした ClickHouse で実行されたクエリに関連するビュー（マテリアライズドビューまたはライブビュー）が、[query_views_log](../../operations/server-configuration-parameters/settings.md/#query_views_log) サーバー設定パラメータにログされます。

例：

``` text
log_query_views=1
```

## low_cardinality_allow_in_native_format {#low_cardinality_allow_in_native_format}

Type: Bool

Default value: 1

[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型を [Native](../../interfaces/formats.md/#native) フォーマットで使用できるか制限します。

`LowCardinality` の使用が制限されている場合、ClickHouse サーバーは `SELECT` クエリ用に `LowCardinality` カラムを通常のカラムに変換し、`INSERT` クエリ用に通常のカラムを `LowCardinality` カラムに変換します。

この設定は主に、`LowCardinality` データ型をサポートしていないサードパーティクライアント向けに必要です。

可能な値：

- 1 — `LowCardinality` の使用に制限はありません。
- 0 — `LowCardinality` の使用が制限されています。

## low_cardinality_max_dictionary_size {#low_cardinality_max_dictionary_size}

Type: UInt64

Default value: 8192

共有グローバル辞書の最大サイズ（行数）を設定します。これは、[LowCardinality](../../sql-reference/data-types/lowcardinality.md) データ型がストレージファイルシステムに書き込むことができるものです。この設定は、辞書の無限成長に伴う RAM の問題を防ぎます。最大辞書サイズ制限のために符号化できないすべてのデータは、ClickHouse が通常の方法で書き込みます。

可能な値：

- 0 以上の任意の整数。

## low_cardinality_use_single_dictionary_for_part {#low_cardinality_use_single_dictionary_for_part}

Type: Bool

Default value: 0

データパーツ用の単一辞書の使用をオンまたはオフにします。

デフォルトでは、ClickHouse サーバーは辞書のサイズを監視し、辞書がオーバーフローすると新しい辞書の書き込みを開始します。部分ごとに複数の辞書を作成することを禁止するには、`low_cardinality_use_single_dictionary_for_part = 1`に設定します。

可能な値：

- 1 — データパーツに対する複数の辞書の作成が禁止されます。
- 0 — データパーツに対する複数の辞書の作成は禁止されません。

## materialize_skip_indexes_on_insert {#materialize_skip_indexes_on_insert}

Type: Bool

Default value: 1

INSERTがスキップインデックスを構築して保存する場合。無効にすると、スキップインデックスはマージ中または明示的な MATERIALIZE INDEX によって構築および保存されます。

## materialize_statistics_on_insert {#materialize_statistics_on_insert}

Type: Bool

Default value: 1

INSERTが統計を構築して挿入する場合。無効にすると、統計はマージ中または明示的な MATERIALIZE STATISTICS で構築され、保存されます。

## materialize_ttl_after_modify {#materialize_ttl_after_modify}

Type: Bool

Default value: 1

ALTER MODIFY TTL クエリの後に、古いデータに TTL を適用します。

## materialized_views_ignore_errors {#materialized_views_ignore_errors}

Type: Bool

Default value: 0

マテリアライズドビューのエラーを無視し、MVs に関係なく元のブロックをテーブルに提供します。

## max_analyze_depth {#max_analyze_depth}

Type: UInt64

Default value: 5000

インタープリターによって実行される最大分析回数。

## max_ast_depth {#max_ast_depth}

Type: UInt64

Default value: 1000

クエリ構文ツリーの最大深さ。パース後にチェックされます。

## max_ast_elements {#max_ast_elements}

Type: UInt64

Default value: 50000

ノードの数でのクエリ構文ツリーの最大サイズ。パース後にチェックされます。

## max_autoincrement_series {#max_autoincrement_series}

Type: UInt64

Default value: 1000

`generateSeriesID` 関数によって作成されるシリーズの最大数。

各シリーズは Keeper のノードを表すため、数百万程度にとどめておくことをお勧めします。

## max_backup_bandwidth {#max_backup_bandwidth}

Type: UInt64

Default value: 0

サーバー上の特定のバックアップに対する最大読み取り速度（バイト/秒）。ゼロは無制限を意味します。

## max_block_size {#max_block_size}

Type: UInt64

Default value: 65409

ClickHouse では、データはブロックによって処理されます。これらはカラムパーツのセットです。単一のブロックに対する内部処理サイクルは効率的ですが、各ブロックを処理する際のコストは際立っています。

`max_block_size` 設定は、テーブルからデータをロードする際に単一のブロックに含めることが推奨される最大行数を示します。`max_block_size` のサイズのブロックは常にテーブルからロードされるわけではありません。ClickHouse が取得するデータが少ないと判断した場合は、より小さなブロックが処理されます。

ブロックサイズが小さすぎると、各ブロック処理にかかるコストが目立つようになるため、注意が必要です。また、大きすぎる場合は、LIMIT 句を持つクエリが最初のブロック処理後に迅速に実行されないため、過度に大きいことは避けるべきです。`max_block_size` を設定する際には、大量のカラムを複数のスレッドで抽出する際にメモリを過剰に消費せず、ある程度のキャッシュローカリティを維持することが目標です。

## max_bytes_before_external_group_by {#max_bytes_before_external_group_by}

Type: UInt64

Default value: 0

GROUP BY 操作中のメモリ使用量がバイトでこのしきい値を超える場合、'external aggregation' モードを有効にします（データをディスクにスピルします）。推奨値は、使用可能なシステムメモリの半分です。

## max_bytes_before_external_sort {#max_bytes_before_external_sort}

Type: UInt64

Default value: 0

ORDER BY 操作中のメモリ使用量がバイトでこのしきい値を超える場合、'external sorting' モードを有効にします（データをディスクにスピルします）。推奨値は、使用可能なシステムメモリの半分です。

## max_bytes_before_remerge_sort {#max_bytes_before_remerge_sort}

Type: UInt64

Default value: 1000000000

LIMIT を持つ ORDER BY の場合、メモリ使用量が指定されたしきい値を超えた際に、最終的なマージの前にブロックを再マージする追加のステップを実施します。これにより、上位の LIMIT 行のみを保持します。

## max_bytes_in_distinct {#max_bytes_in_distinct}

Type: UInt64

Default value: 0

DISTINCT の実行中の状態の最大サイズ（未圧縮バイト単位）。

## max_bytes_in_join {#max_bytes_in_join}

Type: UInt64

Default value: 0

JOIN 用のハッシュテーブルの最大サイズ（メモリ内のバイト数）。

## max_bytes_in_set {#max_bytes_in_set}

Type: UInt64

Default value: 0

IN セクションの実行から得られたセットの最大サイズ（メモリ内のバイト単位）。

## max_bytes_ratio_before_external_group_by {#max_bytes_ratio_before_external_group_by}

Type: Double

Default value: 0.5

外部 GROUP BY を有効にする前の使用メモリの比率。この設定を 0.6 にすると、クエリの許可されるメモリの 60% に達すると外部 GROUP BY が使用されるようになります。

## max_bytes_ratio_before_external_sort {#max_bytes_ratio_before_external_sort}

Type: Double

Default value: 0.5

外部 ORDER BY を有効にする前の使用メモリの比率。この設定を 0.6 にすると、クエリの許可されるメモリの 60% に達すると外部 ORDER BY が使用されるようになります。

## max_bytes_to_read {#max_bytes_to_read}

Type: UInt64

Default value: 0

最も「深い」ソースから読み取るバイトの制限（解凍後）。つまり、最も深いサブクエリのみ。リモートサーバーから読み取る場合、これはリモートサーバーでのみチェックされます。

## max_bytes_to_read_leaf {#max_bytes_to_read_leaf}

Type: UInt64

Default value: 0

分散クエリのリーフノードで読み取るバイト（解凍後）の制限。制限はローカル読み取りのみに適用され、ルートノードでの最終的なマージステージを除外します。この設定は `prefer_localhost_replica=1` と使用する際には不安定です。

## max_bytes_to_sort {#max_bytes_to_sort}

Type: UInt64

Default value: 0

ORDER BY 操作のために処理しなければならない（未圧縮）バイトが指定された量を超える場合、動作は 'sort_overflow_mode' によって決定されます。デフォルトでは、- 例外をスローします。

## max_bytes_to_transfer {#max_bytes_to_transfer}

Type: UInt64

Default value: 0

GLOBAL IN/JOIN セクションの実行時に取得される外部テーブルの最大サイズ（未圧縮バイト単位）。

## max_columns_to_read {#max_columns_to_read}

Type: UInt64

Default value: 0

クエリが指定された列数を超えて読み取る必要がある場合、例外がスローされます。ゼロの値は無制限を意味します。この設定は、あまりにも複雑なクエリを防ぐのに役立ちます。

## max_compress_block_size {#max_compress_block_size}

Type: UInt64

Default value: 1048576

テーブルに書き込むための圧縮前の未圧縮データの最大ブロックサイズ。デフォルトは1,048,576 (1 MiB)です。小さなブロックサイズを指定すると、圧縮率がわずかに減少し、キャッシュローカリティのために圧縮速度と解凍速度がわずかに向上し、メモリー消費が減ります。

:::note
これはエキスパートレベルの設定であり、ClickHouse を始めたばかりの方は変更しない方が良いでしょう。
:::

圧縮のためのブロック（バイトのチャンク）とクエリ処理のためのブロック（テーブルからの行のセット）を混同しないでください。

## max_concurrent_queries_for_all_users {#max_concurrent_queries_for_all_users}

Type: UInt64

Default value: 0

この設定の値が現在同時に処理されているクエリの数以下の場合、例外をスローします。

例： `max_concurrent_queries_for_all_users` を99に設定し、データベース管理者がそれを100に設定して調査のためにクエリを実行できるようにします（サーバーがオーバーロードされている場合でも）。

1つのクエリまたはユーザーに対する設定を変更しても、他のクエリには影響しません。

可能な値：

- 正の整数。
- 0 — 制限なし。

**例**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**参照**

- [max_concurrent_queries](/docs/operations/server-configuration-parameters/settings.md/#max_concurrent_queries)

## max_concurrent_queries_for_user {#max_concurrent_queries_for_user}

Type: UInt64

Default value: 0

ユーザーごとに同時に処理される最大クエリ数。

可能な値：

- 正の整数。
- 0 — 制限なし。

**例**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```

## max_distributed_connections {#max_distributed_connections}

Type: UInt64

Default value: 1024

単一の Distributed テーブルへの単一クエリの分散処理のためのリモートサーバーとの同時接続の最大数。クラスター内のサーバーの数以上に設定することをお勧めします。

以下のパラメータは、Distributed テーブルを作成する際（およびサーバーを起動する際）にのみ使用されるため、実行時に変更する必要はありません。

## max_distributed_depth {#max_distributed_depth}

Type: UInt64

Default value: 5

[Distributed](../../engines/table-engines/special/distributed.md) テーブルの再帰的クエリの最大深さを制限します。

値が超過すると、サーバーは例外をスローします。

可能な値：

- 正の整数。
- 0 — 制限なし。

## max_download_buffer_size {#max_download_buffer_size}

Type: UInt64

Default value: 10485760

各スレッドの並行ダウンロード（例：URL エンジン）のためのバッファの最大サイズ。

## max_download_threads {#max_download_threads}

Type: MaxThreads

Default value: 4

データをダウンロードするためのスレッドの最大数（例：URL エンジン）。

## max_estimated_execution_time {#max_estimated_execution_time}

Type: Seconds

Default value: 0

クエリの推定実行時間の最大値（秒）。

## max_execution_speed {#max_execution_speed}

Type: UInt64

Default value: 0

秒あたりの最大実行行数。

## max_execution_speed_bytes {#max_execution_speed_bytes}

Type: UInt64

Default value: 0

秒あたりの最大実行バイト数。

## max_execution_time {#max_execution_time}

Type: Seconds

Default value: 0

クエリのランタイムが指定された秒数を超えると、動作は 'timeout_overflow_mode' によって決定されます。デフォルトでは、- 例外をスローします。タイムアウトはチェックされ、クエリはデータ処理中の指定された場所でのみ停止できます。現在、集約状態のマージ中やクエリ分析中に停止することは不可能であり、実際のランタイムはこの設定の値よりも高くなります。

## max_execution_time_leaf {#max_execution_time_leaf}

Type: Seconds

Default value: 0

`max_execution_time` と同様の意味ですが、分散クエリのリーフノードにのみ適用されます。タイムアウト動作は 'timeout_overflow_mode_leaf' によって決定されます。デフォルトでは、- 例外をスローします。

## max_expanded_ast_elements {#max_expanded_ast_elements}

Type: UInt64

Default value: 500000

エイリアスとアスタリスクの展開後の、クエリ構文ツリーの最大サイズ（ノード数）。

## max_fetch_partition_retries_count {#max_fetch_partition_retries_count}

Type: UInt64

Default value: 5

別のホストからパーティションを取得する際の再試行回数。

## max_final_threads {#max_final_threads}

Type: MaxThreads

Default value: 'auto(12)'

[FINAL](../../sql-reference/statements/select/from.md/#select-from-final) 修飾子を持つ `SELECT` クエリデータ読み取りフェーズの並行スレッドの最大数を設定します。

可能な値：

- 正の整数。
- 0 または 1 — 無効。 `SELECT` クエリは単一スレッドで実行されます。

## max_http_get_redirects {#max_http_get_redirects}

Type: UInt64

Default value: 0

許可される HTTP GET リダイレクトの最大数。悪意のあるサーバーによって予期しないサービスにリクエストがリダイレクトされるのを防ぐための追加のセキュリティ対策です。\n\nこれは外部サーバーが別のアドレスにリダイレクトする場合ですが、そのアドレスは企業インフラ内に見える場合です。この場合、HTTP リクエストを内部サーバーに送信すると、認証を回避して内部ネットワークから内部 API をリクエストしたり、Redis や Memcached などの他のサービスにクエリをすることができます。内部インフラ（ローカルホスト上で実行されるものを含む）がない場合や、サーバーを信頼する場合は、リダイレクトを許可しても安全です。ただし、URL が HTTPS ではなく HTTP を使用している場合は、リモートサーバーだけでなく、自分のISPおよび中間のすべてのネットワークも信頼しなければなりません。

## max_hyperscan_regexp_length {#max_hyperscan_regexp_length}

Type: UInt64

Default value: 0

[hyperscan マルチマッチ関数](../../sql-reference/functions/string-search-functions.md/#multimatchanyhaystack-pattern1-pattern2-patternn)内の各正規表現の最大長を定義します。

可能な値：

- 正の整数。
- 0 - 長さに制限はありません。

**例**

クエリ：

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
例外：正規表現の長さが大きすぎます。
```

**参照**

- [max_hyperscan_regexp_total_length](#max_hyperscan_regexp_total_length)

## max_hyperscan_regexp_total_length {#max_hyperscan_regexp_total_length}

Type: UInt64

Default value: 0

各 [hyperscan マルチマッチ関数](../../sql-reference/functions/string-search-functions.md/#multimatchanyhaystack-pattern1-pattern2-patternn) におけるすべての正規表現の最大長を設定します。

可能な値：

- 正の整数。
- 0 - 長さに制限はありません。

**例**

クエリ：

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
例外：正規表現の合計長が大きすぎます。
```

**参照**

- [max_hyperscan_regexp_length](#max_hyperscan_regexp_length)

## max_insert_block_size {#max_insert_block_size}

Type: UInt64

Default value: 1048449

テーブルに挿入するために形成されるブロックのサイズ（行数単位）。
この設定は、サーバーがブロックを形成する場合にのみ適用されます。
たとえば、HTTP インターフェイスを介した INSERT の場合、サーバーはデータフォーマットを解析し、指定されたサイズのブロックを形成します。
しかし、clickhouse-client を使用する場合、クライアントは自分でデータを解析し、サーバーの 'max_insert_block_size' 設定は挿入されるブロックのサイズには影響しません。
また、INSERT SELECT を使用する場合にも目的はありません。SELECT の後に形成されるブロックと同じブロックが挿入されるためです。

デフォルト値は、`max_block_size` よりわずかに大きく設定されています。その理由は、一部のテーブルエンジン（`*MergeTree`）が挿入された各ブロックのためにディスク上でデータ部分を形成するためです。これにより、非常に大きなエンティティが形成されます。同様に、`*MergeTree` テーブルは挿入中にデータをソートし、大きなブロックサイズではメモリ内でより多くのデータをソート可能になります。

## max_insert_delayed_streams_for_parallel_write {#max_insert_delayed_streams_for_parallel_write}

Type: UInt64

Default value: 0

最終部分フラッシュを遅延させる最大ストリーム数（カラム数）。デフォルトは auto (基盤となるストレージが並行書き込みをサポートする場合は1000、そうでない場合は無効)。

## max_insert_threads {#max_insert_threads}

Type: UInt64

Default value: 0

INSERT SELECT クエリを実行するための最大スレッド数。

可能な値：

- 0（または1） — `INSERT SELECT` の並行実行は無効。
- 正の整数。1 より大きい。

クラウドのデフォルト値：サービスのサイズに応じて、2 から 4 の間。

並行 `INSERT SELECT` は、SELECT 部分が並行して実行される場合にのみ影響を持ちます。詳細は [max_threads](#max_threads) 設定を参照してください。
より高い値は、より高いメモリ使用量を引き起こします。

## max_joined_block_size_rows {#max_joined_block_size_rows}

Type: UInt64

Default value: 65409

JOIN 結果の最大ブロックサイズ（ジョインアルゴリズムがサポートしている場合）。0 は無制限を意味します。

## max_limit_for_ann_queries {#max_limit_for_ann_queries}
<ExperimentalBadge/>

Type: UInt64

Default value: 1000000

この設定を超える LIMIT を持つ SELECT クエリは、ベクトル類似インデックスを使用できません。ベクトル類似インデックスにおけるメモリのオーバーフローを防ぐのに役立ちます。

## max_live_view_insert_blocks_before_refresh {#max_live_view_insert_blocks_before_refresh}
<ExperimentalBadge/>

Type: UInt64

Default value: 64

統合可能なブロックが破棄され、クエリが再実行される前に挿入されたブロックの最大数を制限します。

## max_local_read_bandwidth {#max_local_read_bandwidth}

Type: UInt64

Default value: 0

ローカル読み取りの最大速度（バイト/秒）。

## max_local_write_bandwidth {#max_local_write_bandwidth}

Type: UInt64

Default value: 0

ローカル書き込みの最大速度（バイト/秒）。

## max_memory_usage {#max_memory_usage}

Type: UInt64

Default value: 0

単一クエリの処理に対する最大メモリ使用量。ゼロは無制限を意味します。

## max_memory_usage_for_user {#max_memory_usage_for_user}

Type: UInt64

Default value: 0

ユーザーごとに同時に実行されているすべてのクエリの処理に対する最大メモリ使用量。ゼロは無制限を意味します。

## max_network_bandwidth {#max_network_bandwidth}

Type: UInt64

Default value: 0

データ交換の速度をバイト/秒で制限します。この設定は、すべてのクエリに適用されます。

可能な値：

- 正の整数。
- 0 — 帯域幅制御は無効です。
## max_network_bandwidth_for_user {#max_network_bandwidth_for_user}

タイプ： UInt64

デフォルト値： 0

ネットワークを通じてのデータ交換速度をバイト毎秒で制限します。この設定は、単一のユーザーによって同時に実行されるすべてのクエリに適用されます。

可能な値：

- 正の整数。
- 0 — データ速度の制御が無効になります。

## max_network_bytes {#max_network_bytes}

タイプ： UInt64

デフォルト値： 0

クエリを実行する際に、ネットワーク経由で受信または送信されるデータのボリューム（バイト単位）を制限します。この設定は、各個別のクエリに適用されます。

可能な値：

- 正の整数。
- 0 — データボリューム制御が無効になります。

## max_number_of_partitions_for_independent_aggregation {#max_number_of_partitions_for_independent_aggregation}

タイプ： UInt64

デフォルト値： 128

最適化を適用するためのテーブル内のパーティションの最大数。

## max_parallel_replicas {#max_parallel_replicas}

タイプ： NonZeroUInt64

デフォルト値： 1000

クエリを実行する際の各シャードの最大レプリカ数。

可能な値：

- 正の整数。

**追加情報**

このオプションは、使用する設定によって異なる結果を生むことがあります。

:::note
この設定は、ジョインやサブクエリが関与する場合、すべてのテーブルが特定の要件を満たさないと誤った結果を生むことがあります。詳細については、[Distributed Subqueries and max_parallel_replicas](../../sql-reference/operators/in.md/#max_parallel_replica-subqueries)を参照してください。
:::

### `SAMPLE` キーを使用した並行処理

クエリは、複数のサーバーで並行して実行された場合、より迅速に処理される可能性があります。ただし、次の場合にはクエリのパフォーマンスが低下する可能性があります：

- サンプリングキーの位置がパーティショニングキーにおいて効率的な範囲スキャンを許可しない。
- テーブルにサンプリングキーを追加すると、他のカラムによるフィルタリングが less 効率的になります。
- サンプリングキーが計算コストの高い式である。
- クラスターのレイテンシ分布に長い尾があるため、より多くのサーバーを照会することで全体のクエリレイテンシが増加する。

### [parallel_replicas_custom_key](#parallel_replicas_custom_key) を使用した並行処理

この設定は、すべてのレプリケートテーブルに対して便利です。

## max_parser_backtracks {#max_parser_backtracks}

タイプ： UInt64

デフォルト値： 1000000

パーサのバックトラッキングの最大回数（再帰的降下解析プロセスにおいて異なる代替を試みる回数）。

## max_parser_depth {#max_parser_depth}

タイプ： UInt64

デフォルト値： 1000

再帰的降下パーサにおける最大再帰深度を制限します。スタックサイズを制御することができます。

可能な値：

- 正の整数。
- 0 — 再帰深度は無制限です。

## max_parsing_threads {#max_parsing_threads}

タイプ： MaxThreads

デフォルト値： 'auto(12)'

並行解析をサポートする入力フォーマットでデータを解析するためのスレッドの最大数。デフォルトでは、自動的に決定されます。

## max_partition_size_to_drop {#max_partition_size_to_drop}

タイプ： UInt64

デフォルト値： 50000000000

クエリ実行時にパーティションを削除する制限。値が0の場合、制限なしでパーティションを削除できます。

クラウドのデフォルト値： 1 TB。

:::note
このクエリ設定は、そのサーバーの設定に対して上書きされます。詳しくは[ max_partition_size_to_drop](/docs/operations/server-configuration-parameters/settings.md/#max-partition-size-to-drop)を参照してください。
:::

## max_partitions_per_insert_block {#max_partitions_per_insert_block}

タイプ： UInt64

デフォルト値： 100

単一INSERTブロック内のパーティションの最大数を制限します。ゼロは無制限を意味します。ブロックに多数のパーティションが含まれている場合は例外を投げます。この設定は安全閾値であり、大量のパーティションを使用することは一般的な誤解です。

## max_partitions_to_read {#max_partitions_to_read}

タイプ： Int64

デフォルト値： -1

1つのクエリでアクセスできるパーティションの最大数を制限します。 &lt;= 0 は無制限を意味します。

## max_parts_to_move {#max_parts_to_move}

タイプ： UInt64

デフォルト値： 1000

1つのクエリで移動できるパーツの数を制限します。ゼロは無制限を意味します。

## max_query_size {#max_query_size}

タイプ： UInt64

デフォルト値： 262144

SQLパーサが解析するクエリ文字列の最大バイト数。
INSERTクエリのVALUES句内のデータは、別のストリームパーサーによって処理され（O(1) RAMを消費）、この制限の影響を受けません。

:::note
`max_query_size`はSQLクエリ内で設定することはできません（例： `SELECT now() SETTINGS max_query_size=10000`）。なぜなら、ClickHouseはクエリを解析するためのバッファを割り当てる必要があり、このバッファサイズはクエリが実行される前に設定される`max_query_size`設定によって決定されるからです。
:::

## max_read_buffer_size {#max_read_buffer_size}

タイプ： UInt64

デフォルト値： 1048576

ファイルシステムから読み取るためのバッファの最大サイズ。

## max_read_buffer_size_local_fs {#max_read_buffer_size_local_fs}

タイプ： UInt64

デフォルト値： 131072

ローカルファイルシステムから読み込むためのバッファの最大サイズ。0に設定すると、max_read_buffer_sizeが使用されます。

## max_read_buffer_size_remote_fs {#max_read_buffer_size_remote_fs}

タイプ： UInt64

デフォルト値： 0

リモートファイルシステムから読み込むためのバッファの最大サイズ。0に設定すると、max_read_buffer_sizeが使用されます。

## max_recursive_cte_evaluation_depth {#max_recursive_cte_evaluation_depth}

タイプ： UInt64

デフォルト値： 1000

再帰的CTE評価深度の最大制限。

## max_remote_read_network_bandwidth {#max_remote_read_network_bandwidth}

タイプ： UInt64

デフォルト値： 0

読み取りのためのネットワーク経由のデータ交換の最大速度（バイト毎秒）。

## max_remote_write_network_bandwidth {#max_remote_write_network_bandwidth}

タイプ： UInt64

デフォルト値： 0

書き込みのためのネットワーク経由のデータ交換の最大速度（バイト毎秒）。

## max_replica_delay_for_distributed_queries {#max_replica_delay_for_distributed_queries}

タイプ： UInt64

デフォルト値： 300

分散クエリのために遅延しているレプリカを無効にします。詳細は[Replication](../../engines/table-engines/mergetree-family/replication.md)を参照してください。

秒数で設定します。レプリカの遅延が設定値以上または等しい場合、そのレプリカは使用されません。

可能な値：

- 正の整数。
- 0 — レプリカの遅延はチェックされません。

非ゼロ遅延のあるレプリカを使用しないようにするには、このパラメータを1に設定します。

レプリケートされたテーブルを指す分散テーブルから`SELECT`を実行する時に使用されます。

## max_result_bytes {#max_result_bytes}

タイプ： UInt64

デフォルト値： 0

結果のサイズに対する制限（バイト単位、非圧縮）。しきい値に達した場合、データのブロックを処理した後にクエリは停止しますが、結果の最後のブロックをカットすることはありません。このため、結果のサイズはしきい値を超える可能性があります。注意点として、結果サイズはメモリでのこのしきい値に影響します。結果サイズが小さくても、LowCardinalityカラムの辞書やAggregateFunctionカラムのアリーナなど、大きなデータ構造を参照することがあるため、しきい値は小さな結果サイズでも超える可能性があります。この設定は比較的低いレベルであり、注意して使用する必要があります。

## max_result_rows {#max_result_rows}

タイプ： UInt64

デフォルト値： 0

結果サイズの行数に対する制限。しきい値に達した場合、データのブロックを処理した後にクエリは停止しますが、結果の最後のブロックをカットすることはありません。このため、結果のサイズはしきい値を超える可能性があります。

## max_rows_in_distinct {#max_rows_in_distinct}

タイプ： UInt64

デフォルト値： 0

DISTINCT の実行中に、最大要素数。

## max_rows_in_join {#max_rows_in_join}

タイプ： UInt64

デフォルト値： 0

JOINのハッシュテーブルの最大サイズ（行数）。

## max_rows_in_set {#max_rows_in_set}

タイプ： UInt64

デフォルト値： 0

INセクションを実行した結果のセットの最大サイズ（要素数）。

## max_rows_in_set_to_optimize_join {#max_rows_in_set_to_optimize_join}

タイプ： UInt64

デフォルト値： 0

結合されたテーブルをお互いの行セットでフィルタリングするための最大セットサイズ。

可能な値：

- 0 — 無効。
- 正の整数。

## max_rows_to_group_by {#max_rows_to_group_by}

タイプ： UInt64

デフォルト値： 0

GROUP BY中に指定された行数（ユニークなGROUP BYキー）が生成される場合、その動作は 'group_by_overflow_mode'によって決定されます。デフォルトでは例外を投げますが、推定GROUP BYモードに切り替えることもできます。

## max_rows_to_read {#max_rows_to_read}

タイプ： UInt64

デフォルト値： 0

最も「深い」ソースから読み取る行の制限。すなわち、最も深いサブクエリの中だけで適用されます。リモートサーバーから読み取る場合、リモートサーバーでのみチェックされます。

## max_rows_to_read_leaf {#max_rows_to_read_leaf}

タイプ： UInt64

デフォルト値： 0

分散クエリにおけるリーフノードから読み取る行の制限。この制限は、ローカル読み取りのみに適用され、ルートノードでの最終的なマージステージは除外されます。この設定は、prefer_localhost_replica=1の際には不安定です。

## max_rows_to_sort {#max_rows_to_sort}

タイプ： UInt64

デフォルト値： 0

ORDER BY操作のために処理される必要があるレコードの数が指定された量を超える場合、その動作は 'sort_overflow_mode'によって決定されます。デフォルトでは例外を投げます。

## max_rows_to_transfer {#max_rows_to_transfer}

タイプ： UInt64

デフォルト値： 0

GLOBAL IN/JOINセクションが実行された際に転送される外部テーブルの最大サイズ（行数）。

## max_sessions_for_user {#max_sessions_for_user}

タイプ： UInt64

デフォルト値： 0

ユーザーの同時セッションの最大数。

## max_size_to_preallocate_for_aggregation {#max_size_to_preallocate_for_aggregation}

タイプ： UInt64

デフォルト値： 1000000000000

集計前にすべてのハッシュテーブルに対して事前に割り当てることが許可されている要素の数。

## max_size_to_preallocate_for_joins {#max_size_to_preallocate_for_joins}

タイプ： UInt64

デフォルト値： 1000000000000

結合前にすべてのハッシュテーブルに対して事前に割り当てることが許可されている要素の数。

## max_streams_for_merge_tree_reading {#max_streams_for_merge_tree_reading}

タイプ： UInt64

デフォルト値： 0

ゼロでない場合、MergeTreeテーブルの読み取りストリームの数を制限します。

## max_streams_multiplier_for_merge_tables {#max_streams_multiplier_for_merge_tables}

タイプ： Float

デフォルト値： 5

Mergeテーブルから読み取る際に、より多くのストリームを要求します。ストリームは、Mergeテーブルが使用するテーブルに分散されます。これにより、スレッド全体の作業をより均等に分配でき、特にマージされたテーブルのサイズが異なる場合に役立ちます。

## max_streams_to_max_threads_ratio {#max_streams_to_max_threads_ratio}

タイプ： Float

デフォルト値： 1

スレッド数よりも多くのソースを使用できるようにして、スレッド間で作業をより均等に分配します。この解決策は一時的なものであり、将来的にはソースの数がスレッドの数と等しくなることが可能になると仮定されていますが、各ソースが動的に利用可能な作業を選択できることを想定しています。

## max_subquery_depth {#max_subquery_depth}

タイプ： UInt64

デフォルト値： 100

クエリに指定された数を超えるネストされたサブクエリが存在する場合、例外を投げます。これは、クラスターのユーザーがクエリで混乱しないようにするためのサニティチェックを提供します。

## max_table_size_to_drop {#max_table_size_to_drop}

タイプ： UInt64

デフォルト値： 50000000000

クエリ実行中にテーブルを削除する制限。値が0の場合、制限なしでテーブルを削除できます。

クラウドのデフォルト値： 1 TB。

:::note
このクエリ設定は、そのサーバーの設定に対して上書きされます。詳しくは[max_table_size_to_drop](/docs/operations/server-configuration-parameters/settings.md/#max-table-size-to-drop)を参照してください。
:::

## max_temporary_columns {#max_temporary_columns}

タイプ： UInt64

デフォルト値： 0

クエリの結果、メモリ内に指定された数の一時カラム以上が生成される場合、例外がスローされます。ゼロ値は無制限を意味します。この設定は、あまりにも複雑なクエリを防ぐのに役立ちます。

## max_temporary_data_on_disk_size_for_query {#max_temporary_data_on_disk_size_for_query}

タイプ： UInt64

デフォルト値： 0

すべての同時実行クエリのために、ディスク上の一時ファイルによって消費されるデータの最大量（バイト単位）。ゼロは無制限を意味します。

## max_temporary_data_on_disk_size_for_user {#max_temporary_data_on_disk_size_for_user}

タイプ： UInt64

デフォルト値： 0

すべての同時実行ユーザークエリのために、ディスク上の一時ファイルによって消費されるデータの最大量（バイト単位）。ゼロは無制限を意味します。

## max_temporary_non_const_columns {#max_temporary_non_const_columns}

タイプ： UInt64

デフォルト値： 0

'max_temporary_columns'設定に似ていますが、定数でないカラムのみに適用されます。定数カラムは安価であるため、より多くの定数カラムを許可するのは合理的です。

## max_threads {#max_threads}

タイプ： MaxThreads

デフォルト値： 'auto(12)'

クエリ処理スレッドの最大数で、リモートサーバーからデータを取得するためのスレッド（’max_distributed_connections’パラメータ参照）を除きます。

このパラメータは、クエリ処理パイプラインの同じステージを並行して実行するスレッドに適用されます。
たとえば、テーブルから読み取る際に、関数を使用して式を評価したり、WHEREでフィルタリングしたり、GROUP BYで事前集計を並行して行うことが可能であれば、’max_threads’の数のスレッドが使用されます。

LIMITによりすぐに完了するクエリの場合は、'max_threads'を低く設定できます。たとえば、必要なエントリが各ブロックにある場合で、max_threads = 8の場合、8つのブロックが取得されますが、実際には1つを読むだけで十分です。

`max_threads`の値が小さいほど、消費されるメモリは少なくなります。

## max_threads_for_indexes {#max_threads_for_indexes}

タイプ： UInt64

デフォルト値： 0

インデックスを処理するためのスレッドの最大数。

## max_untracked_memory {#max_untracked_memory}

タイプ： UInt64

デフォルト値： 4194304

小さな割り当てと解放はスレッドローカル変数にグループ化され、指定された値よりも大きくなるまで追跡またはプロファイルされません。この値が'memory_profiler_step'よりも大きければ、実質的に'memory_profiler_step'に下げられます。

## memory_overcommit_ratio_denominator {#memory_overcommit_ratio_denominator}

タイプ： UInt64

デフォルト値： 1073741824

ハードリミットがグローバルレベルで到達されたときのソフトメモリリミットを表します。
この値は、クエリのオーバーコミット比率を計算するために使用されます。
ゼロはクエリをスキップします。
[メモリオーバーコミット](memory-overcommit.md)についてもっと読む。

## memory_overcommit_ratio_denominator_for_user {#memory_overcommit_ratio_denominator_for_user}

タイプ： UInt64

デフォルト値： 1073741824

ハードリミットがユーザーレベルで到達されたときのソフトメモリリミットを表します。
この値は、クエリのオーバーコミット比率を計算するために使用されます。
ゼロはクエリをスキップします。
[メモリオーバーコミット](memory-overcommit.md)についてもっと読む。

## memory_profiler_sample_max_allocation_size {#memory_profiler_sample_max_allocation_size}

タイプ： UInt64

デフォルト値： 0

指定された値以下のサイズのランダムな割り当てを、 `memory_profiler_sample_probability` に基づいて確率的に収集します。 0は無効を意味します。期待通りにこのしきい値を機能させるには'max_untracked_memory'を0に設定すると良いでしょう。

## memory_profiler_sample_min_allocation_size {#memory_profiler_sample_min_allocation_size}

タイプ： UInt64

デフォルト値： 0

指定された値以上のサイズのランダムな割り当てを、 `memory_profiler_sample_probability` に基づいて確率的に収集します。 0は無効を意味します。期待通りにこのしきい値を機能させるには'max_untracked_memory'を0に設定すると良いでしょう。

## memory_profiler_sample_probability {#memory_profiler_sample_probability}

タイプ： Float

デフォルト値： 0

ランダムな割り当てや解放を収集し、 'MemorySample'トレースタイプでsystem.trace_logに書き込みます。確率は、サイズに関係なく、すべての割り当て/解放に適用されます（`memory_profiler_sample_min_allocation_size`および`memory_profiler_sample_max_allocation_size`を使用して変更可能）。サンプリングは、未追跡メモリの量が'max_untracked_memory'を超えた場合のみ発生します。より細かくサンプリングするには'max_untracked_memory'を0に設定することをお勧めします。

## memory_profiler_step {#memory_profiler_step}

タイプ： UInt64

デフォルト値： 4194304

メモリプロファイラーのステップを設定します。クエリのメモリ使用量が次に指定されたバイト数を超えるたびに、メモリプロファイラーは割り当てられたスタックトレースを収集し、[trace_log](../../operations/system-tables/trace_log.md/#system_tables-trace_log)に書き込みます。

可能な値：

- 正の整数バイト数。

- 0はメモリプロファイラーをオフにします。

## memory_tracker_fault_probability {#memory_tracker_fault_probability}

タイプ： Float

デフォルト値： 0

`exception safety`のテストのために、指定された確率でメモリを割り当てるたびに例外を投げます。

## memory_usage_overcommit_max_wait_microseconds {#memory_usage_overcommit_max_wait_microseconds}

タイプ： UInt64

デフォルト値： 5000000

ユーザーレベルでのメモリオーバーコミットの場合、スレッドがメモリの解放を待機する最大時間（マイクロ秒）。

タイムアウトに達し、メモリが解放されない場合、例外が投げられます。
[メモリオーバーコミット](memory-overcommit.md)についてもっと読む。

## merge_table_max_tables_to_look_for_schema_inference {#merge_table_max_tables_to_look_for_schema_inference}

タイプ： UInt64

デフォルト値： 1000

明示的なスキーマなしで `Merge`テーブルを作成する場合、または `merge`テーブル関数を使用する際に、一致するテーブルの数が指定された最大数を超えないようにスキーマを推測します。
より多くのテーブルがある場合、最初の指定された数のテーブルからスキーマが推測されます。

## merge_tree_coarse_index_granularity {#merge_tree_coarse_index_granularity}

タイプ： UInt64

デフォルト値： 8

データの検索時に、ClickHouseはインデックスファイル内のデータマークをチェックします。必要なキーが特定の範囲に存在する場合、ClickHouseはこの範囲を`merge_tree_coarse_index_granularity`のサブレンジに分割し、必要なキーを再帰的に検索します。

可能な値：

- 任意の正の偶数整数。

## merge_tree_compact_parts_min_granules_to_multibuffer_read {#merge_tree_compact_parts_min_granules_to_multibuffer_read}

タイプ： UInt64

デフォルト値： 16

ClickHouse Cloud でのみ利用可能。MergeTreeテーブルのコンパクト部分のストライプ内でマルチバッファリーダーを使用するためのグラニュールの数。これにより、並行読み取りとプレフェッチをサポートします。リモートファイルシステムから読み取る場合、マルチバッファリーダーの使用は読み取りリクエストの数を増加させます。

## merge_tree_determine_task_size_by_prewhere_columns {#merge_tree_determine_task_size_by_prewhere_columns}

タイプ： Bool

デフォルト値： 1

読み取りタスクサイズを決定する際に、プレホイールカラムのサイズのみを使用するかどうか。

## merge_tree_max_bytes_to_use_cache {#merge_tree_max_bytes_to_use_cache}

タイプ： UInt64

デフォルト値： 2013265920

ClickHouseが1つのクエリで`merge_tree_max_bytes_to_use_cache`バイト以上を読み取る場合、未圧縮ブロックのキャッシュを使用しません。

未圧縮ブロックのキャッシュは、クエリ用に抽出されたデータを保存します。ClickHouseはこのキャッシュを使用して、再度の小さなクエリに対する応答を迅速に行います。この設定は、大量のデータを読み取るクエリによってキャッシュが荒廃するのを防ぎます。[uncompressed_cache_size](../../operations/server-configuration-parameters/settings.md/#server-settings-uncompressed_cache_size)サーバー設定は、未圧縮ブロックのキャッシュサイズを定義します。

可能な値：

- 任意の正の整数。

## merge_tree_max_rows_to_use_cache {#merge_tree_max_rows_to_use_cache}

タイプ： UInt64

デフォルト値： 1048576

ClickHouseが1つのクエリで`merge_tree_max_rows_to_use_cache`行以上を読み取る場合、未圧縮ブロックのキャッシュを使用しません。

未圧縮ブロックのキャッシュは、クエリ用に抽出されたデータを保存します。ClickHouseはこのキャッシュを使用して、再度の小さなクエリに対する応答を迅速に行います。この設定は、大量のデータを読み取るクエリによってキャッシュが荒廃するのを防ぎます。[uncompressed_cache_size](../../operations/server-configuration-parameters/settings.md/#server-settings-uncompressed_cache_size)サーバー設定は、未圧縮ブロックのキャッシュサイズを定義します。

可能な値：

- 任意の正の整数。

## merge_tree_min_bytes_for_concurrent_read {#merge_tree_min_bytes_for_concurrent_read}

タイプ： UInt64

デフォルト値： 251658240

1つの[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンテーブルのファイルから読み取るバイト数が`merge_tree_min_bytes_for_concurrent_read`を超える場合、ClickHouseはこのファイルから並行していくつかのスレッドで読み取ろうとします。

可能な値：

- 正の整数。

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem {#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem}

タイプ： UInt64

デフォルト値： 0

リモートファイルシステムから読み取る際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンが並行して読み取れるようになる前の、1つのファイルから読み取る最小バイト数。この設定は使用しないことをお勧めします。

可能な値：

- 正の整数。

## merge_tree_min_bytes_for_seek {#merge_tree_min_bytes_for_seek}

タイプ： UInt64

デフォルト値： 0

1つのファイル内で読み取るデータブロック間の距離が`merge_tree_min_bytes_for_seek`バイトよりも少ない場合、ClickHouseは両方のブロックを含むファイル範囲を逐次的に読み取るため、余分なシークを回避します。

可能な値：

- 任意の正の整数。

## merge_tree_min_bytes_per_task_for_remote_reading {#merge_tree_min_bytes_per_task_for_remote_reading}

タイプ： UInt64

デフォルト値： 2097152

タスクごとに読み取る最小バイト数。

## merge_tree_min_read_task_size {#merge_tree_min_read_task_size}

タイプ： UInt64

デフォルト値： 8

タスクサイズに対する厳格な下限（グラニュール数が少なく、利用可能なスレッド数が多い場合でも、小さなタスクを割り当てることはありません）。

## merge_tree_min_rows_for_concurrent_read {#merge_tree_min_rows_for_concurrent_read}

タイプ： UInt64

デフォルト値： 163840

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルのファイルから読み取る行数が`merge_tree_min_rows_for_concurrent_read`を超える場合、ClickHouseはこのファイルから並行して読み取ることを試みます。

可能な値：

- 正の整数。

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem {#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem}

タイプ： UInt64

デフォルト値： 0

リモートファイルシステムから読み取る際に、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)エンジンが並行して読み取れるようになる前の、1つのファイルから読み取る最小の行数。この設定は使用しないことをお勧めします。

可能な値：

- 正の整数。

## merge_tree_min_rows_for_seek {#merge_tree_min_rows_for_seek}

タイプ： UInt64

デフォルト値： 0

1つのファイル内で読み取るデータブロック間の距離が`merge_tree_min_rows_for_seek`行以下である場合、ClickHouseはファイルをシークせずにデータを逐次的に読み取ります。

可能な値：

- 任意の正の整数。

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability {#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability}

タイプ： Float

デフォルト値： 0

`PartsSplitter`のテスト用 - 確率的に、MergeTreeから読むたびに読み取り範囲を交差と非交差に分割します。

## merge_tree_use_const_size_tasks_for_remote_reading {#merge_tree_use_const_size_tasks_for_remote_reading}

タイプ： Bool

デフォルト値： 1

リモートテーブルから読み取る際に、定数サイズのタスクを使用するかどうか。

## merge_tree_use_deserialization_prefixes_cache {#merge_tree_use_deserialization_prefixes_cache}

タイプ： Bool

デフォルト値： 1

MergeTree内のワイド部分から読み取る際に、ファイルプレフィックスからのカラムメタデータのキャッシングを有効にします。

## merge_tree_use_prefixes_deserialization_thread_pool {#merge_tree_use_prefixes_deserialization_thread_pool}

タイプ： Bool

デフォルト値： 1

MergeTreeのワイド部分において、並行プレフィックス読み取りのためのスレッドプールの使用を有効にします。そのスレッドプールのサイズは、サーバー設定`max_prefixes_deserialization_thread_pool_size`によって制御されます。

## merge_tree_use_v1_object_and_dynamic_serialization {#merge_tree_use_v1_object_and_dynamic_serialization}

タイプ： Bool

デフォルト値： 0

有効にすると、MergeTree内でJSONおよびDynamicタイプのV1シリアル化バージョンが使用されます。設定を変更すると、サーバーの再起動後にのみ有効になります。

## metrics_perf_events_enabled {#metrics_perf_events_enabled}

タイプ： Bool

デフォルト値： 0

有効にすると、クエリの実行中に一部のパフォーマンスイベントが測定されます。

## metrics_perf_events_list {#metrics_perf_events_list}

タイプ： String

デフォルト値：

カンマ区切りで表示される、クエリの実行中に測定されるパフォーマンスメトリクスのリスト。空の場合はすべてのイベントを意味します。利用可能なイベントについては、ソースのPerfEventInfoを参照してください。

## min_bytes_to_use_direct_io {#min_bytes_to_use_direct_io}

タイプ： UInt64

デフォルト値： 0

ストレージディスクに対するダイレクトI/Oアクセスを使用するために必要な最小データボリューム。

ClickHouseはこの設定を使用して、テーブルからデータを読み取ります。読み取る総ストレージボリュームが`min_bytes_to_use_direct_io`バイトを超えると、ClickHouseは`O_DIRECT`オプションでストレージディスクからデータを読み取ります。

可能な値：

- 0 — ダイレクトI/Oは無効です。
- 正の整数。

## min_bytes_to_use_mmap_io {#min_bytes_to_use_mmap_io}

タイプ： UInt64

デフォルト値： 0

これは実験的な設定です。カーネルからユーザースペースにデータをコピーせずに大きなファイルを読み取るための最小メモリを設定します。推奨されるしきい値は約64 MBです。なぜなら、[mmap/munmap](https://en.wikipedia.org/wiki/Mmap)は遅いためです。大きなファイル専用で、データがページキャッシュに存在する場合にのみ効果があります。

可能な値：

- 正の整数。
- 0 — 大きなファイルはカーネルからユーザースペースにデータをコピーするだけで読み取ります。

## min_chunk_bytes_for_parallel_parsing {#min_chunk_bytes_for_parallel_parsing}

タイプ： NonZeroUInt64

デフォルト値： 10485760

- タイプ： unsigned int
- デフォルト値： 1 MiB

各スレッドが並行して解析する最小チャンクサイズ（バイト単位）。

## min_compress_block_size {#min_compress_block_size}

タイプ： UInt64

デフォルト値： 65536

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブル用。クエリ処理の遅延を減少させるために、次のマークを記入するときにブロックが圧縮されます。そのサイズが`min_compress_block_size`以上である場合。デフォルトは65,536です。

実際のブロックサイズは、圧縮されていないデータが`max_compress_block_size`未満である場合、この値以上であり、マーク1つのデータボリューム以上でなければなりません。

例を見てみましょう。テーブル作成時に`index_granularity`が8192に設定されたと仮定します。

UInt32型カラム（値あたり4バイト）を書き込もうとしています。8192行を書き込むと、合計32 KBのデータになります。`min_compress_block_size = 65,536`なので、2つのマークごとに圧縮ブロックが形成されます。

URLカラム（String型、値あたり平均60バイト）を書き込もうとしています。8192行を書き込むと、平均で500 KB未満のデータになります。これは65,536を超えているので、各マークに対して圧縮ブロックが形成されます。この場合、ディスクからのデータ読み取りを行う際に、単一のマークの範囲で追加データは解凍されません。

:::note
これは専門レベルの設定であり、ClickHouseを始めたばかりの方は変更しないでください。
:::

## min_count_to_compile_aggregate_expression {#min_count_to_compile_aggregate_expression}

タイプ： UInt64

デフォルト値： 3

JITコンパイルを開始するために必要な同一の集約式の最小数。設定`compile_aggregate_expressions`が有効な場合にのみ機能します。

可能な値：

- 正の整数。
- 0 — 同一の集約式は常にJITコンパイルされます。

## min_count_to_compile_expression {#min_count_to_compile_expression}

タイプ： UInt64

デフォルト値： 3

コンパイルされる前に実行される同一の式の最小カウント。

## min_count_to_compile_sort_description {#min_count_to_compile_sort_description}

タイプ： UInt64

デフォルト値： 3

JITコンパイルされる前に必要な同一のソート説明の数。

## min_execution_speed {#min_execution_speed}

タイプ： UInt64

デフォルト値： 0

毎秒の最低実行行数。

## min_execution_speed_bytes {#min_execution_speed_bytes}

タイプ： UInt64

デフォルト値： 0

毎秒の最低実行バイト数。

## min_external_sort_block_bytes {#min_external_sort_block_bytes}

タイプ： UInt64

デフォルト値： 104857600

ディスクにダンプされる外部ソート用の最小ブロックサイズ（バイト単位）。これにより、ファイルが多すぎるのを防ぎます。

## min_external_table_block_size_bytes {#min_external_table_block_size_bytes}

タイプ： UInt64

デフォルト値： 268402944

ブロックサイズが小さすぎる場合、外部テーブルに渡されるブロックを指定したサイズ（バイト単位）に圧縮します。

## min_external_table_block_size_rows {#min_external_table_block_size_rows}

タイプ： UInt64

デフォルト値： 1048449

ブロックサイズが小さすぎる場合、外部テーブルに渡されるブロックを指定したサイズ（行数）に圧縮します。

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

タイプ： UInt64

デフォルト値： 0

INSERTを実行するために必要な最小の空きディスクスペース（バイト単位）。

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

タイプ： Float

デフォルト値： 0

INSERTを実行するために必要な最小の空きディスクスペースの比率。

## min_free_disk_space_for_temporary_data {#min_free_disk_space_for_temporary_data}

タイプ： UInt64

デフォルト値： 0

外部ソートや集計で使用される一時データを書き込む場合に保持する必要がある最小ディスクスペース。
## min_hit_rate_to_use_consecutive_keys_optimization {#min_hit_rate_to_use_consecutive_keys_optimization}

タイプ: Float

デフォルト値: 0.5

集約における連続キー最適化に使用されるキャッシュの最小ヒット率です。これを有効に保つために必要です。

## min_insert_block_size_bytes {#min_insert_block_size_bytes}

タイプ: UInt64

デフォルト値: 268402944

`INSERT` クエリを通じてテーブルに挿入されることができるブロック内の最小バイト数を設定します。小さなサイズのブロックは大きなものに圧縮されます。

可能な値:

- 正の整数。
- 0 - 圧縮無効。

## min_insert_block_size_bytes_for_materialized_views {#min_insert_block_size_bytes_for_materialized_views}

タイプ: UInt64

デフォルト値: 0

`INSERT` クエリを通じてテーブルに挿入されることができるブロック内の最小バイト数を設定します。小さなサイズのブロックは大きなものに圧縮されます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)に挿入されるブロックのみに適用されます。この設定を調整することで、マテリアライズドビューへのプッシュ時のブロック圧縮を制御し、過剰なメモリ使用を回避します。

可能な値:

- 任意の正の整数。
- 0 - 圧縮無効。

**参照ください**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows {#min_insert_block_size_rows}

タイプ: UInt64

デフォルト値: 1048449

`INSERT` クエリを通じてテーブルに挿入されることができるブロック内の最小行数を設定します。小さなサイズのブロックは大きなものに圧縮されます。

可能な値:

- 正の整数。
- 0 - 圧縮無効。

## min_insert_block_size_rows_for_materialized_views {#min_insert_block_size_rows_for_materialized_views}

タイプ: UInt64

デフォルト値: 0

`INSERT` クエリを通じてテーブルに挿入されることができるブロック内の最小行数を設定します。小さなサイズのブロックは大きなものに圧縮されます。この設定は、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)に挿入されるブロックのみに適用されます。この設定を調整することで、マテリアライズドビューへのプッシュ時のブロック圧縮を制御し、過剰なメモリ使用を回避します。

可能な値:

- 任意の正の整数。
- 0 - 圧縮無効。

**参照ください**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes {#min_joined_block_size_bytes}

タイプ: UInt64

デフォルト値: 524288

JOIN結果に対する最小ブロックサイズ（結合アルゴリズムがサポートしている場合）。0は無制限を意味します。

## mongodb_throw_on_unsupported_query {#mongodb_throw_on_unsupported_query}

タイプ: Bool

デフォルト値: 1

有効にすると、MongoDBクエリが構築できない場合、MongoDBテーブルはエラーを返します。それ以外の場合、ClickHouseはテーブル全体を読み込み、ローカルで処理します。このオプションは、レガシー実装には適用されず、'allow_experimental_analyzer=0'の場合も適用されません。

## move_all_conditions_to_prewhere {#move_all_conditions_to_prewhere}

タイプ: Bool

デフォルト値: 1

WHEREからPREWHEREへのすべての実行可能条件を移動します。

## move_primary_key_columns_to_end_of_prewhere {#move_primary_key_columns_to_end_of_prewhere}

タイプ: Bool

デフォルト値: 1

主キーのカラムを含むPREWHERE条件をANDチェーンの最後に移動します。これらの条件は主キー分析中に考慮される可能性が高いため、PREWHEREフィルタリングにあまり寄与しません。

## multiple_joins_try_to_keep_original_names {#multiple_joins_try_to_keep_original_names}

タイプ: Bool

デフォルト値: 0

複数のJOIN書き換え時にトップレベルの式リストにエイリアスを追加しません。

## mutations_execute_nondeterministic_on_initiator {#mutations_execute_nondeterministic_on_initiator}

タイプ: Bool

デフォルト値: 0

trueの場合、定数非決定性関数（例：関数 `now()`）はイニシエーターで実行され、`UPDATE`および`DELETE`クエリ内のリテラルに置き換えられます。これにより、定数非決定性関数を使用した変異の実行中にレプリカ上のデータを同期して保つことができます。デフォルト値: `false`。

## mutations_execute_subqueries_on_initiator {#mutations_execute_subqueries_on_initiator}

タイプ: Bool

デフォルト値: 0

trueの場合、スカラーサブクエリはイニシエーターで実行され、`UPDATE`および`DELETE`クエリ内のリテラルに置き換えられます。デフォルト値: `false`。

## mutations_max_literal_size_to_replace {#mutations_max_literal_size_to_replace}

タイプ: UInt64

デフォルト値: 16384

`UPDATE`および`DELETE`クエリ内で置き換えるためのシリアライズされたリテラルの最大サイズ（バイト）。上記の2つの設定のうち少なくとも1つが有効である場合にのみ効果を発揮します。デフォルト値: 16384（16 KiB）。

## mutations_sync {#mutations_sync}

タイプ: UInt64

デフォルト値: 0

`ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN`クエリ（[変異](../../sql-reference/statements/alter/index.md/#mutations)）を同期的に実行できるようにします。

可能な値:

- 0 - 変異は非同期に実行されます。
- 1 - クエリは現在のサーバー上ですべての変異が完了するのを待ちます。
- 2 - クエリはすべてのレプリカ上でのすべての変異が完了するのを待ちます（存在する場合）。

## mysql_datatypes_support_level {#mysql_datatypes_support_level}

タイプ: MySQLDataTypesSupport

デフォルト値:

MySQLタイプが対応するClickHouseタイプに変換される方法を定義します。 `decimal`, `datetime64`, `date2Date32`, または `date2String` のいずれかの組み合わせのカンマ区切りリストです。
- `decimal`: 精度が許可される場合、`NUMERIC` と `DECIMAL` タイプを `Decimal` に変換します。
- `datetime64`: 精度が `0` でない場合、`DATETIME` と `TIMESTAMP` タイプを `DateTime` ではなく `DateTime64` に変換します。
- `date2Date32`: `DATE` を `Date` ではなく `Date32` に変換します。 `date2String` よりも優先されます。
- `date2String`: `DATE` を `Date` ではなく `String` に変換します。 `datetime64` によって上書きされます。

## mysql_map_fixed_string_to_text_in_show_columns {#mysql_map_fixed_string_to_text_in_show_columns}

タイプ: Bool

デフォルト値: 1

有効にすると、[FixedString](../../sql-reference/data-types/fixedstring.md) ClickHouseデータタイプは、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) において `TEXT` として表示されます。

MySQLワイヤプロトコル経由で接続されるときのみ影響します。

- 0 - `BLOB` を使用します。
- 1 - `TEXT` を使用します。

## mysql_map_string_to_text_in_show_columns {#mysql_map_string_to_text_in_show_columns}

タイプ: Bool

デフォルト値: 1

有効にすると、[String](../../sql-reference/data-types/string.md) ClickHouseデータタイプは、[SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns) において `TEXT` として表示されます。

MySQLワイヤプロトコル経由で接続されるときのみ影響します。

- 0 - `BLOB` を使用します。
- 1 - `TEXT` を使用します。

## mysql_max_rows_to_insert {#mysql_max_rows_to_insert}

タイプ: UInt64

デフォルト値: 65536

MySQLストレージエンジンのMySQLバッチ挿入における最大行数です。

## network_compression_method {#network_compression_method}

タイプ: String

デフォルト値: LZ4

サーバー間およびサーバーと[clickhouse-client](../../interfaces/cli.md)間の通信に使用されるデータ圧縮方法を設定します。

可能な値:

- `LZ4` — LZ4圧縮方法を設定します。
- `ZSTD` — ZSTD圧縮方法を設定します。

**参照ください**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level {#network_zstd_compression_level}

タイプ: Int64

デフォルト値: 1

ZSTD圧縮のレベルを調整します。[network_compression_method](#network_compression_method)が`ZSTD`に設定されている場合のみ使用されます。

可能な値:

- 1から15の正の整数。

## normalize_function_names {#normalize_function_names}

タイプ: Bool

デフォルト値: 1

関数名をその標準的な名前に正規化します。

## number_of_mutations_to_delay {#number_of_mutations_to_delay}

タイプ: UInt64

デフォルト値: 0

変更されたテーブルに未完了の変更がその数以上存在する場合、テーブルの変更を人工的に遅延させます。0 - 無効。

## number_of_mutations_to_throw {#number_of_mutations_to_throw}

タイプ: UInt64

デフォルト値: 0

変更されたテーブルに未完了の変更がその数以上存在する場合、'Too many mutations ...' 例外をスローします。0 - 無効。

## odbc_bridge_connection_pool_size {#odbc_bridge_connection_pool_size}

タイプ: UInt64

デフォルト値: 16

ODBCブリッジにおける各接続設定文字列の接続プールのサイズです。

## odbc_bridge_use_connection_pooling {#odbc_bridge_use_connection_pooling}

タイプ: Bool

デフォルト値: 1

ODBCブリッジで接続プーリングを使用します。falseに設定すると、毎回新しい接続が作成されます。

## offset {#offset}

タイプ: UInt64

デフォルト値: 0

クエリから行を返す前にスキップする行数を設定します。[OFFSET](../../sql-reference/statements/select/offset.md/#offset-fetch)句によって設定されたオフセットを調整し、これら2つの値を合計するようにします。

可能な値:

- 0 — 行はスキップされません。
- 正の整数。

**例**

入力テーブル:

```sql
CREATE TABLE test (i UInt64) ENGINE = MergeTree() ORDER BY i;
INSERT INTO test SELECT number FROM numbers(500);
```

クエリ:

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

## opentelemetry_start_trace_probability {#opentelemetry_start_trace_probability}

タイプ: Float

デフォルト値: 0

ClickHouseが実行されたクエリのためにトレースを開始できる確率を設定します（親[トレースコンテキスト](https://www.w3.org/TR/trace-context/)が供給されていない場合）。

可能な値:

- 0 — すべての実行されたクエリのトレースが無効になります（親トレースコンテキストが供給されていない場合）。
- [0..1]の範囲の正の浮動小数点数。たとえば、設定値が`0.5`の場合、ClickHouseは平均して半分のクエリでトレースを開始できます。
- 1 — すべての実行されたクエリのトレースが有効になります。

## opentelemetry_trace_processors {#opentelemetry_trace_processors}

タイプ: Bool

デフォルト値: 0

プロセッサのためにOpenTelemetryスパンを収集します。

## optimize_aggregation_in_order {#optimize_aggregation_in_order}

タイプ: Bool

デフォルト値: 0

[GROUP BY](../../sql-reference/statements/select/group-by.md)を最適化することを有効にする[SELECT](../../sql-reference/statements/select/index.md)クエリにおいて、対応する順序でデータを集約します。

可能な値:

- 0 — `GROUP BY`の最適化が無効です。
- 1 — `GROUP BY`の最適化が有効です。

**参照ください**

- [GROUP BY最適化](../../sql-reference/statements/select/group-by.md/#aggregation-in-order)

## optimize_aggregators_of_group_by_keys {#optimize_aggregators_of_group_by_keys}

タイプ: Bool

デフォルト値: 1

SELECTセクションのGROUP BYキーのmin/max/any/anyLast集約器を排除します。

## optimize_and_compare_chain {#optimize_and_compare_chain}

タイプ: Bool

デフォルト値: 1

ANDチェーン内の定数比較を埋め込み、フィルタリング能力を強化します。サポートされる演算子は、`<`, `<=`, `>`, `>=`, `=` であり、それらの混合も可能です。例えば、`(a < b) AND (b < c) AND (c < 5)`は、`(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`に書き換えられます。

## optimize_append_index {#optimize_append_index}

タイプ: Bool

デフォルト値: 0

インデックス条件を追加するために[制約](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルトは`false`です。

可能な値:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions {#optimize_arithmetic_operations_in_aggregate_functions}

タイプ: Bool

デフォルト値: 1

集約関数の外に算術演算を移動します。

## optimize_count_from_files {#optimize_count_from_files}

タイプ: Bool

デフォルト値: 1

異なる入力形式からの行数のカウントの最適化を有効または無効にします。テーブル関数 / エンジン `file` / `s3` / `url` / `hdfs` / `azureBlobStorage` に適用されます。

可能な値:

- 0 — 最適化無効。
- 1 — 最適化有効。

## optimize_distinct_in_order {#optimize_distinct_in_order}

タイプ: Bool

デフォルト値: 1

DISTINCTの最適化を有効にします。DISTINCTの一部のカラムがソートのプレフィックスを形成する場合です。例えば、マージツリーやORDER BY文のソートキーのプレフィックス。

## optimize_distributed_group_by_sharding_key {#optimize_distributed_group_by_sharding_key}

タイプ: Bool

デフォルト値: 1

複雑な集約を回避して、イニシエーターサーバーでコストのかかる集約を避けることにより、`GROUP BY sharding_key`クエリを最適化します（これにより、イニシエーターサーバーでのクエリのメモリ使用量が削減されます）。

以下のクエリタイプがサポートされています（およびそれらのすべての組み合わせ）：

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

以下のクエリタイプはサポートされていません（いくつかのもののサポートは後で追加されるかもしれません）：

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

可能な値:

- 0 — 無効。
- 1 — 有効。

参照ください：

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
現時点では`optimize_skip_unused_shards`が必要です（その理由は、いつかデフォルトで有効になる可能性があり、データが分散テーブルを通じて挿入された場合にのみ正しく機能するため、つまりデータがシャーディングキーに従って分散される必要があります）。
:::

## optimize_extract_common_expressions {#optimize_extract_common_expressions}

タイプ: Bool

デフォルト値: 1

WHERE、PREWHERE、ON、HAVING、およびQUALIFYの表現から共通の表現を抽出できるようにします。`(A AND B) OR (A AND C)`のような論理的表現は、`A AND (B OR C)`に書き換えられ、次のことに役立つ可能性があります：
- 簡単なフィルタリング表現におけるインデックスの活用
- 内部結合の最適化へのクロス

## optimize_functions_to_subcolumns {#optimize_functions_to_subcolumns}

タイプ: Bool

デフォルト値: 1

サブカラムを読み取るために一部の関数を変換することによる最適化を有効または無効にします。これにより、読み取るデータ量が減少します。

これらの関数は変換可能です：

- [length](../../sql-reference/functions/array-functions.md/#array_functions-length)を読み取るための[SIZE0](../../sql-reference/data-types/array.md/#array-size)サブカラムに。
- [empty](../../sql-reference/functions/array-functions.md/#function-empty)を読み取るための[SIZE0](../../sql-reference/data-types/array.md/#array-size)サブカラムに。
- [notEmpty](../../sql-reference/functions/array-functions.md/#function-notempty)を読み取るための[SIZE0](../../sql-reference/data-types/array.md/#array-size)サブカラムに。
- [isNull](../../sql-reference/operators/index.md/#operator-is-null)を読み取るための[NULL](../../sql-reference/data-types/nullable.md/#finding-null)サブカラムに。
- [isNotNull](../../sql-reference/operators/index.md/#is-not-null)を読み取るための[NULL](../../sql-reference/data-types/nullable.md/#finding-null)サブカラムに。
- [count](../../sql-reference/aggregate-functions/reference/count.md)を読み取るための[NULL](../../sql-reference/data-types/nullable.md/#finding-null)サブカラムに。
- [mapKeys](../../sql-reference/functions/tuple-map-functions.md/#mapkeys)を読み取るための[KEYS](../../sql-reference/data-types/map.md/#map-subcolumns)サブカラムに。
- [mapValues](../../sql-reference/functions/tuple-map-functions.md/#mapvalues)を読み取るための[VALUES](../../sql-reference/data-types/map.md/#map-subcolumns)サブカラムに。

可能な値:

- 0 — 最適化無効。
- 1 — 最適化有効。

## optimize_group_by_constant_keys {#optimize_group_by_constant_keys}

タイプ: Bool

デフォルト値: 1

すべてのキーがブロック内で定数である場合にGROUP BYを最適化します。

## optimize_group_by_function_keys {#optimize_group_by_function_keys}

タイプ: Bool

デフォルト値: 1

GROUP BYセクション内で他のキーの関数を排除します。

## optimize_if_chain_to_multiif {#optimize_if_chain_to_multiif}

タイプ: Bool

デフォルト値: 0

if(cond1, then1, if(cond2, ...)) チェーンを multiIf に置き換えます。現在のところ、数値型には利益がありません。

## optimize_if_transform_strings_to_enum {#optimize_if_transform_strings_to_enum}

タイプ: Bool

デフォルト値: 0

IfおよびTransform内の文字列型引数を列挙型に置き換えます。分散クエリにおいて一貫性のない変更となる可能性があるため、デフォルトでは無効です。

## optimize_injective_functions_in_group_by {#optimize_injective_functions_in_group_by}

タイプ: Bool

デフォルト値: 1

GROUP BYセクション内の引数に対して、単射関数をその引数で置き換えます。

## optimize_injective_functions_inside_uniq {#optimize_injective_functions_inside_uniq}

タイプ: Bool

デフォルト値: 1

uniq*() 関数内の単射関数を1つの引数で削除します。

## optimize_min_equality_disjunction_chain_length {#optimize_min_equality_disjunction_chain_length}

タイプ: UInt64

デフォルト値: 3

最適化のための `expr = x1 OR ... expr = xN` の表現の最小の長さです。

## optimize_min_inequality_conjunction_chain_length {#optimize_min_inequality_conjunction_chain_length}

タイプ: UInt64

デフォルト値: 3

最適化のための `expr <> x1 AND ... expr <> xN` の表現の最小の長さです。

## optimize_move_to_prewhere {#optimize_move_to_prewhere}

タイプ: Bool

デフォルト値: 1

[SELECT](../../sql-reference/statements/select/index.md)クエリにおける自動[PREWHERE](../../sql-reference/statements/select/prewhere.md)最適化を有効または無効にします。

これは、[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルのみに適用されます。

可能な値:

- 0 — 自動 `PREWHERE` 最適化が無効です。
- 1 — 自動 `PREWHERE` 最適化が有効です。

## optimize_move_to_prewhere_if_final {#optimize_move_to_prewhere_if_final}

タイプ: Bool

デフォルト値: 0

[FINAL](../../sql-reference/statements/select/from.md/#select-from-final)修飾子付きの[SELECT](../../sql-reference/statements/select/index.md)クエリにおける自動[PREWHERE](../../sql-reference/statements/select/prewhere.md)最適化を有効または無効にします。

これは、[*MergeTree](../../engines/table-engines/mergetree-family/index.md) テーブルのみに適用されます。

可能な値:

- 0 — `FINAL` 修飾子付きの `SELECT` クエリにおける自動 `PREWHERE` 最適化が無効です。
- 1 — `FINAL` 修飾子付きの `SELECT` クエリにおける自動 `PREWHERE` 最適化が有効です。

**参照ください**

- [optimize_move_to_prewhere](#optimize_move_to_prewhere) 設定。

## optimize_multiif_to_if {#optimize_multiif_to_if}

タイプ: Bool

デフォルト値: 1

'multiIf' のみの1つの条件を'if'に置き換えます。

## optimize_normalize_count_variants {#optimize_normalize_count_variants}

タイプ: Bool

デフォルト値: 1

semantically equals to count() の集約関数を count() として書き換えます。

## optimize_on_insert {#optimize_on_insert}

タイプ: Bool

デフォルト値: 1

挿入の前にデータ変換を有効または無効にします。これは、このブロックにおいてマージが行われたかのようにします（テーブルエンジンに従います）。

可能な値:

- 0 — 無効。
- 1 — 有効。

**例**

有効と無効の違い：

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

この設定は[マテリアライズドビュー](../../sql-reference/statements/create/view.md/#materialized)の動作に影響を与えることに注意してください。

## optimize_or_like_chain {#optimize_or_like_chain}

タイプ: Bool

デフォルト値: 0

複数のOR LIKEをmultiMatchAnyに最適化します。この最適化はデフォルトで有効にすべきではありません。なぜなら、いくつかのケースではインデックス分析を妨げるからです。

## optimize_read_in_order {#optimize_read_in_order}

タイプ: Bool

デフォルト値: 1

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルからデータを読み取るために[ORDER BY](../../sql-reference/statements/select/order-by.md/#optimize_read_in_order)の最適化を有効にします。

可能な値:

- 0 — `ORDER BY` の最適化が無効です。
- 1 — `ORDER BY` の最適化が有効です。

**参照ください**

- [ORDER BY句](../../sql-reference/statements/select/order-by.md/#optimize_read_in_order)

## optimize_read_in_window_order {#optimize_read_in_window_order}

タイプ: Bool

デフォルト値: 1

MergeTreeテーブルで対応する順序でデータを読み取るためのウィンドウ句におけるORDER BYの最適化を有効にします。

## optimize_redundant_functions_in_order_by {#optimize_redundant_functions_in_order_by}

タイプ: Bool

デフォルト値: 1

ORDER BYの引数もORDER BYに存在する場合、ORDER BYから関数を削除します。

## optimize_respect_aliases {#optimize_respect_aliases}

タイプ: Bool

デフォルト値: 1

trueに設定されている場合、WHERE/GROUP BY/ORDER BYのエイリアスを尊重し、それによってパーティションプルーニング/セカンダリインデックス/optimize_aggregation_in_order/optimize_read_in_order/optimize_trivial_countを助けます。

## optimize_rewrite_aggregate_function_with_if {#optimize_rewrite_aggregate_function_with_if}

タイプ: Bool

デフォルト値: 1

論理的に等しい場合、if式を引数として持つ集約関数を書き換えます。
例えば、`avg(if(cond, col, null))`は`avgOrNullIf(cond, col)`に書き換えることができます。これによりパフォーマンスが向上する可能性があります。

:::note
アナライザー（`enable_analyzer = 1`）のサポートのみ。
:::

## optimize_rewrite_array_exists_to_has {#optimize_rewrite_array_exists_to_has}

タイプ: Bool

デフォルト値: 0

arrayExists()関数を論理的に同等である場合、has()に書き換えます。例えば、arrayExists(x -> x = 1, arr)はhas(arr, 1)に書き換えることができます。

## optimize_rewrite_sum_if_to_count_if {#optimize_rewrite_sum_if_to_count_if}

タイプ: Bool

デフォルト値: 1

sumIf()およびsum(if())関数を数えるcountIf()関数に論理的に等しい場合書き換えます。

## optimize_skip_merged_partitions {#optimize_skip_merged_partitions}

タイプ: Bool

デフォルト値: 0

1つのパートのみがレベル0より大きく、期限切れのTTLを持っていない場合、[OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md)クエリの最適化を有効または無効にします。

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

デフォルトでは、`OPTIMIZE TABLE ... FINAL`クエリは、1つのパートしかない場合でもそのパートを再書き込みます。

可能な値:

- 1 - 最適化を有効にします。
- 0 - 最適化を無効にします。

## optimize_skip_unused_shards {#optimize_skip_unused_shards}

タイプ: Bool

デフォルト値: 0

`WHERE/PREWHERE`句にシャーディングキー条件が含まれている[SELECT](../../sql-reference/statements/select/index.md)クエリに対して未使用のシャードをスキップすることを有効または無効にします（データがシャーディングキーに従って分散されていると仮定します。そうでない場合、クエリは不正確な結果を返します）。

可能な値:

- 0 — 無効。
- 1 — 有効。

## optimize_skip_unused_shards_limit {#optimize_skip_unused_shards_limit}

タイプ: UInt64

デフォルト値: 1000

シャーディングキー値の数の制限。制限に達した場合、`optimize_skip_unused_shards`がオフになります。

多数の値は、処理にかなりの量を必要とする可能性がありますが、利益が疑わしいです。なぜなら、`IN (...)`内に非常に多くの値がある場合、クエリはおそらくすべてのシャードに送信される可能性が高いからです。

## optimize_skip_unused_shards_nesting {#optimize_skip_unused_shards_nesting}

タイプ: UInt64

デフォルト値: 0

[`optimize_skip_unused_shards`](#optimize_skip_unused_shards)を制御します（したがって、`optimize_skip_unused_shards`がまだ必要です）。分散クエリのネストレベルに依存します（Distributedテーブルが別のDistributedテーブルを参照している場合）。

可能な値:

- 0 — 無効、`optimize_skip_unused_shards`は常に機能します。
- 1 — 最初のレベルのみに対して`optimize_skip_unused_shards`を有効にします。
- 2 — 2番目のレベルまで`optimize_skip_unused_shards`を有効にします。

## optimize_skip_unused_shards_rewrite_in {#optimize_skip_unused_shards_rewrite_in}

タイプ: Bool

デフォルト値: 1

リモートシャードに対してクエリ内のINを再書き換え、シャードに属さない値を除外します（`optimize_skip_unused_shards`が必要です）。

可能な値:

- 0 — 無効。
- 1 — 有効。

## optimize_sorting_by_input_stream_properties {#optimize_sorting_by_input_stream_properties}

タイプ: Bool

デフォルト値: 1

入力ストリームのソートプロパティによるソートを最適化します。

## optimize_substitute_columns {#optimize_substitute_columns}

タイプ: Bool

デフォルト値: 0

[制約](../../sql-reference/statements/create/table.md/#constraints)をカラムの置き換えに使用します。デフォルトは`false`です。

可能な値:

- true, false

## optimize_syntax_fuse_functions {#optimize_syntax_fuse_functions}

タイプ: Bool

デフォルト値: 0

同一の引数を持つ集約関数を結合できるようにします。同一の引数を持つ少なくとも2つの集約関数を含むクエリを書き換え、[sum](../../sql-reference/aggregate-functions/reference/sum.md/#agg_function-sum)、[count](../../sql-reference/aggregate-functions/reference/count.md/#agg_function-count)、または[avg](../../sql-reference/aggregate-functions/reference/avg.md/#agg_function-avg)を[sumCount](../../sql-reference/aggregate-functions/reference/sumcount.md/#agg_function-sumCount)に結合します。

可能な値:

- 0 — 同一の引数を持つ関数は結合されません。
- 1 — 同一の引数を持つ関数は結合されます。

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

## optimize_throw_if_noop {#optimize_throw_if_noop}

タイプ: Bool

デフォルト値: 0

[OPTIMIZE](../../sql-reference/statements/optimize.md)クエリがマージを実行しなかった場合に例外をスローするかどうかを有効または無効にします。

デフォルトでは、`OPTIMIZE`は何も行わなかった場合でも成功を返します。この設定により、これらの状況を区別し、例外メッセージに理由を得ることができます。

可能な値:

- 1 — 例外をスローすることが有効です。
- 0 — 例外をスローすることが無効です。

## optimize_time_filter_with_preimage {#optimize_time_filter_with_preimage}

タイプ: Bool

デフォルト値: 1

変換なしで関数を同等の比較に変換することにより、日付および日付時間の述語を最適化します（例えば、`toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`）。

## optimize_trivial_approximate_count_query {#optimize_trivial_approximate_count_query}

タイプ: Bool

デフォルト値: 0

そのような推定をサポートするストレージのトリビアルカウント最適化のために近似値を使用します。たとえば、EmbeddedRocksDB。

可能な値:

- 0 — 最適化無効。
- 1 — 最適化有効。

## optimize_trivial_count_query {#optimize_trivial_count_query}

タイプ: Bool

デフォルト値: 1

MergeTreeからのメタデータを使用して、トリビアルなクエリ `SELECT count() FROM table` の最適化を有効または無効にします。行レベルのセキュリティを使用する必要がある場合、この設定を無効にします。

可能な値:

- 0 — 最適化無効。
- 1 — 最適化有効。

参照ください：

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select {#optimize_trivial_insert_select}

タイプ: Bool

デフォルト値: 0

トリビアルな 'INSERT INTO table SELECT ... FROM TABLES' クエリを最適化します。

## optimize_uniq_to_count {#optimize_uniq_to_count}

タイプ: Bool

デフォルト値: 1

uniqおよびそのバリアント（uniqUpToを除く）をカウントに書き換えます。サブクエリがdistinctまたはgroup by句を持っている場合。

## optimize_use_implicit_projections {#optimize_use_implicit_projections}

タイプ: Bool

デフォルト値: 1

SELECTクエリを実行するために暗黙のプロジェクションを自動的に選択します。

## optimize_use_projections {#optimize_use_projections}

タイプ: Bool

デフォルト値: 1

`SELECT`クエリを処理するときの[プロジェクション](../../engines/table-engines/mergetree-family/mergetree.md/#projections)最適化を有効または無効にします。

可能な値:

- 0 — プロジェクション最適化無効。
- 1 — プロジェクション最適化有効。

## optimize_using_constraints {#optimize_using_constraints}

タイプ: Bool

デフォルト値: 0

クエリの最適化に[制約](../../sql-reference/statements/create/table.md/#constraints)を使用します。デフォルトは`false`です。

可能な値:

- true, false

## os_thread_priority {#os_thread_priority}

タイプ: Int64

デフォルト値: 0

クエリを実行するスレッドの優先度（[nice](https://en.wikipedia.org/wiki/Nice_(Unix)))を設定します。OSスケジューラは、この優先度を考慮して、各利用可能なCPUコア上で実行する次のスレッドを選択します。

:::note
この設定を使用するには、`CAP_SYS_NICE`権限を設定する必要があります。`clickhouse-server`パッケージはインストール中にこの設定を行います。一部の仮想環境では、`CAP_SYS_NICE`権限を設定することができません。この場合、`clickhouse-server`は起動時にメッセージを表示します。
:::

可能な値:

- `[-20, 19]`の範囲に値を設定できます。

値が低いほど優先度は高くなります。低い`nice`優先度の値を持つスレッドは、高い値を持つスレッドよりも頻繁に実行されます。高い値は、長時間実行される非対話的クエリには好ましいです。なぜなら、これにより短時間の対話型クエリが到着したときにリソースを迅速に譲ることができます。

## output_format_compression_level {#output_format_compression_level}

タイプ: UInt64

デフォルト値: 3

クエリ出力が圧縮される場合のデフォルトの圧縮レベル。この設定は、`SELECT`クエリが`INTO OUTFILE`を持っているか、テーブル関数`file`、`url`、`hdfs`、`s3`、または`azureBlobStorage`への書き込みの際に適用されます。

可能な値: `1` から `22` まで。
## output_format_compression_zstd_window_log {#output_format_compression_zstd_window_log}

タイプ: UInt64

デフォルト値: 0

出力圧縮方式が `zstd` の場合に使用できます。0より大きい場合、この設定は圧縮ウィンドウサイズ（2の累乗）を明示的に設定し、zstd圧縮のロングレンジモードを有効にします。これにより、より良い圧縮率を達成できます。

可能な値: 非負の数。値が小さすぎるか大きすぎると、`zstdlib`は例外をスローします。典型的な値は `20`（ウィンドウサイズ = `1MB`）から `30`（ウィンドウサイズ = `1GB`）です。

## output_format_parallel_formatting {#output_format_parallel_formatting}

タイプ: Bool

デフォルト値: 1

データフォーマットの並列フォーマットを有効または無効にします。サポートされているのは [TSV](../../interfaces/formats.md/#tabseparated)、[TSKV](../../interfaces/formats.md/#tskv)、[CSV](../../interfaces/formats.md/#csv)、および [JSONEachRow](../../interfaces/formats.md/#jsoneachrow) フォーマットのみです。

可能な値:

- 1 — 有効。
- 0 — 無効。

## page_cache_inject_eviction {#page_cache_inject_eviction}

タイプ: Bool

デフォルト値: 0

ユーザー空間ページキャッシュは、時々ランダムにいくつかのページを無効にします。テスト用に意図されています。

## parallel_distributed_insert_select {#parallel_distributed_insert_select}

タイプ: UInt64

デフォルト値: 0

並列分散 `INSERT ... SELECT` クエリを有効にします。

`INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b` クエリを実行すると、両方のテーブルが同じクラスターを使用し、両方のテーブルが [複製](../../engines/table-engines/mergetree-family/replication.md) されているか非複製である場合、このクエリは各シャードでローカルに処理されます。

可能な値:

- 0 — 無効。
- 1 — `SELECT` は分散エンジンの基盤となるテーブルの各シャードで実行されます。
- 2 — `SELECT` と `INSERT` は分散エンジンの基盤となるテーブルの各シャードで実行されます。

## parallel_replica_offset {#parallel_replica_offset}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

これは内部設定であり、直接使用すべきではなく、「並列レプリカ」モードの実装の詳細を表します。この設定は、クエリ処理に参加しているレプリカのインデックスへの分散クエリのために、イニシエーターサーバーによって自動的に設定されます。

## parallel_replicas_allow_in_with_subquery {#parallel_replicas_allow_in_with_subquery}
<BetaBadge/>

タイプ: Bool

デフォルト値: 1

真の場合、IN のためのサブクエリは各フォロワーレプリカで実行されます。

## parallel_replicas_count {#parallel_replicas_count}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

これは内部設定であり、直接使用すべきではなく、「並列レプリカ」モードの実装の詳細を表します。この設定は、クエリ処理に参加している並列レプリカの数のためにイニシエーターサーバーによって自動的に設定されます。

## parallel_replicas_custom_key {#parallel_replicas_custom_key}
<BetaBadge/>

タイプ: String

デフォルト値:

特定のテーブルのためにレプリカ間で作業を分割するために使用できる任意の整数式。
値は任意の整数式として構成できます。

主キーを使用したシンプルな式が推奨されます。

この設定が、複数のレプリカを持つ単一シャードで構成されるクラスターで使用されると、これらのレプリカは仮想シャードに変換されます。
そうでない場合、`SAMPLE` キーの場合と同じように動作し、各シャードの複数のレプリカを使用します。

## parallel_replicas_custom_key_range_lower {#parallel_replicas_custom_key_range_lower}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

フィルタータイプ `range` が、カスタム範囲 `[parallel_replicas_custom_key_range_lower, INT_MAX]` に基づいてレプリカ間で作業を均等に分配できるようにします。

[parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) と組み合わせて使用されると、フィルターは範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` のレプリカ間で作業を均等に分配することを可能にします。

注意: この設定は、クエリ処理中に追加のデータをフィルタリングする原因にはならず、並列処理のために範囲 `[0, INT_MAX]` の範囲フィルターの分割点を変更します。

## parallel_replicas_custom_key_range_upper {#parallel_replicas_custom_key_range_upper}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

フィルタータイプ `range` が、カスタム範囲 `[0, parallel_replicas_custom_key_range_upper]` に基づいてレプリカ間で作業を均等に分割できるようにします。値が0の場合は上限が無効になり、カスタムキー式の最大値が設定されます。

[parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) と組み合わせて使用されると、フィルターは範囲 `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]` のレプリカ間で作業を均等に分配できるようにします。

注意: この設定は、クエリ処理中に追加のデータをフィルタリングする原因にはならず、並列処理のために範囲 `[0, INT_MAX]` の範囲フィルターの分割点を変更します。

## parallel_replicas_for_non_replicated_merge_tree {#parallel_replicas_for_non_replicated_merge_tree}
<BetaBadge/>

タイプ: Bool

デフォルト値: 0

真の場合、ClickHouseは非複製MergeTreeテーブルにも並列レプリカアルゴリズムを使用します。

## parallel_replicas_index_analysis_only_on_coordinator {#parallel_replicas_index_analysis_only_on_coordinator}
<BetaBadge/>

タイプ: Bool

デフォルト値: 1

インデックス分析はレプリカコーディネーターでのみ行われ、他のレプリカではスキップされます。parallel_replicas_local_planが有効な場合にのみ有効です。

## parallel_replicas_local_plan {#parallel_replicas_local_plan}
<BetaBadge/>

タイプ: Bool

デフォルト値: 1

ローカルレプリカのためにローカルプランを構築します。

## parallel_replicas_mark_segment_size {#parallel_replicas_mark_segment_size}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

パーツは、並列読み取りのためにレプリカ間で分配されるセグメントに仮想的に分割されます。この設定は、これらのセグメントのサイズを制御します。何をしているのかを絶対に確信していない限り変更しないことをお勧めします。値は [128; 16384] の範囲である必要があります。

## parallel_replicas_min_number_of_rows_per_replica {#parallel_replicas_min_number_of_rows_per_replica}
<BetaBadge/>

タイプ: UInt64

デフォルト値: 0

クエリで使用されるレプリカの数を、（推定読み取り行数 / min_number_of_rows_per_replica）に制限します。最大は依然として「max_parallel_replicas」に制限されています。

## parallel_replicas_mode {#parallel_replicas_mode}
<BetaBadge/>

タイプ: ParallelReplicasMode

デフォルト値: read_tasks

カスタムキーと並列レプリカ用に使用するフィルタータイプ。デフォルト - カスタムキーにモジュロ演算を使用、範囲 - カスタムキーの値の型のすべての可能な値を使用してカスタムキー上に範囲フィルターを使用します。

## parallel_replicas_prefer_local_join {#parallel_replicas_prefer_local_join}
<BetaBadge/>

タイプ: Bool

デフォルト値: 1

真の場合、JOINが並列レプリカアルゴリズムで実行でき、RIGHT JOINのすべてのストレージが *MergeTree の場合、ローカルJOINが使用され、GLOBAL JOINの代わりに使用されます。

## parallel_view_processing {#parallel_view_processing}

タイプ: Bool

デフォルト値: 0

添付されたビューに対して、順次ではなく並行してプッシュすることを有効にします。

## parallelize_output_from_storages {#parallelize_output_from_storages}

タイプ: Bool

デフォルト値: 1

ストレージからの読み取りステップの出力を並列化します。可能であれば、ストレージから読み取った後すぐにクエリ処理を並列化を許可します。

## parsedatetime_parse_without_leading_zeros {#parsedatetime_parse_without_leading_zeros}

タイプ: Bool

デフォルト値: 1

関数 'parseDateTime' のフォーマッター '%c', '%l' および '%k' は、先頭のゼロなしで月と時間を解析します。

## partial_merge_join_left_table_buffer_bytes {#partial_merge_join_left_table_buffer_bytes}

タイプ: UInt64

デフォルト値: 0

0でない場合、部分マージJOINのために左側のテーブルのブロックをより大きなものにグループ化します。結合スレッドごとに指定されたメモリの最大2倍を使用します。

## partial_merge_join_rows_in_right_blocks {#partial_merge_join_rows_in_right_blocks}

タイプ: UInt64

デフォルト値: 65536

レフトハンドJOINアルゴリズムの部分マージJOINクエリのために、右側のJOINデータブロックのサイズを制限します。

ClickHouseサーバー:

1.  右辺のJOINデータを、指定された行数までのブロックに分割します。
2.  各ブロックをその最小値と最大値でインデックス付けします。
3.  可能なら、準備されたブロックをディスクにアンロードします。

可能な値:

- 任意の正の整数。推奨される値の範囲: \[1000, 100000\]。

## partial_result_on_first_cancel {#partial_result_on_first_cancel}

タイプ: Bool

デフォルト値: 0

クエリがキャンセル後に部分結果を返すことを許可します。

## parts_to_delay_insert {#parts_to_delay_insert}

タイプ: UInt64

デフォルト値: 0

宛先テーブルにアクティブな部分が単一パーティション内で少なくともこの数存在する場合、テーブルへの挿入を人工的に遅くします。

## parts_to_throw_insert {#parts_to_throw_insert}

タイプ: UInt64

デフォルト値: 0

宛先テーブルの単一パーティション内にアクティブな部分がこれ以上存在する場合、「Too many parts ...」という例外をスローします。

## periodic_live_view_refresh {#periodic_live_view_refresh}

タイプ: Seconds

デフォルト値: 60

定期的に更新されるライブビューが強制的に更新される間隔です。

## poll_interval {#poll_interval}

タイプ: UInt64

デフォルト値: 10

サーバーでのクエリ待機ループを指定された秒数だけブロックします。

## postgresql_connection_attempt_timeout {#postgresql_connection_attempt_timeout}

タイプ: UInt64

デフォルト値: 2

単一のPostgreSQLエンドポイントへの接続の試行における接続タイムアウト（秒）です。
値は接続URLの `connect_timeout` パラメータとして渡されます。

## postgresql_connection_pool_auto_close_connection {#postgresql_connection_pool_auto_close_connection}

タイプ: Bool

デフォルト値: 0

接続プールに接続を返す前に接続を閉じます。

## postgresql_connection_pool_retries {#postgresql_connection_pool_retries}

タイプ: UInt64

デフォルト値: 2

PostgreSQLテーブルエンジンおよびデータベースエンジン用の接続プールのプッシュ/ポップリトライ回数です。

## postgresql_connection_pool_size {#postgresql_connection_pool_size}

タイプ: UInt64

デフォルト値: 16

PostgreSQLテーブルエンジンおよびデータベースエンジンの接続プールサイズです。

## postgresql_connection_pool_wait_timeout {#postgresql_connection_pool_wait_timeout}

タイプ: UInt64

デフォルト値: 5000

PostgreSQLテーブルエンジンおよびデータベースエンジンの、空のプールのプッシュ/ポップタイムアウトです。デフォルトでは、空のプールではブロックされます。

## postgresql_fault_injection_probability {#postgresql_fault_injection_probability}

タイプ: Float

デフォルト値: 0

内部的な（レプリケーション用の）PostgreSQLクエリが失敗するおおよその確率です。有効な値は [0.0f, 1.0f] の範囲にあります。

## prefer_column_name_to_alias {#prefer_column_name_to_alias}

タイプ: Bool

デフォルト値: 0

クエリ式および句でエイリアスの代わりに元のカラム名を使用するかどうかを有効または無効にします。特にエイリアスがカラム名と同じ場合に重要です。詳細は [Expression Aliases](../../sql-reference/syntax.md/#notes-on-usage) を参照してください。この設定を有効にすると、ClickHouseのエイリアスの構文ルールがほとんどの他のデータベースエンジンとより互換性を持つようになります。

可能な値:

- 0 — カラム名がエイリアスに置き換えられます。
- 1 — カラム名がエイリアスに置き換えられません。

**例**

有効と無効の違い:

クエリ:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

結果:

```text
Received exception from server (version 21.5.1):
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function avg(number) is found inside another aggregate function in query: While processing avg(number) AS number.
```

クエリ:

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

タイプ: UInt64

デフォルト値: 16744704

外部ソートの最大ブロックバイト数を優先し、マージ中のメモリ使用量を減らします。

## prefer_global_in_and_join {#prefer_global_in_and_join}

タイプ: Bool

デフォルト値: 0

`IN`/`JOIN` 演算子を `GLOBAL IN`/`GLOBAL JOIN` に置き換えることを有効にします。

可能な値:

- 0 — 無効。 `IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられません。
- 1 — 有効。 `IN`/`JOIN` 演算子は `GLOBAL IN`/`GLOBAL JOIN` に置き換えられます。

**使用方法**

`SET distributed_product_mode=global` は分散テーブルのクエリ動作を変更できますが、ローカルテーブルや外部リソースからのテーブルには適していません。これが `prefer_global_in_and_join` 設定の出番です。

例えば、ローカルテーブルを含むクエリサービングノードがあり、これは分散には適していません。分散処理中に `GLOBAL` キーワード — `GLOBAL IN`/`GLOBAL JOIN` を用いてデータをリアルタイムで分散する必要があります。

`prefer_global_in_and_join` のもう一つの使用例は、外部エンジンによって作成されたテーブルへのアクセスです。この設定により、そのようなテーブルを結合する際の外部情報源への呼び出し回数が削減されます: クエリごとに1回のみ。

**見積もり:**

- [分散サブクエリ](../../sql-reference/operators/in.md/#select-distributed-subqueries) で `GLOBAL IN`/`GLOBAL JOIN` の使用方法の詳細を参照してください。

## prefer_localhost_replica {#prefer_localhost_replica}

タイプ: Bool

デフォルト値: 1

分散クエリの処理時にlocalhostレプリカの使用を優先的に有効または無効にします。

可能な値:

- 1 — ClickHouseは、存在する場合は常にlocalhostレプリカにクエリを送信します。
- 0 — ClickHouseは [load_balancing](#load_balancing) 設定で指定されたバランシング戦略を使用します。

:::note
[parallel_replicas_custom_key](#parallel_replicas_custom_key) なしで [max_parallel_replicas](#max_parallel_replicas) を使用している場合、この設定を無効にします。
[parallel_replicas_custom_key](#parallel_replicas_custom_key) が設定されている場合、複数のレプリカを含む複数のシャードを持つクラスターで使用されている場合以外は、この設定を無効にします。
単一のシャードと複数のレプリカを持つクラスターで使用している場合、この設定を無効にすると悪影響があります。
:::

## prefer_warmed_unmerged_parts_seconds {#prefer_warmed_unmerged_parts_seconds}

タイプ: Int64

デフォルト値: 0

ClickHouse Cloud でのみ利用可能。マージされていないパーツのうち、これに満たない秒数が経過していて未プレウォームのもの（[cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)を参照）がありますが、すべてのソースパーツが利用可能でプレウォーム済みの場合、SELECTクエリはそれらのパーツから読み込みます。Replicated-/SharedMergeTree のみ対象です。これは、CacheWarmerがパーツを処理したかどうかのみを確認します。他の何かがキャッシュにパーツを取得した場合、それはまだ冷たいと見なされず、CacheWarmerが処理するまでそのままになります。また、プレウォームであってもキャッシュから追い出された場合、それは温かいとは見なされません。

## preferred_block_size_bytes {#preferred_block_size_bytes}

タイプ: UInt64

デフォルト値: 1000000

この設定は、クエリ処理のデータブロックサイズを調整し、より粗い 'max_block_size' 設定に対する追加の微調整を表します。もしカラムが大きく、'max_block_size' 行であれば、ブロックサイズは指定されたバイト数より大きくなる可能性があり、そのサイズはCPUキャッシュのローカリティを向上させるために引き下げられます。

## preferred_max_column_in_block_size_bytes {#preferred_max_column_in_block_size_bytes}

タイプ: UInt64

デフォルト値: 0

読み取り時のブロック内のカラムの最大サイズに対する制限です。キャッシュミスの数を減らすのに役立ちます。L2キャッシュサイズに近いべきです。

## preferred_optimize_projection_name {#preferred_optimize_projection_name}

タイプ: String

デフォルト値:

非空の文字列に設定された場合、ClickHouseはクエリ内で指定されたプロジェクションを適用しようとします。

可能な値:

- 文字列: 推奨されるプロジェクションの名前。

## prefetch_buffer_size {#prefetch_buffer_size}

タイプ: UInt64

デフォルト値: 1048576

ファイルシステムから読み込むための予読みバッファの最大サイズです。

## print_pretty_type_names {#print_pretty_type_names}

タイプ: Bool

デフォルト値: 1

`DESCRIBE` クエリおよび `toTypeName()` 関数において、深くネストされた型名をインデント付きで美しく印刷することを許可します。

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

タイプ: UInt64

デフォルト値: 0

クエリの優先順位。1 - 最高、数値が大きいほど低い優先度; 0 - 優先度を使用しません。

## push_external_roles_in_interserver_queries {#push_external_roles_in_interserver_queries}

タイプ: Bool

デフォルト値: 1

クエリを実行する際、オリジネーターから他のノードへのユーザーロールをプッシュすることを有効にします。

## query_cache_compress_entries {#query_cache_compress_entries}

タイプ: Bool

デフォルト値: 1

[クエリキャッシュ](../query-cache.md)内のエントリを圧縮します。これにより、クエリキャッシュのメモリ消費を削減できますが、挿入や読み取りが遅くなります。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_max_entries {#query_cache_max_entries}

タイプ: UInt64

デフォルト値: 0

現在のユーザーが[クエリキャッシュ](../query-cache.md)に保存できるクエリ結果の最大数です。0は無制限を意味します。

可能な値:

- 正の整数 >= 0。

## query_cache_max_size_in_bytes {#query_cache_max_size_in_bytes}

タイプ: UInt64

デフォルト値: 0

現在のユーザーが[クエリキャッシュ](../query-cache.md)に割り当てられる最大メモリ量（バイト単位）。0は無制限を意味します。

可能な値:

- 正の整数 >= 0。

## query_cache_min_query_duration {#query_cache_min_query_duration}

タイプ: Milliseconds

デフォルト値: 0

その結果が[クエリキャッシュ](../query-cache.md)に保存されるためにクエリが実行される必要がある最低持続時間（ミリ秒単位）です。

可能な値:

- 正の整数 >= 0。

## query_cache_min_query_runs {#query_cache_min_query_runs}

タイプ: UInt64

デフォルト値: 0

その結果が[クエリキャッシュ](../query-cache.md)に保存されるために `SELECT` クエリが実行される必要がある最低回数です。

可能な値:

- 正の整数 >= 0。

## query_cache_nondeterministic_function_handling {#query_cache_nondeterministic_function_handling}

タイプ: QueryCacheNondeterministicFunctionHandling

デフォルト値: throw

[クエリキャッシュ](../query-cache.md)が、`rand()` や `now()` のような非決定論的関数を持つ `SELECT` クエリを処理する方法を制御します。

可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_share_between_users {#query_cache_share_between_users}

タイプ: Bool

デフォルト値: 0

有効にすると、[クエリキャッシュ](../query-cache.md)にキャッシュされた `SELECT` クエリの結果は他のユーザーが読み取ることができるようになります。
セキュリティ上の理由から、この設定を有効にすることは推奨されません。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_squash_partial_results {#query_cache_squash_partial_results}

タイプ: Bool

デフォルト値: 1

部分的な結果ブロックを [max_block_size](#max_block_size)サイズのブロックに圧縮します。これにより、[クエリキャッシュ](../query-cache.md)への挿入パフォーマンスが低下しますが、キャッシュエントリの圧縮可能性が向上します（[query_cache_compress_entries](#query_cache_compress_entries)を参照してください）。

可能な値:

- 0 - 無効
- 1 - 有効

## query_cache_system_table_handling {#query_cache_system_table_handling}

タイプ: QueryCacheSystemTableHandling

デフォルト値: throw

[クエリキャッシュ](../query-cache.md)が、システムテーブル、すなわちデータベース `system.*` および `information_schema.*` のテーブルに対する `SELECT` クエリを処理する方法を制御します。

可能な値:

- `'throw'` - 例外をスローし、クエリ結果をキャッシュしません。
- `'save'` - クエリ結果をキャッシュします。
- `'ignore'` - クエリ結果をキャッシュせず、例外もスローしません。

## query_cache_tag {#query_cache_tag}

タイプ: String

デフォルト値:

[クエリキャッシュ](../query-cache.md)エントリのラベルとして機能する文字列です。
異なるタグを持つ同じクエリは、クエリキャッシュによって異なるものと見なされます。

可能な値:

- 任意の文字列。

## query_cache_ttl {#query_cache_ttl}

タイプ: Seconds

デフォルト値: 60

この秒数の後、[クエリキャッシュ](../query-cache.md)のエントリは古くなります。

可能な値:

- 正の整数 >= 0。

## query_metric_log_interval {#query_metric_log_interval}

タイプ: Int64

デフォルト値: -1

個々のクエリに対する[query_metric_log](../../operations/system-tables/query_metric_log.md)が収集される間隔（ミリ秒単位）です。

負の値に設定すると、[query_metric_log設定](../../operations/server-configuration-parameters/settings.md/#query_metric_log)の `collect_interval_milliseconds` 値を取るか、存在しない場合はデフォルトの1000を取ります。

単一クエリの収集を無効にするには、`query_metric_log_interval` を0に設定します。

デフォルト値: -1

## query_plan_aggregation_in_order {#query_plan_aggregation_in_order}

タイプ: Bool

デフォルト値: 1

in-orderクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_convert_outer_join_to_inner_join {#query_plan_convert_outer_join_to_inner_join}

タイプ: Bool

デフォルト値: 1

JOINの後にフィルターが常にデフォルト値をフィルターする場合、OUTER JOINをINNER JOINに変換することを許可します。

## query_plan_enable_multithreading_after_window_functions {#query_plan_enable_multithreading_after_window_functions}

タイプ: Bool

デフォルト値: 1

ウィンドウ関数を評価した後にマルチスレッド処理を有効にして、並列ストリーム処理を可能にします。

## query_plan_enable_optimizations {#query_plan_enable_optimizations}

タイプ: Bool

デフォルト値: 1

クエリプランレベルでのクエリの最適化を切り替えます。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - クエリプランレベルのすべての最適化を無効にします。
- 1 - クエリプランレベルでの最適化を有効にします（個々の最適化は、個別の設定を介して依然として無効にできます）。

## query_plan_execute_functions_after_sorting {#query_plan_execute_functions_after_sorting}

タイプ: Bool

デフォルト値: 1

ソートステップの後に式を移動させるクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_filter_push_down {#query_plan_filter_push_down}

タイプ: Bool

デフォルト値: 1

実行プラン内でフィルターを下に移動させるクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_join_swap_table {#query_plan_join_swap_table}

タイプ: BoolAuto

デフォルト値: auto

JOINのどちらの側がビルドテーブル（内部、ハッシュJOINの場合のハッシュテーブルに挿入されるものとも呼ばれる）であるべきかをクエリプランで決定します。この設定は、`JOIN ON`句での `ALL` JOIN の厳密さに対してのみサポートされます。可能な値は次の通りです:
- 'auto': プランナーにどのテーブルをビルドテーブルとして使用するかを決定させます。
- 'false': テーブルを入れ替えない（右のテーブルがビルドテーブル）。
- 'true': テーブルを常に入れ替える（左のテーブルがビルドテーブル）。

## query_plan_lift_up_array_join {#query_plan_lift_up_array_join}

タイプ: Bool

デフォルト値: 1

クエリプランレベルの最適化を切り替え、ARRAY JOINを実行プランの上に移動させます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_lift_up_union {#query_plan_lift_up_union}

タイプ: Bool

デフォルト値: 1

クエリプランの大きなサブツリーをユニオンに移動させ、さらなる最適化を可能にするクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_max_optimizations_to_apply {#query_plan_max_optimizations_to_apply}

タイプ: UInt64

デフォルト値: 10000

クエリプランに適用される最適化の総数を制限します。[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定を参照してください。
複雑なクエリに対して長い最適化時間を回避するのに役立ちます。
実際の最適化の数がこの設定を超えた場合、例外がスローされます。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

## query_plan_merge_expressions {#query_plan_merge_expressions}

タイプ: Bool

デフォルト値: 1

連続するフィルターをマージするクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_merge_filters {#query_plan_merge_filters}

タイプ: Bool

デフォルト値: 1

クエリプラン内でのフィルターをマージを許可します。

## query_plan_optimize_prewhere {#query_plan_optimize_prewhere}

タイプ: Bool

デフォルト値: 1

サポートされているストレージ用にフィルターをPREWHERE式にプッシュダウンすることを許可します。

## query_plan_push_down_limit {#query_plan_push_down_limit}

タイプ: Bool

デフォルト値: 1

実行プラン内でLIMITを下に移動させるクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_read_in_order {#query_plan_read_in_order}

タイプ: Bool

デフォルト値: 1

順序での読み取りの最適化を切り替え、クエリプランレベルの最適化を行います。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_distinct {#query_plan_remove_redundant_distinct}

タイプ: Bool

デフォルト値: 1

冗長なDISTINCTステップを削除するクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_remove_redundant_sorting {#query_plan_remove_redundant_sorting}

タイプ: Bool

デフォルト値: 1

冗長なソートステップを削除するクエリプランレベルの最適化を切り替え、サブクエリなどで発生します。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::

可能な値:

- 0 - 無効
- 1 - 有効

## query_plan_reuse_storage_ordering_for_window_functions {#query_plan_reuse_storage_ordering_for_window_functions}

タイプ: Bool

デフォルト値: 1

ウィンドウ関数のためにソートする際にストレージのソートを使用するクエリプランレベルの最適化を切り替えます。
[query_plan_enable_optimizations](#query_plan_enable_optimizations) 設定が1の場合にのみ効果を発揮します。

:::note
これは開発者によるデバッグのためにのみ使用されるべき専門的な設定です。この設定は将来、後方互換性のない方法で変更されるか削除される可能性があります。
:::
## query_plan_split_filter {#query_plan_split_filter}

Type: Bool

Default value: 1

:::note
これはデバッグ用に開発者のみが使用すべき専門的な設定です。この設定は将来的に後方互換性がない方法で変更される可能性があるか、削除されることがあります。
:::

クエリ計画レベルの最適化を切り替え、フィルタを式に分割します。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合のみ有効です。

可能な値:

- 0 - 無効
- 1 - 有効
## query_plan_try_use_vector_search {#query_plan_try_use_vector_search}

Type: Bool

Default value: 1

クエリ計画レベルの最適化を切り替え、ベクトル類似インデックスの使用を試みます。
設定 [query_plan_enable_optimizations](#query_plan_enable_optimizations) が 1 の場合のみ有効です。

:::note
これはデバッグ用に開発者のみが使用すべき専門的な設定です。この設定は将来的に後方互換性がない方法で変更される可能性があるか、削除されることがあります。
:::

可能な値:

- 0 - 無効
- 1 - 有効
## query_plan_use_new_logical_join_step {#query_plan_use_new_logical_join_step}

Type: Bool

Default value: 1

クエリ計画で新しい論理結合ステップを使用します。
## query_profiler_cpu_time_period_ns {#query_profiler_cpu_time_period_ns}

Type: UInt64

Default value: 1000000000

[クエリプロファイラ](../../operations/optimizing-performance/sampling-query-profiler.md)の CPU クロックタイマーの期間を設定します。このタイマーは CPU 時間のみをカウントします。

可能な値:

- 正の整数ナノ秒数。

    推奨値:

            - 単一のクエリの場合は 10000000 (1 秒間に 100 回) ナノ秒以上。
            - クラスター全体のプロファイリングには 1000000000 (1 秒に 1 回)。

- タイマーをオフにするには 0 を設定します。

**ClickHouse Cloud では一時的に無効になっています。**

参照:

- システムテーブル [trace_log](../../operations/system-tables/trace_log.md/#system_tables-trace_log)
## query_profiler_real_time_period_ns {#query_profiler_real_time_period_ns}

Type: UInt64

Default value: 1000000000

[クエリプロファイラ](../../operations/optimizing-performance/sampling-query-profiler.md)の実時間クロックタイマーの期間を設定します。実時間クロックタイマーは壁時計時間をカウントします。

可能な値:

- 正の整数ナノ秒数。

    推奨値:

            - 単一のクエリの場合は 10000000 (1 秒間に 100 回) ナノ秒以下。
            - クラスター全体のプロファイリングには 1000000000 (1 秒に 1 回)。

- タイマーをオフにするには 0 を設定します。

**ClickHouse Cloud では一時的に無効になっています。**

参照:

- システムテーブル [trace_log](../../operations/system-tables/trace_log.md/#system_tables-trace_log)
## queue_max_wait_ms {#queue_max_wait_ms}

Type: ミリ秒

Default value: 0

同時リクエストの数が最大を超えた場合のリクエストキューでの待機時間。
## rabbitmq_max_wait_ms {#rabbitmq_max_wait_ms}

Type: ミリ秒

Default value: 5000

再試行前に RabbitMQ からの読み取りの待機時間。
## read_backoff_max_throughput {#read_backoff_max_throughput}

Type: UInt64

Default value: 1048576

遅い読み取りの際にスレッドの数を減らすための設定。読み取り帯域幅がそのバイト数/秒未満のイベントをカウントします。
## read_backoff_min_concurrency {#read_backoff_min_concurrency}

Type: UInt64

Default value: 1

遅い読み取りの際に最小スレッド数を維持しようとする設定。
## read_backoff_min_events {#read_backoff_min_events}

Type: UInt64

Default value: 2

遅い読み取りの際にスレッドの数を減らすための設定。スレッド数を減らす基準となるイベント数。
## read_backoff_min_interval_between_events_ms {#read_backoff_min_interval_between_events_ms}

Type: ミリ秒

Default value: 1000

遅い読み取りの際にスレッドの数を減らすための設定。前のイベントから一定時間が経過していない場合は、そのイベントを無視します。
## read_backoff_min_latency_ms {#read_backoff_min_latency_ms}

Type: ミリ秒

Default value: 1000

遅い読み取りの際にスレッドの数を減らすための設定。少なくともその時間がかかった読み取りのみを考慮します。
## read_from_filesystem_cache_if_exists_otherwise_bypass_cache {#read_from_filesystem_cache_if_exists_otherwise_bypass_cache}

Type: Bool

Default value: 0

ファイルシステムキャッシュをパッシブモードで使用することを許可します - 既存のキャッシュエントリからの恩恵を受けますが、キャッシュに新しいエントリを追加しません。この設定を重いアドホッククエリに対して設定し、短いリアルタイムクエリには無効にすると、重いクエリによるキャッシュのスラッシングを避け、全体的なシステムの効率を向上させます。
## read_from_page_cache_if_exists_otherwise_bypass_cache {#read_from_page_cache_if_exists_otherwise_bypass_cache}

Type: Bool

Default value: 0

ユーザースペースページキャッシュをパッシブモードで使用します。これは `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` と同様です。
## read_in_order_two_level_merge_threshold {#read_in_order_two_level_merge_threshold}

Type: UInt64

Default value: 100

主キーの順序でマルチスレッド読み取り中に予備マージステップを実行するために読み取る必要のある最小パーツ数です。
## read_in_order_use_buffering {#read_in_order_use_buffering}

Type: Bool

Default value: 1

主キーの順序で読み取る際にマージ前にバッファリングを使用します。これにより、クエリ実行の並行性が向上します。
## read_in_order_use_virtual_row {#read_in_order_use_virtual_row}

Type: Bool

Default value: 0

主キーまたはその単調関数の形式で読み取る際に仮想行を使用します。これは複数のパーツを検索する際に、関連するもののみが触れられるため便利です。
## read_overflow_mode {#read_overflow_mode}

Type: OverflowMode

Default value: throw

リミットを超えた際の処理方法です。
## read_overflow_mode_leaf {#read_overflow_mode_leaf}

Type: OverflowMode

Default value: throw

リーフのリミットを超えた際の処理方法です。
## read_priority {#read_priority}

Type: Int64

Default value: 0

ローカルファイルシステムまたはリモートファイルシステムからデータを読み取る優先順位。ローカルファイルシステムの場合は 'pread_threadpool' 方法、リモートファイルシステムの場合は `threadpool` 方法のみサポートされています。
## read_through_distributed_cache {#read_through_distributed_cache}

Type: Bool

Default value: 0

ClickHouse Cloud のみ。分散キャッシュからの読み取りを許可します。
## readonly {#readonly}

Type: UInt64

Default value: 0

0 - 読み取り専用の制限なし。1 - 読み取りリクエストのみ、明示的に許可された設定の変更も可能。2 - 読み取りリクエストのみ、設定の変更も可能、ただし 'readonly' 設定は除く。
## receive_data_timeout_ms {#receive_data_timeout_ms}

Type: ミリ秒

Default value: 2000

最初のデータパケットまたはレプリカからの進行中のパケットを受信するための接続タイムアウトです。
## receive_timeout {#receive_timeout}

Type: 秒

Default value: 300

ネットワークからデータを受信するためのタイムアウト。指定された時間内にバイトが受信されなかった場合、例外がスローされます。クライアントでこの設定を設定すると、ソケットの 'send_timeout' もサーバーの該当する接続端で設定されます。
## regexp_max_matches_per_row {#regexp_max_matches_per_row}

Type: UInt64

Default value: 1000

単一の正規表現あたりの行ごとの最大マッチ数を設定します。これは、[extractAllGroupsHorizontal](../../sql-reference/functions/string-search-functions.md/#extractallgroups-horizontal) 関数で貪欲な正規表現を使用する際のメモリオーバーロードを防ぐために使用します。

可能な値:

- 正の整数。
## reject_expensive_hyperscan_regexps {#reject_expensive_hyperscan_regexps}

Type: Bool

Default value: 1

おそらく hyperScan で評価するのに高価なパターンを拒否します（NFAの状態爆発が原因）。
## remerge_sort_lowered_memory_bytes_ratio {#remerge_sort_lowered_memory_bytes_ratio}

Type: Float

Default value: 2

再マージ後のメモリ使用量がこの比率で減少しない場合、再マージは無効になります。
## remote_filesystem_read_method {#remote_filesystem_read_method}

Type: String

Default value: threadpool

リモートファイルシステムからデータを読み取る方法で、read か threadpool のいずれかです。
## remote_filesystem_read_prefetch {#remote_filesystem_read_prefetch}

Type: Bool

Default value: 1

リモートファイルシステムからデータを読み取る際にプレフェッチを使用すべきかどうか。
## remote_fs_read_backoff_max_tries {#remote_fs_read_backoff_max_tries}

Type: UInt64

Default value: 5

バックオフ時の最大読み取り試行回数。
## remote_fs_read_max_backoff_ms {#remote_fs_read_max_backoff_ms}

Type: UInt64

Default value: 10000

リモートディスクからデータを読み取る際の最大待機時間。
## remote_read_min_bytes_for_seek {#remote_read_min_bytes_for_seek}

Type: UInt64

Default value: 4194304

リモート読み取り（url, s3）でシークを行うために必要な最小バイト数。無視して読み取るのではなく。
## rename_files_after_processing {#rename_files_after_processing}

Type: String

Default value:

- **Type:** String

- **Default value:** 空文字列

この設定は、`file` テーブル関数によって処理されたファイルのリネームパターンを指定することを可能にします。このオプションが設定されると、`file` テーブル関数によって読み取られたすべてのファイルは、指定されたパターンに応じてプレースホルダを使用してリネームされます。ただし、ファイル処理が成功した場合に限ります。
### プレースホルダ

- `%a` — 元のファイル名全体（例: "sample.csv"）。
- `%f` — 拡張子なしの元のファイル名（例: "sample"）。
- `%e` — ドット付きの元のファイル拡張子（例: ".csv"）。
- `%t` — タイムスタンプ（マイクロ秒単位）。
- `%%` — パーセント記号 ("%")。
### 例
- オプション: `--rename_files_after_processing="processed_%f_%t%e"`

- クエリ: `SELECT * FROM file('sample.csv')`


`sample.csv` の読み取りが成功すると、ファイルは `processed_sample_1683473210851438.csv` にリネームされます。
## replace_running_query {#replace_running_query}

Type: Bool

Default value: 0

HTTP インターフェイスを使用する際、‘query_id’ パラメータを渡すことができます。これは、クエリ識別子として機能する任意の文字列です。
同じユーザーから同じ ‘query_id’ に関するクエリが既に存在する場合、その動作は ‘replace_running_query’ パラメータに依存します。

`0`（デフォルト） – 例外をスローします（同じ ‘query_id’ のクエリがすでに実行中の場合、そのクエリの実行を許可しません）。

`1` – 古いクエリをキャンセルし、新しいクエリの実行を開始します。

このパラメータを 1 に設定すると、セグメンテーション条件の提案を実装できます。次の文字を入力すると、古いクエリがまだ終了していない場合、それをキャンセルする必要があります。
## replace_running_query_max_wait_ms {#replace_running_query_max_wait_ms}

Type: ミリ秒

Default value: 5000

[replace_running_query](#replace_running_query) 設定がアクティブなときに、同じ `query_id` のクエリが終了するまでの待機時間。

可能な値:

- 正の整数。
- 0 — サーバーがすでに同じ `query_id` でクエリを実行している場合、新しいクエリを実行することを許可しない例外をスローします。
## replication_wait_for_inactive_replica_timeout {#replication_wait_for_inactive_replica_timeout}

Type: Int64

Default value: 120

非アクティブなレプリカが [ALTER](../../sql-reference/statements/alter/index.md)、[OPTIMIZE](../../sql-reference/statements/optimize.md) または [TRUNCATE](../../sql-reference/statements/truncate.md) クエリを実行するまでの待機時間（秒単位）を指定します。

可能な値:

- 0 — 待機しません。
- 負の整数 — 無制限の時間待機します。
- 正の整数 — 待機する秒数。
## restore_replace_external_dictionary_source_to_null {#restore_replace_external_dictionary_source_to_null}

Type: Bool

Default value: 0

復元時に外部辞書ソースを Null に置き換えます。テスト目的に便利です。
## restore_replace_external_engines_to_null {#restore_replace_external_engines_to_null}

Type: Bool

Default value: 0

テスト目的。すべての外部エンジンを Null に置き換え、外部接続を開始しないようにします。
## restore_replace_external_table_functions_to_null {#restore_replace_external_table_functions_to_null}

Type: Bool

Default value: 0

テスト目的。すべての外部テーブル関数を Null に置き換え、外部接続を開始しないようにします。
## result_overflow_mode {#result_overflow_mode}

Type: OverflowMode

Default value: throw

リミットを超えた際の処理方法です。
## rewrite_count_distinct_if_with_count_distinct_implementation {#rewrite_count_distinct_if_with_count_distinct_implementation}

Type: Bool

Default value: 0

`countDistcintIf` を [count_distinct_implementation](#count_distinct_implementation) 設定で書き換えることを許可します。

可能な値:

- true — 許可。
- false — 不許可。
## s3_allow_parallel_part_upload {#s3_allow_parallel_part_upload}

Type: Bool

Default value: 1

s3 マルチパートアップロードで複数スレッドを使用します。これにより、わずかにメモリ使用量が増加する場合があります。
## s3_check_objects_after_upload {#s3_check_objects_after_upload}

Type: Bool

Default value: 0

アップロードが成功したことを確認するために、head リクエストで各アップロードオブジェクトを s3 でチェックします。
## s3_connect_timeout_ms {#s3_connect_timeout_ms}

Type: UInt64

Default value: 1000

s3 ディスクからのホストへの接続タイムアウトです。
## s3_create_new_file_on_insert {#s3_create_new_file_on_insert}

Type: Bool

Default value: 0

s3 エンジンテーブルに挿入するたびに新しいファイルを作成するかどうかを有効または無効にします。これを有効にすると、各挿入でこのパターンに似たキーを持つ新しい S3 オブジェクトが作成されます:

初期: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` など。

可能な値:
- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追加します。
- 1 — `INSERT` クエリは新しいデータでファイルの既存の内容を置き換えます。
## s3_disable_checksum {#s3_disable_checksum}

Type: Bool

Default value: 0

ファイルを S3 に送信する際にチェックサムを計算しません。これにより、ファイルに対する過度な処理を回避して書き込みが高速化されます。MergeTree テーブルのデータは ClickHouse によってチェックサムが計算されているため、ほとんど安全です。また、S3 に HTTPS でアクセスされると、TLS 層がネットワークを通じて転送中の整合性を提供します。S3 上の追加のチェックサムは、防御層を提供します。
## s3_ignore_file_doesnt_exist {#s3_ignore_file_doesnt_exist}

Type: Bool

Default value: 0

特定のキーを読み取る際にファイルが存在しない場合、その不在を無視します。

可能な値:
- 1 — `SELECT` は空の結果を返します。
- 0 — `SELECT` は例外をスローします。
## s3_list_object_keys_size {#s3_list_object_keys_size}

Type: UInt64

Default value: 1000

ListObject リクエストで一度に返される可能性のある最大ファイル数。
## s3_max_connections {#s3_max_connections}

Type: UInt64

Default value: 1024

サーバーごとの最大接続数。
## s3_max_get_burst {#s3_max_get_burst}

Type: UInt64

Default value: 0

リクエストを発行できる最大の同時リクエスト数。デフォルト(0)は `s3_max_get_rps` に等しいです。
## s3_max_get_rps {#s3_max_get_rps}

Type: UInt64

Default value: 0

スロットリング前の S3 GET リクエストの毎秒制限。ゼロは無制限を意味します。
## s3_max_inflight_parts_for_one_file {#s3_max_inflight_parts_for_one_file}

Type: UInt64

Default value: 20

マルチパートアップロードリクエストで同時に読み込まれるパーツの最大数。0 は無制限を意味します。
## s3_max_part_number {#s3_max_part_number}

Type: UInt64

Default value: 10000

s3 アップロードパーツの最大パート番号です。
## s3_max_put_burst {#s3_max_put_burst}

Type: UInt64

Default value: 0

リクエストを発行できる最大の同時リクエスト数。デフォルト(0)は `s3_max_put_rps` に等しいです。
## s3_max_put_rps {#s3_max_put_rps}

Type: UInt64

Default value: 0

スロットリング前の S3 PUT リクエストの毎秒制限。ゼロは無制限を意味します。
## s3_max_redirects {#s3_max_redirects}

Type: UInt64

Default value: 10

許可される最大の S3 リダイレクトホップ数。
## s3_max_single_operation_copy_size {#s3_max_single_operation_copy_size}

Type: UInt64

Default value: 33554432

s3 での単一のコピー操作の最大サイズです。
## s3_max_single_part_upload_size {#s3_max_single_part_upload_size}

Type: UInt64

Default value: 33554432

単一パートアップロードを S3 に行う際のオブジェクトの最大サイズです。
## s3_max_single_read_retries {#s3_max_single_read_retries}

Type: UInt64

Default value: 4

単一の S3 読み取り中の最大試行回数です。
## s3_max_unexpected_write_error_retries {#s3_max_unexpected_write_error_retries}

Type: UInt64

Default value: 4

S3 の書き込み中に予期しないエラーが発生した場合の最大試行回数。
## s3_max_upload_part_size {#s3_max_upload_part_size}

Type: UInt64

Default value: 5368709120

マルチパートアップロード中に S3 へアップロードするパーツの最大サイズです。
## s3_min_upload_part_size {#s3_min_upload_part_size}

Type: UInt64

Default value: 16777216

マルチパートアップロード中に S3 へのアップロードパーツの最小サイズです。
## s3_request_timeout_ms {#s3_request_timeout_ms}

Type: UInt64

Default value: 30000

S3 へのデータ送受信時のアイドルタイムアウト。単一の TCP 読み取りまたは書き込み呼び出しがこの時間内にブロックされた場合、失敗します。
## s3_retry_attempts {#s3_retry_attempts}

Type: UInt64

Default value: 100

Aws::Client::RetryStrategy の設定。Aws::Client は自動的にリトライを行います。0 はリトライなしを意味します。
## s3_skip_empty_files {#s3_skip_empty_files}

Type: Bool

Default value: 1

[S3](../../engines/table-engines/integrations/s3.md) エンジンテーブルで空のファイルをスキップするかどうかを有効または無効にします。

可能な値:
- 0 — `SELECT` は空のファイルが要求されたフォーマットと互換性がない場合に例外をスローします。
- 1 — `SELECT` は空のファイルに対して空の結果を返します。
## s3_strict_upload_part_size {#s3_strict_upload_part_size}

Type: UInt64

Default value: 0

マルチパートアップロード中に S3 へアップロードされるパーツの正確なサイズです（ある実装では可変サイズパーツをサポートしていません）。
## s3_throw_on_zero_files_match {#s3_throw_on_zero_files_match}

Type: Bool

Default value: 0

ListObjects リクエストがファイルと一致しない場合にエラーをスローします。
## s3_truncate_on_insert {#s3_truncate_on_insert}

Type: Bool

Default value: 0

s3 エンジンテーブルでの挿入前に切り捨てを有効または無効にします。無効にした場合、S3 オブジェクトが既に存在する場合は挿入しようとすると例外がスローされます。

可能な値:
- 0 — `INSERT` クエリはファイルの末尾に新しいデータを追加します。
- 1 — `INSERT` クエリはファイルの既存の内容を新しいデータで置き換えます。
## s3_upload_part_size_multiply_factor {#s3_upload_part_size_multiply_factor}

Type: UInt64

Default value: 2

s3_multiply_parts_count_threshold からの単一の書き込みでアップロードされた各パーツごとに、s3_min_upload_part_size にこのファクターを掛けます。
## s3_upload_part_size_multiply_parts_count_threshold {#s3_upload_part_size_multiply_parts_count_threshold}

Type: UInt64

Default value: 500

S3 にこの数のパーツがアップロードされるたびに、s3_min_upload_part_size に s3_upload_part_size_multiply_factor を掛けます。
## s3_use_adaptive_timeouts {#s3_use_adaptive_timeouts}

Type: Bool

Default value: 1

`true` に設定した場合、s3 リクエストの最初の 2 回の試行は低い送信および受信タイムアウトで行われます。
`false` に設定した場合、すべての試行は同一のタイムアウトで行われます。
## s3_validate_request_settings {#s3_validate_request_settings}

Type: Bool

Default value: 1

s3 リクエスト設定の検証を有効にします。

可能な値:
- 1 — 設定を検証します。
- 0 — 設定を検証しません。
## s3queue_default_zookeeper_path {#s3queue_default_zookeeper_path}

Type: String

Default value: /clickhouse/s3queue/

S3Queue エンジンのデフォルト Zookeeper パスプレフィックスです。
## s3queue_enable_logging_to_s3queue_log {#s3queue_enable_logging_to_s3queue_log}

Type: Bool

Default value: 0

system.s3queue_log への書き込みを有効にします。この値は、テーブル設定で上書き可能です。
## s3queue_migrate_old_metadata_to_buckets {#s3queue_migrate_old_metadata_to_buckets}

Type: Bool

Default value: 0

S3Queue テーブルの古いメタデータ構造を新しいものに移行します。
## schema_inference_cache_require_modification_time_for_url {#schema_inference_cache_require_modification_time_for_url}

Type: Bool

Default value: 1

最終更新日時の検証があるURLに対してキャッシュからのスキーマを使用します（Last-Modified ヘッダーを持つURLに対して）。
## schema_inference_use_cache_for_azure {#schema_inference_use_cache_for_azure}

Type: Bool

Default value: 1

Azure テーブル関数を使用する際に、スキーマ推論のキャッシュを使用します。
## schema_inference_use_cache_for_file {#schema_inference_use_cache_for_file}

Type: Bool

Default value: 1

ファイルテーブル関数を使用する際に、スキーマ推論のキャッシュを使用します。
## schema_inference_use_cache_for_hdfs {#schema_inference_use_cache_for_hdfs}

Type: Bool

Default value: 1

HDFS テーブル関数を使用する際に、スキーマ推論のキャッシュを使用します。
## schema_inference_use_cache_for_s3 {#schema_inference_use_cache_for_s3}

Type: Bool

Default value: 1

S3 テーブル関数を使用する際に、スキーマ推論のキャッシュを使用します。
## schema_inference_use_cache_for_url {#schema_inference_use_cache_for_url}

Type: Bool

Default value: 1

URL テーブル関数を使用する際に、スキーマ推論のキャッシュを使用します。
## select_sequential_consistency {#select_sequential_consistency}

Type: UInt64

Default value: 0

:::note
この設定は SharedMergeTree と ReplicatedMergeTree で行動が異なります。SharedMergeTree における `select_sequential_consistency` の動作についての詳細は、[SharedMergeTree 一貫性](/docs/cloud/reference/shared-merge-tree/#consistency) を参照してください。
:::

`SELECT` クエリのために逐次的一貫性を有効または無効にします。`insert_quorum_parallel` が無効である必要があります（デフォルトでは有効）。

可能な値:

- 0 — 無効。
- 1 — 有効。

使用法

逐次的一貫性が有効な場合、ClickHouseはクライアントが `insert_quorum` を使用して実行されたすべての前の `INSERT` クエリのデータを含むレプリカに対してのみ `SELECT` クエリを実行することを許可します。クライアントが部分的なレプリカを参照する場合、ClickHouse は例外を生成します。SELECT クエリには、まだ quorum のレプリカに書き込まれていないデータは含まれません。

`insert_quorum_parallel` が有効な場合（デフォルト）では、`select_sequential_consistency` は機能しません。これは、並行して実行される `INSERT` クエリが異なるセットの quorum レプリカに書き込まれる可能性があるため、単一のレプリカがすべての書き込みを受信したという保証がないためです。

参照:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
## send_logs_level {#send_logs_level}

Type: LogsLevel

Default value: fatal

指定された最小レベルでサーバーテキストログをクライアントに送信します。有効な値: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'
## send_logs_source_regexp {#send_logs_source_regexp}

Type: String

Default value:

指定された正規表現でログソース名を一致させるためにサーバーテキストログを送信します。空はすべてのソースを意味します。
## send_progress_in_http_headers {#send_progress_in_http_headers}

Type: Bool

Default value: 0

`clickhouse-server` の応答に `X-ClickHouse-Progress` HTTP レスポンスヘッダーを有効または無効にします。

詳細については、[HTTP インターフェイスの説明](../../interfaces/http.md)を参照してください。

可能な値:

- 0 — 無効。
- 1 — 有効。
## send_timeout {#send_timeout}

Type: 秒

Default value: 300

ネットワークにデータを送信するためのタイムアウト（秒単位）。クライアントがデータを送信する必要があるが、この時間内にバイトを送信できない場合、例外がスローされます。クライアントでこの設定を指定すると、ソケットの 'receive_timeout' もサーバーの該当する接続端で設定されます。
## session_timezone {#session_timezone}
<BetaBadge/>

Type: Timezone

Default value:

現在のセッションまたはクエリの暗黙のタイムゾーンを設定します。
暗黙のタイムゾーンは、明示的に指定されたタイムゾーンがない DateTime/DateTime64 型の値に適用されるタイムゾーンです。
この設定は、グローバルに構成された（サーバーレベルの）暗黙のタイムゾーンに優先します。
''（空文字列）の値は、現在のセッションまたはクエリの暗黙のタイムゾーンが [サーバータイムゾーン](../server-configuration-parameters/settings.md/#timezone) と等しいことを意味します。

`timeZone()` および `serverTimeZone()` 関数を使用して、セッションのタイムゾーンとサーバーのタイムゾーンを取得できます。

可能な値:

- `system.time_zones` からの任意のタイムゾーン名、例: `Europe/Berlin`, `UTC` または `Zulu`

例:

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

暗黙のタイムゾーン 'America/Denver' を明示的なタイムゾーンが指定されていない内側の日付時刻に割り当てます：

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
DateTime/DateTime64 を解析するすべての関数が `session_timezone` を尊重するわけではありません。これにより、微妙なエラーが発生する可能性があります。
次の例と説明を参照してください。
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
0 行がセットされます。

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

これは異なる解析パイプラインによるものです：

- 明示的なタイムゾーンが指定されていない `toDateTime()` が最初の `SELECT` クエリで使用されており、設定 `session_timezone` とグローバルタイムゾーンを尊重しています。
- 二番目のクエリでは、文字列から DateTime が解析され、既存のカラム `d` の型とタイムゾーンを引き継ぎます。したがって、設定 `session_timezone` とグローバルタイムゾーンは尊重されません。

**参照**

- [timezone](../server-configuration-parameters/settings.md/#timezone)
## set_overflow_mode {#set_overflow_mode}

Type: OverflowMode

Default value: throw

リミットを超えた際の処理方法です。
## shared_merge_tree_sync_parts_on_partition_operations {#shared_merge_tree_sync_parts_on_partition_operations}

Type: Bool

Default value: 1

SMT テーブルにおける MOVE|REPLACE|ATTACH パーティション操作後にデータパーツのセットを自動的に同期します。クラウド専用です。
## short_circuit_function_evaluation {#short_circuit_function_evaluation}

Type: ShortCircuitFunctionEvaluation

Default value: enable

[if](../../sql-reference/functions/conditional-functions.md/#if)、[multiIf](../../sql-reference/functions/conditional-functions.md/#multiif)、[and](../../sql-reference/functions/logical-functions.md/#logical-and-function)、[or](../../sql-reference/functions/logical-functions.md/#logical-or-function) 関数を [ショートスキーム](https://en.wikipedia.org/wiki/Short-circuit_evaluation) に従って計算することを許可します。これにより、これらの関数内の複雑な式の実行を最適化し、予期されない可能性のある例外（例: ゼロで割ること）を防ぎます。

可能な値:

- `enable` — 適切な関数のためのショートサーキット関数評価を有効にします（例外をスローする可能性があるか計算的に重い）。
- `force_enable` — すべての関数に対してショートサーキット関数評価を有効にします。
- `disable` — ショートサーキット関数評価を無効にします。
## short_circuit_function_evaluation_for_nulls {#short_circuit_function_evaluation_for_nulls}

Type: Bool

Default value: 1

引数内のNULL値の比率が short_circuit_function_evaluation_for_nulls_threshold を超えた場合、NULL以外の値を持つ行に対してのみ Nullable 引数を持つ関数を実行できるようにします。これは、引数内に1つでもNULL値がある行に対してNULL値を返す関数に適用されます。
## short_circuit_function_evaluation_for_nulls_threshold {#short_circuit_function_evaluation_for_nulls_threshold}

Type: Double

Default value: 1

すべての引数で非NULL値を持つ行に対してのみ Nullable 引数を持つ関数を実行するための NULL 値の比率の閾値。これは、short_circuit_function_evaluation_for_nulls が有効なときに適用されます。
NULL 値を含む行の比率がこの閾値を超えると、NULL 値を含む行は評価されません。
## show_table_uuid_in_table_create_query_if_not_nil {#show_table_uuid_in_table_create_query_if_not_nil}

Type: Bool

Default value: 0

`SHOW TABLE` クエリの表示を設定します。

可能な値:

- 0 — クエリはテーブル UUID なしで表示されます。
- 1 — クエリはテーブル UUID と共に表示されます。
## single_join_prefer_left_table {#single_join_prefer_left_table}

Type: Bool

Default value: 1

識別子の曖昧さのある単一結合の場合は、左側のテーブルを優先します。
## skip_redundant_aliases_in_udf {#skip_redundant_aliases_in_udf}

Type: Bool

Default value: 0

冗長なエイリアスは使用されず（置き換えられず）、ユーザー定義関数での使用を簡素化します。

可能な値:

- 1 — エイリアスは UDF においてスキップされます（置き換えられます）。
- 0 — エイリアスは UDF においてスキップされません（置き換えられません）。

**例**

有効と無効の違い:

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

クエリ:

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

Type: Bool

Default value: 0

利用できないシャードを静かにスキップするかどうかを有効または無効にします。

シャードは、すべてのレプリカが利用できない場合に利用できないと見なされます。レプリカは次の場合に利用できません：

- ClickHouse は何らかの理由でレプリカに接続できません。

    レプリカに接続する際、ClickHouse は複数回の試行を行います。すべての試行が失敗した場合、レプリカは利用できないと見なされます。

- レプリカは DNS を通じて解決できません。

    レプリカのホスト名が DNS を通じて解決できない場合、以下の状況を示す可能性があります：

    - レプリカのホストに DNS レコードがありません。これは、ノードがダウンタイム中に解決できないシステム (例えば、[Kubernetes](https://kubernetes.io)) で発生する可能性があり、これはエラーではありません。

    - 設定エラー。ClickHouse 設定ファイルに誤ったホスト名が含まれています。

可能な値：

- 1 — スキップが有効。

    シャードが利用できない場合、ClickHouse は部分データに基づいて結果を返し、ノードの可用性の問題を報告しません。

- 0 — スキップが無効。

    シャードが利用できない場合、ClickHouse は例外をスローします。

## sleep_after_receiving_query_ms {#sleep_after_receiving_query_ms}

Type: ミリ秒

Default value: 0

TCPHandler でクエリを受信した後のスリープ時間

## sleep_in_send_data_ms {#sleep_in_send_data_ms}

Type: ミリ秒

Default value: 0

TCPHandler でデータを送信する際のスリープ時間

## sleep_in_send_tables_status_ms {#sleep_in_send_tables_status_ms}

Type: ミリ秒

Default value: 0

TCPHandler でテーブルの状態レスポンスを送信する際のスリープ時間

## sort_overflow_mode {#sort_overflow_mode}

Type: OverflowMode

Default value: throw

制限を超えた場合の処理方法。

## split_intersecting_parts_ranges_into_layers_final {#split_intersecting_parts_ranges_into_layers_final}

Type: Bool

Default value: 1

FINAL 最適化中に交差するパーツの範囲をレイヤーに分割します。

## split_parts_ranges_into_intersecting_and_non_intersecting_final {#split_parts_ranges_into_intersecting_and_non_intersecting_final}

Type: Bool

Default value: 1

FINAL 最適化中にパーツの範囲を交差するものと交差しないものに分割します。

## splitby_max_substrings_includes_remaining_string {#splitby_max_substrings_includes_remaining_string}

Type: Bool

Default value: 0

引数 `max_substrings` が 0 より大きい時に、関数 [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) の結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。

可能な値：

- `0` - 残りの文字列は結果配列の最後の要素には含まれません。
- `1` - 残りの文字列は結果配列の最後の要素に含まれます。これは、Spark の [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) 関数および Python の ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) メソッドの動作です。

## stop_refreshable_materialized_views_on_startup {#stop_refreshable_materialized_views_on_startup}
<ExperimentalBadge/>

Type: Bool

Default value: 0

サーバー起動時に、リフレッシュ可能なマテリアライズドビューのスケジュールを防止します。これは、SYSTEM STOP VIEWS を使用しているかのようです。その後、`SYSTEM START VIEWS` または `SYSTEM START VIEW <name>` で手動で開始できます。新しく作成されたビューにも適用されます。リフレッシュ不可能なマテリアライズドビューには影響しません。

## storage_file_read_method {#storage_file_read_method}

Type: LocalFSReadMethod

Default value: pread

ストレージファイルからデータを読み取る方法、`read`、`pread`、`mmap` のいずれかです。mmap メソッドは clickhouse-server には適用されません (clickhouse-local 用です)。

## storage_system_stack_trace_pipe_read_timeout_ms {#storage_system_stack_trace_pipe_read_timeout_ms}

Type: ミリ秒

Default value: 100

`system.stack_trace` テーブルからスレッドの情報を受信する際に、パイプから読む最大時間。この設定はテスト目的で使用され、ユーザーが変更することは意図されていません。

## stream_flush_interval_ms {#stream_flush_interval_ms}

Type: ミリ秒

Default value: 7500

タイムアウトが発生した場合や、スレッドが [max_insert_block_size](#max_insert_block_size) 行を生成した場合のストリーミングを行うテーブルで機能します。

デフォルト値は 7500 です。

値が小さいほど、データがテーブルにフラッシュされる頻度が高くなります。値を低く設定しすぎると、パフォーマンスが低下します。

## stream_like_engine_allow_direct_select {#stream_like_engine_allow_direct_select}

Type: Bool

Default value: 0

Kafka、RabbitMQ、FileLog、Redis Streams、および NATS エンジンに対する直接の SELECT クエリを許可します。マテリアライズドビューが接続されている場合は、この設定が有効でも SELECT クエリは許可されません。

## stream_like_engine_insert_queue {#stream_like_engine_insert_queue}

Type: String

Default value:

ストリームのようなエンジンが複数のキューから読み込む際に、ユーザーは書き込みのために挿入する1つのキューを選択する必要があります。Redis Streams および NATS で使用されます。

## stream_poll_timeout_ms {#stream_poll_timeout_ms}

Type: ミリ秒

Default value: 500

ストリーミングストレージからのデータのポーリングのタイムアウト。

## system_events_show_zero_values {#system_events_show_zero_values}

Type: Bool

Default value: 0

[`system.events`](../../operations/system-tables/events.md) からゼロ値のイベントを選択できるようにします。

一部の監視システムでは、メトリックの値がゼロであっても、各チェックポイントにすべてのメトリック値を渡す必要があります。

可能な値：

- 0 — 無効。
- 1 — 有効。

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

## table_function_remote_max_addresses {#table_function_remote_max_addresses}

Type: UInt64

Default value: 1000

[remote](../../sql-reference/table-functions/remote.md) 関数に対して生成されるパターンからの最大アドレス数を設定します。

可能な値：

- 正の整数。

## tcp_keep_alive_timeout {#tcp_keep_alive_timeout}

Type: 秒

Default value: 290

TCP が keepalive プローブを送信する前に、接続がアイドルである必要がある時間（秒）。

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds {#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds}

Type: UInt64

Default value: 600000

ファイルシステムキャッシュ内の一時データのためにスペース確保のためにキャッシュをロック待機する時間。

## temporary_files_codec {#temporary_files_codec}

Type: String

Default value: LZ4

ディスク上のソートおよび結合操作で使用される一時ファイルの圧縮コーデックを設定します。

可能な値：

- LZ4 — [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)) 圧縮が適用されます。
- NONE — 圧縮は適用されません。

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert {#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert}

Type: Bool

Default value: 1

設定 `deduplicate_blocks_in_dependent_materialized_views` が `async_insert` と共に有効になっている場合、INSERT クエリで例外をスローします。これにより正確性が保証され、これらの機能は一緒には機能できません。

## throw_if_no_data_to_insert {#throw_if_no_data_to_insert}

Type: Bool

Default value: 1

空の INSERT を許可または禁止します。デフォルトでは有効（空の挿入でエラーがスローされます）。これは、[`clickhouse-client`](/docs/interfaces/cli) または [gRPC インターフェース](/docs/interfaces/grpc) を使用した INSERT のみが適用されます。

## throw_on_error_from_cache_on_write_operations {#throw_on_error_from_cache_on_write_operations}

Type: Bool

Default value: 0

書き込み操作（INSERT、マージ）におけるキャッシュからのエラーを無視します。

## throw_on_max_partitions_per_insert_block {#throw_on_max_partitions_per_insert_block}

Type: Bool

Default value: 1

max_partitions_per_insert_block と共に使用されます。true の場合（デフォルト）、max_partitions_per_insert_block に達した際に例外がスローされます。false の場合、リミットに達した挿入クエリの詳細とパーティションの数がログに記録されます。これは、max_partitions_per_insert_block の変更がユーザーに与える影響を理解するのに役立ちます。

## throw_on_unsupported_query_inside_transaction {#throw_on_unsupported_query_inside_transaction}
<ExperimentalBadge/>

Type: Bool

Default value: 1

トランザクション内で不正なクエリが使用されている場合、例外をスローします。

## timeout_before_checking_execution_speed {#timeout_before_checking_execution_speed}

Type: 秒

Default value: 10

指定された時間が経過した後、スピードがあまりにも遅くないことを確認します。

## timeout_overflow_mode {#timeout_overflow_mode}

Type: OverflowMode

Default value: throw

制限を超えた場合の処理方法。

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf}

Type: OverflowMode

Default value: throw

リーフ制限を超えた場合の処理方法。

## totals_auto_threshold {#totals_auto_threshold}

Type: Float

Default value: 0.5

`totals_mode = 'auto'` のしきい値です。
「WITH TOTALS 修飾子」セクションを参照してください。

## totals_mode {#totals_mode}

Type: TotalsMode

Default value: after_having_exclusive

HAVING が存在する場合、および max_rows_to_group_by および group_by_overflow_mode = ‘any’ が存在する場合に TOTALS を計算する方法です。
「WITH TOTALS 修飾子」セクションを参照してください。

## trace_profile_events {#trace_profile_events}

Type: Bool

Default value: 0

プロファイルイベントの各更新時に、プロファイルイベントの名前と増分の値ともにスタックトレースを収集することを有効または無効にします。これらの情報は [trace_log](../../operations/system-tables/trace_log.md/#system_tables-trace_log) に送信されます。

可能な値：

- 1 — プロファイルイベントのトレースが有効。
- 0 — プロファイルイベントのトレースが無効。

## transfer_overflow_mode {#transfer_overflow_mode}

Type: OverflowMode

Default value: throw

制限を超えた場合の処理方法。

## transform_null_in {#transform_null_in}

Type: Bool

Default value: 0

[IN](../../sql-reference/operators/in.md) 演算子のために [NULL](../../sql-reference/syntax.md/#null-literal) 値の等価性を有効にします。

デフォルトでは `NULL` 値は比較できません。なぜなら `NULL` は未定義の値を意味するためです。そのため、比較 `expr = NULL` は常に `false` を返す必要があります。この設定を有効にすると、`NULL = NULL` は IN 演算子に対して `true` を返します。

可能な値：

- 0 — IN 演算子における `NULL` 値の比較が `false` を返します。
- 1 — IN 演算子における `NULL` 値の比較が `true` を返します。

**例**

`null_in` テーブルを考えます：

``` text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
│    3 │     3 │
└──────┴───────┘
```

クエリ：

``` sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 0;
```

結果：

``` text
┌──idx─┬────i─┐
│    1 │    1 │
└──────┴──────┘
```

クエリ：

``` sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 1;
```

結果：

``` text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
└──────┴───────┘
```

**参照**

- [IN 演算子における NULL 処理](../../sql-reference/operators/in.md/#in-null-processing)

## traverse_shadow_remote_data_paths {#traverse_shadow_remote_data_paths}

Type: Bool

Default value: 0

クエリ `system.remote_data_paths` 時に、実際のテーブルデータに加えて、冷凍データ（シャドウディレクトリ）をトラバースします。

## union_default_mode {#union_default_mode}

Type: SetOperationMode

Default value:

`SELECT` クエリ結果を組み合わせるためのモードを設定します。この設定は、`UNION` を明示的に `UNION ALL` または `UNION DISTINCT` と指定せずに使用する場合のみ使用されます。

可能な値：

- `'DISTINCT'` — ClickHouse は重複行を削除してクエリを組み合わせた結果を出力します。
- `'ALL'` — ClickHouse は重複行を含むすべての行を出力します。
- `''` — ClickHouse は `UNION` とともに使用された場合に例外を生成します。

[UNION](../../sql-reference/statements/select/union.md) の例を参照してください。

## unknown_packet_in_send_data {#unknown_packet_in_send_data}

Type: UInt64

Default value: 0

N番目のデータパケットの代わりに不明なパケットを送信します。

## use_async_executor_for_materialized_views {#use_async_executor_for_materialized_views}

Type: Bool

Default value: 0

マテリアライズドビュークエリの非同期およびおそらくマルチスレッド実行を使用し、INSERT 時にビュー処理を加速することができますが、メモリを多く消費する可能性があります。

## use_cache_for_count_from_files {#use_cache_for_count_from_files}

Type: Bool

Default value: 1

テーブル関数 `file`/`s3`/`url`/`hdfs`/`azureBlobStorage` からのカウント中に行数のキャッシュを有効にします。

デフォルトで有効です。

## use_client_time_zone {#use_client_time_zone}

Type: Bool

Default value: 0

DateTime 文字列値の解釈にクライアントのタイムゾーンを使用し、サーバーのタイムゾーンを採用する代わりに使用します。

## use_compact_format_in_distributed_parts_names {#use_compact_format_in_distributed_parts_names}

Type: Bool

Default value: 1

`Distributed` エンジンのテーブルの背景 (`distributed_foreground_insert`) INSERT に対するブロックの保存にコンパクトフォーマットを使用します。

可能な値：

- 0 — `user[:password]@host:port#default_database` ディレクトリフォーマットを使用。
- 1 — `[shard{shard_index}[_replica{replica_index}]]` ディレクトリフォーマットを使用。

:::note
- `use_compact_format_in_distributed_parts_names=0` の場合、クラスター定義の変更は背景 INSERT には適用されません。
- `use_compact_format_in_distributed_parts_names=1` の場合、クラスター定義におけるノードの順序を変更すると `shard_index`/`replica_index` も変更されるため、注意が必要です。
:::

## use_concurrency_control {#use_concurrency_control}

Type: Bool

Default value: 1

サーバーの同時実行制御を尊重します（`concurrent_threads_soft_limit_num` および `concurrent_threads_soft_limit_ratio_to_cores` グローバルサーバー設定を参照）。無効にすると、サーバーが過負荷であってもより多くのスレッドを使用することができるようになります（通常の使用には推奨されず、主にテスト用です）。

## use_hedged_requests {#use_hedged_requests}

Type: Bool

Default value: 1

リモートクエリのためのヘッジリクエストロジックを有効にします。これは、クエリのために異なるレプリカに多くの接続を確立することを可能にします。
新しい接続は、既存の接続（レプリカ）が `hedged_connection_timeout` 内に確立されていなかったり、`receive_data_timeout` 内にデータが受信されなかった場合に有効になります。クエリは、空でない進捗パケット（またはデータパケット、`allow_changing_replica_until_first_data_packet` を指定した場合）を送信する最初の接続を使用します。他の接続はキャンセルされます。`max_parallel_replicas > 1` のクエリがサポートされています。

デフォルトで有効です。

Cloud ではデフォルトで無効です。

## use_hive_partitioning {#use_hive_partitioning}

Type: Bool

Default value: 1

有効にすると、ClickHouse はファイルエンジン [File](../../engines/table-engines/special/file.md/#hive-style-partitioning)/[S3](../../engines/table-engines/integrations/s3.md/#hive-style-partitioning)/[URL](../../engines/table-engines/special/url.md/#hive-style-partitioning)/[HDFS](../../engines/table-engines/integrations/hdfs.md/#hive-style-partitioning)/[AzureBlobStorage](../../engines/table-engines/integrations/azureBlobStorage.md/#hive-style-partitioning) でのパス内の Hive スタイルのパーティショニングを検出し、クエリ内でパーティション列を仮想列として使用できるようにします。これらの仮想列は、パーティション化されたパスと同じ名前を持ちますが、先頭に `_` が付きます。

## use_iceberg_partition_pruning {#use_iceberg_partition_pruning}

Type: Bool

Default value: 0

Iceberg テーブルのための Iceberg パーティションプルーニングを使用します。

## use_index_for_in_with_subqueries {#use_index_for_in_with_subqueries}

Type: Bool

Default value: 1

IN 演算子の右側にサブクエリまたはテーブル式がある場合に、インデックスを使用しようとします。

## use_index_for_in_with_subqueries_max_values {#use_index_for_in_with_subqueries_max_values}

Type: UInt64

Default value: 0

フィルタリングに使用する IN 演算子の右側にあるセットの最大サイズ。これは大きなクエリのために追加データ構造を準備することによるパフォーマンス劣化やメモリ使用量の増加を回避することができます。ゼロは制限なしを意味します。

## use_json_alias_for_old_object_type {#use_json_alias_for_old_object_type}

Type: Bool

Default value: 0

有効にすると、`JSON` データ型エイリアスが新しい [JSON](../../sql-reference/data-types/newjson.md) 型の代わりに古い [Object('json')](../../sql-reference/data-types/json.md) 型を作成するために使用されます。

## use_local_cache_for_remote_storage {#use_local_cache_for_remote_storage}

Type: Bool

Default value: 1

HDFS や S3 のようなリモートストレージのためにローカルキャッシュを使用します。この設定はリモートテーブルエンジンのみに使用されます。

## use_page_cache_for_disks_without_file_cache {#use_page_cache_for_disks_without_file_cache}

Type: Bool

Default value: 0

ファイルシステムキャッシュが有効でないリモートディスクに対してユーザースペースページキャッシュを使用します。

## use_query_cache {#use_query_cache}

Type: Bool

Default value: 0

有効にすると、`SELECT` クエリが [クエリキャッシュ](../query-cache.md) を利用できる場合があります。[enable_reads_from_query_cache](#enable_reads_from_query_cache) および [enable_writes_to_query_cache](#enable_writes_to_query_cache) パラメータにより、キャッシュの使用方法をより詳細に制御できます。

可能な値：

- 0 - 無効
- 1 - 有効

## use_skip_indexes {#use_skip_indexes}

Type: Bool

Default value: 1

クエリ実行中にデータスキッピングインデックスを使用します。

可能な値：

- 0 — 無効。
- 1 — 有効。

## use_skip_indexes_if_final {#use_skip_indexes_if_final}

Type: Bool

Default value: 0

FINAL 修飾子付きのクエリを実行する際にスキップインデックスが使用されるかどうかを制御します。

デフォルトでは、この設定は無効です。なぜならスキップインデックスは最新データを含む行（グラニュール）を除外する可能性があり、これは不正確な結果につながる可能性があります。有効にすると、FINAL 修飾子を使用してもスキップインデックスが適用され、パフォーマンスが向上する可能性がありますが、最近の更新を見逃すリスクもあります。

可能な値：

- 0 — 無効。
- 1 — 有効。

## use_structure_from_insertion_table_in_table_functions {#use_structure_from_insertion_table_in_table_functions}

Type: UInt64

Default value: 2

データからスキーマを推論する代わりに、挿入テーブルの構造を使用します。可能な値：0 - 無効、1 - 有効、2 - 自動。

## use_uncompressed_cache {#use_uncompressed_cache}

Type: Bool

Default value: 0

非圧縮ブロックのキャッシュを使用するかどうか。0 または 1 が受け入れられます。デフォルトでは 0（無効）です。
非圧縮キャッシュの使用（MergeTree 系のテーブル専用）は、多数の短いクエリを処理する際に遅延を大幅に減少させ、スループットを向上させます。頻繁に短いリクエストを送信するユーザーにはこの設定を有効にしてください。また、[uncompressed_cache_size](../../operations/server-configuration-parameters/settings.md/#server-settings-uncompressed_cache_size) 設定パラメータを設定ファイルのみに設定してください — 非圧縮キャッシュブロックのサイズ。デフォルトは 8 GiB です。非圧縮キャッシュは必要に応じて充填され、最も使用されていないデータは自動的に削除されます。

ある程度の大量のデータ（100 万行以上）を読み取るクエリに対しては、スペースを節約するために非圧縮キャッシュは自動的に無効になります。これにより、`use_uncompressed_cache` 設定を常に 1 に設定しておくことができます。

## use_variant_as_common_type {#use_variant_as_common_type}

Type: Bool

Default value: 0

引数型に共通型がない場合に、[if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiif)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) 関数の結果型として `Variant` 型を使用できるようにします。

例：

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

Type: Bool

Default value: 1

ORDER BY 句の WITH FILL の前にあるカラムがソートプレフィックスを形成します。ソートプレフィックスに異なる値がある行は独立して埋められます。

## validate_enum_literals_in_operators {#validate_enum_literals_in_operators}

Type: Bool

Default value: 0

有効にすると、`IN`、`NOT IN`、`==`、`!=` のような演算子における列挙型リテラルを enum 型に対して検証し、有効でないリテラルがある場合には例外をスローします。

## validate_mutation_query {#validate_mutation_query}

Type: Bool

Default value: 1

ミューテーションクエリを受け入れる前に検証します。ミューテーションはバックグラウンドで実行され、不正なクエリを実行するとミューテーションがスタックする原因となり、手動での介入が必要となります。

後方互換性のないバグが発生した場合以外はこの設定を変更しないでください。

## validate_polygons {#validate_polygons}

Type: Bool

Default value: 1

多角形が自己交差または自己接触する場合に、[pointInPolygon](../../sql-reference/functions/geo/index.md/#pointinpolygon) 関数で例外をスローするかどうかを有効または無効にします。

可能な値：

- 0 — 例外のスローが無効です。 `pointInPolygon` は無効な多角形を受け入れ、それに対しておそらく不正確な結果を返します。
- 1 — 例外のスローが有効です。

## wait_changes_become_visible_after_commit_mode {#wait_changes_become_visible_after_commit_mode}
<ExperimentalBadge/>

Type: TransactionsWaitCSNMode

Default value: wait_unknown

コミットされた変更が最新のスナップショットで実際に表示されるまで待機します。

## wait_for_async_insert {#wait_for_async_insert}

Type: Bool

Default value: 1

真の場合、非同期挿入の処理を待機します。

## wait_for_async_insert_timeout {#wait_for_async_insert_timeout}

Type: 秒

Default value: 120

非同期挿入の処理を待機するためのタイムアウト。

## wait_for_window_view_fire_signal_timeout {#wait_for_window_view_fire_signal_timeout}
<ExperimentalBadge/>

Type: 秒

Default value: 10

イベント時間処理におけるウィンドウビューの発火信号を待機するためのタイムアウト。

## window_view_clean_interval {#window_view_clean_interval}
<ExperimentalBadge/>

Type: 秒

Default value: 60

古くなったデータを解放するためのウィンドウビューのクリーニング間隔（秒）。

## window_view_heartbeat_interval {#window_view_heartbeat_interval}
<ExperimentalBadge/>

Type: 秒

Default value: 15

クエリが生きていることを示すためのハートビート間隔（秒）。

## workload {#workload}

Type: String

Default value: default

リソースにアクセスするために使用されるワークロードの名前。

## write_through_distributed_cache {#write_through_distributed_cache}

Type: Bool

Default value: 0

ClickHouse Cloud のみ。分散キャッシュへの書き込みを許可します（書き込みは S3 にも分散キャッシュによって行われます）。

## zstd_window_log_max {#zstd_window_log_max}

Type: Int64

Default value: 0

ZSTD の最大ウィンドウログを選択できます（MergeTree 系のテーブルには使用されません）。
