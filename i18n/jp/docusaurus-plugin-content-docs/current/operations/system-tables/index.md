---
'description': 'システムテーブルとその有用性の概要。'
'keywords':
- 'system tables'
- 'overview'
'pagination_next': 'operations/system-tables/asynchronous_metric_log'
'sidebar_label': '概要'
'sidebar_position': 52
'slug': '/operations/system-tables/'
'title': 'システムテーブル'
---




<!-- このページの目次テーブルは、自動的に 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
から YAML フロントマターフィールド: slug, description, title を使用して生成されています。

エラーを発見した場合は、該当するページの YML フロントマターを編集してください。
-->

| ページ | 説明 |
|-----|-----|
| [system.backup_log](/operations/system-tables/backup_log) | `BACKUP` および `RESTORE` 操作に関する情報を含むロギングエントリを持つシステムテーブル。 |
| [system.current_roles](/operations/system-tables/current-roles) | 現在のユーザーのアクティブなロールを含むシステムテーブル。 |
| [system.distribution_queue](/operations/system-tables/distribution_queue) | シャードに送信予定のローカルファイルに関する情報を含むシステムテーブル。 |
| [system.dictionaries](/operations/system-tables/dictionaries) | 辞書に関する情報を含むシステムテーブル。 |
| [system.tables](/operations/system-tables/tables) | サーバーが知っている各テーブルのメタデータを含むシステムテーブル。 |
| [system.resources](/operations/system-tables/resources) | ローカルサーバーに存在するリソースに関する情報を含むシステムテーブル。各リソースに対して 1 行。 |
| [system.processors_profile_log](/operations/system-tables/processors_profile_log) | `EXPLAIN PIPELINE` で見つけられるプロセッサーレベルのプロファイリング情報を含むシステムテーブル。 |
| [system.parts](/operations/system-tables/parts) | MergeTree パーツに関する情報を含むシステムテーブル。 |
| [system.enabled_roles](/operations/system-tables/enabled-roles) | 現在のユーザーの現在のロールおよびそのロールに付与されたロールを含む、すべてのアクティブなロールを含むシステムテーブル。 |
| [system.query_views_log](/operations/system-tables/query_views_log) | クエリを実行する際に実行された依存ビューに関する情報を含むシステムテーブル。例えば、ビューの種類や実行時間。 |
| [system.blob_storage_log](/operations/system-tables/blob_storage_log) | アップロードや削除などのさまざまな_blob_ストレージ操作に関する情報を含むロギングエントリを持つシステムテーブル。 |
| [system.storage_policies](/operations/system-tables/storage_policies) | サーバー構成で定義されたストレージポリシーおよびボリュームに関する情報を含むシステムテーブル。 |
| [system.data_skipping_indices](/operations/system-tables/data_skipping_indices) | すべてのテーブルに存在するデータスキッピングインデックスに関する情報を含むシステムテーブル。 |
| [system.settings](/operations/system-tables/settings) | 現在のユーザーのセッション設定に関する情報を含むシステムテーブル。 |
| [System Tables Overview](/operations/system-tables/overview) | システムテーブルとは何か、そしてなぜそれが有用であるのかの概要。 |
| [system.table_engine](/operations/system-tables/table_engines) | サーバーがサポートしているテーブルエンジンの説明と、それらがサポートしている機能を含むシステムテーブル。 |
| [system.processes](/operations/system-tables/processes) | `SHOW PROCESSLIST` クエリの実装に使用されるシステムテーブル。 |
| [system.columns](/operations/system-tables/columns) | すべてのテーブルのカラムに関する情報を含むシステムテーブル。 |
| [system.quota_usage](/operations/system-tables/quota_usage) | 現在のユーザーによるクォータ使用に関する情報を含むシステムテーブル。例えば、使用されたクォータと残っているクォータ。 |
| [system.disks](/operations/system-tables/disks) | サーバー構成で定義されたディスクに関する情報を含むシステムテーブル。 |
| [system.graphite_retentions](/operations/system-tables/graphite_retentions) | `GraphiteMergeTree` 型エンジンを持つテーブルで使用される `graphite_rollup` のパラメータに関する情報を含むシステムテーブル。 |
| [system.quotas_usage](/operations/system-tables/quotas_usage) | すべてのユーザーによるクォータ使用に関する情報を含むシステムテーブル。 |
| [system.role_grants](/operations/system-tables/role-grants) | ユーザーおよびロールに対するロールの付与に関する情報を含むシステムテーブル。 |
| [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) | 非同期挿入に関する情報を含むシステムテーブル。各エントリは、非同期挿入クエリにバッファリングされた挿入クエリを表す。 |
| [system.opentelemetry_span_log](/operations/system-tables/opentelemetry_span_log) | 実行されたクエリのトレーススパンに関する情報を含むシステムテーブル。 |
| [system.s3_queue_settings](/operations/system-tables/s3_queue_settings) | S3Queue テーブルの設定に関する情報を含むシステムテーブル。サーバーバージョン `24.10` から利用可能。 |
| [system.query_condition_cache](/operations/system-tables/query_condition_cache) | クエリ条件キャッシュの内容を表示するシステムテーブル。 |
| [system.symbols](/operations/system-tables/symbols) | C++ 専門家および ClickHouse エンジニアに便利な、`clickhouse` バイナリのイントロスペクション用の情報を含むシステムテーブル。 |
| [system.distributed_ddl_queue](/operations/system-tables/distributed_ddl_queue) | クラスターで実行された分散 DDL クエリ（ON CLUSTER 句を使用したクエリ）に関する情報を含むシステムテーブル。 |
| [INFORMATION_SCHEMA](/operations/system-tables/information_schema) | データベースオブジェクトのメタデータに対するほぼ標準化された DBMS 非依存のビューを提供するシステムデータベース。 |
| [system.asynchronous_loader](/operations/system-tables/asynchronous_loader) | 最近の非同期ジョブに関する情報とその状態を含むシステムテーブル（例えば、読み込み中のテーブルの場合）。テーブルには、各ジョブに対して 1 行が含まれる。 |
| [system.database_engines](/operations/system-tables/database_engines) | サーバーがサポートしているデータベースエンジンのリストを含むシステムテーブル。 |
| [system.quotas](/operations/system-tables/quotas) | クォータに関する情報を含むシステムテーブル。 |
| [system.detached_parts](/operations/system-tables/detached_parts) | MergeTree テーブルの切り離されたパーツに関する情報を含むシステムテーブル。 |
| [system.zookeeper_log](/operations/system-tables/zookeeper_log) | ZooKeeper サーバーへのリクエストのパラメータとその応答に関する情報を含むシステムテーブル。 |
| [system.jemalloc_bins](/operations/system-tables/jemalloc_bins) | 異なるサイズクラス（ビン）で jemalloc アロケータを通じて実行されたメモリアロケーションに関する情報を、すべてのアリーナから集約したシステムテーブル。 |
| [system.dns_cache](/operations/system-tables/dns_cache) | キャッシュされた DNS レコードに関する情報を含むシステムテーブル。 |
| [system.query_thread_log](/operations/system-tables/query_thread_log) | クエリを実行するスレッドに関する情報を含むシステムテーブル。例えば、スレッド名、スレッド開始時間、クエリ処理の期間。 |
| [system.latency_log](/operations/system-tables/latency_log) | すべての遅延バケットの履歴を含み、定期的にディスクにフラッシュされる。 |
| [system.merges](/operations/system-tables/merges) | MergeTree ファミリーのテーブルで現在処理中のマージおよびパーツ変異に関する情報を含むシステムテーブル。 |
| [system.query_metric_log](/operations/system-tables/query_metric_log) | 個々のクエリのメモリおよびメトリック値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされる。 |
| [system.azure_queue_settings](/operations/system-tables/azure_queue_settings) | AzureQueue テーブルの設定に関する情報を含むシステムテーブル。サーバーバージョン `24.10` から利用可能。 |
| [system.iceberg_history](/operations/system-tables/iceberg_history) | システムアイスバーグスナップショット履歴。 |
| [system.session_log](/operations/system-tables/session_log) | すべての成功したおよび失敗したログインおよびログアウトイベントに関する情報を含むシステムテーブル。 |
| [system.scheduler](/operations/system-tables/scheduler) | ローカルサーバーに存在するスケジューリングノードに関する情報とその状態を含むシステムテーブル。 |
| [system.errors](/operations/system-tables/errors) | 発生した回数を持つエラーコードを含むシステムテーブル。 |
| [system.licenses](/operations/system-tables/licenses) | ClickHouse ソースの contrib ディレクトリにあるサードパーティライブラリのライセンスに関する情報を含むシステムテーブル。 |
| [system.user_processes](/operations/system-tables/user_processes) | ユーザーのメモリ使用状況と ProfileEvents の概要に役立つ情報を含むシステムテーブル。 |
| [system.replicated_fetches](/operations/system-tables/replicated_fetches) | 現在実行中のバックグラウンドフェッチに関する情報を含むシステムテーブル。 |
| [system.data_type_families](/operations/system-tables/data_type_families) | サポートされているデータ型に関する情報を含むシステムテーブル。 |
| [system.projections](/operations/system-tables/projections) | すべてのテーブルに存在するプロジェクションに関する情報を含むシステムテーブル。 |
| [system.histogram_metrics](/en/operations/system-tables/histogram_metrics) | このテーブルには即座に計算可能で Prometheus 形式でエクスポートできるヒストグラムメトリックが含まれる。常に最新の状態。 |
| [system.trace_log](/operations/system-tables/trace_log) | サンプリングクエリプロファイラーによって収集されたスタックトレースを含むシステムテーブル。 |
| [system.warnings](/operations/system-tables/system_warnings) | このテーブルには ClickHouse サーバーに関する警告メッセージが含まれている。 |
| [system.roles](/operations/system-tables/roles) | 構成されたロールに関する情報を含むシステムテーブル。 |
| [system.users](/operations/system-tables/users) | サーバーに構成されたユーザーアカウントのリストを含むシステムテーブル。 |
| [system.part_log](/operations/system-tables/part_log) | MergeTree ファミリーのテーブル内のデータパーツに関するイベント（データの追加またはマージなど）に関する情報を含むシステムテーブル。 |
| [system.replicas](/operations/system-tables/replicas) | ローカルサーバーに存在するレプリケーテッドテーブルに関する情報とその状態を含むシステムテーブル。モニタリングに便利。 |
| [system.view_refreshes](/operations/system-tables/view_refreshes) | リフレッシュ可能な Materialized View に関する情報を含むシステムテーブル。 |
| [system.dropped_tables](/operations/system-tables/dropped_tables) | ドロップテーブルが実行されたが、データクリーンアップがまだ行われていないテーブルに関する情報を含むシステムテーブル。 |
| [system.contributors](/operations/system-tables/contributors) | 貢献者に関する情報を含むシステムテーブル。 |
| [system.dropped_tables_parts](/operations/system-tables/dropped_tables_parts) | `system.dropped_tables` からのドロップされたテーブルのパーツに関する情報を含むシステムテーブル。 |
| [system.query_log](/operations/system-tables/query_log) | 実行されたクエリに関する情報を含むシステムテーブル。例えば、開始時間、処理期間、エラーメッセージ。 |
| [system.text_log](/operations/system-tables/text_log) | ロギングエントリを含むシステムテーブル。 |
| [system.functions](/operations/system-tables/functions) | 通常の関数および集約関数に関する情報を含むシステムテーブル。 |
| [system.asynchronous_metric_log](/operations/system-tables/asynchronous_metric_log) | 一定の時間間隔（デフォルトでは 1 秒）ごとに保存される `system.asynchronous_metrics` の履歴値を含むシステムテーブル。 |
| [system.moves](/operations/system-tables/moves) | MergeTree テーブルの進行中のデータパート移動に関する情報を含むシステムテーブル。各データパートの移動は 1 行で表される。 |
| [system.latency_buckets](/operations/system-tables/latency_buckets) | `latency_log` で使用されるバケットの境界に関する情報を含むシステムテーブル。 |
| [system.databases](/operations/system-tables/databases) | 現在のユーザーが利用可能なデータベースに関する情報を含むシステムテーブル。 |
| [system.quota_limits](/operations/system-tables/quota_limits) | すべてのクォータのすべての間隔に対する最大値に関する情報を含むシステムテーブル。任意の数の行またはゼロが 1 つのクォータに対応することができる。 |
| [system.metrics](/operations/system-tables/metrics) | 即座に計算可能なメトリックや、現在の値を持つメトリックを含むシステムテーブル。 |
| [system.query_cache](/operations/system-tables/query_cache) | クエリキャッシュの内容を表示するシステムテーブル。 |
| [system.one](/operations/system-tables/one) | 値 0 を持つ単一の `dummy` UInt8 カラムを含む単一行のシステムテーブル。他の DBMS に見られる `DUAL` テーブルに類似。 |
| [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) | キュー内の保留中の非同期挿入に関する情報を含むシステムテーブル。 |
| [system.time_zones](/operations/system-tables/time_zones) | ClickHouse サーバーがサポートするタイムゾーンのリストを含むシステムテーブル。 |
| [system.schema_inference_cache](/operations/system-tables/schema_inference_cache) | すべてのキャッシュされたファイルスキーマに関する情報を含むシステムテーブル。 |
| [system.numbers_mt](/operations/system-tables/numbers_mt) | `system.numbers` に類似するシステムテーブルだが、読み込みが並列化され、数値は任意の順序で返される可能性がある。 |
| [system.metric_log](/operations/system-tables/metric_log) | `system.metrics` および `system.events` からのメトリック値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされる。 |
| [system.settings_profile_elements](/operations/system-tables/settings_profile_elements) | 設定プロファイルの内容（制約、ロール、設定が適用されるユーザー、親設定プロファイル）を説明するシステムテーブル。 |
| [system.server_settings](/operations/system-tables/server_settings) | `config.xml` に指定されたサーバーのグローバル設定に関する情報を含むシステムテーブル。 |
| [system.detached_tables](/operations/system-tables/detached_tables) | 各切り離されたテーブルに関する情報を含むシステムテーブル。 |
| [system.row_policies](/operations/system-tables/row_policies) | 特定のテーブル用のフィルタと、この行ポリシーを使用すべきロールおよび/またはユーザーのリストを含むシステムテーブル。 |
| [system.grants](/operations/system-tables/grants) | ClickHouse ユーザーアカウントに付与された特権を示すシステムテーブル。 |
| [system.error_log](/operations/system-tables/system-error-log) | `system.errors` テーブルからのエラー値の履歴を含むシステムテーブル。定期的にディスクにフラッシュされる。 |
| [system.merge_tree_settings](/operations/system-tables/merge_tree_settings) | MergeTree テーブル用の設定に関する情報を含むシステムテーブル。 |
| [system.numbers](/operations/system-tables/numbers) | おおよそ 0 から始まるすべての自然数を含む単一の UInt64 カラム `number` を持つシステムテーブル。 |
| [system.crash_log](/operations/system-tables/crash-log) | 致命的エラーのスタックトレースに関する情報を含むシステムテーブル。 |
| [system.workloads](/operations/system-tables/workloads) | ローカルサーバーに存在するワークロードに関する情報を含むシステムテーブル。 |
| [system.stack_trace](/operations/system-tables/stack_trace) | すべてのサーバースレッドのスタックトレースを含むシステムテーブル。開発者によるサーバー状態のイントロスペクションを可能にする。 |
| [system.clusters](/operations/system-tables/clusters) | 構成ファイルに存在するクラスターおよびそれらに定義されたサーバーに関する情報を含むシステムテーブル。 |
| [system.events](/operations/system-tables/events) | システム内で発生したイベントの数に関する情報を含むシステムテーブル。 |
| [system.mutations](/operations/system-tables/mutations) | MergeTree テーブルの変異およびその進行状況に関する情報を含むシステムテーブル。各変異コマンドは 1 行で表される。 |
| [system.settings_changes](/operations/system-tables/settings_changes) | 前の ClickHouse バージョンでの設定変更に関する情報を含むシステムテーブル。 |
| [system.parts_columns](/operations/system-tables/parts_columns) | MergeTree テーブルのパーツおよびカラムに関する情報を含むシステムテーブル。 |
| [system.zookeeper_connection](/operations/system-tables/zookeeper_connection) | ZooKeeper が設定されている場合にのみ存在するシステムテーブル。現在の ZooKeeper への接続（補助的な ZooKeeper を含む）を表示する。 |
| [system.dashboards](/operations/system-tables/dashboards) | HTTP インターフェースを通じてアクセス可能な `/dashboard` ページで使用されるクエリを含む。モニタリングおよびトラブルシューティングに便利。 |
| [system.build_options](/operations/system-tables/build_options) | ClickHouse サーバーのビルドオプションに関する情報を含むシステムテーブル。 |
| [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) | 背景で定期的に計算されるメトリックを含むシステムテーブル。例えば、使用中の RAM の量。 |
| [system.kafka_consumers](/operations/system-tables/kafka_consumers) | Kafka コンシューマーに関する情報を含むシステムテーブル。 |
| [system.settings_profiles](/operations/system-tables/settings_profiles) | 構成された設定プロファイルのプロパティを含むシステムテーブル。 |
| [system.zookeeper](/operations/system-tables/zookeeper) | ClickHouse Keeper または ZooKeeper が設定されている場合にのみ存在するシステムテーブル。構成で定義された Keeper クラスターのデータを露出する。 |
| [system.replication_queue](/operations/system-tables/replication_queue) | `ReplicatedMergeTree` ファミリーのテーブルに対するクリックハウスキーパーまたは ZooKeeper に保存されたレプリケーションキューからのタスクに関する情報を含むシステムテーブル。 |
