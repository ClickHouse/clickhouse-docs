---
'description': 'System table containing metrics that are calculated periodically in
  the background. For example, the amount of RAM in use.'
'keywords':
- 'system table'
- 'asynchronous_metrics'
'slug': '/operations/system-tables/asynchronous_metrics'
'title': 'system.asynchronous_metrics'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics

<SystemTableCloud/>

包含周期性在后台计算的指标。例如，使用的RAM量。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md) - 指标描述)

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

<!--- 与 system.events 和 system.metrics 不同，异步指标不会以简单列表的形式在源代码文件中收集 - 它们与逻辑混合在 src/Interpreters/ServerAsynchronousMetrics.cpp 中。
      这里明确列出以方便读者。 --->
## 指标描述 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

计算异步重（与表有关）指标花费的时间（以秒为单位）（这就是异步指标的开销）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重（与表有关）指标更新间隔
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

计算异步指标花费的时间（以秒为单位）（这就是异步指标的开销）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔
### BlockActiveTime_*name* {#blockactivetime_name}

块设备排队的IO请求花费的时间（以秒为单位）。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上丢弃的字节数。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统中的其他进程可以使用。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

请求从块设备丢弃的操作次数，并由OS IO调度程序合并在一起。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统中的其他进程可以使用。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

请求从块设备丢弃的操作次数。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统中的其他进程可以使用。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

从块设备请求丢弃操作花费的时间（以秒为单位），总结所有操作。这些操作与SSD相关。ClickHouse不使用丢弃操作，但系统中的其他进程可以使用。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

该值计算已经发出的I/O请求的数量，但尚未完成。它不包括排队但尚未发给设备驱动程序的IO请求。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

该值计算在此块设备上IO请求等待的毫秒数。如果有多个IO请求待处理，则该值将随着等待请求数量的增加而增加。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用了OS页面缓存，读取的字节数可能低于从文件系统读取的字节数，缓存能够节省IO。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

从块设备请求的读取操作次数，并由OS IO调度程序合并在一起。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

请求从块设备读取的操作次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

从块设备请求读取操作花费的时间（以秒为单位），总结所有操作。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

写入到块设备的字节数。由于使用了OS页面缓存，写入的字节数可能低于写入到文件系统的字节数。写入到块设备的操作可能发生得比写入到文件系统的操作更晚，因为使用了写直通缓存。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

请求从块设备进行的写操作次数，并由OS IO调度程序合并在一起。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

请求从块设备进行的写操作次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

从块设备请求写入操作花费的时间（以秒为单位），总结所有操作。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

当前CPU的频率，以MHz为单位。大多数现代CPU会动态调整频率以节省功耗并实现增压。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

JIT编译代码缓存所使用的总字节数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JIT编译代码缓存中的条目总数。
### DiskAvailable_*name* {#diskavailable_name}

磁盘（虚拟文件系统）上的可用字节数。远程文件系统可能会显示像 16 EiB 这样的较大值。
### DiskTotal_*name* {#disktotal_name}

磁盘（虚拟文件系统）的总大小（以字节为单位）。远程文件系统可能会显示像 16 EiB 这样的较大值。
### DiskUnreserved_*name* {#diskunreserved_name}

磁盘（虚拟文件系统）上可用的字节数，不包括用于合并、提取和移动的保留空间。远程文件系统可能会显示像 16 EiB 这样的较大值。
### DiskUsed_*name* {#diskused_name}

磁盘（虚拟文件系统）上已使用的字节数。远程文件系统并不总是提供此信息。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中的总字节数。此缓存保留在磁盘上。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 虚拟文件系统中缓存的文件段总数。此缓存保留在磁盘上。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse日志路径所在卷上的可用字节数。如果此值接近零，则应在配置文件中调整日志轮换。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse日志路径所在卷上的可用i节点数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse日志路径所在卷的大小（以字节为单位）。建议为日志预留至少 10 GB。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse日志路径所在卷上的总i节点数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse日志路径所在卷上的已使用字节数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse日志路径所在卷上的已使用i节点数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主ClickHouse路径所在卷上的可用字节数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主ClickHouse路径所在卷上的可用i节点数。如果接近零，则表示配置错误，您将看到“设备上没有剩余空间”即使磁盘未满。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主ClickHouse路径所在卷的大小（以字节为单位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主ClickHouse路径所在卷的总i节点数。如果少于2500万，表示配置错误。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主ClickHouse路径所在卷上的已使用字节数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主ClickHouse路径所在卷上的已使用i节点数。此值大多与文件数量相对应。
### HTTPThreads {#httpthreads}

HTTP接口服务器中的线程数（不包括TLS）。
### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数（不包括TLS）。
### Jitter {#jitter}

