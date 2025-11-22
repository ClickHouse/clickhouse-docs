---
description: '系统表，包含在后台定期计算的指标。例如，当前已使用的 RAM 大小。'
keywords: ['system table', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics

<SystemTableCloud />

包含在后台定期计算的指标。例如,正在使用的内存量。

列:

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md) - 指标描述)

**示例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 计算异步指标所花费的时间(以秒为单位)(这是异步指标的开销)。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ 用户通过 `ALTER TABLE DETACH` 查询从 MergeTree 表中分离的数据部分总数(与意外、损坏或被忽略的部分相对)。服务器不关心已分离的部分,它们可以被删除。                          │
│ NumberOfDetachedParts                   │          0 │ 从 MergeTree 表中分离的数据部分总数。数据部分可以由用户通过 `ALTER TABLE DETACH` 查询分离,也可以由服务器在部分损坏、意外或不需要时自动分离。服务器不关心已分离的部分,它们可以被删除。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ 存储在所有 MergeTree 系列表中的总行数(记录数)。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ 存储在所有 MergeTree 系列表中的总字节数(压缩后,包括数据和索引)。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ 服务器上所有数据库中的表总数,不包括无法包含 MergeTree 表的数据库。被排除的数据库引擎是那些动态生成表集合的引擎,如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。 │
│ NumberOfDatabases                       │          6 │ 服务器上的数据库总数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ 所有 MergeTree 系列表的所有分区中每个分区的最大数据部分数。大于 300 的值表示配置错误、过载或大量数据加载。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ 所有 Replicated 表中队列中待执行的合并操作总数。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ 所有 Replicated 表中队列中待复制的 INSERT 操作总数。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- Unlike with system.events and system.metrics, the asynchronous metrics are not gathered in a simple list in a source code file - they
      are mixed with logic in src/Interpreters/ServerAsynchronousMetrics.cpp.
      Listing them here explicitly for reader convenience. --->


## 指标说明 {#metric-descriptions}

### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

计算异步重量级指标(与表相关)所花费的时间(以秒为单位)(这是异步指标的开销)。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

重量级指标(与表相关)的更新间隔

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

计算异步指标所花费的时间(以秒为单位)(这是异步指标的开销)。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔

### BlockActiveTime\__name_ {#blockactivetime_name}

