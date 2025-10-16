---
'description': 'システムテーブル。即座に計算できるメトリックや現在の値を持つメトリックを含みます。'
'keywords':
- 'system table'
- 'metrics'
'slug': '/operations/system-tables/metrics'
'title': 'system.metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';



# system.metrics

<SystemTableCloud/>

瞬時に計算できる、または現在の値を持つメトリックが含まれています。たとえば、同時に処理されるクエリの数や現在のレプリカの遅延などです。このテーブルは常に最新の状態です。

Columns:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリックの値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリックの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric`の別名。

サポートされているすべてのメトリックの詳細は、ソースファイル [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) で確認できます。

**Example**

```sql
SELECT * FROM system.metrics LIMIT 10
```

```text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ Number of executing queries                                            │
│ Merge                                │     0 │ Number of executing background merges                                  │
│ PartMutation                         │     0 │ Number of mutations (ALTER DELETE/UPDATE)                              │
│ ReplicatedFetch                      │     0 │ Number of data parts being fetched from replicas                       │
│ ReplicatedSend                       │     0 │ Number of data parts being sent to replicas                            │
│ ReplicatedChecks                     │     0 │ Number of data parts checking for consistency                          │
│ BackgroundMergesAndMutationsPoolTask │     0 │ Number of active merges and mutations in an associated background pool │
│ BackgroundFetchesPoolTask            │     0 │ Number of active fetches in an associated background pool              │
│ BackgroundCommonPoolTask             │     0 │ Number of active tasks in an associated background pool                │
│ BackgroundMovePoolTask               │     0 │ Number of active tasks in BackgroundProcessingPool for moves           │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## Metric descriptions {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Aggregatorスレッドプール内のスレッド数。

### AggregatorThreadsActive {#aggregatorthreadsactive}

タスクを実行中のAggregatorスレッドプール内のスレッド数。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

非同期ローダー前景スレッドプール内のスレッド数。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

タスクを実行中の非同期ローダー前景スレッドプール内のスレッド数。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

非同期ローダー背景スレッドプール内のスレッド数。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

タスクを実行中の非同期ローダー背景スレッドプール内のスレッド数。

### AsyncInsertCacheSize {#asyncinsertcachesize}

キャッシュ内の非同期挿入ハッシュIDの数。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

非同期挿入スレッドプール内のスレッド数。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

タスクを実行中の非同期挿入スレッドプール内のスレッド数。

### AsynchronousReadWait {#asynchronousreadwait}

非同期読み取りを待っているスレッド数。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

BackgroundBufferFlushSchedulePool内のタスク数の制限。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

BackgroundBufferFlushSchedulePool内のアクティブタスク数。このプールは定期的なバッファフラッシュに使用されます。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

関連するバックグラウンドプール内のタスク数の制限。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

関連するバックグラウンドプール内のアクティブタスク数。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

BackgroundDistributedSchedulePool内のタスク数の制限。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

BackgroundDistributedSchedulePool内のアクティブタスク数。このプールはバックグラウンドで実行される分散送信に使用されます。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

関連するバックグラウンドプール内の同時フェッチ数の制限。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

関連するバックグラウンドプール内のアクティブフェッチ数。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

関連するバックグラウンドプール内のアクティブマージおよびミューテーションの数の制限。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

関連するバックグラウンドプール内のアクティブマージおよびミューテーションの数。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

メッセージストリーミングのためのBackgroundProcessingPool内のタスク数の制限。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

メッセージストリーミングのためのBackgroundProcessingPool内のアクティブタスク数。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

移動のためのBackgroundProcessingPool内のタスク数の制限。

### BackgroundMovePoolTask {#backgroundmovepooltask}

移動のためのBackgroundProcessingPool内のアクティブタスク数。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

BackgroundSchedulePool内のタスク数の制限。このプールは、古いデータパートのクリーンアップ、データパートの変更、レプリカの再初期化などの定期的なReplicatedMergeTreeタスクに使用されます。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

BackgroundSchedulePool内のアクティブタスク数。このプールは、古いデータパートのクリーンアップ、データパートの変更、レプリカの再初期化などの定期的なReplicatedMergeTreeタスクに使用されます。

### BackupsIOThreads {#backupsiothreads}

BackupsIOスレッドプール内のスレッド数。

### BackupsIOThreadsActive {#backupsiothreadsactive}

タスクを実行中のBackupsIOスレッドプール内のスレッド数。

### BackupsThreads {#backupsthreads}

