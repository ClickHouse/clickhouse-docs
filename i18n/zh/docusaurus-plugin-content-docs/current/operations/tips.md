---
'description': 'http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
  的文档'
'sidebar_label': '使用建议'
'sidebar_position': 58
'slug': '/operations/tips'
'title': '使用建议'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU Scaling Governor {#cpu-scaling-governor}

始终使用 `performance` 调节器。`on-demand` 调节器在不断高需求的情况下表现更差。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU Limitations {#cpu-limitations}

处理器可能会过热。使用 `dmesg` 查看 CPU 的时钟频率是否因为过热而被限制。
这种限制也可以在数据中心级别进行外部设置。您可以使用 `turbostat` 在负载下监控它。

## RAM {#ram}

对于少量数据（压缩后约 200 GB），最好使用与数据量相同的内存。
对于大量数据和处理交互（在线）查询时，您应该使用合理数量的 RAM（128 GB 或更多），以便热数据子集能够适应页面的缓存。
即使对于每台服务器约 50 TB 的数据量，使用 128 GB 的 RAM 与 64 GB 相比，查询性能显著提高。

请勿禁用过量分配。值 `cat /proc/sys/vm/overcommit_memory` 应为 0 或 1。运行

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

使用 `perf top` 观察内核在内存管理中花费的时间。
永久大页也不需要分配。

### 使用少于 16GB 的 RAM {#using-less-than-16gb-of-ram}

推荐的 RAM 数量为 32 GB 或更多。

如果您的系统 RAM 少于 16 GB，您可能会遇到各种内存异常，因为默认设置与该数量的内存不匹配。您可以在具有少量 RAM 的系统中使用 ClickHouse（低至 2 GB），但这些设置需要额外调优，且只能以较低速率接收数据。

当使用少于 16GB 的 RAM 的 ClickHouse 时，我们建议如下：

- 在 `config.xml` 中降低标记缓存的大小。可以设置为低至 500 MB，但不能设置为零。
- 将查询处理线程的数量降低到 `1`。
- 将 `max_block_size` 降低到 `8192`。可以低至 `1024` 的值仍然可以实用。
- 将 `max_download_threads` 降低到 `1`。
- 将 `input_format_parallel_parsing` 和 `output_format_parallel_formatting` 设置为 `0`。

额外说明：
- 要刷新内存分配器缓存的内存，可以运行 `SYSTEM JEMALLOC PURGE` 命令。
- 我们不建议在低内存机器上使用 S3 或 Kafka 集成，因为它们需要大量内存用于缓冲区。

## Storage Subsystem {#storage-subsystem}

如果您的预算允许，请使用 SSD。
如果不行，请使用 HDD。7200 RPM 的 SATA HDD 也可以。

优先选择多台本地硬盘的服务器，而不是少量附带磁盘架的服务器。
但是对于存储查询较少的归档，磁盘架将起作用。

## RAID {#raid}

使用 HDD 时，可以组合成 RAID-10、RAID-5、RAID-6 或 RAID-50。
对于 Linux 软件 RAID 更好（使用 `mdadm`）。
创建 RAID-10 时，选择 `far` 布局。
如果预算允许，选择 RAID-10。

单独使用 LVM（没有 RAID 或 `mdadm`）也是可以的，但与之组合使用 RAID 或与 `mdadm` 结合使用的选项探索较少，且出错的机会较大（选择错误的块大小；块未对齐；选择错误的 RAID 类型；忘记清理磁盘）。如果您对使用 LVM 有信心，那么使用它是可行的。

如果您有 4 个以上的磁盘，使用 RAID-6（优选）或 RAID-50，而不是 RAID-5。
使用 RAID-5、RAID-6 或 RAID-50 时，始终增加 stripe_cache_size，因为默认值通常不是最佳选择。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

使用公式 `2 * num_devices * chunk_size_in_bytes / 4096` 来计算设备数量和块大小的精确数值。

64 KB 的块大小对大多数 RAID 配置都是足够的。平均 clickhouse-server 写入大小约为 1 MB（1024 KB），因此建议的条带大小也为 1 MB。如果需要，块大小可以优化为 1 MB 除以 RAID 阵列中非奇偶校验磁盘的数量，以便每次写入在所有可用的非奇偶校验磁盘上并行化。
请勿将块大小设置得过小或过大。

您可以在 SSD 上使用 RAID-0。
无论是否使用 RAID，始终使用复制以确保数据安全。

启用带有长队列的 NCQ。对于 HDD，选择 mq-deadline 或 CFQ 调度器，对于 SSD，选择 noop。请勿减少 'readahead' 设置。
对于 HDD，启用写缓存。

确保在您的操作系统中启用 [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing))，用于 NVME 和 SSD 磁盘（通常是通过定时作业或 systemd 服务实现）。

## File System {#file-system}

Ext4 是最可靠的选择。设置挂载选项为 `noatime`。XFS 也表现良好。
大多数其他文件系统也应该可以正常工作。

由于缺少硬链接，FAT-32 和 exFAT 不受支持。

请勿使用压缩文件系统，因为 ClickHouse 自行进行更好的压缩。
不建议使用加密文件系统，因为您可以在 ClickHouse 中使用内置加密功能，从而更为优越。

虽然 ClickHouse 可以在 NFS 上工作，但并不推荐。

## Linux Kernel {#linux-kernel}

请勿使用过时的 Linux 内核。

## Network {#network}

如果您使用 IPv6，请增加路由缓存的大小。
3.2 之前的 Linux 内核在 IPv6 实现上存在众多问题。

如果可能，请使用至少 10 GB 的网络。1 Gb 也可以工作，但在使用数十 TB 数据进行修补副本或处理大量中间数据的分布式查询时会表现更差。

## Huge Pages {#huge-pages}

如果您使用旧版 Linux 内核，请禁用透明大页。它干扰内存分配器，导致显著的性能下降。
在较新版本的 Linux 内核上，透明大页是可以的。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

如果您希望永久修改透明大页设置，请编辑 `/etc/default/grub`，将 `transparent_hugepage=madvise` 添加到 `GRUB_CMDLINE_LINUX_DEFAULT` 选项：

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

这对于 ClickHouse 能够通过 `cpuid` 指令获取正确的信息非常重要。
否则，当 hypervisor 在旧 CPU 模型上运行时，您可能会遇到 `Illegal instruction` 崩溃。

## ClickHouse Keeper and ZooKeeper {#zookeeper}

建议使用 ClickHouse Keeper 来替代 ZooKeeper 进行 ClickHouse 集群。有关 ClickHouse Keeper 的文档，请参见 [ClickHouse Keeper](../guides/sre/keeper/index.md)

如果您希望继续使用 ZooKeeper，则最好使用最新版本的 ZooKeeper——3.4.9 或更高版本。稳定 Linux 发行版中的版本可能已经过时。

绝不要使用手动编写的脚本在不同的 ZooKeeper 集群之间传输数据，因为结果会对序列节点不正确。出于同样的原因，绝不要使用 "zkcopy" 工具：https://github.com/ksprojects/zkcopy/issues/15

如果您想将现有的 ZooKeeper 集群拆分为两个，正确的方法是增加其副本数量，然后将其重新配置为两个独立的集群。

您可以在测试环境中或在数据接收率较低的环境中将 ClickHouse Keeper 与 ClickHouse 运行在同一服务器上。
对于生产环境，我们建议为 ClickHouse 和 ZooKeeper/Keeper 使用单独的服务器，或将 ClickHouse 文件和 Keeper 文件放在不同的磁盘上。因为 ZooKeeper/Keeper 对磁盘延迟非常敏感，而 ClickHouse 可能会利用所有可用的系统资源。

您可以在集群中拥有 ZooKeeper 观察者，但 ClickHouse 服务器不应与观察者交互。

请勿更改 `minSessionTimeout` 设置，大值可能会影响 ClickHouse 的重启稳定性。

在默认设置下，ZooKeeper 就像一颗定时炸弹：

> 当使用默认配置时，ZooKeeper 服务器不会删除旧快照和日志中的文件（见 `autopurge`），这需要操作员的责任。

这个炸弹必须被拆除。

以下 ZooKeeper (3.5.1) 配置用于大型生产环境：

zoo.cfg：

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

Salt 初始化：

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

如果您使用防病毒软件，请将其配置为跳过包含 ClickHouse 数据文件的文件夹（`/var/lib/clickhouse`），否则可能会降低性能，并可能在数据接收和后台合并期间出现意外错误。

## Related Content {#related-content}

- [刚开始使用 ClickHouse？这里有 13 条“致命错误”及其避免方法](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