用于计算异步指标的线程计划唤醒时间与实际唤醒时间之间的时间差。系统整体延迟和响应能力的代理指标。
### LoadAverage*N* {#loadaveragen}

整个系统的负载，经过1分钟的指数平滑平均。负载代表当前由CPU运行或等待IO的所有进程中线程的数量，或者准备运行但此时未被调度的线程数量。这个数字包括所有进程，而不仅仅是 clickhouse-server。如果系统过载，准备运行的很多进程在等待CPU或IO，数字可能会大于CPU核心数量。
### MMapCacheCells {#mmapcachecells}

使用 `mmap` 打开的文件数（在内存中映射）。这用于设置为 `mmap` 的查询，其中 `local_filesystem_read_method` 设置。使用 `mmap` 打开的文件被保留在缓存中，以避免困难的TLB刷新。
### MarkCacheBytes {#markcachebytes}

标记缓存的总字节数
### MarkCacheFiles {#markcachefiles}

标记缓存中缓存的标记文件总数
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree系列所有表的每个分区的最大部分数。大于300的值表示配置错误、过载或大量数据加载。
### MemoryCode {#memorycode}

为服务器进程的机器代码页面映射的虚拟内存量，以字节为单位。
### MemoryDataAndStack {#memorydataandstack}

为堆栈和分配的内存映射的虚拟内存量，以字节为单位。是否包含每线程堆栈和大部分通过 'mmap' 系统调用分配的内存未指定。此指标仅是为了完整性存在。我建议使用 `MemoryResident` 指标进行监控。
### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的最大物理内存量，以字节为单位。
### MemoryResident {#memoryresident}

服务器进程使用的物理内存量，以字节为单位。
### MemoryShared {#memoryshared}

服务器进程使用的内存量，同时也被其他进程共享，以字节为单位。ClickHouse不使用共享内存，但OS可能会出于自己的原因将一些内存标记为共享。监控此指标并没有太大意义，仅为完整性而存在。
### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间的大小，以字节为单位。虚拟地址空间的大小通常远大于物理内存的消耗，不应用作内存消耗的估计。此指标的大值是完全正常的，仅有技术意义。
### MySQLThreads {#mysqlthreads}

MySQL兼容协议服务器中的线程数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

在网络接口接收时丢弃的字节数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

