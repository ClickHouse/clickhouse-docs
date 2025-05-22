import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous_metrics

<SystemTableCloud/>

包含周期性在后台计算的指标。例如，使用的RAM数量。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) - 指标描述。

**示例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ Time in seconds spent for calculation of asynchronous metrics (this is the overhead of asynchronous metrics).                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ The total number of parts detached from MergeTree tables by users with the `ALTER TABLE DETACH` query (as opposed to unexpected, broken or ignored parts). The server does not care about detached parts and they can be removed.                          │
│ NumberOfDetachedParts                   │          0 │ The total number of parts detached from MergeTree tables. A part can be detached by a user with the `ALTER TABLE DETACH` query or by the server itself it the part is broken, unexpected or unneeded. The server does not care about detached parts and they can be removed. │
│ TotalRowsOfMergeTreeTables              │    2781309 │ Total amount of rows (records) stored in all tables of MergeTree family.                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ Total amount of bytes (compressed, including data and indices) stored in all tables of MergeTree family.                                                                                                                                                   │
│ NumberOfTables                          │         93 │ Total number of tables summed across the databases on the server, excluding the databases that cannot contain MergeTree tables. The excluded database engines are those who generate the set of tables on the fly, like `Lazy`, `MySQL`, `PostgreSQL`, `SQlite`. │
│ NumberOfDatabases                       │          6 │ Total number of databases on the server.                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ Maximum number of parts per partition across all partitions of all tables of MergeTree family. Values larger than 300 indicates misconfiguration, overload, or massive data loading.                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ Sum of merge operations in the queue (still to be applied) across Replicated tables.                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ Sum of INSERT operations in the queue (still to be replicated) across Replicated tables.                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- 与 system.events 和 system.metrics 不同，异步指标不会在源代码文件中简单列出 - 它们与 src/Interpreters/ServerAsynchronousMetrics.cpp 中的逻辑混合在一起。
      这里明确列出以便读者方便。 --->
## 指标描述 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

计算异步重（与表相关）指标所花费的时间（以秒为单位）（这是异步指标的开销）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重（与表相关）指标的更新间隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

计算异步指标所花费的时间（以秒为单位）（这是异步指标的开销）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔。
### BlockActiveTime_*name* {#blockactivetime_name}

块设备排队I/O请求的时间（以秒为单位）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上丢弃的字节数。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

来自块设备的丢弃操作请求的数量，并由操作系统I/O调度程序合并。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

来自块设备的丢弃操作请求的数量。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

块设备请求的丢弃操作花费的时间（以秒为单位），跨所有操作进行总和。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

此值计算已发出到设备驱动程序但尚未完成的I/O请求的数量。它不包括在队列中但尚未发出到设备驱动程序的I/O请求。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

此值计算I/O请求在该块设备上等待的毫秒数。如果有多个I/O请求在等待，随着等待请求数增加，此值将按毫秒数与等待请求数的乘积增加。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于操作系统页面缓存的使用，可能低于从文件系统读取的字节数，这样可以节省I/O。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

来自块设备的读取操作请求的数量，并由操作系统I/O调度程序合并。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

来自块设备的读取操作请求的数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

从块设备请求读取操作花费的时间（以秒为单位），跨所有操作进行总和。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

写入到块设备的字节数。由于操作系统页面缓存的使用，可能低于写入文件系统的字节数。由于写-通过缓存的原因，写入块设备的操作可能晚于对应的写入文件系统的操作。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

来自块设备的写入操作请求的数量，并由操作系统I/O调度程序合并。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

来自块设备的写入操作请求的数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

从块设备请求写入操作花费的时间（以秒为单位），跨所有操作进行总和。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。详见 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

当前CPU频率，单位为MHz。大多数现代CPU动态调整频率以节省电力和提供Turbo提升。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

用于JIT编译代码缓存的总字节数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JIT编译代码缓存中的总条目数。
### DiskAvailable_*name* {#diskavailable_name}

