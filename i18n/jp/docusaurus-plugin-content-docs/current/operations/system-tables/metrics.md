---
description: '瞬時に計算可能なメトリクスまたは現在の値を持つシステムテーブル。'
keywords: ['system table', 'metrics']
slug: /operations/system-tables/metrics
title: 'system.metrics'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metrics

<SystemTableCloud/>

瞬時に計算可能なメトリクスまたは現在の値を持つメトリクスを含みます。たとえば、同時に処理されているクエリの数や現在のレプリカ遅延などです。このテーブルは常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

すべてのサポートされているメトリクスは、ソースファイル [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) で見つけることができます。

**例**

```sql
SELECT * FROM system.metrics LIMIT 10
```

```text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ 実行中のクエリの数                                                  │
│ Merge                                │     0 │ 実行中のバックグラウンドマージの数                                │
│ PartMutation                         │     0 │ ミューテーション (ALTER DELETE/UPDATE) の数                         │
│ ReplicatedFetch                      │     0 │ レプリカから取得中のデータパーツの数                                │
│ ReplicatedSend                       │     0 │ レプリカに送信中のデータパーツの数                                │
│ ReplicatedChecks                     │     0 │ 一貫性を確認しているデータパーツの数                                │
│ BackgroundMergesAndMutationsPoolTask │     0 │ 関連バックグラウンドプール内のアクティブなマージとミューテーションの数 │
│ BackgroundFetchesPoolTask            │     0 │ 関連バックグラウンドプール内のアクティブなフェッチの数              │
│ BackgroundCommonPoolTask             │     0 │ 関連バックグラウンドプール内のアクティブなタスクの数                │
│ BackgroundMovePoolTask               │     0 │ 移動のための BackgroundProcessingPool におけるアクティブなタスクの数      │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## メトリクスの説明 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Aggregator スレッドプールのスレッド数。

### AggregatorThreadsActive {#aggregatorthreadsactive}

タスクを実行している Aggregator スレッドプールのスレッド数。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

非同期ローダーのフォアグラウンドスレッドプールのスレッド数。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

タスクを実行している非同期ローダーのフォアグラウンドスレッドプールのスレッド数。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

非同期ローダーのバックグラウンドスレッドプールのスレッド数。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

タスクを実行している非同期ローダーのバックグラウンドスレッドプールのスレッド数。

### AsyncInsertCacheSize {#asyncinsertcachesize}

キャッシュ内の非同期挿入ハッシュ ID の数。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

非同期挿入スレッドプールのスレッド数。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

タスクを実行している非同期挿入スレッドプールのスレッド数。

### AsynchronousReadWait {#asynchronousreadwait}

非同期読み込みを待機しているスレッドの数。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

BackgroundBufferFlushSchedulePool 内のタスクの数の制限。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

BackgroundBufferFlushSchedulePool 内のアクティブなタスクの数。このプールは定期的なバッファフラッシュに使用されます。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

関連バックグラウンドプール内のタスクの数の制限。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

関連バックグラウンドプール内のアクティブなタスクの数。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

BackgroundDistributedSchedulePool 内のタスクの数の制限。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

BackgroundDistributedSchedulePool 内のアクティブなタスクの数。このプールはバックグラウンドで行われる分散送信に使用されます。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

関連バックグラウンドプール内の同時フェッチの数の制限。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

関連バックグラウンドプール内のアクティブなフェッチの数。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

関連バックグラウンドプール内のアクティブなマージとミューテーションの数の制限。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

関連バックグラウンドプール内のアクティブなマージとミューテーションの数。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

メッセージストリーミングのための BackgroundProcessingPool 内のタスクの数の制限。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

メッセージストリーミングのための BackgroundProcessingPool 内のアクティブなタスクの数。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

移動のための BackgroundProcessingPool 内のタスクの数の制限。

### BackgroundMovePoolTask {#backgroundmovepooltask}

移動のための BackgroundProcessingPool 内のアクティブなタスクの数。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

ReplicatedMergeTree タスクのための BackgroundSchedulePool 内のタスクの数の制限。古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化などに使用されます。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

ReplicatedMergeTree タスクのための BackgroundSchedulePool 内のアクティブなタスクの数。古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化などに使用されます。

### BackupsIOThreads {#backupsiothreads}

BackupsIO スレッドプールのスレッド数。

### BackupsIOThreadsActive {#backupsiothreadsactive}

タスクを実行している BackupsIO スレッドプールのスレッド数。

### BackupsThreads {#backupsthreads}

BACKUP 用のスレッドプールのスレッド数。

### BackupsThreadsActive {#backupsthreadsactive}

タスクを実行している BACKUP 用のスレッドプールのスレッド数。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

破損としてマークされた分散テーブルへの非同期挿入用のファイルの数。サーバー起動時にはこのメトリクスは 0 から開始されます。各シャードのファイルの数が合計されます。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

既存のデタッチされたキャッシュファイルセグメントの数。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary スレッドプールのスレッド数。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

タスクを実行している CacheDictionary スレッドプールのスレッド数。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries における更新キュー内の 'バッチ' （キーのセット）の数。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries における更新キュー内のキーの正確な数。

### CacheFileSegments {#cachefilesegments}

既存のキャッシュファイルセグメントの数。

### ContextLockWait {#contextlockwait}

コンテキスト内でロックを待機しているスレッドの数。これはグローバルロックです。

### DDLWorkerThreads {#ddlworkerthreads}

ON CLUSTER クエリ用の DDLWorker スレッドプールのスレッド数。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

タスクを実行している ON CLUSTER クエリ用の DDLWORKER スレッドプールのスレッド数。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog スレッドプールのスレッド数。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

タスクを実行している DatabaseCatalog スレッドプールのスレッド数。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk スレッドプールのスレッド数。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

タスクを実行している DatabaseOnDisk スレッドプールのスレッド数。

### DelayedInserts {#delayedinserts}

MergeTree テーブルのパーティションに対するアクティブデータパーツの数が多いために制限されている INSERT クエリの数。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

集約状態を破棄するためのスレッドプールのスレッド数。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

タスクを実行している集約状態を破棄するためのスレッドプールのスレッド数。

### DictCacheRequests {#dictcacherequests}

キャッシュ型の辞書データソースへのフライ中のリクエストの数。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage 用の非同期スレッドプールのスレッド数。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

タスクを実行している DiskObjectStorage 用の非同期スレッドプールのスレッド数。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

現在実行中のバックグラウンドマージのために予約されたディスクスペース。マージ中のパーツの総サイズよりわずかに大きいです。

### DistributedFilesToInsert {#distributedfilestoinsert}

分散テーブルに非同期挿入のために処理待ちのファイルの数。各シャードのファイルの数が合計されます。

### DistributedSend {#distributedsend}

分散テーブルに挿入されたデータを送信しているリモートサーバーへの接続の数。同期モードと非同期モードの両方が含まれます。

### EphemeralNode {#ephemeralnode}

ZooKeeper に保持されているエフェメラルノードの数。

### FilesystemCacheElements {#filesystemcacheelements}

ファイルシステムキャッシュ要素（ファイルセグメント）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

アクティブなキャッシュバッファの数。

### FilesystemCacheSize {#filesystemcachesize}

バイト単位のファイルシステムキャッシュサイズ。

### GlobalThread {#globalthread}

グローバルスレッドプールのスレッド数。

### GlobalThreadActive {#globalthreadactive}

タスクを実行しているグローバルスレッドプールのスレッド数。

### HTTPConnection {#httpconnection}

HTTP サーバーへの接続の数。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary スレッドプールのスレッド数。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

タスクを実行している HashedDictionary スレッドプールのスレッド数。

### IOPrefetchThreads {#ioprefetchthreads}

IO プレフェッチスレッドプールのスレッド数。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

タスクを実行している IO プレフェッチスレッドプールのスレッド数。

### IOThreads {#iothreads}

IO スレッドプールのスレッド数。

### IOThreadsActive {#iothreadsactive}

タスクを実行している IO スレッドプールのスレッド数。

### IOUringInFlightEvents {#iouringinflightevents}

フライト中の io_uring SQE の数。

### IOUringPendingEvents {#iouringpendingevents}

提出待ちの io_uring SQE の数。

### IOWriterThreads {#iowriterthreads}

IO ライタースレッドプールのスレッド数。

### IOWriterThreadsActive {#iowriterthreadsactive}

タスクを実行している IO ライタースレッドプールのスレッド数。

### InterserverConnection {#interserverconnection}

パーツを取得するための他のレプリカからの接続の数。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

現在割り当てられている Kafka テーブルのパーティション数。

### KafkaBackgroundReads {#kafkabackgroundreads}

現在動作中のバックグラウンドリードの数（Kafka からのマテリアライズドビューのポピュレート）。

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

生存している接続の数。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未処理のリクエストの数。

### LocalThread {#localthread}

ローカルスレッドプールのスレッド数。ローカルスレッドプール内のスレッドは、グローバルスレッドプールから取得されます。

### LocalThreadActive {#localthreadactive}

タスクを実行しているローカルスレッドプールのスレッド数。

### MMappedAllocBytes {#mmappedallocbytes}

マッピング済み割り当ての合計バイト数。

### MMappedAllocs {#mmappedallocs}

マッピング済み割り当ての総数。

### MMappedFileBytes {#mmappedfilebytes}

マッピング済みファイル領域の合計サイズ。

### MMappedFiles {#mmappedfiles}

マッピング済みファイルの総数。

### MarksLoaderThreads {#marksloaderthreads}

マークをロードするためのスレッドプールのスレッド数。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

タスクを実行しているマークをロードするためのスレッドプールのスレッド数。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker によって処理された最大の DDL エントリ。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

ZooKeeper に送信された DDLWorker の最大 DDL エントリ。

### MemoryTracking {#memorytracking}

サーバーによって割り当てられたメモリの総量（バイト）。

### Merge {#merge}

実行中のバックグラウンドマージの数。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

リモートサーバーからイニシエーターサーバーに送信されているデータパーツのセットに関する現在の発表の数（MergeTree テーブル用）。リモートサーバー側で測定されます。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor スレッドプールのスレッド数。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

タスクを実行している MergeTreeBackgroundExecutor スレッドプールのスレッド数。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor スレッドプールのスレッド数。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

タスクを実行している MergeTreeDataSelectExecutor スレッドプールのスレッド数。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree パーツクリーナースレッドプールのスレッド数。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

タスクを実行している MergeTree パーツクリーナースレッドプールのスレッド数。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree パーツローダースレッドプールのスレッド数。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

タスクを実行している MergeTree パーツローダースレッドプールのスレッド数。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

リモートサーバーからイニシエーターサーバーに読取タスクを選択するためのコールバックリクエストの現在の数（MergeTree テーブル用）。リモートサーバー側で測定されます。

### Move {#move}

現在実行中の移動の数。

### MySQLConnection {#mysqlconnection}

MySQL プロトコルを使用しているクライアント接続の数。

### NetworkReceive {#networkreceive}

ネットワークからデータを受信しているスレッドの数。ClickHouse 関連のネットワークインタラクションのみが含まれ、3rd パーティライブラリによるものは含まれません。

### NetworkSend {#networksend}

ネットワークにデータを送信しているスレッドの数。ClickHouse 関連のネットワークインタラクションのみが含まれ、3rd パーティライブラリによるものは含まれません。

### OpenFileForRead {#openfileforread}

読み取り用に開いているファイルの数。

### OpenFileForWrite {#openfileforwrite}

書き込み用に開いているファイルの数。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads スレッドプールのスレッド数。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

タスクを実行している ParallelFormattingOutputFormatThreads スレッドプールのスレッド数。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat スレッドプールのスレッド数。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

タスクを実行している ParallelParsingInputFormat スレッドプールのスレッド数。

### PartMutation {#partmutation}

ミューテーション (ALTER DELETE/UPDATE) の数。

### PartsActive {#partsactive}

現在および今後の SELECT に使用されるアクティブデータパーツ。

### PartsCommitted {#partscommitted}

非推奨。PartsActive を参照してください。

### PartsCompact {#partscompact}

コンパクトなパーツ。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

パーツが別のディスクに移動され、独自のデストラクタで削除される必要があります。

### PartsDeleting {#partsdeleting}

識別子参照カウンタを持つ非アクティブデータパーツ、クリーナーによって現在削除中です。

### PartsOutdated {#partsoutdated}

非アクティブデータパーツですが、現在の SELECT のみで使用される可能性があります。SELECT が終了した後に削除されることがあります。

### PartsPreActive {#partspreactive}

パーツは data_parts に存在しますが、SELECT には使用されていません。

### PartsPreCommitted {#partsprecommitted}

非推奨。PartsPreActive を参照してください。

### PartsTemporary {#partstemporary}

パーツは現在生成中で、data_parts リストには含まれていません。

### PartsWide {#partswide}

ワイドなパーツ。

### PendingAsyncInsert {#pendingasyncinsert}

フラッシュ待ちの非同期挿入の数。

### PostgreSQLConnection {#postgresqlconnection}

PostgreSQL プロトコルを使用しているクライアント接続の数。

### Query {#query}

実行中のクエリの数。

### QueryPreempted {#querypreempted}

'priority' 設定のために停止して待機しているクエリの数。

### QueryThread {#querythread}

クエリ処理スレッドの数。

### RWLockActiveReaders {#rwlockactivereaders}

テーブル RWLock において読み取りロックを持つスレッドの数。

### RWLockActiveWriters {#rwlockactivewriters}

テーブル RWLock において書き込みロックを持つスレッドの数。

### RWLockWaitingReaders {#rwlockwaitingreaders}

テーブル RWLock で読み取りを待機しているスレッドの数。

### RWLockWaitingWriters {#rwlockwaitingwriters}

テーブル RWLock で書き込みを待機しているスレッドの数。

### Read {#read}

飛行中の読み取り (read, pread, io_getevents など) システムコールの数。

### ReadTaskRequestsSent {#readtaskrequestssent}

S3Cluster テーブル関数などの読取タスクを選択するためのコールバックリクエストの現在の数。リモートサーバー側で測定されます。

### ReadonlyReplica {#readonlyreplica}

ZooKeeper セッションが失われた後や、ZooKeeper が設定されていない状態で起動されたために現在書き込み禁止状態にある Replicated テーブルの数。

### RemoteRead {#remoteread}

飛行中のリモートリーダーによる読み取りの数。

### ReplicatedChecks {#replicatedchecks}

一貫性をチェックしているデータパーツの数。

### ReplicatedFetch {#replicatedfetch}

レプリカから取得中のデータパーツの数。

### ReplicatedSend {#replicatedsend}

レプリカに送信中のデータパーツの数。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA スレッドプールのスレッド数。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

タスクを実行している RESTART REPLICA スレッドプールのスレッド数。

### RestoreThreads {#restorethreads}

RESTORE 用のスレッドプールのスレッド数。

### RestoreThreadsActive {#restorethreadsactive}

タスクを実行している RESTORE 用のスレッドプールのスレッド数。

### Revision {#revision}

サーバーのリビジョン。リリース版やリリース候補に対して毎回インクリメントされる番号です。パッチリリースは除きます。

### S3Requests {#s3requests}

S3 リクエスト。

### SendExternalTables {#sendexternaltables}

リモートサーバーに外部テーブルのデータを送信している接続の数。外部テーブルは、分散サブクエリで GLOBAL IN および GLOBAL JOIN 演算子を実装するために使用されます。

### SendScalars {#sendscalars}

リモートサーバーにスカラーのデータを送信している接続の数。

### StorageBufferBytes {#storagebufferbytes}

バッファテーブルのバッファ内のバイト数。

### StorageBufferRows {#storagebufferrows}

バッファテーブルのバッファ内の行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed スレッドプールのスレッド数。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

タスクを実行している StorageDistributed スレッドプールのスレッド数。

### StorageHiveThreads {#storagehivethreads}

StorageHive スレッドプールのスレッド数。

### StorageHiveThreadsActive {#storagehivethreadsactive}

タスクを実行している StorageHive スレッドプールのスレッド数。

### StorageS3Threads {#storages3threads}

StorageS3 スレッドプールのスレッド数。

### StorageS3ThreadsActive {#storages3threadsactive}

タスクを実行している StorageS3 スレッドプールのスレッド数。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas スレッドプールのスレッド数。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

タスクを実行している system.replicas スレッドプールのスレッド数。

### TCPConnection {#tcpconnection}

TCP サーバーへの接続の数（ネイティブインターフェースを持つクライアント）、サーバー間の分散クエリ接続も含まれます。

### TablesToDropQueueSize {#tablestodropqueuesize}

バックグラウンドデータ削除を待機しているドロップされたテーブルの数。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

外部集約のために作成された一時ファイルの数。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

JOIN のために作成された一時ファイルの数。

### TemporaryFilesForSort {#temporaryfilesforsort}

外部ソートのために作成された一時ファイルの数。

### TemporaryFilesUnknown {#temporaryfilesunknown}

知られざる目的で作成された一時ファイルの数。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

local_filesystem_read_method=threadpool 用のスレッドプールのスレッド数。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

タスクを実行している local_filesystem_read_method=threadpool 用のスレッドプールのスレッド数。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

remote_filesystem_read_method=threadpool 用のスレッドプールのスレッド数。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

タスクを実行している remote_filesystem_read_method=threadpool 用のスレッドプールのスレッド数。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

OvercommitTracker 内で待機しているスレッドの数。

### TotalTemporaryFiles {#totaltemporaryfiles}

作成された一時ファイルの数。

### VersionInteger {#versioninteger}

サーバーのバージョンを1つの整数番号で表したもの（基数1000）。たとえば、バージョン 11.22.33 は 11022033 に変換されます。

### Write {#write}

飛行中の書き込み (write, pwrite, io_getevents など) システムコールの数。

### ZooKeeperRequest {#zookeeperrequest}

飛行中の ZooKeeper へのリクエストの数。

### ZooKeeperSession {#zookeepersession}

ZooKeeper へのセッション（接続）の数。一つ以上ではないはずです。なぜなら、ZooKeeper に対して複数の接続を使用すると、ZooKeeper の一貫性モデルが許可する古い読み取り（線形性の欠如）によりバグが発生する可能性があるためです。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper におけるウォッチ（イベントサブスクリプション）の数。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

取得された CPU スロットの総数。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU スロットの数に対するソフト制限の値。

**参照**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリクスを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` からのメトリクス値の履歴を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
