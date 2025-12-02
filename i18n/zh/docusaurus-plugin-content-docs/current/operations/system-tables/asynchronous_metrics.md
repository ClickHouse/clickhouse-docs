---
description: '包含在后台定期计算得到的指标的系统表。例如，当前正在使用的 RAM 数量。'
keywords: ['system table', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous&#95;metrics {#systemasynchronous_metrics}

<SystemTableCloud />

包含在后台周期性计算得到的指标。例如，当前正在使用的内存量。

列：

* `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
* `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
* `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述

**示例**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ 计算异步指标所花费的时间(秒)(这是异步指标的开销)。                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ 用户通过 `ALTER TABLE DETACH` 查询从 MergeTree 表中分离的数据部分总数(相对于意外、损坏或被忽略的部分)。服务器不关心已分离的部分,可以将其删除。                          │
│ NumberOfDetachedParts                   │          0 │ 从 MergeTree 表中分离的数据部分总数。数据部分可以由用户通过 `ALTER TABLE DETACH` 查询分离,也可以在部分损坏、意外或不需要时由服务器自动分离。服务器不关心已分离的部分,可以将其删除。 │
│ TotalRowsOfMergeTreeTables              │    2781309 │ 所有 MergeTree 系列表中存储的行(记录)总数。                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ 所有 MergeTree 系列表中存储的字节总数(压缩后,包括数据和索引)。                                                                                                                                                   │
│ NumberOfTables                          │         93 │ 服务器上所有数据库中的表总数,不包括无法包含 MergeTree 表的数据库。被排除的数据库引擎是那些动态生成表集合的引擎,例如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。 │
│ NumberOfDatabases                       │          6 │ 服务器上的数据库总数。                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ 所有 MergeTree 系列表的所有分区中每个分区的最大数据部分数。值大于 300 表示配置错误、过载或大量数据加载。                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ 所有 Replicated 表的队列中待应用的合并操作总数。                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ 所有 Replicated 表的队列中待复制的 INSERT 操作总数。                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

{/*- 与 system.events 和 system.metrics 不同，异步指标并不是在某个源代码文件中的简单列表里集中定义——
      它们和 src/Interpreters/ServerAsynchronousMetrics.cpp 中的逻辑混在一起。
      在这里专门将它们显式列出，便于读者查阅。 -*/ }

## 指标说明 {#metric-descriptions}

### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

用于计算异步高开销（与表相关）指标所花费的时间（以秒为单位）（这是异步指标的额外开销）。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

异步高开销（与表相关）指标的更新间隔。

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

用于计算异步指标所花费的时间（以秒为单位）（这是异步指标的额外开销）。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

指标更新间隔。

### BlockActiveTime_*name* {#blockactivetime_name}

块设备存在排队 I/O 请求的时间（以秒为单位）。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上被丢弃的字节数。这些操作与 SSD 相关。丢弃操作不会被 ClickHouse 使用，但可以被系统中的其他进程使用。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

从块设备请求的丢弃操作中，由操作系统 I/O 调度器合并后的操作数量。这些操作与 SSD 相关。丢弃操作不会被 ClickHouse 使用，但可以被系统中的其他进程使用。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardOps_*name* {#blockdiscardops_name}

从块设备请求的丢弃操作数量。这些操作与 SSD 相关。丢弃操作不会被 ClickHouse 使用，但可以被系统中的其他进程使用。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardTime_*name* {#blockdiscardtime_name}

在从块设备请求的丢弃操作中所花费的总时间（以秒为单位），为所有操作耗时之和。这些操作与 SSD 相关。丢弃操作不会被 ClickHouse 使用，但可以被系统中的其他进程使用。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockInFlightOps_*name* {#blockinflightops_name}

该值统计已发送给设备驱动但尚未完成的 I/O 请求数量。不包括仍在队列中但尚未发送给设备驱动的 I/O 请求。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockQueueTime_*name* {#blockqueuetime_name}

该值统计 I/O 请求在此块设备上等待的时间（以毫秒为单位）。如果有多个 I/O 请求在等待，该值将按“毫秒数 × 等待请求数”的乘积进行累加增长。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用了可以减少 I/O 的操作系统页缓存，该值可能低于从文件系统读取的字节数。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadMerges_*name* {#blockreadmerges_name}

从块设备请求的读操作中，由操作系统 I/O 调度器合并后的操作数量。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadOps_*name* {#blockreadops_name}

### BlockReadOps_*name* {#blockreadops_name}

从块设备请求的读操作次数。这是一个系统范围指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadTime_*name* {#blockreadtime_name}

在块设备上执行读操作所花费的时间（以秒为单位），为所有操作时间的总和。这是一个系统范围指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteBytes_*name* {#blockwritebytes_name}

写入块设备的字节数。由于使用了操作系统的页面缓存，该值可能小于写入文件系统的字节数，因为页面缓存可以减少 IO。由于直写缓存（write-through caching），对块设备的写入可能晚于对应的文件系统写入。这是一个系统范围指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteMerges_*name* {#blockwritemerges_name}

从块设备请求并由操作系统 IO 调度器合并在一起的写操作次数。这是一个系统范围指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteOps_*name* {#blockwriteops_name}

从块设备请求的写操作次数。这是一个系统范围指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteTime_*name* {#blockwritetime_name}

在块设备上执行写操作所花费的时间（以秒为单位），为所有操作时间的总和。这是一个系统范围指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU 的当前频率，单位为 MHz。大多数现代 CPU 会为节能和 Turbo Boost 而动态调整频率。

### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

字典更新的最大延迟时间（秒）。

### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

自上次成功加载以来，所有字典中的错误总次数。

### DiskAvailable_*name* {#diskavailable_name}

磁盘（虚拟文件系统）上的可用字节数。远程文件系统可能会显示类似 16 EiB 这样很大的值。

### DiskTotal_*name* {#disktotal_name}

磁盘（虚拟文件系统）的总大小（字节）。远程文件系统可能会显示类似 16 EiB 这样很大的值。

### DiskUnreserved_*name* {#diskunreserved_name}

磁盘（虚拟文件系统）上可用的字节数，不包括为合并（merge）、拉取（fetch）和移动（move）预留的空间。远程文件系统可能会显示类似 16 EiB 这样很大的值。

### DiskUsed_*name* {#diskused_name}

磁盘（虚拟文件系统）上已使用的字节数。远程文件系统并不总是提供该信息。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中的总字节数。该缓存存储在磁盘上。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 虚拟文件系统中已缓存文件分段的总数量。该缓存存储在磁盘上。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse 日志路径所在卷上可用的字节数。如果该值接近零，应在配置文件中调整日志轮转策略。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse 日志路径所在卷上可用的 inode 数量。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse 日志路径所在卷的大小（字节）。建议为日志预留至少 10 GB 的空间。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse 日志路径所在卷上的 inode 总数。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse 日志路径所在卷上已使用的字节数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse 日志路径所在卷上已使用的 inode 数量。

### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

主 ClickHouse 路径所挂载卷上可用的字节数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

主 ClickHouse 路径所挂载卷上可用的 inode 数量。如果该值接近零，表示存在配置错误，即使磁盘未满也会收到 `no space left on device` 错误。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主 ClickHouse 路径所挂载卷的总大小（以字节为单位）。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主 ClickHouse 路径所挂载卷上的 inode 总数。如果小于 2500 万，表示存在配置错误。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主 ClickHouse 路径所挂载卷上已使用的字节数。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

主 ClickHouse 路径所挂载卷上已使用的 inode 数量。该值大致对应文件的数量。

### HTTPThreads {#httpthreads}

HTTP 接口服务器中的线程数（不含 TLS）。

### InterserverThreads {#interserverthreads}

副本通信协议服务器中的线程数（不含 TLS）。

### Jitter {#jitter}

用于计算异步指标的线程被调度唤醒的预期时间与实际被唤醒时间之间的时间差。是整体系统延迟和响应性的间接指标。

### LoadAverage*N* {#loadaveragen}

整个系统在 1 分钟内使用指数平滑得到的平均负载。负载表示当前在所有进程中（即 OS 内核的调度实体）由 CPU 正在运行、等待 I/O，或已准备运行但此刻尚未被调度的线程数量。这个数字包含所有进程，而不仅仅是 clickhouse-server。如果系统过载，许多进程已准备运行但在等待 CPU 或 I/O，那么该数值可以大于 CPU 内核数。

### MaxPartCountForPartition {#maxpartcountforpartition}

所有 MergeTree 系列表中所有分区中，每个分区包含的数据分片的最大数量。如果该值大于 300，表示存在配置错误、系统过载或正在进行大规模数据导入。

### MemoryCode {#memorycode}

为服务器进程的机器代码页面映射的虚拟内存量，单位为字节。

### MemoryDataAndStack {#memorydataandstack}

为栈使用以及已分配内存映射的虚拟内存量，单位为字节。是否包含每个线程的栈以及大部分通过 `mmap` 系统调用分配的内存未作明确规定。此指标仅为完整性而存在。建议使用 `MemoryResident` 指标进行监控。

### MemoryResidentMax {#memoryresidentmax}

服务器进程使用的物理内存最大值，单位为字节。

### MemoryResident {#memoryresident}

服务器进程当前使用的物理内存量，单位为字节。

### MemoryShared {#memoryshared}

服务器进程使用且同时被其他进程共享的内存量，单位为字节。ClickHouse 不使用共享内存，但部分内存可能会因操作系统自身原因被标记为共享。监控该指标意义不大，它仅为完整性而存在。

### MemoryVirtual {#memoryvirtual}

服务器进程已分配的虚拟地址空间大小，单位为字节。虚拟地址空间大小通常远大于实际物理内存消耗，不应将其用作内存消耗估算。该指标取值较大是完全正常的，仅在技术层面上有意义。

### MySQLThreads {#mysqlthreads}

MySQL 兼容协议服务器中的线程数。

### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。该指标是系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

通过网络接口接收时被丢弃的数据包的总字节数。该指标是系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

通过网络接口接收时发生错误的次数。该指标是系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络数据包数量。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkSendDrop_*name* {#networksenddrop_name}

通过网络接口发送时被丢弃的数据包次数。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkSendErrors_*name* {#networksenderrors_name}

通过网络接口发送时发生错误（例如 TCP 重传）的次数。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包数量。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

由用户通过 `ALTER TABLE DETACH` 查询从 MergeTree 表中分离出来的部件总数（与异常的、损坏的或被忽略的部件相对）。服务器不关心已分离的部件，它们可以被删除。

### NumberOfDetachedParts {#numberofdetachedparts}

从 MergeTree 表中分离出来的部件总数。部件可以由用户通过 `ALTER TABLE DETACH` 查询分离，或者在部件损坏、异常或不再需要时由服务器自身分离。服务器不关心已分离的部件，它们可以被删除。

### NumberOfTables {#numberoftables}

服务器上所有数据库中的表的总数，不包括那些不能包含 MergeTree 表的数据库。被排除的数据库引擎是那些按需动态生成表集合的引擎，例如 `Lazy`、`MySQL`、`PostgreSQL`、`SQlite`。

### OSContextSwitches {#oscontextswitches}

主机系统发生的上下文切换次数。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSGuestNiceTime {#osguestnicetime}

在 Linux 内核控制下，为来宾操作系统运行虚拟 CPU 且来宾被设置为较高优先级时所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，仅为完整性而存在。单个 CPU 核心的取值位于区间 [0..1]。所有 CPU 核心的值是对各核心求和得到，位于区间 [0..num cores]。

### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在 Linux 内核控制下，为来宾操作系统运行虚拟 CPU 且来宾被设置为较高优先级时所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，仅为完整性而存在。单个 CPU 核心的取值位于区间 [0..1]。所有 CPU 核心的值是对各核心求和得到，位于区间 [0..num cores]。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值类似于 `OSGuestNiceTime`，但会再除以 CPU 核心数，使其无论核心数量多少都位于 [0..1] 区间。这使可以在集群中跨多台服务器对该指标取平均，即使各服务器的核心数不一致，仍然可以得到平均资源利用率指标。

### OSGuestTime {#osguesttime}

在 Linux 内核控制下，为来宾操作系统运行虚拟 CPU 所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。此指标与 ClickHouse 无关，仅为完整性而存在。单个 CPU 核心的取值位于区间 [0..1]。所有 CPU 核心的值是对各核心求和得到，位于区间 [0..num cores]。

### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU 所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。此指标对 ClickHouse 本身并无实际意义，但为完整性起见仍然保留。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对它们求和计算，范围为 [0..num cores]。

### OSGuestTimeNormalized {#osguesttimenormalized}

该值类似于 `OSGuestTime`，但会除以 CPU 核心数量，使其在 [0..1] 区间内进行度量，而与核心数量无关。这使你能够在集群中跨多台服务器对该指标的值进行平均，即使核心数量不一致，仍然可以得到平均资源使用率指标。

### OSIOWaitTime {#osiowaittime}

CPU 核心未运行代码、且由于进程在等待 IO，OS 内核没有在该 CPU 上运行任何其他进程的时间比例。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对它们求和计算，范围为 [0..num cores]。

### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU 核心未运行代码、且由于进程在等待 IO，OS 内核没有在该 CPU 上运行任何其他进程的时间比例。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对它们求和计算，范围为 [0..num cores]。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值类似于 `OSIOWaitTime`，但会除以 CPU 核心数量，使其在 [0..1] 区间内进行度量，而与核心数量无关。这使你能够在集群中跨多台服务器对该指标的值进行平均，即使核心数量不一致，仍然可以得到平均资源使用率指标。

### OSIdleTime {#osidletime}

从 OS 内核的角度看，CPU 核心处于空闲状态（甚至没有准备好去运行等待 IO 的进程）的时间比例。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。这不包括由于 CPU 内部原因（内存加载、流水线停顿、分支预测失败、运行另一个 SMT 线程）导致 CPU 未被充分利用的时间。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对它们求和计算，范围为 [0..num cores]。

### OSIdleTimeCPU_*N* {#osidletimecpu_n}

从 OS 内核的角度看，CPU 核心处于空闲状态（甚至没有准备好去运行等待 IO 的进程）的时间比例。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。这不包括由于 CPU 内部原因（内存加载、流水线停顿、分支预测失败、运行另一个 SMT 线程）导致 CPU 未被充分利用的时间。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对它们求和计算，范围为 [0..num cores]。

### OSIdleTimeNormalized {#osidletimenormalized}

该值类似于 `OSIdleTime`，但会除以 CPU 核心数量，使其在 [0..1] 区间内进行度量，而与核心数量无关。这使你能够在集群中跨多台服务器对该指标的值进行平均，即使核心数量不一致，仍然可以得到平均资源使用率指标。

### OSInterrupts {#osinterrupts}

主机上的中断次数。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### OSIrqTime {#osirqtime}

在 CPU 上处理硬件中断请求所花费时间的比例。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。该指标数值过高可能表明硬件配置错误或非常高的网络负载。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对它们求和计算，范围为 [0..num cores]。

### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU 上用于处理硬件中断请求的时间占比。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标值过高可能表示硬件配置错误或异常高的网络负载。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值是对各核心值求和得到的，总区间为 [0..num cores]。

### OSIrqTimeNormalized {#osirqtimenormalized}

该值与 `OSIrqTime` 类似，但除以 CPU 核心数，使其在 [0..1] 区间内度量，与核心数量无关。这样，即使集群中各服务器的核心数不一致，也可以对该指标在多台服务器之间求平均，并仍然得到平均资源利用率指标。

### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存总量，单位为字节。与 `OSMemoryFreePlusCached` 指标非常相似。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryBuffers {#osmemorybuffers}

被操作系统内核缓冲区使用的内存量，单位为字节。该值通常应当较小，如果数值很大，可能表明操作系统配置不当。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryCached {#osmemorycached}

被操作系统页缓存使用的内存量，单位为字节。通常，几乎所有可用内存都会被操作系统页缓存使用——因此该指标值较高是正常且预期的。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统上的空闲内存加上操作系统页缓存内存之和，单位为字节。这部分内存可供程序使用。该值应与 `OSMemoryAvailable` 非常接近。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上的空闲内存量，单位为字节。不包括操作系统页缓存所使用的内存。页缓存内存同样可供程序使用，因此该指标值可能会让人困惑。建议参阅 `OSMemoryAvailable` 指标。为方便起见，我们还提供了 `OSMemoryFreePlusCached` 指标，其值应与 OSMemoryAvailable 大致相近。另请参考 https://www.linuxatemyram.com/。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryTotal {#osmemorytotal}

主机系统上的内存总量，单位为字节。

### OSNiceTime {#osnicetime}

CPU 核心运行高优先级用户态代码的时间占比。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值是对各核心值求和得到的，总区间为 [0..num cores]。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU 核心运行高优先级用户态代码的时间占比。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值是对各核心值求和得到的，总区间为 [0..num cores]。

### OSNiceTimeNormalized {#osnicetimenormalized}

该值与 `OSNiceTime` 类似，但除以 CPU 核心数，使其在 [0..1] 区间内度量，与核心数量无关。这样，即使集群中各服务器的核心数不一致，也可以对该指标在多台服务器之间求平均，并仍然得到平均资源利用率指标。

### OSOpenFiles {#osopenfiles}

主机上已打开文件的总数量。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSProcessesBlocked {#osprocessesblocked}

等待 I/O 完成而被阻塞的线程数量（参见 `man procfs`）。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSProcessesCreated {#osprocessescreated}

创建的进程数量。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### OSProcessesRunning {#osprocessesrunning}

操作系统中可运行（正在运行或准备运行）线程的数量。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### OSSoftIrqTime {#ossoftirqtime}

CPU 用于处理软件中断请求的时间占比。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。该指标数值较高可能表明系统上运行的软件效率较低。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值计算为各核心值之和，区间为 [0..num cores]。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU 用于处理软件中断请求的时间占比。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。该指标数值较高可能表明系统上运行的软件效率较低。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值计算为各核心值之和，区间为 [0..num cores]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值与 `OSSoftIrqTime` 类似，但再除以 CPU 核心数，使其在 [0..1] 区间内度量，而不受核心数量影响。这样可以在集群中跨多台服务器对该指标进行平均，即使各服务器的核心数不一致，仍然能够得到平均资源利用率指标。

### OSStealTime {#osstealtime}

在虚拟化环境中运行时，CPU 花费在其他操作系统上的时间占比。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都会提供该指标，而且大多数都不会。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值计算为各核心值之和，区间为 [0..num cores]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

在虚拟化环境中运行时，CPU 花费在其他操作系统上的时间占比。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都会提供该指标，而且大多数都不会。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值计算为各核心值之和，区间为 [0..num cores]。

### OSStealTimeNormalized {#osstealtimenormalized}

该值与 `OSStealTime` 类似，但再除以 CPU 核心数，使其在 [0..1] 区间内度量，而不受核心数量影响。这样可以在集群中跨多台服务器对该指标进行平均，即使各服务器的核心数不一致，仍然能够得到平均资源利用率指标。

### OSSystemTime {#ossystemtime}

CPU 核心运行操作系统内核（system）代码的时间占比。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值计算为各核心值之和，区间为 [0..num cores]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU 核心运行操作系统内核（system）代码的时间占比。该指标是系统范围的，包含主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值计算为各核心值之和，区间为 [0..num cores]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

该值与 `OSSystemTime` 类似，但再除以 CPU 核心数，使其在 [0..1] 区间内度量，而不受核心数量影响。这样可以在集群中跨多台服务器对该指标进行平均，即使各服务器的核心数不一致，仍然能够得到平均资源利用率指标。

### OSThreadsRunnable {#osthreadsrunnable}

OS 内核调度器所看到的“可运行”线程总数。

### OSThreadsTotal {#osthreadstotal}

在操作系统内核调度器视角下的线程总数。

### OSUptime {#osuptime}

主机服务器（运行 ClickHouse 的机器）的运行时间，以秒为单位。

### OSUserTime {#osusertime}

CPU 核心运行用户态代码所占用时间的比例。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。这还包括由于 CPU 内部原因导致 CPU 未被充分利用的时间（内存加载、流水线停顿、分支预测失败、运行另一个 SMT 核心）。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对各核心求和计算得到，范围为 [0..num cores]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU 核心运行用户态代码所占用时间的比例。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。这还包括由于 CPU 内部原因导致 CPU 未被充分利用的时间（内存加载、流水线停顿、分支预测失败、运行另一个 SMT 核心）。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对各核心求和计算得到，范围为 [0..num cores]。

### OSUserTimeNormalized {#osusertimenormalized}

该值与 `OSUserTime` 类似，但会除以 CPU 核心数量，从而无论核心数量多少，其取值范围始终为 [0..1]。这允许你在集群中不同服务器之间对该指标进行平均，即使各服务器的核心数量不一致，仍然可以得到平均资源利用率指标。

### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 兼容协议服务器中的线程数量。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

在所有 Replicated 表中，最新的已复制数据 part 与仍待复制的最新数据 part 之间的最大时间差（以秒为单位）。一个非常大的值表明存在无数据的副本。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

在所有 Replicated 表中，队列中（仍待复制）的 INSERT 操作的最大数量。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在所有 Replicated 表中，队列中（仍待应用）的合并操作的最大数量。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

在所有 Replicated 表中，队列的最大大小（以 get、merge 等操作的数量计）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

在所有 Replicated 表中，某个副本的延迟与同一张表中最新副本延迟之间的最大差值。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

在所有 Replicated 表中，队列中（仍待复制）的 INSERT 操作的总数量。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

在所有 Replicated 表中，队列中（仍待应用）的合并操作的总数量。

### ReplicasSumQueueSize {#replicassumqueuesize}

在所有 Replicated 表中，队列大小的总和（以 get、merge 等操作的数量计）。

### TCPThreads {#tcpthreads}

TCP 协议服务器中的线程数量（不包括 TLS）。

### Temperature_*N* {#temperature_n}

对应设备的温度，单位为 ℃。传感器可能返回不合理的数值。来源：`/sys/class/thermal`

### Temperature_*name* {#temperature_name}

对应硬件监控设备及其相关传感器报告的温度，单位为 ℃。传感器可能返回不合理的数值。来源：`/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

所有 MergeTree 系列表中存储的数据总字节数（压缩后，包括数据和索引）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

所有 MergeTree 系列表中的数据 part 总数。大于 10 000 的数值会对服务器启动时间产生负面影响，并且可能表示分区键选择不合理。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值使用的内存总量（以字节为单位）（仅考虑活动 part）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值预留的内存总量（以字节为单位）（仅考虑活动 part）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

所有 MergeTree 系列表中存储的行（记录）总数。

### Uptime {#uptime}

服务器运行时间（秒）。包括服务器在开始接受连接前进行初始化所花费的时间。

### jemalloc.active {#jemallocactive}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.allocated {#jemallocallocated}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evans 的内存分配器）统计信息的内部递增更新编号，用于所有其他 `jemalloc` 指标中。

### jemalloc.mapped {#jemallocmapped}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata {#jemallocmetadata}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata_thp {#jemallocmetadata_thp}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.resident {#jemallocresident}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.retained {#jemallocretained}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.prof.active {#jemallocprofactive}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

**另请参阅**

- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含实时计算得到的指标。
- [system.events](/operations/system-tables/events) — 包含已发生事件的数量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。
