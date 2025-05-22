import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.metrics

<SystemTableCloud/>

包含可以即时计算或具有当前值的指标。例如，同时处理的查询数量或当前副本延迟。该表始终是最新的。

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

在执行任务的聚合器线程池中的线程数量。

### TablesLoaderForegroundThreads {#tablesloaderforegroundthreads}

异步加载器前台线程池中的线程数量。

### TablesLoaderForegroundThreadsActive {#tablesloaderforegroundthreadsactive}

在执行任务的异步加载器前台线程池中的线程数量。

### TablesLoaderBackgroundThreads {#tablesloaderbackgroundthreads}

异步加载器后台线程池中的线程数量。

### TablesLoaderBackgroundThreadsActive {#tablesloaderbackgroundthreadsactive}

在执行任务的异步加载器后台线程池中的线程数量。

### AsyncInsertCacheSize {#asyncinsertcachesize}

缓存中异步插入的哈希 ID 数量。

### AsynchronousInsertThreads {#asynchronousinsertthreads}

异步插入线程池中的线程数量。

### AsynchronousInsertThreadsActive {#asynchronousinsertthreadsactive}

在执行任务的异步插入线程池中的线程数量。

### AsynchronousReadWait {#asynchronousreadwait}

等待异步读取的线程数量。

### BackgroundBufferFlushSchedulePoolSize {#backgroundbufferflushschedulepoolsize}

后台缓冲区刷新调度池中任务的数量限制。

### BackgroundBufferFlushSchedulePoolTask {#backgroundbufferflushschedulepooltask}

后台缓冲区刷新调度池中活动任务的数量。此池用于定期的缓冲区刷新。

### BackgroundCommonPoolSize {#backgroundcommonpoolsize}

相关后台池中任务的数量限制。

### BackgroundCommonPoolTask {#backgroundcommonpooltask}

相关后台池中活动任务的数量。

### BackgroundDistributedSchedulePoolSize {#backgrounddistributedschedulepoolsize}

后台分布式调度池中任务的数量限制。

### BackgroundDistributedSchedulePoolTask {#backgrounddistributedschedulepooltask}

后台分布式调度池中活动任务的数量。此池用于后台完成的分布式发送。

### BackgroundFetchesPoolSize {#backgroundfetchespoolsize}

相关后台池中同时提取的数量限制。

### BackgroundFetchesPoolTask {#backgroundfetchespooltask}

相关后台池中活动提取的数量。

### BackgroundMergesAndMutationsPoolSize {#backgroundmergesandmutationspoolsize}

相关后台池中活动合并和变更的数量限制。

### BackgroundMergesAndMutationsPoolTask {#backgroundmergesandmutationspooltask}

相关后台池中活动合并和变更的数量。

### BackgroundMessageBrokerSchedulePoolSize {#backgroundmessagebrokerschedulepoolsize}

后台处理池中用于消息流的任务数量限制。

### BackgroundMessageBrokerSchedulePoolTask {#backgroundmessagebrokerschedulepooltask}

后台处理池中用于消息流的活动任务数量。

### BackgroundMovePoolSize {#backgroundmovepoolsize}

后台处理池中任务数量的限制。

### BackgroundMovePoolTask {#backgroundmovepooltask}

后台处理池中活动任务的数量。

### BackgroundSchedulePoolSize {#backgroundschedulepoolsize}

后台调度池中任务数量的限制。此池用于定期 ReplicatedMergeTree 任务，如清理旧数据部分、修改数据部分、复制品重新初始化等。

### BackgroundSchedulePoolTask {#backgroundschedulepooltask}

后台调度池中活动任务的数量。此池用于定期 ReplicatedMergeTree 任务，如清理旧数据部分、修改数据部分、复制品重新初始化等。

### BackupsIOThreads {#backupsiothreads}

备份 IO 线程池中的线程数量。

### BackupsIOThreadsActive {#backupsiothreadsactive}

在执行任务的备份 IO 线程池中的线程数量。

### BackupsThreads {#backupsthreads}

备份的线程池中的线程数量。

### BackupsThreadsActive {#backupsthreadsactive}

在执行任务的备份线程池中的线程数量。

### BrokenDistributedFilesToInsert {#brokendistributedfilestoinsert}

标记为损坏的用于异步插入到分布式表的文件数量。此指标在启动时将从 0 开始。每个分片的文件数量会被汇总。

### CacheDetachedFileSegments {#cachedetachedfilesegments}

