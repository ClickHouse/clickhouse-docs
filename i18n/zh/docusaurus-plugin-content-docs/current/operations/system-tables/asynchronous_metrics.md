---
'description': '系统表，包含在后台定期计算的指标。例如，使用中的RAM数量。'
'keywords':
- 'system table'
- 'asynchronous_metrics'
'slug': '/operations/system-tables/asynchronous_metrics'
'title': 'system.asynchronous_metrics'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';



# system.asynchronous_metrics

<SystemTableCloud/>

包含在后台定期计算的指标。例如，RAM 的使用量。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) - 指标描述

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

<!--- 与 system.events 和 system.metrics 不同，异步指标不是在源码文件中以简单列表形式收集的 - 它们与 src/Interpreters/ServerAsynchronousMetrics.cpp 中的逻辑混合在一起。为便于读者，特此在此处显式列出。 --->
## 指标描述 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

计算异步重指标（与表相关）的花费时间（秒）。（这是异步指标的开销）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重指标（与表相关）的更新间隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

计算异步指标的花费时间（秒）。（这是异步指标的开销）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔。
### BlockActiveTime_*name* {#blockactivetime_name}

块设备排队的 IO 请求所花费的时间（秒）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上丢弃的字节数。这些操作对 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

从块设备请求的丢弃操作的数量，并由操作系统 IO 调度器合并在一起。这些操作对 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

从块设备请求的丢弃操作的数量。这些操作对 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

从块设备请求的丢弃操作花费的时间（秒），所有操作的总和。这些操作对 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

此值计算已发出的 IO 请求的数量，但尚未完成。它不包括在队列中的 IO 请求，但尚未发给设备驱动程序。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

此值计算在此块设备上等待的 IO 请求的毫秒数。如果有多个 IO 请求在等待，则此值将增加，计算为毫秒数与等待请求数的乘积。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用了 OS 页缓存，可能低于从文件系统读取的字节数，保存了 IO。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

从块设备请求的读取操作数量，并由操作系统 IO 调度器合并在一起。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

从块设备请求的读取操作数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

从块设备请求的读取操作花费的时间（秒），所有操作的总和。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

写入块设备的字节数。由于使用了 OS 页缓存，可能低于写入文件系统的字节数。因为写入块设备可能在对应的写入文件系统后发生，所以可能发生写透缓存。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

从块设备请求的写入操作数量，并由操作系统 IO 调度器合并在一起。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

从块设备请求的写入操作数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

从块设备请求的写入操作花费的时间（秒），所有操作的总和。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。请参阅 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU 的当前频率，单位为 MHz。大多数现代 CPU 根据电源节省和涡轮增压动态调整频率。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

用于 JIT 编译代码缓存的总字节数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JIT 编译代码缓存中的总条目数。
### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

字典更新的最大延迟（秒）。
### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

自最后一次成功加载以来，在所有字典中的错误数量。
### DiskAvailable_*name* {#diskavailable_name}

磁盘上的可用字节数（虚拟文件系统）。远程文件系统可能显示出像 16 EiB 这样的大值。
### DiskTotal_*name* {#disktotal_name}

磁盘的总大小（字节）（虚拟文件系统）。远程文件系统可能显示出像 16 EiB 这样的大值。
### DiskUnreserved_*name* {#diskunreserved_name}

磁盘上的可用字节数（虚拟文件系统），且没有为合并、获取和移动保留的空间。远程文件系统可能显示出像 16 EiB 这样的大值。
### DiskUsed_*name* {#diskused_name}

磁盘上已使用的字节数（虚拟文件系统）。远程文件系统不总是提供此信息。
### FilesystemCacheBytes {#filesystemcachebytes}

在 `cache` 虚拟文件系统中的总字节数。此缓存驻留在磁盘上。
### FilesystemCacheFiles {#filesystemcachefiles}

在 `cache` 虚拟文件系统中缓存的文件段总数。此缓存驻留在磁盘上。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

