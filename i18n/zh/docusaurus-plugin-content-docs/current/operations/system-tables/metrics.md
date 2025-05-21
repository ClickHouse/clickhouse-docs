---
'description': 'System table containing metrics which can be calculated instantly,
  or have a current value.'
'keywords':
- 'system table'
- 'metrics'
'slug': '/operations/system-tables/metrics'
'title': '系统.metrics'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metrics

<SystemTableCloud/>

包含可即时计算的指标或者当前值。例如，同时处理的查询数量或当前副本延迟。该表始终保持最新。

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

聚合线程池中的线程数量。

### AggregatorThreadsActive {#aggregatorthreadsactive}

在聚合线程池中正在运行任务的线程数量。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

异步加载前台线程池中的线程数量。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

在异步加载前台线程池中正在运行任务的线程数量。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

异步加载后台线程池中的线程数量。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

在异步加载后台线程池中正在运行任务的线程数量。

### AsyncInsertCacheSize {#asyncinsertcachesize}

缓存中异步插入哈希 ID 的数量。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

异步插入线程池中的线程数量。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

在异步插入线程池中正在运行任务的线程数量。

### AsynchronousReadWait {#asynchronousreadwait}

等待异步读取的线程数量。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

背景缓冲刷新调度池中任务的数量限制。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

背景缓冲刷新调度池中的 active 任务数量。此池用于定期缓冲刷新。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

相关背景池中任务的数量限制。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

相关背景池中的 active 任务数量。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

背景分布式调度池中任务的数量限制。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

背景分布式调度池中的 active 任务数量。此池用于在后台进行的分布式发送。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

相关背景池中同时提取的数量限制。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

相关背景池中的 active 提取数量。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

相关背景池中 active 合并和变更的数量限制。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

相关背景池中的 active 合并和变更数量。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

背景处理池中消息流的任务数量限制。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

背景处理池中消息流的 active 任务数量。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

背景处理池中移动任务的数量限制。

### BackgroundMovePoolTask {#backgroundmovepooltask}

背景处理池中移动任务的 active 任务数量。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

背景调度池中任务的数量限制。此池用于定期进行 ReplicatedMergeTree 任务，如清理旧的数据部分、修改数据部分、重新初始化副本等。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

背景调度池中的 active 任务数量。此池用于定期进行 ReplicatedMergeTree 任务，如清理旧的数据部分、修改数据部分、重新初始化副本等。

### BackupsIOThreads {#backupsiothreads}

备份 I/O 线程池中的线程数量。

### BackupsIOThreadsActive {#backupsiothreadsactive}

在备份 I/O 线程池中正在运行任务的线程数量。

### BackupsThreads {#backupsthreads}

备份线程池中的线程数量。

### BackupsThreadsActive {#backupsthreadsactive}

备份线程池中正在运行任务的线程数量。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

异步插入到分布式表中标记为损坏的文件数量。此指标在启动时从 0 开始。每个分片的文件数量相加。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

存在的分离缓存文件片段数量。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary 线程池中的线程数量。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

在 CacheDictionary 线程池中正在运行任务的线程数量。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries 更新队列中的 '批次'（一组键）数量。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries 更新队列中键的确切数量。

### CacheFileSegments {#cachefilesegments}

存在的缓存文件片段数量。

### ContextLockWait {#contextlockwait}

在上下文中等待锁的线程数量。这是全局锁。

### DDLWorkerThreads {#ddlworkerthreads}

DDLWorker 线程池中的线程数量，用于 ON CLUSTER 查询。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

在 DDLWorker 线程池中正在运行任务的线程数量，用于 ON CLUSTER 查询。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog 线程池中的线程数量。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

在 DatabaseCatalog 线程池中正在运行任务的线程数量。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk 线程池中的线程数量。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

在 DatabaseOnDisk 线程池中正在运行任务的线程数量。

### DelayedInserts {#delayedinserts}

由于 MergeTree 表中分区的 active 数据部分过多而被限制的 INSERT 查询数量。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