现有分离缓存文件片段的数量。

### CacheDictionaryThreads {#cachedictionarythreads}

CacheDictionary 线程池中的线程数量。

### CacheDictionaryThreadsActive {#cachedictionarythreadsactive}

在执行任务的 CacheDictionary 线程池中的线程数量。

### CacheDictionaryUpdateQueueBatches {#cachedictionaryupdatequeuebatches}

CacheDictionaries 中更新队列的“批次”（一组键）数量。

### CacheDictionaryUpdateQueueKeys {#cachedictionaryupdatequeuekeys}

CacheDictionaries 中更新队列的确切键数。

### CacheFileSegments {#cachefilesegments}

现有缓存文件片段的数量。

### ContextLockWait {#contextlockwait}

等待在上下文中获锁的线程数量。此为全局锁。

### DDLWorkerThreads {#ddlworkerthreads}

DDLWorker 线程池中的线程数量，用于 ON CLUSTER 查询。

### DDLWorkerThreadsActive {#ddlworkerthreadsactive}

在执行任务的 DDLWorker 线程池中的线程数量。

### DatabaseCatalogThreads {#databasecatalogthreads}

DatabaseCatalog 线程池中的线程数量。

### DatabaseCatalogThreadsActive {#databasecatalogthreadsactive}

在执行任务的 DatabaseCatalog 线程池中的线程数量。

### DatabaseOnDiskThreads {#databaseondiskthreads}

DatabaseOnDisk 线程池中的线程数量。

### DatabaseOnDiskThreadsActive {#databaseondiskthreadsactive}

在执行任务的 DatabaseOnDisk 线程池中的线程数量。

### DelayedInserts {#delayedinserts}

由于 MergeTree 表中活动数据部分数量太多而被限流的 INSERT 查询数量。

### DestroyAggregatesThreads {#destroyaggregatesthreads}

用于销毁聚合状态的线程池中的线程数量。

### DestroyAggregatesThreadsActive {#destroyaggregatesthreadsactive}

在执行任务的线程池中用于销毁聚合状态的线程数量。

### DictCacheRequests {#dictcacherequests}

发送给缓存类型字典数据源的请求数量。

### DiskObjectStorageAsyncThreads {#diskobjectstorageasyncthreads}

DiskObjectStorage 的异步线程池中的线程数量。

### DiskObjectStorageAsyncThreadsActive {#diskobjectstorageasyncthreadsactive}

在执行任务的 DiskObjectStorage 异步线程池中的线程数量。

### DiskSpaceReservedForMerge {#diskspacereservedformerge}

为当前正在进行的后台合并保留的磁盘空间。它略大于当前正在合并部分的总大小。

### DistributedFilesToInsert {#distributedfilestoinsert}

待处理的用于异步插入到分布式表的文件数量。每个分片的文件数量会被汇总。

### DistributedSend {#distributedsend}

发送数据到远程服务器的连接数量，这些数据是插入到分布式表中的。包括同步和异步模式。

### EphemeralNode {#ephemeralnode}

在 ZooKeeper 中保持的临时节点数量。

### FilesystemCacheElements {#filesystemcacheelements}

文件系统缓存元素（文件片段）。

### FilesystemCacheReadBuffers {#filesystemcachereadbuffers}

活动缓存缓冲区的数量。

### FilesystemCacheSize {#filesystemcachesize}

文件系统缓存大小（字节）。

### GlobalThread {#globalthread}

全局线程池中的线程数量。

### GlobalThreadActive {#globalthreadactive}

在执行任务的全局线程池中的线程数量。

### HTTPConnection {#httpconnection}

与 HTTP 服务器的连接数量。

### HashedDictionaryThreads {#hasheddictionarythreads}

HashedDictionary 线程池中的线程数量。

### HashedDictionaryThreadsActive {#hasheddictionarythreadsactive}

在执行任务的 HashedDictionary 线程池中的线程数量。

### IOPrefetchThreads {#ioprefetchthreads}

IO 预取线程池中的线程数量。

### IOPrefetchThreadsActive {#ioprefetchthreadsactive}

在执行任务的 IO 预取线程池中的线程数量。

### IOThreads {#iothreads}

IO 线程池中的线程数量。

### IOThreadsActive {#iothreadsactive}

在执行任务的 IO 线程池中的线程数量。

### IOUringInFlightEvents {#iouringinflightevents}

正在处理中 io_uring SQE 的数量。

### IOUringPendingEvents {#iouringpendingevents}

