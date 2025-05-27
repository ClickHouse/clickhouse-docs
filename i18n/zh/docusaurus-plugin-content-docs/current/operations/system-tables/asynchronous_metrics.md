---
'description': '系统表包含定期在后台计算的指标。例如，使用的RAM数量。'
'keywords':
- 'system table'
- 'asynchronous_metrics'
'slug': '/operations/system-tables/asynchronous_metrics'
'title': 'system.asynchronous_metrics'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';



# system.asynchronous_metrics

<SystemTableCloud/>

包含定期在后台计算的指标。例如，使用的RAM量。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。

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

<!--- 与system.events和system.metrics不同，异步指标并不在源代码文件中以简单列表的形式收集——它们与src/Interpreters/ServerAsynchronousMetrics.cpp中的逻辑混合在一起。
      这里明确列出是为了方便读者。 --->
## 指标描述 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

计算异步重（与表相关）指标所花费的时间（以秒为单位）（这是异步指标的开销）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重（与表相关）指标更新间隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

计算异步指标所花费的时间（以秒为单位）（这是异步指标的开销）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔。
### BlockActiveTime_*name* {#blockactivetime_name}

块设备上IO请求排队的时间（以秒为单位）。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上丢弃的字节数。这些操作与SSD相关。ClickHouse并不使用丢弃操作，但系统上的其他进程可以使用。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

从块设备请求的丢弃操作数，并由操作系统IO调度程序合并在一起。这些操作与SSD相关。ClickHouse并不使用丢弃操作，但系统上的其他进程可以使用。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

从块设备请求的丢弃操作数。这些操作与SSD相关。ClickHouse并不使用丢弃操作，但系统上的其他进程可以使用。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

对块设备请求的丢弃操作花费的时间（以秒为单位），跨所有操作进行求和。这些操作与SSD相关。ClickHouse并不使用丢弃操作，但系统上的其他进程可以使用。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

此值计算已发出的I/O请求数量，这些请求已发到设备驱动程序但尚未完成。它不包括在队列中但尚未发给设备驱动程序的IO请求。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

此值计算IO请求在此块设备上等待的毫秒数。如果有多个IO请求在等待，此值将随着等待请求数乘以等待的毫秒数而增加。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用操作系统页面缓存，读取的字节数可能低于从文件系统读取的字节数，这可以节省IO。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

从块设备请求的读取操作数，并被操作系统IO调度程序合并在一起。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

从块设备请求的读取操作数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

对块设备请求的读取操作花费的时间（以秒为单位），跨所有操作进行求和。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

写入块设备的字节数。由于使用操作系统页面缓存，写入的字节数可能低于写入文件系统的字节数。由于写透缓存，写入块设备的操作可能会晚于相应的写入文件系统的操作。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

从块设备请求的写入操作数，并被操作系统IO调度程序合并在一起。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

从块设备请求的写入操作数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

对块设备请求的写入操作花费的时间（以秒为单位），跨所有操作进行求和。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。来源：`/sys/block`。请参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU的当前频率，以MHz为单位。大多数现代CPU动态调整频率以节省电力和Turbo Boost。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

用于JIT编译代码缓存的总字节数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JIT编译代码缓存中的总条目数。
### DiskAvailable_*name* {#diskavailable_name}

磁盘上的可用字节（虚拟文件系统）。远程文件系统可以显示一个很大的值，例如16 EiB。
### DiskTotal_*name* {#disktotal_name}

磁盘的总大小（字节数）（虚拟文件系统）。远程文件系统可以显示一个很大的值，例如16 EiB。
### DiskUnreserved_*name* {#diskunreserved_name}

磁盘上的可用字节（虚拟文件系统），不包括用于合并、抓取和移动的保留空间。远程文件系统可以显示一个很大的值，例如16 EiB。
### DiskUsed_*name* {#diskused_name}

磁盘上使用的字节（虚拟文件系统）。远程文件系统并不总是提供此信息。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中的总字节数。此缓存保留在磁盘上。
### FilesystemCacheFiles {#filesystemcachefiles}

在 `cache` 虚拟文件系统中缓存的文件段的总数。此缓存保留在磁盘上。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

安装ClickHouse日志路径的卷上的可用字节。如果该值接近于零，则应调整配置文件中的日志轮换设置。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

安装ClickHouse日志路径的卷上可用的inode数量。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

安装ClickHouse日志路径的卷的大小（以字节为单位）。建议日志至少有10 GB。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

安装ClickHouse日志路径的卷上的inode总数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

安装ClickHouse日志路径的卷上使用的字节。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

安装ClickHouse日志路径的卷上使用的inode数量。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

安装主ClickHouse路径的卷上的可用字节。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