在挂载 ClickHouse 日志路径的卷上可用的字节数。如果此值接近零，您应当调整配置文件中的日志轮换设置。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

在挂载 ClickHouse 日志路径的卷上可用的 i节点数量。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

挂载 ClickHouse 日志路径的卷的大小（字节）。建议日志至少有 10 GB。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

在挂载 ClickHouse 日志路径的卷上的 i节点总数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

挂载 ClickHouse 日志路径的卷上已使用的字节数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

在挂载 ClickHouse 日志路径的卷上已使用的 i节点数量。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

在挂载主 ClickHouse 路径的卷上可用的字节数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

在挂载主 ClickHouse 路径的卷上可用的 i节点数量。如果接近零，这表明配置错误，即使磁盘未满，您也会收到“设备上没有剩余空间”的错误。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

挂载主 ClickHouse 路径的卷的大小（字节）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

挂载主 ClickHouse 路径的卷上 i节点的总数量。如果少于 2500 万，表明配置错误。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

在挂载主 ClickHouse 路径的卷上已使用的字节数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

在挂载主 ClickHouse 路径的卷上已使用的 i节点数量。该值通常对应于文件数量。
### HTTPThreads {#httpthreads}

HTTP 接口服务器中的线程数量（不含 TLS）。
### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数量（不含 TLS）。
### Jitter {#jitter}

计算异步指标的线程被调度唤醒的时间与实际唤醒时间之间的差异。总体系统延迟和响应性的 Proxy 指标。
### LoadAverage*N* {#loadaveragen}

整个系统负载，经过 1 分钟的指数平滑平均。负载表示当前正在 CPU 上运行的进程（操作系统内核的调度实体）或等待 IO 的线程数，或准备运行但未被调度的线程数量。该数字包括所有进程，而不仅仅是 clickhouse-server。当系统负载过重时，许多进程准备运行但等待 CPU 或 IO，此值可能大于 CPU 核心数。
### MMapCacheCells {#mmapcachecells}

使用 `mmap` 打开的文件数量（在内存中映射）。这用于设置 `local_filesystem_read_method` 为 `mmap` 的查询。使用 `mmap` 打开的文件会保存在缓存中，以避免代价高昂的 TLB 刷新。
### MarkCacheBytes {#markcachebytes}

标记缓存的总大小（字节）。
### MarkCacheFiles {#markcachefiles}

标记缓存中缓存的标记文件总数。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree 系列所有分区中每个分区的最大部分数。大于 300 的值表明配置错误、超载或大量数据加载。
### MemoryCode {#memorycode}

为服务器进程的机器代码页面映射的虚拟内存量（字节）。
### MemoryDataAndStack {#memorydataandstack}

为栈使用和分配内存映射的虚拟内存量（字节）。是否包含每个线程的栈和大多数通过 `mmap` 系统调用分配的内存尚不明确。该指标仅为完整性原因而存在。我建议使用 `MemoryResident` 指标进行监控。
### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的最大物理内存量（字节）。
### MemoryResident {#memoryresident}

服务器进程使用的物理内存量（字节）。
### MemoryShared {#memoryshared}

服务器进程使用的内存量，同时被其他进程共享（字节）。ClickHouse 不使用共享内存，但 OS 可能出于自身原因标记一些内存为共享。监控此指标的意义不大，仅为完整性原因而存在。
### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间大小（字节）。虚拟地址空间的大小通常大于物理内存消耗，不应作为内存消耗的估算。这一指标的值很大是完全正常的，只有技术意义。
### MySQLThreads {#mysqlthreads}

MySQL 兼容协议服务器中的线程数量。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

在网络接口接收数据时丢弃的字节数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