等待提交的 io_uring SQE 的数量。

### IOWriterThreads {#iowriterthreads}

IO 写入线程池中的线程数量。

### IOWriterThreadsActive {#iowriterthreadsactive}

在执行任务的 IO 写入线程池中的线程数量。

### InterserverConnection {#interserverconnection}

来自其他副本以提取部分的连接数量。

### KafkaAssignedPartitions {#kafkaassignedpartitions}

Kafka 表当前分配的分区数量。

### KafkaBackgroundReads {#kafkabackgroundreads}

当前正在进行的后台读取数量（从 Kafka 填充物化视图）。

### KafkaConsumers {#kafkaconsumers}

活动 Kafka 消费者的数量。

### KafkaConsumersInUse {#kafkaconsumersinuse}

当前被直接或后台读取使用的消费者数量。

### KafkaConsumersWithAssignment {#kafkaconsumerswithassignment}

拥有某些分区分配的活动 Kafka 消费者的数量。

### KafkaLibrdkafkaThreads {#kafkalibrdkafkathreads}

活动 librdkafka 线程的数量。

### KafkaProducers {#kafkaproducers}

创建的活动 Kafka 生产者的数量。

### KafkaWrites {#kafkawrites}

当前向 Kafka 进行的写入数量。

### KeeperAliveConnections {#keeperaliveconnections}

活动连接的数量。

### KeeperOutstandingRequests {#keeperoutstandingrequests}

未决请求的数量。

### LocalThread {#localthread}

本地线程池中的线程数量。本地线程池中的线程来自全局线程池。

### LocalThreadActive {#localthreadactive}

在执行任务的本地线程池中的线程数量。

### MMappedAllocBytes {#mmappedallocbytes}

内存映射分配的总字节数。

### MMappedAllocs {#mmappedallocs}

内存映射分配的总数量。

### MMappedFileBytes {#mmappedfilebytes}

内存映射文件区域的总大小。

### MMappedFiles {#mmappedfiles}

内存映射文件的总数量。

### MarksLoaderThreads {#marksloaderthreads}

用于加载标记的线程池中的线程数量。

### MarksLoaderThreadsActive {#marksloaderthreadsactive}

在执行任务的线程池中加载标记的线程数量。

### MaxDDLEntryID {#maxddlentryid}

DDLWorker 处理的最大 DDL 条目 ID。

### MaxPushedDDLEntryID {#maxpushedddlentryid}

推送到 ZooKeeper 的 DDLWorker 的最大 DDL 条目。

### MemoryTracking {#memorytracking}

服务器分配的总内存量（字节）。

### Merge {#merge}

正在执行的后台合并数量。

### MergeTreeAllRangesAnnouncementsSent {#mergetreeallrangesannouncementssent}

从远程服务器到发起服务器目前在传输的宣布数量，关于数据部分的集合（针对 MergeTree 表）。在远程服务器侧进行测量。

### MergeTreeBackgroundExecutorThreads {#mergetreebackgroundexecutorthreads}

MergeTreeBackgroundExecutor 线程池中的线程数量。

### MergeTreeBackgroundExecutorThreadsActive {#mergetreebackgroundexecutorthreadsactive}

在执行任务的 MergeTreeBackgroundExecutor 线程池中的线程数量。

### MergeTreeDataSelectExecutorThreads {#mergetreedataselectexecutorthreads}

MergeTreeDataSelectExecutor 线程池中的线程数量。

### MergeTreeDataSelectExecutorThreadsActive {#mergetreedataselectexecutorthreadsactive}

在执行任务的 MergeTreeDataSelectExecutor 线程池中的线程数量。

### MergeTreePartsCleanerThreads {#mergetreepartscleanerthreads}

MergeTree 部件清理线程池中的线程数量。

### MergeTreePartsCleanerThreadsActive {#mergetreepartscleanerthreadsactive}

在执行任务的 MergeTree 部件清理线程池中的线程数量。

### MergeTreePartsLoaderThreads {#mergetreepartsloaderthreads}

MergeTree 部件加载线程池中的线程数量。

### MergeTreePartsLoaderThreadsActive {#mergetreepartsloaderthreadsactive}

在执行任务的 MergeTree 部件加载线程池中的线程数量。

### MergeTreeReadTaskRequestsSent {#mergetreereadtaskrequestssent}

从远程服务器到发起服务器目前在传输的回调请求数量，用于选择读取任务（针对 MergeTree 表）。在远程服务器侧进行测量。

