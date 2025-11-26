---
description: '介绍开源版 ClickHouse 使用建议的页面'
sidebar_label: 'OSS 使用建议'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 使用建议'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## CPU 频率调节策略

始终使用 `performance` 频率调节策略。`on-demand` 频率调节策略在持续高负载场景下的效果要差得多。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## CPU 限制 {#cpu-limitations}

处理器可能会过热。使用 `dmesg` 查看 CPU 的频率是否因过热而被限制。
该限制也可以在数据中心层面外部进行设置。可以在有负载的情况下使用 `turbostat` 进行监控。



## RAM

对于较小的数据量（压缩后约不超过 200 GB），最好使用与数据量大致相当的内存容量。
对于较大数据量并且需要处理交互式（在线）查询的场景，应当使用合理数量的 RAM（128 GB 或更多），以便热点数据子集能够放入页缓存中。
即使在每台服务器约 50 TB 数据量的情况下，使用 128 GB RAM 也能相比 64 GB 显著提升查询性能。

不要禁用 overcommit。`cat /proc/sys/vm/overcommit_memory` 的值应为 0 或 1。运行

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

使用 `perf top` 来观察内核在内存管理上消耗的时间。
永久大页（huge pages）也不需要分配。

### 使用少于 16 GB 的内存

推荐的内存容量为 32 GB 或更多。

如果系统内存少于 16 GB，由于默认设置与该内存容量不匹配，你可能会遇到各种内存异常。你可以在内存较小（最低可到 2 GB）的系统上使用 ClickHouse，但这些部署需要额外调优，并且只能以较低速率进行数据摄取。

在少于 16 GB 内存的环境中使用 ClickHouse 时，我们建议：

* 在 `config.xml` 中减小 mark cache 的大小。它可以低至 500 MB，但不能设置为零。
* 将查询处理线程数降低到 `1`。
* 将 `max_block_size` 降低到 `8192`。低至 `1024` 的值在实践中仍然可用。
* 将 `max_download_threads` 降低到 `1`。
* 将 `input_format_parallel_parsing` 和 `output_format_parallel_formatting` 设置为 `0`。
* 禁用日志表写入，因为这会导致后台合并任务为合并日志表预留 RAM。禁用 `asynchronous_metric_log`、`metric_log`、`text_log`、`trace_log`。

附加说明：

* 若要清理由内存分配器缓存的内存，你可以运行 `SYSTEM JEMALLOC PURGE` 命令。
* 我们不建议在低内存机器上使用 S3 或 Kafka 集成，因为它们的缓冲区需要大量内存。


## 存储子系统 {#storage-subsystem}

如果预算允许使用 SSD，就使用 SSD。
如果不行，就使用 HDD。SATA 接口、7200 RPM 的 HDD 即可。

相较于少量配有外接磁盘柜的服务器，更推荐使用数量更多且带本地硬盘的服务器。
但对于仅偶尔会被查询的归档数据，磁盘柜也是可行的。



## RAID

在使用 HDD 时，可以将其组合为 RAID-10、RAID-5、RAID-6 或 RAID-50。
在 Linux 上，更推荐使用软件 RAID（通过 `mdadm` 实现）。
在创建 RAID-10 时，选择 `far` 布局。
如果预算允许，优先选择 RAID-10。

单独使用 LVM（不配合 RAID 或 `mdadm`）是可以的，但用它来构建 RAID 或与 `mdadm` 组合使用属于相对少见的做法，出错的可能性会更大
（例如选择了错误的 chunk 大小、chunk 未对齐、选择了错误的 RAID 类型、忘记清理磁盘等）。如果对使用 LVM 很有把握，那么采用它也没有问题。

如果有超过 4 块磁盘，请使用 RAID-6（推荐）或 RAID-50，而不是 RAID-5。
在使用 RAID-5、RAID-6 或 RAID-50 时，一定要增大 stripe&#95;cache&#95;size，因为默认值通常不是最佳选择。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

根据设备数量和块大小，使用以下公式精确计算：`2 * num_devices * chunk_size_in_bytes / 4096`。

