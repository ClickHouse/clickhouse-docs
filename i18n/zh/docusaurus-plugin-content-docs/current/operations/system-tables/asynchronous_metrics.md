---
description: '包含在后台定期计算的指标的系统表。例如，当前正在使用的 RAM 容量。'
keywords: ['系统表', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous&#95;metrics {#systemasynchronous_metrics}

<SystemTableCloud />

包含在后台定期计算得到的指标。例如，当前正在使用的 RAM 大小。

列：

* `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
* `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。
* `description` ([String](../../sql-reference/data-types/string.md) - 指标描述)

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

{/*- 与 system.events 和 system.metrics 不同，异步指标并不是在某个源代码文件中以简单列表的形式集中维护——
      它们与 src/Interpreters/ServerAsynchronousMetrics.cpp 中的逻辑交织在一起。
      在此将其显式列出，便于读者查阅。 -*/ }


## 指标说明 {#metric-descriptions}

### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

用于计算异步重型（与表相关）指标所花费的时间，单位为秒（即异步指标的额外开销）。

### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

繁重（与表相关）指标的更新间隔

### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

用于计算异步指标所花费的时间（以秒为单位），即异步指标带来的额外开销。

### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

异步指标更新间隔

### BlockActiveTime_*name* {#blockactivetime_name}

块设备中 IO 请求处于队列中的时间（以秒为单位）。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

块设备上被丢弃的字节数。这些操作主要适用于 SSD。ClickHouse 本身不会执行 discard 操作，但系统上的其他进程可能会使用。这是一个系统级指标，包含主机上所有进程的数据，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

从块设备请求并由操作系统 I/O 调度器合并的丢弃（discard）操作次数。这些操作与 SSD 相关。ClickHouse 本身不使用丢弃操作，但系统上的其他进程可能会使用。这是一个系统级别指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardOps_*name* {#blockdiscardops_name}

从块设备请求的 discard 操作次数。这些操作与 SSD 相关。ClickHouse 自身不会使用 discard 操作，但系统上的其他进程可能会使用它们。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockDiscardTime_*name* {#blockdiscardtime_name}

以秒为单位，表示在块设备上执行的 discard 请求操作所花费的时间，总计所有此类操作。这些操作主要与 SSD 相关。ClickHouse 本身不会使用 discard 操作，但系统上的其他进程可能会使用。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockInFlightOps_*name* {#blockinflightops_name}

该值统计已发出到设备驱动程序但尚未完成的 I/O 请求数量。不包括仍在队列中但尚未发出到设备驱动程序的 I/O 请求。此为系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockQueueTime_*name* {#blockqueuetime_name}

该值记录 IO 请求在此块设备上等待的毫秒数。如果同时有多个 IO 请求在等待，则该值会按照“等待的毫秒数 × 等待的请求数量”的乘积增长。该指标是系统级的，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadBytes_*name* {#blockreadbytes_name}

从块设备读取的字节数。由于使用了可节省 IO 的操作系统页缓存，该值可能小于从文件系统读取的字节数。该指标是系统范围的，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadMerges_*name* {#blockreadmerges_name}

从块设备请求的读操作数量，这些读操作由操作系统的 I/O 调度器合并在一起。该指标是系统级的，包含主机上的所有进程，而不仅仅是 clickhouse-server。数据来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadOps_*name* {#blockreadops_name}

从块设备请求的读操作次数。これは系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockReadTime_*name* {#blockreadtime_name}

以秒为单位，表示对块设备发起的所有读操作所耗费时间的总和。该指标为系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteBytes_*name* {#blockwritebytes_name}

写入到块设备的字节数。由于使用了可以节省 IO 的操作系统页面缓存，该值可能小于写入到文件系统的字节数。由于直写缓存机制，对块设备的写入可能会晚于对文件系统的相应写入。这是一个系统级指标，包含宿主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteMerges_*name* {#blockwritemerges_name}

从块设备发起并由操作系统 IO 调度器合并的写操作请求次数。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteOps_*name* {#blockwriteops_name}

从块设备请求的写操作次数。这是一个系统级指标，包含主机上所有进程的操作，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### BlockWriteTime_*name* {#blockwritetime_name}

以秒为单位，表示块设备上所有写入操作所耗费时间的总和。该指标为系统级指标，包含主机上所有进程的贡献，而不仅仅是 clickhouse-server。来源：`/sys/block`。参见 https://www.kernel.org/doc/Documentation/block/stat.txt

### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

CPU 当前的频率，单位为 MHz。大多数现代 CPU 会出于节能和 Turbo Boost 的目的动态调整频率。

### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

字典更新的最大延迟时间（以秒为单位）。

### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

自上次成功加载以来，所有字典发生的错误总数。

### DiskAvailable_*name* {#diskavailable_name}

磁盘（虚拟文件系统）上的可用字节数。远程文件系统可能会显示一个很大的值，例如 16 EiB。

### DiskTotal_*name* {#disktotal_name}

磁盘（虚拟文件系统）的总大小（以字节为单位）。远程文件系统可能会显示一个非常大的数值，例如 16 EiB。

### DiskUnreserved_*name* {#diskunreserved_name}

磁盘（虚拟文件系统）在不包括为合并、拉取和移动预留空间时的可用字节数。远程文件系统可能会显示类似 16 EiB 这样的大值。

### DiskUsed_*name* {#diskused_name}

磁盘（虚拟文件系统）上已使用的字节数。远程文件系统不一定总能提供此信息。

### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 虚拟文件系统中缓存占用的总字节数。该缓存存储在磁盘上。

### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 虚拟文件系统中缓存的文件段总数。此缓存驻留在磁盘上。

### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse 日志路径所在卷上可用的字节数。若该值接近零，应在配置文件中调整日志轮转策略。

### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

在挂载了 ClickHouse 日志路径的卷上可用的 inode 数量。

### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

挂载了 ClickHouse 日志路径的卷的大小，以字节为单位。建议为日志预留至少 10 GB 的空间。

### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse 日志路径所在卷上的 inode 总数。

### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

在挂载 ClickHouse 日志路径的卷上已使用的字节数。

### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

挂载了 ClickHouse 日志路径的卷上已使用的 inode 数量。

### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

挂载主 ClickHouse 路径的卷上可用的字节数。

### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

在挂载了 ClickHouse 主路径的卷上可用 inode 的数量。如果该值接近零，则表示存在配置错误，即使磁盘尚未已满，你也会遇到 “no space left on device” 错误。

### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

主 ClickHouse 路径所挂载的卷大小，以字节为单位。

### FilesystemMainPathTotalINodes {#filesystemmainpathtotalinodes}

主 ClickHouse 目录所在卷上的 inode 总数。若该值小于 2500 万，则表示存在配置错误。

### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

主 ClickHouse 路径所在卷上已使用的字节数。

### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

在挂载 ClickHouse 主路径的卷上已使用的 inode 数量。该值通常与文件数量大致相对应。

### HTTPThreads {#httpthreads}

HTTP 接口服务器的线程数（不包括 TLS）。

### InterserverThreads {#interserverthreads}

用于副本间通信协议服务器的线程数量（不使用 TLS）。

### 抖动 {#jitter}

用于计算异步指标的线程计划唤醒时间与其实际被唤醒时间之间的差值。是衡量整体系统延迟和响应性的一个间接指标。

### LoadAverage*N* {#loadaveragen}

整个系统负载，使用 1 分钟时间窗口的指数平滑计算得到的平均值。该负载表示在所有进程中（即 OS 内核的调度实体），当前正在 CPU 上运行、等待 I/O，或已就绪但此刻尚未被调度运行的线程数量。这个数量包含所有进程，而不仅仅是 clickhouse-server。若系统过载，许多进程已就绪但在等待 CPU 或 I/O，则该数值可以大于 CPU 核心数。

### MaxPartCountForPartition {#maxpartcountforpartition}

在所有 MergeTree 系列表的所有分区中，单个分区允许存在的最大分区片段数量。数值大于 300 通常表示存在配置错误、过载或大规模数据加载。

### MemoryCode {#memorycode}

为服务器进程的机器代码页映射的虚拟内存量（以字节为单位）。

### MemoryDataAndStack {#memorydataandstack}

为栈和已分配内存映射的虚拟内存大小，单位为字节。是否包含每个线程的栈，以及大部分通过 `mmap` 系统调用分配的内存，并未明确规定。此指标仅为完整性而存在。建议使用 `MemoryResident` 指标进行监控。

### MemoryResidentMax {#memoryresidentmax}

服务器进程占用的物理内存最大值（以字节为单位）。

### MemoryResident {#memoryresident}

服务器进程占用的物理内存大小（字节）。

### MemoryShared {#memoryshared}

服务器进程使用的、同时也被其他进程共享的内存量，以字节为单位。ClickHouse 本身并不使用共享内存，但操作系统可能会出于自身原因将部分内存标记为共享内存。这个指标通常没有太大的监控价值，仅仅是为了指标的完整性而提供。

### MemoryVirtual {#memoryvirtual}

服务器进程分配的虚拟地址空间大小（以字节为单位）。虚拟地址空间的大小通常远大于实际物理内存消耗，因此不应将其用作内存消耗的估算值。该指标数值较大是完全正常的，本身只在技术层面具有意义。

### MySQLThreads {#mysqlthreads}

MySQL 兼容协议服务器中的线程数。

### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

通过网络接口接收的字节数。这是一个系统级指标，包含主机上所有进程的数据，而不仅仅是 clickhouse-server。

### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

通过网络接口接收数据包时被丢弃的字节数。该指标是系统范围的，涵盖主机上的所有进程，而不仅仅是 clickhouse-server。

### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

通过网络接口接收数据时发生错误的次数。该指标为系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NetworkReceivePackets_*name* {#networkreceivepackets_name}

通过网络接口接收的网络数据包数量。这是一个系统范围指标，包含主机上所有进程的数据，而不仅仅是 clickhouse-server。

### NetworkSendBytes_*name* {#networksendbytes_name}

通过网络接口发送的字节数。此为系统级指标，包含主机上所有进程，而不仅仅是 ClickHouse 服务器进程。

### NetworkSendDrop_*name* {#networksenddrop_name}

通过网络接口发送时被丢弃的数据包次数。这是系统范围的指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### NetworkSendErrors_*name* {#networksenderrors_name}

通过网络接口发送数据时发生错误（例如 TCP 重传）的次数。这是系统范围内的指标，统计主机上所有进程的情况，而不仅仅是 clickhouse-server。

### NetworkSendPackets_*name* {#networksendpackets_name}

通过网络接口发送的网络数据包数量。这是一个系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### NumberOfDatabases {#numberofdatabases}

服务器上的数据库总数。

### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

通过执行 `ALTER TABLE DETACH` 查询由用户从 MergeTree 表中分离的分区片段总数（与意外的、损坏的或被忽略的分区片段相对）。服务器不会关心这些已分离的分区片段，可以将其删除。

### NumberOfDetachedParts {#numberofdetachedparts}

从 MergeTree 表中分离的分区片段总数。分区片段可以由用户通过 `ALTER TABLE DETACH` 查询分离，也可以在分区片段损坏、异常或不再需要时由服务器自行分离。服务器不会再关心这些已分离的分区片段，它们可以被安全删除。

### NumberOfTables {#numberoftables}

服务器上所有数据库中表的总数量，但不包括那些不能包含 MergeTree 表的数据库。被排除的数据库引擎是在运行时动态生成表集合的引擎，例如 `Lazy`、`MySQL`、`PostgreSQL`、`SQLite`。

### OSContextSwitches {#oscontextswitches}

系统在主机上发生的上下文切换总次数。该指标为系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### OSGuestNiceTime {#osguestnicetime}

在 Linux 内核控制下，为来宾操作系统运行虚拟 CPU（且该来宾被设置为较高优先级）所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，包含宿主机上的所有进程，而不仅仅是 clickhouse-server。对于 ClickHouse 而言，此指标本身无关紧要，但为完整性仍然保留。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值是各核心值的总和，范围为 [0..num cores]。

### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU、且该来宾系统被设置为较高优先级时所花费时间的比例（参见 `man procfs`）。这是一个系统范围的指标，包含宿主机上的所有进程，而不仅仅是 clickhouse-server。此指标对 ClickHouse 并无实际意义，仅为保证指标集完整而保留。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对各核心求和计算，范围为 [0..num cores]。

### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

该值与 `OSGuestNiceTime` 类似，但会除以 CPU 核心数量，使其在不考虑核心数量的情况下归一化到 [0..1] 区间内。这样即使集群中各服务器的核心数量不一致，也可以在多台服务器之间对该指标进行平均，并且仍然能够得到平均资源利用率指标。如果进行了相应配置，可以使用 Cgroup CPU QUOTA 除以其周期得到的值来代替实际的 CPU 核心数，在这种情况下，该指标的值在某些时刻可能会超过 1。

### OSGuestTime {#osguesttime}

在 Linux 内核控制下，为来宾操作系统运行虚拟 CPU 所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，包含宿主机上的所有进程，而不仅仅是 clickhouse-server。此指标对 ClickHouse 而言基本无关紧要，但为完整性起见仍然保留。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值为各核心数值之和，其范围为 [0..num cores]。

### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

在 Linux 内核控制下为来宾操作系统运行虚拟 CPU 所花费时间的比例（参见 `man procfs`）。这是一个系统级指标，涵盖宿主机上的所有进程，而不仅仅是 clickhouse-server。对于 ClickHouse 而言，该指标并不重要，但为保证完整性仍然保留。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值是各核心值求和计算得到，范围为 [0..num cores]。

### OSGuestTimeNormalized {#osguesttimenormalized}

该值与 `OSGuestTime` 类似，但会除以 CPU 核心数，从而在与核心数量无关的情况下，将其规范化到 [0..1] 区间。这样，即使集群中各服务器的 CPU 核心数不一致，您也可以在多台服务器之间对该指标进行平均，并仍然获得平均资源利用率指标。如果进行了相应配置，可以使用 Cgroup 中 CPU QUOTA 与其周期的比值来代替实际的 CPU 核心数，此时该指标在某些时刻的取值可能会超过 1。

### OSIOWaitTime {#osiowaittime}

CPU 核心没有运行代码、同时操作系统内核也没有在该 CPU 上运行其他进程（因为这些进程在等待 I/O）所占用时间的比例。此为系统范围的指标，统计主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对各核心求和得到，范围为 [0..num cores]。

### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU 核心未运行代码、但由于进程在等待 IO 而 OS 内核也未在该 CPU 上运行任何其他进程的时间占比。此为系统范围的指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值通过对各核心求和计算，范围为 [0..核心数量]。

### OSIOWaitTimeNormalized {#osiowaittimenormalized}

该值类似于 `OSIOWaitTime`，但会除以 CPU 核心数，从而将该指标归一化到 [0..1] 区间内，与核心数量无关。这样，即使集群中各服务器的 CPU 核心数不一致，你仍然可以在多台服务器之间对该指标进行平均，并得到可比的平均资源利用率指标。如果指定了 Cgroup CPU 配额，则可以使用其与周期的比值来代替实际 CPU 核心数，在这种情况下，该指标的值在某些时刻可能会超过 1。

### OSIdleTime {#osidletime}

从操作系统内核视角来看，CPU 核心处于空闲状态（甚至还未准备好去运行等待 I/O 的进程）的时间占比。此为系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。它不包括由于 CPU 内部原因（如内存加载、流水线停顿、分支预测失败、运行另一个 SMT 逻辑核心）导致 CPU 未被充分利用的时间。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值为各核心值的总和，范围为 [0..num cores]。

### OSIdleTimeCPU_*N* {#osidletimecpu_n}

从操作系统内核的角度来看，CPU 核心处于空闲状态（甚至还未准备好运行等待 IO 的进程）的时间比率。该指标是系统范围的，包含宿主机上的所有进程，而不仅仅是 clickhouse-server。它不包括由于 CPU 内部原因（如内存访问/加载、流水线停顿、分支预测失败、运行另一个 SMT 逻辑核心）导致 CPU 未被充分利用的时间。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的总体取值是对各核心数值求和，范围为 [0..num cores]。

### OSIdleTimeNormalized {#osidletimenormalized}

该值与 `OSIdleTime` 类似，但会再除以 CPU 核心数量，使其无论核心数量多少，始终归一化到 [0..1] 区间。这样即使集群中各服务器的核心数不一致，也可以对该指标在多台服务器之间进行平均，从而仍然获得整体的平均资源利用率指标。如果进行了相应设置，可以使用将 Cgroup CPU QUOTA 除以其周期得到的值来代替实际的 CPU 核心数，此时该指标的数值在某些时刻可能会超过 1。

### OSInterrupts {#osinterrupts}

主机上的中断次数。此为系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSIrqTime {#osirqtime}

在 CPU 上处理硬件中断请求所花费时间的比例。该指标是系统级的，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标值较高可能表示硬件配置错误或网络负载过高。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值通过对各核心求和计算得到，范围为 [0..num cores]。

### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

在 CPU 上执行硬件中断请求所花费时间的占比。该指标是系统级的，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标值偏高可能表示硬件配置错误或异常高的网络负载。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值为各核心值的总和，范围为 [0..CPU 核心数量]。

### OSIrqTimeNormalized {#osirqtimenormalized}

该数值与 `OSIrqTime` 类似，但会除以 CPU 核心数，使其在 [0..1] 区间内进行度量，而不受核心数量影响。这样，即使集群中各服务器的核心数量不一致，也可以对该指标在多台服务器之间进行平均，仍然能够得到平均资源利用率指标。如果进行了相应配置，则可以使用 Cgroup CPU QUOTA 与其周期的比值来代替实际 CPU 核心数，此时该指标在某些时刻的取值可能会超过 1。

### OSMemoryAvailable {#osmemoryavailable}

可供程序使用的内存大小（以字节为单位）。这与 `OSMemoryFreePlusCached` 指标非常相似。该指标是系统级指标，涵盖宿主机上的所有进程，而不仅仅是 clickhouse-server。

### OSMemoryBuffers {#osmemorybuffers}

OS 内核缓冲区使用的内存量（以字节为单位）。该值通常应较小，数值过大可能表明操作系统配置不当。这是一个系统级指标，包括主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryCached {#osmemorycached}

操作系统页面缓存使用的内存量（以字节为单位）。通常情况下，几乎所有可用内存都会被操作系统页面缓存占用——该指标数值较高是正常且预期的。这是一个系统级指标，包含主机上所有进程的内存使用情况，而不仅仅是 clickhouse-server。

### OSMemoryFreePlusCached {#osmemoryfreepluscached}

主机系统中空闲内存与操作系统页缓存内存之和，以字节为单位。此内存可供程序使用。其值应与 `OSMemoryAvailable` 非常接近。该指标是系统级的，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

主机系统上的空闲内存量，以字节为单位。不包括操作系统页缓存占用的内存，同样以字节为单位。由于页缓存同样可以被程序使用，因此该指标的值可能会令人困惑。请参阅 `OSMemoryAvailable` 指标。为方便起见，我们还提供了 `OSMemoryFreePlusCached` 指标，其值应与 OSMemoryAvailable 大致相似。另见 https://www.linuxatemyram.com/。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。

### OSMemoryTotal {#osmemorytotal}

主机系统上的内存总量（以字节为单位）。

### OSNiceTime {#osnicetime}

CPU 内核在以更高优先级运行用户态代码时所占用时间的比例。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。单个 CPU 内核的取值范围为 [0..1]。所有 CPU 内核的取值通过对各内核求和计算，范围为 [0..num cores]。

### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU 核心以较高优先级运行用户空间代码的时间占比。这是一个系统范围的指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的值位于区间 [0..1]。所有 CPU 核心的值是对各核心数值求和计算得到，范围为 [0..num cores]。

### OSNiceTimeNormalized {#osnicetimenormalized}

该值类似于 `OSNiceTime`，但会除以 CPU 核心数，从而在与核心数量无关的情况下，将结果归一化到 [0..1] 区间。这样，即使集群中各服务器的核心数量不一致，也可以在多台服务器之间对该指标取平均值，仍然能够得到平均资源利用率指标。如果进行了相应配置，则可以使用 Cgroup CPU QUOTA 与其周期的比值来代替实际的 CPU 核心数，在这种情况下，该指标的值在某些时刻可能会超过 1。

### OSOpenFiles {#osopenfiles}

主机上已打开文件的总数。这个是系统级指标，包含主机上所有进程打开的文件，而不仅仅是 clickhouse-server。

### OSProcessesBlocked {#osprocessesblocked}

等待 I/O 完成而被阻塞的线程数量（`man procfs`）。这是一个针对整个系统的指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。

### OSProcessesCreated {#osprocessescreated}

创建的进程数量。这是一个系统级指标，包含宿主机上的所有进程，而不仅仅是 clickhouse-server 的进程。

### OSProcessesRunning {#osprocessesrunning}

操作系统层面可运行（正在运行或已准备好运行）的线程数量。这是一个系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server 进程。

### OSSoftIrqTime {#ossoftirqtime}

在 CPU 上处理软件中断请求所花费时间的比例。这是一个系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。该指标数值较高可能表示系统上运行的软件效率低下。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值为各核心数值之和，总体范围为 [0..num cores]。

### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

在 CPU 上处理软件中断请求所花费时间的比例。此为系统级指标，包含主机上的所有进程，而不仅仅是 clickhouse-server。该指标数值较高可能表示系统上运行的软件效率较低。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对各核心数值求和得到，范围为 [0..num cores]。

### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

该值与 `OSSoftIrqTime` 类似，但会除以 CPU 核心数量，将结果归一化到与核心数无关的 [0..1] 区间。这样，即使集群中各服务器的核心数不一致，也可以在多台服务器之间对该指标进行平均，并且仍然能够获得资源利用率的平均值。如果进行了相应设置，则可以使用 Cgroup CPU QUOTA 与其周期的比值来替代实际的 CPU 核心数量，在这种情况下，该指标的值在某些时刻可能会超过 1。

### OSStealTime {#osstealtime}

在虚拟化环境中运行时，CPU 花费在其他操作系统上的时间比例。此为系统范围的指标，包含宿主机上的所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都会暴露该指标，而且大多数都不会。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的取值通过对各核心求和计算得到，区间为 [0..num cores]。

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

在虚拟化环境中运行时，CPU 花费在其他操作系统上的时间占比。该指标为系统级指标，包含主机上所有进程，而不仅仅是 clickhouse-server。并非所有虚拟化环境都会提供该指标，而且大多数都不会。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值通过对各核心求和计算，范围为 [0..num cores]。

### OSStealTimeNormalized {#osstealtimenormalized}

该值与 `OSStealTime` 类似，但会除以 CPU 核心数，从而在不考虑核心数量的情况下将指标归一化到 [0..1] 区间。这样，即使集群中各服务器的核心数不一致，也可以在多台服务器上对该指标求平均，从而得到平均资源利用率指标。如果指定的话，可以使用 Cgroup CPU QUOTA 与其周期的比值来代替实际的 CPU 核心数，在这种情况下，该指标的值在某些时刻可能会超过 1。

### OSSystemTime {#ossystemtime}

CPU 核心用于运行操作系统内核（system）代码的时间占比。这是一个系统级指标，包含主机上所有进程的用量，而不仅仅是 clickhouse-server。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的取值通过对各核心数值求和得到，范围为 [0..num cores]。

### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU 在运行操作系统内核（system）代码上所花费时间的比例。该指标是系统范围的，包含宿主机上的所有进程，而不仅仅是 clickhouse-server。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值通过对各核心求和计算，其范围为 [0..num cores]。

### OSSystemTimeNormalized {#ossystemtimenormalized}

该值与 `OSSystemTime` 类似，但会除以 CPU 核心数，从而在与核心数无关的前提下，将其标准化到 [0..1] 区间。这样，即使集群中各服务器的核心数不一致，也可以在多台服务器之间对该指标进行平均，仍然得到平均资源利用率指标。如果进行了相应配置，还可以使用 Cgroup CPU QUOTA 与其 period 的比值来代替实际的 CPU 核心数，此时该指标在某些时刻的数值可能会超过 1。

### OSThreadsRunnable {#osthreadsrunnable}

从操作系统内核调度器视角统计的“可运行”线程总数。

### OSThreadsTotal {#osthreadstotal}

线程总数，即在操作系统内核调度器视角下看到的线程数量。

### OSUptime {#osuptime}

主机服务器（运行 ClickHouse 的机器）的已运行时长，以秒为单位。

### OSUserTime {#osusertime}

CPU 核心运行用户态代码的时间比例。该指标是系统级的，包含主机上所有进程的时间，而不仅仅是 clickhouse-server。它还包括由于 CPU 内部原因导致 CPU 未被充分利用的时间（例如内存加载、流水线停顿、分支预测失败、运行另一条 SMT 线程/核心）。单个 CPU 核心的取值范围为 [0..1]。所有 CPU 核心的值为各核心值之和，范围为 [0..num cores]。

### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU 核心运行用户态代码时间的占比。该指标是系统级的，包含主机上所有进程，而不仅仅是 clickhouse-server。这也包括由于 CPU 内部原因导致 CPU 未被充分利用的时间（例如内存加载、流水线停顿、分支预测失败、在同一物理核上的另一 SMT 逻辑核心运行）。单个 CPU 核心的取值区间为 [0..1]。所有 CPU 核心的值通过对各核心求和计算，区间为 [0..num cores]。

### OSUserTimeNormalized {#osusertimenormalized}

该值与 `OSUserTime` 类似，但会除以 CPU 核心数，从而在不考虑核心数量的情况下，将结果归一化到 [0..1] 区间。这使你能够在集群中跨多台服务器对该指标进行平均，即使各服务器的核心数量不一致，仍然可以得到平均资源利用率指标。如果进行了相应配置，则可以使用 Cgroup CPU QUOTA 与其周期的比值来替代实际的 CPU 核心数，在这种情况下，该指标在某些时刻可能会超过 1。

### PostgreSQLThreads {#postgresqlthreads}

使用 PostgreSQL 兼容协议的服务器中的线程数。

### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

在所有 Replicated 表中，最新已复制的数据部分与仍待复制的最新数据部分之间的最大时间差（以秒为单位）。非常大的数值通常表示某个副本没有数据。

### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

所有 Replicated 表的队列中尚未复制的 INSERT 操作的最大数量。

### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

在所有 Replicated 表中，队列中（尚未执行）的合并操作的最大允许数量。

### ReplicasMaxQueueSize {#replicasmaxqueuesize}

所有 Replicated 表的最大队列长度（按 get、merge 等操作数量计算）。

### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

在所有 Replicated 表中，对于同一张表，各副本延迟与该表最新副本延迟之间允许的最大差值。

### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

所有 Replicated 表中队列里尚未复制的 INSERT 操作总数。

### ReplicasSumMergesInQueue {#replicassummergesinqueue}

所有 Replicated 表上队列中（尚未执行）的合并操作数量总和。

### ReplicasSumQueueSize {#replicassumqueuesize}

跨所有 Replicated 表的队列大小总和（按操作数计，例如 get、merge）。

### TCPThreads {#tcpthreads}

TCP 协议服务器的线程数（不使用 TLS）。

### Temperature_*N* {#temperature_n}

对应设备的温度（℃）。传感器可能会返回不合理的数值。来源：`/sys/class/thermal`

### Temperature_*name* {#temperature_name}

由对应的硬件监控设备及其传感器报告的温度（单位：℃）。传感器有时可能返回不合理的数值。来源：`/sys/class/hwmon`

### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

所有 MergeTree 系列表中存储的总字节数（压缩后，包括数据和索引）。

### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

所有 MergeTree 系列表中数据分区片段的总数。当该数值大于 10 000 时，会对服务器启动时间产生不利影响，也可能表明分区键的选择不合理。

### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

主键值在内存中占用的总字节数（仅考虑活跃分区片段）。

### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

为主键值预留的内存总量（字节数）（仅计算活跃分区片段）。

### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

存储在所有 MergeTree 系列表中的总行数（记录数）。

### Uptime {#uptime}

以秒为单位的服务器运行时长。它也包括服务器在开始接受连接之前用于初始化的时间。

### ZooKeeperClientLastZXIDSeen {#zookeeperclientlastzxidseen}

当前 ZooKeeper 客户端会话看到的最后一个 ZXID。该值会随着客户端从 ZooKeeper 观测到事务而单调递增。

### jemalloc.active {#jemallocactive}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.allocated {#jemallocallocated}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

底层内存分配器（jemalloc）的内部指标。详见 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

底层内存分配器（jemalloc）的内部指标。请参阅 https://jemalloc.net/jemalloc.3.html

### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

低层内存分配器（jemalloc）的内部度量指标。详见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

底层内存分配器（jemalloc）的内部指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.epoch {#jemallocepoch}

jemalloc（Jason Evans 的内存分配器）统计信息的内部增量更新序号，在所有其他 `jemalloc` 指标中都会使用。

### jemalloc.mapped {#jemallocmapped}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata {#jemallocmetadata}

底层内存分配器（jemalloc）的内部度量指标。请参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.metadata_thp {#jemallocmetadata_thp}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.resident {#jemallocresident}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.retained {#jemallocretained}

底层内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

### jemalloc.prof.active {#jemallocprofactive}

低级内存分配器（jemalloc）的内部度量指标。参见 https://jemalloc.net/jemalloc.3.html

**另请参阅**

- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算得出的指标。
- [system.events](/operations/system-tables/events) — 包含已发生事件的数量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。