### Move {#move}

目前正在执行的移动数量。

### MySQLConnection {#mysqlconnection}

使用 MySQL 协议的客户端连接数量。

### NetworkReceive {#networkreceive}

接收来自网络数据的线程数量。仅包括与 ClickHouse 相关的网络交互，不包含第三方库。

### NetworkSend {#networksend}

发送数据到网络的线程数量。仅包括与 ClickHouse 相关的网络交互，不包含第三方库。

### OpenFileForRead {#openfileforread}

打开用于读取的文件数量。

### OpenFileForWrite {#openfileforwrite}

打开用于写入的文件数量。

### ParallelFormattingOutputFormatThreads {#parallelformattingoutputformatthreads}

ParallelFormattingOutputFormatThreads 线程池中的线程数量。

### ParallelFormattingOutputFormatThreadsActive {#parallelformattingoutputformatthreadsactive}

在执行任务的 ParallelFormattingOutputFormatThreads 线程池中的线程数量。

### ParallelParsingInputFormatThreads {#parallelparsinginputformatthreads}

ParallelParsingInputFormat 线程池中的线程数量。

### ParallelParsingInputFormatThreadsActive {#parallelparsinginputformatthreadsactive}

在执行任务的 ParallelParsingInputFormat 线程池中的线程数量。

### PartMutation {#partmutation}

变更的数量（ALTER DELETE/UPDATE）。

### PartsActive {#partsactive}

当前和即将进行的 SELECT 使用的活动数据部分。

### PartsCommitted {#partscommitted}

已弃用。请参阅 PartsActive。

### PartsCompact {#partscompact}

压缩部分。

### PartsDeleteOnDestroy {#partsdeleteondestroy}

部分已移至另一磁盘，应该在自己的析构函数中删除。

### PartsDeleting {#partsdeleting}

不活动的数据部分，具有身份引用计数，当前正在被清理器删除。

### PartsOutdated {#partsoutdated}

不活跃的数据部分，但可能只被当前 SELECT 使用，SELECT 完成后可以删除。

### PartsPreActive {#partspreactive}

该部分在 data_parts 中，但未用于 SELECT。

### PartsPreCommitted {#partsprecommitted}

已弃用。请参阅 PartsPreActive。

### PartsTemporary {#partstemporary}

该部分正在生成中，不在 data_parts 列表中。

### PartsWide {#partswide}

宽部分。

### PendingAsyncInsert {#pendingasyncinsert}

等待刷新中的异步插入数量。

### PostgreSQLConnection {#postgresqlconnection}

使用 PostgreSQL 协议的客户端连接数量。

### Query {#query}

正在执行的查询数量。

### QueryPreempted {#querypreempted}

由于“优先级”设置停止并等待的查询数量。

### QueryThread {#querythread}

查询处理线程的数量。

### RWLockActiveReaders {#rwlockactivereaders}

在表 RWLock 中持有读取锁的线程数量。

### RWLockActiveWriters {#rwlockactivewriters}

在表 RWLock 中持有写入锁的线程数量。

### RWLockWaitingReaders {#rwlockwaitingreaders}

等待在表 RWLock 中读取的线程数量。

### RWLockWaitingWriters {#rwlockwaitingwriters}

等待在表 RWLock 中写入的线程数量。

### Read {#read}

在处理中 read（read、pread、io_getevents 等）系统调用的数量。

### ReadTaskRequestsSent {#readtaskrequestssent}

从远程服务器到发起服务器目前在传输的回调请求数量，用于选择读取任务（针对 s3Cluster 表函数及类似）。在远程服务器侧进行测量。

### ReadonlyReplica {#readonlyreplica}

由于在 ZooKeeper 会话丢失后重新初始化或在没有配置 ZooKeeper 的情况下启动，当前处于只读状态的 Replicated 表数量。

### RemoteRead {#remoteread}

使用远程读取器的读取数量。

### ReplicatedChecks {#replicatedchecks}

用于检查一致性的数据部分数量。

### ReplicatedFetch {#replicatedfetch}

正在从副本获取的数据部分数量。

### ReplicatedSend {#replicatedsend}

正在发送到副本的数据部分数量。

### RestartReplicaThreads {#restartreplicathreads}

RESTART REPLICA 线程池中的线程数量。

### RestartReplicaThreadsActive {#restartreplicathreadsactive}

在执行任务的 RESTART REPLICA 线程池中的线程数量。

### RestoreThreads {#restorethreads}