バックアップ用のスレッドプール内のスレッド数。

### BackupsThreadsActive {#backupsthreadsactive}

タスクを実行中のバックアップスレッドプール内のスレッド数。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

破損としてマークされたDistributedテーブルへの非同期挿入用のファイル数。このメトリックは起動時に0から始まります。各シャードごとのファイル数が合算されます。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

既存のデタッチされたキャッシュファイルセグメントの数。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionaryスレッドプール内のスレッド数。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

タスクを実行中のCacheDictionaryスレッドプール内のスレッド数。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionariesのアップデートキュー内の'バッチ'（キーのセット）の数。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionariesのアップデートキュー内の正確なキー数。

### CacheFileSegments {#cachefilesegments}

既存のキャッシュファイルセグメントの数。

### ContextLockWait {#contextlockwait}

コンテキスト内のロックを待っているスレッド数。これは全体的なロックです。

### DDLWorkerThreads {#ddlworkerthreads}

ON CLUSTERクエリ用のDDLWorkerスレッドプール内のスレッド数。

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

MergeTreeテーブルのパーティションに対してアクティブなデータパーツの数が多いために制限されたINSERTクエリの数。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

集約状態を破棄するためのスレッドプール内のスレッド数。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

タスクを実行中の集約状態を破棄するためのスレッドプール内のスレッド数。

### DictCacheRequests {#dictcacherequests}

キャッシュタイプの辞書のデータソースへのフライ中のリクエスト数。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorageの非同期スレッドプール内のスレッド数。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

タスクを実行中のDiskObjectStorage非同期スレッドプール内のスレッド数。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

現在実行中のバックグラウンドマージのために予約されたディスクスペース。このサイズは、現在マージ中のパーツの総サイズよりわずかに大きくなります。

### DistributedFilesToInsert {#distributedfilestoinsert}

Distributedテーブルへの非同期挿入用に処理待ちのファイル数。各シャードごとのファイル数が合算されます。

### DistributedSend {#distributedsend}

DistributedテーブルにINSERTされたデータを送信するためのリモートサーバーへの接続数。同期および非同期モードの両方。

### EphemeralNode {#ephemeralnode}

ZooKeeper内で保持されているエフェメラルノードの数。

### FilesystemCacheElements {#filesystemcacheelements}

ファイルセグメントのファイルシステムキャッシュ要素。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

アクティブなキャッシュバッファの数。

### FilesystemCacheSize {#filesystemcachesize}

バイト単位のファイルシステムキャッシュサイズ。

### QueryCacheBytes {#querycachebytes}

クエリキャッシュの合計サイズ（バイト）。

### QueryCacheEntries {#querycacheentries}

クエリキャッシュ内のエントリの合計数。

### UncompressedCacheBytes {#uncompressedcachebytes}

解凍されたキャッシュの合計サイズ（バイト）。解凍されたキャッシュは通常パフォーマンスを向上させず、主に避けるべきです。

### UncompressedCacheCells {#uncompressedcachecells}

### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JITコンパイルされたコードのキャッシュに使用されるバイトの合計。

### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JITコンパイルされたコードのキャッシュ内のエントリの合計数。

### MMapCacheCells {#mmapcachecells}

`mmap`（メモリにマップ）の状態のファイルの数。これは設定 `local_filesystem_read_method` が `mmap` に設定されているクエリに使用されます。`mmap` でオープンされたファイルは、高価なTLBフラッシュを避けるためにキャッシュに保持されます。

### MarkCacheBytes {#markcachebytes}

マークキャッシュの合計サイズ（バイト）。

### MarkCacheFiles {#markcachefiles}

マークキャッシュ内でキャッシュされているマークファイルの総数。

### GlobalThread {#globalthread}

グローバルスレッドプール内のスレッド数。

### GlobalThreadActive {#globalthreadactive}

タスクを実行中のグローバルスレッドプール内のスレッド数。

### HTTPConnection {#httpconnection}

HTTPサーバーへの接続数。

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

フライト中のio_uring SQEの数。

### IOUringPendingEvents {#iouringpendingevents}

送信待ちのio_uring SQEの数。

### IOWriterThreads {#iowriterthreads}

IOライタースレッドプール内のスレッド数。

### IOWriterThreadsActive {#iowriterthreadsactive}

タスクを実行中のIOライタースレッドプール内のスレッド数。

### InterserverConnection {#interserverconnection}

パーツを取得するための他のレプリカからの接続数。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

