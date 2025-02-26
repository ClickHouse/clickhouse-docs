---
description: "システムテーブルとは何か、そしてそれがなぜ役立つのかの概要。"
slug: /operations/system-tables/
sidebar_position: 52
sidebar_label: 概要
pagination_next: 'operations/system-tables/asynchronous_metric_log'
title: "システムテーブル"
keywords: ["システムテーブル", "概要"]
---

<!-- このページの目次テーブルは自動的に生成されます。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドから: slug, description, title。

エラーを見つけた場合は、ページ自体のYMLフロントマターを編集してください。 
-->

| ページ | 説明 |
|-----|-----|
| [backup_log](/operations/system-tables/backup_log) | `BACKUP`および`RESTORE`操作に関する情報を含むログエントリが記録されたシステムテーブル。 |
| [current_roles](/operations/system-tables/current-roles) | 現在のユーザーのアクティブな役割を含むシステムテーブル。 |
| [distribution_queue](/operations/system-tables/distribution_queue) | シャードに送信されるキュー内のローカルファイルに関する情報を含むシステムテーブル。 |
| [dictionaries](/operations/system-tables/dictionaries) | 辞書に関する情報を含むシステムテーブル。 |
| [tables](/operations/system-tables/tables) | サーバーが認識している各テーブルのメタデータを含むシステムテーブル。 |
| [resources](/operations/system-tables/resources) | ローカルサーバー上に存在するリソースに関する情報を含むシステムテーブル（リソースごとに1行）。 |
| [processors_profile_log](/operations/system-tables/processors_profile_log) | プロセッサーレベルのプロファイリング情報を含むシステムテーブル（`EXPLAIN PIPELINE`で確認可能）。 |
| [parts](/operations/system-tables/parts) |  |
| [enabled_roles](/operations/system-tables/enabled-roles) | 現在のユーザーの現在の役割およびその役割に対して付与された役割を含むすべてのアクティブな役割を含むシステムテーブル。 |
| [query_views_log](/operations/system-tables/query_views_log) | クエリを実行する際に実行される依存ビューに関する情報を含むシステムテーブル（例：ビューティペや実行時間）。 |
| [blob_storage_log](/operations/system-tables/blob_storage_log) | アップロードや削除など、さまざまなBlobストレージ操作に関する情報を含むログエントリが記録されたシステムテーブル。 |
| [storage_policies](/operations/system-tables/storage_policies) | サーバー設定で定義されたストレージポリシーやボリュームに関する情報を含むシステムテーブル。 |
| [data_skipping_indices](/operations/system-tables/data_skipping_indices) | すべてのテーブルに存在するデータスキッピングインデックスに関する情報を含むシステムテーブル。 |
| [settings](/operations/system-tables/settings) | 現在のユーザーのセッション設定に関する情報を含むシステムテーブル。 |
| [System Tables Overview](/operations/system-tables/overview) | システムテーブルとは何か、そしてそれがなぜ役立つのかの概要。 |
| [table_engines](/operations/system-tables/table_engines) | サーバーがサポートするテーブルエンジンの説明とそのサポートされる機能を含むシステムテーブル。 |
| [processes](/operations/system-tables/processes) | `SHOW PROCESSLIST`クエリの実装に使用されるシステムテーブル。 |
| [columns](/operations/system-tables/columns) | すべてのテーブルのカラムに関する情報を含むシステムテーブル。 |
| [quota_usage](/operations/system-tables/quota_usage) | 現在のユーザーのクォータ使用状況に関する情報を含むシステムテーブル（使用中のクォータと残りのクォータ）。 |
| [disks](/operations/system-tables/disks) | サーバー設定で定義されたディスクに関する情報を含むシステムテーブル。 |
| [graphite_retentions](/operations/system-tables/graphite_retentions) | `GraphiteMergeTree`タイプのエンジンを持つテーブルで使用される`graphite_rollup`パラメーターに関する情報を含むシステムテーブル。 |
| [quotas_usage](/operations/system-tables/quotas_usage) | すべてのユーザーによるクォータ使用状況に関する情報を含むシステムテーブル。 |
| [role_grants](/operations/system-tables/role-grants) | ユーザーや役割に対する役割の付与に関する情報を含むシステムテーブル。 |
| [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 非同期挿入に関する情報を含むシステムテーブル。各エントリは非同期挿入クエリにバッファされた挿入クエリを表します。 |
| [opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 実行されたクエリのトレーススパンに関する情報を含むシステムテーブル。 |
| [s3_queue_settings](/operations/system-tables/s3_queue_settings) | S3Queueテーブルの設定に関する情報を含むシステムテーブル。サーバーのバージョン`24.10`から利用可能。 |
| [symbols](/operations/system-tables/symbols) | C++専門家やClickHouseエンジニアに役立つ情報を含むシステムテーブルで、`clickhouse`バイナリのイントロスペクションに使用されます。 |
| [distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | クラスター上で実行された分散DDLクエリ（ON CLUSTER句を使用したクエリ）に関する情報を含むシステムテーブル。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | データベースオブジェクトのメタデータに対するほぼ標準化されたDBMS非依存のビューを提供するシステムデータベース。 |
| [asynchronous_loader](/operations/system-tables/asynchronous_loader) | 最近の非同期ジョブの情報とステータスを含むシステムテーブル（例：ロード中のテーブル）。テーブルには各ジョブごとに1行が含まれます。 |
| [database_engines](/operations/system-tables/database_engines) | サーバーがサポートするデータベースエンジンのリストを含むシステムテーブル。 |
| [quotas](/operations/system-tables/quotas) | クォータに関する情報を含むシステムテーブル。 |
| [detached_parts](/operations/system-tables/detached_parts) | MergeTreeテーブルのデタッチされたパーツに関する情報を含むシステムテーブル。 |
| [zookeeper_log](/operations/system-tables/zookeeper_log) | ZooKeeperサーバーへのリクエストのパラメーターおよびその応答に関する情報を含むシステムテーブル。 |
| [jemalloc_bins](/operations/system-tables/jemalloc_bins) | 異なるサイズクラス（ビン）で行われたjemallocアロケーターによるメモリ割り当てに関する情報を含むシステムテーブル。 |
| [dns_cache](/operations/system-tables/dns_cache) | キャッシュされたDNSレコードに関する情報を含むシステムテーブル。 |
| [query_thread_log](/operations/system-tables/query_thread_log) | クエリを実行するスレッドに関する情報を含むシステムテーブル（例：スレッド名、スレッド開始時刻、クエリ処理の期間）。 |
| [](/operations/system-tables/latency_log) |  |
| [merges](/operations/system-tables/merges) | MergeTreeファミリーのテーブルに対して現在進行中のマージおよびパーツの変更に関する情報を含むシステムテーブル。 |
| [query_metric_log](/operations/system-tables/query_metric_log) | 各クエリについてのメモリおよびメトリック値の履歴を含むシステムテーブル（テーブル`system.events`から取得）で、周期的にディスクにフラッシュされます。 |
| [azure_queue_settings](/operations/system-tables/azure_queue_settings) | AzureQueueテーブルの設定に関する情報を含むシステムテーブル。サーバーのバージョン`24.10`から利用可能。 |
| [session_log](/operations/system-tables/session_log) | すべての成功したおよび失敗したログインおよびログアウトイベントに関する情報を含むシステムテーブル。 |
| [scheduler](/operations/system-tables/scheduler) | ローカルサーバー上に存在するスケジューリングノードに関する情報とステータスを含むシステムテーブル。 |
| [errors](/operations/system-tables/errors) | 発生したエラーコードとそのトリガー回数を含むシステムテーブル。 |
| [licenses](/operations/system-tables/licenses) | ClickHouseソースのcontribディレクトリにあるサードパーティライブラリのライセンスに関する情報を含むシステムテーブル。 |
| [user_processes](/operations/system-tables/user_processes) | ユーザーのメモリ使用状況とProfileEventsの概要に役立つ情報を含むシステムテーブル。 |
| [replicated_fetches](/operations/system-tables/replicated_fetches) | 現在実行中のバックグラウンドフェッチに関する情報を含むシステムテーブル。 |
| [data_type_families](/operations/system-tables/data_type_families) | サポートされているデータ型に関する情報を含むシステムテーブル。 |
| [processors_profile_log](/operations/system-tables/projections) | すべてのテーブルに存在するプロジェクションに関する情報を含むシステムテーブル。 |
| [trace_log](/operations/system-tables/trace_log) | サンプリングクエリプロファイラーによって収集されたスタックトレースに関する情報を含むシステムテーブル。 |
| [roles](/operations/system-tables/roles) | 構成された役割に関する情報を含むシステムテーブル。 |
| [users](/operations/system-tables/users) | サーバーで設定されたユーザーアカウントのリストを含むシステムテーブル。 |
| [part_log](/operations/system-tables/part_log) | MergeTreeファミリーのテーブルで発生したデータパーツに関するイベント（データの追加やマージなど）に関する情報を含むシステムテーブル。 |
| [replicas](/operations/system-tables/replicas) | ローカルサーバー上に存在するレプリケーションテーブルに関する情報とステータスを含むシステムテーブル。モニタリングに有用。 |
| [view_refreshes](/operations/system-tables/view_refreshes) | リフレッシュ可能なマテリアライズドビューに関する情報を含むシステムテーブル。 |
| [dropped_tables](/operations/system-tables/dropped_tables) | DROP TABLEが実行されたが、データクリーンアップがまだ実施されていないテーブルに関する情報を含むシステムテーブル。 |
| [contributors](/operations/system-tables/contributors) | 貢献者に関する情報を含むシステムテーブル。 |
| [dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | `system.dropped_tables`からドロップされたMergeTreeテーブルのパーツに関する情報を含むシステムテーブル。 |
| [query_log](/operations/system-tables/query_log) | 実行されたクエリに関する情報（例：開始時刻、処理の期間、エラーメッセージ）を含むシステムテーブル。 |
| [text_log](/operations/system-tables/text_log) | ログエントリを含むシステムテーブル。 |
| [functions](/operations/system-tables/functions) | 通常および集約関数に関する情報を含むシステムテーブル。 |
| [asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | `system.asynchronous_metrics`の履歴値を含むシステムテーブルで、時間間隔ごとに一度（一秒ごとにデフォルト）保存されます。 |
| [moves](/operations/system-tables/moves) | MergeTreeテーブルの進行中のデータパート移動に関する情報を含むシステムテーブル。各データパートの移動は1行として表されます。 |
| [latency_buckets](/operations/system-tables/latency_buckets) | `latency_log`で使用されるバケットの境界に関する情報を含むシステムテーブル。 |
| [databases](/operations/system-tables/databases) | 現在のユーザーが利用可能なデータベースに関する情報を含むシステムテーブル。 |
| [quota_limits](/operations/system-tables/quota_limits) | すべてのクォータのすべての間隔に対する最大値に関する情報を含むシステムテーブル。任意の行数やゼロが1つのクォータに対応できます。 |
| [metrics](/operations/system-tables/metrics) | 即座に計算できるメトリック、または現在の値を持つメトリックを含むシステムテーブル。 |
| [query_cache](/operations/system-tables/query_cache) | クエリキャッシュの内容を表示するシステムテーブル。 |
| [one](/operations/system-tables/one) | 値0を持つ単一の`dummy` UInt8カラムを持つ単一行を含むシステムテーブル。その他のDBMSで見られる`DUAL`テーブルに似ています。 |
| [asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | キュー内の保留中の非同期挿入に関する情報を含むシステムテーブル。 |
| [time_zones](/operations/system-tables/time_zones) | ClickHouseサーバーがサポートするタイムゾーンのリストを含むシステムテーブル。 |
| [schema_inference_cache](/operations/system-tables/schema_inference_cache) | すべてのキャッシュされたファイルスキーマに関する情報を含むシステムテーブル。 |
| [numbers_mt](/operations/system-tables/numbers_mt) | `system.numbers`に似たシステムテーブルですが、読み取りは並列化され、数値は任意の順序で返されることがあります。 |
| [metric_log](/operations/system-tables/metric_log) | テーブル`system.metrics`および`system.events`からのメトリック値の履歴を含むシステムテーブルで、周期的にディスクにフラッシュされます。 |
| [settings_profile_elements](/operations/system-tables/settings_profile_elements) | 設定プロファイルの内容を説明するシステムテーブル：制約、役割、およびこの設定に適用されるユーザー、親設定プロファイル。 |
| [server_settings](/operations/system-tables/server_settings) | `config.xml`で指定されたサーバーのグローバル設定に関する情報を含むシステムテーブル。 |
| [detached_tables](/operations/system-tables/detached_tables) | 各デタッチテーブルに関する情報を含むシステムテーブル。 |
| [row_policies](/operations/system-tables/row_policies) | 特定のテーブル用のフィルターおよびこの行ポリシーを使用すべき役割やユーザーのリストを含むシステムテーブル。 |
| [grants](/operations/system-tables/grants) | ClickHouseユーザーアカウントに付与された特権を示すシステムテーブル。 |
| [error_log](/operations/system-tables/error_log) | テーブル`system.errors`からのエラー値の履歴を含むシステムテーブルで、周期的にディスクにフラッシュされます。 |
| [merge_tree_settings](/operations/system-tables/merge_tree_settings) | MergeTreeテーブル用の設定に関する情報を含むシステムテーブル。 |
| [numbers](/operations/system-tables/numbers) | ほぼすべての自然数（0から始まる）を含む、`number`という単一のUInt64カラムを持つシステムテーブル。 |
| [crash_log](/operations/system-tables/crash-log) | 致命的なエラーのスタックトレースに関する情報を含むシステムテーブル。 |
| [workloads](/operations/system-tables/workloads) | ローカルサーバー上のワークロードに関する情報を含むシステムテーブル。 |
| [stack_trace](/operations/system-tables/stack_trace) | すべてのサーバースレッドのスタックトレースを含むシステムテーブル。開発者がサーバーの状態を確認することを可能にします。 |
| [clusters](/operations/system-tables/clusters) | 設定ファイルで利用可能なクラスターおよび定義されているサーバーに関する情報を含むシステムテーブル。 |
| [events](/operations/system-tables/events) | システム内で発生したイベントの数に関する情報を含むシステムテーブル。 |
| [mutations](/operations/system-tables/mutations) | MergeTreeテーブルの変異およびその進行状況に関する情報を含むシステムテーブル。各変異コマンドは単一の行として表されます。 |
| [settings_changes](/operations/system-tables/settings_changes) | 以前のClickHouseバージョンにおける設定変更に関する情報を含むシステムテーブル。 |
| [parts_columns](/operations/system-tables/parts_columns) | MergeTreeテーブルのパーツおよびカラムに関する情報を含むシステムテーブル。 |
| [zookeeper_connection](/operations/system-tables/zookeeper_connection) | ZooKeeperが設定されている場合のみ存在するシステムテーブル。ZooKeeperへの現在の接続を表示します（補助ZooKeeperを含む）。 |
| [dashboards](/operations/system-tables/dashboards) | HTTPインターフェースを介してアクセス可能な`/dashboard`ページで使用されるクエリを含む。モニタリングやトラブルシューティングに便利。 |
| [build_options](/operations/system-tables/build_options) | ClickHouseサーバーのビルドオプションに関する情報を含むシステムテーブル。 |
| [asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | 背景で周期的に計算されるメトリックを含むシステムテーブル。例えば、使用中のRAMの量。 |
| [kafka_consumers](/operations/system-tables/kafka_consumers) | Kafkaコンシューマーに関する情報を含むシステムテーブル。 |
| [settings_profiles](/operations/system-tables/settings_profiles) | 構成された設定プロファイルのプロパティを含むシステムテーブル。 |
| [zookeeper](/operations/system-tables/zookeeper) | ClickHouse KeeperまたはZooKeeperが設定されている場合のみ存在するシステムテーブル。設定ファイルに定義されたKeeperクラスターからのデータを公開します。 |
| [replication_queue](/operations/system-tables/replication_queue) | `ReplicatedMergeTree`ファミリーのテーブルのためにClickHouse KeeperまたはZooKeeperに保存されているレプリケーションキューからのタスクに関する情報を含むシステムテーブル。 |