用于 RESTORE 的线程池中的线程数量。

### RestoreThreadsActive {#restorethreadsactive}

在执行任务的 RESTORE 线程池中的线程数量。

### Revision {#revision}

服务器的修订版本。每次发布或候选版本时都会递增的数字，补丁版本除外。

### S3Requests {#s3requests}

S3 请求的数量。

### SendExternalTables {#sendexternaltables}

向远程服务器发送外部表数据的连接数量。外部表用于实现具有分布式子查询的 GLOBAL IN 和 GLOBAL JOIN 运算符。

### SendScalars {#sendscalars}

向远程服务器发送标量数据的连接数量。

### StorageBufferBytes {#storagebufferbytes}

Buffer 表中缓冲区的字节数。

### StorageBufferRows {#storagebufferrows}

Buffer 表中缓冲区的行数。

### StorageDistributedThreads {#storagedistributedthreads}

StorageDistributed 线程池中的线程数量。

### StorageDistributedThreadsActive {#storagedistributedthreadsactive}

在执行任务的 StorageDistributed 线程池中的线程数量。

### StorageHiveThreads {#storagehivethreads}

StorageHive 线程池中的线程数量。

### StorageHiveThreadsActive {#storagehivethreadsactive}

在执行任务的 StorageHive 线程池中的线程数量。

### StorageS3Threads {#storages3threads}

StorageS3 线程池中的线程数量。

### StorageS3ThreadsActive {#storages3threadsactive}

在执行任务的 StorageS3 线程池中的线程数量。

### SystemReplicasThreads {#systemreplicasthreads}

system.replicas 线程池中的线程数量。

### SystemReplicasThreadsActive {#systemreplicasthreadsactive}

在执行任务的 system.replicas 线程池中的线程数量。

### TCPConnection {#tcpconnection}

与 TCP 服务器（具有原生接口的客户端）的连接数量，包括服务器间的分布式查询连接。

### TablesToDropQueueSize {#tablestodropqueuesize}

等待后台数据删除的已删除表数量。

### TemporaryFilesForAggregation {#temporaryfilesforaggregation}

为外部聚合创建的临时文件数量。

### TemporaryFilesForJoin {#temporaryfilesforjoin}

为 JOIN 创建的临时文件数量。

### TemporaryFilesForSort {#temporaryfilesforsort}

为外部排序创建的临时文件数量。

### TemporaryFilesUnknown {#temporaryfilesunknown}

创建的临时文件数量，但用途未知。

### ThreadPoolFSReaderThreads {#threadpoolfsreaderthreads}

用于 local_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolFSReaderThreadsActive {#threadpoolfsreaderthreadsactive}

在执行任务的线程池中用于 local_filesystem_read_method=threadpool 的线程数量。

### ThreadPoolRemoteFSReaderThreads {#threadpoolremotefsreaderthreads}

用于 remote_filesystem_read_method=threadpool 的线程池中的线程数量。

### ThreadPoolRemoteFSReaderThreadsActive {#threadpoolremotefsreaderthreadsactive}

在执行任务的线程池中用于 remote_filesystem_read_method=threadpool 的线程数量。

### ThreadsInOvercommitTracker {#threadsinovercommittracker}

在 OvercommitTracker 内部等待的线程数量。

### TotalTemporaryFiles {#totaltemporaryfiles}

创建的临时文件总数量。

### VersionInteger {#versioninteger}

服务器在基数为 1000 的单个整数中的版本。例如，版本 11.22.33 转换为 11022033。

### Write {#write}

在处理中 write（write、pwrite、io_getevents 等）系统调用的数量。

### ZooKeeperRequest {#zookeeperrequest}

在处理中对 ZooKeeper 的请求数量。

### ZooKeeperSession {#zookeepersession}

与 ZooKeeper 的会话（连接）数量。应该不超过一个，因为使用多个连接可能会导致由于缺乏线性化（过时读取）而导致的错误，ZooKeeper 的一致性模型允许出现这种情况。

### ZooKeeperWatch {#zookeeperwatch}

ZooKeeper 中的观察（事件订阅）数量。

### ConcurrencyControlAcquired {#concurrencycontrolacquired}

获得的 CPU 插槽总数量。

### ConcurrencyControlSoftLimit {#concurrencycontrolsoftlimit}

CPU 插槽的软限制值。

**另见**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的事件数量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自表 `system.metrics` 和 `system.events` 的指标值历史记录。
- [监控](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