現在Kafkaテーブルに割り当てられているパーティションの数。

### KafkaBackgroundReads {#kafkabackgroundreads}

現在作業中のバックグラウンド読み取りの数（KafkaからMaterialized Viewsのポピュレート）。

### KafkaConsumers {#kafkaconsumers}

アクティブなKafkaコンシューマーの数。

### KafkaConsumersInUse {#kafkaconsumersinuse}

直接またはバックグラウンド読み取りで現在使用されているコンシューマーの数。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

いくつかのパーティションが割り当てられているアクティブなKafkaコンシューマーの数。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

アクティブなlibrdkafkaスレッドの数。

### KafkaProducers {#kafkaproducers}

作成されたアクティブなKafkaプロデューサーの数。

### KafkaWrites {#kafkawrites}

現在Kafkaへの挿入を実行している数。

### KeeperAliveConnections {#keeperaliveconnections}

アライブ接続数。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未処理のリクエスト数。

### LocalThread {#localthread}

ローカルスレッドプール内のスレッド数。ローカルスレッドプール内のスレッドはグローバルスレッドプールから取得されます。

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

マークを読み込むためのスレッドプール内のスレッド数。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

タスクを実行中のマークを読み込むためのスレッドプール内のスレッド数。

### MaxDDLEntryID {#maxddlentryid}

DDLWorkerの最大処理済みDDLエントリ。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

ZooKeeperにプッシュされたDDLWorkerの最大DDLエントリ。

### MemoryTracking {#memorytracking}

サーバーによって割り当てられたメモリの総量（バイト）。

### Merge {#merge}

実行中のバックグラウンドマージの数。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

リモートサーバーからイニシエーターサーバーにデータパーツのセットについて送信中のアナウンスの現在の数（MergeTreeテーブル用）。リモートサーバー側で測定されます。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutorスレッドプール内のスレッド数。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

タスクを実行中のMergeTreeBackgroundExecutorスレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutorスレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

タスクを実行中のMergeTreeDataSelectExecutorスレッドプール内のスレッド数。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTreeパーツクリーナー用のスレッドプール内のスレッド数。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

タスクを実行中のMergeTreeパーツクリーナー用のスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTreeパーツローダー用のスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

タスクを実行中のMergeTreeパーツローダー用のスレッドプール内のスレッド数。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

リモートサーバーからイニシエーターサーバーに読み取りタスクを選択するために送信中のコールバックリクエストの現在の数（MergeTreeテーブル用）。リモートサーバー側で測定されます。

### Move {#move}

現在実行中の移動の数。

### MySQLConnection {#mysqlconnection}

MySQLプロトコルを使用しているクライアント接続の数。

### NetworkReceive {#networkreceive}

ネットワークからデータを受信するスレッドの数。ClickHouse関連のネットワーク相互作用のみが含まれ、サードパーティのライブラリによる相互作用は含まれません。

### NetworkSend {#networksend}

ネットワークにデータを送信するスレッドの数。ClickHouse関連のネットワーク相互作用のみが含まれ、サードパーティのライブラリによる相互作用は含まれません。

### OpenFileForRead {#openfileforread}

読み取り用にオープンされているファイルの数。

### OpenFileForWrite {#openfileforwrite}

書き込み用にオープンされているファイルの数。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreadsスレッドプール内のスレッド数。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

タスクを実行中のParallelFormattingOutputFormatThreadsスレッドプール内のスレッド数。

### PartMutation {#partmutation}

ミューテーションの数（ALTER DELETE/UPDATE）。

### PartsActive {#partsactive}

現在および今後のSELECTで使用されるアクティブなデータパーツ。

### PartsCommitted {#partscommitted}

非推奨。同 PartsActive を参照してください。

### PartsCompact {#partscompact}

コンパクトなパーツ。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

パーツが別のディスクに移動され、独自のデストラクタで削除されるべきです。

### PartsDeleting {#partsdeleting}

現在クリーンアップによって削除されている非アクティブなデータパーツ（アイデンティティ参照カウンタ付き）。

### PartsOutdated {#partsoutdated}

アクティブではないデータパーツですが、現在のSELECTのみに使用され、SELECTが完了した後に削除される可能性があります。

### PartsPreActive {#partspreactive}

パーツはdata_partsにありますが、SELECTでは使用されていません。

### PartsPreCommitted {#partsprecommitted}

非推奨。同 PartsPreActive を参照してください。

### PartsTemporary {#partstemporary}

パーツは現在生成中であり、data_partsリストにはありません。

