---
'description': '系统表包含可以即时计算的指标或当前值。'
'keywords':
- 'system table'
- 'metrics'
'slug': '/operations/system-tables/metrics'
'title': 'system.metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metrics

<SystemTableCloud/>

包含可以立即计算的指标或具有当前值的指标。例如，同时处理的查询数量或当前副本延迟。该表始终是最新的。

列:

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

Aggregator线程池中的线程数量。

### AggregatorThreadsActive {#aggregatorthreadsactive}

在Aggregator线程池中运行任务的线程数量。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

异步加载器前台线程池中的线程数量。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

在异步加载器前台线程池中运行任务的线程数量。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

异步加载器后台线程池中的线程数量。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

在异步加载器后台线程池中运行任务的线程数量。

### AsyncInsertCacheSize {#asyncinsertcachesize}

缓存中异步插入哈希id的数量。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

AsynchronousInsert线程池中的线程数量。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

在AsynchronousInsert线程池中运行任务的线程数量。

### AsynchronousReadWait {#asynchronousreadwait}

等待异步读取的线程数量。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

后台缓冲区刷新调度池中任务数量的限制。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

后台缓冲区刷新调度池中活动任务的数量。该池用于定期缓冲区刷新。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

关联后台池中的任务数量限制。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

关联后台池中活动任务的数量。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

后台分布式调度池中任务数量的限制。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

后台分布式调度池中活动任务的数量。该池用于在后台进行的分布式发送。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

关联后台池中同时提取的数量限制。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

关联后台池中活动提取的数量。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

关联后台池中活动合并和变更的数量限制。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

关联后台池中活动合并和变更的数量。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

用于消息流处理的BackgroundProcessingPool中的任务数量限制。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

用于消息流处理的BackgroundProcessingPool中活动任务的数量。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

用于移动的BackgroundProcessingPool中的任务数量限制。

### BackgroundMovePoolTask {#backgroundmovepooltask}

用于移动的BackgroundProcessingPool中的活动任务数量。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

BackgroundSchedulePool中的任务数量限制。该池用于定期ReplicatedMergeTree任务，例如清理旧数据部分， 修改数据部分， 副本重新初始化等。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

BackgroundSchedulePool中的活动任务数量。该池用于定期ReplicatedMergeTree任务，例如清理旧数据部分， 修改数据部分， 副本重新初始化等。

### BackupsIOThreads {#backupsiothreads}

BackupsIO线程池中的线程数量。

### BackupsIOThreadsActive {#backupsiothreadsactive}

在BackupsIO线程池中运行任务的线程数量。

### BackupsThreads {#backupsthreads}

用于备份的线程池中的线程数量。

### BackupsThreadsActive {#backupsthreadsactive}

在备份线程池中运行任务的线程数量。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

标记为损坏的待插入到分布式表中的文件数量。此指标将在启动时从0开始。每个分片的文件数量相加。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

现有的分离缓存文件片段的数量。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary线程池中的线程数量。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

在CacheDictionary线程池中运行任务的线程数量。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries中更新队列中的“批次”（一组键）数量。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries中更新队列中的键的确切数量。

### CacheFileSegments {#cachefilesegments}

现有缓存文件片段的数量。

### ContextLockWait {#contextlockwait}

在上下文中等待锁的线程数量。 这是全局锁。

### DDLWorkerThreads {#ddlworkerthreads}

用于ON CLUSTER查询的DDLWorker线程池中的线程数量。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

在DDLWorker线程池中运行任务的线程数量，用于ON CLUSTER查询。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog线程池中的线程数量。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

在DatabaseCatalog线程池中运行任务的线程数量。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk线程池中的线程数量。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

在DatabaseOnDisk线程池中运行任务的线程数量。

### DelayedInserts {#delayedinserts}

由于MergeTree表分区中活跃数据部分数量过多而被限制的INSERT查询数量。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

用于销毁聚合状态的线程池中的线程数量。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

在用于销毁聚合状态的线程池中运行任务的线程数量。

### DictCacheRequests {#dictcacherequests}

当前正在飞往缓存类型字典数据源的请求数量。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

