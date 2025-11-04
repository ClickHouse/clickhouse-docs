---
'description': '系统表包含定期在后台计算的指标。例如，使用的RAM数量。'
'keywords':
- 'system table'
- 'asynchronous_metrics'
'slug': '/operations/system-tables/asynchronous_metrics'
'title': 'system.asynchronous_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics

<SystemTableCloud/>

包含定期在后台计算的指标。例如，已使用的内存量。

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

<!--- 与 system.events 和 system.metrics 不同，异步指标不会在源代码文件中以简单列表的形式收集 - 它们与逻辑混合在 src/Interpreters/ServerAsynchronousMetrics.cpp 中。
      在此处明确列出以便读者方便。 --->
## 指标描述 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

计算异步重（与表相关）指标所花费的时间（以秒为单位）（这是异步指标的开销）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重（与表相关）指标的更新间隔
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

计算异步指标所花费的时间（以秒为单位）（这是异步指标的开销）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔
### BlockActiveTime_*name* {#blockactivetime_name}

块设备的 IO 请求排队的时间（以秒为单位）。这是一个系统范围的指标，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

在块设备上丢弃的字节数。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

请求从块设备进行的丢弃操作的数量，并由操作系统 IO 调度程序合并在一起。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

请求从块设备进行的丢弃操作的数量。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

花费在从块设备请求的丢弃操作中的时间（以秒为单位），对所有操作求和。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作，但系统上的其他进程可以使用。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

此值计算已向设备驱动程序发出的 I/O 请求数量，但尚未完成。它不包括尚未向设备驱动程序发出的 IO 请求。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

此值计算 IO 请求在该块设备上等待的毫秒数。如果有多个 IO 请求等待，此值将增加，作为等待的请求数量与毫秒数的乘积。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用了 OS 页面缓存，读取的字节数可能低于从文件系统读取的字节数，这可以节省 IO。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

请求从块设备进行的读取操作的数量，并由 OS IO 调度程序合并在一起。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

请求从块设备进行的读取操作的数量。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

花费在从块设备请求的读取操作中的时间（以秒为单位），对所有操作求和。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

写入到块设备的字节数。由于使用了 OS 页面缓存，写入的字节数可能低于写入文件系统的字节数。由于写入通过缓存的写入，块设备上的写入可能发生在对应的写入到文件系统之前。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

请求从块设备进行的写入操作的数量，并由 OS IO 调度程序合并在一起。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

请求从块设备进行的写入操作的数量。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

花费在从块设备请求的写入操作中的时间（以秒为单位），对所有操作求和。此指标是系统范围的，包括主机机器上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。见 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU 的当前频率，以 MHz 为单位。大多数现代 CPU 会动态调整频率以节省电力和增加 Turbo 加速。
### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

字典更新的最大延迟（以秒为单位）。
### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

自上次成功加载以来所有字典中的错误数量。
### DiskAvailable_*name* {#diskavailable_name}

磁盘上的可用字节（虚拟文件系统）。远程文件系统可以显示如 16 EiB 等较大值。
### DiskTotal_*name* {#disktotal_name}

磁盘的总大小（以字节为单位）（虚拟文件系统）。远程文件系统可以显示如 16 EiB 等较大值。
### DiskUnreserved_*name* {#diskunreserved_name}

磁盘上的可用字节（虚拟文件系统），不包括合并、提取和移动的保留空间。远程文件系统可以显示如 16 EiB 等较大值。
### DiskUsed_*name* {#diskused_name}

磁盘上已使用的字节数（虚拟文件系统）。远程文件系统并不总是提供此信息。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中的总字节数。此缓存保留在磁盘上。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 虚拟文件系统中缓存的文件段的总数。此缓存保留在磁盘上。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse 日志路径挂载的卷上的可用字节。如果该值接近零，您应该调整配置文件中的日志轮换。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse 日志路径挂载的卷上可用的 inode 数量。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse 日志路径挂载的卷的大小（以字节为单位）。建议日志至少要有 10 GB。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse 日志路径挂载的卷上的 inode 总数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse 日志路径挂载的卷上已使用的字节数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse 日志路径挂载的卷上已使用的 inode 数量。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主 ClickHouse 路径挂载的卷上的可用字节数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主 ClickHouse 路径挂载的卷上可用的 inode 数量。如果此值接近零，则表示配置错误，您即使在磁盘未满的情况下也会收到“设备上没有剩余空间”的错误。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主 ClickHouse 路径挂载的卷的大小（以字节为单位）。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主 ClickHouse 路径挂载的卷上 inode 的总数。如果少于 2500 万，则表示配置错误。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主 ClickHouse 路径挂载的卷上已使用的字节数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主 ClickHouse 路径挂载的卷上已使用的 inode 数量。此值主要对应于文件数。
### HTTPThreads {#httpthreads}