对于大多数 RAID 配置，64 KB 的块大小就足够了。clickhouse-server 的平均写入大小大约为 1 MB（1024 KB），因此推荐的条带大小也是 1 MB。如需优化，可以将块大小设置为 1 MB 除以 RAID 阵列中非校验盘的数量，使每次写入都能在所有可用的非校验盘上并行完成。
切勿将块大小设置得过小或过大。

可以在 SSD 上使用 RAID-0。
无论是否使用 RAID，都应始终使用复制来保证数据安全。

启用具有较长队列深度的 NCQ。对于 HDD，选择 mq-deadline 或 CFQ 调度器；对于 SSD，选择 noop。不要降低 &#39;readahead&#39; 设置。
对于 HDD，启用写缓存。

确保在操作系统中为 NVMe 和 SSD 磁盘启用了 [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\))（通常通过 cron 任务或 systemd 服务实现）。


## 文件系统 {#file-system}

Ext4 是最可靠的选项。将挂载选项设置为 `noatime`。XFS 也同样适用。
大多数其他文件系统通常也可以正常工作。

由于不支持硬链接，FAT-32 和 exFAT 不受支持。

不要使用压缩文件系统，因为 ClickHouse 自身会进行压缩且效果更好。
不推荐使用加密文件系统，因为可以使用 ClickHouse 内置的加密功能，其效果更佳。

虽然 ClickHouse 可以运行在 NFS 之上，但这并不是最佳方案。



## Linux 内核 {#linux-kernel}

不要使用旧版的 Linux 内核。



## 网络 {#network}

如果使用 IPv6，请增大路由缓存大小。
3.2 之前版本的 Linux 内核在 IPv6 实现方面存在大量问题。

如果可能，请至少使用 10 Gb 网络。1 Gb 也可以，但在对包含数十 TB 数据的副本进行修复／重同步，或者处理具有大量中间数据的分布式查询时，效果会差很多。



## Huge Pages

如果你使用的是较旧版本的 Linux 内核，请禁用透明大页（Transparent Huge Pages，THP）。它会干扰内存分配器，从而导致显著的性能下降。
在较新的 Linux 内核上，透明大页则可以正常使用。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

如果你想永久修改透明大页（transparent huge pages）设置，可以通过编辑 `/etc/default/grub`，在 `GRUB_CMDLINE_LINUX_DEFAULT` 选项中添加 `transparent_hugepage=madvise`：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

之后，运行 `sudo update-grub` 命令，然后重启使更改生效。


## 虚拟机管理程序配置

如果您使用的是 OpenStack，请设置

```ini
cpu_mode=host-passthrough
```

在 `nova.conf` 中。

如果使用 libvirt，请设置

```xml
<cpu mode='host-passthrough'/>
```

在 XML 配置中。

这对于 ClickHouse 通过 `cpuid` 指令获取正确信息非常重要。
否则，当 hypervisor 运行在较老型号的 CPU 上时，可能会遇到 `Illegal instruction` 崩溃。


## ClickHouse Keeper 和 ZooKeeper {#zookeeper}

推荐在 ClickHouse 集群中使用 ClickHouse Keeper 替代 ZooKeeper。请参阅 [ClickHouse Keeper](../guides/sre/keeper/index.md) 文档。

如果你希望继续使用 ZooKeeper，最好使用较新的 ZooKeeper 版本——3.4.9 或更高版本。稳定版 Linux 发行版中自带的版本可能已经过时。

绝对不要使用手动编写的脚本在不同的 ZooKeeper 集群之间传输数据，因为对于顺序节点来说，结果将是不正确的。出于同样的原因，也绝不要使用 "zkcopy" 工具：https://github.com/ksprojects/zkcopy/issues/15

如果你想把一个现有的 ZooKeeper 集群拆分成两个，正确的方法是先增加副本数，然后将其重新配置为两个独立的集群。

