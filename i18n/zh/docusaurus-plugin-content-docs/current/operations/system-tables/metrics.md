---
'description': '系统表包含可以立即计算的指标，或具有当前值的指标。'
'keywords':
- 'system table'
- 'metrics'
'slug': '/operations/system-tables/metrics'
'title': 'system.metrics'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metrics

<SystemTableCloud/>

包含可以即时计算的指标，或具有当前值的指标。例如，同时处理的查询数量或当前副本延迟。此表始终是最新的。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` 的别名。

您可以在源文件 [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) 中找到所有支持的指标。

**示例**

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

## 指标描述 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

聚合器线程池中的线程数量。

### AggregatorThreadsActive {#aggregatorthreadsactive}

聚合器线程池中正在运行任务的线程数量。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

异步加载器前台线程池中的线程数量。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

异步加载器前台线程池中正在运行任务的线程数量。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

异步加载器后台线程池中的线程数量。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

异步加载器后台线程池中正在运行任务的线程数量。

### AsyncInsertCacheSize {#asyncinsertcachesize}

缓存中异步插入的哈希 ID 数量

### AsynchronousInsertThreads {#asynchronousinsertthreads}

异步插入线程池中的线程数量。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

异步插入线程池中正在运行任务的线程数量。

### AsynchronousReadWait {#asynchronousreadwait}

等待异步读取的线程数量。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

后台缓冲区刷新调度池中任务的数量限制

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

后台缓冲区刷新调度池中活动任务的数量。此池用于定期刷新缓冲区。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

相关背景池中任务的数量限制

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

相关背景池中活动任务的数量

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

后台分布式调度池中任务的数量限制

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

后台分布式调度池中活动任务的数量。此池用于在后台进行的分布式发送。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

相关背景池中同时提取的限制

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

相关背景池中活动提取的数量

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

相关背景池中活动合并和变更的限制

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

相关背景池中活动合并和变更的数量

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

后台处理池中消息流的任务数量限制

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

后台处理池中消息流的活动任务数量

### BackgroundMovePoolSize {#backgroundmovepoolsize}

后台处理池中移动的任务数量限制

### BackgroundMovePoolTask {#backgroundmovepooltask}

后台处理池中活动移动任务的数量

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

后台调度池中任务的数量限制。此池用于定期的 ReplicatedMergeTree 任务，如清理旧的数据部分、修改数据部分、复制副本重新初始化等。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

后台调度池中活动任务的数量。此池用于定期的 ReplicatedMergeTree 任务，如清理旧的数据部分、修改数据部分、复制副本重新初始化等。

### BackupsIOThreads {#backupsiothreads}

备份 I/O 线程池中的线程数量。

### BackupsIOThreadsActive {#backupsiothreadsactive}

备份 I/O 线程池中正在运行任务的线程数量。

### BackupsThreads {#backupsthreads}

备份线程的线程池中线程数量。

### BackupsThreadsActive {#backupsthreadsactive}

备份线程池中正在运行任务的线程数量。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

已标记为损坏的、用于异步插入到分布式表中的文件数量。此指标将从启动时的 0 开始。每个分片的文件数量被汇总。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

存在的分离缓存文件段的数量

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary 线程池中的线程数量。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

CacheDictionary 线程池中正在运行任务的线程数量。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries 中更新队列中的“批次”（一组键）数量。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries 中更新队列中的键的确切数量。

### CacheFileSegments {#cachefilesegments}

存在的缓存文件段的数量

### ContextLockWait {#contextlockwait}

等待在上下文中锁定的线程数量。这是全局锁定。

### DDLWorkerThreads {#ddlworkerthreads}

DDLWorker 线程池中用于 ON CLUSTER 查询的线程数量。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

DDLWorker 线程池中正在运行任务的线程数量。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog 线程池中的线程数量。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

DatabaseCatalog 线程池中正在运行任务的线程数量。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk 线程池中的线程数量。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

DatabaseOnDisk 线程池中正在运行任务的线程数量。

### DelayedInserts {#delayedinserts}

由于 MergeTree 表中分区的活跃数据部分数量过多而被限制的 INSERT 查询数量。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

用于销毁聚合状态的线程池中的线程数量。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

用于销毁聚合状态的线程池中正在运行任务的线程数量。

### DictCacheRequests {#dictcacherequests}

飞行中到字典的数据源的请求数量。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

用于 DiskObjectStorage 的异步线程池中的线程数量。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

用于 DiskObjectStorage 的异步线程池中正在运行任务的线程数量。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

当前正在进行的后台合并预留的磁盘空间。它略高于当前正在合并部分的总大小。

### DistributedFilesToInsert {#distributedfilestoinsert}

待处理的文件数量，用于异步插入到分布式表中。每个分片的文件数量被汇总。

### DistributedSend {#distributedsend}

连接到远程服务器的数量，这些服务器正在发送插入到分布式表中的数据。包括同步和异步模式。

### EphemeralNode {#ephemeralnode}

ZooKeeper 中持有的临时节点数量。

### FilesystemCacheElements {#filesystemcacheelements}

文件系统缓存元素（文件段）

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

活动缓存缓冲区的数量

### FilesystemCacheSize {#filesystemcachesize}

文件系统缓存的字节大小

### GlobalThread {#globalthread}

全局线程池中的线程数量。

### GlobalThreadActive {#globalthreadactive}

全局线程池中正在运行任务的线程数量。

### HTTPConnection {#httpconnection}

与 HTTP 服务器的连接数量

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary 线程池中的线程数量。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

HashedDictionary 线程池中正在运行任务的线程数量。

### IOPrefetchThreads {#ioprefetchthreads}

I/O 预取线程池中的线程数量。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

I/O 预取线程池中正在运行任务的线程数量。

### IOThreads {#iothreads}

I/O 线程池中的线程数量。

### IOThreadsActive {#iothreadsactive}

I/O 线程池中正在运行任务的线程数量。

### IOUringInFlightEvents {#iouringinflightevents}

在飞行中的 io_uring SQE 的数量

### IOUringPendingEvents {#iouringpendingevents}

等待提交的 io_uring SQE 的数量

### IOWriterThreads {#iowriterthreads}

I/O 写入线程池中的线程数量。

### IOWriterThreadsActive {#iowriterthreadsactive}

I/O 写入线程池中正在运行任务的线程数量。

### InterserverConnection {#interserverconnection}

从其他副本获取部分的连接数量。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Kafka 表当前分配的分区数量

### KafkaBackgroundReads {#kafkabackgroundreads}

当前工作的后台读取数量（从 Kafka 填充物化视图）

### KafkaConsumers {#kafkaconsumers}

活动的 Kafka 消费者数量

### KafkaConsumersInUse {#kafkaconsumersinuse}

当前由直接或后台读取使用的消费者数量

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

具有某些分区分配的活跃 Kafka 消费者数量。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

活动的 librdkafka 线程数量

### KafkaProducers {#kafkaproducers}

创建的活动 Kafka 生产者数量

### KafkaWrites {#kafkawrites}

当前向 Kafka 进行的插入数量

### KeeperAliveConnections {#keeperaliveconnections}

活动连接的数量

### KeeperOutstandingRequests {#keeperoutstandingrequests}

待处理请求的数量

### LocalThread {#localthread}

本地线程池中的线程数量。本地线程池中的线程是从全局线程池中提取的。

### LocalThreadActive {#localthreadactive}

本地线程池中正在运行任务的线程数量。

### MMappedAllocBytes {#mmappedallocbytes}

内存映射分配的总字节数

### MMappedAllocs {#mmappedallocs}

内存映射分配的总数量

### MMappedFileBytes {#mmappedfilebytes}

内存映射文件区域的总大小。

### MMappedFiles {#mmappedfiles}

内存映射文件的总数量。

### MarksLoaderThreads {#marksloaderthreads}

用于加载标记的线程池中的线程数量。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

用于加载标记的线程池中正在运行任务的线程数量。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker 的最大处理 DDL 条目。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

推送到 ZooKeeper 的最大 DDL 条目。

### MemoryTracking {#memorytracking}

服务器分配的总内存量（字节）。

### Merge {#merge}

正在执行的后台合并数量

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

从远程服务器到发起服务器正在飞行的公告数量，关于数据部分集合（针对 MergeTree 表）。在远程服务器端测量。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor 线程池中的线程数量。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

MergeTreeBackgroundExecutor 线程池中正在运行任务的线程数量。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor 线程池中的线程数量。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

MergeTreeDataSelectExecutor 线程池中正在运行任务的线程数量。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree 部分清理线程池中的线程数量。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

MergeTree 部分清理线程池中正在运行任务的线程数量。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree 部分加载器线程池中的线程数量。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

MergeTree 部分加载器线程池中正在运行任务的线程数量。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

正在飞行的回调请求的当前数量，从远程服务器返回到发起服务器以选择读取任务（针对 MergeTree 表）。在远程服务器端测量。

### Move {#move}

当前执行的移动数量

### MySQLConnection {#mysqlconnection}

使用 MySQL 协议的客户端连接数量

### NetworkReceive {#networkreceive}

接收网络数据的线程数量。仅包括与 ClickHouse 相关的网络交互，不包括第三方库。

### NetworkSend {#networksend}

发送数据到网络的线程数量。仅包括与 ClickHouse 相关的网络交互，不包括第三方库。

### OpenFileForRead {#openfileforread}

打开以供读取的文件数量

### OpenFileForWrite {#openfileforwrite}

打开以供写入的文件数量

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads 线程池中的线程数量。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

ParallelFormattingOutputFormatThreads 线程池中正在运行任务的线程数量。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat 线程池中的线程数量。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

ParallelParsingInputFormat 线程池中正在运行任务的线程数量。

### PartMutation {#partmutation}

变更数量（ALTER DELETE/UPDATE）

### PartsActive {#partsactive}

活跃数据部分，当前和即将进行的 SELECTs 使用。

### PartsCommitted {#partscommitted}

已弃用。请参见 PartsActive。

### PartsCompact {#partscompact}

紧凑部分。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

部分已移至另一个磁盘，并应在其析构函数中删除。

### PartsDeleting {#partsdeleting}

非活动数据部分，带有身份引用计数，当前正在被清理器删除。

### PartsOutdated {#partsoutdated}

非活动数据部分，但仅可用于当前 SELECTs，SELECT 完成后可删除。

### PartsPreActive {#partspreactive}

部分在 data_parts 中，但未用于 SELECTs。

### PartsPreCommitted {#partsprecommitted}

已弃用。请参见 PartsPreActive。

### PartsTemporary {#partstemporary}

部分现在正在生成，未在 data_parts 列表中。

### PartsWide {#partswide}

宽部分。

### PendingAsyncInsert {#pendingasyncinsert}

等待刷新状态的异步插入数量。

### PostgreSQLConnection {#postgresqlconnection}

使用 PostgreSQL 协议的客户端连接数量

### Query {#query}

正在执行的查询数量

### QueryPreempted {#querypreempted}

因“优先级”设置而停止和等待的查询数量。

### QueryThread {#querythread}

查询处理线程的数量

### RWLockActiveReaders {#rwlockactivereaders}

持有表 RWLock 中读锁的线程数量。

### RWLockActiveWriters {#rwlockactivewriters}

持有表 RWLock 中写锁的线程数量。

### RWLockWaitingReaders {#rwlockwaitingreaders}

在表 RWLock 中等待读取的线程数量。

### RWLockWaitingWriters {#rwlockwaitingwriters}

在表 RWLock 中等待写入的线程数量。

### Read {#read}

正在飞行中的读取（read, pread, io_getevents 等）系统调用数量

### ReadTaskRequestsSent {#readtaskrequestssent}

从远程服务器返回到发起服务器的正在飞行的回调请求的当前数量，以选择读取任务（针对 s3Cluster 表函数和类似功能）。在远程服务器端测量。

### ReadonlyReplica {#readonlyreplica}

由于 ZooKeeper 会话丢失后重新初始化或启动时未配置 ZooKeeper，目前处于只读状态的 Replicated 表数量。

### RemoteRead {#remoteread}

正在飞行中的远程读取数量

### ReplicatedChecks {#replicatedchecks}

检查数据部分一致性的数量

### ReplicatedFetch {#replicatedfetch}

从副本中提取的数据部分数量

### ReplicatedSend {#replicatedsend}

发送到副本的数据部分数量

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA 线程池中的线程数量。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

RESTART REPLICA 线程池中正在运行任务的线程数量。

### RestoreThreads {#restorethreads}

用于 RESTORE 的线程池中的线程数量。

### RestoreThreadsActive {#restorethreadsactive}

用于 RESTORE 的线程池中正在运行任务的线程数量。

### Revision {#revision}

服务器的修订版。它是一个数字，每次发布或发布候选版本（除补丁发布外）都递增。

### S3Requests {#s3requests}

S3 请求

### SendExternalTables {#sendexternaltables}

为外部表向远程服务器发送数据的连接数量。外部表用于实现带有分布式子查询的 GLOBAL IN 和 GLOBAL JOIN 操作符。

### SendScalars {#sendscalars}

为标量向远程服务器发送数据的连接数量。

### StorageBufferBytes {#storagebufferbytes}

Buffer 表中缓冲区的字节数

### StorageBufferRows {#storagebufferrows}

Buffer 表中缓冲区的行数

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed 线程池中的线程数量。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

StorageDistributed 线程池中正在运行任务的线程数量。

### StorageHiveThreads {#storagehivethreads}

StorageHive 线程池中的线程数量。

### StorageHiveThreadsActive {#storagehivethreadsactive}

StorageHive 线程池中正在运行任务的线程数量。

### StorageS3Threads {#storages3threads}

StorageS3 线程池中的线程数量。

### StorageS3ThreadsActive {#storages3threadsactive}

StorageS3 线程池中正在运行任务的线程数量。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas 线程池中的线程数量。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

system.replicas 线程池中正在运行任务的线程数量。

### TCPConnection {#tcpconnection}

与 TCP 服务器（使用原生接口的客户端）的连接数量，包括服务器与服务器间的分布式查询连接

### TablesToDropQueueSize {#tablestodropqueuesize}

等待后台数据删除的已删除表的数量。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

为外部聚合创建的临时文件数量

### TemporaryFilesForJoin {#temporaryfilesforjoin}

为 JOIN 创建的临时文件数量

### TemporaryFilesForSort {#temporaryfilesforsort}

为外部排序创建的临时文件数量

### TemporaryFilesUnknown {#temporaryfilesunknown}

创建但没有已知用途的临时文件数量

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

本地_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

本地_filesystem_read_method=threadpool 的线程池中正在运行任务的线程数量。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

远程_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

远程_filesystem_read_method=threadpool 的线程池中正在运行任务的线程数量。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

在 OvercommitTracker 中等待的线程数量

### TotalTemporaryFiles {#totaltemporaryfiles}

创建的临时文件数量

### VersionInteger {#versioninteger}

服务器版本，以单个整数表示，基数为 1000。例如，版本 11.22.33 转换为 11022033。

### Write {#write}

正在飞行中的写入（write, pwrite, io_getevents 等）系统调用数量

### ZooKeeperRequest {#zookeeperrequest}

正在飞行中对 ZooKeeper 的请求数量。

### ZooKeeperSession {#zookeepersession}

与 ZooKeeper 的会话（连接）数量。应不超过一个，因为使用多个连接与 ZooKeeper 连接可能导致缺乏线性化（过时读取）导致的问题，ZooKeeper 一致性模型允许这种情况。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper 中观察（事件订阅）的数量。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

获得的 CPU 槽的总数量。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU 槽的软限制值。

**另请参阅**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的一系列事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自表 `system.metrics` 和 `system.events` 的指标值历史。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
