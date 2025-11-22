---
description: '本页介绍开源 ClickHouse 的使用建议'
sidebar_label: 'OSS 使用建议'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 使用建议'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## CPU 调频策略 {#cpu-scaling-governor}

始终使用 `performance` 调频策略。`on-demand` 调频策略在持续高负载场景下性能表现较差。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## CPU 限制 {#cpu-limitations}

处理器可能会过热。使用 `dmesg` 命令查看 CPU 时钟频率是否因过热而受到限制。
该限制也可以在数据中心级别进行外部设置。您可以使用 `turbostat` 命令在负载情况下进行监控。


## 内存 {#ram}

对于少量数据(压缩后最多约 200 GB),最好使用与数据量相当的内存。
对于大量数据以及处理交互式(在线)查询时,应使用合理的内存容量(128 GB 或更多),以便热数据子集能够放入页面缓存中。
即使每台服务器的数据量约为 50 TB,使用 128 GB 内存相比 64 GB 也能显著提升查询性能。

不要禁用 overcommit。`cat /proc/sys/vm/overcommit_memory` 的值应为 0 或 1。运行

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

使用 `perf top` 监控内核在内存管理上花费的时间。
也不需要分配永久大页。

### 使用少于 16GB 的内存 {#using-less-than-16gb-of-ram}

推荐的内存容量为 32 GB 或更多。

如果您的系统内存少于 16 GB,可能会遇到各种内存异常,因为默认设置与此内存容量不匹配。您可以在内存较小的系统(低至 2 GB)上使用 ClickHouse,但这些配置需要额外调优,并且只能以较低速率摄取数据。

在内存少于 16GB 的情况下使用 ClickHouse 时,我们建议进行以下配置:

- 在 `config.xml` 中降低标记缓存的大小。可以设置为低至 500 MB,但不能设置为零。
- 将查询处理线程数降低至 `1`。
- 将 `max_block_size` 降低至 `8192`。低至 `1024` 的值仍然可行。
- 将 `max_download_threads` 降低至 `1`。
- 将 `input_format_parallel_parsing` 和 `output_format_parallel_formatting` 设置为 `0`。
- 禁用日志表写入,因为后台合并任务会保留内存以执行日志表的合并。禁用 `asynchronous_metric_log`、`metric_log`、`text_log`、`trace_log`。

附加说明:

- 要刷新内存分配器缓存的内存,可以运行 `SYSTEM JEMALLOC PURGE` 命令。
- 我们不建议在低内存机器上使用 S3 或 Kafka 集成,因为它们需要大量内存用于缓冲区。


## 存储子系统 {#storage-subsystem}

如果预算允许,请使用 SSD。
如果预算不允许,则使用 HDD。SATA HDD 7200 RPM 即可满足需求。

优先选择配备本地硬盘的多台服务器,而非配备附加磁盘柜的少量服务器。
但对于存储查询频率较低的归档数据,磁盘柜也是可行的选择。


## RAID {#raid}

使用 HDD 时,可以组合使用 RAID-10、RAID-5、RAID-6 或 RAID-50。
对于 Linux,建议使用软件 RAID(通过 `mdadm`)。
创建 RAID-10 时,选择 `far` 布局。
如果预算允许,建议选择 RAID-10。

单独使用 LVM(不配合 RAID 或 `mdadm`)是可行的,但使用它创建 RAID 或将其与 `mdadm` 结合使用是一个较少被探索的方案,出错的可能性会更大
(选择错误的块大小;块未对齐;选择错误的 RAID 类型;忘记清理磁盘)。如果您对使用 LVM 有信心,
使用它并无不妥。

如果您有超过 4 个磁盘,请使用 RAID-6(首选)或 RAID-50,而不是 RAID-5。
使用 RAID-5、RAID-6 或 RAID-50 时,务必增加 stripe_cache_size,因为默认值通常不是最佳选择。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

根据设备数量和块大小使用以下公式计算精确数值:`2 * num_devices * chunk_size_in_bytes / 4096`。

对于大多数 RAID 配置,64 KB 的块大小已足够。clickhouse-server 的平均写入大小约为 1 MB(1024 KB),因此推荐的条带大小也是 1 MB。如有需要,可以将块大小设置为 1 MB 除以 RAID 阵列中非校验盘的数量来优化块大小,这样每次写入都会在所有可用的非校验盘上并行执行。
切勿将块大小设置得过小或过大。

您可以在 SSD 上使用 RAID-0。
无论是否使用 RAID,务必使用副本机制来保障数据安全。

启用具有长队列的 NCQ。对于 HDD,选择 mq-deadline 或 CFQ 调度器;对于 SSD,选择 noop。不要降低 'readahead' 设置。
对于 HDD,启用写入缓存。

