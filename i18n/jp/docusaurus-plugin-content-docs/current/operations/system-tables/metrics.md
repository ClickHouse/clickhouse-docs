---
description: "瞬時に計算できる、または現在の値を持つメトリックを含むシステムテーブル。"
slug: /operations/system-tables/metrics
title: "system.metrics"
keywords: ["system table", "metrics"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

瞬時に計算できる、または現在の値を持つメトリックを含みます。例えば、同時に処理されているクエリの数や現在のレプリカ遅延などです。このテーブルは常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリックの値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリックの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` の別名。

サポートされている全てのメトリックはソースファイル [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) にあります。

**例**

``` sql
SELECT * FROM system.metrics LIMIT 10
```

``` text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ 実行中のクエリの数                                                      │
│ Merge                                │     0 │ 実行中のバックグラウンドマージの数                                    │
│ PartMutation                         │     0 │ ミューテーションの数 (ALTER DELETE/UPDATE)                             │
│ ReplicatedFetch                      │     0 │ レプリカから取得中のデータパーツの数                                  │
│ ReplicatedSend                       │     0 │ レプリカに送信中のデータパーツの数                                    │
│ ReplicatedChecks                     │     0 │ 整合性確認中のデータパーツの数                                        │
│ BackgroundMergesAndMutationsPoolTask │     0 │ 関連するバックグラウンドプール内のアクティブなマージとミューテーションの数 │
│ BackgroundFetchesPoolTask            │     0 │ 関連するバックグラウンドプール内のアクティブなフェッチの数          │
│ BackgroundCommonPoolTask             │     0 │ 関連するバックグラウンドプール内のアクティブなタスクの数            │
│ BackgroundMovePoolTask               │     0 │ movesのための BackgroundProcessingPool 内のアクティブなタスクの数      │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## メトリックの説明 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Aggregator スレッドプール内のスレッド数。

### AggregatorThreadsActive {#aggregatorthreadsactive}

タスクを実行している Aggregator スレッドプール内のスレッド数。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

非同期ローダーの前景スレッドプール内のスレッド数。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

タスクを実行している非同期ローダーの前景スレッドプール内のスレッド数。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

非同期ローダーのバックグラウンドスレッドプール内のスレッド数。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

タスクを実行している非同期ローダーのバックグラウンドスレッドプール内のスレッド数。

### AsyncInsertCacheSize {#asyncinsertcachesize}

キャッシュ内の非同期インサートハッシュIDの数。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

非同期インサートスレッドプール内のスレッド数。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

タスクを実行している非同期インサートスレッドプール内のスレッド数。

### AsynchronousReadWait {#asynchronousreadwait}

非同期読み取りを待っているスレッド数。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

BackgroundBufferFlushSchedulePool内のタスク数の制限。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

BackgroundBufferFlushSchedulePool内のアクティブなタスクの数。このプールは周期的なバッファフラッシュに使用されます。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

関連するバックグラウンドプール内のタスク数の制限。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

関連するバックグラウンドプール内のアクティブなタスクの数。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

BackgroundDistributedSchedulePool内のタスク数の制限。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

BackgroundDistributedSchedulePool内のアクティブなタスクの数。このプールはバックグラウンドで行われる分散送信に使用されます。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

関連するバックグラウンドプールにおける同時フェッチ数の制限。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

関連するバックグラウンドプール内のアクティブなフェッチの数。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

関連するバックグラウンドプールにおけるアクティブなマージとミューテーションの制限。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

関連するバックグラウンドプール内のアクティブなマージとミューテーションの数。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

メッセージストリーミングのための背景処理プール内のタスク数の制限。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

メッセージストリーミングのためのバックグラウンド処理プール内のアクティブなタスクの数。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

移動のためのバックグラウンド処理プール内のタスク数の制限。

### BackgroundMovePoolTask {#backgroundmovepooltask}

移動のためのバックグラウンド処理プール内のアクティブなタスクの数。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

ReplicatedMergeTree タスク（古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化など）のための BackgroundSchedulePool内のタスク数の制限。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

ReplicatedMergeTree タスク（古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化など）のための BackgroundSchedulePool内のアクティブなタスクの数。

### BackupsIOThreads {#backupsiothreads}

バックアップのための BackupsIO スレッドプール内のスレッド数。

### BackupsIOThreadsActive {#backupsiothreadsactive}

タスクを実行している BackupsIO スレッドプール内のスレッド数。

### BackupsThreads {#backupsthreads}

バックアップのためのスレッドプール内のスレッド数。

### BackupsThreadsActive {#backupsthreadsactive}

タスクを実行しているバックアップのためのスレッドプール内のスレッド数。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

破損としてマークされた分散テーブルに非同期挿入のためのファイルの数。このメトリックはスタート時に0から始まります。各シャードに対するファイルの数が合計されます。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

既存のデタッチされたキャッシュファイルセグメントの数。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary スレッドプール内のスレッド数。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

タスクを実行している CacheDictionary スレッドプール内のスレッド数。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries 内の更新キューにおける「バッチ」（キーのセット）の数。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries 内の更新キューにおけるキーの正確な数。

### CacheFileSegments {#cachefilesegments}

既存のキャッシュファイルセグメントの数。

### ContextLockWait {#contextlockwait}

Context 内でロックを待っているスレッドの数。これはグローバルロックです。

### DDLWorkerThreads {#ddlworkerthreads}

ON CLUSTER クエリのための DDLWorker スレッドプール内のスレッド数。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

タスクを実行している DDLWorker スレッドプール内のスレッド数。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog スレッドプール内のスレッド数。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

タスクを実行している DatabaseCatalog スレッドプール内のスレッド数。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk スレッドプール内のスレッド数。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

タスクを実行している DatabaseOnDisk スレッドプール内のスレッド数。

### DelayedInserts {#delayedinserts}

MergeTree テーブル内のパーティションに対してアクティブなデータパーツが多いために制限されている INSERT クエリの数。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

アグリゲート状態を破棄するためのスレッドプール内のスレッド数。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

タスクを実行しているアグリゲート状態を破棄するためのスレッドプール内のスレッド数。

### DictCacheRequests {#dictcacherequests}

キャッシュタイプの辞書データソースへの飛行中のリクエスト数。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage のための非同期スレッドプール内のスレッド数。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

タスクを実行している DiskObjectStorage のための非同期スレッドプール内のスレッド数。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

現在実行中のバックグラウンドマージのために予約されたディスクスペース。これは現在マージ中のパーツの総サイズよりも少し多くなっています。

### DistributedFilesToInsert {#distributedfilestoinsert}

分散テーブルへの非同期挿入のために処理待ちのファイルの数。各シャードに対するファイルの数が合計されます。

### DistributedSend {#distributedsend}

分散テーブルにINSERTされたデータを送信しているリモートサーバーへの接続の数。同期および非同期モードの両方が含まれます。

### EphemeralNode {#ephemeralnode}

ZooKeeper に保持されているエフェメラルノードの数。

### FilesystemCacheElements {#filesystemcacheelements}

ファイルシステムキャッシュ要素（ファイルセグメント）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

アクティブなキャッシュバッファの数。

### FilesystemCacheSize {#filesystemcachesize}

バイト単位のファイルシステムキャッシュのサイズ。

### GlobalThread {#globalthread}

グローバルスレッドプール内のスレッドの数。

### GlobalThreadActive {#globalthreadactive}

タスクを実行しているグローバルスレッドプール内のスレッドの数。

### HTTPConnection {#httpconnection}

HTTP サーバーへの接続数。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary スレッドプール内のスレッド数。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

タスクを実行している HashedDictionary スレッドプール内のスレッド数。

### IOPrefetchThreads {#ioprefetchthreads}

IO プリフェッチスレッドプール内のスレッド数。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

タスクを実行している IO プリフェッチスレッドプール内のスレッド数。

### IOThreads {#iothreads}

IO スレッドプール内のスレッド数。

### IOThreadsActive {#iothreadsactive}

タスクを実行している IO スレッドプール内のスレッド数。

### IOUringInFlightEvents {#iouringinflightevents}

飛行中の io_uring SQE の数。

### IOUringPendingEvents {#iouringpendingevents}

提出待ちの io_uring SQE の数。

### IOWriterThreads {#iowriterthreads}

IO ライタースレッドプール内のスレッド数。

### IOWriterThreadsActive {#iowriterthreadsactive}

タスクを実行している IO ライタースレッドプール内のスレッド数。

### InterserverConnection {#interserverconnection}

パーツを取得するために他のレプリカからの接続数。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

現在割り当てられている Kafka テーブルのパーティション数。

### KafkaBackgroundReads {#kafkabackgroundreads}

現在作業中のバックグラウンドリードの数（Kafka からのマテリアライズドビューのポピュレート）。

### KafkaConsumers {#kafkaconsumers}

アクティブな Kafka コンシューマの数。

### KafkaConsumersInUse {#kafkaconsumersinuse}

直接またはバックグラウンドリードによって現在使用されているコンシューマの数。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

いくつかのパーティションが割り当てられているアクティブな Kafka コンシューマの数。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

アクティブな librdkafka スレッドの数。

### KafkaProducers {#kafkaproducers}

作成されたアクティブな Kafka プロデューサの数。

### KafkaWrites {#kafkawrites}

現在実行中の Kafka への挿入の数。

### KeeperAliveConnections {#keeperaliveconnections}

生存中の接続数。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未解決のリクエストの数。

### LocalThread {#localthread}

ローカルスレッドプール内のスレッドの数。ローカルスレッドプール内のスレッドはグローバルスレッドプールから取得されます。

### LocalThreadActive {#localthreadactive}

タスクを実行しているローカルスレッドプール内のスレッドの数。

### MMappedAllocBytes {#mmappedallocbytes}

mmapped アロケーションのバイト数の合計。

### MMappedAllocs {#mmappedallocs}

mmapped アロケーションの総数。

### MMappedFileBytes {#mmappedfilebytes}

mmapped ファイル領域の合計サイズ。

### MMappedFiles {#mmappedfiles}

mmapped ファイルの総数。

### MarksLoaderThreads {#marksloaderthreads}

マークの読み込みのためのスレッドプール内のスレッド数。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

タスクを実行しているマークの読み込みのためのスレッドプール内のスレッド数。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker の最大処理DDLエントリのID。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

ZooKeeper にプッシュされた DDLWorker の最大 DDL エントリの ID。

### MemoryTracking {#memorytracking}

サーバーによって確保された総メモリ量（バイト）。

### Merge {#merge}

実行中のバックグラウンドマージの数。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

リモートサーバーからイニシエーターサーバーに送信されるデータパーツのセットに関する現在のアナウンスの数（MergeTree テーブル用）。リモートサーバー側で測定されます。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor スレッドプール内のスレッド数。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

タスクを実行している MergeTreeBackgroundExecutor スレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor スレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

タスクを実行している MergeTreeDataSelectExecutor スレッドプール内のスレッド数。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree パーツクリーナーのスレッドプール内のスレッド数。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

タスクを実行している MergeTree パーツクリーナーのスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree パーツローダーのスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

タスクを実行している MergeTree パーツローダーのスレッドプール内のスレッド数。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

リモートサーバーからイニシエーターサーバーに対して読み取りタスクを選択するために送信される現在のコールバックリクエストの数（MergeTree テーブル用）。リモートサーバー側で測定されます。

### Move {#move}

現在実行中の移動の数。

### MySQLConnection {#mysqlconnection}

MySQL プロトコルを使用しているクライアント接続の数。

### NetworkReceive {#networkreceive}

ネットワークからデータを受信するスレッドの数。ClickHouse に関連するネットワーク通信のみが含まれ、3rd パーティライブラリによるものは含まれません。

### NetworkSend {#networksend}

ネットワークにデータを送信するスレッドの数。ClickHouse に関連するネットワーク通信のみが含まれ、3rd パーティライブラリによるものは含まれません。

### OpenFileForRead {#openfileforread}

読み取りのために開かれたファイルの数。

### OpenFileForWrite {#openfileforwrite}

書き込みのために開かれたファイルの数。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads スレッドプール内のスレッドの数。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

タスクを実行している ParallelFormattingOutputFormatThreads スレッドプール内のスレッドの数。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat スレッドプール内のスレッドの数。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

タスクを実行している ParallelParsingInputFormat スレッドプール内のスレッドの数。

### PartMutation {#partmutation}

ミューテーションの数 (ALTER DELETE/UPDATE)。

### PartsActive {#partsactive}

現在および今後の SELECT に使用されるアクティブなデータパーツ。

### PartsCommitted {#partscommitted}

廃止予定です。PartsActive を参照してください。

### PartsCompact {#partscompact}

コンパクトパーツ。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

パーツが別のディスクに移動され、独自のデストラクタで削除されるべきです。

### PartsDeleting {#partsdeleting}

現在クリーンアップによって削除中の非アクティブデータパーツ。

### PartsOutdated {#partsoutdated}

非アクティブデータパーツですが、現在の SELECT のみで使用される可能性があり、SELECT の完了後に削除される可能性があります。

### PartsPreActive {#partspreactive}

パーツが data_parts にありますが、SELECT には使用されていません。

### PartsPreCommitted {#partsprecommitted}

廃止予定です。PartsPreActive を参照してください。

### PartsTemporary {#partstemporary}

パーツが現在生成中で、data_parts 一覧には含まれていません。

### PartsWide {#partswide}

広いパーツ。

### PendingAsyncInsert {#pendingasyncinsert}

フラッシュを待っている非同期挿入の数。

### PostgreSQLConnection {#postgresqlconnection}

PostgreSQL プロトコルを使用しているクライアント接続の数。

### Query {#query}

実行中のクエリの数。

### QueryPreempted {#querypreempted}

「優先度」設定のために停止して待機しているクエリの数。

### QueryThread {#querythread}

クエリ処理スレッドの数。

### RWLockActiveReaders {#rwlockactivereaders}

テーブルRWLockで読み取りロックを保持しているスレッド数。

### RWLockActiveWriters {#rwlockactivewriters}

テーブルRWLockで書き込みロックを保持しているスレッド数。

### RWLockWaitingReaders {#rwlockwaitingreaders}

テーブルRWLockで読み取りを待っているスレッド数。

### RWLockWaitingWriters {#rwlockwaitingwriters}

テーブルRWLockで書き込みを待っているスレッド数。

### Read {#read}

飛行中の読み取り（read、pread、io_getevents など）システムコールの数。

### ReadTaskRequestsSent {#readtaskrequestssent}

s3Cluster テーブル関数や同様のものから読み取りタスクを選択するために、リモートサーバーからイニシエーターサーバーに送信される現在のコールバックリクエストの数。リモートサーバー側で測定されます。

### ReadonlyReplica {#readonlyreplica}

ZooKeeper セッションの喪失後または ZooKeeper が設定されていない状態で起動したために現在読み取り専用状態にある Replicated テーブルの数。

### RemoteRead {#remoteread}

飛行中のリモートリーダーによる読み取りの数。

### ReplicatedChecks {#replicatedchecks}

整合性を確認中のデータパーツの数。

### ReplicatedFetch {#replicatedfetch}

レプリカから取得中のデータパーツの数。

### ReplicatedSend {#replicatedsend}

レプリカに送信中のデータパーツの数。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA スレッドプール内のスレッド数。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

タスクを実行している RESTART REPLICA スレッドプール内のスレッド数。

### RestoreThreads {#restorethreads}

RESTORE のためのスレッドプール内のスレッド数。

### RestoreThreadsActive {#restorethreadsactive}

タスクを実行している RESTORE のためのスレッドプール内のスレッド数。

### Revision {#revision}

サーバーのリビジョン。リリースやリリース候補ごとに増加する数字であり、パッチリリースを除きます。

### S3Requests {#s3requests}

S3 リクエスト。

### SendExternalTables {#sendexternaltables}

リモートサーバーに外部テーブルのデータを送信している接続の数。外部テーブルは GLOBAL IN および GLOBAL JOIN オペレーターを分散サブクエリで実装するために使用されます。

### SendScalars {#sendscalars}

リモートサーバーにスカラーのデータを送信している接続の数。

### StorageBufferBytes {#storagebufferbytes}

バッファテーブルのバッファ内のバイト数。

### StorageBufferRows {#storagebufferrows}

バッファテーブルのバッファ内の行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed スレッドプール内のスレッド数。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

タスクを実行している StorageDistributed スレッドプール内のスレッド数。

### StorageHiveThreads {#storagehivethreads}

StorageHive スレッドプール内のスレッド数。

### StorageHiveThreadsActive {#storagehivethreadsactive}

タスクを実行している StorageHive スレッドプール内のスレッド数。

### StorageS3Threads {#storages3threads}

StorageS3 スレッドプール内のスレッド数。

### StorageS3ThreadsActive {#storages3threadsactive}

タスクを実行している StorageS3 スレッドプール内のスレッド数。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas スレッドプール内のスレッド数。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

タスクを実行している system.replicas スレッドプール内のスレッド数。

### TCPConnection {#tcpconnection}

TCP サーバーへの接続の数（ネイティブインターフェースを持つクライアント）、サーバー間の分散クエリ接続も含まれます。

### TablesToDropQueueSize {#tablestodropqueuesize}

バックグラウンドデータ削除を待っている削除されたテーブルの数。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

外部集計のために作成された一時ファイルの数。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

JOIN のために作成された一時ファイルの数。

### TemporaryFilesForSort {#temporaryfilesforsort}

外部ソートのために作成された一時ファイルの数。

### TemporaryFilesUnknown {#temporaryfilesunknown}

目的が知られていないまま作成された一時ファイルの数。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

local_filesystem_read_method=threadpool 用のスレッドプール内のスレッド数。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

タスクを実行している local_filesystem_read_method=threadpool 用のスレッドプール内のスレッド数。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

remote_filesystem_read_method=threadpool 用のスレッドプール内のスレッド数。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

タスクを実行している remote_filesystem_read_method=threadpool 用のスレッドプール内のスレッド数。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

OvercommitTracker 内で待機しているスレッドの数。

### TotalTemporaryFiles {#totaltemporaryfiles}

作成された一時ファイルの数。

### VersionInteger {#versioninteger}

サーバーのバージョンを単一の整数として表した base-1000 の数値。例えば、バージョン 11.22.33 は 11022033 に変換されます。

### Write {#write}

飛行中の書き込み（write、pwrite、io_getevents など）システムコールの数。

### ZooKeeperRequest {#zookeeperrequest}

飛行中の ZooKeeper へのリクエストの数。

### ZooKeeperSession {#zookeepersession}

ZooKeeper へのセッション（接続）の数。これは1つを超えてはならず、ZooKeeperに一度に複数の接続を使用すると、その整合性モデルが許容する古い読み取りの結果としてバグの原因となる可能性があります。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper におけるウォッチ（イベントサブスクリプション）の数。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

取得された CPU スロットの総数。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU スロットの数に関するソフトリミットの値。

**関連項目**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリックを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含みます。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` および `system.events` テーブルからのメトリック値の履歴を含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