磁盘（虚拟文件系统）上的可用字节数。远程文件系统可能显示像16 EiB这样的大值。
### DiskTotal_*name* {#disktotal_name}

磁盘（虚拟文件系统）的总大小（以字节为单位）。远程文件系统可能显示像16 EiB这样的大值。
### DiskUnreserved_*name* {#diskunreserved_name}

磁盘（虚拟文件系统）上的可用字节数，不包括用于合并、获取和移动的保留字节。远程文件系统可能显示像16 EiB这样的大值。
### DiskUsed_*name* {#diskused_name}

磁盘（虚拟文件系统）上使用的字节数。远程文件系统并不总是提供此信息。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache`虚拟文件系统中的总字节数。该缓存保存在磁盘上。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache`虚拟文件系统中缓存的文件段总数。该缓存保存在磁盘上。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse日志路径挂载所在卷上的可用字节数。如果该值接近零，您应该在配置文件中调整日志轮换。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse日志路径挂载所在卷上的可用i节点数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse日志路径挂载所在卷的大小（以字节为单位）。建议至少有10 GB用于日志。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse日志路径挂载所在卷上的i节点总数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse日志路径挂载所在卷上使用的字节数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse日志路径挂载所在卷上使用的i节点数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主ClickHouse路径挂载的卷上的可用字节数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主ClickHouse路径挂载的卷上可用的i节点数。如果接近零，表示配置错误，您将收到“设备上没有剩余空间”的错误，即使磁盘没有满。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主ClickHouse路径挂载的卷的大小（以字节为单位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主ClickHouse路径挂载的卷上的i节点总数。如果少于2500万个，表示配置错误。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主ClickHouse路径挂载的卷上使用的字节数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主ClickHouse路径挂载的卷上使用的i节点数。该值大致与文件数量相对应。
### HTTPThreads {#httpthreads}

HTTP接口服务器中的线程数（不包括TLS）。
### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数（不包括TLS）。
### Jitter {#jitter}

计算异步指标的线程被调度唤醒的时间与实际醒来的时间之间的差异。整体系统延迟和响应性的代理指标。
### LoadAverage*N* {#loadaveragen}

整个系统负载，经过1分钟的指数平滑计算。负载表示在所有进程中（操作系统内核的调度实体）正在运行或等待I/O，或准备就绪但目前未被调度的线程的数量。此数字包括所有进程，而不仅限于clickhouse-server。如果系统负载过重且有很多进程准备就绪，但又在等待CPU或I/O，数字可能会大于CPU核心数。
### MMapCacheCells {#mmapcachecells}

使用`mmap`打开的文件数量（映射到内存中）。用于`local_filesystem_read_method`设置为`mmap`的查询。使用`mmap`打开的文件保存在缓存中，以避免代价昂贵的TLB刷新。
### MarkCacheBytes {#markcachebytes}

标记缓存的总大小（以字节为单位）。
### MarkCacheFiles {#markcachefiles}

标记缓存中缓存的标记文件总数。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree系列所有表的每个分区的最大分片数。大于300的值表示配置错误、超载或大量数据加载。
### MemoryCode {#memorycode}

为服务器进程的机器代码页面映射的虚拟内存量（以字节为单位）。
### MemoryDataAndStack {#memorydataandstack}

分配的内存和堆栈使用的虚拟内存量（以字节为单位）。是否包括每个线程的堆栈以及大部分使用'mmap'系统调用分配的内存尚不明确。此指标仅用于完整性原因。我建议使用`MemoryResident`指标进行监控。
### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的最大物理内存（以字节为单位）。
### MemoryResident {#memoryresident}

服务器进程使用的物理内存量（以字节为单位）。
### MemoryShared {#memoryshared}

服务器进程使用的内存量，在其他进程之间共享（以字节为单位）。ClickHouse不使用共享内存，但某些内存可能因操作系统的原因被标记为共享。此指标的监控意义不大，仅存在于完整性原因。
### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间大小（以字节为单位）。虚拟地址空间的大小通常大于物理内存使用情况，不应作为内存消耗的估算。此指标的大值是完全正常的，仅具有技术意义。
### MySQLThreads {#mysqlthreads}