安装主ClickHouse路径的卷上可用的inode数量。如果接近于零，表示配置错误，您将会提示"设备没有剩余空间"即使磁盘未满。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

安装主ClickHouse路径的卷的大小（以字节为单位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

安装主ClickHouse路径的卷上的inode总数。如果少于2500万，表示配置错误。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

安装主ClickHouse路径的卷上使用的字节。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

安装主ClickHouse路径的卷上使用的inode数量。这个值大部分对应于文件数量。
### HTTPThreads {#httpthreads}

HTTP接口服务器中的线程数量（不带TLS）。
### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数量（不带TLS）。
### Jitter {#jitter}

用于计算异步指标的线程调度唤醒时间与实际唤醒时间之间的时间差。系统延迟和响应性的间接指标。
### LoadAverage*N* {#loadaveragen}

整个系统负载，经过1分钟的指数平滑平均。负载表示所有进程（操作系统内核的调度实体）当前在CPU上运行或等待IO，或准备运行但此时未调度的线程数量。该数字包括所有进程，而不仅仅是clickhouse-server。如果系统过载，且许多进程准备运行但等待CPU或IO，则该数字可能大于CPU核心数。
### MMapCacheCells {#mmapcachecells}

以`mmap`方式打开的文件数量（映射到内存中）。这用于设置为`mmap`的查询。以`mmap`方式打开的文件保留在缓存中，以避免代价高昂的TLB清除。
### MarkCacheBytes {#markcachebytes}

标记缓存的总大小（以字节为单位）。
### MarkCacheFiles {#markcachefiles}

标记缓存中缓存的标记文件的总数。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree系列所有表中每个分区的最大部分数量。大于300的值表示配置错误、过载或大量数据加载。
### MemoryCode {#memorycode}

为服务器进程的机器代码页映射的虚拟内存量（以字节为单位）。
### MemoryDataAndStack {#memorydataandstack}

为堆栈和分配的内存使用映射的虚拟内存量（以字节为单位）。尚未明确说明它是否包括每个线程的堆栈和大部分是通过`mmap`系统调用分配的内存。此指标的存在仅为完整性原因。建议使用`MemoryResident`指标进行监控。
### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的最大物理内存量（以字节为单位）。
### MemoryResident {#memoryresident}

服务器进程使用的物理内存量（以字节为单位）。
### MemoryShared {#memoryshared}

服务器进程使用的内存量，同时被其他进程共享（以字节为单位）。ClickHouse不使用共享内存，但某些内存可以被操作系统标记为共享出于自身原因。此指标并不太具有监控意义，存在的原因仅为完整性考虑。
### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间的大小（以字节为单位）。虚拟地址空间的大小通常远大于物理内存消耗，不应作为内存消耗的估计。此指标的大值是完全正常的，仅在技术上有意义。
### MySQLThreads {#mysqlthreads}

MySQL兼容协议服务器中的线程数量。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

在通过网络接口接收时丢弃的包的字节数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