块设备中 IO 请求排队的时间(以秒为单位)。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardBytes\__name_ {#blockdiscardbytes_name}

块设备上丢弃的字节数。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作,但系统上的其他进程可以使用。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardMerges\__name_ {#blockdiscardmerges_name}

从块设备请求并由操作系统 IO 调度器合并的丢弃操作数量。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作,但系统上的其他进程可以使用。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardOps\__name_ {#blockdiscardops_name}

从块设备请求的丢弃操作数量。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作,但系统上的其他进程可以使用。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardTime\__name_ {#blockdiscardtime_name}

从块设备请求的丢弃操作所花费的时间(以秒为单位),对所有操作求和。这些操作与 SSD 相关。ClickHouse 不使用丢弃操作,但系统上的其他进程可以使用。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockInFlightOps\__name_ {#blockinflightops_name}

此值统计已发送到设备驱动程序但尚未完成的 I/O 请求数量。它不包括在队列中但尚未发送到设备驱动程序的 IO 请求。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockQueueTime\__name_ {#blockqueuetime_name}

此值统计 IO 请求在此块设备上等待的毫秒数。如果有多个 IO 请求在等待,此值将按等待的毫秒数乘以等待的请求数的乘积增加。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadBytes\__name_ {#blockreadbytes_name}

从块设备读取的字节数。由于使用了操作系统页面缓存来节省 IO,该值可能低于从文件系统读取的字节数。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadMerges\__name_ {#blockreadmerges_name}

从块设备请求并由操作系统 IO 调度器合并的读取操作数量。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadOps\__name_ {#blockreadops_name}


从块设备请求的读取操作数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadTime\__name_ {#blockreadtime_name}

从块设备请求的读取操作所花费的时间(以秒为单位),对所有操作求和。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteBytes\__name_ {#blockwritebytes_name}

写入块设备的字节数。由于操作系统页面缓存的使用(可节省 IO),该值可能低于写入文件系统的字节数。由于写穿缓存机制,对块设备的写入可能晚于对文件系统的相应写入。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteMerges\__name_ {#blockwritemerges_name}

从块设备请求并由操作系统 IO 调度器合并的写入操作数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteOps\__name_ {#blockwriteops_name}

从块设备请求的写入操作数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteTime\__name_ {#blockwritetime_name}

从块设备请求的写入操作所花费的时间(以秒为单位),对所有操作求和。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。来源:`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### CPUFrequencyMHz\__name_ {#cpufrequencymhz_name}

CPU 的当前频率,以 MHz 为单位。大多数现代 CPU 会动态调整频率以实现节能和睿频加速。

### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

字典更新的最大延迟(以秒为单位)。

### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

自上次成功加载以来所有字典中的错误数。

### DiskAvailable\__name_ {#diskavailable_name}

磁盘(虚拟文件系统)上的可用字节数。远程文件系统可能显示较大的值,如 16 EiB。

### DiskTotal\__name_ {#disktotal_name}

磁盘(虚拟文件系统)的总大小(以字节为单位)。远程文件系统可能显示较大的值,如 16 EiB。

### DiskUnreserved\__name_ {#diskunreserved_name}

磁盘(虚拟文件系统)上的可用字节数,不包括为合并、抓取和移动预留的空间。远程文件系统可能显示较大的值,如 16 EiB。

### DiskUsed\__name_ {#diskused_name}

磁盘(虚拟文件系统)上已使用的字节数。远程文件系统并不总是提供此信息。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中的总字节数。此缓存保存在磁盘上。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 虚拟文件系统中缓存的文件段总数。此缓存保存在磁盘上。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse 日志路径所挂载卷上的可用字节数。如果此值接近零,您应该在配置文件中调整日志轮转设置。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse 日志路径所挂载卷上的可用 inode 数。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse 日志路径所挂载卷的大小(以字节为单位)。建议为日志预留至少 10 GB 的空间。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse 日志路径所挂载卷上的 inode 总数。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse 日志路径所挂载卷上已使用的字节数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse 日志路径所挂载卷上已使用的 inode 数。


### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主 ClickHouse 路径所在卷的可用字节数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主 ClickHouse 路径所在卷的可用 inode 数量。如果接近零,则表示配置错误,即使磁盘未满,您也会收到"设备上没有剩余空间"的错误。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主 ClickHouse 路径所在卷的大小,以字节为单位。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主 ClickHouse 路径所在卷的 inode 总数。如果少于 2500 万,则表示配置错误。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主 ClickHouse 路径所在卷的已用字节数。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主 ClickHouse 路径所在卷的已用 inode 数量。此值主要对应文件数量。

### HTTPThreads {#httpthreads}

HTTP 接口服务器中的线程数(不含 TLS)。

### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数(不含 TLS)。

### Jitter {#jitter}

用于计算异步指标的线程计划唤醒时间与实际唤醒时间之间的时间差。这是系统整体延迟和响应能力的代理指标。

### LoadAverage*N* {#loadaveragen}

整个系统的负载,使用指数平滑法在 1 分钟内平均计算。负载表示所有进程中(操作系统内核的调度实体)当前正在 CPU 上运行、等待 IO 或准备运行但此时未被调度的线程数量。此数字包括所有进程,不仅仅是 clickhouse-server。如果系统过载,许多进程准备运行但正在等待 CPU 或 IO,则该数字可能大于 CPU 核心数。

### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree 系列所有表的所有分区中每个分区的最大数据分片数。大于 300 的值表示配置错误、过载或大量数据加载。

### MemoryCode {#memorycode}

为服务器进程的机器码页面映射的虚拟内存量,以字节为单位。

### MemoryDataAndStack {#memorydataandstack}

为栈使用和已分配内存映射的虚拟内存量,以字节为单位。未指定是否包括每个线程的栈和大部分通过 'mmap' 系统调用分配的内存。此指标仅出于完整性原因而存在。建议使用 `MemoryResident` 指标进行监控。

### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的物理内存最大量,以字节为单位。

### MemoryResident {#memoryresident}

服务器进程使用的物理内存量,以字节为单位。

### MemoryShared {#memoryshared}

服务器进程使用的同时也被其他进程共享的内存量,以字节为单位。ClickHouse 不使用共享内存,但操作系统可能出于自身原因将某些内存标记为共享。此指标的监控意义不大,仅出于完整性原因而存在。

### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间大小,以字节为单位。虚拟地址空间的大小通常远大于物理内存消耗,不应用作内存消耗的估计值。此指标的大值是完全正常的,仅具有技术意义。

### MySQLThreads {#mysqlthreads}

MySQL 兼容协议服务器中的线程数。

### NetworkReceiveBytes\__name_ {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统级指标,包括主机上的所有进程,不仅仅是 clickhouse-server。

### NetworkReceiveDrop\__name_ {#networkreceivedrop_name}

通过网络接口接收时丢弃的数据包字节数。这是一个系统级指标,包括主机上的所有进程,不仅仅是 clickhouse-server。

### NetworkReceiveErrors\__name_ {#networkreceiveerrors_name}

通过网络接口接收时发生错误的次数。这是一个系统级指标,包括主机上的所有进程,不仅仅是 clickhouse-server。


### NetworkReceivePackets\__name_ {#networkreceivepackets_name}

通过网络接口接收的网络数据包数量。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### NetworkSendBytes\__name_ {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### NetworkSendDrop\__name_ {#networksenddrop_name}

通过网络接口发送时数据包被丢弃的次数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### NetworkSendErrors\__name_ {#networksenderrors_name}

通过网络接口发送时发生错误(例如 TCP 重传)的次数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### NetworkSendPackets\__name_ {#networksendpackets_name}

通过网络接口发送的网络数据包数量。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

用户通过 `ALTER TABLE DETACH` 查询从 MergeTree 表中分离的数据部分总数(与意外、损坏或被忽略的部分相对)。服务器不关心已分离的部分,它们可以被删除。

### NumberOfDetachedParts {#numberofdetachedparts}

从 MergeTree 表中分离的数据部分总数。数据部分可以由用户通过 `ALTER TABLE DETACH` 查询分离,也可以由服务器自身在部分损坏、意外或不需要时分离。服务器不关心已分离的部分,它们可以被删除。

### NumberOfTables {#numberoftables}

服务器上所有数据库中的表总数,不包括无法包含 MergeTree 表的数据库。被排除的数据库引擎是那些动态生成表集合的引擎,如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。

### OSContextSwitches {#oscontextswitches}

主机系统经历的上下文切换次数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSGuestNiceTime {#osguestnicetime}

在 Linux 内核控制下为客户操作系统运行虚拟 CPU 所花费的时间比率,当客户被设置为更高优先级时(参见 `man procfs`)。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关,但为了完整性仍然存在。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSGuestNiceTimeCPU\__N_ {#osguestnicetimecpu_n}

在 Linux 内核控制下为客户操作系统运行虚拟 CPU 所花费的时间比率,当客户被设置为更高优先级时(参见 `man procfs`)。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关,但为了完整性仍然存在。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值类似于 `OSGuestNiceTime`,但除以 CPU 核心数,以便无论核心数量如何都在 [0..1] 区间内测量。这允许您在集群中的多个服务器之间对此指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSGuestTime {#osguesttime}

在 Linux 内核控制下为客户操作系统运行虚拟 CPU 所花费的时间比率(参见 `man procfs`)。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关,但为了完整性仍然存在。单个 CPU 核心的值将在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSGuestTimeCPU\__N_ {#osguesttimecpu_n}


在 Linux 内核控制下为客户操作系统运行虚拟 CPU 所花费的时间比率(参见 `man procfs`)。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关,但为了完整性仍然保留。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSGuestTimeNormalized {#osguesttimenormalized}

该值与 `OSGuestTime` 类似,但除以 CPU 核心数进行归一化,使其无论核心数量如何都在 [0..1] 区间内。这使您能够在集群中的多个服务器之间对此指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSIOWaitTime {#osiowaittime}

CPU 核心未运行代码且操作系统内核未在此 CPU 上运行任何其他进程(因为进程正在等待 IO)的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSIOWaitTimeCPU\__N_ {#osiowaittimecpu_n}

CPU 核心未运行代码且操作系统内核未在此 CPU 上运行任何其他进程(因为进程正在等待 IO)的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值与 `OSIOWaitTime` 类似,但除以 CPU 核心数进行归一化,使其无论核心数量如何都在 [0..1] 区间内。这使您能够在集群中的多个服务器之间对此指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSIdleTime {#osidletime}

从操作系统内核角度来看,CPU 核心处于空闲状态(甚至未准备好运行等待 IO 的进程)的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。这不包括由于 CPU 内部原因(内存加载、流水线停顿、分支预测错误、运行另一个 SMT 核心)导致 CPU 利用率不足的时间。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSIdleTimeCPU\__N_ {#osidletimecpu_n}

从操作系统内核角度来看,CPU 核心处于空闲状态(甚至未准备好运行等待 IO 的进程)的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。这不包括由于 CPU 内部原因(内存加载、流水线停顿、分支预测错误、运行另一个 SMT 核心)导致 CPU 利用率不足的时间。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSIdleTimeNormalized {#osidletimenormalized}

该值与 `OSIdleTime` 类似,但除以 CPU 核心数进行归一化,使其无论核心数量如何都在 [0..1] 区间内。这使您能够在集群中的多个服务器之间对此指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSInterrupts {#osinterrupts}

主机上的中断次数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSIrqTime {#osirqtime}

在 CPU 上运行硬件中断请求所花费的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。此指标的高值可能表示硬件配置错误或网络负载非常高。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。


### OSIrqTimeCPU\__N_ {#osirqtimecpu_n}

CPU 处理硬件中断请求所花费的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。该指标值过高可能表明硬件配置不当或网络负载过高。单个 CPU 核心的值范围为 [0..1]。所有 CPU 核心的值为各核心值的总和 [0..核心数]。

### OSIrqTimeNormalized {#osirqtimenormalized}

该值与 `OSIrqTime` 类似,但除以 CPU 核心数后归一化到 [0..1] 区间,不受核心数量影响。这样即使集群中各服务器的核心数不同,您也可以对该指标值进行平均,从而获得平均资源利用率指标。

### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存量,以字节为单位。该指标与 `OSMemoryFreePlusCached` 非常相似。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSMemoryBuffers {#osmemorybuffers}

操作系统内核缓冲区占用的内存量,以字节为单位。该值通常应该较小,值过大可能表明操作系统配置不当。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSMemoryCached {#osmemorycached}

操作系统页面缓存占用的内存量,以字节为单位。通常情况下,几乎所有可用内存都会被操作系统页面缓存使用,因此该指标值较高是正常现象。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统上空闲内存与操作系统页面缓存内存之和,以字节为单位。该内存可供程序使用。该值应该与 `OSMemoryAvailable` 非常接近。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上的空闲内存量,以字节为单位。不包括操作系统页面缓存占用的内存。由于页面缓存内存也可供程序使用,因此该指标值可能会令人困惑。建议参考 `OSMemoryAvailable` 指标。为方便起见,我们还提供了 `OSMemoryFreePlusCached` 指标,其值应该与 OSMemoryAvailable 较为接近。另请参阅 https://www.linuxatemyram.com/。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSMemoryTotal {#osmemorytotal}

主机系统的总内存量,以字节为单位。

### OSNiceTime {#osnicetime}

CPU 核心运行高优先级用户空间代码的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。单个 CPU 核心的值范围为 [0..1]。所有 CPU 核心的值为各核心值的总和 [0..核心数]。

### OSNiceTimeCPU\__N_ {#osnicetimecpu_n}

CPU 核心运行高优先级用户空间代码的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。单个 CPU 核心的值范围为 [0..1]。所有 CPU 核心的值为各核心值的总和 [0..核心数]。

### OSNiceTimeNormalized {#osnicetimenormalized}

该值与 `OSNiceTime` 类似,但除以 CPU 核心数后归一化到 [0..1] 区间,不受核心数量影响。这样即使集群中各服务器的核心数不同,您也可以对该指标值进行平均,从而获得平均资源利用率指标。

### OSOpenFiles {#osopenfiles}

主机上已打开的文件总数。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSProcessesBlocked {#osprocessesblocked}

等待 I/O 完成而被阻塞的线程数(参见 `man procfs`)。 这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。


### OSProcessesCreated {#osprocessescreated}

已创建的进程数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSProcessesRunning {#osprocessesrunning}

操作系统中可运行(正在运行或准备运行)的线程数。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。

### OSSoftIrqTime {#ossoftirqtime}

CPU 运行软件中断请求所花费的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。该指标值较高可能表明系统上运行的软件效率低下。单个 CPU 核心的值在区间 [0..1] 内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSSoftIrqTimeCPU\__N_ {#ossoftirqtimecpu_n}

CPU 运行软件中断请求所花费的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。该指标值较高可能表明系统上运行的软件效率低下。单个 CPU 核心的值在区间 [0..1] 内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值与 `OSSoftIrqTime` 类似,但除以 CPU 核心数,以便在 [0..1] 区间内进行测量,不受核心数量的影响。这使您能够在集群中的多个服务器之间对该指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSStealTime {#osstealtime}

在虚拟化环境中运行时,CPU 在其他操作系统中花费的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供此指标,大多数环境都不提供。单个 CPU 核心的值在区间 [0..1] 内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSStealTimeCPU\__N_ {#osstealtimecpu_n}

在虚拟化环境中运行时,CPU 在其他操作系统中花费的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。并非所有虚拟化环境都提供此指标,大多数环境都不提供。单个 CPU 核心的值在区间 [0..1] 内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSStealTimeNormalized {#osstealtimenormalized}

该值与 `OSStealTime` 类似,但除以 CPU 核心数,以便在 [0..1] 区间内进行测量,不受核心数量的影响。这使您能够在集群中的多个服务器之间对该指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSSystemTime {#ossystemtime}

CPU 核心运行操作系统内核(系统)代码的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。单个 CPU 核心的值在区间 [0..1] 内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSSystemTimeCPU\__N_ {#ossystemtimecpu_n}

CPU 核心运行操作系统内核(系统)代码的时间比率。这是一个系统级指标,包含主机上的所有进程,而不仅仅是 clickhouse-server。单个 CPU 核心的值在区间 [0..1] 内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

该值与 `OSSystemTime` 类似,但除以 CPU 核心数,以便在 [0..1] 区间内进行测量,不受核心数量的影响。这使您能够在集群中的多个服务器之间对该指标的值进行平均,即使核心数量不统一,仍然可以获得平均资源利用率指标。

### OSThreadsRunnable {#osthreadsrunnable}

操作系统内核调度器所看到的"可运行"线程总数。

### OSThreadsTotal {#osthreadstotal}


操作系统内核调度器所见的线程总数。

### OSUptime {#osuptime}

主机服务器(运行 ClickHouse 的机器)的运行时间,以秒为单位。

### OSUserTime {#osusertime}

CPU 核心运行用户空间代码的时间比率。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。这也包括由于 CPU 内部原因(内存加载、流水线停顿、分支预测错误、运行另一个 SMT 核心)导致 CPU 未充分利用的时间。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSUserTimeCPU\__N_ {#osusertimecpu_n}

CPU 核心运行用户空间代码的时间比率。这是一个系统级指标,包括主机上的所有进程,而不仅仅是 clickhouse-server。这也包括由于 CPU 内部原因(内存加载、流水线停顿、分支预测错误、运行另一个 SMT 核心)导致 CPU 未充分利用的时间。单个 CPU 核心的值在 [0..1] 区间内。所有 CPU 核心的值计算为它们的总和 [0..核心数]。

### OSUserTimeNormalized {#osusertimenormalized}

该值与 `OSUserTime` 类似,但除以 CPU 核心数,使其在 [0..1] 区间内测量,与核心数无关。这允许您在集群中的多个服务器之间对该指标的值进行平均,即使核心数不统一,仍然可以获得平均资源利用率指标。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 兼容协议服务器中的线程数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

在所有 Replicated 表中,最新的已复制数据部分与仍需复制的最新数据部分之间的最大时间差(以秒为单位)。非常高的值表示副本没有数据。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在所有 Replicated 表中,队列中(仍需复制)的 INSERT 操作的最大数量。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在所有 Replicated 表中,队列中(仍需应用)的合并操作的最大数量。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在所有 Replicated 表中,最大队列大小(以操作数量计,如 get、merge)。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

在所有 Replicated 表中,副本延迟与同一表的最新副本延迟之间的最大差异。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在所有 Replicated 表中,队列中(仍需复制)的 INSERT 操作的总和。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在所有 Replicated 表中,队列中(仍需应用)的合并操作的总和。

### ReplicasSumQueueSize {#replicassumqueuesize}

在所有 Replicated 表中,队列大小的总和(以操作数量计,如 get、merge)。

### TCPThreads {#tcpthreads}

TCP 协议服务器(不含 TLS)中的线程数。

### Temperature\__N_ {#temperature_n}

相应设备的温度,单位为 ℃。传感器可能返回不真实的值。来源:`/sys/class/thermal`

### Temperature\__name_ {#temperature_name}

相应硬件监视器和相应传感器报告的温度,单位为 ℃。传感器可能返回不真实的值。来源:`/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

存储在所有 MergeTree 系列表中的字节总量(压缩后,包括数据和索引)。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

所有 MergeTree 系列表中的数据部分总数。大于 10,000 的数字会对服务器启动时间产生负面影响,这可能表明分区键的选择不合理。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值使用的内存总量(以字节为单位)(仅考虑活动部分)。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值保留的内存总量(以字节为单位)(仅考虑活动部分)。


### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

存储在所有 MergeTree 系列表中的总行数(记录数)。

### Uptime {#uptime}

服务器运行时间(以秒为单位)。包括服务器在接受连接之前初始化所花费的时间。

### jemalloc.active {#jemallocactive}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.allocated {#jemallocallocated}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.epoch {#jemallocepoch}

jemalloc(Jason Evans 的内存分配器)统计信息的内部增量更新编号,用于所有其他 `jemalloc` 指标。

### jemalloc.mapped {#jemallocmapped}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata {#jemallocmetadata}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata_thp {#jemallocmetadata_thp}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.resident {#jemallocresident}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.retained {#jemallocretained}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.prof.active {#jemallocprofactive}

底层内存分配器(jemalloc)的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

**另请参阅**

- [监控](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.events](/operations/system-tables/events) — 包含已发生的事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。