用于销毁聚合状态的线程池中的线程数量。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

在销毁聚合状态的线程池中正在运行任务的线程数量。

### DictCacheRequests {#dictcacherequests}

向缓存类型字典的数据源的请求数量。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage 的异步线程池中的线程数量。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

在 DiskObjectStorage 的异步线程池中正在运行任务的线程数量。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

为当前正在运行的后台合并保留的磁盘空间。它略高于当前合并部分的总大小。

### DistributedFilesToInsert {#distributedfilestoinsert}

待处理的文件数量，以便异步插入到分布式表中。每个分片的文件数量相加。

### DistributedSend {#distributedsend}

发送到远程服务器的连接数量，用于将 INSERT 进分布式表的数据进行发送。包括同步和异步模式。

### EphemeralNode {#ephemeralnode}

在 ZooKeeper 中持有的临时节点数量。

### FilesystemCacheElements {#filesystemcacheelements}

文件系统缓存元素（文件片段）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

活动缓存缓冲区的数量。

### FilesystemCacheSize {#filesystemcachesize}

文件系统缓存大小（字节）。

### GlobalThread {#globalthread}

全局线程池中的线程数量。

### GlobalThreadActive {#globalthreadactive}

在全局线程池中正在运行任务的线程数量。

### HTTPConnection {#httpconnection}

与 HTTP 服务器的连接数量。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary 线程池中的线程数量。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

在 HashedDictionary 线程池中正在运行任务的线程数量。

### IOPrefetchThreads {#ioprefetchthreads}

I/O 预取线程池中的线程数量。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

在 I/O 预取线程池中正在运行任务的线程数量。

### IOThreads {#iothreads}

I/O 线程池中的线程数量。

### IOThreadsActive {#iothreadsactive}

在 I/O 线程池中正在运行任务的线程数量。

### IOUringInFlightEvents {#iouringinflightevents}

正在进行的 io_uring SQE 数量。

### IOUringPendingEvents {#iouringpendingevents}

等待提交的 io_uring SQE 数量。

### IOWriterThreads {#iowriterthreads}

I/O 写入线程池中的线程数量。

### IOWriterThreadsActive {#iowriterthreadsactive}

在 I/O 写入线程池中正在运行任务的线程数量。

### InterserverConnection {#interserverconnection}

来自其他副本的连接数量，以提取部分数据。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Kafka 表当前分配的分区数量。

### KafkaBackgroundReads {#kafkabackgroundreads}

当前正在进行的后台读取数量（从 Kafka 加载物化视图）。

### KafkaConsumers {#kafkaconsumers}

活动 Kafka 消费者的数量。

### KafkaConsumersInUse {#kafkaconsumersinuse}

当前由直接或后台读取使用的消费者数量。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

具有某些分区分配的活动 Kafka 消费者的数量。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

活动 librdkafka 线程的数量。

### KafkaProducers {#kafkaproducers}

创建的活动 Kafka 生产者的数量。

### KafkaWrites {#kafkawrites}

当前运行的 Kafka 插入数量。

### KeeperAliveConnections {#keeperaliveconnections}

存活连接的数量。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未完成请求的数量。

### LocalThread {#localthread}

本地线程池中的线程数量。来自本地线程池的线程来自全局线程池。

### LocalThreadActive {#localthreadactive}

本地线程池中正在运行任务的线程数量。

### MMappedAllocBytes {#mmappedallocbytes}

mmapped 分配的字节总和。

### MMappedAllocs {#mmappedallocs}

mmapped 分配的总数量。

### MMappedFileBytes {#mmappedfilebytes}

mmapped 文件区域的总大小。

### MMappedFiles {#mmappedfiles}

mmapped 文件的总数量。

### MarksLoaderThreads {#marksloaderthreads}

加载标记的线程池中的线程数量。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

在加载标记的线程池中正在运行任务的线程数量。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker 处理的最大 DDL 条目。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

DDLWorker 推送到 ZooKeeper 的最大 DDL 条目。

### MemoryTracking {#memorytracking}

