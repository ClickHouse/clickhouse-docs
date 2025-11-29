---
description: '介绍开源版 ClickHouse 使用建议的页面'
sidebar_label: 'OSS 使用建议'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 使用建议'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## CPU 频率调节策略 {#cpu-scaling-governor}

应始终使用 `performance` 频率调节策略。`on-demand` 频率调节策略在持续高负载场景下的效果要差得多。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## CPU 限制 {#cpu-limitations}

处理器可能会过热。使用 `dmesg` 查看 CPU 的频率是否因过热而被限制。
该限制也可能由数据中心层面的外部策略设置。可以在负载下使用 `turbostat` 对其进行监控。

## RAM {#ram}

对于较小的数据量（压缩后最多约 200 GB），最好使用与数据量大致相当的内存。
对于较大的数据量并且需要处理交互式（在线）查询时，应使用合理数量的 RAM（128 GB 或更多），以便热点数据子集能够装入页缓存中。
即使在每台服务器数据量约为 50 TB 的情况下，使用 128 GB RAM 也能相比 64 GB 明显提升查询性能。

不要禁用 overcommit。`cat /proc/sys/vm/overcommit_memory` 的值应为 0 或 1。运行

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

使用 `perf top` 观察内核在内存管理上的耗时。
永久性 huge pages 也无需分配。


### 使用少于 16GB 内存时 {#using-less-than-16gb-of-ram}

推荐的内存大小为 32 GB 及以上。

如果系统的内存少于 16 GB，由于默认设置与该内存容量不匹配，可能会遇到各种内存异常。可以在内存较小的系统（最低到 2 GB）上使用 ClickHouse，但这些部署需要额外调优，并且只能以较低速率进行数据摄取。

在使用少于 16GB 内存运行 ClickHouse 时，建议执行以下操作：

- 在 `config.xml` 中减小 mark cache 的大小。它可以设置得低至 500 MB，但不能设置为零。
- 将查询处理线程数降低到 `1`。
- 将 `max_block_size` 降低到 `8192`。即使低至 `1024` 的值在实践中也仍然可用。
- 将 `max_download_threads` 降低到 `1`。
- 将 `input_format_parallel_parsing` 和 `output_format_parallel_formatting` 设置为 `0`。
- 禁用向 log 表写入数据，因为这会使后台合并任务为合并这些 log 表预留 RAM。禁用 `asynchronous_metric_log`、`metric_log`、`text_log`、`trace_log`。

附加说明：

- 为了释放由内存分配器缓存的内存，可以运行 `SYSTEM JEMALLOC PURGE` 命令。
- 不建议在内存较小的机器上使用 S3 或 Kafka 集成，因为它们的缓冲区需要占用大量内存。

## 存储子系统 {#storage-subsystem}

如果预算允许，尽量使用 SSD。
如果不允许，就使用 HDD。使用转速为 7200 RPM 的 SATA HDD 即可。

优先选择数量较多且带本地硬盘的服务器，而不是数量较少但连接外置磁盘柜的服务器。
但对于仅偶尔被查询的归档数据，使用磁盘柜也是可行的。

## RAID {#raid}

在使用 HDD 时，可以将其组合为 RAID-10、RAID-5、RAID-6 或 RAID-50。
在 Linux 上，推荐使用软件 RAID（通过 `mdadm` 实现）。
在创建 RAID-10 时，选择 `far` 布局。
如果预算允许，优先选择 RAID-10。

单独使用 LVM（不配合 RAID 或 `mdadm`）是可以的，但用它做 RAID 或将其与 `mdadm` 组合使用是相对比较少见的方案，更容易出错
（chunk 大小选择不当；chunk 未对齐；RAID 类型选择错误；忘记清理磁盘）。如果你对使用 LVM 很有把握，可以放心使用。

如果有超过 4 块磁盘，请使用 RAID-6（推荐）或 RAID-50，而不是 RAID-5。
在使用 RAID-5、RAID-6 或 RAID-50 时，一定要增大 stripe&#95;cache&#95;size 参数，因为默认值通常并非最佳选择。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

根据设备数量和块大小精确计算该数值，使用公式：`2 * num_devices * chunk_size_in_bytes / 4096`。

对于大多数 RAID 配置，64 KB 的块大小已经足够。clickhouse-server 的平均写入大小大约为 1 MB（1024 KB），因此推荐的条带大小也是 1 MB。如果需要进一步优化块大小，可将其设置为 1 MB 除以 RAID 阵列中非校验盘的数量，这样每次写入都可以在所有可用的非校验盘之间并行化。
避免将块大小设置得过小或过大。