MySQL兼容协议服务器中的线程数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

在通过网络接口接收时丢弃的字节数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

在通过网络接口接收时发生错误的次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络数据包数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkSendDrop_*name* {#networksenddrop_name}

在通过网络接口发送时丢弃的包的次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkSendErrors_*name* {#networksenderrors_name}

在通过网络接口发送时发生错误（例如，TCP重传）的次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

由于用户使用`ALTER TABLE DETACH` 查询而从MergeTree表中分离的部分的总数（与意外、破损或被忽略的部分相对）。服务器不关心分离的部分，可以被删除。
### NumberOfDetachedParts {#numberofdetachedparts}

从MergeTree表中分离的部分的总数。某个部分可以通过用户执行`ALTER TABLE DETACH` 查询或由于部分损坏、意外或不需要而由服务器自身分离。服务器不关心分离的部分，可以被删除。
### NumberOfTables {#numberoftables}

服务器上数据库总数中合并树表之外的表的总数（不包括不能包含MergeTree表的数据库）。被排除的数据库引擎是那些动态生成表集的引擎，如`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。
### OSContextSwitches {#oscontextswitches}

主机上的上下文切换次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### OSGuestNiceTime {#osguestnicetime}

在Linux内核控制下运行虚拟CPU的时间比例，与较高优先级的guest操作系统。当guest设置为较高优先级时，计时该指标（详见`man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。此指标对于ClickHouse不相关，但仍然存在以满足完整性要求。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在Linux内核控制下运行虚拟CPU的时间比例，与较高优先级的guest操作系统。当guest设置为较高优先级时，计时该指标（详见`man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。此指标对于ClickHouse不相关，但仍然存在以满足完整性要求。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

此值类似于`OSGuestNiceTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSGuestTime {#osguesttime}

在Linux内核控制下运行虚拟CPU的时间比例（详见`man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。此指标对于ClickHouse不相关，但仍然存在以满足完整性要求。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在Linux内核控制下运行虚拟CPU的时间比例（详见`man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。此指标对于ClickHouse不相关，但仍然存在以满足完整性要求。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSGuestTimeNormalized {#osguesttimenormalized}

此值类似于`OSGuestTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSIOWaitTime {#osiowaittime}

CPU核心未执行代码但操作系统内核未在该CPU上运行任何其他进程（因为进程在等待I/O）所消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU核心未执行代码但操作系统内核未在该CPU上运行任何其他进程（因为进程在等待I/O）所消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

此值类似于`OSIOWaitTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSIdleTime {#osidletime}

CPU核心在操作系统内核观点下空闲（甚至不准备运行等待I/O的进程）所消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。此值不包括CPU由于CPU内部原因（内存负载、流水线停顿、分支误预测、运行另一个SMT核心）而未充分利用的时间。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPU核心在操作系统内核观点下空闲（甚至不准备运行等待I/O的进程）所消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。此值不包括CPU由于CPU内部原因（内存负载、流水线停顿、分支误预测、运行另一个SMT核心）而未充分利用的时间。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSIdleTimeNormalized {#osidletimenormalized}

此值类似于`OSIdleTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSInterrupts {#osinterrupts}

主机上的中断次数。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSIrqTime {#osirqtime}

用于执行硬件中断请求在CPU上消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。此指标的高值可能表明硬件配置错误或网络负载过高。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

用于执行硬件中断请求在CPU上消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。此指标的高值可能表明硬件配置错误或网络负载过高。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSIrqTimeNormalized {#osirqtimenormalized}

此值类似于`OSIrqTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSMemoryAvailable {#osmemoryavailable}

程序可用的内存量（以字节为单位）。这与`OSMemoryFreePlusCached`指标非常相似。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryBuffers {#osmemorybuffers}

操作系统内核缓冲区使用的内存量（以字节为单位）。通常应较小，大值可能表明操作系统配置错误。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryCached {#osmemorycached}

操作系统页面缓存使用的内存量（以字节为单位）。通常，几乎所有可用内存都由操作系统页面缓存使用 - 此指标的高值是正常且预期的。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统的可用内存加上操作系统页面缓存的内存量（以字节为单位）。该内存可以被程序使用。该值应该与`OSMemoryAvailable`非常相似。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统的可用内存量（以字节为单位）。不包括操作系统页面缓存内存的使用（以字节为单位）。页面缓存内存也可供程序使用，因此此指标的值可能会引起困惑。有关详细信息，请参见`OSMemoryAvailable`指标。为方便起见，我们还提供了`OSMemoryFreePlusCached`指标，该指标应该与OSMemoryAvailable相似。详见 https://www.linuxatemyram.com/。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryTotal {#osmemorytotal}

主机系统的内存总量（以字节为单位）。
### OSNiceTime {#osnicetime}

CPU核心运行用户空间代码的时间比例，其优先级较高。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU核心运行用户空间代码的时间比例，其优先级较高。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSNiceTimeNormalized {#osnicetimenormalized}

此值类似于`OSNiceTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSOpenFiles {#osopenfiles}

主机上打开的文件总数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### OSProcessesBlocked {#osprocessesblocked}

被阻塞等待I/O完成的线程数量（`man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### OSProcessesRunning {#osprocessesrunning}

操作系统可运行（运行或准备运行）线程的数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是clickhouse-server。
### OSSoftIrqTime {#ossoftirqtime}

用于执行软件中断请求在CPU上消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。该指标的高值可能表明系统上运行着低效软件。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

用于执行软件中断请求在CPU上消耗的时间比例。这是一个系统范围的指标，它包括主机上的所有进程，而不仅仅是clickhouse-server。该指标的高值可能表明系统上运行着低效软件。单个CPU核心的值在[0..1]区间内。所有CPU核心的值通过求和获得[0..核心数量]。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

此值类似于`OSSoftIrqTime`，但除以CPU核心数，测量的区间为[0..1]，与核心数无关。这使得在集群中多个服务器之间平均此指标的值成为可能，即使核心数量不统一，仍然可以获得平均资源利用度指标。
### OSStealTime {#osstealtime}

CPU在虚拟化环境中在其他操作系统上花费的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是clickhouse-server。并不是所有的虚拟化环境都会呈现这个指标，大部分都不会。单个CPU核心的值将在[0..1]的区间内。所有CPU核心的值通过对它们进行求和计算得出[0..num cores]。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

CPU在虚拟化环境中在其他操作系统上花费的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是clickhouse-server。并不是所有的虚拟化环境都会呈现这个指标，大部分都不会。单个CPU核心的值将在[0..1]的区间内。所有CPU核心的值通过对它们进行求和计算得出[0..num cores]。
### OSStealTimeNormalized {#osstealtimenormalized}

这个值类似于`OSStealTime`，但除以CPU核心的数量，以便在[0..1]的区间内进行测量，而不考虑核心的数量。这使您能够跨集群中的多个服务器平均这个指标的值，即使核心的数量不均匀，仍然可以获得平均资源利用率指标。
### OSSystemTime {#ossystemtime}

CPU核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在[0..1]的区间内。所有CPU核心的值通过对它们进行求和计算得出[0..num cores]。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在[0..1]的区间内。所有CPU核心的值通过对它们进行求和计算得出[0..num cores]。
### OSSystemTimeNormalized {#ossystemtimenormalized}

这个值类似于`OSSystemTime`，但除以CPU核心的数量，以便在[0..1]的区间内进行测量，而不考虑核心的数量。这使您能够跨集群中的多个服务器平均这个指标的值，即使核心的数量不均匀，仍然可以获得平均资源利用率指标。
### OSThreadsRunnable {#osthreadsrunnable}

总的“可运行”线程数量，操作系统内核调度器看到的。
### OSThreadsTotal {#osthreadstotal}

总线程数量，操作系统内核调度器看到的。
### OSUptime {#osuptime}

主机服务器（ClickHouse运行的机器）的正常运行时间，以秒为单位。
### OSUserTime {#osusertime}

CPU核心运行用户空间代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是clickhouse-server。这还包括由于CPU内部原因（内存负载、流水线停滞、分支预测错误、运行另一个SMT核心）而导致CPU未充分利用的时间。单个CPU核心的值将在[0..1]的区间内。所有CPU核心的值通过对它们进行求和计算得出[0..num cores]。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU核心运行用户空间代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是clickhouse-server。这还包括由于CPU内部原因（内存负载、流水线停滞、分支预测错误、运行另一个SMT核心）而导致CPU未充分利用的时间。单个CPU核心的值将在[0..1]的区间内。所有CPU核心的值通过对它们进行求和计算得出[0..num cores]。
### OSUserTimeNormalized {#osusertimenormalized}

这个值类似于`OSUserTime`，但除以CPU核心的数量，以便在[0..1]的区间内进行测量，而不考虑核心的数量。这使您能够跨集群中的多个服务器平均这个指标的值，即使核心的数量不均匀，仍然可以获得平均资源利用率指标。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL兼容协议服务器中的线程数量。
### QueryCacheBytes {#querycachebytes}

查询缓存的总大小，单位是字节。
### QueryCacheEntries {#querycacheentries}

查询缓存中的总条目数。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最新复制部分和仍需复制的最新数据部分之间的最大秒数差。非常高的值指示没有数据的副本。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在队列中（仍需复制）的最大INSERT操作数。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在队列中（仍需应用）的最大合并操作数。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在队列中的最大大小（以获取、合并等操作的数量计算）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

副本延迟与同一表的最新副本延迟之间的最大差值。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在队列中的INSERT操作数总和（仍需复制）。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在队列中的合并操作数总和（仍需应用）。
### ReplicasSumQueueSize {#replicassumqueuesize}

在队列中的大小总和（以获取、合并等操作的数量计算）。
### TCPThreads {#tcpthreads}

TCP协议服务器中的线程数量（不带TLS）。
### Temperature_*N* {#temperature_n}

对应设备的温度，单位是℃。传感器可能返回不真实的值。来源：`/sys/class/thermal`
### Temperature_*name* {#temperature_name}

对应硬件监视器和对应传感器报告的温度，单位是℃。传感器可能返回不真实的值。来源：`/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTree系列所有表中存储的字节总数（压缩，包括数据和索引）。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree系列所有表中数据部分的总数量。大于10,000的数字将会对服务器启动时间产生负面影响，并可能表明分区键选择不合理。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值占用的内存总量（以字节为单位，仅考虑活动部分）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值保留的内存总量（以字节为单位，仅考虑活动部分）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree系列所有表中存储的行（记录）的总数量。
### UncompressedCacheBytes {#uncompressedcachebytes}

未压缩缓存的总大小（以字节为单位）。未压缩缓存通常不会提升性能，并且应尽量避免使用。
### UncompressedCacheCells {#uncompressedcachecells}

未压缩缓存中的条目总数。每个条目代表一个解压缩的数据块。未压缩缓存通常不会提升性能，并且应尽量避免使用。
### Uptime {#uptime}

服务器正常运行时间，以秒为单位。包括接受连接之前的服务器初始化时间。
### jemalloc.active {#jemallocactive}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.allocated {#jemallocallocated}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evans的内存分配器）统计信息的内部增量更新编号，用于所有其他`jemalloc`指标。
### jemalloc.mapped {#jemallocmapped}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.metadata {#jemallocmetadata}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.metadata_thp {#jemallocmetadata_thp}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.resident {#jemallocresident}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.retained {#jemallocretained}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html
### jemalloc.prof.active {#jemallocprofactive}

低级内存分配器（jemalloc）的内部度量。详情见 https://jemalloc.net/jemalloc.3.html

**另请参阅**

- [监控](../../operations/monitoring.md) — ClickHouse监控的基础概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的一些事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自`system.metrics`和`system.events`表的指标值历史记录。
