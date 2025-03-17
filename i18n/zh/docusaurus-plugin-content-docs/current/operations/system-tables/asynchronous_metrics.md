---
description: '系统表包含定期在后台计算的指标。例如，使用的 RAM 量。'
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
keywords: ['system table', 'asynchronous_metrics']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含定期在后台计算的指标。例如，使用的 RAM 量。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。

**示例**

``` sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

``` text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 花费的秒数，用于计算异步指标（这是异步指标的开销）。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ 通过 `ALTER TABLE DETACH` 查询，从 MergeTree 表中分离的用户总数（与意外、破损或被忽略的部分相对）。服务器不关心分离的部分，这些部分可以被删除。                          │
│ NumberOfDetachedParts                   │          0 │ 从 MergeTree 表中分离的部分的总数。部分可以通过用户执行 `ALTER TABLE DETACH` 查询或由服务器自身在部分损坏、意外或不需要时进行分离。服务器不关心分离的部分，这些部分可以被删除。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ 存储在所有 MergeTree 家族表中的总行数（记录）。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ 存储在所有 MergeTree 家族表中的总字节数（压缩，包括数据和索引）。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ 服务器上所有数据库的表总数，不包括不能包含 MergeTree 表的数据库。被排除的数据库引擎是那些动态生成表的引擎，如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。 │
│ NumberOfDatabases                       │          6 │ 服务器上的数据库总数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ MergeTree 家族所有表的所有分区中的每个分区的最大部分数。大于 300 的值指示配置错误、过载或大量数据加载。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ 被排队的合并操作总数（待应用）在复制表中。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ 被排队的插入操作总数（待复制）在复制表中。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- 与 system.events 和 system.metrics 不同，异步指标不是在源代码文件中的简单列表中收集的 - 它们与逻辑混合在一起在 src/Interpreters/ServerAsynchronousMetrics.cpp 中。
      在此处明确列出以方便读者。 --->
## 指标描述 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

花费的秒数，用于计算异步重型（与表相关）指标（这是异步指标的开销）。
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重型（与表相关）指标更新间隔。
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

花费的秒数，用于计算异步指标（这是异步指标的开销）。
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔。
### BlockActiveTime_*name* {#blockactivetime_name}

块设备有 IO 请求排队的时间（以秒为单位）。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上丢弃的字节数。这些操作与 SSD 有关。ClickHouse 不使用丢弃操作，但系统中的其他进程可以使用这些操作。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

从块设备请求的丢弃操作数，并由操作系统 IO 调度器合并在一起。这些操作与 SSD 有关。ClickHouse 不使用丢弃操作，但系统中的其他进程可以使用这些操作。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

从块设备请求的丢弃操作数。这些操作与 SSD 有关。ClickHouse 不使用丢弃操作，但系统中的其他进程可以使用这些操作。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

在从块设备请求的丢弃操作中花费的总时间（以秒为单位），总和所有操作。这些操作与 SSD 有关。ClickHouse 不使用丢弃操作，但系统中的其他进程可以使用这些操作。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

该值统计已发布给设备驱动程序但尚未完成的 I/O 请求数。此值不包括在队列中但尚未发布给设备驱动程序的 IO 请求。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

此值统计 I/O 请求在此块设备上等待的毫秒数。如果有多个 I/O 请求在等待，则该值将增加，增加量为等待请求数乘以等待的毫秒数。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用了操作系统页面缓存，读取的字节数可能低于从文件系统读取的字节数，这样可以节省 IO。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

从块设备请求的读取操作，并由操作系统 IO 调度器合并在一起。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

从块设备请求的读取操作数。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

在从块设备请求的读取操作中花费的总时间（以秒为单位），总和所有操作。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

写入块设备的字节数。由于操作系统页面缓存的使用，写入的字节数可能低于写入文件系统的字节数。写入块设备的操作可能会晚于写入文件系统的相应操作，这是由于写入缓存的原因。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

从块设备请求的写入操作，并由操作系统 IO 调度器合并在一起。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

从块设备请求的写入操作数。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

在从块设备请求的写入操作中花费的总时间（以秒为单位），总和所有操作。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU 当前频率，以 MHz 为单位。大多数现代 CPU 动态调整频率以节省电力和支持 Turbo Boost。
### CompiledExpressionCacheBytes {#compiledexpressioncachebytes}