可以在 SSD 上使用 RAID-0。
无论是否使用 RAID，都务必启用复制（replication）以保证数据安全。

启用带有较长队列的 NCQ。对于 HDD，选择 mq-deadline 或 CFQ 调度器；对于 SSD，选择 noop。不要降低 `readahead` 设置。
对于 HDD，启用写缓存。

确保在操作系统中为 NVMe 和 SSD 磁盘启用了 [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\))（通常通过 cron 作业或 systemd 服务实现）。


## 文件系统 {#file-system}

Ext4 是最可靠的选择。将挂载选项设置为 `noatime`。XFS 的表现也很好。
大多数其他文件系统通常也可以正常工作。

由于不支持硬链接，FAT-32 和 exFAT 不受支持。

不要使用压缩文件系统，因为 ClickHouse 自身已经进行了效果更好的压缩。
不推荐使用加密文件系统，因为可以使用 ClickHouse 内置的加密功能，其效果更好。

虽然 ClickHouse 可以通过 NFS 工作，但这并不是最理想的选择。

## Linux 内核 {#linux-kernel}

请勿使用已过时的 Linux 内核。

## 网络 {#network}

如果使用 IPv6，请增大路由缓存的大小。
3.2 之前版本的 Linux 内核在 IPv6 实现方面存在诸多问题。

如果可能，请至少使用 10 Gb 的网络。1 Gb 也能用，但在为包含数十 TB 数据的副本进行补丁更新，或处理具有大量中间数据的分布式查询时，效果会差得多。

## Huge Pages {#huge-pages}

如果你使用的是较旧的 Linux 内核，应禁用 Transparent Huge Pages（透明大页）。它会干扰内存分配器，从而导致明显的性能下降。
在较新的 Linux 内核中，Transparent Huge Pages 可以正常使用。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

如果您想永久修改 transparent huge pages（透明大页）设置，请编辑 `/etc/default/grub`，在 `GRUB_CMDLINE_LINUX_DEFAULT` 选项中添加 `transparent_hugepage=madvise`：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

之后运行 `sudo update-grub` 命令，然后重启系统以使其生效。


## 虚拟机管理程序配置 {#hypervisor-configuration}

如果您使用 OpenStack，请设置

```ini
cpu_mode=host-passthrough
```

在 `nova.conf` 中。

如果使用 libvirt，请设置

```xml
<cpu mode='host-passthrough'/>
```

在 XML 配置中进行设置。

这对于 ClickHouse 能够通过 `cpuid` 指令获取正确信息非常重要。
否则，如果在较旧的 CPU 型号上运行虚拟机管理程序，可能会触发 `Illegal instruction` 崩溃。


## ClickHouse Keeper 和 ZooKeeper {#zookeeper}

推荐在 ClickHouse 集群中使用 ClickHouse Keeper 替代 ZooKeeper。请参阅 [ClickHouse Keeper](../guides/sre/keeper/index.md) 文档。

如果希望继续使用 ZooKeeper，最好使用较新的 ZooKeeper 版本——3.4.9 或更高版本。稳定版 Linux 发行版中自带的版本可能已经过时。