用于DiskObjectStorage的异步线程池中的线程数量。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

在DiskObjectStorage的异步线程池中运行任务的线程数量。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

当前正在运行的后台合并中保留的磁盘空间。它略高于当前正在合并部分的总大小。

### DistributedFilesToInsert {#distributedfilestoinsert}

待处理的文件数量，以进行异步插入到分布式表中。每个分片的文件数量相加。

### DistributedSend {#distributedsend}

发送插入到分布式表中的数据的远程服务器连接数量。包括同步和异步模式。

### EphemeralNode {#ephemeralnode}

在ZooKeeper中持有的短暂节点数量。

### FilesystemCacheElements {#filesystemcacheelements}

文件系统缓存元素（文件片段）

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

活动缓存缓冲区的数量。

### FilesystemCacheSize {#filesystemcachesize}

文件系统缓存的字节大小。

### QueryCacheBytes {#querycachebytes}

查询缓存的总大小（以字节为单位）。

### QueryCacheEntries {#querycacheentries}

查询缓存中的条目总数。

### UncompressedCacheBytes {#uncompressedcachebytes}

未压缩缓存的总大小（以字节为单位）。未压缩缓存通常不会提高性能，并且应尽量避免。

### UncompressedCacheCells {#uncompressedcachecells}

### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JIT编译代码的缓存使用的总字节数。

### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JIT编译代码缓存中的总条目数。

### MMapCacheCells {#mmapcachecells}

使用`mmap`打开的文件数量（映射在内存中）。这对于使用设置`local_filesystem_read_method`设置为`mmap`的查询非常有用。使用`mmap`打开的文件保留在缓存中，以避免昂贵的TLB刷新。

### MarkCacheBytes {#markcachebytes}

标记缓存的总大小（以字节为单位）。

### MarkCacheFiles {#markcachefiles}

标记缓存中缓存的标记文件的总数。

### GlobalThread {#globalthread}

全局线程池中的线程数量。

### GlobalThreadActive {#globalthreadactive}

在全局线程池中运行任务的线程数量。

### HTTPConnection {#httpconnection}

与HTTP服务器的连接数量。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary线程池中的线程数量。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

在HashedDictionary线程池中运行任务的线程数量。

### IOPrefetchThreads {#ioprefetchthreads}

IO预取线程池中的线程数量。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

在IO预取线程池中运行任务的线程数量。

### IOThreads {#iothreads}

IO线程池中的线程数量。

### IOThreadsActive {#iothreadsactive}

在IO线程池中运行任务的线程数量。

### IOUringInFlightEvents {#iouringinflightevents}

正在处理的io_uring SQE数量。

### IOUringPendingEvents {#iouringpendingevents}

等待提交的io_uring SQE数量。

### IOWriterThreads {#iowriterthreads}

IO写入线程池中的线程数量。

### IOWriterThreadsActive {#iowriterthreadsactive}

在IO写入线程池中运行任务的线程数量。

### InterserverConnection {#interserverconnection}

来自其他副本获取部分的连接数量。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Kafka表当前分配的分区数量。

### KafkaBackgroundReads {#kafkabackgroundreads}

当前正在进行的后台读取数量（从Kafka填充物化视图）。

### KafkaConsumers {#kafkaconsumers}

活动Kafka消费者的数量。

### KafkaConsumersInUse {#kafkaconsumersinuse}

当前直接或后台读取使用的消费者数量。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

当前有部分分配的活动Kafka消费者数量。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

活动librdkafka线程数量。

### KafkaProducers {#kafkaproducers}

创建的活动Kafka生产者数量。

### KafkaWrites {#kafkawrites}

当前正在进行的Kafka插入数量。

### KeeperAliveConnections {#keeperaliveconnections}

存活连接的数量。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未完成请求的数量。

### LocalThread {#localthread}

本地线程池中的线程数量。 本地线程池中的线程来自全局线程池。

### LocalThreadActive {#localthreadactive}

在本地线程池中运行任务的线程数量。

### MMappedAllocBytes {#mmappedallocbytes}

mmapped分配的总字节数。