用于缓存 JIT 编译代码的总字节数。
### CompiledExpressionCacheCount {#compiledexpressioncachecount}

JIT 编译代码缓存中的总条目数。
### DiskAvailable_*name* {#diskavailable_name}

磁盘（虚拟文件系统）上可用的字节数。远程文件系统可能显示大值，例如 16 EiB。
### DiskTotal_*name* {#disktotal_name}

磁盘（虚拟文件系统）的总大小，以字节为单位。远程文件系统可能显示大值，例如 16 EiB。
### DiskUnreserved_*name* {#diskunreserved_name}

磁盘（虚拟文件系统）上可用的字节数，不包括用于合并、提取和移动的保留。远程文件系统可能显示大值，例如 16 EiB。
### DiskUsed_*name* {#diskused_name}

磁盘（虚拟文件系统）上使用的字节数。远程文件系统并不总是提供此信息。
### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中的总字节数。该缓存保存在磁盘上。
### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 虚拟文件系统中缓存的文件段总数。该缓存保存在磁盘上。
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse 日志路径挂载的卷上可用的字节数。如果此值接近于零，则应在配置文件中调整日志轮转。
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse 日志路径挂载的卷上可用的 i-node 数。
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse 日志路径挂载的卷的大小，以字节为单位。建议日志至少有 10 GB。
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse 日志路径挂载的卷上的 i-node 总数。
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse 日志路径挂载的卷上使用的字节数。
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse 日志路径挂载的卷上使用的 i-node 数。
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主 ClickHouse 路径挂载的卷上可用的字节数。
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主 ClickHouse 路径挂载的卷上可用的 i-node 数。如果接近零，则表示配置错误，当磁盘未满时也会显示“设备上没有剩余空间”。
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主 ClickHouse 路径挂载的卷的大小，以字节为单位。
### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主 ClickHouse 路径挂载的卷上的 i-node 总数。如果少于 2500 万，则表示配置错误。
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主 ClickHouse 路径挂载的卷上使用的字节数。
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主 ClickHouse 路径挂载的卷上使用的 i-node 数。该值通常对应文件的数量。
### HTTPThreads {#httpthreads}

HTTP 接口服务器中的线程数（不包括 TLS）。
### InterserverThreads {#interserverthreads}

复制通信协议服务器中的线程数（不包括 TLS）。
### Jitter {#jitter}

线程被调度唤醒的时间与实际唤醒时间之间的差异。系统整体延迟和响应能力的代理指标。
### LoadAverage*N* {#loadaveragen}

整个系统负载，经过 1 分钟的指数平滑平均。负载表示当前由 CPU 运行或等待 IO 的所有进程（操作系统内核的调度实体）中的线程数，或准备运行但此时没有被调度的线程数。此数字包括所有进程，而不仅仅是 clickhouse-server。此数值可能大于 CPU 核心数，如果系统过载，许多进程准备运行但等待 CPU 或 IO。
### MMapCacheCells {#mmapcachecells}

使用 `mmap` 打开的文件数（映射到内存中）。这用于设置为 `mmap` 的查询，该文件使用 `mmap` 打开，保存在缓存中以避免代价高昂的 TLB 刷新。
### MarkCacheBytes {#markcachebytes}

标记缓存的总大小（以字节为单位）。
### MarkCacheFiles {#markcachefiles}

标记缓存中缓存的标记文件总数。
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree 家族所有表的所有分区中的每个分区的最大部分数。大于 300 的值指示配置错误、过载或大量数据加载。
### MemoryCode {#memorycode}

为服务器进程的机器代码页面映射的虚拟内存量，以字节为单位。
### MemoryDataAndStack {#memorydataandstack}

为堆栈和分配的内存使用映射的虚拟内存量，以字节为单位。未指定是否包括每个线程堆栈和大多数分配的内存（通过 'mmap' 系统调用分配）。此指标仅存在于完整性原因。我建议使用 `MemoryResident` 指标进行监控。
### MemoryResidentMax {#memoryresidentmax}

服务器进程所使用的最大物理内存量，以字节为单位。
### MemoryResident {#memoryresident}

服务器进程所使用的物理内存量，以字节为单位。
### MemoryShared {#memoryshared}

