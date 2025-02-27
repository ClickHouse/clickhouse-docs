---
description: "即座に計算可能なメトリクスまたは現在の値を持つメトリクスを含むシステムテーブルです。"
slug: /operations/system-tables/metrics
title: "メトリクス"
keywords: ["システムテーブル", "メトリクス"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

即座に計算可能なメトリクスや現在の値を持つメトリクスを含みます。たとえば、同時に処理されているクエリの数や現在のレプリカの遅延などです。このテーブルは常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric`のエイリアス。

すべてのサポートされるメトリクスはソースファイル [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) で確認できます。

**例**

``` sql
SELECT * FROM system.metrics LIMIT 10
```

``` text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ 実行中のクエリの数                                                 │
│ Merge                                │     0 │ 実行中のバックグラウンドマージの数                                 │
│ PartMutation                         │     0 │ 変異の数 (ALTER DELETE/UPDATE)                                      │
│ ReplicatedFetch                      │     0 │ レプリカから取得されているデータパーツの数                         │
│ ReplicatedSend                       │     0 │ レプリカに送信されているデータパーツの数                           │
│ ReplicatedChecks                     │     0 │ 一貫性を確認しているデータパーツの数                               │
│ BackgroundMergesAndMutationsPoolTask │     0 │ 関連バックグラウンドプール内のアクティブなマージと変異の数         │
│ BackgroundFetchesPoolTask            │     0 │ 関連バックグラウンドプール内のアクティブなフェッチの数            │
│ BackgroundCommonPoolTask             │     0 │ 関連バックグラウンドプール内のアクティブなタスクの数              │
│ BackgroundMovePoolTask               │     0 │ MOVEのためのBackgroundProcessingPool内のアクティブなタスクの数      │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## メトリクスの説明 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

アグリゲーターのスレッドプール内のスレッドの数。

### AggregatorThreadsActive {#aggregatorthreadsactive}

タスクを実行しているアグリゲーターのスレッドプール内のスレッドの数。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

非同期ローダーのフォアグラウンドスレッドプール内のスレッドの数。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

タスクを実行している非同期ローダーのフォアグラウンドスレッドプール内のスレッドの数。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

非同期ローダーのバックグラウンドスレッドプール内のスレッドの数。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

タスクを実行している非同期ローダーのバックグラウンドスレッドプール内のスレッドの数。

### AsyncInsertCacheSize {#asyncinsertcachesize}

キャッシュ内の非同期挿入ハッシュIDの数。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

非同期挿入スレッドプール内のスレッドの数。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

タスクを実行している非同期挿入スレッドプール内のスレッドの数。

### AsynchronousReadWait {#asynchronousreadwait}

非同期読み取りを待っているスレッドの数。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

BackgroundBufferFlushSchedulePool内のタスクの数の制限。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

BackgroundBufferFlushSchedulePool内のアクティブなタスクの数。このプールは定期的なバッファフラッシュに使用されます。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

関連バックグラウンドプール内のタスクの数の制限。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

関連バックグラウンドプール内のアクティブなタスクの数。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

BackgroundDistributedSchedulePool内のタスクの数の制限。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

BackgroundDistributedSchedulePool内のアクティブなタスクの数。このプールはバックグラウンドで行われる分散送信に使用されます。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

関連バックグラウンドプール内の同時フェッチの数の制限。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

関連バックグラウンドプール内のアクティブなフェッチの数。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

関連バックグラウンドプール内のアクティブなマージと変異の数の制限。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

関連バックグラウンドプール内のアクティブなマージと変異の数。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

メッセージストリーミング用のBackgroundProcessingPool内のタスクの数の制限。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

メッセージストリーミング用のBackgroundProcessingPool内のアクティブなタスクの数。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

移動のためのBackgroundProcessingPool内のタスクの数の制限。

### BackgroundMovePoolTask {#backgroundmovepooltask}

移動のためのBackgroundProcessingPool内のアクティブなタスクの数。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

定期的なReplicatedMergeTreeタスク（古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化など）に使用されるBackgroundSchedulePool内のタスクの数の制限。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

定期的なReplicatedMergeTreeタスク（古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化など）に使用されるBackgroundSchedulePool内のアクティブなタスクの数。

### BackupsIOThreads {#backupsiothreads}

バックアップのIOスレッドプール内のスレッドの数。

### BackupsIOThreadsActive {#backupsiothreadsactive}

タスクを実行しているバックアップのIOスレッドプール内のスレッドの数。

### BackupsThreads {#backupsthreads}

バックアップ用のスレッドプール内のスレッドの数。

### BackupsThreadsActive {#backupsthreadsactive}

タスクを実行しているバックアップ用のスレッドプール内のスレッドの数。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

壊れているとマークされた分散テーブルへの非同期挿入用のファイルの数。このメトリクスは起動時に0から始まります。各シャードのファイルの数が合算されます。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

現在存在するデタッチされたキャッシュファイルセグメントの数。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionaryスレッドプール内のスレッドの数。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

タスクを実行しているCacheDictionaryスレッドプール内のスレッドの数。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionariesの更新キュー内の「バッチ」（キーセット）の数。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionariesの更新キュー内のキーの正確な数。

### CacheFileSegments {#cachefilesegments}

現在存在するキャッシュファイルセグメントの数。

### ContextLockWait {#contextlockwait}

コンテキスト内でロックを待っているスレッドの数。これはグローバルロックです。

### DDLWorkerThreads {#ddlworkerthreads}

ON CLUSTERクエリ用のDDLWorkerスレッドプール内のスレッドの数。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

タスクを実行しているON CLUSTERクエリ用のDDLWorkerスレッドプール内のスレッドの数。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalogスレッドプール内のスレッドの数。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

タスクを実行しているDatabaseCatalogスレッドプール内のスレッドの数。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDiskスレッドプール内のスレッドの数。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

タスクを実行しているDatabaseOnDiskスレッドプール内のスレッドの数。

### DelayedInserts {#delayedinserts}

MergeTreeテーブル内のパーティションに対してアクティブなデータパーツの数が多いために制限されているINSERTクエリの数。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

アグリゲート状態を破棄するためのスレッドプール内のスレッドの数。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

タスクを実行しているアグリゲート状態を破棄するためのスレッドプール内のスレッドの数。

### DictCacheRequests {#dictcacherequests}

キャッシュタイプの辞書のデータソースへのオンザフライのリクエストの数。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage用の非同期スレッドプール内のスレッドの数。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

タスクを実行しているDiskObjectStorage用の非同期スレッドプール内のスレッドの数。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

現在実行中のバックグラウンドマージのために予約されているディスクスペース。現在マージ中のパーツの合計サイズより少し大きくなります。

### DistributedFilesToInsert {#distributedfilestoinsert}

分散テーブルへの非同期挿入のために処理待ちのファイルの数。各シャードのファイルの数が合算されます。

### DistributedSend {#distributedsend}

分散テーブルにINSERTされたデータを送信しているリモートサーバーへの接続の数。同期モードと非同期モードの両方が含まれます。

### EphemeralNode {#ephemeralnode}

ZooKeeperで保持されるエフェメラルノードの数。

### FilesystemCacheElements {#filesystemcacheelements}

ファイルシステムキャッシュの要素（ファイルセグメント）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

アクティブなキャッシュバッファの数。

### FilesystemCacheSize {#filesystemcachesize}

バイト単位のファイルシステムキャッシュのサイズ。

### GlobalThread {#globalthread}

グローバルスレッドプール内のスレッドの数。

### GlobalThreadActive {#globalthreadactive}

タスクを実行しているグローバルスレッドプール内のスレッドの数。

### HTTPConnection {#httpconnection}

HTTPサーバーへの接続の数。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionaryスレッドプール内のスレッドの数。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

タスクを実行しているHashedDictionaryスレッドプール内のスレッドの数。

### IOPrefetchThreads {#ioprefetchthreads}

IOプリフェッチスレッドプール内のスレッドの数。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

タスクを実行しているIOプリフェッチスレッドプール内のスレッドの数。

### IOThreads {#iothreads}

IOスレッドプール内のスレッドの数。

### IOThreadsActive {#iothreadsactive}

タスクを実行しているIOスレッドプール内のスレッドの数。

### IOUringInFlightEvents {#iouringinflightevents}

フライト中のio_uring SQEの数。

### IOUringPendingEvents {#iouringpendingevents}

送信待ちのio_uring SQEの数。

### IOWriterThreads {#iowriterthreads}

IOライタースレッドプール内のスレッドの数。

### IOWriterThreadsActive {#iowriterthreadsactive}

タスクを実行しているIOライタースレッドプール内のスレッドの数。

### InterserverConnection {#interserverconnection}

パーツをフェッチするための他のレプリカからの接続の数。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

現在Kafkaテーブルに割り当てられているパーティションの数。

### KafkaBackgroundReads {#kafkabackgroundreads}

現在作業中のバックグラウンドリードの数（Kafkaからのマテリアライズドビューの生成）。

### KafkaConsumers {#kafkaconsumers}

アクティブなKafkaコンシューマの数。

### KafkaConsumersInUse {#kafkaconsumersinuse}

現在直接またはバックグラウンドリードで使用されているコンシューマの数。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

いくつかのパーティションが割り当てられているアクティブなKafkaコンシューマの数。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

アクティブなlibrdkafkaスレッドの数。

### KafkaProducers {#kafkaproducers}

作成されたアクティブなKafkaプロデューサの数。

### KafkaWrites {#kafkawrites}

現在Kafkaに対する挿入の数。

### KeeperAliveConnections {#keeperaliveconnections}

生存している接続の数。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未完了のリクエストの数。

### LocalThread {#localthread}

ローカルスレッドプール内のスレッドの数。ローカルスレッドプールのスレッドはグローバルスレッドプールから取得されます。

### LocalThreadActive {#localthreadactive}

タスクを実行しているローカルスレッドプール内のスレッドの数。

### MMappedAllocBytes {#mmappedallocbytes}

mmappedアロケーションの合計バイト。

### MMappedAllocs {#mmappedallocs}

mmappedアロケーションの合計数。

### MMappedFileBytes {#mmappedfilebytes}

mmappedファイル領域の合計サイズ。

### MMappedFiles {#mmappedfiles}

mmappedファイルの合計数。

### MarksLoaderThreads {#marksloaderthreads}

マークをロードするためのスレッドプール内のスレッドの数。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

タスクを実行しているマークをロードするためのスレッドプール内のスレッドの数。

### MaxDDLEntryID {#maxddlentryid}

DDLWorkerによって処理された最大DDLエントリ。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

ZooKeeperにプッシュされたDDLWorkerの最大DDLエントリ。

### MemoryTracking {#memorytracking}

サーバーによって割り当てられた合計メモリ量（バイト）。

### Merge {#merge}

実行中のバックグラウンドマージの数。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

リモートサーバーからイニシエータサーバーに送信されるデータパーツのセットに関する現在のアナウンスメントの数（MergeTreeテーブル用）。リモートサーバー側で計測されています。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutorスレッドプール内のスレッドの数。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

タスクを実行しているMergeTreeBackgroundExecutorスレッドプール内のスレッドの数。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutorスレッドプール内のスレッドの数。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

タスクを実行しているMergeTreeDataSelectExecutorスレッドプール内のスレッドの数。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTreeパーツクリーナースレッドプール内のスレッドの数。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

タスクを実行しているMergeTreeパーツクリーナースレッドプール内のスレッドの数。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTreeパーツローダースレッドプール内のスレッドの数。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

タスクを実行しているMergeTreeパーツローダースレッドプール内のスレッドの数。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

リモートサーバーからイニシエータサーバーに返されるコールバックリクエストの現在の数（MergeTreeテーブル用）。リモートサーバー側で計測されています。

### Move {#move}

現在実行中の移動の数。

### MySQLConnection {#mysqlconnection}

MySQLプロトコルを使用しているクライアント接続の数。

### NetworkReceive {#networkreceive}

ネットワークからデータを受信しているスレッドの数。ClickHouseに関連するネットワークインタラクションのみが含まれ、サードパーティのライブラリによるものは含まれません。

### NetworkSend {#networksend}

ネットワークにデータを送信しているスレッドの数。ClickHouseに関連するネットワークインタラクションのみが含まれ、サードパーティのライブラリによるものは含まれません。

### OpenFileForRead {#openfileforread}

読み込みのために開かれているファイルの数。

### OpenFileForWrite {#openfileforwrite}

書き込みのために開かれているファイルの数。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreadsスレッドプール内のスレッドの数。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

タスクを実行しているParallelFormattingOutputFormatThreadsスレッドプール内のスレッドの数。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormatスレッドプール内のスレッドの数。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

タスクを実行しているParallelParsingInputFormatスレッドプール内のスレッドの数。

### PartMutation {#partmutation}

変異の数（ALTER DELETE/UPDATE）。

### PartsActive {#partsactive}

現在および今後のSELECTで使用されるアクティブなデータパーツ。

### PartsCommitted {#partscommitted}

非推奨。PartsActiveを参照してください。

### PartsCompact {#partscompact}

コンパクトなパーツ。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

パーツは別のディスクに移動され、独自のデストラクタで削除されるべきです。

### PartsDeleting {#partsdeleting}

アイデンティティ参照カウントを持つ非アクティブなデータパーツがあり、現在クリーンアップによって削除されています。

### PartsOutdated {#partsoutdated}

非アクティブなデータパーツですが、現在のSELECTでのみ使用され、SELECTが終了した後に削除される可能性があります。

### PartsPreActive {#partspreactive}

パーツがdata_partsに存在するが、SELECTに使用されていない。

### PartsPreCommitted {#partsprecommitted}

非推奨。PartsPreActiveを参照してください。

### PartsTemporary {#partstemporary}

現在生成中のパーツ、data_partsリストには含まれていません。

### PartsWide {#partswide}

ワイドなパーツ。

### PendingAsyncInsert {#pendingasyncinsert}

フラッシュを待っている非同期挿入の数。

### PostgreSQLConnection {#postgresqlconnection}

PostgreSQLプロトコルを使用しているクライアント接続の数。

### Query {#query}

実行中のクエリの数。

### QueryPreempted {#querypreempted}

「優先度」設定により停止し、待機しているクエリの数。

### QueryThread {#querythread}

クエリ処理スレッドの数。

### RWLockActiveReaders {#rwlockactivereaders}

テーブルRWLockで読み取りロックを保持しているスレッドの数。

### RWLockActiveWriters {#rwlockactivewriters}

テーブルRWLockで書き込みロックを保持しているスレッドの数。

### RWLockWaitingReaders {#rwlockwaitingreaders}

テーブルRWLockで読み取り待ちのスレッドの数。

### RWLockWaitingWriters {#rwlockwaitingwriters}

テーブルRWLockで書き込み待ちのスレッドの数。

### Read {#read}

フライト中の読み取り（read、pread、io_geteventsなど）システムコールの数。

### ReadTaskRequestsSent {#readtaskrequestssent}

s3Clusterテーブル関数および類似のためにリモートサーバーからイニシエータサーバーに返されるコールバックリクエストの現在の数。リモートサーバー側で計測されています。

### ReadonlyReplica {#readonlyreplica}

ZooKeeperセッションの喪失後の再初期化のため、またはZooKeeperが設定されていない状態で起動されたために現在読み取り専用状態にあるReplicatedテーブルの数。

### RemoteRead {#remoteread}

フライト中のリモートリーダーによる読み取りの数。

### ReplicatedChecks {#replicatedchecks}

一貫性を確認しているデータパーツの数。

### ReplicatedFetch {#replicatedfetch}

レプリカから取得されているデータパーツの数。

### ReplicatedSend {#replicatedsend}

レプリカに送信されているデータパーツの数。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICAスレッドプール内のスレッドの数。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

タスクを実行しているRESTART REPLICAスレッドプール内のスレッドの数。

### RestoreThreads {#restorethreads}

RESTORE用のスレッドプール内のスレッドの数。

### RestoreThreadsActive {#restorethreadsactive}

タスクを実行しているRESTORE用のスレッドプール内のスレッドの数。

### Revision {#revision}

サーバーのリビジョン。これはリリースまたはリリース候補ごとにインクリメントされた数値で、パッチリリースは含まれません。

### S3Requests {#s3requests}

S3リクエストの数。

### SendExternalTables {#sendexternaltables}

リモートサーバーへの外部テーブルのデータを送信している接続の数。外部テーブルは、分散サブクエリを使用するGLOBAL INおよびGLOBAL JOINオペレーターを実装するために使用されます。

### SendScalars {#sendscalars}

スカラーのデータをリモートサーバーに送信している接続の数。

### StorageBufferBytes {#storagebufferbytes}

バッファテーブルのバッファ内のバイト数。

### StorageBufferRows {#storagebufferrows}

バッファテーブルのバッファ内の行の数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributedスレッドプール内のスレッドの数。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

タスクを実行しているStorageDistributedスレッドプール内のスレッドの数。

### StorageHiveThreads {#storagehivethreads}

StorageHiveスレッドプール内のスレッドの数。

### StorageHiveThreadsActive {#storagehivethreadsactive}

タスクを実行しているStorageHiveスレッドプール内のスレッドの数。

### StorageS3Threads {#storages3threads}

StorageS3スレッドプール内のスレッドの数。

### StorageS3ThreadsActive {#storages3threadsactive}

タスクを実行しているStorageS3スレッドプール内のスレッドの数。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicasスレッドプール内のスレッドの数。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

タスクを実行しているsystem.replicasスレッドプール内のスレッドの数。

### TCPConnection {#tcpconnection}

TCPサーバー（ネイティブインターフェースを持つクライアント）への接続の数。サーバー間の分散クエリ接続も含まれます。

### TablesToDropQueueSize {#tablestodropqueuesize}

バックグラウンドデータ削除を待機しているドロップされたテーブルの数。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

外部集約のために作成された一時ファイルの数。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

JOINのために作成された一時ファイルの数。

### TemporaryFilesForSort {#temporaryfilesforsort}

外部ソートのために作成された一時ファイルの数。

### TemporaryFilesUnknown {#temporaryfilesunknown}

既知の目的なしに作成された一時ファイルの数。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

local_filesystem_read_method=threadpoolのためのスレッドプール内のスレッドの数。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

タスクを実行しているlocal_filesystem_read_method=threadpoolのためのスレッドプール内のスレッドの数。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

remote_filesystem_read_method=threadpoolのためのスレッドプール内のスレッドの数。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

タスクを実行しているremote_filesystem_read_method=threadpoolのためのスレッドプール内のスレッドの数。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

オーバーコムミットトラッカー内で待機しているスレッドの数。

### TotalTemporaryFiles {#totaltemporaryfiles}

作成された一時ファイルの数。

### VersionInteger {#versioninteger}

サーバーのバージョンを1つの整数で表した数（基数1000）。たとえば、バージョン11.22.33は11022033に変換されます。

### Write {#write}

フライト中の書き込み（write、pwrite、io_geteventsなど）システムコールの数。

### ZooKeeperRequest {#zookeeperrequest}

フライト中のZooKeeperへのリクエストの数。

### ZooKeeperSession {#zookeepersession}

ZooKeeperへのセッション（接続）の数。接続は1つ以上あってはならず、ZooKeeperの整合性モデルが許可するリニアリゼーションの欠落（古い読み取り）によりバグが発生する可能性があります。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeperでのウォッチ（イベントのサブスクリプション）の数。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

取得されたCPUスロットの合計数。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPUスロット数のソフトリミットの値。

**関連情報**

- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md#system_tables-asynchronous_metrics) — 定期的に計算されたメトリクスを含みます。
- [system.events](../../operations/system-tables/events.md#system_tables-events) — 発生したイベントの数を含みます。
- [system.metric_log](../../operations/system-tables/metric_log.md#system_tables-metric_log) — `system.metrics`および `system.events`テーブルからのメトリクス値の履歴を含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