通过网络接口接收数据时发生错误的次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络数据包数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendDrop_*name* {#networksenddrop_name}

在通过网络接口发送数据时丢弃的次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendErrors_*name* {#networksenderrors_name}

在通过网络接口发送数据时发生错误（例如 TCP 重传）的次数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

用户通过 `ALTER TABLE DETACH` 查询从 MergeTree 表中分离的部分的总数（与意外、损坏或被忽略的部分相对）。服务器不关心分离的部分，可以删除它们。
### NumberOfDetachedParts {#numberofdetachedparts}

从 MergeTree 表中分离的部分的总数。用户可以通过 `ALTER TABLE DETACH` 查询分离部分，或服务器本身因部分损坏、意外或不需要而分离部分。服务器不关心分离的部分，可以删除它们。
### NumberOfTables {#numberoftables}

服务器上所有数据库中表的总数，排除那些无法包含 MergeTree 表的数据库。排除的数据库引擎是那些按需生成表集的，例如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。
### OSContextSwitches {#oscontextswitches}

系统在主机上经历的上下文切换数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSGuestNiceTime {#osguestnicetime}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU 所花费的时间的比例，当来宾设置为更高的优先级时（见 `man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以便完整性。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU 所花费的时间的比例，当来宾设置为更高的优先级时（见 `man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以便完整性。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值类似于 `OSGuestNiceTime`，但是除以 CPU 核心数量，以便在 [0..1] 区间内进行度量，而不考虑核心数量。这使您能够在集群中的多个服务器之间平均此指标的值，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSGuestTime {#osguesttime}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU 所花费的时间的比例（见 `man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以便完整性。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU 所花费的时间的比例（见 `man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以便完整性。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSGuestTimeNormalized {#osguesttimenormalized}

该值类似于 `OSGuestTime`，但是除以 CPU 核心数量，以便在 [0..1] 区间内进行度量，而不考虑核心数量。这使您能够在集群中的多个服务器之间平均此指标的值，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSIOWaitTime {#osiowaittime}

 CPU 核心未运行代码但操作系统内核未在该 CPU 上运行其他任何进程，因为这些进程在等待 IO 的比例。 这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。 单个 CPU 核心的值将在 [0..1] 的区间内。 所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

 CPU 核心未运行代码但操作系统内核未在该 CPU 上运行其他任何进程，因为这些进程在等待 IO 的比例。 这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。 单个 CPU 核心的值将在 [0..1] 的区间内。 所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值类似于 `OSIOWaitTime`，但是除以 CPU 核心数量，以便在 [0..1] 区间内进行度量，而不考虑核心数量。这使您能够在集群中的多个服务器之间平均此指标的值，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSIdleTime {#osidletime}

CPU 核心在操作系统内核的角度下处于闲置状态（甚至不准备运行等待 IO 的进程）的比例。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。这不包括 CPU 因 CPU 内部原因（内存负载、管道延迟、分支误预测、运行其他 SMT 核心）而未充分利用的时间。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPU 核心在操作系统内核的角度下处于闲置状态（甚至不准备运行等待 IO 的进程）的比例。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。这不包括 CPU 因 CPU 内部原因（内存负载、管道延迟、分支误预测、运行其他 SMT 核心）而未充分利用的时间。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSIdleTimeNormalized {#osidletimenormalized}

该值类似于 `OSIdleTime`，但是除以 CPU 核心数量，以便在 [0..1] 区间内进行度量，而不考虑核心数量。这使您能够在集群中的多个服务器之间平均此指标的值，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSInterrupts {#osinterrupts}

主机上的中断数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSIrqTime {#osirqtime}

用于运行硬件中断请求的 CPU 平均占用时间。 这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。 该指标的高值可能指示硬件配置错误或非常高的网络负载。  单个 CPU 核心的值将在 [0..1] 的区间内。 所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

用于运行硬件中断请求的 CPU 平均占用时间。 这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。 该指标的高值可能指示硬件配置错误或非常高的网络负载。  单个 CPU 核心的值将在 [0..1] 的区间内。 所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSIrqTimeNormalized {#osirqtimenormalized}

该值类似于 `OSIrqTime`，但是除以 CPU 核心数量，以便在 [0..1] 区间内进行度量，而不考虑核心数量。这使您能够在集群中的多个服务器之间平均此指标的值，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存量（字节）。这与 `OSMemoryFreePlusCached` 指标极为相似。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryBuffers {#osmemorybuffers}

操作系统内核缓冲区使用的内存量（字节）。这通常应较小，较大值可能表明操作系统配置错误。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryCached {#osmemorycached}

操作系统页缓存使用的内存量（字节）。通常，几乎所有可用内存被操作系统页缓存使用 - 该指标的高值是正常且预期的。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统上可用的空闲内存加上操作系统页缓存内存（字节）。此内存可供程序使用。该值与 `OSMemoryAvailable` 非常相似。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上可用的空闲内存（字节）。这不包括操作系统页缓存使用的内存（字节）。页缓存内存也可供程序使用，因此可以让该指标的值产生一些混淆。请改用 `OSMemoryAvailable` 指标。此外，我们还提供 `OSMemoryFreePlusCached` 指标，应该与 OSMemoryAvailable 有一定相似性。另请参阅 https://www.linuxatemyram.com/。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSMemoryTotal {#osmemorytotal}

主机系统的总内存量（字节）。
### OSNiceTime {#osnicetime}

CPU 核心运行用户空间代码并具有更高优先级的时间比例。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU 核心运行用户空间代码并具有更高优先级的时间比例。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSNiceTimeNormalized {#osnicetimenormalized}

该值类似于 `OSNiceTime`，但是除以 CPU 核心数量，以便在 [0..1] 区间内进行度量，而不考虑核心数量。这使您能够在集群中的多个服务器之间平均此指标的值，即使核心数量不均匀，仍然获得平均资源利用率指标。
### OSOpenFiles {#osopenfiles}

主机上打开的文件总数。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSProcessesBlocked {#osprocessesblocked}

等待 I/O 完成而被阻塞的线程数（`man procfs`）。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSProcessesRunning {#osprocessesrunning}

操作系统中可运行的（正在运行或准备运行的）线程数量。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。
### OSSoftIrqTime {#ossoftirqtime}

在 CPU 上运行软件中断请求所花费的时间比例。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。该指标的高值可能指示系统上运行的软件效率低下。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

在 CPU 上运行软件中断请求所花费的时间比例。这是一个系统范围的指标，它包括主机上所有进程，而不仅仅是 clickhouse-server。该指标的高值可能指示系统上运行的软件效率低下。单个 CPU 核心的值将在 [0..1] 的区间内。所有 CPU 核心的值计算为它们的总和 [0..num cores]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值类似于 `OSSoftIrqTime`，但被处理为 CPU 核心数量的商，以便在 [0..1] 区间内测量，而不管核心数量。这使您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以得到平均资源利用率指标。
### OSStealTime {#osstealtime}

在虚拟化环境中，CPU 消耗在其他操作系统中的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供该指标，实际上大多数都没有。单个 CPU 核心的值将处于 [0..1] 区间内。所有 CPU 核心的值通过求和计算得出 [0..num cores]。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

在虚拟化环境中，CPU 消耗在其他操作系统中的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供该指标，实际上大多数都没有。单个 CPU 核心的值将处于 [0..1] 区间内。所有 CPU 核心的值通过求和计算得出 [0..num cores]。
### OSStealTimeNormalized {#osstealtimenormalized}

该值类似于 `OSStealTime`，但被处理为 CPU 核心数量的商，以便在 [0..1] 区间内测量，而不管核心数量。这使您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以得到平均资源利用率指标。
### OSSystemTime {#ossystemtime}

CPU 核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将处于 [0..1] 区间内。所有 CPU 核心的值通过求和计算得出 [0..num cores]。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU 核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将处于 [0..1] 区间内。所有 CPU 核心的值通过求和计算得出 [0..num cores]。
### OSSystemTimeNormalized {#ossystemtimenormalized}

该值类似于 `OSSystemTime`，但被处理为 CPU 核心数量的商，以便在 [0..1] 区间内测量，而不管核心数量。这使您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以得到平均资源利用率指标。
### OSThreadsRunnable {#osthreadsrunnable}

被操作系统内核调度器视为可运行的线程总数。
### OSThreadsTotal {#osthreadstotal}

被操作系统内核调度器视为线程的总数。
### OSUptime {#osuptime}

主机服务器（运行 ClickHouse 的机器）的正常运行时间，单位为秒。
### OSUserTime {#osusertime}

CPU 核心运行用户空间代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。这也包括因 CPU 内部原因（内存加载、流水线停顿、分支预测错误、运行另一个 SMT 核心）导致的 CPU 低利用率的时间。单个 CPU 核心的值将处于 [0..1] 区间内。所有 CPU 核心的值通过求和计算得出 [0..num cores]。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU 核心运行用户空间代码的时间比例。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。这也包括因 CPU 内部原因（内存加载、流水线停顿、分支预测错误、运行另一个 SMT 核心）导致的 CPU 低利用率的时间。单个 CPU 核心的值将处于 [0..1] 区间内。所有 CPU 核心的值通过求和计算得出 [0..num cores]。
### OSUserTimeNormalized {#osusertimenormalized}

该值类似于 `OSUserTime`，但被处理为 CPU 核心数量的商，以便在 [0..1] 区间内测量，而不管核心数量。这使您能够在集群中的多个服务器之间对该指标的值进行平均，即使核心数量不均匀，仍然可以得到平均资源利用率指标。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 兼容协议服务器中的线程数量。
### QueryCacheBytes {#querycachebytes}

查询缓存的总大小（以字节为单位）。
### QueryCacheEntries {#querycacheentries}

查询缓存中的条目总数。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最新复制部分与尚未复制的最新数据部分之间的最大差值（以秒为单位），跨 Replicated 表。非常高的值表明某个副本没有数据。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

跨 Replicated 表的队列中 INSERT 操作的最大数量（尚待复制）。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

跨 Replicated 表的队列中合并操作的最大数量（尚待应用）。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

跨 Replicated 表的最大队列大小（以操作数量计算，如获取、合并）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

副本延迟与同一表中最新副本的延迟之间的最大差异，跨 Replicated 表。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

跨 Replicated 表的队列中 INSERT 操作的总和（尚待复制）。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

跨 Replicated 表的队列中合并操作的总和（尚待应用）。
### ReplicasSumQueueSize {#replicassumqueuesize}

跨 Replicated 表的总队列大小（以操作数量计算，如获取、合并）。
### TCPThreads {#tcpthreads}

TCP 协议（无 TLS）服务器中的线程数量。
### Temperature_*N* {#temperature_n}

对应设备的温度，单位为 ℃。传感器可能会返回不现实的值。来源：`/sys/class/thermal`
### Temperature_*name* {#temperature_name}

由对应硬件监控器和相应传感器报告的温度，单位为 ℃。传感器可能会返回不现实的值。来源：`/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

所有 MergeTree 家族表中存储的字节总量（已压缩，包括数据和索引）。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

所有 MergeTree 家族表中数据部分的总数量。大于 10,000 的数字将对服务器启动时间产生负面影响，并可能表明分区键的选择不合理。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值在内存中使用的总量（以字节为单位，仅计算活跃部分）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值保留的总内存量（以字节为单位，仅计算活跃部分）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

所有 MergeTree 家族表中存储的行（记录）总数。
### UncompressedCacheBytes {#uncompressedcachebytes}

未压缩缓存的总大小（以字节为单位）。未压缩缓存通常不会提高性能，应该尽量避免使用。
### UncompressedCacheCells {#uncompressedcachecells}

未压缩缓存中的总条目数。每个条目代表一个解压的块数据。未压缩缓存通常不会提高性能，应该尽量避免使用。
### Uptime {#uptime}

服务器的正常运行时间，单位为秒。包括服务器初始化期间的时间，直到接受连接。
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

jemalloc （Jason Evans 的内存分配器）统计信息的内部增量更新编号，用于所有其他 `jemalloc` 指标。
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

**另请参见**

- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生过的一些事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含 `system.metrics` 和 `system.events` 表中指标值的历史记录。