通过网络接口接收时发生错误的次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收到的网络数据包的数量。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendDrop_*name* {#networksenddrop_name}

通过网络接口发送时丢弃的数据包的次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendErrors_*name* {#networksenderrors_name}

通过网络接口发送时发生错误（例如TCP重传）的次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包的数量。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### NumberOfDatabases {#numberofdatabases}

服务器上数据库的总数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

通过用户使用 `ALTER TABLE DETACH` 查询从MergeTree表中分离的部分的总数（与意外、损坏或被忽略的部分相对）。服务器不关心分离的部分，它们可以被移除。
### NumberOfDetachedParts {#numberofdetachedparts}

从MergeTree表中分离的部分的总数。部分可以通过用户使用 `ALTER TABLE DETACH` 查询分离，或者如果部分损坏、不期望或不需要，服务器本身也可以分离。服务器不关心分离的部分，它们可以被移除。
### NumberOfTables {#numberoftables}

服务器上所有数据库的表的总数，不包括不能包含MergeTree表的数据库。被排除的数据库引擎是那些动态生成表集合的，比如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。
### OSContextSwitches {#oscontextswitches}

系统在主机上经历的上下文切换次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSGuestNiceTime {#osguestnicetime}

在Linux内核控制下，为客户操作系统运行虚拟CPU所花费的时间比例，当客户被设置为更高优先级时（请参见 `man procfs`）。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标对ClickHouse不相关，但仍为完整性而存在。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在Linux内核控制下，为客户操作系统运行虚拟CPU所花费的时间比例，当客户被设置为更高优先级时（请参见 `man procfs`）。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标对ClickHouse不相关，但仍为完整性而存在。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值与 `OSGuestNiceTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSGuestTime {#osguesttime}

在Linux内核控制下，为客户操作系统运行虚拟CPU所花费的时间比例（请参见 `man procfs`）。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标对ClickHouse不相关，但仍为完整性而存在。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在Linux内核控制下，为客户操作系统运行虚拟CPU所花费的时间比例（请参见 `man procfs`）。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标对ClickHouse不相关，但仍为完整性而存在。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSGuestTimeNormalized {#osguesttimenormalized}

该值与 `OSGuestTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSIOWaitTime {#osiowaittime}

CPU核心未运行代码的时间比例，但当OS内核未在此CPU上运行任何其他进程，因为进程在等待IO。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU核心未运行代码的时间比例，但当OS内核未在此CPU上运行任何其他进程，因为进程在等待IO。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值与 `OSIOWaitTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSIdleTime {#osidletime}

CPU核心空闲的时间比例（甚至没有准备运行等待IO的进程），这是从OS内核的角度来看。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此值不包括由于CPU内部原因导致CPU被低效利用的时间（内存加载、流水线停顿、分支错误预测、运行另一个SMT核心）。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPU核心空闲的时间比例（甚至没有准备运行等待IO的进程），这是从OS内核的角度来看。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此值不包括由于CPU内部原因导致CPU被低效利用的时间（内存加载、流水线停顿、分支错误预测、运行另一个SMT核心）。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSIdleTimeNormalized {#osidletimenormalized}

该值与 `OSIdleTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSInterrupts {#osinterrupts}

主机上的中断次数。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSIrqTime {#osirqtime}

用于在CPU上运行硬件中断请求的时间比例。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标的高值可能暗示硬件配置错误或非常大的网络负载。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

用于在CPU上运行硬件中断请求的时间比例。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标的高值可能暗示硬件配置错误或非常大的网络负载。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSIrqTimeNormalized {#osirqtimenormalized}

该值与 `OSIrqTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存量，以字节为单位。这与 `OSMemoryFreePlusCached` 指标非常相似。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryBuffers {#osmemorybuffers}

OS内核缓冲区使用的内存量，以字节为单位。通常应该很小，大值可能表明OS配置错误。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryCached {#osmemorycached}

OS页面缓存使用的内存量，以字节为单位。通常，几乎所有可用的内存都被OS页面缓存使用 - 该指标的高值是正常且预期的。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统上的空闲内存加上OS页面缓存的内存量，以字节为单位。此内存可供程序使用。该值应与 `OSMemoryAvailable` 非常相似。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上可用的空闲内存量，以字节为单位。此值不包括由OS页面缓存使用的内存，以字节为单位。页面缓存的内存也可以供程序使用，因此该指标的值可能会产生混淆。请查看 `OSMemoryAvailable` 指标。而且，为了方便，我们也提供了 `OSMemoryFreePlusCached` 指标，该指标应与OSMemoryAvailable稍有相似。也请参见 https://www.linuxatemyram.com/。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryTotal {#osmemorytotal}

主机系统上的总内存量，以字节为单位。
### OSNiceTime {#osnicetime}

CPU核心运行用户空间代码时的高优先级时间比例。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU核心运行用户空间代码时的高优先级时间比例。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSNiceTimeNormalized {#osnicetimenormalized}

该值与 `OSNiceTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSOpenFiles {#osopenfiles}

主机上打开的文件总数。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSProcessesBlocked {#osprocessesblocked}

等待I/O完成而被阻塞的线程数（`man procfs`）。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSProcessesRunning {#osprocessesrunning}

操作系统可运行（运行或准备运行）的线程数量。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。
### OSSoftIrqTime {#ossoftirqtime}

用于在CPU上运行软件中断请求的时间比例。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标的高值可能表明系统上运行的软件效率低下。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

用于在CPU上运行软件中断请求的时间比例。这是一项系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标的高值可能表明系统上运行的软件效率低下。单个CPU核心的值将在 [0..1] 的范围内。所有CPU核心的值作为它们的总和计算 [0..核心数量]。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值与 `OSSoftIrqTime` 类似，但除以CPU核心的数量，以便在 [0..1] 的范围内测量，而与核心数量无关。这使得您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以获得平均资源利用指标。
### OSStealTime {#osstealtime}

CPU在虚拟化环境中运行时在其他操作系统中花费的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是clickhouse-server。并非所有虚拟化环境都提供此指标，大多数并不提供。单个CPU核心的值将位于[0..1]之间。所有CPU核心的值是通过它们的总和计算得出的[0..num cores]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

CPU在虚拟化环境中运行时在其他操作系统中花费的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是clickhouse-server。并非所有虚拟化环境都提供此指标，大多数并不提供。单个CPU核心的值将位于[0..1]之间。所有CPU核心的值是通过它们的总和计算得出的[0..num cores]。

### OSStealTimeNormalized {#osstealtimenormalized}

该值与`OSStealTime`相似，但通过CPU核心的数量进行划分，以在[0..1]区间内进行测量，而不考虑核心的数量。这使得您可以跨多个服务器平均此指标的值，即使核心数量不均匀，仍然可以获得平均资源利用率指标。

### OSSystemTime {#ossystemtime}

CPU核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将位于[0..1]之间。所有CPU核心的值是通过它们的总和计算得出的[0..num cores]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将位于[0..1]之间。所有CPU核心的值是通过它们的总和计算得出的[0..num cores]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

该值与`OSSystemTime`相似，但通过CPU核心的数量进行划分，以在[0..1]区间内进行测量，而不考虑核心的数量。这使得您可以跨多个服务器平均此指标的值，即使核心数量不均匀，仍然可以获得平均资源利用率指标。

### OSThreadsRunnable {#osthreadsrunnable}

按操作系统内核调度程序看到的“可运行”线程的总数。

### OSThreadsTotal {#osthreadstotal}

按操作系统内核调度程序看到的线程总数。

### OSUptime {#osuptime}

主机服务器（ClickHouse运行的机器）的运行时间，以秒为单位。

### OSUserTime {#osusertime}

CPU核心运行用户空间代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是clickhouse-server。这也包括由于CPU内部原因（内存负载、管道停滞、分支预测错误、运行另一个SMT核心）导致CPU未充分利用的时间。单个CPU核心的值将位于[0..1]之间。所有CPU核心的值是通过它们的总和计算得出的[0..num cores]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU核心运行用户空间代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是clickhouse-server。这也包括由于CPU内部原因（内存负载、管道停滞、分支预测错误、运行另一个SMT核心）导致CPU未充分利用的时间。单个CPU核心的值将位于[0..1]之间。所有CPU核心的值是通过它们的总和计算得出的[0..num cores]。

### OSUserTimeNormalized {#osusertimenormalized}

该值与`OSUserTime`相似，但通过CPU核心的数量进行划分，以在[0..1]区间内进行测量，而不考虑核心的数量。这使得您可以跨多个服务器平均此指标的值，即使核心数量不均匀，仍然可以获得平均资源利用率指标。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL兼容协议服务器中的线程数量。

### QueryCacheBytes {#querycachebytes}

查询缓存的总大小（以字节为单位）。

### QueryCacheEntries {#querycacheentries}

查询缓存中的总条目数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

在Replicated表中，最新复制部分和最新待复制数据部分之间的最大差异（以秒为单位）。非常高的值表示一个没有数据的副本。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在Replicated表中，队列中最大INSERT操作的数量（仍待复制）。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在Replicated表中，队列中最大合并操作的数量（仍待应用）。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在Replicated表中，最大队列大小（按操作数量计算，比如get、merge）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

在Replicated表中，副本延迟与同一表最新副本的延迟之间的最大差异。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在Replicated表中，队列中INSERT操作的总和（仍待复制）。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在Replicated表中，队列中合并操作的总和（仍待应用）。

### ReplicasSumQueueSize {#replicassumqueuesize}

在Replicated表中，队列的总大小（按操作数量计算，比如get、merge）。

### TCPThreads {#tcpthreads}

TCP协议服务器中的线程数量（不包括TLS）。

### Temperature_*N* {#temperature_n}

对应设备的温度（以℃为单位）。传感器可能返回不合理的值。来源：`/sys/class/thermal`

### Temperature_*name* {#temperature_name}

由相应硬件监控器和相应传感器报告的温度（以℃为单位）。传感器可能返回不合理的值。来源：`/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTree系列所有表中存储的字节总量（压缩，包括数据和索引）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree系列所有表中数据部分的总量。大于10,000的数字会对服务器启动时间产生负面影响，并可能表示分区键的选择不合理。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值占用的内存总量（以字节为单位）（仅计算活动部分）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值保留的内存总量（以字节为单位）（仅计算活动部分）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree系列所有表中存储的行（记录）总量。

### UncompressedCacheBytes {#uncompressedcachebytes}

未压缩缓存的总大小（以字节为单位）。未压缩缓存通常不会提高性能，应该尽量避免。

### UncompressedCacheCells {#uncompressedcachecells}

未压缩缓存中条目的总数。每个条目代表解压缩的数据块。未压缩缓存通常不会提高性能，应该尽量避免。

### Uptime {#uptime}

服务器的运行时间（以秒为单位）。包含在接受连接之前服务器初始化所花费的时间。

### jemalloc.active {#jemallocactive}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.allocated {#jemallocallocated}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evans的内存分配器）统计数据的内部增量更新编号，用于所有其他`jemalloc`指标。

### jemalloc.mapped {#jemallocmapped}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata {#jemallocmetadata}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata_thp {#jemallocmetadata_thp}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.resident {#jemallocresident}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.retained {#jemallocretained}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.prof.active {#jemallocprofactive}

低级内存分配器（jemalloc）的内部指标。请参见 https://jemalloc.net/jemalloc.3.html

**参考**

- [监控](../../operations/monitoring.md) — ClickHouse监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含已发生的一些事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自`system.metrics`和`system.events`表的指标值历史记录。