绝不要使用手动编写的脚本在不同的 ZooKeeper 集群之间传输数据，因为对于顺序节点而言，结果将是不正确的。出于同样的原因，也绝不要使用 `zkcopy` 工具：[https://github.com/ksprojects/zkcopy/issues/15](https://github.com/ksprojects/zkcopy/issues/15)

如果要把一个现有的 ZooKeeper 集群拆分为两个，正确的方法是先增加其副本数量，然后再将其重新配置为两个彼此独立的集群。

在测试环境或摄取速率较低的环境中，可以在与 ClickHouse 相同的服务器上运行 ClickHouse Keeper。
对于生产环境，我们建议为 ClickHouse 和 ZooKeeper/Keeper 使用单独的服务器，或者将 ClickHouse 文件和 Keeper 文件放在不同的磁盘上。原因是 ZooKeeper/Keeper 对磁盘延迟非常敏感，而 ClickHouse 可能会占用所有可用的系统资源。

可以在 ZooKeeper 集群中配置 observer 节点，但 ClickHouse 服务器不应与 observer 交互。

不要修改 `minSessionTimeout` 设置，过大的值可能会影响 ClickHouse 重启时的稳定性。

在默认设置下，ZooKeeper 就像一个定时炸弹：

> 在使用默认配置时（参见 `autopurge`），ZooKeeper 服务器不会删除旧的快照和日志文件，这项工作由运维人员负责。

必须拆除这枚炸弹。

下面的 ZooKeeper（3.5.1）配置用于一个大型生产环境：

zoo.cfg:

```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html {#httphadoopapacheorgzookeeperdocscurrentzookeeperadminhtml}

# 每个 tick 的毫秒数 {#the-number-of-milliseconds-of-each-tick}
tickTime=2000
# 初始同步阶段可以占用的 tick 数量 {#the-number-of-ticks-that-the-initial}
# 此值没有明确的依据 {#synchronization-phase-can-take}
initLimit=300
# 发送请求和接收确认之间可以经过的 tick 数量 {#this-value-is-not-quite-motivated}
syncLimit=10

maxClientCnxns=2000

# 这是客户端可以请求且服务器将接受的最大值。 {#the-number-of-ticks-that-can-pass-between}
# 服务器上设置较高的 maxSessionTimeout 是可以的,以便允许客户端在需要时使用较高的会话超时。 {#sending-a-request-and-getting-an-acknowledgement}
# 但默认情况下我们请求 30 秒的会话超时(您可以在 ClickHouse 配置中使用 session_timeout_ms 更改它)。 {#it-is-the-maximum-value-that-client-may-request-and-the-server-will-accept}
maxSessionTimeout=60000000
# 存储快照的目录。 {#it-is-ok-to-have-high-maxsessiontimeout-on-server-to-allow-clients-to-work-with-high-session-timeout-if-they-want}
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data
# 将 dataLogDir 放置在单独的物理磁盘上以获得更好的性能 {#but-we-request-session-timeout-of-30-seconds-by-default-you-can-change-it-with-session_timeout_ms-in-clickhouse-config}
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# 为避免磁盘寻址,ZooKeeper 在事务日志文件中以 preAllocSize 千字节的块分配空间。 {#the-directory-where-the-snapshot-is-stored}
# 默认块大小为 64M。更改块大小的一个原因是在更频繁地创建快照时减小块大小。 {#place-the-datalogdir-to-a-separate-physical-disc-for-better-performance}
# (另请参阅 snapCount)。 {#to-avoid-seeks-zookeeper-allocates-space-in-the-transaction-log-file-in}
preAllocSize=131072

# 客户端提交请求的速度可能快于 ZooKeeper 处理它们的速度, {#blocks-of-preallocsize-kilobytes-the-default-block-size-is-64m-one-reason}
# 特别是在有大量客户端的情况下。为防止 ZooKeeper 因排队请求而耗尽内存, {#for-changing-the-size-of-the-blocks-is-to-reduce-the-block-size-if-snapshots}
# ZooKeeper 将限制客户端,使系统中未完成的请求不超过 globalOutstandingLimit。 {#are-taken-more-often-also-see-snapcount}
# 默认限制为 1000。 {#clients-can-submit-requests-faster-than-zookeeper-can-process-them}
# globalOutstandingLimit=1000 {#especially-if-there-are-a-lot-of-clients-to-prevent-zookeeper-from-running}

# ZooKeeper 将事务记录到事务日志中。在将 snapCount 个事务写入日志文件后, {#out-of-memory-due-to-queued-requests-zookeeper-will-throttle-clients-so-that}
# 将启动快照并启动新的事务日志文件。默认 snapCount 为 100000。 {#there-is-no-more-than-globaloutstandinglimit-outstanding-requests-in-the}
snapCount=3000000

# 如果定义了此选项,请求将被记录到名为 traceFile.year.month.day 的跟踪文件中。 {#system-the-default-limit-is-1000}
#traceFile=

# Leader 接受客户端连接。默认值为 "yes"。Leader 机器协调更新。 {#globaloutstandinglimit1000}
# 为了以略微牺牲读取吞吐量为代价获得更高的更新吞吐量, {#zookeeper-logs-transactions-to-a-transaction-log-after-snapcount-transactions}
# 可以将 leader 配置为不接受客户端并专注于协调。 {#are-written-to-a-log-file-a-snapshot-is-started-and-a-new-transaction-log-file}
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Java 版本：


```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVM 参数：


```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

# TODO 此处代码较为冗余 {#is-started-the-default-snapcount-is-100000}
# 如何确定所需的 jar 文件? {#if-this-option-is-defined-requests-will-be-will-logged-to-a-trace-file-named}
# log4j 似乎要求 log4j.properties 文件必须位于 classpath 中 {#tracefileyearmonthday}
CLASSPATH="$ZOOCFGDIR:/usr/build/classes:/usr/build/lib/*.jar:/usr/share/zookeeper-3.6.2/lib/audience-annotations-0.5.0.jar:/usr/share/zookeeper-3.6.2/lib/commons-cli-1.2.jar:/usr/share/zookeeper-3.6.2/lib/commons-lang-2.6.jar:/usr/share/zookeeper-3.6.2/lib/jackson-annotations-2.10.3.jar:/usr/share/zookeeper-3.6.2/lib/jackson-core-2.10.3.jar:/usr/share/zookeeper-3.6.2/lib/jackson-databind-2.10.3.jar:/usr/share/zookeeper-3.6.2/lib/javax.servlet-api-3.1.0.jar:/usr/share/zookeeper-3.6.2/lib/jetty-http-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-io-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-security-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-server-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-servlet-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-util-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jline-2.14.6.jar:/usr/share/zookeeper-3.6.2/lib/json-simple-1.1.1.jar:/usr/share/zookeeper-3.6.2/lib/log4j-1.2.17.jar:/usr/share/zookeeper-3.6.2/lib/metrics-core-3.2.5.jar:/usr/share/zookeeper-3.6.2/lib/netty-buffer-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-codec-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-common-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-handler-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-resolver-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-transport-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-transport-native-epoll-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-transport-native-unix-common-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient_common-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient_hotspot-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient_servlet-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/slf4j-api-1.7.25.jar:/usr/share/zookeeper-3.6.2/lib/slf4j-log4j12-1.7.25.jar:/usr/share/zookeeper-3.6.2/lib/snappy-java-1.1.7.jar:/usr/share/zookeeper-3.6.2/lib/zookeeper-3.6.2.jar:/usr/share/zookeeper-3.6.2/lib/zookeeper-jute-3.6.2.jar:/usr/share/zookeeper-3.6.2/lib/zookeeper-prometheus-metrics-3.6.2.jar:/usr/share/zookeeper-3.6.2/etc"

ZOOCFG="$ZOOCFGDIR/zoo.cfg"
ZOO_LOG_DIR=/var/log/$NAME
USER=zookeeper
GROUP=zookeeper
PIDDIR=/var/run/$NAME
PIDFILE=$PIDDIR/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME
JAVA=/usr/local/jdk-11/bin/java
ZOOMAIN="org.apache.zookeeper.server.quorum.QuorumPeerMain"
ZOO_LOG4J_PROP="INFO,ROLLINGFILE"
JMXLOCALONLY=false
JAVA_OPTS="-Xms{{ '{{' }} cluster.get('xms','128M') {{ '}}' }} \
    -Xmx{{ '{{' }} cluster.get('xmx','1G') {{ '}}' }} \
    -Xlog:safepoint,gc*=info,age*=debug:file=/var/log/$NAME/zookeeper-gc.log:time,level,tags:filecount=16,filesize=16M
    -verbose:gc \
    -XX:+UseG1GC \
    -Djute.maxbuffer=8388608 \
    -XX:MaxGCPauseMillis=50"
```

Salt 初始化：

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} 集中式协调服务"