### MMappedAllocs {#mmappedallocs}

mmapped分配的总数量。

### MMappedFileBytes {#mmappedfilebytes}

mmapped文件区域的总大小。

### MMappedFiles {#mmappedfiles}

mmapped文件的总数量。

### MarksLoaderThreads {#marksloaderthreads}

用于加载标记的线程池中的线程数量。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

在加载标记的线程池中运行任务的线程数量。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker处理的最大DDL条目。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

推送到ZooKeeper的DDLWorker的最大DDL条目。

### MemoryTracking {#memorytracking}

服务器分配的总内存（以字节为单位）。

### Merge {#merge}

正在执行的后台合并数量。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

从远程服务器到发起服务器发送的数据部分集合的当前公告数量（适用于MergeTree表）。在远程服务器端测量。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor线程池中的线程数量。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

在MergeTreeBackgroundExecutor线程池中运行任务的线程数量。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor线程池中的线程数量。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

在MergeTreeDataSelectExecutor线程池中运行任务的线程数量。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree部分清理线程池中的线程数量。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

在MergeTree部分清理线程池中运行任务的线程数量。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree部分加载器线程池中的线程数量。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

在MergeTree部分加载器线程池中运行任务的线程数量。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

从远程服务器返回到发起服务器的回调请求的当前数量，以选择读取任务（适用于MergeTree表）。在远程服务器端测量。

### Move {#move}

当前执行的移动数量。

### MySQLConnection {#mysqlconnection}

使用MySQL协议的客户端连接数量。

### NetworkReceive {#networkreceive}

从网络接收数据的线程数量。仅包括与ClickHouse相关的网络交互，不包括第三方库。

### NetworkSend {#networksend}

向网络发送数据的线程数量。仅包括与ClickHouse相关的网络交互，不包括第三方库。

### OpenFileForRead {#openfileforread}

打开进行读取的文件数量。

### OpenFileForWrite {#openfileforwrite}

打开进行写入的文件数量。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads线程池中的线程数量。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

在ParallelFormattingOutputFormatThreads线程池中运行任务的线程数量。

### PartMutation {#partmutation}

变更的数量（ALTER DELETE/UPDATE）。

### PartsActive {#partsactive}

当前和即将到来的SELECT使用的活动数据部分。

### PartsCommitted {#partscommitted}

已弃用。请参见PartsActive。

### PartsCompact {#partscompact}

紧凑部分。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

部分已移动到另一磁盘，应在自身析构函数中删除。

### PartsDeleting {#partsdeleting}

不活动的数据部分，具有身份引用计数，正在被清理器删除。

### PartsOutdated {#partsoutdated}

不活动的数据部分，但只能由当前SELECT使用，选择完成后可以删除。

### PartsPreActive {#partspreactive}

该部分在data_parts中，但未用于SELECT。

### PartsPreCommitted {#partsprecommitted}

已弃用。请参见PartsPreActive。

### PartsTemporary {#partstemporary}

该部分现在正在生成，不在data_parts列表中。

### PartsWide {#partswide}

宽部分。

### PendingAsyncInsert {#pendingasyncinsert}

等待刷新的异步插入数量。

### PostgreSQLConnection {#postgresqlconnection}

使用PostgreSQL协议的客户端连接数量。

### Query {#query}

正在执行的查询数量。

### QueryPreempted {#querypreempted}

由于“优先级”设置而停止和等待的查询数量。

### QueryThread {#querythread}

查询处理线程的数量。

### RWLockActiveReaders {#rwlockactivereaders}

在表RWLock中持有读锁的线程数量。

### RWLockActiveWriters {#rwlockactivewriters}

在表RWLock中持有写锁的线程数量。

### RWLockWaitingReaders {#rwlockwaitingreaders}

在表RWLock上等待读取的线程数量。

### RWLockWaitingWriters {#rwlockwaitingwriters}

在表RWLock上等待写入的线程数量。

### Read {#read}

正在处理的读（read，pread，io_getevents等）系统调用的数量。

### ReadTaskRequestsSent {#readtaskrequestssent}