### PartsWide {#partswide}

ワイドなパーツ。

### PendingAsyncInsert {#pendingasyncinsert}

フラッシュを待機している非同期挿入の数。

### PostgreSQLConnection {#postgresqlconnection}

PostgreSQLプロトコルを使用しているクライアント接続の数。

### Query {#query}

実行中のクエリの数。

### QueryPreempted {#querypreempted}

'priority'設定のために停止されて待機しているクエリの数。

### QueryThread {#querythread}

クエリ処理スレッドの数。

### RWLockActiveReaders {#rwlockactivereaders}

テーブルRWLock内で読み取りロックを保持しているスレッドの数。

### RWLockActiveWriters {#rwlockactivewriters}

テーブルRWLock内で書き込みロックを保持しているスレッドの数。

### RWLockWaitingReaders {#rwlockwaitingreaders}

テーブルRWLockでの読み取りを待機しているスレッドの数。

### RWLockWaitingWriters {#rwlockwaitingwriters}

テーブルRWLockでの書き込みを待機しているスレッドの数。

### Read {#read}

フライト中の読み取り（read, pread, io_getevents など）syscallの数。

### ReadTaskRequestsSent {#readtaskrequestssent}

リモートサーバーからイニシエーターサーバーに読み取りタスクを選択するために送信中のコールバックリクエストの現在の数（s3Clusterテーブル関数および類似のため）。リモートサーバー側で測定されます。

### ReadonlyReplica {#readonlyreplica}

ZooKeeperセッションの喪失後に再初期化されているため、現在読み取り専用状態にあるReplicatedテーブルの数。

### RemoteRead {#remoteread}

フライト中のリモートリーダーでの読み取りの数。

### ReplicatedChecks {#replicatedchecks}

整合性をチェックしているデータパーツの数。

### ReplicatedFetch {#replicatedfetch}

レプリカから取得中のデータパーツの数。

### ReplicatedSend {#replicatedsend}

レプリカに送信中のデータパーツの数。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICAスレッドプール内のスレッド数。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

タスクを実行中のRESTART REPLICAスレッドプール内のスレッド数。

### RestoreThreads {#restorethreads}

RESTORE用のスレッドプール内のスレッド数。

### RestoreThreadsActive {#restorethreadsactive}

タスクを実行中のRESTORE用のスレッドプール内のスレッド数。

### Revision {#revision}

サーバーのリビジョン。これは、リリースやリリース候補ごとに増加する数字で、パッチリリースを除きます。

### S3Requests {#s3requests}

S3リクエスト。

### SendExternalTables {#sendexternaltables}

外部テーブルにデータを送信するためのリモートサーバーへの接続数。外部テーブルは、分散サブクエリを使用したGLOBAL INやGLOBAL JOIN演算子を実装するために使用されます。

### SendScalars {#sendscalars}

スカラーにデータを送信するためのリモートサーバーへの接続数。

### StorageBufferBytes {#storagebufferbytes}

Bufferテーブルのバッファ内のバイト数。

### StorageBufferRows {#storagebufferrows}

Bufferテーブルのバッファ内の行数。

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

TCPサーバーへの接続数（ネイティブインターフェースを持つクライアント）、サーバー間の分散クエリ接続も含まれます。

### TablesToDropQueueSize {#tablestodropqueuesize}

バックグラウンドデータ削除を待機しているドロップ対象のテーブル数。

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

OvercommitTracker内で待機しているスレッドの数。

### TotalTemporaryFiles {#totaltemporaryfiles}

作成された一時ファイルの数。

### VersionInteger {#versioninteger}

サーバーのバージョンを1000ベースの単一整数として表したもの。たとえば、バージョン11.22.33は11022033に変換されます。

### Write {#write}

フライト中の書き込み（write, pwrite, io_geteventsなど）syscallの数。

### ZooKeeperRequest {#zookeeperrequest}

フライト中のZooKeeperへのリクエスト数。

### ZooKeeperSession {#zookeepersession}

ZooKeeperへのセッション（接続）の数。線形性の欠如によるバグを避けるため、1つより多くのZooKeeper接続を使用するべきではありません（古い読み取り）。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper内のウォッチ（イベント登録）の数。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

取得されたCPUスロットの合計数。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPUスロットの数のソフトリミットの値。

**See Also**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリックが含まれています。
- [system.events](/operations/system-tables/events) — 発生したイベントの数が含まれています。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` からのメトリックの値の履歴が含まれています。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