start on runlevel [2345]
stop on runlevel [!2345]

respawn

limit nofile 8192 8192

pre-start script
    [ -r "/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/environment" ] || exit 0
    . /etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/environment
    [ -d $ZOO_LOG_DIR ] || mkdir -p $ZOO_LOG_DIR
    chown $USER:$GROUP $ZOO_LOG_DIR
end script

script
    . /etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/environment
    [ -r /etc/default/zookeeper ] && . /etc/default/zookeeper
    if [ -z "$JMXDISABLE" ]; then
        JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.local.only=$JMXLOCALONLY"
    fi
    exec start-stop-daemon --start -c $USER --exec $JAVA --name zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} \
        -- -cp $CLASSPATH $JAVA_OPTS -Dzookeeper.log.dir=${ZOO_LOG_DIR} \
        -Dzookeeper.root.logger=${ZOO_LOG4J_PROP} $ZOOMAIN $ZOOCFG
end script
```


## Antivirus software {#antivirus-software}

如果使用杀毒软件，请将其配置为忽略包含 ClickHouse 数据文件（`/var/lib/clickhouse`）的目录，否则可能会导致性能下降，并在数据摄取和后台合并任务过程中出现意外错误。

## 相关内容 {#related-content}

- [刚开始接触 ClickHouse？这里有 13 个“致命错误”以及如何避免它们](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)