从远程服务器返回到发起服务器的回调请求的当前数量，以选择读取任务（适用于s3Cluster表函数及类似）。在远程服务器端测量。

### ReadonlyReplica {#readonlyreplica}

当前处于只读状态的Replicated表的数量，因ZooKeeper会话丢失后的重新初始化或因未配置ZooKeeper而启动。

### RemoteRead {#remoteread}

带有远程读取的读取数量。

### ReplicatedChecks {#replicatedchecks}

检查一致性的部分数量。

### ReplicatedFetch {#replicatedfetch}

正在从副本提取的数据部分数量。

### ReplicatedSend {#replicatedsend}

正在发送到副本的数据部分数量。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA线程池中的线程数量。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

在RESTART REPLICA线程池中运行任务的线程数量。

### RestoreThreads {#restorethreads}

用于RESTORE的线程池中的线程数量。

### RestoreThreadsActive {#restorethreadsactive}

在RESTORE线程池中运行任务的线程数量。

### Revision {#revision}

服务器的修订号。它是每次发布或发布候选版本递增的数字，不包括补丁发布。

### S3Requests {#s3requests}

S3请求。

### SendExternalTables {#sendexternaltables}

发送外部表数据到远程服务器的连接数量。外部表用于实现带有分布式子查询的GLOBAL IN和GLOBAL JOIN操作符。

### SendScalars {#sendscalars}

发送标量数据到远程服务器的连接数量。

### StorageBufferBytes {#storagebufferbytes}

缓冲表的缓冲区中的字节数。

### StorageBufferRows {#storagebufferrows}

缓冲表的缓冲区中的行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed线程池中的线程数量。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

在StorageDistributed线程池中运行任务的线程数量。

### StorageHiveThreads {#storagehivethreads}

StorageHive线程池中的线程数量。

### StorageHiveThreadsActive {#storagehivethreadsactive}

在StorageHive线程池中运行任务的线程数量。

### StorageS3Threads {#storages3threads}

StorageS3线程池中的线程数量。

### StorageS3ThreadsActive {#storages3threadsactive}

在StorageS3线程池中运行任务的线程数量。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas线程池中的线程数量。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

在system.replicas线程池中运行任务的线程数量。

### TCPConnection {#tcpconnection}

与TCP服务器的连接数量（具有原生接口的客户端），也包括服务器到服务器的分布式查询连接。

### TablesToDropQueueSize {#tablestodropqueuesize}

等待后台数据删除的已删除表数量。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

为外部聚合创建的临时文件数量。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

为JOIN创建的临时文件数量。

### TemporaryFilesForSort {#temporaryfilesforsort}

为外部排序创建的临时文件数量。

### TemporaryFilesUnknown {#temporaryfilesunknown}

创建的具有未知目的的临时文件数量。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

用于local_filesystem_read_method=threadpool的线程池中的线程数量。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

在local_filesystem_read_method=threadpool线程池中运行任务的线程数量。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

用于remote_filesystem_read_method=threadpool的线程池中的线程数量。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

在remote_filesystem_read_method=threadpool线程池中运行任务的线程数量。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

在OvercommitTracker中等待的线程数量。

### TotalTemporaryFiles {#totaltemporaryfiles}

创建的临时文件数量。

### VersionInteger {#versioninteger}

服务器的版本，以单个整数表示，基数为1000。例如，版本11.22.33转换为11022033。

### Write {#write}

正在处理的写（write，pwrite，io_getevents等）系统调用的数量。

### ZooKeeperRequest {#zookeeperrequest}

正在处理的ZooKeeper请求数量。

### ZooKeeperSession {#zookeepersession}

与ZooKeeper连接的会话数量。应不超过一个，因为使用多个与ZooKeeper的连接可能由于缺乏线性化（陈旧读取）导致错误，ZooKeeper一致性模型允许出现这种情况。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper中的观察（事件订阅）数量。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

获取的CPU槽的总数量。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU槽的软限制值。

**另见**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含周期性计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的事件数量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。
- [Monitoring](../../operations/monitoring.md) — ClickHouse监控的基本概念。
