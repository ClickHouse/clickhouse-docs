---
description: "システムテーブルは、即座に計算できるメトリックまたは現在の値を持つメトリックを含んでいます。"
slug: /operations/system-tables/metrics
title: "system.metrics"
keywords: ["システムテーブル", "メトリック"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

即座に計算できるメトリック、または現在の値を持つメトリックを含んでいます。例えば、同時に処理されているクエリの数や現在のレプリカ遅延などがあります。このテーブルは常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリックの名前。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリックの値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリックの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

サポートされている全てのメトリックはソースファイル [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) で確認できます。

**例**

``` sql
SELECT * FROM system.metrics LIMIT 10
```

``` text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ 実行中のクエリの数                                                    │
│ Merge                                │     0 │ 実行中のバックグラウンドマージの数                                    │
│ PartMutation                         │     0 │ 変更の数（ALTER DELETE/UPDATE）                                        │
│ ReplicatedFetch                      │     0 │ レプリカから取得中のデータ部分の数                                    │
│ ReplicatedSend                       │     0 │ レプリカに送信中のデータ部分の数                                      │
│ ReplicatedChecks                     │     0 │ 一貫性を確認中のデータ部分の数                                        │
│ BackgroundMergesAndMutationsPoolTask │     0 │ 関連するバックグラウンドプール内のアクティブなマージと変異の数      │
│ BackgroundFetchesPoolTask            │     0 │ 関連するバックグラウンドプール内のアクティブなフェッチの数          │
│ BackgroundCommonPoolTask             │     0 │ 関連するバックグラウンドプール内のアクティブなタスクの数            │
│ BackgroundMovePoolTask               │     0 │ 移動のためのBackgroundProcessingPool内のアクティブなタスクの数       │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## メトリックの説明 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

アグリゲーターのスレッドプール内のスレッド数。

### AggregatorThreadsActive {#aggregatorthreadsactive}

タスクを実行中のアグリゲーターのスレッドプール内のスレッド数。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

非同期ローダの前景スレッドプール内のスレッド数。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

タスクを実行中の非同期ローダの前景スレッドプール内のスレッド数。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

非同期ローダのバックグラウンドスレッドプール内のスレッド数。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

タスクを実行中の非同期ローダのバックグラウンドスレッドプール内のスレッド数。

### AsyncInsertCacheSize {#asyncinsertcachesize}

キャッシュ内の非同期挿入ハッシュIDの数。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

非同期挿入のスレッドプール内のスレッド数。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

タスクを実行中の非同期挿入のスレッドプール内のスレッド数。

### AsynchronousReadWait {#asynchronousreadwait}

非同期読み取りを待っているスレッドの数。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

BackgroundBufferFlushSchedulePool内のタスク数の制限。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

BackgroundBufferFlushSchedulePool内のアクティブなタスクの数。このプールは定期的なバッファフラッシュに使用されます。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

関連するバックグラウンドプール内のタスク数の制限。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

関連するバックグラウンドプール内のアクティブなタスクの数。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

BackgroundDistributedSchedulePool内のタスク数の制限。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

BackgroundDistributedSchedulePool内のアクティブなタスクの数。このプールはバックグラウンドで行われる分散送信に使用されます。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

関連するバックグラウンドプール内の同時フェッチの数の制限。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

関連するバックグラウンドプール内のアクティブなフェッチの数。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

関連するバックグラウンドプール内のアクティブなマージと変異の制限。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

関連するバックグラウンドプール内のアクティブなマージと変異の数。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

メッセージストリーミングのためのBackgroundProcessingPool内のタスク数の制限。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

メッセージストリーミングのためのBackgroundProcessingPool内のアクティブなタスクの数。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

移動のためのBackgroundProcessingPool内のタスク数の制限。

### BackgroundMovePoolTask {#backgroundmovepooltask}

移動のためのBackgroundProcessingPool内のアクティブなタスクの数。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

定期的なReplicatedMergeTreeタスクのためのBackgroundSchedulePool内のタスク数の制限（古いデータ部分のクリーンアップ、データ部分の変更、レプリカの再初期化など）。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

BackgroundSchedulePool内のアクティブなタスクの数。このプールは定期的なReplicatedMergeTreeタスクに使用されます。

### BackupsIOThreads {#backupsiothreads}

バックアップ用のBackupsIOスレッドプール内のスレッド数。

### BackupsIOThreadsActive {#backupsiothreadsactive}

タスクを実行中のバックアップ用のBackupsIOスレッドプール内のスレッド数。

### BackupsThreads {#backupsthreads}

バックアップ用のスレッドプール内のスレッド数。

### BackupsThreadsActive {#backupsthreadsactive}

タスクを実行中のバックアップ用のスレッドプール内のスレッド数。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

壊れたとマークされた分散テーブルへの非同期挿入のためのファイル数。このメトリックは起動時に0から始まります。各シャードのファイル数を合計したものです。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

存在するデタッチされたキャッシュファイルセグメントの数。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionaryスレッドプール内のスレッド数。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

タスクを実行中のCacheDictionaryスレッドプール内のスレッド数。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionariesにおける更新キュー内の 'バッチ' （キーのセット）の数。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionariesにおける更新キュー内のキーの正確な数。

### CacheFileSegments {#cachefilesegments}

存在するキャッシュファイルセグメントの数。

### ContextLockWait {#contextlockwait}

コンテキスト内でロックを待っているスレッドの数。これはグローバルロックです。

### DDLWorkerThreads {#ddlworkerthreads}

ON CLUSTERクエリのためのDDLWorkerスレッドプール内のスレッド数。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

タスクを実行中のDDLWorkerスレッドプール内のスレッド数。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalogスレッドプール内のスレッド数。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

タスクを実行中のDatabaseCatalogスレッドプール内のスレッド数。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDiskスレッドプール内のスレッド数。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

タスクを実行中のDatabaseOnDiskスレッドプール内のスレッド数。

### DelayedInserts {#delayedinserts}

MergeTreeテーブルのパーティションに対してアクティブなデータ部分の数が多いために制限されているINSERTクエリの数。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

集約状態を破壊するためのスレッドプール内のスレッド数。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

タスクを実行中の集約状態を破壊するためのスレッドプール内のスレッド数。

### DictCacheRequests {#dictcacherequests}

キャッシュタイプの辞書のデータソースに送信中のリクエストの数。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorageのための非同期スレッドプール内のスレッド数。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

タスクを実行中のDiskObjectStorageのための非同期スレッドプール内のスレッド数。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

現在実行中のバックグラウンドマージのために予約されたディスクスペース。現在マージ中のパーツの合計サイズより若干多いです。

### DistributedFilesToInsert {#distributedfilestoinsert}

分散テーブルへの非同期挿入のために処理待ちのファイル数。各シャードのファイル数を合計したものです。

### DistributedSend {#distributedsend}

分散テーブルにINSERTされたデータを送信するためにリモートサーバーへの接続の数。同期モードと非同期モードの両方が含まれます。

### EphemeralNode {#ephemeralnode}

ZooKeeperに保持されているエフェメラルノードの数。

### FilesystemCacheElements {#filesystemcacheelements}

ファイルシステムキャッシュ要素（ファイルセグメント）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

アクティブなキャッシュバッファの数。

### FilesystemCacheSize {#filesystemcachesize}

ファイルシステムキャッシュのサイズ（バイト単位）。

### GlobalThread {#globalthread}

グローバルスレッドプール内のスレッド数。

### GlobalThreadActive {#globalthreadactive}

タスクを実行中のグローバルスレッドプール内のスレッド数。

### HTTPConnection {#httpconnection}

HTTPサーバーへの接続の数。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionaryスレッドプール内のスレッド数。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

タスクを実行中のHashedDictionaryスレッドプール内のスレッド数。

### IOPrefetchThreads {#ioprefetchthreads}

IOプリフェッチスレッドプール内のスレッド数。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

タスクを実行中のIOプリフェッチスレッドプール内のスレッド数。

### IOThreads {#iothreads}

IOスレッドプール内のスレッド数。

### IOThreadsActive {#iothreadsactive}

タスクを実行中のIOスレッドプール内のスレッド数。

### IOUringInFlightEvents {#iouringinflightevents}

フライト中の io_uring SQE の数。

### IOUringPendingEvents {#iouringpendingevents}

提出を待っている io_uring SQE の数。

### IOWriterThreads {#iowriterthreads}

IOライタースレッドプール内のスレッド数。

### IOWriterThreadsActive {#iowriterthreadsactive}

タスクを実行中のIOライタースレッドプール内のスレッド数。

### InterserverConnection {#interserverconnection}

部分を取得するために他のレプリカからの接続の数。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

現在割り当てられているKafkaテーブルのパーティションの数。

### KafkaBackgroundReads {#kafkabackgroundreads}

現在作業中のバックグラウンドでの読み取りの数（Kafkaからのマテリアライズドビューのポピュレーション）。

### KafkaConsumers {#kafkaconsumers}

アクティブなKafkaコンシューマの数。

### KafkaConsumersInUse {#kafkaconsumersinuse}

現在直接またはバックグラウンド読み取りによって使用されているコンシューマの数。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

いくつかのパーティションが割り当てられているアクティブなKafkaコンシューマの数。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

アクティブなlibrdkafkaスレッドの数。

### KafkaProducers {#kafkaproducers}

作成されたアクティブなKafkaプロデューサの数。

### KafkaWrites {#kafkawrites}

現在Kafkaに対して実行中の挿入の数。

### KeeperAliveConnections {#keeperaliveconnections}

生存している接続の数。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未処理のリクエストの数。

### LocalThread {#localthread}

ローカルスレッドプール内のスレッド数。ローカルスレッドプールのスレッドはグローバルスレッドプールから取得されます。

### LocalThreadActive {#localthreadactive}

タスクを実行中のローカルスレッドプール内のスレッド数。

### MMappedAllocBytes {#mmappedallocbytes}

mmappedアロケーションの合計バイト数。

### MMappedAllocs {#mmappedallocs}

mmappedアロケーションの合計数。

### MMappedFileBytes {#mmappedfilebytes}

mmappedファイル領域の合計サイズ。

### MMappedFiles {#mmappedfiles}

mmappedファイルの総数。

### MarksLoaderThreads {#marksloaderthreads}

マークをロードするためのスレッドプール内のスレッド数。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

タスクを実行中のマークをロードするためのスレッドプール内のスレッド数。

### MaxDDLEntryID {#maxddlentryid}

DDLWorkerの最大処理DDLエントリ。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

ZooKeeperにプッシュされたDDLWorkerの最大DDLエントリ。

### MemoryTracking {#memorytracking}

サーバーによって割り当てられた合計メモリ量（バイト単位）。

### Merge {#merge}

現在実行中のバックグラウンドマージの数。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

リモートサーバーからイニシエーターサーバーへ送信されている現在のデータ部分の知らせの数（MergeTreeテーブル用）。リモートサーバー側で測定されます。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutorスレッドプール内のスレッド数。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

タスクを実行中のMergeTreeBackgroundExecutorスレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutorスレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

タスクを実行中のMergeTreeDataSelectExecutorスレッドプール内のスレッド数。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTreeパーツクリーナーのスレッドプール内のスレッド数。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

タスクを実行中のMergeTreeパーツクリーナーのスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTreeパーツローダーのスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

タスクを実行中のMergeTreeパーツローダーのスレッドプール内のスレッド数。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

リモートサーバーからイニシエーターサーバーに戻るためのコールバック要求の現在の数（MergeTreeテーブル用）。リモートサーバー側で測定されます。

### Move {#move}

現在実行中の移動の数。

### MySQLConnection {#mysqlconnection}

MySQLプロトコルを使用しているクライアント接続の数。

### NetworkReceive {#networkreceive}

ネットワークからデータを受信しているスレッドの数。ClickHouse関連のネットワークインタラクションのみが含まれ、サードパーティのライブラリによるものは含まれません。

### NetworkSend {#networksend}

ネットワークにデータを送信しているスレッドの数。ClickHouse関連のネットワークインタラクションのみが含まれ、サードパーティのライブラリによるものは含まれません。

### OpenFileForRead {#openfileforread}

読み取り用に開いているファイルの数。

### OpenFileForWrite {#openfileforwrite}

書き込み用に開いているファイルの数。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads のスレッドプール内のスレッド数。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

タスクを実行中のParallelFormattingOutputFormatThreadsのスレッドプール内のスレッド数。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormatスレッドプール内のスレッド数。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

タスクを実行中のParallelParsingInputFormatスレッドプール内のスレッド数。

### PartMutation {#partmutation}

変更の数（ALTER DELETE/UPDATE）。

### PartsActive {#partsactive}

現在および今後のSELECTによって使用されるアクティブなデータ部分。

### PartsCommitted {#partscommitted}

推奨されません。PartsActiveを参照してください。

### PartsCompact {#partscompact}

コンパクトな部分。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

部分が別のディスクに移動され、自身のデストラクタ内で削除されるべき。

### PartsDeleting {#partsdeleting}

活動中でないデータ部分で、アイデンティティ参照カウンタを持ち、現在クリーンアップ中です。

### PartsOutdated {#partsoutdated}

活動中でないデータ部分ですが、現在のSELECTによってのみ使用され、SELECTが終了した後に削除可能です。

### PartsPreActive {#partspreactive}

部分はdata_partsにありますが、SELECTには使用されていません。

### PartsPreCommitted {#partsprecommitted}

推奨されません。PartsPreActiveを参照してください。

### PartsTemporary {#partstemporary}

部分は現在生成中であり、data_partsリストには含まれていません。

### PartsWide {#partswide}

ワイドな部分。

### PendingAsyncInsert {#pendingasyncinsert}

フラッシュを待っている非同期挿入の数。

### PostgreSQLConnection {#postgresqlconnection}

PostgreSQLプロトコルを使用しているクライアント接続の数。

### Query {#query}

現在実行中のクエリの数。

### QueryPreempted {#querypreempted}

「優先度」設定により停止し待機しているクエリの数。

### QueryThread {#querythread}

クエリ処理スレッドの数。

### RWLockActiveReaders {#rwlockactivereaders}

テーブルRWLock内で読み取りロックを保持しているスレッドの数。

### RWLockActiveWriters {#rwlockactivewriters}

テーブルRWLock内で書き込みロックを保持しているスレッドの数。

### RWLockWaitingReaders {#rwlockwaitingreaders}

テーブルRWLock内で読み取りを待っているスレッドの数。

### RWLockWaitingWriters {#rwlockwaitingwriters}

テーブルRWLock内で書き込みを待っているスレッドの数。

### Read {#read}

フライト中の読み取り（read、pread、io_geteventsなど）システムコールの数。

### ReadTaskRequestsSent {#readtaskrequestssent}

s3Clusterテーブル関数や類似のタスクを選択するためにリモートサーバーからイニシエーターサーバーに戻るコールバック要求の現在の数。リモートサーバー側で測定されます。

### ReadonlyReplica {#readonlyreplica}

ZooKeeperセッション喪失後の再初期化のために現在読み取り専用状態にあるReplicatedテーブルの数、またはZooKeeperが構成されていないまま起動されたために読み取り専用状態です。

### RemoteRead {#remoteread}

フライト中のリモートリーダーによる読み取りの数。

### ReplicatedChecks {#replicatedchecks}

一貫性を確認中のデータ部分の数。

### ReplicatedFetch {#replicatedfetch}

レプリカから取得中のデータ部分の数。

### ReplicatedSend {#replicatedsend}

レプリカに送信中のデータ部分の数。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICAスレッドプール内のスレッド数。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

タスクを実行中のRESTART REPLICAスレッドプール内のスレッド数。

### RestoreThreads {#restorethreads}

RESTOREのためのスレッドプール内のスレッド数。

### RestoreThreadsActive {#restorethreadsactive}

タスクを実行中のRESTOREのためのスレッドプール内のスレッド数。

### Revision {#revision}

サーバーのリビジョン。これは、パッチリリースを除いて、リリースまたはリリース候補ごとに増加する番号です。

### S3Requests {#s3requests}

S3リクエスト。

### SendExternalTables {#sendexternaltables}

リモートサーバーに外部テーブル用のデータを送信している接続の数。外部テーブルは、分散サブクエリとともにGLOBAL INおよびGLOBAL JOIN演算子を実装するために使用されます。

### SendScalars {#sendscalars}

リモートサーバーにスカラー用のデータを送信している接続の数。

### StorageBufferBytes {#storagebufferbytes}

バッファテーブルのバッファ内のバイト数。

### StorageBufferRows {#storagebufferrows}

バッファテーブルのバッファ内の行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributedスレッドプール内のスレッド数。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

タスクを実行中のStorageDistributedスレッドプール内のスレッド数。

### StorageHiveThreads {#storagehivethreads}

StorageHiveスレッドプール内のスレッド数。

### StorageHiveThreadsActive {#storagehivethreadsactive}

タスクを実行中のStorageHiveスレッドプール内のスレッド数。

### StorageS3Threads {#storages3threads}

StorageS3スレッドプール内のスレッド数。

### StorageS3ThreadsActive {#storages3threadsactive}

タスクを実行中のStorageS3スレッドプール内のスレッド数。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicasスレッドプール内のスレッド数。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

タスクを実行中のsystem.replicasスレッドプール内のスレッド数。

### TCPConnection {#tcpconnection}

TCPサーバーへの接続の数（ネイティブインターフェースを持つクライアント）、サーバー間の分散クエリ接続も含まれます。

### TablesToDropQueueSize {#tablestodropqueuesize}

バックグラウンドデータ削除を待機中のドロップされたテーブルの数。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

外部集約のために作成された一時ファイルの数。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

JOINのために作成された一時ファイルの数。

### TemporaryFilesForSort {#temporaryfilesforsort}

外部ソートのために作成された一時ファイルの数。

### TemporaryFilesUnknown {#temporaryfilesunknown}

知られていない目的で作成された一時ファイルの数。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

local_filesystem_read_method=threadpoolのためのスレッドプール内のスレッド数。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

タスクを実行中のlocal_filesystem_read_method=threadpoolのためのスレッドプール内のスレッド数。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

remote_filesystem_read_method=threadpoolのためのスレッドプール内のスレッド数。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

タスクを実行中のremote_filesystem_read_method=threadpoolのためのスレッドプール内のスレッド数。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

OvercommitTracker内で待機中のスレッドの数。

### TotalTemporaryFiles {#totaltemporaryfiles}

作成された一時ファイルの数。

### VersionInteger {#versioninteger}

単一の整数番号（基数-1000）で表されたサーバーのバージョン。例えば、バージョン11.22.33は11022033に変換されます。

### Write {#write}

フライト中の書き込み（write、pwrite、io_geteventsなど）システムコールの数。

### ZooKeeperRequest {#zookeeperrequest}

フライト中のZooKeeperへのリクエストの数。

### ZooKeeperSession {#zookeepersession}

ZooKeeperへのセッション（接続）の数。通常は1つであるべきです。なぜなら、ZooKeeperに対して1つ以上の接続を使用すると、ZooKeeperの整合性モデルが許容する不完全な読み取りやバグの原因となるためです。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeperでのウォッチ（イベントサブスクリプション）の数。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

獲得したCPUスロットの総数。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPUスロット数に対するソフトリミットの値。

**関連情報**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリックを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含みます。
- [system.metric_log](../../operations/system-tables/metric_log.md#system_tables-metric_log) — `system.metrics` および `system.events` テーブルからのメトリック値の履歴を含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
