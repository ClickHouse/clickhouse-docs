---
description: "システムテーブルの概要とその有用性について。"
slug: /operations/system-tables/
sidebar_position: 52
sidebar_label: 概要
pagination_next: 'operations/system-tables/asynchronous_metric_log'
title: "システムテーブル"
keywords: ["システムテーブル", "概要"]
---

<!-- このページの目次は自動的に生成されています。 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAML フロントマターのフィールド: slug、description、title から生成されます。

エラーを見つけた場合は、ページ自体の YML フロントマターを編集してください。
-->

| ページ | 説明 |
|-----|-----|
| [system.backup_log](/docs/operations/system-tables/backup_log) | `BACKUP` および `RESTORE` 操作に関する情報を含むログエントリを含むシステムテーブル。 |
| [system.current_roles](/docs/operations/system-tables/current-roles) | 現在のユーザーのアクティブな役割を含むシステムテーブル。 |
| [system.distribution_queue](/docs/operations/system-tables/distribution_queue) | シャードに送信待ちのローカルファイルに関する情報を含むシステムテーブル。 |
| [system.dictionaries](/docs/operations/system-tables/dictionaries) | 辞書に関する情報を含むシステムテーブル。 |
| [system.tables](/docs/operations/system-tables/tables) | サーバーが知っている各テーブルのメタデータを含むシステムテーブル。 |
| [system.system.resources](/docs/operations/system-tables/resources) | ローカルサーバー上に存在するリソースに関する情報を含むシステムテーブル。各リソースに対して1行を持つ。 |
| [system.processors_profile_log](/docs/operations/system-tables/processors_profile_log) | プロセッサーレベルのプロファイリング情報を含むシステムテーブル（`EXPLAIN PIPELINE` で見つけることができる）。 |
| [system.parts](/docs/operations/system-tables/parts) |  |
| [system.enabled_roles](/docs/operations/system-tables/enabled-roles) | 現在のユーザーの現在の役割およびその役割に付与された役割を含むシステムテーブル。 |
| [system.query_views_log](/docs/operations/system-tables/query_views_log) | クエリを実行する際に実行された依存ビューに関する情報を含むシステムテーブル。例: ビューのタイプや実行時間。 |
| [system.blob_storage_log](/docs/operations/system-tables/blob_storage_log) | アップロードや削除など、さまざまなブロブストレージ操作に関する情報を含むログエントリを含むシステムテーブル。 |
| [system.storage_policies](/docs/operations/system-tables/storage_policies) | サーバー構成で定義されたストレージポリシーとボリュームに関する情報を含むシステムテーブル。 |
| [system.data_skipping_indices](/docs/operations/system-tables/data_skipping_indices) | すべてのテーブルに存在するデータスキッピングインデックスに関する情報を含むシステムテーブル。 |
| [system.settings](/docs/operations/system-tables/settings) | 現在のユーザーのセッション設定に関する情報を含むシステムテーブル。 |
| [System Tables Overview](/docs/operations/system-tables/overview) | システムテーブルの概要とその有用性について。 |
| [system.table_engines](/docs/operations/system-tables/table_engines) | サーバーがサポートするテーブルエンジンの説明と、サポートしている機能を含むシステムテーブル。 |
| [system.processes](/docs/operations/system-tables/processes) | `SHOW PROCESSLIST` クエリを実装するために使用されるシステムテーブル。 |
| [system.columns](/docs/operations/system-tables/columns) | すべてのテーブルのカラムに関する情報を含むシステムテーブル。 |
| [system.quota_usage](/docs/operations/system-tables/quota_usage) | 現在のユーザーによるクォータ使用に関する情報を含むシステムテーブル。どれだけ使用しているか、どれだけ残っているか。 |
| [system.disks](/docs/operations/system-tables/disks) | サーバー構成で定義されたディスクに関する情報を含むシステムテーブル。 |
| [system.graphite_retentions](/docs/operations/system-tables/graphite_retentions) | `GraphiteMergeTree` タイプのエンジンを持つテーブルで使用される `graphite_rollup` パラメーターに関する情報を含むシステムテーブル。 |
| [system.quotas_usage](/docs/operations/system-tables/quotas_usage) | すべてのユーザーによるクォータ使用に関する情報を含むシステムテーブル。 |
| [system.role_grants](/docs/operations/system-tables/role-grants) | ユーザーと役割のためのロールグラントを含むシステムテーブル。 |
| [system.asynchronous_insert_log](/docs/operations/system-tables/asynchronous_insert_log) | 非同期挿入に関する情報を含むシステムテーブル。各エントリは非同期挿入クエリにバッファされる挿入クエリを表す。 |
| [system.opentelemetry_span_log](/docs/operations/system-tables/opentelemetry_span_log) | 実行されたクエリのトレーススパンに関する情報を含むシステムテーブル。 |
| [system.s3_queue_settings](/docs/operations/system-tables/s3_queue_settings) | S3Queue テーブルの設定に関する情報を含むシステムテーブル。サーバーバージョン `24.10` から利用可能。 |
| [system.symbols](/docs/operations/system-tables/symbols) | C++ の専門家や ClickHouse エンジニアに役立つ、`clickhouse` バイナリのイントロスペクションに関する情報を含むシステムテーブル。 |
| [system.distributed_ddl_queue](/docs/operations/system-tables/disdistributed_ddl_queue) | クラスターで実行された分散ddlクエリ（ON CLUSTER 句を使用するクエリ）に関する情報を含むシステムテーブル。 |
| [INFORMATION_SCHEMA](/docs/operations/system-tables/information_schema) | データベースオブジェクトのメタデータに対するほぼ標準化された DBMS 非依存のビューを提供するシステムデータベース。 |
| [system.asynchronous_loader](/docs/operations/system-tables/asynchronous_loader) | 最近の非同期ジョブに関する情報とステータスを含むシステムテーブル（例: ロード中のテーブルのため）。テーブルには、各ジョブに対して1行が含まれる。 |
| [system.database_engines](/docs/operations/system-tables/database_engines) | サーバーがサポートするデータベースエンジンのリストを含むシステムテーブル。 |
| [system.quotas](/docs/operations/system-tables/quotas) | クォータに関する情報を含むシステムテーブル。 |
| [system.detached_parts](/docs/operations/system-tables/detached_parts) | MergeTree テーブルのデタッチされたパーツに関する情報を含むシステムテーブル。 |
| [system.zookeeper_log](/docs/operations/system-tables/zookeeper_log) | ZooKeeper サーバーへのリクエストのパラメータとそのレスポンスに関する情報を含むシステムテーブル。 |
| [system.jemalloc_bins](/docs/operations/system-tables/jemalloc_bins) | 異なるサイズクラス（ビン）の jemalloc アロケータを介して行われたメモリ割り当てに関する情報を含むシステムテーブル。すべてのアリーナから集約される。 |
| [system.dns_cache](/docs/operations/system-tables/dns_cache) | キャッシュされた DNS レコードに関する情報を含むシステムテーブル。 |
| [system.query_thread_log](/docs/operations/system-tables/query_thread_log) | クエリを実行するスレッドに関する情報を含むシステムテーブル。例: スレッド名、スレッド開始時間、クエリ処理の所要時間。 |
| [system.latency_log](/docs/operations/system-tables/latency_log) | すべてのレイテンシバケットの履歴を含み、定期的にディスクにフラッシュされる。 |
| [system.merges](/docs/operations/system-tables/merges) | MergeTree ファミリーのテーブルで現在進行中のマージとパーツの変更に関する情報を含むシステムテーブル。 |
| [system.query_metric_log](/docs/operations/system-tables/query_metric_log) | 個々のクエリのための `system.events` テーブルからのメモリおよびメトリック値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされる。 |
| [system.azure_queue_settings](/docs/operations/system-tables/azure_queue_settings) | AzureQueue テーブルの設定に関する情報を含むシステムテーブル。サーバーバージョン `24.10` から利用可能。 |
| [system.session_log](/docs/operations/system-tables/session_log) | 成功したログインおよびログアウトイベントに関する情報を含むシステムテーブル。 |
| [system.scheduler](/docs/operations/system-tables/scheduler) | ローカルサーバーに存在するスケジューリングノードに関する情報とステータスを含むシステムテーブル。 |
| [system.errors](/docs/operations/system-tables/errors) | 発生した回数に応じたエラーコードを含むシステムテーブル。 |
| [system.licenses](/docs/operations/system-tables/licenses) | ClickHouse ソースの contrib ディレクトリにあるサードパーティライブラリのライセンスを含むシステムテーブル。 |
| [system.user_processes](/docs/operations/system-tables/user_processes) | ユーザーのメモリ使用状況および ProfileEvents の概要に役立つ情報を含むシステムテーブル。 |
| [system.replicated_fetches](/docs/operations/system-tables/replicated_fetches) | 現在実行中のバックグラウンドフェッチに関する情報を含むシステムテーブル。 |
| [system.data_type_families](/docs/operations/system-tables/data_type_families) | サポートされているデータ型に関する情報を含むシステムテーブル。 |
| [system.processors_profile_log](/docs/operations/system-tables/projections) | すべてのテーブルに存在する投影に関する情報を含むシステムテーブル。 |
| [](/docs/en/operations/system-tables/histogram_metrics) |  |
| [system.trace_log](/docs/operations/system-tables/trace_log) | サンプリングクエリプロファイラによって収集されたスタックトレースを含むシステムテーブル。 |
| [system.roles](/docs/operations/system-tables/roles) | 設定された役割に関する情報を含むシステムテーブル。 |
| [system.users](/docs/operations/system-tables/users) | サーバーに構成されたユーザーアカウントのリストを含むシステムテーブル。 |
| [system.part_log](/docs/operations/system-tables/part_log) | MergeTree ファミリーのテーブルでデータパーツに発生したイベントに関する情報を含むシステムテーブル。データの追加やマージなど。 |
| [system.replicas](/docs/operations/system-tables/replicas) | ローカルサーバー上に存在するレプリケートテーブルに関する情報とステータスを含むシステムテーブル。監視に便利。 |
| [system.view_refreshes](/docs/operations/system-tables/view_refreshes) | リフレッシュ可能なマテリアライズドビューに関する情報を含むシステムテーブル。 |
| [system.dropped_tables](/docs/operations/system-tables/dropped_tables) | ドロップテーブルが実行されたが、データクリーンアップがまだ行われていないテーブルに関する情報を含むシステムテーブル。 |
| [system.contributors](/docs/operations/system-tables/contributors) | コントリビューターに関する情報を含むシステムテーブル。 |
| [system.dropped_tables_parts](/docs/operations/system-tables/dropped_tables_parts) | `system.dropped_tables` からドロップされた MergeTree テーブルのパーツに関する情報を含むシステムテーブル。 |
| [system.query_log](/docs/operations/system-tables/query_log) | 実行されたクエリに関する情報を含むシステムテーブル。例: 開始時間、処理の所要時間、エラーメッセージ。 |
| [system.text_log](/docs/operations/system-tables/text_log) | ログエントリを含むシステムテーブル。 |
| [system.functions](/docs/operations/system-tables/functions) | 通常の関数と集約関数に関する情報を含むシステムテーブル。 |
| [system.asynchronous_metric_log](/docs/operations/system-tables/asynchronous_metric_log) | `system.asynchronous_metrics` の履歴値を含むシステムテーブル。時間間隔（デフォルトは1秒）ごとに保存される。 |
| [system.moves](/docs/operations/system-tables/moves) | MergeTree テーブルの進行中のデータパートの移動に関する情報を含むシステムテーブル。各データパートの移動は1行で表される。 |
| [system.latency_buckets](/docs/operations/system-tables/latency_buckets) | `latency_log` で使用されるバケット境界に関する情報を含むシステムテーブル。 |
| [system.databases](/docs/operations/system-tables/databases) | 現在のユーザーが利用できるデータベースに関する情報を含むシステムテーブル。 |
| [system.quota_limits](/docs/operations/system-tables/quota_limits) | すべてのクォータのすべての間隔に対する最大値に関する情報を含むシステムテーブル。任意の数の行またはゼロが1つのクォータに対応可能。 |
| [system.metrics](/docs/operations/system-tables/metrics) | 即座に計算できるか、現在の値を持つメトリックに関する情報を含むシステムテーブル。 |
| [system.query_cache](/docs/operations/system-tables/query_cache) | クエリキャッシュの内容を表示するシステムテーブル。 |
| [system.one](/docs/operations/system-tables/one) | 値 0 を含む単一の `dummy` UInt8 カラムを持つ単一の行を含むシステムテーブル。他の DBMS に見られる `DUAL` テーブルに類似。 |
| [system.asynchronous_inserts](/docs/operations/system-tables/asynchronous_inserts) | キューに保留中の非同期挿入に関する情報を含むシステムテーブル。 |
| [system.time_zones](/docs/operations/system-tables/time_zones) | ClickHouse サーバーがサポートするタイムゾーンのリストを含むシステムテーブル。 |
| [system.schema_inference_cache](/docs/operations/system-tables/schema_inference_cache) | キャッシュされたすべてのファイルスキーマに関する情報を含むシステムテーブル。 |
| [system.numbers_mt](/docs/operations/system-tables/numbers_mt) | `system.numbers` に似ているが、読み取りが並列化され、数字が任意の順序で返される。 |
| [system.metric_log](/docs/operations/system-tables/metric_log) | `system.metrics` と `system.events` テーブルからのメトリック値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされる。 |
| [system.settings_profile_elements](/docs/operations/system-tables/settings_profile_elements) | 設定プロファイルの内容を説明するシステムテーブル: 制約、適用される役割とユーザー、親設定プロファイル。 |
| [system.server_settings](/docs/operations/system-tables/server_settings) | `config.xml` に指定されたサーバーのグローバル設定に関する情報を含むシステムテーブル。 |
| [system.detached_tables](/docs/operations/system-tables/detached_tables) | 各デタッチされたテーブルに関する情報を含むシステムテーブル。 |
| [system.row_policies](/docs/operations/system-tables/row_policies) | 特定のテーブル用のフィルタと、この行ポリシーを使用すべき役割および/またはユーザーのリストを含むシステムテーブル。 |
| [system.grants](/docs/operations/system-tables/grants) | ClickHouse ユーザーアカウントに付与されている特権を示すシステムテーブル。 |
| [system.error_log](/docs/operations/system-tables/error_log) | `system.errors` テーブルからのエラー値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされる。 |
| [system.merge_tree_settings](/docs/operations/system-tables/merge_tree_settings) | MergeTree テーブルに対する設定に関する情報を含むシステムテーブル。 |
| [system.numbers](/docs/operations/system-tables/numbers) | 0 から始まるほぼすべての自然数を含む `number` という名前の単一の UInt64 カラムを持つシステムテーブル。 |
| [system.crash_log](/docs/operations/system-tables/crash-log) | 致命的なエラーのスタックトレースに関する情報を含むシステムテーブル。 |
| [system.workloads](/docs/operations/system-tables/workloads) | ローカルサーバーに存在するワークロードに関する情報を含むシステムテーブル。 |
| [system.stack_trace](/docs/operations/system-tables/stack_trace) | すべてのサーバースレッドのスタックトレースを含むシステムテーブル。開発者がサーバーの状態を調査するのに便利。 |
| [system.clusters](/docs/operations/system-tables/clusters) | 設定ファイルで利用可能なクラスターと、その中で定義されたサーバーに関する情報を含むシステムテーブル。 |
| [system.events](/docs/operations/system-tables/events) | システムで発生したイベントの数に関する情報を含むシステムテーブル。 |
| [system.mutations](/docs/operations/system-tables/mutations) | MergeTree テーブルの変異とその進行状況に関する情報を含むシステムテーブル。各変異コマンドは単一の行で表される。 |
| [system.settings_changes](/docs/operations/system-tables/settings_changes) | 以前の ClickHouse バージョンでの設定変更に関する情報を含むシステムテーブル。 |
| [system.parts_columns](/docs/operations/system-tables/parts_columns) | MergeTree テーブルのパーツとカラムに関する情報を含むシステムテーブル。 |
| [system.zookeeper_connection](/docs/operations/system-tables/zookeeper_connection) | ZooKeeper が構成されている場合にのみ存在するシステムテーブル。ZooKeeper への現在の接続を示す（補助的な ZooKeeper を含む）。 |
| [system.dashboards](/docs/operations/system-tables/dashboards) | HTTP インターフェースを通じてアクセス可能な `/dashboard` ページで使用されるクエリを含む。監視とトラブルシューティングに便利。 |
| [system.build_options](/docs/operations/system-tables/build_options) | ClickHouse サーバーのビルドオプションに関する情報を含むシステムテーブル。 |
| [system.asynchronous_metrics](/docs/operations/system-tables/asynchronous_metrics) | バックグラウンドで定期的に計算されるメトリックに関する情報を含むシステムテーブル。例: 使用中の RAM の量。 |
| [system.kafka_consumers](/docs/operations/system-tables/kafka_consumers) | Kafka コンシューマに関する情報を含むシステムテーブル。 |
| [system.settings_profiles](/docs/operations/system-tables/settings_profiles) | 設定プロファイルのプロパティを含むシステムテーブル。 |
| [system.zookeeper](/docs/operations/system-tables/zookeeper) | ClickHouse Keeper または ZooKeeper が構成されている場合にのみ存在するシステムテーブル。設定で定義された Keeper クラスターからのデータを公開する。 |
| [system.replication_queue](/docs/operations/system-tables/replication_queue) | `ReplicatedMergeTree` ファミリーのテーブルに対して、ClickHouse Keeper または ZooKeeper に保存されたレプリケーションキューからのタスクに関する情報を含むシステムテーブル。 |