确保在您的操作系统中为 NVME 和 SSD 磁盘启用了 [`fstrim`](<https://en.wikipedia.org/wiki/Trim_(computing)>)(通常通过 cronjob 或 systemd 服务实现)。


## 文件系统 {#file-system}

Ext4 是最可靠的选择。设置挂载选项 `noatime`。XFS 也表现良好。
大多数其他文件系统也可以正常工作。

由于缺少硬链接支持,不支持 FAT-32 和 exFAT。

不要使用压缩文件系统,因为 ClickHouse 自身会进行压缩且效果更好。
不建议使用加密文件系统,因为您可以使用 ClickHouse 的内置加密功能,效果更佳。

虽然 ClickHouse 可以在 NFS 上运行,但并不推荐这样做。


## Linux 内核 {#linux-kernel}

请勿使用过时的 Linux 内核。


## Network {#network}

如果使用 IPv6,请增加路由缓存的大小。
3.2 之前的 Linux 内核在 IPv6 实现方面存在诸多问题。

如果可能,请使用至少 10 GB 的网络。1 Gb 网络也可以使用,但在同步数十 TB 数据的副本或处理包含大量中间数据的分布式查询时,性能会明显下降。


## 大页内存 {#huge-pages}

如果您使用的是旧版 Linux 内核,请禁用透明大页。透明大页会干扰内存分配器,导致性能显著下降。
在较新的 Linux 内核上,透明大页可以正常使用。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

如果您想永久修改透明大页设置,请编辑 `/etc/default/grub` 文件,将 `transparent_hugepage=madvise` 添加到 `GRUB_CMDLINE_LINUX_DEFAULT` 选项中:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

之后,运行 `sudo update-grub` 命令,然后重启系统使更改生效。


## 虚拟机管理程序配置 {#hypervisor-configuration}

如果您使用 OpenStack,请设置

```ini
cpu_mode=host-passthrough
```

在 `nova.conf` 中。

如果您使用 libvirt,请设置

```xml
<cpu mode='host-passthrough'/>
```

在 XML 配置中。

这对于 ClickHouse 通过 `cpuid` 指令获取正确信息至关重要。
否则,当虚拟机管理程序在旧 CPU 型号上运行时,可能会出现 `Illegal instruction` 崩溃。


## ClickHouse Keeper 和 ZooKeeper {#zookeeper}

建议使用 ClickHouse Keeper 替代 ZooKeeper 来管理 ClickHouse 集群。请参阅 [ClickHouse Keeper](../guides/sre/keeper/index.md) 文档。

如果您希望继续使用 ZooKeeper,建议使用较新版本的 ZooKeeper——3.4.9 或更高版本。稳定版 Linux 发行版中的版本可能已过时。

切勿使用手动编写的脚本在不同的 ZooKeeper 集群之间传输数据,因为对于顺序节点,结果将是不正确的。出于同样的原因,也不要使用 "zkcopy" 工具:https://github.com/ksprojects/zkcopy/issues/15

如果您想将现有的 ZooKeeper 集群拆分为两个,正确的方法是先增加其副本数量,然后将其重新配置为两个独立的集群。

在测试环境或数据写入速率较低的环境中,您可以在与 ClickHouse 相同的服务器上运行 ClickHouse Keeper。
对于生产环境,我们建议为 ClickHouse 和 ZooKeeper/Keeper 使用独立的服务器,或将 ClickHouse 文件和 Keeper 文件放置在不同的磁盘上。因为 ZooKeeper/Keeper 对磁盘延迟非常敏感,而 ClickHouse 可能会占用所有可用的系统资源。

您可以在集群中配置 ZooKeeper 观察者节点,但 ClickHouse 服务器不应与观察者节点交互。

不要更改 `minSessionTimeout` 设置,过大的值可能会影响 ClickHouse 重启的稳定性。

使用默认设置时,ZooKeeper 就像一颗定时炸弹:

> 使用默认配置时,ZooKeeper 服务器不会删除旧快照和日志文件(参见 `autopurge`),这需要由运维人员负责处理。

必须解除这个隐患。

以下 ZooKeeper (3.5.1) 配置用于大型生产环境:

zoo.cfg:


```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
```


# The number of milliseconds of each tick
# 每个 tick 的毫秒数
tickTime=2000
# The number of ticks that the initial
# synchronization phase can take
# This value is not quite motivated
# 初始同步阶段所允许的 tick 数量
# 该值缺乏充分的依据
initLimit=300
# The number of ticks that can pass between
# sending a request and getting an acknowledgement
# 在发送请求和收到确认之间
# 所允许经过的 tick 数量
syncLimit=10

maxClientCnxns=2000
# 最大客户端连接数



# 这是客户端可以请求且服务器将接受的最大值。

# 在服务器上设置较高的 maxSessionTimeout 是可以的,这样可以允许客户端在需要时使用较高的会话超时时间。

# 但我们默认请求 30 秒的会话超时时间(您可以在 ClickHouse 配置中通过 session_timeout_ms 更改此设置)。

maxSessionTimeout=60000000

# 存储快照的目录。

dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# 将 dataLogDir 放置在单独的物理磁盘上以获得更好的性能

dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# To avoid seeks ZooKeeper allocates space in the transaction log file in
# blocks of preAllocSize kilobytes. The default block size is 64M. One reason
# for changing the size of the blocks is to reduce the block size if snapshots
# are taken more often. (Also, see snapCount).
# 为了避免磁盘寻道，ZooKeeper 会在事务日志文件中按
# preAllocSize 千字节为单位成块预分配空间。默认块大小为 64M。调整块大小的一个原因
# 是在更频繁生成快照时减小块大小。（另请参阅 snapCount）。
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



# 如果定义了此选项，请求将被记录到名为
# traceFile.year.month.day 的跟踪文件中。
#traceFile=



# Leader 接受客户端连接。默认值为 "yes"。Leader 机器

# 负责协调更新操作。为了以略微牺牲读取吞吐量为代价提高更新吞吐量,

# 可以将 leader 配置为不接受客户端连接,专注于

# 协调工作。

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


# TODO 这段实在太丑了
# 如何确定需要哪些 JAR？
# 看起来 log4j 要求在 classpath 中包含 `log4j.properties` 文件
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

Salt initialization:

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
````


## 防病毒软件 {#antivirus-software}

如果您使用防病毒软件,请将其配置为跳过 ClickHouse 数据文件所在的文件夹(`/var/lib/clickhouse`),否则可能会降低性能,并且在数据导入和后台合并过程中可能会遇到意外错误。


## 相关内容 {#related-content}

- [ClickHouse 入门？这里有 13 个"致命错误"及其规避方法](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