服务器分配的内存总量（字节）。

### Merge {#merge}

正在执行的后台合并数量。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

当前从远程服务器到发起服务器发送的关于数据部分集合的公告数量（针对 MergeTree 表）。在远程服务器端进行测量。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor 线程池中的线程数量。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

在 MergeTreeBackgroundExecutor 线程池中正在运行任务的线程数量。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor 线程池中的线程数量。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

在 MergeTreeDataSelectExecutor 线程池中正在运行任务的线程数量。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree 部件清理线程池中的线程数量。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

在 MergeTree 部件清理线程池中正在运行任务的线程数量。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree 部件加载线程池中的线程数量。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

在 MergeTree 部件加载线程池中正在运行任务的线程数量。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

当前从远程服务器返回到发起服务器的回调请求数量，以选择读取任务（用于 MergeTree 表）。在远程服务器端进行测量。

### Move {#move}

当前正在执行的移动数量。

### MySQLConnection {#mysqlconnection}

使用 MySQL 协议的客户端连接数量。

### NetworkReceive {#networkreceive}

从网络接收数据的线程数量。仅包含 ClickHouse 相关的网络交互，不包括第三方库。

### NetworkSend {#networksend}

向网络发送数据的线程数量。仅包含 ClickHouse 相关的网络交互，不包括第三方库。

### OpenFileForRead {#openfileforread}

打开以进行读取的文件数量。

### OpenFileForWrite {#openfileforwrite}

打开以进行写入的文件数量。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads 线程池中的线程数量。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

在 ParallelFormattingOutputFormatThreads 线程池中正在运行任务的线程数量。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat 线程池中的线程数量。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

在 ParallelParsingInputFormat 线程池中正在运行任务的线程数量。

### PartMutation {#partmutation}

变更数量（ALTER DELETE/UPDATE）。

### PartsActive {#partsactive}

当前和即将进行的 SELECT 使用的 active 数据部分。

### PartsCommitted {#partscommitted}

已废弃。请参见 PartsActive。

### PartsCompact {#partscompact}

紧凑部件。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

部分已移动到另一个磁盘，应该在自己的析构函数中删除。

### PartsDeleting {#partsdeleting}

不活动数据部分，具有身份引用计数，正在被清理器删除。

### PartsOutdated {#partsoutdated}

不活动数据部分，但可能仅由当前 SELECT 使用， SELECT 完成后可以删除。

### PartsPreActive {#partspreactive}

部分在 data_parts 中，但未用于 SELECT。

### PartsPreCommitted {#partsprecommitted}

已废弃。请参见 PartsPreActive。

### PartsTemporary {#partstemporary}

部分正在生成，未在 data_parts 列表中。

### PartsWide {#partswide}

宽部件。

### PendingAsyncInsert {#pendingasyncinsert}

等待刷新（flush）的异步插入数量。

### PostgreSQLConnection {#postgresqlconnection}

使用 PostgreSQL 协议的客户端连接数量。

### Query {#query}

正在执行的查询数量。

### QueryPreempted {#querypreempted}

由于 'priority' 设置而停止并等待的查询数量。

### QueryThread {#querythread}

正在处理查询的线程数量。

### RWLockActiveReaders {#rwlockactivereaders}

在表 RWLock 中持有读锁的线程数量。

### RWLockActiveWriters {#rwlockactivewriters}

在表 RWLock 中持有写锁的线程数量。

### RWLockWaitingReaders {#rwlockwaitingreaders}

在表 RWLock 上等待读取的线程数量。

### RWLockWaitingWriters {#rwlockwaitingwriters}

在表 RWLock 上等待写入的线程数量。

### Read {#read}

正在进行的读取（read, pread, io_getevents 等）系统调用数量。

### ReadTaskRequestsSent {#readtaskrequestssent}

当前从远程服务器返回到发起服务器的回调请求数量，以选择读取任务（针对 s3Cluster 表函数及类似功能）。在远程服务器端进行测量。

### ReadonlyReplica {#readonlyreplica}

