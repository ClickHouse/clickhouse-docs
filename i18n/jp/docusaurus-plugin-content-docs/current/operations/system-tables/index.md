---
description: 'システムテーブルの概要とその有用性について。'
slug: /operations/system-tables/
sidebar_position: 52
sidebar_label: '概要'
pagination_next: 'operations/system-tables/asynchronous_metric_log'
title: 'システムテーブル'
keywords: ['システムテーブル', '概要']
---

<!-- このページの目次テーブルは自動的に生成されます。
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
YAMLフロントマターのフィールド: slug, description, title から。

エラーを見つけた場合は、ページ自体のYAMLフロントマターを編集してください。
-->

| ページ | 説明 |
|-----|-----|
| [system.backup_log](/operations/system-tables/backup_log) | `BACKUP` と `RESTORE` 操作に関する情報を含むログエントリを持つシステムテーブル。 |
| [system.current_roles](/operations/system-tables/current-roles) | 現在のユーザーのアクティブなロールを含むシステムテーブル。 |
| [system.distribution_queue](/operations/system-tables/distribution_queue) | シャードに送信されるためのキューに存在するローカルファイルに関する情報を含むシステムテーブル。 |
| [system.dictionaries](/operations/system-tables/dictionaries) | 辞書に関する情報を含むシステムテーブル。 |
| [system.tables](/operations/system-tables/tables) | サーバーが知っている各テーブルのメタデータを含むシステムテーブル。 |
| [system.system.resources](/operations/system-tables/resources) | 各リソースの行を持つローカルサーバー上に存在するリソースに関する情報を含むシステムテーブル。 |
| [system.processors_profile_log](/operations/system-tables/processors_profile_log) | `EXPLAIN PIPELINE` で見つけることができるプロセッサーレベルのプロファイリング情報を含むシステムテーブル。 |
| [system.parts](/operations/system-tables/parts) |  |
| [system.enabled_roles](/operations/system-tables/enabled-roles) | 現在のユーザーの現在のロールとそのロールに付与されたロールを含むすべてのアクティブなロールを含むシステムテーブル。 |
| [system.query_views_log](/operations/system-tables/query_views_log) | クエリを実行する際に実行された依存ビューに関する情報を含むシステムテーブル（ビューの種類や実行時間など）。 |
| [system.blob_storage_log](/operations/system-tables/blob_storage_log) | アップロードや削除など、さまざまなブロブストレージ操作に関する情報を持つログエントリを含むシステムテーブル。 |
| [system.storage_policies](/operations/system-tables/storage_policies) | サーバー設定で定義されたストレージポリシーとボリュームに関する情報を含むシステムテーブル。 |
| [system.data_skipping_indices](/operations/system-tables/data_skipping_indices) | すべてのテーブルに存在するデータスキッピングインデックスに関する情報を含むシステムテーブル。 |
| [system.settings](/operations/system-tables/settings) | 現在のユーザーのセッション設定に関する情報を含むシステムテーブル。 |
| [System Tables Overview](/operations/system-tables/overview) | システムテーブルの概要とその有用性について。 |
| [system.table_engines](/operations/system-tables/table_engines) | サーバーがサポートするテーブルエンジンとそれらがサポートする機能の説明を含むシステムテーブル。 |
| [system.processes](/operations/system-tables/processes) | `SHOW PROCESSLIST` クエリを実装するために使用されるシステムテーブル。 |
| [system.columns](/operations/system-tables/columns) | すべてのテーブルのカラムに関する情報を含むシステムテーブル。 |
| [system.quota_usage](/operations/system-tables/quota_usage) | 現在のユーザーによるクオータ使用量に関する情報を含むシステムテーブル（使用中のクオータ量と残量など）。 |
| [system.disks](/operations/system-tables/disks) | サーバー設定で定義されたディスクに関する情報を含むシステムテーブル。 |
| [system.graphite_retentions](/operations/system-tables/graphite_retentions) | `GraphiteMergeTree` タイプのテーブルで使用される `graphite_rollup` に関する情報を含むシステムテーブル。 |
| [system.quotas_usage](/operations/system-tables/quotas_usage) | すべてのユーザーによるクオータ使用量に関する情報を含むシステムテーブル。 |
| [system.role_grants](/operations/system-tables/role-grants) | ユーザーとロールのためのロール付与に関する情報を含むシステムテーブル。 |
| [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 非同期挿入に関する情報を含むシステムテーブル。各エントリは非同期挿入クエリにバッファリングされた挿入クエリを表す。 |
| [system.opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 実行されたクエリのトレーススパンに関する情報を含むシステムテーブル。 |
| [system.s3_queue_settings](/operations/system-tables/s3_queue_settings) | S3Queueテーブルの設定に関する情報を含むシステムテーブル。サーバー版 `24.10` から利用可能。 |
| [system.symbols](/operations/system-tables/symbols) | C++専門家やClickHouseエンジニアに有用な、`clickhouse` バイナリのイントロスペクションのための情報を含むシステムテーブル。 |
| [system.distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | クラスタで実行された分散DDLクエリ（`ON CLUSTER` 句を使用するクエリ）に関する情報を含むシステムテーブル。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | データベースオブジェクトのメタデータに対するほぼ標準化されたDBMS非依存のビューを提供するシステムデータベース。 |
| [system.asynchronous_loader](/operations/system-tables/asynchronous_loader) | 最新の非同期ジョブに関する情報とステータスを含むシステムテーブル（例えば、読み込み中のテーブルのための）。テーブルには各ジョブの行が含まれる。 |
| [system.database_engines](/operations/system-tables/database_engines) | サーバーがサポートするデータベースエンジンのリストを含むシステムテーブル。 |
| [system.quotas](/operations/system-tables/quotas) | クオータに関する情報を含むシステムテーブル。 |
| [system.detached_parts](/operations/system-tables/detached_parts) | MergeTreeテーブルのデタッチされたパーツに関する情報を含むシステムテーブル。 |
| [system.zookeeper_log](/operations/system-tables/zookeeper_log) | ZooKeeperサーバーへのリクエストのパラメータとその応答に関する情報を含むシステムテーブル。 |
| [system.jemalloc_bins](/operations/system-tables/jemalloc_bins) | 異なるサイズクラス（ビン）でのjemallocアロケータによるメモリ割り当てに関する情報を含むシステムテーブル。すべてのアリーナから集計された。 |
| [system.dns_cache](/operations/system-tables/dns_cache) | キャッシュされたDNSレコードに関する情報を含むシステムテーブル。 |
| [system.query_thread_log](/operations/system-tables/query_thread_log) | クエリを実行するスレッドに関する情報を含むシステムテーブル（スレッド名、スレッド開始時間、クエリ処理の持続時間など）。 |
| [system.latency_log](/operations/system-tables/latency_log) | すべてのレイテンシーバケットの履歴を含み、定期的にディスクにフラッシュされる。 |
| [system.merges](/operations/system-tables/merges) | MergeTreeファミリーのテーブルで現在処理中のマージとパート変更に関する情報を含むシステムテーブル。 |
| [system.query_metric_log](/operations/system-tables/query_metric_log) | 各クエリのために、定期的にディスクにフラッシュされる`system.events`テーブルからのメモリとメトリック値の履歴を含むシステムテーブル。 |
| [system.azure_queue_settings](/operations/system-tables/azure_queue_settings) | AzureQueueテーブルの設定に関する情報を含むシステムテーブル。サーバー版 `24.10` から利用可能。 |
| [system.session_log](/operations/system-tables/session_log) | すべての成功したログインおよびログアウトイベントに関する情報を含むシステムテーブル。 |
| [system.scheduler](/operations/system-tables/scheduler) | ローカルサーバー上に存在するスケジューリングノードに関する情報とステータスを含むシステムテーブル。 |
| [system.errors](/operations/system-tables/errors) | 発生したエラーコードとそのトリガー回数を含むシステムテーブル。 |
| [system.licenses](/operations/system-tables/licenses) | ClickHouseソースのcontribディレクトリに位置するサードパーティライブラリのライセンスに関する情報を含むシステムテーブル。 |
| [system.user_processes](/operations/system-tables/user_processes) | ユーザーのメモリ使用状況とProfileEventsの概要に有用な情報を含むシステムテーブル。 |
| [system.replicated_fetches](/operations/system-tables/replicated_fetches) | 現在実行中のバックグラウンドフェッチに関する情報を含むシステムテーブル。 |
| [system.data_type_families](/operations/system-tables/data_type_families) | サポートされているデータ型に関する情報を含むシステムテーブル。 |
| [system.processors_profile_log](/operations/system-tables/projections) | すべてのテーブルに存在するプロジェクションに関する情報を含むシステムテーブル。 |
| [](/en/operations/system-tables/histogram_metrics) |  |
| [system.trace_log](/operations/system-tables/trace_log) | サンプリングクエリプロファイラーによって収集されたスタックトレースを含むシステムテーブル。 |
| [system.roles](/operations/system-tables/roles) | 構成されたロールに関する情報を含むシステムテーブル。 |
| [system.users](/operations/system-tables/users) | サーバーで構成されたユーザーアカウントのリストを含むシステムテーブル。 |
| [system.part_log](/operations/system-tables/part_log) | MergeTreeファミリーのテーブル内でデータパーツに関して発生したイベントに関する情報を含むシステムテーブル（データの追加やマージなど）。 |
| [system.replicas](/operations/system-tables/replicas) | ローカルサーバー上に存在するレプリケーテッドテーブルに関する情報とステータスを含むシステムテーブル。モニタリングに有用。 |
| [system.view_refreshes](/operations/system-tables/view_refreshes) | リフレッシュ可能なマテリアライズドビューに関する情報を含むシステムテーブル。 |
| [system.dropped_tables](/operations/system-tables/dropped_tables) | ドロップテーブルが実行されたが、データクリーンアップがまだ行われていないテーブルに関する情報を含むシステムテーブル。 |
| [system.contributors](/operations/system-tables/contributors) | 貢献者に関する情報を含むシステムテーブル。 |
| [system.dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | `system.dropped_tables`からのドロップテーブルのパーツに関する情報を含むシステムテーブル。 |
| [system.query_log](/operations/system-tables/query_log) | 実行されたクエリに関する情報を含むシステムテーブル（開始時間、処理の持続時間、エラーメッセージなど）。 |
| [system.text_log](/operations/system-tables/text_log) | ログエントリを含むシステムテーブル。 |
| [system.functions](/operations/system-tables/functions) | 通常の関数と集約関数に関する情報を含むシステムテーブル。 |
| [system.asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | 一定時間ごと（デフォルトでは1秒）に保存される`system.asynchronous_metrics`に対する過去の値を含むシステムテーブル。 |
| [system.moves](/operations/system-tables/moves) | MergeTreeテーブルのデータパートの移動に関する進行中の情報を含むシステムテーブル。各データパートの移動は単一の行で表される。 |
| [system.latency_buckets](/operations/system-tables/latency_buckets) | `latency_log`で使用されるバケットの境界に関する情報を含むシステムテーブル。 |
| [system.databases](/operations/system-tables/databases) | 現在のユーザーが利用可能なデータベースに関する情報を含むシステムテーブル。 |
| [system.quota_limits](/operations/system-tables/quota_limits) | すべてのクオータのすべてのインターバルの最大に関する情報を含むシステムテーブル。任意の数の行またはゼロが一つのクオータに対応することができます。 |
| [system.metrics](/operations/system-tables/metrics) | 瞬時に計算できるメトリックまたは現在の値があるメトリックを含むシステムテーブル。 |
| [system.query_cache](/operations/system-tables/query_cache) | クエリキャッシュの内容を示すシステムテーブル。 |
| [system.one](/operations/system-tables/one) | 単一の `dummy` UInt8 カラムを持つ単一の行を含むシステムテーブルで、値は0である。他のDBMSに見られる `DUAL` テーブルに似ています。 |
| [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | キュー内の保留中の非同期挿入に関する情報を含むシステムテーブル。 |
| [system.time_zones](/operations/system-tables/time_zones) | ClickHouseサーバーがサポートするタイムゾーンのリストを含むシステムテーブル。 |
| [system.schema_inference_cache](/operations/system-tables/schema_inference_cache) | すべてのキャッシュされたファイルスキーマに関する情報を含むシステムテーブル。 |
| [system.numbers_mt](/operations/system-tables/numbers_mt) | `system.numbers`に似たシステムテーブルですが、読み込みが並列化され、数字は任意の順序で返される可能性があります。 |
| [system.metric_log](/operations/system-tables/metric_log) | 定期的にディスクにフラッシュされる`system.metrics`および`system.events`テーブルからのメトリック値の履歴を含むシステムテーブル。 |
| [system.settings_profile_elements](/operations/system-tables/settings_profile_elements) | 設定プロファイルの内容: 制約、ロール、設定が適用されるユーザー、親設定プロファイルを記述したシステムテーブル。 |
| [system.server_settings](/operations/system-tables/server_settings) | `config.xml`に指定されたサーバーのグローバル設定に関する情報を含むシステムテーブル。 |
| [system.detached_tables](/operations/system-tables/detached_tables) | 各デタッチされたテーブルに関する情報を含むシステムテーブル。 |
| [system.row_policies](/operations/system-tables/row_policies) | 一つの特定のテーブルのためのフィルター、およびこの行ポリシーを使用すべきロールまたはユーザーのリストを含むシステムテーブル。 |
| [system.grants](/operations/system-tables/grants) | ClickHouseユーザーアカウントに与えられた権限を示すシステムテーブル。 |
| [system.error_log](/operations/system-tables/error_log) | 定期的にディスクにフラッシュされる `system.errors` テーブルからのエラー値の履歴を含むシステムテーブル。 |
| [system.merge_tree_settings](/operations/system-tables/merge_tree_settings) | MergeTreeテーブルの設定に関する情報を含むシステムテーブル。 |
| [system.numbers](/operations/system-tables/numbers) | 0から始まるほぼすべての自然数を含む `number` という名前の単一のUInt64カラムを持つシステムテーブル。 |
| [system.crash_log](/operations/system-tables/crash-log) | 致命的エラーのスタックトレースに関する情報を含むシステムテーブル。 |
| [system.workloads](/operations/system-tables/workloads) | ローカルサーバー上に存在するワークロードに関する情報を含むシステムテーブル。 |
| [system.stack_trace](/operations/system-tables/stack_trace) | すべてのサーバースレッドのスタックトレースを含むシステムテーブル。開発者はサーバーの状態をイントロスペクションできます。 |
| [system.clusters](/operations/system-tables/clusters) | 設定ファイルに存在するクラスターとそれに定義されたサーバーに関する情報を含むシステムテーブル。 |
| [system.events](/operations/system-tables/events) | システム内で発生したイベントの数に関する情報を含むシステムテーブル。 |
| [system.mutations](/operations/system-tables/mutations) | MergeTreeテーブルの変更とその進行状況に関する情報を含むシステムテーブル。各変更コマンドは単一の行で表される。 |
| [system.settings_changes](/operations/system-tables/settings_changes) | 前のClickHouseバージョンにおける設定変更に関する情報を含むシステムテーブル。 |
| [system.parts_columns](/operations/system-tables/parts_columns) | MergeTreeテーブルのパーツとカラムに関する情報を含むシステムテーブル。 |
| [system.zookeeper_connection](/operations/system-tables/zookeeper_connection) | ZooKeeperが構成されている場合のみ存在するシステムテーブル。ZooKeeperへの現在の接続を示します（補助的なZooKeeperも含む）。 |
| [system.dashboards](/operations/system-tables/dashboards) | HTTPインターフェースを介してアクセス可能な`/dashboard`ページで使用されるクエリを含む。モニタリングやトラブルシューティングに役立つ。 |
| [system.build_options](/operations/system-tables/build_options) | ClickHouseサーバーのビルドオプションに関する情報を含むシステムテーブル。 |
| [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | バックグラウンドで定期的に計算されるメトリックを含むシステムテーブル。例えば、使用中のRAMの量など。 |
| [system.kafka_consumers](/operations/system-tables/kafka_consumers) | Kafkaのコンシューマに関する情報を含むシステムテーブル。 |
| [system.settings_profiles](/operations/system-tables/settings_profiles) | 構成された設定プロファイルのプロパティを含むシステムテーブル。 |
| [system.zookeeper](/operations/system/tables/zookeeper) | ClickHouse KeeperまたはZooKeeperが構成されている場合のみ存在するシステムテーブル。設定内で定義されたKeeperクラスターからデータを公開します。 |
| [system.replication_queue](/operations/system-tables/replication_queue) | `ReplicatedMergeTree` ファミリーのテーブルのためにClickHouse KeeperまたはZooKeeperに保存されたレプリケーションキューからのタスクに関する情報を含むシステムテーブル。 |