在测试环境或摄取速率较低的环境中，你可以在与 ClickHouse 相同的服务器上运行 ClickHouse Keeper。
对于生产环境，我们建议为 ClickHouse 和 ZooKeeper/Keeper 使用独立的服务器，或者将 ClickHouse 文件和 Keeper 文件放在不同的磁盘上。因为 ZooKeeper/Keeper 对磁盘延迟非常敏感，而 ClickHouse 可能会占用所有可用的系统资源。

你可以在 ZooKeeper 集群中配置观察者节点（observer），但 ClickHouse 服务器不应与观察者节点交互。

不要更改 `minSessionTimeout` 设置，过大的值可能会影响 ClickHouse 重启的稳定性。

在默认设置下，ZooKeeper 是一颗定时炸弹：

> 在默认配置下（参见 `autopurge`），ZooKeeper 服务器不会自动删除旧快照和日志文件，这一工作需要由运维人员负责。

这颗炸弹必须被拆除。

下面的 ZooKeeper（3.5.1）配置已用于一个大型生产环境：

zoo.cfg:



```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
```


# The number of milliseconds of each tick
# 每个 tick 对应的毫秒数
tickTime=2000
# The number of ticks that the initial
# synchronization phase can take
# This value is not quite motivated
# 初始同步阶段允许花费的 tick 数量
# 该值并没有特别明确的设定依据
initLimit=300
# The number of ticks that can pass between
# sending a request and getting an acknowledgement
# 从发送请求到收到确认之间
# 所允许经过的最大 tick 数量
syncLimit=10

# maxClientCnxns=2000
maxClientCnxns=2000



# 这是客户端可请求且服务器将接受的最大值。

# 服务器上设置较高的 maxSessionTimeout 是允许的,以便客户端在需要时可以使用较高的会话超时。

# 但默认情况下我们请求 30 秒的会话超时(您可以在 ClickHouse 配置中通过 session_timeout_ms 更改此值)。

maxSessionTimeout=60000000

# 存储快照的目录。

dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# 将 dataLogDir 放置在单独的物理磁盘上以获得更好的性能

dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# To avoid seeks
# ZooKeeper allocates space in the transaction log file in
# blocks of preAllocSize kilobytes. The default block size is 64M. One reason
# for changing the size of the blocks is to reduce the block size if snapshots
# are taken more often. (Also, see snapCount).
# 为了避免寻道，ZooKeeper 会按 preAllocSize KB 为单位成块预分配事务日志文件空间。默认块大小为 64M。更改块大小的一个原因是在更频繁地创建快照时减小块大小（另请参见 snapCount）。
preAllocSize=131072



# Clients can submit requests faster than ZooKeeper can process them,
# especially if there are a lot of clients. To prevent ZooKeeper from running
# out of memory due to queued requests, ZooKeeper will throttle clients so that
# there is no more than globalOutstandingLimit outstanding requests in the
# system. The default limit is 1000.
# globalOutstandingLimit=1000



# ZooKeeper logs transactions to a transaction log.
# After snapCount transactions are written to a log file a snapshot is started
# and a new transaction log file is started. The default snapCount is 100000.
snapCount=3000000



# 如果定义了该选项，请求将被记录到名为
# traceFile.year.month.day 的跟踪文件中。
#traceFile=



# Leader 接受客户端连接。默认值为 "yes"。Leader 机器

# 负责协调更新。为了提高更新吞吐量,可以将 leader 配置为不接受客户端连接,

# 专注于协调工作,代价是读取吞吐量会略有下降。

leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic

````

Java 版本:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
````

JVM 参数:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

```


# TODO 这也太丑了
# 如何确定需要哪些 JAR 包？
# 看起来 log4j 要求 `log4j.properties` 文件必须在 classpath 中
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

````

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
````


## 防病毒软件 {#antivirus-software}

如果您使用防病毒软件，应将其配置为排除包含 ClickHouse 数据文件的目录（`/var/lib/clickhouse`），否则可能会降低性能，并在数据摄取和后台合并过程中遇到意外错误。



## 相关内容 {#related-content}

- [刚开始使用 ClickHouse？这里有 13 个“使用大忌”以及如何避免它们](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