在通过网络接口接收时发生错误的次数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络包数量。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkSendDrop_*name* {#networksenddrop_name}

通过网络接口发送时丢弃的包的次数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkSendErrors_*name* {#networksenderrors_name}

通过网络接口发送时发生错误（例如TCP重传）的次数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络包数量。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

由于用户执行`ALTER TABLE DETACH`查询而从MergeTree表中分离的部分总数（与意外、损坏或被忽略的部分相对）。服务器不会关心分离的部分，可以将其删除。
### NumberOfDetachedParts {#numberofdetachedparts}

从MergeTree表中分离的部分总数。部分可以通过用户使用`ALTER TABLE DETACH`查询或由服务器本身分离，如果该部分损坏、意外或不需要。服务器不会关心分离的部分，可以将其删除。
### NumberOfTables {#numberoftables}

服务器上所有数据库的表总数，不包括不能包含MergeTree表的数据库。被排除的数据库引擎是那些动态生成表集的，如`Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。
### OSContextSwitches {#oscontextswitches}

主机上的上下文切换次数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSGuestNiceTime {#osguestnicetime}

在Linux内核控制下，为高优先级设置的来宾操作系统运行虚拟CPU所花费的时间比例（请参见`man procfs`）。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。此指标对ClickHouse不相关，但仍然存在以供完整性使用。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在Linux内核控制下，为高优先级设置的来宾操作系统运行虚拟CPU所花费的时间比例（请参见`man procfs`）。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。此指标对ClickHouse不相关，但仍然存在以供完整性使用。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值类似于`OSGuestNiceTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSGuestTime {#osguesttime}

在Linux内核控制下，为来宾操作系统运行虚拟CPU所花费的时间比例（请参见`man procfs`）。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。此指标对ClickHouse不相关，但仍然存在以供完整性使用。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在Linux内核控制下，为来宾操作系统运行虚拟CPU所花费的时间比例（请参见`man procfs`）。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。此指标对ClickHouse不相关，但仍然存在以供完整性使用。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSGuestTimeNormalized {#osguesttimenormalized}

该值类似于`OSGuestTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSIOWaitTime {#osiowaittime}

CPU核心未执行代码但操作系统内核未在该CPU上运行任何其他进程的时间比例，因为这些进程在等待IO。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU核心未执行代码但操作系统内核未在该CPU上运行任何其他进程的时间比例，因为这些进程在等待IO。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值类似于`OSIOWaitTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSIdleTime {#osidletime}

CPU核心处于空闲状态（甚至没有准备好运行等待IO的进程）的比例，从操作系统内核的角度来看。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。这不包括由于CPU内部原因（内存加载、流水线停顿、分支错误预测、运行其他SMT核心）而导致CPU未充分利用的时间。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPU核心处于空闲状态（甚至没有准备好运行等待IO的进程）的比例，从操作系统内核的角度来看。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。这不包括由于CPU内部原因（内存加载、流水线停顿、分支错误预测、运行其他SMT核心）而导致CPU未充分利用的时间。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSIdleTimeNormalized {#osidletimenormalized}

该值类似于`OSIdleTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSInterrupts {#osinterrupts}

主机上的中断次数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSIrqTime {#osirqtime}

用于处理硬件中断请求的CPU所花费的时间比例。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。该指标的值较高可能表明硬件配置错误或网络负载非常高。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

用于处理硬件中断请求的CPU所花费的时间比例。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。该指标的值较高可能表明硬件配置错误或网络负载非常高。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSIrqTimeNormalized {#osirqtimenormalized}

该值类似于`OSIrqTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存量（以字节为单位）。这与`OSMemoryFreePlusCached`指标非常相似。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryBuffers {#osmemorybuffers}

操作系统内核缓冲区使用的内存量（以字节为单位）。通常应较小，大值可能表示操作系统配置错误。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryCached {#osmemorycached}

操作系统页面缓存使用的内存量（以字节为单位）。通常，几乎所有可用内存都被操作系统页面缓存使用——此指标的高值是正常且预期的。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统上可用的自由内存加上操作系统页面缓存使用的内存量（以字节为单位）。该内存可供程序使用。该值应与`OSMemoryAvailable`非常相似。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上的可用自由内存量（以字节为单位）。这不包括操作系统页面缓存使用的内存（以字节为单位）。页面缓存内存也可供程序使用，因此该指标的值可能会令人困惑。请查看`OSMemoryAvailable`指标。为了方便起见，我们还提供了`OSMemoryFreePlusCached`指标，该指标应与OSMemoryAvailable有一定的相似性。请参见 https://www.linuxatemyram.com/。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSMemoryTotal {#osmemorytotal}

主机系统上的总内存量（以字节为单位）。
### OSNiceTime {#osnicetime}

CPU核心运行用户空间代码（高优先级）的时间比例。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU核心运行用户空间代码（高优先级）的时间比例。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSNiceTimeNormalized {#osnicetimenormalized}

该值类似于`OSNiceTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSOpenFiles {#osopenfiles}

主机上打开的文件总数。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSProcessesBlocked {#osprocessesblocked}

在等待I/O完成的情况下被阻塞的线程数量（`man procfs`）。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSProcessesRunning {#osprocessesrunning}

操作系统中可运行（正在运行或准备运行）的线程数量。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。
### OSSoftIrqTime {#ossoftirqtime}

用于处理软件中断请求的CPU所花费的时间比例。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。该指标的值较高可能表明系统上运行的软件效率低下。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

用于处理软件中断请求的CPU所花费的时间比例。这是系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。该指标的值较高可能表明系统上运行的软件效率低下。单个CPU核心的值将在[0..1]区间内。所有CPU核心的值通过将它们相加得出[0..num cores]。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值类似于`OSSoftIrqTime`，但是除以CPU核心数量，以便在[0..1]区间内进行测量，无论核心数量如何。这使得您可以在集群中对多个服务器的此指标的值进行平均，即使核心数量不均匀，仍然获得平均资源利用率指标。

### OSStealTime {#osstealtime}

在虚拟化环境中，CPU 在其他操作系统上花费的时间比率。这是一个系统级的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供此指标，而且大多数环境并不提供。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值通过它们的总和计算得到：[0..num cores]。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

在虚拟化环境中，CPU 在其他操作系统上花费的时间比率。这是一个系统级的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供此指标，而且大多数环境并不提供。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值通过它们的总和计算得到：[0..num cores]。
### OSStealTimeNormalized {#osstealtimenormalized}

该值与 `OSStealTime` 相似，但除以 CPU 核心的数量，以便在 [0..1] 的区间内进行测量，而不管核心数量。这使您能够即使在核心数量不均匀的情况下，也能够在集群中对多个服务器的此指标进行平均值计算，并获取平均资源利用率指标。
### OSSystemTime {#ossystemtime}

CPU 核心运行操作系统内核（系统）代码的时间比率。这是一个系统级的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值通过它们的总和计算得到：[0..num cores]。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU 核心运行操作系统内核（系统）代码的时间比率。这是一个系统级的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值通过它们的总和计算得到：[0..num cores]。
### OSSystemTimeNormalized {#ossystemtimenormalized}

该值与 `OSSystemTime` 相似，但除以 CPU 核心的数量，以便在 [0..1] 的区间内进行测量，而不管核心数量。这使您能够即使在核心数量不均匀的情况下，也能够在集群中对多个服务器的此指标进行平均值计算，并获取平均资源利用率指标。
### OSThreadsRunnable {#osthreadsrunnable}

“可运行”线程的总数，作为操作系统内核调度器看到的。
### OSThreadsTotal {#osthreadstotal}

线程的总数，作为操作系统内核调度器看到的。
### OSUptime {#osuptime}

主机服务器（运行 ClickHouse 的机器）的正常运行时间，以秒为单位。
### OSUserTime {#osusertime}

CPU 核心运行用户空间代码的时间比率。这是一个系统级的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。这还包括 CPU 由于 CPU 内部原因（内存负载、管道停滞、分支预测失误、运行另一个 SMT 核心）而未充分利用的时间。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值通过它们的总和计算得到：[0..num cores]。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU 核心运行用户空间代码的时间比率。这是一个系统级的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。这还包括 CPU 由于 CPU 内部原因（内存负载、管道停滞、分支预测失误、运行另一个 SMT 核心）而未充分利用的时间。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值通过它们的总和计算得到：[0..num cores]。
### OSUserTimeNormalized {#osusertimenormalized}

该值与 `OSUserTime` 相似，但除以 CPU 核心的数量，以便在 [0..1] 的区间内进行测量，而不管核心数量。这使您能够即使在核心数量不均匀的情况下，也能够在集群中对多个服务器的此指标进行平均值计算，并获取平均资源利用率指标。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 兼容协议服务器中的线程数。
### QueryCacheBytes {#querycachebytes}

查询缓存的总大小（以字节为单位）。
### QueryCacheEntries {#querycacheentries}

查询缓存中的总条目数。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最新复制部分和尚未复制的最新数据部分之间的最大时间差（以秒为单位），适用于复制表。非常高的值表示没有数据的副本。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在复制表中，队列中（尚待复制）的最大 INSERT 操作数量。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在复制表中，队列中（尚待应用）的最大合并操作数量。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在复制表中，最大队列大小（以操作数量如 get、merge 为单位）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

在复制表中，副本延迟与同一表的最新副本的延迟之间的最大差异。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在复制表中，队列中的 INSERT 操作总和（仍待复制）。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在复制表中，队列中的合并操作总和（仍待应用）。
### ReplicasSumQueueSize {#replicassumqueuesize}

在复制表中，队列总大小（以操作数量如 get、merge 为单位）。
### TCPThreads {#tcpthreads}

TCP 协议（无 TLS）中服务器中的线程数。
### Temperature_*N* {#temperature_n}

对应设备的温度（以 ℃ 为单位）。传感器可能返回不现实的值。来源：`/sys/class/thermal`
### Temperature_*name* {#temperature_name}

对应硬件监控器和相应传感器报告的温度（以 ℃ 为单位）。传感器可能返回不现实的值。来源：`/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

所有 MergeTree 家族表中存储的总字节数（压缩后，包括数据和索引）。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

所有 MergeTree 家族表中数据部分的总数量。大于 10,000 的数字将对服务器启动时间产生负面影响，并可能指示分区键的不合理选择。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值占用的总内存（以字节为单位）（仅考虑活动部分）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值保留的总内存（以字节为单位）（仅考虑活动部分）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

所有 MergeTree 家族表中存储的行（记录）总数。
### UncompressedCacheBytes {#uncompressedcachebytes}

未压缩缓存的总大小，以字节为单位。未压缩的缓存通常不会提高性能，并且应尽量避免。
### UncompressedCacheCells {#uncompressedcachecells}

未压缩缓存中的条目总数。每个条目代表一个解压缩的数据块。未压缩的缓存通常不会提高性能，并且应尽量避免。
### Uptime {#uptime}

服务器的正常运行时间（以秒为单位）。它包括在接受连接之前用于服务器初始化的时间。
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

jemalloc（Jason Evans 的内存分配器）统计信息的内部增量更新编号，用于所有其他 `jemalloc` 指标。
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

**另请参阅**

- [监控](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的多个事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。
