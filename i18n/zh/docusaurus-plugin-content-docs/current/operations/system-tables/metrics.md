---
description: '包含可以即时计算的指标，或具有当前值的系统表。'
slug: /operations/system-tables/metrics
title: 'system.metrics'
keywords: ['system table', 'metrics']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含可以即时计算的指标，或具有当前值的指标。例如，同时处理的查询数量或当前副本延迟。此表始终保持最新。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` 的别名。

您可以在源文件 [src/Common/CurrentMetrics.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/CurrentMetrics.cpp) 中找到所有支持的指标。

**示例**

``` sql
SELECT * FROM system.metrics LIMIT 10
```

``` text
┌─metric───────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────┐
│ Query                                │     1 │ 正在执行的查询数量                                                      │
│ Merge                                │     0 │ 正在执行的后台合并数量                                                  │
│ PartMutation                         │     0 │ 变更（ALTER DELETE/UPDATE）数量                                          │
│ ReplicatedFetch                      │     0 │ 从副本中获取的数据部件数量                                              │
│ ReplicatedSend                       │     0 │ 发送到副本的数据部件数量                                                │
│ ReplicatedChecks                     │     0 │ 检查一致性的数据部件数量                                                │
│ BackgroundMergesAndMutationsPoolTask │     0 │ 关联后台池中正在进行的合并和变更数量                                    │
│ BackgroundFetchesPoolTask            │     0 │ 关联后台池中正在进行的抓取数量                                          │
│ BackgroundCommonPoolTask             │     0 │ 关联后台池中正在进行的任务数量                                          │
│ BackgroundMovePoolTask               │     0 │ 在后台处理池中用于移动的活动任务数量                                    │
└──────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────┘
```

## 指标描述 {#metric-descriptions}

### AggregatorThreads {#aggregatorthreads}

聚合器线程池中的线程数量。

### AggregatorThreadsActive {#aggregatorthreadsactive}

正在运行任务的聚合器线程池中的线程数量。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

异步加载器前台线程池中的线程数量。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

正在运行任务的异步加载器前台线程池中的线程数量。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

异步加载器后台线程池中的线程数量。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

正在运行任务的异步加载器后台线程池中的线程数量。

### AsyncInsertCacheSize {#asyncinsertcachesize}

缓存中异步插入哈希 ID 的数量。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

异步插入线程池中的线程数量。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

正在运行任务的异步插入线程池中的线程数量。

### AsynchronousReadWait {#asynchronousreadwait}

等待异步读取的线程数量。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

后台缓冲区刷新调度池中任务的数量限制。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

后台缓冲区刷新调度池中活动任务的数量。此池用于周期性缓冲区刷新。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

关联后台池中任务的数量限制。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

关联后台池中活动任务的数量。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

后台分布式调度池中任务的数量限制。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

后台分布式调度池中活动任务的数量。此池用于在后台进行的分布式发送。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

关联后台池中同时抓取的数量限制。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

关联后台池中活动抓取的数量。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

关联后台池中活动合并和变更的数量限制。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

关联后台池中活动合并和变更的数量。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

后台处理池中消息流的任务数量限制。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

后台处理池中消息流的活动任务数量。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

后台处理池中移动的任务数量限制。

### BackgroundMovePoolTask {#backgroundmovepooltask}

后台处理池中移动的活动任务数量。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

后台调度池中任务的数量限制。此池用于周期性 ReplicatedMergeTree 任务，例如清理旧数据部件、改变数据部件、重新初始化副本等。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

后台调度池中活动任务的数量。此池用于周期性 ReplicatedMergeTree 任务，例如清理旧数据部件、改变数据部件、重新初始化副本等。

### BackupsIOThreads {#backupsiothreads}

备份输入/输出线程池中的线程数量。

### BackupsIOThreadsActive {#backupsiothreadsactive}

正在运行任务的备份输入/输出线程池中的线程数量。

### BackupsThreads {#backupsthreads}

备份线程池中的线程数量。

### BackupsThreadsActive {#backupsthreadsactive}

正在运行任务的备份线程池中的线程数量。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

已标记为损坏的待插入到分布式表中的文件数量。该指标在启动时从 0 开始。每个分片的文件数量进行汇总。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

现有的分离缓存文件片段数量。

### CacheDictionaryThreads {#cachedictionarythreads}

缓存字典线程池中的线程数量。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

正在运行任务的缓存字典线程池中的线程数量。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

缓存字典更新队列中的“批次”（一组键）数量。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

缓存字典更新队列中的确切键数量。

### CacheFileSegments {#cachefilesegments}

现有缓存文件片段数量。

### ContextLockWait {#contextlockwait}

等待上下文锁定的线程数量。这是全局锁。

### DDLWorkerThreads {#ddlworkerthreads}

DDLWorker 线程池中用于 ON CLUSTER 查询的线程数量。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

正在运行任务的 DDLWorker 线程池中的线程数量。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog 线程池中的线程数量。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

正在运行任务的 DatabaseCatalog 线程池中的线程数量。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk 线程池中的线程数量。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

正在运行任务的 DatabaseOnDisk 线程池中的线程数量。

### DelayedInserts {#delayedinserts}

由于 MergeTree 表中活动数据分区数量过多而被限制的 INSERT 查询数量。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

用于销毁聚合状态的线程池中的线程数量。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

正在运行任务的销毁聚合状态线程池中的线程数量。

### DictCacheRequests {#dictcacherequests}

对字典类缓存数据源的请求数量。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage 的异步线程池中的线程数量。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

正在运行任务的 DiskObjectStorage 的异步线程池中的线程数量。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

当前正在运行的后台合并所保留的磁盘空间。它略高于当前正在合并的部分的总大小。

### DistributedFilesToInsert {#distributedfilestoinsert}

待处理的分布式表中的异步插入文件数量。每个分片的文件数量进行汇总。

### DistributedSend {#distributedsend}

从远程服务器发送插入到分布式表中的数据的连接数量。包括同步和异步模式。

### EphemeralNode {#ephemeralnode}

在 ZooKeeper 中持有的短期节点数量。

### FilesystemCacheElements {#filesystemcacheelements}

文件系统缓存元素（文件片段）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

活动缓存缓冲区的数量。

### FilesystemCacheSize {#filesystemcachesize}

文件系统缓存的大小（字节）。

### GlobalThread {#globalthread}

全局线程池中的线程数量。

### GlobalThreadActive {#globalthreadactive}

正在运行任务的全局线程池中的线程数量。

### HTTPConnection {#httpconnection}

到 HTTP 服务器的连接数量。

### HashedDictionaryThreads {#hasheddictionarythreads}

哈希字典线程池中的线程数量。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

正在运行任务的哈希字典线程池中的线程数量。

### IOPrefetchThreads {#ioprefetchthreads}

输入输出预取线程池中的线程数量。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

正在运行任务的输入输出预取线程池中的线程数量。

### IOThreads {#iothreads}

输入输出线程池中的线程数量。

### IOThreadsActive {#iothreadsactive}

正在运行任务的输入输出线程池中的线程数量。

### IOUringInFlightEvents {#iouringinflightevents}

正在进行的 io_uring SQEs 数量。

### IOUringPendingEvents {#iouringpendingevents}

等待提交的 io_uring SQEs 数量。

### IOWriterThreads {#iowriterthreads}

输入输出写入线程池中的线程数量。

### IOWriterThreadsActive {#iowriterthreadsactive}

正在运行任务的输入输出写入线程池中的线程数量。

### InterserverConnection {#interserverconnection}

其他副本用于获取部分的连接数量。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Kafka 表当前分配的分区数量。

### KafkaBackgroundReads {#kafkabackgroundreads}

当前正在进行的后台读取数量（从 Kafka 填充物化视图）。

### KafkaConsumers {#kafkaconsumers}

活动 Kafka 消费者的数量。

### KafkaConsumersInUse {#kafkaconsumersinuse}

当前由直接或后台读取使用的消费者数量。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

具有某些分区分配的活动 Kafka 消费者数量。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

活动 librdkafka 线程数量。

### KafkaProducers {#kafkaproducers}

活动 Kafka 生产者创建的数量。

### KafkaWrites {#kafkawrites}

当前正在进行的 Kafka 插入数量。

### KeeperAliveConnections {#keeperaliveconnections}

活跃连接的数量。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未处理请求的数量。

### LocalThread {#localthread}

本地线程池中的线程数量。本地线程池中的线程来自于全局线程池。

### LocalThreadActive {#localthreadactive}

正在运行任务的本地线程池中的线程数量。

### MMappedAllocBytes {#mmappedallocbytes}

映射分配的总字节数。

### MMappedAllocs {#mmappedallocs}

映射分配的总数量。

### MMappedFileBytes {#mmappedfilebytes}

映射文件区域的总大小。

### MMappedFiles {#mmappedfiles}

映射文件的总数量。

### MarksLoaderThreads {#marksloaderthreads}

用于加载标记的线程池中的线程数量。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

正在运行任务的加载标记线程池中的线程数量。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker 的最大处理 DDL 条目。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

推送到 ZooKeeper 的 DDLWorker 最大 DDL 条目。

### MemoryTracking {#memorytracking}

服务器分配的总内存量（字节）。

### Merge {#merge}

正在执行的后台合并数量。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

当前正在从远程服务器发送到发起者服务器关于数据部件集的公告数量（针对 MergeTree 表）。在远程服务器侧测量。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor 线程池中的线程数量。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

正在运行任务的 MergeTreeBackgroundExecutor 线程池中的线程数量。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor 线程池中的线程数量。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

正在运行任务的 MergeTreeDataSelectExecutor 线程池中的线程数量。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree 部件清理线程池中的线程数量。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

正在运行任务的 MergeTree 部件清理线程池中的线程数量。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree 部件加载线程池中的线程数量。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

正在运行任务的 MergeTree 部件加载线程池中的线程数量。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

当前正在从远程服务器发送到发起者服务器用于选择读取任务的回调请求数量（针对 s3Cluster 表函数及类似）。在远程服务器侧测量。

### Move {#move}

当前正在执行的移动数量。

### MySQLConnection {#mysqlconnection}

使用 MySQL 协议的客户端连接数量。

### NetworkReceive {#networkreceive}

从网络接收数据的线程数量。仅包括与 ClickHouse 相关的网络交互，不包括第三方库。

### NetworkSend {#networksend}

向网络发送数据的线程数量。仅包括与 ClickHouse 相关的网络交互，不包括第三方库。

### OpenFileForRead {#openfileforread}

打开以供读取的文件数量。

### OpenFileForWrite {#openfileforwrite}

打开以供写入的文件数量。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads 线程池中的线程数量。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

正在运行任务的 ParallelFormattingOutputFormatThreads 线程池中的线程数量。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat 线程池中的线程数量。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

正在运行任务的 ParallelParsingInputFormat 线程池中的线程数量。

### PartMutation {#partmutation}

变更（ALTER DELETE/UPDATE）数量。

### PartsActive {#partsactive}

正在当前及即将进行的 SELECT 中使用的活动数据部分。

### PartsCommitted {#partscommitted}

已弃用。请参见 PartsActive。

### PartsCompact {#partscompact}

紧凑的部分。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

部分已移动到另一个磁盘，应在其析构函数中删除。

### PartsDeleting {#partsdeleting}

不活跃的数据部分，具有身份引用计数，正在被清理器删除。

### PartsOutdated {#partsoutdated}

不活跃的数据部分，但仅可用于当前 SELECT，在 SELECT 完成后可被删除。

### PartsPreActive {#partspreactive}

该部分在 data_parts 中，但不用于 SELECT。

### PartsPreCommitted {#partsprecommitted}

已弃用。请参见 PartsPreActive。

### PartsTemporary {#partstemporary}

该部分正在生成，目前不在 data_parts 列表中。

### PartsWide {#partswide}

宽的部分。

### PendingAsyncInsert {#pendingasyncinsert}

等待刷新的异步插入数量。

### PostgreSQLConnection {#postgresqlconnection}

使用 PostgreSQL 协议的客户端连接数量。

### Query {#query}

正在执行的查询数量。

### QueryPreempted {#querypreempted}

由于“优先级”设置而停止并等待的查询数量。

### QueryThread {#querythread}

查询处理线程的数量。

### RWLockActiveReaders {#rwlockactivereaders}

在表 RWLock 中持有读取锁的线程数量。

### RWLockActiveWriters {#rwlockactivewriters}

在表 RWLock 中持有写入锁的线程数量。

### RWLockWaitingReaders {#rwlockwaitingreaders}

等待表 RWLock 中读取的线程数量。

### RWLockWaitingWriters {#rwlockwaitingwriters}

等待表 RWLock 中写入的线程数量。

### Read {#read}

正在进行的读取（read、pread、io_getevents 等）系统调用数量。

### ReadTaskRequestsSent {#readtaskrequestssent}

当前正在从远程服务器发送到发起者服务器用于选择读取任务的回调请求数量（针对 s3Cluster 表函数及类似）。在远程服务器侧测量。

### ReadonlyReplica {#readonlyreplica}

由于 ZooKeeper 会话丢失后重新初始化或在未配置 ZooKeeper 的情况下启动，当前处于只读状态的 Replicated 表数量。

### RemoteRead {#remoteread}

正在进行的远程读取数量。

### ReplicatedChecks {#replicatedchecks}

检查一致性的数据部件数量。

### ReplicatedFetch {#replicatedfetch}

从副本中获取的数据部件数量。

### ReplicatedSend {#replicatedsend}

发送到副本的数据部件数量。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA 线程池中的线程数量。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

正在运行任务的 RESTART REPLICA 线程池中的线程数量。

### RestoreThreads {#restorethreads}

用于 RESTORE 的线程池中的线程数量。

### RestoreThreadsActive {#restorethreadsactive}

正在运行任务的 RESTORE 线程池中的线程数量。

### Revision {#revision}

服务器的修订版本。它是每次发布或发布候选版本增加的数字，除了补丁版本。

### S3Requests {#s3requests}

S3 请求。

### SendExternalTables {#sendexternaltables}

向远程服务器发送外部表数据的连接数量。外部表用于实现带有分布式子查询的 GLOBAL IN 和 GLOBAL JOIN 操作符。

### SendScalars {#sendscalars}

向远程服务器发送标量数据的连接数量。

### StorageBufferBytes {#storagebufferbytes}

缓冲区表中缓冲区的字节数。

### StorageBufferRows {#storagebufferrows}

缓冲区表中缓冲区的行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed 线程池中的线程数量。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

正在运行任务的 StorageDistributed 线程池中的线程数量。

### StorageHiveThreads {#storagehivethreads}

StorageHive 线程池中的线程数量。

### StorageHiveThreadsActive {#storagehivethreadsactive}

正在运行任务的 StorageHive 线程池中的线程数量。

### StorageS3Threads {#storages3threads}

StorageS3 线程池中的线程数量。

### StorageS3ThreadsActive {#storages3threadsactive}

正在运行任务的 StorageS3 线程池中的线程数量。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas 线程池中的线程数量。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

正在运行任务的 system.replicas 线程池中的线程数量。

### TCPConnection {#tcpconnection}

到 TCP 服务器（具有本地接口的客户端）的连接数量，同时也包括服务器-服务器的分布式查询连接。

### TablesToDropQueueSize {#tablestodropqueuesize}

等待后台数据删除的已删除表的数量。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

为外部聚合创建的临时文件数量。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

为 JOIN 创建的临时文件数量。

### TemporaryFilesForSort {#temporaryfilesforsort}

为外部排序创建的临时文件数量。

### TemporaryFilesUnknown {#temporaryfilesunknown}

创建的具有未知目的的临时文件数量。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

用于 local_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

正在运行任务的用于 local_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

用于 remote_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

正在运行任务的用于 remote_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

在 OvercommitTracker 中等待的线程数量。

### TotalTemporaryFiles {#totaltemporaryfiles}

创建的临时文件总数量。

### VersionInteger {#versioninteger}

服务器版本的整数表示形式，单位为 1000。例如，版本 11.22.33 表示为 11022033。

### Write {#write}

正在进行的写入（write、pwrite、io_getevents 等）系统调用数量。

### ZooKeeperRequest {#zookeeperrequest}

正在进行的 ZooKeeper 请求数量。

### ZooKeeperSession {#zookeepersession}

到 ZooKeeper 的会话（连接）数量。应该不超过一个，因为使用多个连接到 ZooKeeper 可能导致由于缺乏线性化（过时读取）而导致的错误，而 ZooKeeper 一致性模型允许这种情况。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper 中的观察（事件订阅）数量。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

获得的 CPU 时隙总数量。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU 时隙的软限制值。

**另请参阅**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含周期性计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的一系列事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含表 `system.metrics` 和 `system.events` 的指标值历史记录。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
