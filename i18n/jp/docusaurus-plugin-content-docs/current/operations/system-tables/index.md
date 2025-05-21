---
description: 'システムテーブルとは何か、それがなぜ有用であるかの概略。'
keywords: ['system tables', 'overview']
pagination_next: operations/system-tables/asynchronous_metric_log
sidebar_label: '概略'
sidebar_position: 52
slug: /operations/system-tables/
title: 'システムテーブル'
---

<!-- このページの目次テーブルは、自動的に生成されます 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールドから: slug, description, title.

エラーを見つけた場合は、ページ自体のYAMLフロントマターを編集してください。
-->

| ページ | 説明 |
|-----|-----|
| [system.backup_log](/operations/system-tables/backup_log) | `BACKUP`および`RESTORE`操作に関する情報を含むログエントリを持つシステムテーブル。 |
| [system.current_roles](/operations/system-tables/current-roles) | 現在のユーザーのアクティブなロールを含むシステムテーブル。 |
| [system.distribution_queue](/operations/system-tables/distribution_queue) | シャードに送信されるキュー内のローカルファイルに関する情報を含むシステムテーブル。 |
| [system.dictionaries](/operations/system-tables/dictionaries) | 辞書に関する情報を含むシステムテーブル。 |
| [system.tables](/operations/system-tables/tables) | サーバーが知っている各テーブルのメタデータを含むシステムテーブル。 |
| [system.resources](/operations/system-tables/resources) | ローカルサーバーに存在するリソースに関する情報を含むシステムテーブル（各リソースごとに1行）。 |
| [system.processors_profile_log](/operations/system-tables/processors_profile_log) | プロセッサーレベルのプロファイリング情報を含むシステムテーブル（`EXPLAIN PIPELINE`で見つかる）。 |
| [system.parts](/operations/system-tables/parts) | MergeTree のパーツに関する情報を含むシステムテーブル。 |
| [system.enabled_roles](/operations/system-tables/enabled-roles) | 現在のユーザーの現在のロールや、現在のロールに付与されたロールを含むすべてのアクティブなロールを含むシステムテーブル。 |
| [system.query_views_log](/operations/system-tables/query_views_log) | クエリ実行時に実行された依存ビューに関する情報を含むシステムテーブル。例えば、ビューのタイプや実行時間など。 |
| [system.blob_storage_log](/operations/system-tables/blob_storage_log) | アップロードや削除など、さまざまな blob ストレージ操作に関する情報を含むログエントリを持つシステムテーブル。 |
| [system.storage_policies](/operations/system-tables/storage_policies) | サーバー構成で定義されたストレージポリシーおよびボリュームに関する情報を含むシステムテーブル。 |
| [system.data_skipping_indices](/operations/system-tables/data_skipping_indices) | すべてのテーブルで存在するデータスキッピングインデックスに関する情報を含むシステムテーブル。 |
| [system.settings](/operations/system-tables/settings) | 現在のユーザーのセッション設定に関する情報を含むシステムテーブル。 |
| [System Tables Overview](/operations/system-tables/overview) | システムテーブルとは何か、それがなぜ有用であるかの概略。 |
| [system.table_engine](/operations/system-tables/table_engines) | サーバーがサポートするテーブルエンジンの説明と、それらがサポートする機能を含むシステムテーブル。 |
| [system.processes](/operations/system-tables/processes) | `SHOW PROCESSLIST` クエリを実装するために使用されるシステムテーブル。 |
| [system.columns](/operations/system-tables/columns) | すべてのテーブルのカラムに関する情報を含むシステムテーブル。 |
| [system.quota_usage](/operations/system-tables/quota_usage) | 現在のユーザーによるクォータ使用に関する情報を含むシステムテーブル。使用されたクォータの量や残りの量など。 |
| [system.disks](/operations/system-tables/disks) | サーバー構成で定義されたディスクに関する情報を含むシステムテーブル。 |
| [system.graphite_retentions](/operations/system-tables/graphite_retentions) | `GraphiteMergeTree`タイプのエンジンを持つテーブルで使用される`graphite_rollup`のパラメータに関する情報を含むシステムテーブル。 |
| [system.quotas_usage](/operations/system-tables/quotas_usage) | すべてのユーザーによるクォータ使用に関する情報を含むシステムテーブル。 |
| [system.role_grants](/operations/system-tables/role-grants) | ユーザーとロールのためのロール付与に関する情報を含むシステムテーブル。 |
| [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 非同期挿入に関する情報を含むシステムテーブル。各エントリは非同期挿入クエリにバッファリングされた挿入クエリを表します。 |
| [system.opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 実行されたクエリのトレーススパンに関する情報を含むシステムテーブル。 |
| [system.s3_queue_settings](/operations/system-tables/s3_queue_settings) | S3Queue テーブルの設定に関する情報を含むシステムテーブル。サーバーのバージョン`24.10`から利用可能。 |
| [system.query_condition_cache](/operations/system-tables/query_condition_cache) | クエリ条件キャッシュの内容を示すシステムテーブル。 |
| [system.symbols](/operations/system-tables/symbols) | C++の専門家やClickHouseエンジニアに役立つ、`clickhouse`バイナリのイントロスペクションに関する情報を含むシステムテーブル。 |
| [system.distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | クラスター上で実行された分散DDLクエリ（ON CLUSTER句を使用したクエリ）に関する情報を含むシステムテーブル。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | データベースオブジェクトのメタデータにおけるほぼ標準化されたDBMS非依存のビューを提供するシステムデータベース。 |
| [system.asynchronous_loader](/operations/system-tables/asynchronous_loader) | 最近の非同期ジョブの情報と状態を含むシステムテーブル（例: 読み込み中のテーブルのため）。テーブルは各ジョブごとに1行を含む。 |
| [system.database_engines](/operations/system-tables/database_engines) | サーバーがサポートするデータベースエンジンのリストを含むシステムテーブル。 |
| [system.quotas](/operations/system-tables/quotas) | クォータに関する情報を含むシステムテーブル。 |
| [system.detached_parts](/operations/system-tables/detached_parts) | MergeTree テーブルの切り離されたパーツに関する情報を含むシステムテーブル。 |
| [system.zookeeper_log](/operations/system-tables/zookeeper_log) | ZooKeeperサーバーへのリクエストのパラメータとその応答に関する情報を含むシステムテーブル。 |
| [system.jemalloc_bins](/operations/system-tables/jemalloc_bins) | 異なるサイズクラス（ビン）で jemalloc アロケーターを介して行われたメモリアロケーションに関する情報を含むシステムテーブル。すべてのアリーナから集計されます。 |
| [system.dns_cache](/operations/system-tables/dns_cache) | キャッシュされたDNSレコードに関する情報を含むシステムテーブル。 |
| [system.query_thread_log](/operations/system-tables/query_thread_log) | クエリを実行するスレッドに関する情報を含むシステムテーブル。例えば、スレッドの名前、スレッドの開始時間、クエリ処理の所要時間など。 |
| [system.latency_log](/operations/system-tables/latency_log) | 定期的にディスクにフラッシュされたすべてのレイテンシバケットの履歴を含みます。 |
| [system.merges](/operations/system-tables/merges) | MergeTree ファミリーのテーブルで現在進行中のマージおよび部分変異に関する情報を含むシステムテーブル。 |
| [system.query_metric_log](/operations/system-tables/query_metric_log) | 特定のクエリに対する`system.events`からのメモリとメトリック値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされます。 |
| [system.azure_queue_settings](/operations/system-tables/azure_queue_settings) | AzureQueue テーブルの設定に関する情報を含むシステムテーブル。サーバーのバージョン`24.10`から利用可能。 |
| [system.iceberg_history](/operations/system-tables/iceberg_history) | システムアイスバーグスナップショット履歴。 |
| [system.session_log](/operations/system-tables/session_log) | すべての成功したおよび失敗したログインおよびログアウトイベントに関する情報を含むシステムテーブル。 |
| [system.scheduler](/operations/system-tables/scheduler) | ローカルサーバーにあるスケジューリングノードの情報と状態を含むシステムテーブル。 |
| [system.errors](/operations/system-tables/errors) | 発生した回数とともにエラーコードを含むシステムテーブル。 |
| [system.licenses](/operations/system-tables/licenses) | ClickHouseソースのcontribディレクトリにあるサードパーティライブラリのライセンスを含むシステムテーブル。 |
| [system.user_processes](/operations/system-tables/user_processes) | ユーザーのメモリ使用量とProfileEventsの概要に役立つ情報を含むシステムテーブル。 |
| [system.replicated_fetches](/operations/system-tables/replicated_fetches) | 現在実行中のバックグラウンドフェッチに関する情報を含むシステムテーブル。 |
| [system.data_type_families](/operations/system-tables/data_type_families) | サポートされているデータタイプに関する情報を含むシステムテーブル。 |
| [system.projections](/operations/system-tables/projections) | すべてのテーブルの既存プロジェクションに関する情報を含むシステムテーブル。 |
| [system.histogram_metrics](/en/operations/system-tables/histogram_metrics) | このテーブルには、瞬時に計算でき、Prometheus形式でエクスポートできるヒストグラムメトリックが含まれています。常に最新です。 |
| [system.trace_log](/operations/system-tables/trace_log) | サンプリングクエリプロファイラーによって収集されたスタックトレースを含むシステムテーブル。 |
| [system.warnings](/operations/system-tables/system_warnings) | このテーブルには、ClickHouseサーバーに関する警告メッセージが含まれています。 |
| [system.roles](/operations/system-tables/roles) | 構成されたロールに関する情報を含むシステムテーブル。 |
| [system.users](/operations/system-tables/users) | サーバーに構成されているユーザーアカウントのリストを含むシステムテーブル。 |
| [system.part_log](/operations/system-tables/part_log) | MergeTreeファミリーのテーブルで、データパーツに関して発生したイベントに関する情報を含むシステムテーブル。データの追加やマージなど。 |
| [system.replicas](/operations/system-tables/replicas) | ローカルサーバーに存在するレプリケーションテーブルの情報と状態を含むシステムテーブル。監視に役立ちます。 |
| [system.view_refreshes](/operations/system-tables/view_refreshes) | リフレッシュ可能なマテリアライズドビューに関する情報を含むシステムテーブル。 |
| [system.dropped_tables](/operations/system-tables/dropped_tables) | DROP TABLEが実行されたが、データクリーンアップがまだ行われていないテーブルに関する情報を含むシステムテーブル。 |
| [system.contributors](/operations/system-tables/contributors) | 貢献者に関する情報を含むシステムテーブル。 |
| [system.dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | `system.dropped_tables`からドロップされたテーブルのMergeTreeパーツに関する情報を含むシステムテーブル。 |
| [system.query_log](/operations/system-tables/query_log) | 実行されたクエリに関する情報を含むシステムテーブル。例: 開始時間、処理の所要時間、エラーメッセージ。 |
| [system.text_log](/operations/system-tables/text_log) | ログエントリを含むシステムテーブル。 |
| [system.functions](/operations/system-tables/functions) | 通常および集約関数に関する情報を含むシステムテーブル。 |
| [system.asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | 一定の時間間隔（デフォルトは1秒）ごとに保存される`system.asynchronous_metrics`の履歴値を含むシステムテーブル。 |
| [system.moves](/operations/system-tables/moves) | MergeTreeテーブルの進行中のデータパート移動に関する情報を含むシステムテーブル。各データパートの移動は1行で表されます。 |
| [system.latency_buckets](/operations/system-tables/latency_buckets) | `latency_log`で使用されるバケットの境界に関する情報を含むシステムテーブル。 |
| [system.databases](/operations/system-tables/databases) | 現在のユーザーが利用可能なデータベースに関する情報を含むシステムテーブル。 |
| [system.quota_limits](/operations/system-tables/quota_limits) | すべてのクォータのすべてのインターバルの最大値に関する情報を含むシステムテーブル。任意の行数またはゼロが1つのクォータに対応します。 |
| [system.metrics](/operations/system-tables/metrics) | 瞬時に計算できるメトリック、または現在の値を持つメトリックを含むシステムテーブル。 |
| [system.query_cache](/operations/system-tables/query_cache) | クエリキャッシュの内容を示すシステムテーブル。 |
| [system.one](/operations/system-tables/one) | 単一の`dummy` UInt8カラムを持ち、値0が含まれる1行のシステムテーブル。他のDBMSで見られる`DUAL`テーブルに類似しています。 |
| [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | キュー内にある保留中の非同期挿入に関する情報を含むシステムテーブル。 |
| [system.time_zones](/operations/system-tables/time_zones) | ClickHouseサーバーがサポートするタイムゾーンのリストを含むシステムテーブル。 |
| [system.schema_inference_cache](/operations/system-tables/schema_inference_cache) | すべてのキャッシュされたファイルスキーマに関する情報を含むシステムテーブル。 |
| [system.numbers_mt](/operations/system-tables/numbers_mt) | `system.numbers`に類似していますが、読み取りが並行化され、数値は任意の順序で返されることができます。 |
| [system.metric_log](/operations/system-tables/metric_log) | `system.metrics`および`system.events`からのメトリック値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされます。 |
| [system.settings_profile_elements](/operations/system-tables/settings_profile_elements) | 設定プロファイルのコンテンツを説明するシステムテーブル: 制約、設定が適用されるロールとユーザー、親設定プロファイル。 |
| [system.server_settings](/operations/system-tables/server_settings) | `config.xml`で指定されたサーバーのグローバル設定に関する情報を含むシステムテーブル。 |
| [system.detached_tables](/operations/system-tables/detached_tables) | 各切り離されたテーブルに関する情報を含むシステムテーブル。 |
| [system.row_policies](/operations/system-tables/row_policies) | 特定のテーブルのフィルターと、これを使用すべきロールおよび/またはユーザーのリストを含むシステムテーブル。 |
| [system.grants](/operations/system-tables/grants) | ClickHouseユーザーアカウントに付与された権限を示すシステムテーブル。 |
| [system.error_log](/operations/system-tables/system-error-log) | `system.errors`テーブルからのエラー値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされます。 |
| [system.merge_tree_settings](/operations/system-tables/merge_tree_settings) | MergeTree テーブル用の設定に関する情報を含むシステムテーブル。 |
| [system.numbers](/operations/system-tables/numbers) | ほぼすべての自然数を0から含む`number`という名前の単一のUInt64カラムを持つシステムテーブル。 |
| [system.crash_log](/operations/system-tables/crash-log) | 致命的なエラーのスタックトレースに関する情報を含むシステムテーブル。 |
| [system.workloads](/operations/system-tables/workloads) | ローカルサーバーに存在するワークロードに関する情報を含むシステムテーブル。 |
| [system.stack_trace](/operations/system-tables/stack_trace) | すべてのサーバースレッドのスタックトレースを含むシステムテーブル。開発者がサーバーの状態をイントロスペクトすることを可能にします。 |
| [system.clusters](/operations/system-tables/clusters) | 構成ファイルで利用可能なクラスターと、それに定義されているサーバーに関する情報を含むシステムテーブル。 |
| [system.events](/operations/system-tables/events) | システムで発生したイベントの数に関する情報を含むシステムテーブル。 |
| [system.mutations](/operations/system-tables/mutations) | MergeTree テーブルの変異とその進捗に関する情報を含むシステムテーブル。各変異コマンドは1行で表されます。 |
| [system.settings_changes](/operations/system-tables/settings_changes) | 前のClickHouseバージョンでの設定変更に関する情報を含むシステムテーブル。 |
| [system.parts_columns](/operations/system-tables/parts_columns) | MergeTree テーブルのパーツとカラムに関する情報を含むシステムテーブル。 |
| [system.zookeeper_connection](/operations/system-tables/zookeeper_connection) | ZooKeeperが設定されている場合のみ存在するシステムテーブル。ZooKeeperへの現在の接続（補助ZooKeeperを含む）を示します。 |
| [system.dashboards](/operations/system-tables/dashboards) | HTTPインターフェースを介してアクセス可能な`/dashboard`ページで使用されるクエリが含まれます。監視とトラブルシューティングに役立ちます。 |
| [system.build_options](/operations/system-tables/build_options) | ClickHouseサーバーのビルドオプションに関する情報を含むシステムテーブル。 |
| [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | 定期的にバックグラウンドで計算されるメトリックを含むシステムテーブル。例えば、使用中のRAMの量。 |
| [system.kafka_consumers](/operations/system-tables/kafka_consumers) | Kafkaコンシューマに関する情報を含むシステムテーブル。 |
| [system.settings_profiles](/operations/system-tables/settings_profiles) | 構成された設定プロファイルのプロパティを含むシステムテーブル。 |
| [system.zookeeper](/operations/system-tables/zookeeper) | ClickHouse Keeper または ZooKeeper が設定されている場合のみ存在するシステムテーブル。構成で定義された Keeper クラスターからのデータを公開します。 |
| [system.replication_queue](/operations/system-tables/replication_queue) | `ReplicatedMergeTree`ファミリーのテーブルのために、ClickHouse Keeper または ZooKeeper に保存されたレプリケーションキューからのタスクに関する情報を含むシステムテーブル。 |