服务器进程使用的内存量，且也被其他进程共享，以字节为单位。ClickHouse 不使用共享内存，但某些内存可以被操作系统标记为共享，出于其原因。此指标没有太大意义，仅存在于完整性原因。
### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间的大小，以字节为单位。虚拟地址空间的大小通常大于物理内存消耗，不应作为内存消耗的估计。此指标的高值是完全正常的，且仅具有技术意义。
### MySQLThreads {#mysqlthreads}

MySQL 兼容协议服务器中的线程数。
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

在通过网络接口接收时，数据包被丢弃的字节数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

通过网络接口接收时发生错误的次数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络数据包数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendDrop_*name* {#networksenddrop_name}

在通过网络接口发送时，数据包被丢弃的次数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendErrors_*name* {#networksenderrors_name}

在通过网络接口发送时发生错误（例如 TCP 重传）的次数。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包数量。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

通过 `ALTER TABLE DETACH` 查询，从 MergeTree 表中分离的用户总数（与意外、破损或被忽略的部分相对）。服务器不关心分离的部分，这些部分可以被删除。
### NumberOfDetachedParts {#numberofdetachedparts}

从 MergeTree 表中分离的部分的总数。部分可以通过用户执行 `ALTER TABLE DETACH` 查询或由服务器自身在部分损坏、意外或不需要时进行分离。服务器不关心分离的部分，这些部分可以被删除。
### NumberOfTables {#numberoftables}

服务器上所有数据库的表总数，不包括不能包含 MergeTree 表的数据库。被排除的数据库引擎是那些动态生成表的引擎，如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。
### OSContextSwitches {#oscontextswitches}

系统在主机机器上经历的上下文切换的数量。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSGuestNiceTime {#osguestnicetime}

在更高优先级下运行虚拟 CPU 的时间占比（见 `man procfs`），运行在 Linux 内核控制下的客户操作系统。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以确保完整性。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在更高优先级下运行虚拟 CPU 的时间占比（见 `man procfs`），运行在 Linux 内核控制下的客户操作系统。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以确保完整性。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值类似于 `OSGuestNiceTime` 但除以 CPU 核心数，以便在 [0..1] 区间内进行测量，而不考虑核心数量。这允许您在集群中平均该指标的值，即使核心数量不均匀，并仍然获得平均资源利用率指标。
### OSGuestTime {#osguesttime}

在 Linux 内核控制下运行虚拟 CPU 的时间占比（见 `man procfs`），运行在客户操作系统上的时间。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以确保完整性。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在 Linux 内核控制下运行虚拟 CPU 的时间占比（见 `man procfs`），运行在客户操作系统上的时间。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，但仍然存在以确保完整性。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSGuestTimeNormalized {#osguesttimenormalized}

该值类似于 `OSGuestTime` 但除以 CPU 核心数，以便在 [0..1] 区间内进行测量，而不考虑核心数量。这允许您在集群中平均该指标的值，即使核心数量不均匀，并仍然获得平均资源利用率指标。
### OSIOWaitTime {#osiowaittime}

CPU 核心没有运行代码的时间比例，但操作系统内核没有在此 CPU 上运行任何其他进程，因为进程正在等待 IO。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU 核心没有运行代码的时间比例，但操作系统内核没有在此 CPU 上运行任何其他进程，因为进程正在等待 IO。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值类似于 `OSIOWaitTime` 但除以 CPU 核心数，以便在 [0..1] 区间内进行测量，而不考虑核心数量。这允许您在集群中平均该指标的值，即使核心数量不均匀，并仍然获得平均资源利用率指标。
### OSIdleTime {#osidletime}

该值表示 CPU 核心空闲的时间比例（甚至没有准备好运行等待 IO 的进程），从操作系统内核的角度来看。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此值不包括由于 CPU 内部原因使得 CPU 处于低利用状态的时间（内存加载、流水线停滞、分支预测错误、运行另一个 SMT 核心）。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

该值表示 CPU 核心空闲的时间比例（甚至没有准备好运行等待 IO 的进程），从操作系统内核的角度来看。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此值不包括由于 CPU 内部原因使得 CPU 处于低利用状态的时间（内存加载、流水线停滞、分支预测错误、运行另一个 SMT 核心）。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSIdleTimeNormalized {#osidletimenormalized}

该值类似于 `OSIdleTime` 但除以 CPU 核心数，以便在 [0..1] 区间内进行测量，而不考虑核心数量。这允许您在集群中平均该指标的值，即使核心数量不均匀，并仍然获得平均资源利用率指标。
### OSInterrupts {#osinterrupts}

主机上的中断数量。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSIrqTime {#osirqtime}

用于运行硬件中断请求的时间占比。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标的高值可能表明硬件配置错误或网络负载非常高。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

用于运行硬件中断请求的时间占比。这是一个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。此指标的高值可能表明硬件配置错误或网络负载非常高。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值是跨它们的总和 [0..num cores]。
### OSIrqTimeNormalized {#osirqtimenormalized}

该值类似于 `OSIrqTime` 但除以 CPU 核心数，以便在 [0..1] 区间内进行测量，而不考虑核心数量。这允许您在集群中平均该指标的值，即使核心数量不均匀，并仍然获得平均资源利用率指标。
### OSMemoryAvailable {#osmemoryavailable}

程序可用的内存量，以字节为单位。这与 `OSMemoryFreePlusCached` 指标非常相似。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryBuffers {#osmemorybuffers}

操作系统内核缓冲区所使用的内存量，以字节为单位。通常应很小，大值可能表明操作系统配置错误。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryCached {#osmemorycached}

由操作系统页面缓存使用的内存量，以字节为单位。通常，几乎所有的可用内存都被操作系统页面缓存使用 - 此指标的高值是正常且预期的。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统上可用的自由内存加上操作系统页面缓存的内存，以字节为单位。此内存可供程序使用。该值应与 `OSMemoryAvailable` 非常相似。这个系统范围的指标，包括主机上的所有进程，而不仅仅是 clickhouse-server。
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上可用的自由内存量，以字节为单位。这不包括操作系统页面缓存使用的内存，以字节为单位。页面缓存内存也可供程序使用，因此该指标的值可能会令人困惑。请查看 `OSMemoryAvailable` 指标。为了方便，我们还提供 `OSMemoryFreePlusCached` 指标，该指标应该与 OSMemoryAvailable 有些类似。另请参阅 https://www.linuxatemyram.com/。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。

### OSMemoryTotal {#osmemorytotal}

主机系统上的总内存量，以字节为单位。

### OSNiceTime {#osnicetime}

CPU 核心运行高优先级用户空间代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU 核心运行高优先级用户空间代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSNiceTimeNormalized {#osnicetimenormalized}

该值类似于 `OSNiceTime`，但除以要测量的 CPU 核心数量，以便在 [0..1] 的区间内进行测量，而不考虑核心数量。这使你能够在集群中的多台服务器之间平均该指标的值，即使核心数量不均匀，仍然可以获取平均资源利用率指标。

### OSOpenFiles {#osopenfiles}

主机机器上打开的文件总数。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。

### OSProcessesBlocked {#osprocessesblocked}

正在等待 I/O 完成的阻塞线程数（`man procfs`）。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。

### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。

### OSProcessesRunning {#osprocessesrunning}

操作系统可运行（正在运行或准备运行）的线程数量。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。

### OSSoftIrqTime {#ossoftirqtime}

在 CPU 上运行软件中断请求所花费的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。该指标的高值可能表示系统上运行的软件效率不高。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

在 CPU 上运行软件中断请求所花费的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。该指标的高值可能表示系统上运行的软件效率不高。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值类似于 `OSSoftIrqTime`，但除以要测量的 CPU 核心数量，以便在 [0..1] 的区间内进行测量，而不考虑核心数量。这使你能够在集群中的多台服务器之间平均该指标的值，即使核心数量不均匀，仍然可以获取平均资源利用率指标。

### OSStealTime {#osstealtime}

在虚拟化环境中，CPU 在其他操作系统中花费的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都会显示该指标，大多数不会。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

在虚拟化环境中，CPU 在其他操作系统中花费的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都会显示该指标，大多数不会。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSStealTimeNormalized {#osstealtimenormalized}

该值类似于 `OSStealTime`，但除以要测量的 CPU 核心数量，以便在 [0..1] 的区间内进行测量，而不考虑核心数量。这使你能够在集群中的多台服务器之间平均该指标的值，即使核心数量不均匀，仍然可以获取平均资源利用率指标。

### OSSystemTime {#ossystemtime}

CPU 核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU 核心运行操作系统内核（系统）代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

该值类似于 `OSSystemTime`，但除以要测量的 CPU 核心数量，以便在 [0..1] 的区间内进行测量，而不考虑核心数量。这使你能够在集群中的多台服务器之间平均该指标的值，即使核心数量不均匀，仍然可以获取平均资源利用率指标。

### OSThreadsRunnable {#osthreadsrunnable}

可运行线程的总数，作为操作系统内核调度程序看到的。

### OSThreadsTotal {#osthreadstotal}

线程的总数，作为操作系统内核调度程序看到的。

### OSUptime {#osuptime}

主机服务器（运行 ClickHouse 的机器）的正常运行时间，以秒为单位。

### OSUserTime {#osusertime}

CPU 核心运行用户空间代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。这还包括 CPU 因 CPU 内部原因（内存加载、流水线停滞、分支错预测、运行另一个 SMT 核心）而处于低利用状态的时间。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU 核心运行用户空间代码的时间比例。这是一个系统范围的指标，它包括主机机器上的所有进程，而不仅仅是 clickhouse-server。这还包括 CPU 因 CPU 内部原因（内存加载、流水线停滞、分支错预测、运行另一个 SMT 核心）而处于低利用状态的时间。单个 CPU 核心的值将位于 [0..1] 的区间内。所有 CPU 核心的值是通过它们的总和计算得出的 [0..num cores]。

### OSUserTimeNormalized {#osusertimenormalized}

该值类似于 `OSUserTime`，但除以要测量的 CPU 核心数量，以便在 [0..1] 的区间内进行测量，而不考虑核心数量。这使你能够在集群中的多台服务器之间平均该指标的值，即使核心数量不均匀，仍然可以获取平均资源利用率指标。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 兼容协议服务器中的线程数量。

### QueryCacheBytes {#querycachebytes}

查询缓存的总大小，以字节为单位。

### QueryCacheEntries {#querycacheentries}

查询缓存中的总条目数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

最新复制部分与仍需复制的最新数据部分之间的最大延迟（以秒为单位），通过复制表进行衡量。非常高的值表示没有数据的副本。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在复制表中，队列中待复制的最大 INSERT 操作数量。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在复制表中，队列中待应用的最大合并操作数量。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在复制表中，最大队列大小（以操作数量为单位，例如获取、合并）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

副本延迟与同一表的最新副本延迟之间的最大差值，跨复制表进行衡量。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在复制表中，队列中的 INSERT 操作总和（仍待复制）。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在复制表中，队列中的合并操作总和（仍待应用）。

### ReplicasSumQueueSize {#replicassumqueuesize}

在复制表中的队列总大小（以操作数量为单位，例如获取、合并）。

### TCPThreads {#tcpthreads}

TCP 协议服务器中的线程数量（不包括 TLS）。

### Temperature_*N* {#temperature_n}

对应设备的温度，以 ℃ 为单位。传感器可能返回不现实的值。来源：`/sys/class/thermal`

### Temperature_*name* {#temperature_name}

相应硬件监控和传感器报告的温度，以 ℃ 为单位。传感器可能返回不现实的值。来源：`/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTree 系列所有表中存储的字节总数（已压缩，包括数据和索引）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree 系列所有表中数据部分的总数。超过 10,000 的数字将对服务器启动时间产生负面影响，并可能表明分区键选择不合理。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值所占用的总内存量（以字节为单位）（仅计算活动部分）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

主键值所保留的总内存量（以字节为单位）（仅计算活动部分）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree 系列所有表中存储的行（记录）总数。

### UncompressedCacheBytes {#uncompressedcachebytes}

未压缩缓存的总大小，以字节为单位。未压缩缓存通常不会提高性能，应大多避免使用。

### UncompressedCacheCells {#uncompressedcachecells}

未压缩缓存中的条目总数。每个条目表示一个解压缩的数据块。未压缩缓存通常不会提高性能，应大多避免使用。

### Uptime {#uptime}

服务器的正常运行时间，以秒为单位。它包括接受连接前的服务器初始化所花费的时间。

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

jemalloc 的统计信息内部增量更新编号（Jason Evans 的内存分配器），用于所有其他 `jemalloc` 指标中。

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

**另请参阅**

- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的一些事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。
