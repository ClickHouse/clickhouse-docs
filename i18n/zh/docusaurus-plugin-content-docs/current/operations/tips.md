---
'description': 'Documentation for http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html'
'sidebar_label': '使用建议'
'sidebar_position': 58
'slug': '/operations/tips'
'title': 'Usage Recommendations'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU Scaling Governor {#cpu-scaling-governor}

始终使用 `performance` 缩放治理器。`on-demand` 缩放治理器在高需求持续存在的情况下效果更差。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU Limitations {#cpu-limitations}

处理器可能会过热。使用 `dmesg` 查看 CPU 的时钟频率是否因过热而受到限制。
该限制也可以在数据中心级别外部设置。您可以使用 `turbostat` 在负载下监控它。

## RAM {#ram}

对于小数据量（压缩后约 200 GB），最好使用与数据量相当的内存。
对于大数据量并处理交互式（在线）查询时，您应该使用合理的 RAM（128 GB 或更多），以便热门数据子集能够适应页面缓存。
即使对于每台服务器约 50 TB 的数据量，使用 128 GB 的 RAM 相比 64 GB 的 RAM 显著提高查询性能。

不要禁用超分配。 `cat /proc/sys/vm/overcommit_memory` 的值应为 0 或 1。运行

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

使用 `perf top` 监视内核在内存管理上花费的时间。
永久大页也不需要分配。

### Using less than 16GB of RAM {#using-less-than-16gb-of-ram}

推荐的 RAM 数量是 32 GB 或更多。

如果您的系统有低于 16 GB 的 RAM，您可能会遇到各种内存异常，因为默认设置与该内存量不匹配。您可以在小内存（低至 2 GB）的系统中使用 ClickHouse，但这些设置需要额外调整，并且只能以低速率摄入。

在使用 ClickHouse 时，如果 RAM 少于 16GB，建议如下：

- 在 `config.xml` 中降低标记缓存的大小。可以设置为低至 500 MB，但不能设置为零。
- 将查询处理线程数减少到 `1`。
- 将 `max_block_size` 降低到 `8192`。值低至 `1024` 仍然可行。
- 将 `max_download_threads` 降低到 `1`。
- 将 `input_format_parallel_parsing` 和 `output_format_parallel_formatting` 设置为 `0`。

额外说明：
- 若要刷新内存分配器缓存的内存，您可以运行 `SYSTEM JEMALLOC PURGE` 命令。
- 我们不建议在低内存机器上使用 S3 或 Kafka 集成，因为它们需要为缓冲区分配大量内存。

## Storage Subsystem {#storage-subsystem}

如果您的预算允许使用 SSD，请使用 SSD。
如果不行，则使用 HDD。7200 RPM 的 SATA HDD 也可以。

优先选择具有本地硬盘的多台服务器，而不是少量附加磁盘架的服务器。
但对于存储有稀少查询的归档，磁盘架也可以工作。

## RAID {#raid}

使用 HDD 时，可以将它们组合为 RAID-10、RAID-5、RAID-6 或 RAID-50。
对于 Linux，软件 RAID 更好（使用 `mdadm`）。
创建 RAID-10 时，请选择 `far` 布局。
如果您的预算允许，选择 RAID-10。

LVM 本身（不使用 RAID 或 `mdadm`）是可以的，但与它做 RAID 或将其与 `mdadm` 结合使用是一个较少探索的选项，并且可能更容易出错（选择错误的块大小；块对齐错误；选择错误的 RAID 类型；忘记清理磁盘）。如果您对使用 LVM 有信心，则没有理由不使用它。

如果您有 4 个以上的磁盘，请使用 RAID-6（优选）或 RAID-50，而不是 RAID-5。
使用 RAID-5、RAID-6 或 RAID-50 时，总是增加 stripe_cache_size，因为默认值通常不是最佳选择。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

根据设备数量和块大小计算确切的值，使用公式：`2 * num_devices * chunk_size_in_bytes / 4096`。

对于大多数 RAID 配置，64 KB 的块大小足够。平均的 clickhouse-server 写入大小约为 1 MB（1024 KB），因此推荐的条带大小也是 1 MB。块大小可以在必要时优化，设置为 1 MB 除以 RAID 阵列中非奇偶磁盘的数量，从而使每次写入能够在所有可用的非奇偶磁盘上并行化。
永远不要将块大小设置得太小或太大。

您可以在 SSD 上使用 RAID-0。
无论使用什么 RAID，始终使用复制以确保数据安全。

启用具有长队列的 NCQ。对于 HDD，选择 mq-deadline 或 CFQ 调度程序，对于 SSD，选择 noop。不要减少 `readahead` 设置。
对于 HDD，启用写入缓存。

确保在您的操作系统中为 NVME 和 SSD 磁盘启用 [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing))（通常是通过 cronjob 或 systemd 服务实现）。

## File System {#file-system}

Ext4 是最可靠的选择。设置挂载选项为 `noatime`。XFS 也工作良好。
大多数其他文件系统也应该正常工作。

由于缺乏硬链接，FAT-32 和 exFAT 不受支持。

不要使用压缩文件系统，因为 ClickHouse 自行进行压缩，并且效果更好。
不建议使用加密文件系统，因为您可以在 ClickHouse 中使用内置加密功能，这是更好的选择。

虽然 ClickHouse 可以在 NFS 上工作，但这不是最佳想法。

## Linux Kernel {#linux-kernel}

不要使用过时的 Linux 内核。

## Network {#network}

如果您使用 IPv6，请增加路由缓存的大小。
3.2 之前的 Linux 内核在 IPv6 实现上有很多问题。

如果可能，请使用至少 10 GB 的网络。1 Gb 也可以，但在给副本打补丁时，如果数据量达到几十 TB，或处理分布式查询时有大量中间数据，将表现得更差。

## Huge Pages {#huge-pages}

如果您使用旧版 Linux 内核，请禁用透明大页。它会干扰内存分配器，导致显著的性能下降。
在较新的 Linux 内核上，透明大页是可以的。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

如果您希望永久修改透明大页设置，请编辑 `/etc/default/grub`，将 `transparent_hugepage=madvise` 添加到 `GRUB_CMDLINE_LINUX_DEFAULT` 选项中：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

之后，运行 `sudo update-grub` 命令，然后重启以生效。

## Hypervisor configuration {#hypervisor-configuration}

如果您使用 OpenStack，请在 `nova.conf` 中设置
```ini
cpu_mode=host-passthrough
```。

如果您使用 libvirt，请在 XML 配置中设置
```xml
<cpu mode='host-passthrough'/>
```。

这对 ClickHouse 能够通过 `cpuid` 指令获取正确的信息非常重要。
否则，当 hypervisor 在旧 CPU 型号上运行时，您可能会得到 `Illegal instruction` 崩溃。

## ClickHouse Keeper and ZooKeeper {#zookeeper}

ClickHouse Keeper 推荐用来替代 ZooKeeper 以支持 ClickHouse 集群。有关详细信息，请参见 [ClickHouse Keeper](../guides/sre/keeper/index.md) 的文档。

如果您希望继续使用 ZooKeeper，最好使用新版本的 ZooKeeper – 3.4.9 或更高版本。稳定版 Linux 发行版中的版本可能已经过时。

您绝不应使用手动编写的脚本在不同的 ZooKeeper 集群之间转移数据，因为对于顺序节点，结果将是不正确的。出于同样的原因，绝不要使用 "zkcopy" 工具：https://github.com/ksprojects/zkcopy/issues/15

如果您想将现有 ZooKeeper 集群分割为两个，正确的方法是增加它的副本数量，然后将其重新配置为两个独立的集群。

您可以在测试环境中或在具有低摄入速率的环境中，在与 ClickHouse 相同的服务器上运行 ClickHouse Keeper。
对于生产环境，我们建议为 ClickHouse 和 ZooKeeper/Keeper 使用单独的服务器，或将 ClickHouse 文件和 Keeper 文件放在不同的磁盘上。因为 ZooKeeper/Keeper 对磁盘延迟非常敏感，ClickHouse 可能会使用所有可用的系统资源。

您可以在一个集群中拥有 ZooKeeper 观察者，但 ClickHouse 服务器不应与观察者互动。

不要更改 `minSessionTimeout` 设置，大的值可能会影响 ClickHouse 重启的稳定性。

使用默认设置时，ZooKeeper就像定时炸弹：

> 使用默认配置的 ZooKeeper 服务器不会删除旧快照和日志中的文件（请参见 `autopurge`），这是操作员的责任。

这颗炸弹必须被引爆。

以下是大型生产环境中使用的 ZooKeeper（3.5.1）配置：

zoo.cfg:

```bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# The number of milliseconds of each tick
tickTime=2000

# The number of ticks that the initial

# synchronization phase can take

# This value is not quite motivated
initLimit=300

# The number of ticks that can pass between

# sending a request and getting an acknowledgement
syncLimit=10

maxClientCnxns=2000


# It is the maximum value that client may request and the server will accept.

# It is Ok to have high maxSessionTimeout on server to allow clients to work with high session timeout if they want.

# But we request session timeout of 30 seconds by default (you can change it with session_timeout_ms in ClickHouse config).
maxSessionTimeout=60000000

# the directory where the snapshot is stored.
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Place the dataLogDir to a separate physical disc for better performance
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# To avoid seeks ZooKeeper allocates space in the transaction log file in

# blocks of preAllocSize kilobytes. The default block size is 64M. One reason

# for changing the size of the blocks is to reduce the block size if snapshots

# are taken more often. (Also, see snapCount).
preAllocSize=131072


# Clients can submit requests faster than ZooKeeper can process them,

# especially if there are a lot of clients. To prevent ZooKeeper from running

# out of memory due to queued requests, ZooKeeper will throttle clients so that

# there is no more than globalOutstandingLimit outstanding requests in the

# system. The default limit is 1000.

# globalOutstandingLimit=1000


# ZooKeeper logs transactions to a transaction log. After snapCount transactions

# are written to a log file a snapshot is started and a new transaction log file

# is started. The default snapCount is 100000.
snapCount=3000000


# If this option is defined, requests will be will logged to a trace file named

# traceFile.year.month.day.
#traceFile=


# Leader accepts client connections. Default value is "yes". The leader machine

# coordinates updates. For higher update throughput at thes slight expense of

# read throughput the leader can be configured to not accept clients and focus

# on coordination.
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


# TODO this is really ugly

# How to find out, which jars are needed?

# seems, that log4j requires the log4j.properties file to be in the classpath
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

盐初始化：

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} centralized coordination service"

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

如果您使用防病毒软件，请将其配置为跳过 ClickHouse 数据文件的文件夹（`/var/lib/clickhouse`），否则性能可能会降低，您可能会在数据摄入和后台合并期间遇到意外错误。

## Related Content {#related-content}

- [刚开始使用 ClickHouse？请查看这 13 个“致命错误”以及如何避免它们](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