HTTP 接口服务器中的线程数量（不带 TLS）。
### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数量（不带 TLS）。
### Jitter {#jitter}

用于计算异步指标的线程被调度唤醒的时间与实际被唤醒的时间之间的差异。整体系统延迟和响应性的代理指标。
### LoadAverage*N* {#loadaveragen}

整个系统的负载，经过 1 分钟的指数平滑平均。负载表示当前在 CPU 上运行或等待 IO 或准备运行但此时未被调度的所有进程（操作系统内核的调度实体）的线程数。这个数字包括所有进程，而不仅仅是 clickhouse-server。如果系统过载，并且许多进程准备运行但正在等待 CPU 或 IO，数字可以大于 CPU 核心数。
### MaxPartCountForPartition {#maxpartcountforpartition}

在所有 MergeTree 家族表的所有分区中，每个分区的最大部分数。大于 300 的值表示配置错误、过载或大量数据加载。
### MemoryCode {#memorycode}

为服务器进程的机器代码页面映射的虚拟内存量（以字节为单位）。
### MemoryDataAndStack {#memorydataandstack}

为栈使用和分配内存而映射的虚拟内存量（以字节为单位）。尚不清楚它是否包括每个线程的栈和大多数通过 'mmap' 系统调用分配的内存。此指标仅存在于完整性原因。建议使用 `MemoryResident` 指标进行监控。
### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的最大物理内存量（以字节为单位）。
### MemoryResident {#memoryresident}

服务器进程使用的物理内存量（以字节为单位）。
### MemoryShared {#memoryshared}

服务器进程使用的内存量，同时也被其他进程共享（以字节为单位）。ClickHouse 不使用共享内存，但某些内存可能由于操作系统的原因被标记为共享。此指标不太有意义，存在仅出于完整性原因。
### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间的大小（以字节为单位）。虚拟地址空间的大小通常大大大于物理内存消耗，不应作为内存消耗的估计。此指标的大值是完全正常的，仅具有技术意义。
### MySQLThreads {#mysqlthreads}

MySQL 兼容协议服务器中的线程数量。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

数据包在通过网络接口接收时丢失的字节数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

