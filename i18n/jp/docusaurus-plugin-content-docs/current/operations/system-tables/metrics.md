---
'description': 'System table containing metrics which can be calculated instantly,
  or have a current value.'
'keywords':
- 'system table'
- 'metrics'
'slug': '/operations/system-tables/metrics'
'title': 'system.metrics'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';



# system.metrics

<SystemTableCloud/>

即時に計算できるか、現在の値を持つメトリクスを含みます。例えば、同時に処理されているクエリの数や現在のレプリカ遅延などです。このテーブルは常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

すべてのサポートされているメトリクスはソースファイル [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) で確認できます。

**例**

```sql
SELECT * FROM system.metrics LIMIT 10
```

```text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ 実行中のクエリの数                                                │
│ Merge                                │     0 │ 実行中のバックグラウンドマージの数                                  │
│ PartMutation                         │     0 │ ミューテーション (ALTER DELETE/UPDATE) の数                         │
│ ReplicatedFetch                      │     0 │ レプリカから取得中のデータパーツの数                               │
│ ReplicatedSend                       │     0 │ レプリカに送信されているデータパーツの数                           │
│ ReplicatedChecks                     │     0 │ 一貫性を確認しているデータパーツの数                                 │
│ BackgroundMergesAndMutationsPoolTask │     0 │ 関連するバックグラウンドプール内のアクティブなマージとミューテーションの数 │
│ BackgroundFetchesPoolTask            │     0 │ 関連するバックグラウンドプール内のアクティブなフェッチの数        │
│ BackgroundCommonPoolTask             │     0 │ 関連するバックグラウンドプール内のアクティブなタスクの数          │
│ BackgroundMovePoolTask               │     0 │ 移動のための BackgroundProcessingPool 内のアクティブなタスクの数    │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## メトリクスの説明 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

Aggregator スレッドプール内のスレッド数。

### AggregatorThreadsActive {#aggregatorthreadsactive}

タスクを実行中の Aggregator スレッドプール内のスレッド数。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

非同期ローダーのフォアグラウンドスレッドプール内のスレッド数。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

タスクを実行中の非同期ローダーのフォアグラウンドスレッドプール内のスレッド数。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

非同期ローダーのバックグラウンドスレッドプール内のスレッド数。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

タスクを実行中の非同期ローダーのバックグラウンドスレッドプール内のスレッド数。

### AsyncInsertCacheSize {#asyncinsertcachesize}

キャッシュ内の非同期挿入ハッシュIDの数。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

非同期挿入スレッドプール内のスレッド数。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

タスクを実行中の非同期挿入スレッドプール内のスレッド数。

### AsynchronousReadWait {#asynchronousreadwait}

非同期読み取りを待機しているスレッドの数。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

BackgroundBufferFlushSchedulePool 内のタスクの制限数。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

BackgroundBufferFlushSchedulePool 内のアクティブなタスクの数。このプールは定期的なバッファフラッシュに使用されます。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

関連するバックグラウンドプール内のタスクの制限数。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

関連するバックグラウンドプール内のアクティブなタスクの数。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

BackgroundDistributedSchedulePool 内のタスクの制限数。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

バックグラウンドで行われる分散送信のために使用される BackgroundDistributedSchedulePool 内のアクティブなタスクの数。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

関連するバックグラウンドプール内の同時フェッチの制限数。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

関連するバックグラウンドプール内のアクティブなフェッチの数。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

関連するバックグラウンドプール内のアクティブなマージとミューテーションの制限数。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

関連するバックグラウンドプール内のアクティブなマージとミューテーションの数。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

メッセージストリーミングのための BackgroundProcessingPool 内のタスクの制限数。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

メッセージストリーミングのための BackgroundProcessingPool 内のアクティブなタスクの数。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

移動のための BackgroundProcessingPool 内のタスクの制限数。

### BackgroundMovePoolTask {#backgroundmovepooltask}

移動のための BackgroundProcessingPool 内のアクティブなタスクの数。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

定期的な ReplicatedMergeTree タスク （古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化など）のために使用される BackgroundSchedulePool 内のタスクの制限数。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

背景スケジュールプール内のアクティブなタスクの数。このプールは定期的な ReplicatedMergeTreeタスク、古いデータパーツのクリーンアップ、データパーツの変更、レプリカの再初期化などに使用されます。

### BackupsIOThreads {#backupsiothreads}

BackupsIO スレッドプール内のスレッド数。

### BackupsIOThreadsActive {#backupsiothreadsactive}

タスクを実行中の BackupsIO スレッドプール内のスレッド数。

### BackupsThreads {#backupsthreads}

BACKUP用のスレッドプール内のスレッド数。

### BackupsThreadsActive {#backupsthreadsactive}

タスクを実行中の BACKUP用のスレッドプール内のスレッド数。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

壊れたとしてマークされた分散テーブルへの非同期挿入用のファイルの数。このメトリクスは開始時に0から始まります。各シャードのファイルの数が合算されます。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

既存のデタッチされたキャッシュファイルセグメントの数。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary スレッドプール内のスレッド数。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

タスクを実行中の CacheDictionary スレッドプール内のスレッド数。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries 内の更新キューにある 'バッチ'（キーのセット）の数。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries 内の更新キューにあるキーの正確な数。

### CacheFileSegments {#cachefilesegments}

既存のキャッシュファイルセグメントの数。

### ContextLockWait {#contextlockwait}

コンテキスト内でロックを待機しているスレッドの数。このロックはグローバルロックです。

### DDLWorkerThreads {#ddlworkerthreads}

ON CLUSTER クエリ用の DDLWorker スレッドプール内のスレッド数。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

タスクを実行中の ON CLUSTER クエリ用の DDLWORKER スレッドプール内のスレッド数。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog スレッドプール内のスレッド数。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

タスクを実行中の DatabaseCatalog スレッドプール内のスレッド数。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk スレッドプール内のスレッド数。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

タスクを実行中の DatabaseOnDisk スレッドプール内のスレッド数。

### DelayedInserts {#delayedinserts}

MergeTree テーブル内のパーティションに対するアクティブなデータパーツの数が多いため、スロットルされている INSERT クエリの数。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

アグリゲート状態を破棄するためのスレッドプール内のスレッド数。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

タスクを実行中のアグリゲート状態を破棄するためのスレッドプール内のスレッド数。

### DictCacheRequests {#dictcacherequests}

キャッシュタイプの辞書のデータソースに対するフライ中のリクエストの数。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage 用の非同期スレッドプール内のスレッド数。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

タスクを実行中の DiskObjectStorage 用の非同期スレッドプール内のスレッド数。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

現在実行中のバックグラウンドマージのために予約されたディスクスペース。これは現在マージ中のパーツの総サイズよりも少し大きいです。

### DistributedFilesToInsert {#distributedfilestoinsert}

分散テーブルへの非同期挿入のために処理待ちのファイルの数。各シャードのファイルの数が合算されます。

### DistributedSend {#distributedsend}

分散テーブルに挿入されたデータを送信するリモートサーバーへの接続数。同期モードと非同期モードの両方を含みます。

### EphemeralNode {#ephemeralnode}

ZooKeeper 内に保持されたエフェメラルノードの数。

### FilesystemCacheElements {#filesystemcacheelements}

ファイルシステムキャッシュ要素（ファイルセグメント）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

アクティブなキャッシュバッファの数。

### FilesystemCacheSize {#filesystemcachesize}

バイト単位でのファイルシステムキャッシュサイズ。

### GlobalThread {#globalthread}

グローバルスレッドプール内のスレッド数。

### GlobalThreadActive {#globalthreadactive}

タスクを実行中のグローバルスレッドプール内のスレッド数。

### HTTPConnection {#httpconnection}

HTTPサーバーへの接続数。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary スレッドプール内のスレッド数。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

タスクを実行中の HashedDictionary スレッドプール内のスレッド数。

### IOPrefetchThreads {#ioprefetchthreads}

IO プリフェッチ スレッドプール内のスレッド数。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

タスクを実行中の IO プリフェッチ スレッドプール内のスレッド数。

### IOThreads {#iothreads}

IO スレッドプール内のスレッド数。

### IOThreadsActive {#iothreadsactive}

タスクを実行中の IO スレッドプール内のスレッド数。

### IOUringInFlightEvents {#iouringinflightevents}

フライト中の io_uring SQE の数。

### IOUringPendingEvents {#iouringpendingevents}

送信待ちの io_uring SQE の数。

### IOWriterThreads {#iowriterthreads}

IO ライタースレッドプール内のスレッド数。

### IOWriterThreadsActive {#iowriterthreadsactive}

タスクを実行中の IO ライタースレッドプール内のスレッド数。

### InterserverConnection {#interserverconnection}

パーツを取得するために他のレプリカからの接続数。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

現在割り当てられている Kafka テーブルのパーティション数。

### KafkaBackgroundReads {#kafkabackgroundreads}

現在動作しているバックグラウンド読み取りの数（Kafka からのマテリアライズドビューのポピュレート）。

### KafkaConsumers {#kafkaconsumers}

アクティブな Kafka 消費者の数。

### KafkaConsumersInUse {#kafkaconsumersinuse}

直接またはバックグラウンドの読み取りによって現在使用されている消費者の数。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

一部のパーティションが割り当てられているアクティブな Kafka 消費者の数。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

アクティブな librdkafka スレッドの数。

### KafkaProducers {#kafkaproducers}

作成されたアクティブな Kafka プロデューサーの数。

### KafkaWrites {#kafkawrites}

現在実行中の Kafka への挿入の数。

### KeeperAliveConnections {#keeperaliveconnections}

アライブな接続数。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未処理リクエストの数。

### LocalThread {#localthread}

ローカルスレッドプール内のスレッド数。ローカルスレッドプールのスレッドは、グローバルスレッドプールから取得されます。

### LocalThreadActive {#localthreadactive}

タスクを実行中のローカルスレッドプール内のスレッド数。

### MMappedAllocBytes {#mmappedallocbytes}

mmapped アロケーションの合計バイト数。

### MMappedAllocs {#mmappedallocs}

mmapped アロケーションの総数。

### MMappedFileBytes {#mmappedfilebytes}

mmapped ファイル領域の合計サイズ。

### MMappedFiles {#mmappedfiles}

mmapped ファイルの総数。

### MarksLoaderThreads {#marksloaderthreads}

マークをロードするためのスレッドプール内のスレッド数。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

タスクを実行中のマークをロードするためのスレッドプール内のスレッド数。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker が処理した最大 DDL エントリ ID。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

ZooKeeper にプッシュされた DDLWorker の最大 DDL エントリ ID。

### MemoryTracking {#memorytracking}

サーバーによって確保された総メモリ量（バイト）。

### Merge {#merge}

実行中のバックグラウンドマージの数。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

リモートサーバーからイニシエーターサーバーに送信中のデータパーツのセットに関するアナウンスメントの現在の数（MergeTree テーブル用）。リモートサーバー側で測定されています。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor スレッドプール内のスレッド数。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

タスクを実行中の MergeTreeBackgroundExecutor スレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor スレッドプール内のスレッド数。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

タスクを実行中の MergeTreeDataSelectExecutor スレッドプール内のスレッド数。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree パーツクリーナーのスレッドプール内のスレッド数。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

タスクを実行中の MergeTree パーツクリーナーのスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree パーツローダーのスレッドプール内のスレッド数。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

タスクを実行中の MergeTree パーツローダーのスレッドプール内のスレッド数。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

リモートサーバーからイニシエーターサーバーに戻るために送信されるコールバックリクエストの現在の数（MergeTree テーブル用）。リモートサーバー側で測定されています。

### Move {#move}

現在実行中の移動の数。

### MySQLConnection {#mysqlconnection}

MySQL プロトコルを使用しているクライアント接続の数。

### NetworkReceive {#networkreceive}

ネットワークからデータを受信しているスレッドの数。ClickHouse に関連するネットワークインタラクションのみが含まれ、第三者ライブラリによるものは含まれません。

### NetworkSend {#networksend}

ネットワークにデータを送信しているスレッドの数。ClickHouse に関連するネットワークインタラクションのみが含まれ、第三者ライブラリによるものは含まれません。

### OpenFileForRead {#openfileforread}

読み取りのために開いているファイルの数。

### OpenFileForWrite {#openfileforwrite}

書き込みのために開いているファイルの数。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads スレッドプール内のスレッド数。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

タスクを実行中の ParallelFormattingOutputFormatThreads スレッドプール内のスレッド数。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat スレッドプール内のスレッド数。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

タスクを実行中の ParallelParsingInputFormat スレッドプール内のスレッド数。

### PartMutation {#partmutation}

ミューテーション (ALTER DELETE/UPDATE) の数。

### PartsActive {#partsactive}

現在および今後の SELECT に使用されるアクティブなデータパート。

### PartsCommitted {#partscommitted}

非推奨。PartsActive を参照。

### PartsCompact {#partscompact}

コンパクトパーツ。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

パーツは別のディスクに移動され、独自のデストラクタで削除されるべきです。

### PartsDeleting {#partsdeleting}

アイデンティティ参照カウンタを持つ非アクティブデータパートで、現在クリーナーによって削除されているものです。

### PartsOutdated {#partsoutdated}

非アクティブなデータパートですが、現在の SELECT のみで使用される可能性があり、SELECT の終了後に削除される可能性があります。

### PartsPreActive {#partspreactive}

パーツは data_parts にありますが、SELECT には使用されていません。

### PartsPreCommitted {#partsprecommitted}

非推奨。PartsPreActive を参照。

### PartsTemporary {#partstemporary}

パーツは現在生成中で、data_parts リストには含まれていません。

### PartsWide {#partswide}

ワイドパーツ。

### PendingAsyncInsert {#pendingasyncinsert}

フラッシュを待機している非同期挿入の数。

### PostgreSQLConnection {#postgresqlconnection}

PostgreSQL プロトコルを使用しているクライアント接続の数。

### Query {#query}

実行中のクエリの数。

### QueryPreempted {#querypreempted}

'priority' 設定によって停止して待機しているクエリの数。

### QueryThread {#querythread}

クエリ処理スレッドの数。

### RWLockActiveReaders {#rwlockactivereaders}

テーブル RWLock で読み取りロックを保持しているスレッドの数。

### RWLockActiveWriters {#rwlockactivewriters}

テーブル RWLock で書き込みロックを保持しているスレッドの数。

### RWLockWaitingReaders {#rwlockwaitingreaders}

テーブル RWLock で読み取りを待機しているスレッドの数。

### RWLockWaitingWriters {#rwlockwaitingwriters}

テーブル RWLock で書き込みを待機しているスレッドの数。

### Read {#read}

フライト中の読み取り (read, pread, io_getevents など) システムコールの数。

### ReadTaskRequestsSent {#readtaskrequestssent}

s3Cluster テーブル関数と同様のために、リモートサーバーからイニシエーターサーバーに戻るために送信されるコールバックリクエストの現在の数。リモートサーバー側で測定されています。

### ReadonlyReplica {#readonlyreplica}

ZooKeeper セッションの喪失後の再初期化や、ZooKeeper の設定なしの起動のために現在 Readonly 状態にある Replicated テーブルの数。

### RemoteRead {#remoteread}

フライト中にリモートリーダーを使用した読み取りの数。

### ReplicatedChecks {#replicatedchecks}

一貫性を確認しているデータパーツの数。

### ReplicatedFetch {#replicatedfetch}

レプリカから取得中のデータパーツの数。

### ReplicatedSend {#replicatedsend}

レプリカに送信されているデータパーツの数。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA スレッドプール内のスレッド数。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

タスクを実行中の RESTART REPLICA スレッドプール内のスレッド数。

### RestoreThreads {#restorethreads}

RESTORE 用のスレッドプール内のスレッド数。

### RestoreThreadsActive {#restorethreadsactive}

タスクを実行中の RESTORE 用のスレッドプール内のスレッド数。

### Revision {#revision}

サーバーのリビジョン。これは、リリースやリリース候補ごとにインクリメントされる番号で、パッチリリースは除外されます。

### S3Requests {#s3requests}

S3 リクエストの数。

### SendExternalTables {#sendexternaltables}

リモートサーバーへの外部テーブルへのデータを送信している接続の数。外部テーブルは、分散サブクエリを持つ GLOBAL IN および GLOBAL JOIN 演算子を実装するために使用されます。

### SendScalars {#sendscalars}

リモートサーバーへのスカラーのデータを送信している接続の数。

### StorageBufferBytes {#storagebufferbytes}

バッファータブルのバッファ内のバイト数。

### StorageBufferRows {#storagebufferrows}

バッファータブルのバッファ内の行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed スレッドプール内のスレッド数。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

タスクを実行中の StorageDistributed スレッドプール内のスレッド数。

### StorageHiveThreads {#storagehivethreads}

StorageHive スレッドプール内のスレッド数。

### StorageHiveThreadsActive {#storagehivethreadsactive}

タスクを実行中の StorageHive スレッドプール内のスレッド数。

### StorageS3Threads {#storages3threads}

StorageS3 スレッドプール内のスレッド数。

### StorageS3ThreadsActive {#storages3threadsactive}

タスクを実行中の StorageS3 スレッドプール内のスレッド数。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas スレッドプール内のスレッド数。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

タスクを実行中の system.replicas スレッドプール内のスレッド数。

### TCPConnection {#tcpconnection}

TCP サーバーへの接続数 (ネイティブインターフェイスを持つクライアント)、サーバー間の分散クエリ接続も含まれます。

### TablesToDropQueueSize {#tablestodropqueuesize}

バックグラウンドデータ削除を待機しているドロップされたテーブルの数。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

外部集約のために作成された一時ファイルの数。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

JOIN のために作成された一時ファイルの数。

### TemporaryFilesForSort {#temporaryfilesforsort}

外部ソートのために作成された一時ファイルの数。

### TemporaryFilesUnknown {#temporaryfilesunknown}

目的が知られていない一時ファイルの数。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

local_filesystem_read_method=threadpool のスレッドプール内のスレッド数。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

タスクを実行中の local_filesystem_read_method=threadpool のスレッドプール内のスレッド数。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

remote_filesystem_read_method=threadpool のスレッドプール内のスレッド数。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

タスクを実行中の remote_filesystem_read_method=threadpool のスレッドプール内のスレッド数。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

OvercommitTracker 内で待機しているスレッドの数。

### TotalTemporaryFiles {#totaltemporaryfiles}

作成された一時ファイルの総数。

### VersionInteger {#versioninteger}

サーバーのバージョンを単一の整数番号で示したもの（基数1000）。例えば、バージョン 11.22.33 は 11022033 に変換されます。

### Write {#write}

フライト中の書き込み (write, pwrite, io_getevents など) システムコールの数。

### ZooKeeperRequest {#zookeeperrequest}

フライト中の ZooKeeper へのリクエストの数。

### ZooKeeperSession {#zookeepersession}

ZooKeeper へのセッション（接続）の数。1つ以上であるべきではなく、複数の接続を ZooKeeper に使用することは、ZooKeeper の一貫性モデルが許可する線形性の欠如（古い読み取りによるバグ）につながる可能性があります。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper 内のウォッチ（イベントサブスクリプション）の数。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

取得された CPU スロットの合計数。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU スロットの数に関するソフトリミットの値。

**参照**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリクスを含む。
- [system.events](/operations/system-tables/events) — 発生した多数のイベントを含む。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` と `system.events` テーブルからのメトリクス値の履歴を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 監視の基本概念。