当前因 ZooKeeper 会话丢失而处于只读状态的 Replicated 表数量，或因未配置 ZooKeeper 启动而导致。

### RemoteRead {#remoteread}

正在进行的远程读取数量。

### ReplicatedChecks {#replicatedchecks}

检查数据部分一致性的数量。

### ReplicatedFetch {#replicatedfetch}

从副本获取的数据部分数量。

### ReplicatedSend {#replicatedsend}

发送到副本的数据部分数量。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA 线程池中的线程数量。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

在 RESTART REPLICA 线程池中正在运行任务的线程数量。

### RestoreThreads {#restorethreads}

用于 RESTORE 的线程池中的线程数量。

### RestoreThreadsActive {#restorethreadsactive}

在 RESTORE 的线程池中正在运行任务的线程数量。

### Revision {#revision}

服务器的修订版本。它是每个发布或发布候选版本增加的数字，补丁发布除外。

### S3Requests {#s3requests}

S3 请求数量。

### SendExternalTables {#sendexternaltables}

发送外部表数据到远程服务器的连接数量。外部表用于实现具有分布式子查询的 GLOBAL IN 和 GLOBAL JOIN 操作符。

### SendScalars {#sendscalars}

发送标量数据到远程服务器的连接数量。

### StorageBufferBytes {#storagebufferbytes}

Buffer 表缓冲区中的字节数量。

### StorageBufferRows {#storagebufferrows}

Buffer 表缓冲区中的行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed 线程池中的线程数量。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

在 StorageDistributed 线程池中正在运行任务的线程数量。

### StorageHiveThreads {#storagehivethreads}

StorageHive 线程池中的线程数量。

### StorageHiveThreadsActive {#storagehivethreadsactive}

在 StorageHive 线程池中正在运行任务的线程数量。

### StorageS3Threads {#storages3threads}

StorageS3 线程池中的线程数量。

### StorageS3ThreadsActive {#storages3threadsactive}

在 StorageS3 线程池中正在运行任务的线程数量。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas 线程池中的线程数量。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

在 system.replicas 线程池中正在运行任务的线程数量。

### TCPConnection {#tcpconnection}

与 TCP 服务器的连接数量（具有本地接口的客户端），包括服务器-服务器的分布式查询连接。

### TablesToDropQueueSize {#tablestodropqueuesize}

等待后台数据删除的已删除表的数量。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

为外部聚合创建的临时文件数量。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

为 JOIN 创建的临时文件数量。

### TemporaryFilesForSort {#temporaryfilesforsort}

为外部排序创建的临时文件数量。

### TemporaryFilesUnknown {#temporaryfilesunknown}

创建但目的不明的临时文件数量。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

用于 local_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

在 local_filesystem_read_method=threadpool 的线程池中正在运行任务的线程数量。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

用于 remote_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

在 remote_filesystem_read_method=threadpool 的线程池中正在运行任务的线程数量。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

在 OvercommitTracker 内的等待线程数量。

### TotalTemporaryFiles {#totaltemporaryfiles}

创建的临时文件总数。

### VersionInteger {#versioninteger}

以一个单一整数表示的服务器版本，基数为 1000。例如，版本 11.22.33 转换为 11022033。

### Write {#write}

正在进行的写入（write, pwrite, io_getevents 等）系统调用数量。

### ZooKeeperRequest {#zookeeperrequest}

正在进行的对 ZooKeeper 的请求数量。

### ZooKeeperSession {#zookeepersession}

与 ZooKeeper 的会话（连接）数量。应该不超过一个，因为使用多个 ZooKeeper 连接可能会导致由于缺乏线性性而出现错误（过时读取），这是 ZooKeeper 一致性模型所允许的。

### ZooKeeperWatch {#zookeeperwatch}

在 ZooKeeper 中的观察（事件订阅）数量。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

总获得的 CPU 插槽数量。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU 插槽数量的软限制值。

**另请参阅**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的事件数量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含表 `system.metrics` 和 `system.events` 的指标值历史记录。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