通过网络接口接收时发生错误的次数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络数据包的数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendDrop_*name* {#networksenddrop_name}

数据包在通过网络接口发送时丢失的次数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendErrors_*name* {#networksenderrors_name}

在通过网络接口发送时发生错误（例如 TCP 重传）的次数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包的数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

由用户通过 `ALTER TABLE DETACH` 查询从 MergeTree 表中分离的部分总数（与意外、损坏或被忽略的部分相对）。服务器不关心分离的部分，它们可以被移除。
### NumberOfDetachedParts {#numberofdetachedparts}

从 MergeTree 表中分离的部分总数。部分可以通过用户用 `ALTER TABLE DETACH` 查询分离，也可以由服务器本身在部分损坏、意外或不需要时进行分离。服务器不关心分离的部分，它们可以被移除。
### NumberOfTables {#numberoftables}

跨服务器上的数据库的总表数，不包括不能包含 MergeTree 表的数据库。被排除的数据库引擎是按需生成表集的，例如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。
### OSContextSwitches {#oscontextswitches}

系统在主机上经历的上下文切换的数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSGuestNiceTime {#osguestnicetime}

在 Linux 内核控制下运行的来宾操作系统的虚拟 CPU 中运行所花费的时间比率，当来宾的优先级设置更高时（见 `man procfs`）。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以实现完整性。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在 Linux 内核控制下运行的来宾操作系统的虚拟 CPU 中运行所花费的时间比率，当来宾的优先级设置更高时（见 `man procfs`）。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以实现完整性。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值类似于 `OSGuestNiceTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSGuestTime {#osguesttime}

在 Linux 内核控制下运行的来宾操作系统中运行虚拟 CPU 所花费的时间比率（见 `man procfs`）。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以实现完整性。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在 Linux 内核控制下运行的来宾操作系统中运行虚拟 CPU 所花费的时间比率（见 `man procfs`）。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以实现完整性。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSGuestTimeNormalized {#osguesttimenormalized}

该值类似于 `OSGuestTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSIOWaitTime {#osiowaittime}

CPU 核心未运行代码而操作系统内核未在此 CPU 上运行其他进程的时间比率，因为进程在等待 IO。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU 核心未运行代码而操作系统内核未在此 CPU 上运行其他进程的时间比率，因为进程在等待 IO。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值类似于 `OSIOWaitTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSIdleTime {#osidletime}

CPU 核心处于空闲状态（甚至没有准备好运行等待 IO 的进程）从操作系统内核的观点来看花费的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。该值不包括 CPU 未充分利用的时间，这是由于 CPU 内部的原因（内存负载、流水线停滞、分支误预测、运行其他 SMT 核心）。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPU 核心处于空闲状态（甚至没有准备好运行等待 IO 的进程）从操作系统内核的观点来看花费的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。该值不包括 CPU 未充分利用的时间，这是由于 CPU 内部的原因（内存负载、流水线停滞、分支误预测、运行其他 SMT 核心）。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSIdleTimeNormalized {#osidletimenormalized}

该值类似于 `OSIdleTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSInterrupts {#osinterrupts}

主机上的中断数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSIrqTime {#osirqtime}

用于在 CPU 上运行硬件中断请求所花费的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标的高值可能表示硬件配置不当或网络负载非常高。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

用于在 CPU 上运行硬件中断请求所花费的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标的高值可能表示硬件配置不当或网络负载非常高。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSIrqTimeNormalized {#osirqtimenormalized}

该值类似于 `OSIrqTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存量（以字节为单位）。这与 `OSMemoryFreePlusCached` 指标非常相似。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryBuffers {#osmemorybuffers}

操作系统内核缓冲区使用的内存量（以字节为单位）。这通常应该很小，较大的值可能表示操作系统配置不当。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryCached {#osmemorycached}

操作系统页面缓存使用的内存量（以字节为单位）。通常，几乎所有可用内存都被操作系统页面缓存使用 - 此指标的高值是正常和预期的。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统中未使用的内存加上操作系统页面缓存内存（以字节为单位）。此内存可供程序使用。该值应与 `OSMemoryAvailable` 非常相似。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统中未使用的内存量（以字节为单位）。这不包括操作系统页面缓存使用的内存（以字节为单位）。页面缓存内存也可供程序使用，因此此指标的值可能会令人困惑。请改为查看 `OSMemoryAvailable` 指标。为方便起见，我们还提供 `OSMemoryFreePlusCached` 指标，该指标应与 OSMemoryAvailable 相似。另请参见 https://www.linuxatemyram.com/。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryTotal {#osmemorytotal}

主机系统中的总内存量（以字节为单位）。
### OSNiceTime {#osnicetime}

CPU 核心运行用户空间代码的时间比率，具有更高的优先级。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU 核心运行用户空间代码的时间比率，具有更高的优先级。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSNiceTimeNormalized {#osnicetimenormalized}

该值类似于 `OSNiceTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSOpenFiles {#osopenfiles}

主机上的打开文件总数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSProcessesBlocked {#osprocessesblocked}

被阻塞等待 I/O 完成的线程数量（`man procfs`）。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSProcessesRunning {#osprocessesrunning}

操作系统中可运行（正在运行或准备运行）线程的数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSSoftIrqTime {#ossoftirqtime}

用于在 CPU 上运行软件中断请求所花费的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标的高值可能表示系统上运行不高效的软件。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

用于在 CPU 上运行软件中断请求所花费的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标的高值可能表示系统上运行不高效的软件。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值类似于 `OSSoftIrqTime`，但除以 CPU 核心的数量，以便在 [0..1] 的范围内进行测量，而不考虑核心的数量。这允许您在集群中平均此指标的值，即使核心数量不均匀，仍可获得平均资源利用率指标。
### OSStealTime {#osstealtime}

在虚拟化环境中，CPU 花费在其他操作系统上的时间比率。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供此指标，而大多数都不提供。单个 CPU 核心的值将在 [0..1] 的范围内。所有 CPU 核心的值是跨它们的总和 [0..核心数] 计算的。
### OSStealTimeCPU_*N* {#osstealtimecpu_n}

CPU在虚拟化环境中花费在其他操作系统上的时间比例。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。并不是每个虚拟化环境都提供这个指标，大多数都不提供。单个CPU核心的值将在区间[0..1]内。所有CPU核心的值是通过对它们进行求和计算得出的[0..num cores]。
### OSStealTimeNormalized {#osstealtimenormalized}

该值与`OSStealTime`类似，但除以要测量的CPU核心数量，使其在[0..1]区间内，无论核心数量如何。这使您可以在集群中跨多个服务器平均此指标的值，即使核心数量不均匀，仍然可以获得平均资源利用率指标。
### OSSystemTime {#ossystemtime}

CPU核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在区间[0..1]内。所有CPU核心的值是通过对它们进行求和计算得出的[0..num cores]。
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。单个CPU核心的值将在区间[0..1]内。所有CPU核心的值是通过对它们进行求和计算得出的[0..num cores]。
### OSSystemTimeNormalized {#ossystemtimenormalized}

该值与`OSSystemTime`类似，但除以CPU核心的数量，以便在[0..1]区间内测量，无论核心数量如何。这允许您在集群中跨多个服务器平均此指标的值，即使核心数量不均匀，仍然可以获得平均资源利用率指标。
### OSThreadsRunnable {#osthreadsrunnable}

操作系统内核调度程序认为的“可运行”线程的总数。
### OSThreadsTotal {#osthreadstotal}

操作系统内核调度程序认为的线程总数。
### OSUptime {#osuptime}

主机服务器（运行ClickHouse的机器）的正常运行时间，以秒为单位。
### OSUserTime {#osusertime}

CPU核心运行用户空间代码的时间比例。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。这还包括CPU由于CPU内部原因（内存加载、管道停顿、分支预测错误、运行另一个SMT核心）而未充分利用的时间。单个CPU核心的值将在区间[0..1]内。所有CPU核心的值是通过对它们进行求和计算得出的[0..num cores]。
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU核心运行用户空间代码的时间比例。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是clickhouse-server。这还包括CPU由于CPU内部原因（内存加载、管道停顿、分支预测错误、运行另一个SMT核心）而未充分利用的时间。单个CPU核心的值将在区间[0..1]内。所有CPU核心的值是通过对它们进行求和计算得出的[0..num cores]。
### OSUserTimeNormalized {#osusertimenormalized}

该值与`OSUserTime`类似，但除以CPU核心的数量，以便在[0..1]区间内测量，无论核心数量如何。这允许您在集群中跨多个服务器平均此指标的值，即使核心数量不均匀，仍然可以获得平均资源利用率指标。
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL兼容协议服务器中的线程数量。
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最新复制部分与仍需复制的最新数据部分之间的最大秒数差。高值表示没有数据的副本。
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在复制表中，队列（仍需复制）中的最大INSERT操作数量。
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在复制表中，队列（仍需应用）中的最大合并操作数量。
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在复制表中的最大队列大小（以get、merge等操作的数量计算）。
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

副本延迟与同一表最新副本的延迟之间的最大差异，跨复制表。
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在复制表中，队列（仍需复制）中的INSERT操作总和。
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在复制表中，队列（仍需应用）中的合并操作总和。
### ReplicasSumQueueSize {#replicassumqueuesize}

在复制表中的总队列大小（以get、merge等操作的数量计算）。
### TCPThreads {#tcpthreads}

TCP协议服务器中的线程数量（不带TLS）。
### Temperature_*N* {#temperature_n}

相应设备的温度，单位为℃。传感器可能返回不现实的值。来源：`/sys/class/thermal`
### Temperature_*name* {#temperature_name}

相应硬件监控器和相应传感器报告的温度，单位为℃。传感器可能返回不现实的值。来源：`/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTree系列所有表中存储的总字节数（压缩后，包括数据和索引）。
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree系列所有表中数据部分的总数量。超过10000的数字会对服务器启动时间产生负面影响，并可能表明分区键的选择不合理。
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值所占用的总内存（以字节为单位）（仅考虑活动部分）。
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值保留的总内存（以字节为单位）（仅考虑活动部分）。
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree系列所有表中存储的总行数（记录）。
### Uptime {#uptime}

服务器的正常运行时间，单位为秒。包括服务器在接受连接之前初始化所花费的时间。
### jemalloc.active {#jemallocactive}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.allocated {#jemallocallocated}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.epoch {#jemallocepoch}

jemalloc的统计信息的内部增量更新号，用于所有其他`jemalloc`指标。
### jemalloc.mapped {#jemallocmapped}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.metadata {#jemallocmetadata}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.metadata_thp {#jemallocmetadata_thp}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.resident {#jemallocresident}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.retained {#jemallocretained}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html
### jemalloc.prof.active {#jemallocprofactive}

低级内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

**参见**

- [Monitoring](../../operations/monitoring.md) — ClickHouse监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的一些事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自`system.metrics`和`system.events`表的指标值历史记录。
