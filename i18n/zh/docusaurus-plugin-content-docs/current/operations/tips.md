---
slug: /operations/tips
sidebar_position: 58
sidebar_label: '使用建议'
title: '使用建议'
---
import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU 缩放治理器 {#cpu-scaling-governor}

始终使用 `performance` 缩放治理器。`on-demand` 缩放治理器在持续高需求时表现更差。

``` bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU 限制 {#cpu-limitations}

处理器可能会过热。使用 `dmesg` 查看是否因过热而限制了 CPU 的时钟频率。此限制也可以在数据中心级别外部设置。您可以使用 `turbostat` 在负载下监控它。

## RAM {#ram}

对于小量数据（压缩后约 200 GB），最好使用与数据量相同的内存。对于大数据量以及处理交互式（在线）查询时，您应该使用合理的 RAM（128 GB 或更多），这样热点数据子集就可以适应页面缓存。即使对于每台服务器约 50 TB 的数据量，使用 128 GB 的 RAM 相较于 64 GB 会显著提升查询性能。

请不要禁用过量分配。值 `cat /proc/sys/vm/overcommit_memory` 应为 0 或 1。运行

``` bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

使用 `perf top` 观察内核在内存管理上花费的时间。也不需要分配永久大页。

### 使用少于 16GB 的 RAM {#using-less-than-16gb-of-ram}

推荐的 RAM 量为 32 GB 或更多。

如果您的系统内存少于 16 GB，您可能会遇到各种内存异常，因为默认设置与此内存量不匹配。您可以在内存量较小的系统中使用 ClickHouse（最低可至 2 GB），但这些设置需要额外的调优，并且只能以较低的速度摄取数据。

在使用少于 16GB 的 RAM 运行 ClickHouse 时，我们建议如下操作：

- 在 `config.xml` 中降低标记缓存的大小，最低可设为 500 MB，但不能设为零。
- 降低查询处理线程数到 `1`。
- 将 `max_block_size` 降低到 `8192`。较小的值（如 `1024`）仍然可以实用。
- 将 `max_download_threads` 降低到 `1`。
- 将 `input_format_parallel_parsing` 和 `output_format_parallel_formatting` 设置为 `0`。

附加说明：
- 要刷新内存分配器缓存的内存，您可以运行 `SYSTEM JEMALLOC PURGE` 命令。
- 我们不推荐在低内存机器上使用 S3 或 Kafka 集成，因为它们需要大量内存用于缓冲。

## 存储子系统 {#storage-subsystem}

如果您的预算允许，使用 SSD。如果不允许，则使用 HDD。7200 RPM 的 SATA HDD 也是可以的。

优先考虑许多有本地硬盘的服务器，而非少数附加磁盘架的服务器。但对于存储稀有查询的归档，磁盘架是可行的。

## RAID {#raid}

使用 HDD 时，可以使用 RAID-10、RAID-5、RAID-6 或 RAID-50 组合它们。对于 Linux，软件 RAID 更好（使用 `mdadm`）。创建 RAID-10 时，选择 `far` 布局。如果您的预算允许，选择 RAID-10。

LVM 单独使用（没有 RAID 或 `mdadm`）是可以的，但将其与 RAID 结合或与 `mdadm` 一起使用是一种探索较少的选项，并且可能会有更多出错的机会（选择错误的块大小；块对齐不当；选择错误的 RAID 类型；忘记清理磁盘）。如果您对使用 LVM 有信心，那么使用它没有问题。

如果您有超过 4 个磁盘，请使用 RAID-6（首选）或 RAID-50，而不是 RAID-5。当使用 RAID-5、RAID-6 或 RAID-50 时，请始终增加 stripe_cache_size，因为默认值通常不是最佳选择。

``` bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

使用公式 `2 * num_devices * chunk_size_in_bytes / 4096` 来计算确切的值，基于设备数量和块大小。

64 KB 的块大小对于大多数 RAID 配置来说已经足够。平均的 ClickHouse 服务器写入大小约为 1 MB（1024 KB），因此推荐的条带大小也是 1 MB。如果需要，块大小可以优化，设置为 1 MB 除以 RAID 阵列中非奇偶校验磁盘的数量，以便每次写入在所有可用的非奇偶校验磁盘上并行进行。切勿将块大小设置得过小或过大。

您可以在 SSD 上使用 RAID-0。无论 RAID 使用与否，始终使用复制来确保数据安全。

启用具有长队列的 NCQ。对于 HDD，请选择 mq-deadline 或 CFQ 调度器，对于 SSD，请选择 noop。不要减少“readahead”设置。对于 HDD，请启用写缓存。

确保 [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) 在您的操作系统中启用 NVME 和 SSD 磁盘（通常通过 cronjob 或 systemd 服务实现）。

## 文件系统 {#file-system}

Ext4 是最可靠的选择。设置挂载选项为 `noatime`。XFS 也表现良好。大多数其他文件系统也应该很好用。

由于缺乏硬链接，不支持 FAT-32 和 exFAT。

不要使用压缩文件系统，因为 ClickHouse 自行进行更好地压缩。不建议使用加密文件系统，因为您可以使用 ClickHouse 中内置的加密功能，这样更好。

虽然 ClickHouse 可以通过 NFS 工作，但这不是最佳选择。

## Linux 内核 {#linux-kernel}

不要使用过时的 Linux 内核。

## 网络 {#network}

如果您使用 IPv6，请增加路由缓存的大小。3.2 之前的 Linux 内核在 IPv6 实现上存在众多问题。

如果可能，请至少使用 10 GB 网络。1 Gb 也可以，但在为数十 TB 数据补丁副本或处理大型中间数据分布式查询时，将会表现更差。

## 大页 {#huge-pages}

如果您使用旧版 Linux 内核，请禁用透明大页。这会干扰内存分配器，导致显著的性能下降。在更新的 Linux 内核上，透明大页是可以的。

``` bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

如果您想永久修改透明大页设置，可以编辑 `/etc/default/grub` 将 `transparent_hugepage=madvise` 添加到 `GRUB_CMDLINE_LINUX_DEFAULT` 选项中：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

然后，运行 `sudo update-grub` 命令，再重启以使其生效。

## 虚拟化程序配置 {#hypervisor-configuration}

如果您使用 OpenStack，请在 `nova.conf` 中设置
```ini
cpu_mode=host-passthrough
```

如果您使用 libvirt，请在 XML 配置中设置
```xml
<cpu mode='host-passthrough'/>
```

这对于 ClickHouse 获取 `cpuid` 指令的正确信息非常重要。否则，当虚拟化程序在旧 CPU 模型上运行时，可能会发生 `非法指令` 崩溃。

## ClickHouse Keeper 和 ZooKeeper {#zookeeper}

建议用 ClickHouse Keeper 替代 ZooKeeper 进行 ClickHouse 集群。有关 [ClickHouse Keeper](../guides/sre/keeper/index.md) 的文档，请参阅。

如果您希望继续使用 ZooKeeper，最好使用全新的 ZooKeeper 版本 – 3.4.9 或更高版本。稳定的 Linux 发行版中的版本可能是过时的。

您绝不要使用手动编写的脚本在不同的 ZooKeeper 集群之间传输数据，因为结果对于顺序节点将不正确。由于同样的原因，千万不要使用 “zkcopy” 实用程序： https://github.com/ksprojects/zkcopy/issues/15

如果您想将现有的 ZooKeeper 集群划分为两个，则正确的方法是增加其副本的数量，然后将其重新配置为两个独立的集群。

您可以在测试环境中或数据摄取率低的环境中将 ClickHouse Keeper 与 ClickHouse 运行在同一台服务器上。对于生产环境，我们建议为 ClickHouse 和 ZooKeeper/Keeper 使用单独的服务器，或者将 ClickHouse 文件和 Keeper 文件放在不同的磁盘上。因为 ZooKeeper/Keeper 对磁盘延迟非常敏感，而 ClickHouse 可能会占用所有可用的系统资源。

您可以在集群中拥有 ZooKeeper 观察者，但 ClickHouse 服务器不应与观察者互动。

请勿更改 `minSessionTimeout` 设置，大值可能会影响 ClickHouse 的重启稳定性。

使用默认设置时，ZooKeeper 是一颗定时炸弹：

> 当使用默认配置时，ZooKeeper 服务器不会从旧快照和日志中删除文件（参见 `autopurge`），这由操作员负责。

这颗炸弹必须被拆除。

以下是大型生产环境中使用的 ZooKeeper（3.5.1）配置：

zoo.cfg:

``` bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# 每个滴答的毫秒数
tickTime=2000

# 初始

# 同步阶段可能需要的滴答数

# 该值不是很有说服力
initLimit=300

# 在发送请求和获得确认之间可以通过的滴答数
syncLimit=10

maxClientCnxns=2000


# 客户端可能请求并且服务器将接受的最大值。

# 如果客户端希望处理高的会话超时，将服务器上的 maxSessionTimeout 设置得高是可以的。

# 但我们默认请求 30 秒的会话超时（您可以在 ClickHouse 配置中使用 session_timeout_ms 更改它）。
maxSessionTimeout=60000000

# 快照存储目录。
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# 将 dataLogDir 放置在单独的物理磁盘上以获得更好的性能
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# 为了避免查找，ZooKeeper 在事务日志文件中以

# 预分配大小的块分配空间。默认块大小为 64M。更改块大小的一个原因是

# 为了在快照更频繁时减少块大小。(同时，见 snapCount)。
preAllocSize=131072


# 客户端可以提交请求的速度快于 ZooKeeper 处理请求的速度，

# 特别是如果有很多客户端。为了防止 ZooKeeper 因排队请求而耗尽内存，

# ZooKeeper 将限制客户端，使得系统中没有超过 globalOutstandingLimit 的未完成请求。

# 默认限制为 1000。

# globalOutstandingLimit=1000


# ZooKeeper 将事务记录到事务日志中。在 snapCount 事务

# 写入日志文件后，将开始快照并开始新的事务日志文件。

# 默认的 snapCount 为 100000。
snapCount=3000000


# 如果定义了此选项，请求将记录到名为

# traceFile.year.month.day 的跟踪文件中。
#traceFile=


# 领导者接受客户端连接。默认值为 "yes"。领导机器

# 协调更新。为了提高更新的吞吐量，稍微牺牲

# 读取吞吐量，可以配置领导者不接受客户端并专注于

# 协调。
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Java 版本：

``` text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVM 参数：

``` bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf


# TODO 这真的很丑

# 如何找出需要哪些 jars？

# 似乎 log4j 要求 log4j.properties 文件在类路径中
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

``` text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} 集中协调服务"

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

## 防病毒软件 {#antivirus-software}

如果您使用防病毒软件，请配置其跳过 ClickHouse 数据文件的文件夹（`/var/lib/clickhouse`），否则可能会降低性能，并在数据摄取和后台合并过程中遇到意外错误。

## 相关内容 {#related-content}

- [刚开始使用 ClickHouse？这里有 13 个“致命错误”及其避免方法](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
