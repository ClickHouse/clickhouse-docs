---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: '配置 ClickHouse Keeper'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（或 clickhouse-keeper）可替代 ZooKeeper，用于实现复制与协调。'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---



# ClickHouse Keeper（clickhouse-keeper）

import SelfManaged from "@site/docs/_snippets/_self_managed_only_automated.md"

<SelfManaged />

ClickHouse Keeper 为数据[复制](/engines/table-engines/mergetree-family/replication.md)和[分布式 DDL](/sql-reference/distributed-ddl.md) 查询执行提供协调系统。ClickHouse Keeper 与 ZooKeeper 兼容。

### 实现细节 {#implementation-details}

ZooKeeper 是最早广为人知的开源协调系统之一。它使用 Java 实现，具有简洁而强大的数据模型。ZooKeeper 的协调算法 ZooKeeper Atomic Broadcast（ZAB）不为读取操作提供线性一致性保证，因为每个 ZooKeeper 节点都在本地处理读取请求。与 ZooKeeper 不同，ClickHouse Keeper 使用 C++ 编写，并采用 [RAFT 算法](https://raft.github.io/)[实现](https://github.com/eBay/NuRaft)。该算法为读取和写入操作提供线性一致性，并且在不同编程语言中有多个开源实现。

默认情况下，ClickHouse Keeper 提供与 ZooKeeper 相同的保证：线性一致的写入和非线性一致的读取。它具有兼容的客户端-服务器协议，因此任何标准 ZooKeeper 客户端都可以用于与 ClickHouse Keeper 交互。快照和日志的格式与 ZooKeeper 不兼容，但 `clickhouse-keeper-converter` 工具可以将 ZooKeeper 数据转换为 ClickHouse Keeper 快照。ClickHouse Keeper 的服务器间协议也与 ZooKeeper 不兼容，因此无法创建混合的 ZooKeeper / ClickHouse Keeper 集群。

ClickHouse Keeper 以与 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) 相同的方式支持访问控制列表（ACL）。ClickHouse Keeper 支持相同的权限集，并具有相同的内置方案：`world`、`auth` 和 `digest`。digest 认证方案使用 `username:password` 对，密码采用 Base64 编码。

:::note
不支持外部集成。
:::

### 配置 {#configuration}

ClickHouse Keeper 可以作为 ZooKeeper 的独立替代品使用，也可以作为 ClickHouse 服务器的内部组件使用。在这两种情况下，配置文件几乎相同，都是 `.xml` 文件。

#### Keeper 配置设置 {#keeper-configuration-settings}

ClickHouse Keeper 的主要配置标签是 `<keeper_server>`，包含以下参数：


| 参数                           | 描述                                                                                                                                                                                                                                         | 默认值                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tcp_port`                          | 客户端连接端口。                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                   | 客户端与 keeper-server 之间 SSL 连接的安全端口。                                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                         | 唯一的服务器 ID,ClickHouse Keeper 集群的每个参与者必须具有唯一的编号(1、2、3 等)。                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                  | 协调日志的路径,与 ZooKeeper 类似,最好将日志存储在非繁忙节点上。                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`             | 协调快照的路径。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`            | 通过 [`reconfig`](#reconfiguration) 启用动态集群重新配置。                                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`       | keeper 最大内存使用量的软限制(以字节为单位)。                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` \* `physical_memory_amount`                                              |
| `max_memory_usage_soft_limit_ratio` | 如果未设置 `max_memory_usage_soft_limit` 或设置为零,则使用此值来定义默认软限制。                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time` | 如果未设置 `max_memory_usage_soft_limit` 或设置为 `0`,则使用此间隔来观察物理内存量。一旦内存量发生变化,将通过 `max_memory_usage_soft_limit_ratio` 重新计算 Keeper 的内存软限制。 | `15`                                                                                                         |
| `http_control`                      | [HTTP 控制](#http-control)接口的配置。                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                    | 启用实时数据一致性检查                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`           | 在关闭时创建快照                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`           | 为集群配置启用主机名合理性检查(例如,当 localhost 与远程端点一起使用时)                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`       | 4lw 命令的白名单。                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
| `enable_ipv6`                       | 启用 IPv6                                                                                                                                                                                                                         | `True`                                                                                                       |

其他常用参数继承自 ClickHouse 服务器配置(`listen_host`、`logger` 等)。

#### 内部协调设置 {#internal-coordination-settings}

内部协调设置位于 `<keeper_server>.<coordination_settings>` 部分,包含以下参数:


| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 单个客户端操作的超时时间（毫秒）。                                                                                                                                                                                        | `10000`                                                                                                      |
| `min_session_timeout_ms`           | 客户端会话的最小超时时间（毫秒）。                                                                                                                                                                                        | `10000`                                                                                                      |
| `session_timeout_ms`               | 客户端会话的最大超时时间（毫秒）。                                                                                                                                                                                        | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper 检查并移除失效会话的时间间隔（毫秒）。                                                                                                                                                                 | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper 领导者向跟随者发送心跳的时间间隔（毫秒）。                                                                                                                                                             | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | 如果跟随者在该时间间隔内未收到领导者的心跳，则可以发起领导者选举。必须小于等于 `election_timeout_upper_bound_ms`，理想情况下这两个值不应相等。                                                                          | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | 如果跟随者在该时间间隔内未收到领导者的心跳，则必须发起领导者选举。                                                                                                                                                       | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 单个文件中要存储的日志记录数量。                                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | 触发压缩前要保留的协调日志记录数量。                                                                                                                                                                                      | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper 创建新快照的频率（按日志中的记录条数计算）。                                                                                                                                                           | `100000`                                                                                                     |
| `snapshots_to_keep`                | 要保留的快照数量。                                                                                                                                                                                                        | `3`                                                                                                          |
| `stale_log_gap`                    | 领导者将跟随者视为“落后”，并向其发送快照而非日志时使用的阈值。                                                                                                                                                            | `10000`                                                                                                      |
| `fresh_log_gap`                    | 将节点视为“最新”的条件。                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | 在发送到 RAFT 之前，请求批次中包含的最大请求数量。                                                                                                                                                                       | `100`                                                                                                        |
| `force_sync`                       | 在每次写入协调日志时调用 `fsync`。                                                                                                                                                                                        | `true`                                                                                                       |
| `quorum_reads`                     | 通过完整的 RAFT 共识将读请求按写请求方式执行，速度相近。                                                                                                                                                                 | `false`                                                                                                      |
| `raft_logs_level`                  | 协调相关的文本日志级别（trace、debug 等）。                                                                                                                                                                              | `system default`                                                                                             |
| `auto_forwarding`                  | 允许跟随者将写请求转发给领导者。                                                                                                                                                                                          | `true`                                                                                                       |
| `shutdown_timeout`                 | 等待内部连接完成并关闭的时间（毫秒）。                                                                                                                                                                                    | `5000`                                                                                                       |
| `startup_timeout`                  | 如果服务器在指定超时时间内未能连接到其他法定人数参与者，则会终止（毫秒）。                                                                                                                                                | `30000`                                                                                                      |
| `async_replication`                | 启用异步复制。在保持所有写入和读取语义保证的同时获得更好的性能。默认禁用此设置，以避免破坏向后兼容性。                                                                                                                   | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新日志条目的内存缓存的最大总大小。                                                                                                                                                                                      | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | 为下一步提交所需日志条目的内存缓存的最大总大小。                                                                                                                                                                          | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | 在磁盘间移动文件时发生失败后，两次重试之间的等待时间（毫秒）。                                                                                                                                                            | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 在初始化期间在磁盘间移动文件时发生失败后的重试次数。                                                                                                                                                                      | `100`                                                                                                        |
| `experimental_use_rocksdb`         | 使用 RocksDB 作为后端存储。                                                                                                                                                                                               | `0`                                                                                                          |

法定人数配置位于 `<keeper_server>.<raft_configuration>` 部分，其中包含服务器的描述。

整个法定人数唯一的参数是 `secure`，用于为法定人数参与者之间的通信启用加密连接。如果节点之间的内部通信需要 SSL 连接，可以将该参数设置为 `true`，否则可以不指定。

每个 `<server>` 的主要参数为：



- `id` — 仲裁中的服务器标识符。
- `hostname` — 此服务器所在的主机名。
- `port` — 此服务器监听连接的端口。
- `can_become_leader` — 设置为 `false` 可将服务器配置为 `learner`。如果省略,默认值为 `true`。

:::note
如果您的 ClickHouse Keeper 集群拓扑发生变化(例如替换服务器),请确保保持 `server_id` 到 `hostname` 的映射一致,避免混用或为不同服务器重用现有的 `server_id`(例如,如果您依赖自动化脚本部署 ClickHouse Keeper,可能会发生这种情况)。

如果 Keeper 实例的主机可能会更改,我们建议定义并使用主机名而不是原始 IP 地址。更改主机名等同于先删除服务器再重新添加,在某些情况下这可能无法实现(例如没有足够的 Keeper 实例来形成仲裁)。
:::

:::note
`async_replication` 默认禁用以避免破坏向后兼容性。如果您集群中的所有 Keeper 实例都运行支持 `async_replication` 的版本(v23.9+),我们建议启用它,因为它可以提高性能且没有任何缺点。
:::

可以在带有 `test_keeper_` 前缀的[集成测试](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)中找到三节点仲裁的配置示例。服务器 #1 的配置示例:

```xml
<keeper_server>
    <tcp_port>2181</tcp_port>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>zoo1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>zoo2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>zoo3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
</keeper_server>
```

### 如何运行 {#how-to-run}

ClickHouse Keeper 已捆绑到 ClickHouse 服务器包中,只需将 `<keeper_server>` 的配置添加到您的 `/etc/your_path_to_config/clickhouse-server/config.xml` 并像往常一样启动 ClickHouse 服务器。如果您想运行独立的 ClickHouse Keeper,可以用类似的方式启动:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

如果您没有符号链接(`clickhouse-keeper`),可以创建它或将 `keeper` 指定为 `clickhouse` 的参数:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 四字母命令 {#four-letter-word-commands}

ClickHouse Keeper 还提供 4lw 命令,与 Zookeeper 几乎相同。每个命令由四个字母组成,例如 `mntr`、`stat` 等。还有一些更有用的命令:`stat` 提供有关服务器和已连接客户端的一般信息,而 `srvr` 和 `cons` 分别提供有关服务器和连接的详细信息。

4lw 命令有一个白名单配置 `four_letter_word_white_list`,其默认值为 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`。

您可以通过 telnet 或 nc 在客户端端口向 ClickHouse Keeper 发出命令。

```bash
echo mntr | nc localhost 9181
```

以下是详细的 4lw 命令:

- `ruok`: 测试服务器是否在非错误状态下运行。如果服务器正在运行,将响应 `imok`。否则,将完全不响应。`imok` 响应并不一定表示服务器已加入仲裁,只是表示服务器进程处于活动状态并绑定到指定的客户端端口。使用 "stat" 获取有关仲裁状态和客户端连接信息的详细信息。

```response
imok
```


* `mntr`: 输出可用于监控集群健康状态的变量列表。

```response
zk_version      v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     68
zk_packets_sent 68
zk_num_alive_connections        1
zk_outstanding_requests 0
zk_server_state leader
zk_znode_count  4
zk_watch_count  1
zk_ephemerals_count     0
zk_approximate_data_size        723
zk_open_file_descriptor_count   310
zk_max_file_descriptor_count    10240
zk_followers    0
zk_synced_followers     0
```

* `srvr`: 列出服务器的所有详细信息。

```response
ClickHouse Keeper 版本: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
延迟 最小值/平均值/最大值: 0/0/0
已接收: 2
已发送: 2
连接数: 1
待处理: 0
Zxid: 34
模式: leader
节点数: 4
```

* `stat`: 列出服务器和已连接客户端的简要信息。

```response
ClickHouse Keeper 版本: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
客户端:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
延迟 最小值/平均值/最大值: 0/0/0
已接收: 4
已发送: 4
连接数: 1
待处理请求: 0
Zxid: 36
模式: leader
节点数: 4
```

* `srst`: 重置服务器统计信息。该命令会影响 `srvr`、`mntr` 和 `stat` 的输出结果。

```response
服务器统计信息已重置。
```

* `conf`: 打印服务端配置的详细信息。

```response
server_id=1
tcp_port=2181
four_letter_word_white_list=*
log_storage_path=./coordination/logs
snapshot_storage_path=./coordination/snapshots
max_requests_batch_size=100
session_timeout_ms=30000
operation_timeout_ms=10000
dead_session_check_period_ms=500
heart_beat_interval_ms=500
election_timeout_lower_bound_ms=1000
election_timeout_upper_bound_ms=2000
reserved_log_items=1000000000000000
snapshot_distance=10000
auto_forwarding=true
shutdown_timeout=5000
startup_timeout=240000
raft_logs_level=information
snapshots_to_keep=3
rotate_log_storage_interval=100000
stale_log_gap=10000
fresh_log_gap=200
max_requests_batch_size=100
quorum_reads=false
force_sync=false
compress_logs=true
compress_snapshots_with_zstd_format=true
configuration_change_tries_count=20
```

* `cons`: 列出所有连接到此服务器的客户端的完整连接/会话详情。包括接收/发送的数据包数量、会话 ID、操作延迟、最近一次执行的操作等信息。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: 重置所有连接的连接/会话统计数据。

```response
连接统计已重置。
```

* `envi`: 输出服务环境的详细信息


```response
Environment:
clickhouse.keeper.version=v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
host.name=ZBMAC-C02D4054M.local
os.name=Darwin
os.arch=x86_64
os.version=19.6.0
cpu.count=12
user.name=root
user.home=/Users/JackyWoo/
user.dir=/Users/JackyWoo/project/jd/clickhouse/cmake-build-debug/programs/
user.tmp=/var/folders/b4/smbq5mfj7578f2jzwn602tt40000gn/T/
```

* `dirs`: 显示快照和日志文件的总大小（以字节为单位）

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: 检查服务器是否在只读模式下运行。如果处于只读模式，服务器将返回 `ro`；否则（非只读模式）将返回 `rw`。

```response
rw
```

* `wchs`: 列出服务器监控项的简要信息。

```response
1 个连接正在监视 1 个路径
总监视数:1
```

* `wchc`: 按会话列出服务器上 watch 的详细信息。该命令会输出带有关联 watch（路径）的会话（连接）列表。注意：根据 watch 的数量不同，此操作可能开销较大（影响服务器性能），请谨慎使用。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: 按路径列出服务器上的 `watch` 详细信息。该命令输出带有关联会话的路径（znode）列表。注意，根据 `watch` 数量的不同，此操作可能会比较昂贵（即会影响服务器性能），请谨慎使用。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: 列出未完成的会话和临时节点。此操作仅在领导者节点上有效。

```response
会话转储 (2):
0x0000000000000001
0x0000000000000002
包含临时节点的会话 (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: 调度一个快照创建任务。成功时返回已调度快照的最后已提交日志索引，失败时返回 `Failed to schedule snapshot creation task.`。请注意，可以使用 `lgif` 命令来判断快照是否已经完成。

```response
100
```

* `lgif`: Keeper 日志信息。`first_log_idx` : 本节点在日志存储中的第一个日志索引；`first_log_term` : 本节点的第一个日志任期；`last_log_idx` : 本节点在日志存储中的最后一个日志索引；`last_log_term` : 本节点的最后一个日志任期；`last_committed_log_idx` : 本节点在状态机中最后一个已提交的日志索引；`leader_committed_log_idx` : 从本节点视角看到的 leader 已提交的日志索引；`target_committed_log_idx` : 目标应提交到的日志索引；`last_snapshot_idx` : 上一个快照中最大的已提交日志索引。

```response
first_log_idx   1
first_log_term  1
last_log_idx    101
last_log_term   1
last_committed_log_idx  100
leader_committed_log_idx    101
target_committed_log_idx    101
last_snapshot_idx   50
```

* `rqld`: 请求成为新的 leader。若请求已发送，则返回 `Sent leadership request to leader.`；若请求未发送，则返回 `Failed to send leadership request to leader.`。注意，如果节点已经是 leader，则其结果与请求已发送时相同。

```response
已向 Leader 发送领导权请求。
```

* `ftfl`: 列出所有功能开关，以及它们在该 Keeper 实例中当前是否启用。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: 请求让出领导权并成为 follower。如果接收该请求的服务器是 leader，它会先暂停写操作，等待继任者（当前 leader 绝不会成为继任者）追上最新日志后再退位。继任者将自动选出。如果请求已发送，则返回 `Sent yield leadership request to leader.`，如果请求未发送，则返回 `Failed to send yield leadership request to leader.`。注意，如果节点已经是 follower，则其结果与请求已发送时相同。

```response
已向 leader 发送让出领导权请求。
```

* `pfev`: 返回所有已收集事件的值。对于每个事件，返回事件名称、事件值和事件描述。


```response
FileOpen        62      已打开的文件数。
Seek    4       调用 'lseek' 函数的次数。
ReadBufferFromFileDescriptorRead        126     从文件描述符读取（read/pread）的次数。不包括套接字。
ReadBufferFromFileDescriptorReadFailed  0       从文件描述符读取（read/pread）失败的次数。
ReadBufferFromFileDescriptorReadBytes   178846  从文件描述符读取的字节数。如果文件已压缩,此处显示压缩后的数据大小。
WriteBufferFromFileDescriptorWrite      7       向文件描述符写入（write/pwrite）的次数。不包括套接字。
WriteBufferFromFileDescriptorWriteFailed        0       向文件描述符写入（write/pwrite）失败的次数。
WriteBufferFromFileDescriptorWriteBytes 153     写入文件描述符的字节数。如果文件已压缩,此处显示压缩后的数据大小。
FileSync        2       对文件调用 F_FULLFSYNC/fsync/fdatasync 函数的次数。
DirectorySync   0       对目录调用 F_FULLFSYNC/fsync/fdatasync 函数的次数。
FileSyncElapsedMicroseconds     12756   等待文件 F_FULLFSYNC/fsync/fdatasync 系统调用所花费的总时间。
DirectorySyncElapsedMicroseconds        0       等待目录 F_FULLFSYNC/fsync/fdatasync 系统调用所花费的总时间。
ReadCompressedBytes     0       从压缩源（文件、网络）读取的字节数（解压前的字节数）。
CompressedReadBufferBlocks      0       从压缩源（文件、网络）读取的压缩块数（相互独立压缩的数据块）。
CompressedReadBufferBytes       0       从压缩源（文件、网络）读取的未压缩字节数（解压后的字节数）。
AIOWrite        0       使用 Linux 或 FreeBSD AIO 接口的写入次数
AIOWriteBytes   0       使用 Linux 或 FreeBSD AIO 接口写入的字节数
...
```

### HTTP 控制 {#http-control}

ClickHouse Keeper 提供了一个 HTTP 接口来检查副本是否准备好接收流量。该接口可用于云环境,例如 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)。

启用 `/ready` 端点的配置示例:

```xml
<clickhouse>
    <keeper_server>
        <http_control>
            <port>9182</port>
            <readiness>
                <endpoint>/ready</endpoint>
            </readiness>
        </http_control>
    </keeper_server>
</clickhouse>
```

### 特性标志 {#feature-flags}

Keeper 与 ZooKeeper 及其客户端完全兼容,但它也引入了一些可供 ClickHouse 客户端使用的独特特性和请求类型。
由于这些特性可能引入向后不兼容的变更,大多数特性默认处于禁用状态,可以通过 `keeper_server.feature_flags` 配置启用。
所有特性都可以显式禁用。
如果您想为 Keeper 集群启用新特性,我们建议您首先将集群中的所有 Keeper 实例更新到支持该特性的版本,然后再启用该特性。

禁用 `multi_read` 并启用 `check_not_exists` 的特性标志配置示例:

```xml
<clickhouse>
    <keeper_server>
        <feature_flags>
            <multi_read>0</multi_read>
            <check_not_exists>1</check_not_exists>
        </feature_flags>
    </keeper_server>
</clickhouse>
```

以下特性可用:

| 特性                   | 描述                                                                                                                                                     | 默认值  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `multi_read`           | 支持批量读取请求                                                                                                                                         | `1`     |
| `filtered_list`        | 支持按节点类型（临时或持久）过滤结果的列表请求                                                                                                           | `1`     |
| `check_not_exists`     | 支持 `CheckNotExists` 请求,用于断言节点不存在                                                                                                            | `1`     |
| `create_if_not_exists` | 支持 `CreateIfNotExists` 请求,如果节点不存在则尝试创建。如果节点已存在,则不应用任何更改并返回 `ZOK`                                                     | `1`     |
| `remove_recursive`     | 支持 `RemoveRecursive` 请求,递归删除节点及其子树                                                                                                         | `1`     |

:::note
从 25.7 版本开始,部分特性标志默认启用。  
将 Keeper 升级到 25.7+ 的推荐方式是先升级到 24.9+ 版本。
:::


### 从 ZooKeeper 迁移 {#migration-from-zookeeper}

无法实现从 ZooKeeper 到 ClickHouse Keeper 的无缝迁移。您必须停止 ZooKeeper 集群,转换数据,然后启动 ClickHouse Keeper。`clickhouse-keeper-converter` 工具可将 ZooKeeper 日志和快照转换为 ClickHouse Keeper 快照。该工具仅支持 ZooKeeper > 3.4 版本。迁移步骤如下:

1. 停止所有 ZooKeeper 节点。

2. 可选但建议执行:找到 ZooKeeper leader 节点,启动后再停止。这将强制 ZooKeeper 创建一致性快照。

3. 在 leader 节点上运行 `clickhouse-keeper-converter`,例如:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 将快照复制到已配置 `keeper` 的 ClickHouse 服务器节点,或启动 ClickHouse Keeper 以替代 ZooKeeper。快照必须在所有节点上持久化,否则空节点可能会更快完成初始化,其中一个可能成为 leader。

:::note
`keeper-converter` 工具在 Keeper 独立二进制文件中不可用。
如果您已安装 ClickHouse,可以直接使用该二进制文件:

```bash
clickhouse keeper-converter ...
```

否则,您可以[下载二进制文件](/getting-started/quick-start/oss#download-the-binary)并按上述说明运行该工具,无需安装 ClickHouse。
:::

### 失去法定人数后的恢复 {#recovering-after-losing-quorum}

由于 ClickHouse Keeper 使用 Raft 协议,它可以容忍一定数量的节点崩溃,具体取决于集群规模。\
例如,对于 3 节点集群,如果只有 1 个节点崩溃,它将继续正常工作。

集群配置可以动态调整,但存在一些限制。重新配置也依赖于 Raft,
因此要在集群中添加/删除节点,您需要满足法定人数要求。如果您同时丢失集群中过多节点且无法
再次启动它们,Raft 将停止工作,并且不允许您使用常规方式重新配置集群。

尽管如此,ClickHouse Keeper 提供了恢复模式,允许您仅使用 1 个节点强制重新配置集群。
这应该仅作为最后手段使用,即当您无法再次启动节点或在同一端点上启动新实例时。

继续之前需要注意的重要事项:

- 确保故障节点无法再次连接到集群。
- 在步骤中明确指定之前,不要启动任何新节点。

在确保上述事项无误后,您需要执行以下操作:

1. 选择单个 Keeper 节点作为新的 leader。请注意,该节点的数据将用于整个集群,因此我们建议使用状态最新的节点。
2. 在执行任何其他操作之前,备份所选节点的 `log_storage_path` 和 `snapshot_storage_path` 文件夹。
3. 在您要使用的所有节点上重新配置集群。
4. 向您选择的节点发送四字母命令 `rcvr`,这将使节点进入恢复模式,或者停止所选节点上的 Keeper 实例并使用 `--force-recovery` 参数重新启动。
5. 逐个在新节点上启动 Keeper 实例,确保在启动下一个节点之前 `mntr` 命令为 `zk_server_state` 返回 `follower`。
6. 在恢复模式下,leader 节点将为 `mntr` 命令返回错误消息,直到它与新节点达成法定人数,并拒绝来自客户端和 follower 的任何请求。
7. 达成法定人数后,leader 节点将返回正常操作模式,使用 Raft 接受所有请求——使用 `mntr` 验证,此时 `zk_server_state` 应返回 `leader`。


## 在 Keeper 中使用磁盘 {#using-disks-with-keeper}

Keeper 支持 [外部磁盘](/operations/storing-data.md) 的子集,用于存储快照、日志文件和状态文件。

支持的磁盘类型有:

- s3_plain
- s3
- local

以下是配置文件中磁盘定义的示例。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <log_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/logs/</path>
            </log_local>
            <log_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/logs/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </log_s3_plain>
            <snapshot_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/snapshots/</path>
            </snapshot_local>
            <snapshot_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/snapshots/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </snapshot_s3_plain>
            <state_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/state/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </state_s3_plain>
        </disks>
    </storage_configuration>
</clickhouse>
```

要使用磁盘存储日志,需要将 `keeper_server.log_storage_disk` 配置设置为磁盘名称。
要使用磁盘存储快照,需要将 `keeper_server.snapshot_storage_disk` 配置设置为磁盘名称。
此外,可以分别通过 `keeper_server.latest_log_storage_disk` 和 `keeper_server.latest_snapshot_storage_disk` 为最新的日志或快照使用不同的磁盘。
在这种情况下,当创建新的日志或快照时,Keeper 会自动将文件移动到相应的磁盘。
要使用磁盘存储状态文件,需要将 `keeper_server.state_storage_disk` 配置设置为磁盘名称。

在磁盘之间移动文件是安全的,即使 Keeper 在传输过程中停止,也不会有数据丢失的风险。
在文件完全移动到新磁盘之前,旧磁盘上的文件不会被删除。

当 `keeper_server.coordination_settings.force_sync` 设置为 `true`(默认值为 `true`)时,Keeper 无法为所有类型的磁盘提供某些保证。
目前,只有 `local` 类型的磁盘支持持久化同步。
如果使用 `force_sync`,且未使用 `latest_log_storage_disk`,则 `log_storage_disk` 必须是 `local` 磁盘。
如果使用 `latest_log_storage_disk`,则它必须始终是 `local` 磁盘。
如果禁用 `force_sync`,则可以在任何配置中使用所有类型的磁盘。

Keeper 实例的一个可能的存储配置如下:

```xml
<clickhouse>
    <keeper_server>
        <log_storage_disk>log_s3_plain</log_storage_disk>
        <latest_log_storage_disk>log_local</latest_log_storage_disk>

        <snapshot_storage_disk>snapshot_s3_plain</snapshot_storage_disk>
        <latest_snapshot_storage_disk>snapshot_local</latest_snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

此实例会将除最新日志之外的所有日志存储在 `log_s3_plain` 磁盘上,而最新日志将存储在 `log_local` 磁盘上。
快照也采用相同的逻辑,除最新快照之外的所有快照将存储在 `snapshot_s3_plain` 上,而最新快照将存储在 `snapshot_local` 磁盘上。

### 更改磁盘配置 {#changing-disk-setup}

:::important
在应用新的磁盘配置之前,请手动备份所有 Keeper 日志和快照。
:::

如果定义了分层磁盘配置(为最新文件使用单独的磁盘),Keeper 会在启动时尝试自动将文件移动到正确的磁盘。
与之前相同的保证仍然适用:在文件完全移动到新磁盘之前,旧磁盘上的文件不会被删除,因此可以安全地进行多次重启。

如果需要将文件移动到全新的磁盘(或从双磁盘配置迁移到单磁盘配置),可以使用 `keeper_server.old_snapshot_storage_disk` 和 `keeper_server.old_log_storage_disk` 的多个定义。

以下配置展示了如何从之前的双磁盘配置迁移到全新的单磁盘配置:


```xml
<clickhouse>
    <keeper_server>
        <old_log_storage_disk>log_local</old_log_storage_disk>
        <old_log_storage_disk>log_s3_plain</old_log_storage_disk>
        <log_storage_disk>log_local2</log_storage_disk>

        <old_snapshot_storage_disk>snapshot_s3_plain</old_snapshot_storage_disk>
        <old_snapshot_storage_disk>snapshot_local</old_snapshot_storage_disk>
        <snapshot_storage_disk>snapshot_local2</snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

在启动时，所有日志文件都会从 `log_local` 和 `log_s3_plain` 磁盘移动到 `log_local2` 磁盘。
同时，所有快照文件都会从 `snapshot_local` 和 `snapshot_s3_plain` 磁盘移动到 `snapshot_local2` 磁盘。


## 配置日志缓存 {#configuring-logs-cache}

为了最小化从磁盘读取的数据量,Keeper 会在内存中缓存日志条目。
如果请求较大,日志条目将占用过多内存,因此会对缓存的日志数量进行限制。
该限制由以下两个配置项控制:

- `latest_logs_cache_size_threshold` - 缓存中存储的最新日志的总大小
- `commit_logs_cache_size_threshold` - 下一步需要提交的后续日志的总大小

如果默认值过大,可以通过减小这两个配置项来降低内存使用量。

:::note
您可以使用 `pfev` 命令检查从各个缓存和文件中读取的日志数量。
您还可以使用 Prometheus 端点的指标来跟踪这两个缓存的当前大小。
:::


## Prometheus {#prometheus}

Keeper 可以公开指标数据供 [Prometheus](https://prometheus.io) 抓取。

配置项:

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。必须以 '/' 开头。
- `port` – `endpoint` 的端口号。
- `metrics` – 是否公开 [system.metrics](/operations/system-tables/metrics) 表中的指标。
- `events` – 是否公开 [system.events](/operations/system-tables/events) 表中的指标。
- `asynchronous_metrics` – 是否公开 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中的当前指标值。

**示例**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

检查(将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名):

```bash
curl 127.0.0.1:9363/metrics
```

另请参阅 ClickHouse Cloud [Prometheus 集成](/integrations/prometheus)。


## ClickHouse Keeper 用户指南 {#clickhouse-keeper-user-guide}

本指南提供了配置 ClickHouse Keeper 的简单最小化设置,并通过示例演示如何测试分布式操作。本示例在 Linux 上使用 3 个节点进行演示。

### 1. 配置节点的 Keeper 设置 {#1-configure-nodes-with-keeper-settings}

1. 在 3 台主机(`chnode1`、`chnode2`、`chnode3`)上安装 3 个 ClickHouse 实例。(有关安装 ClickHouse 的详细信息,请参阅[快速入门](/getting-started/install/install.mdx)。)

2. 在每个节点上,添加以下配置项以允许通过网络接口进行外部通信。

   ```xml
   <listen_host>0.0.0.0</listen_host>
   ```

3. 将以下 ClickHouse Keeper 配置添加到所有三台服务器,并为每台服务器更新 `<server_id>` 设置;`chnode1` 为 `1`,`chnode2` 为 `2`,依此类推。

   ```xml
   <keeper_server>
       <tcp_port>9181</tcp_port>
       <server_id>1</server_id>
       <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
       <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

       <coordination_settings>
           <operation_timeout_ms>10000</operation_timeout_ms>
           <session_timeout_ms>30000</session_timeout_ms>
           <raft_logs_level>warning</raft_logs_level>
       </coordination_settings>

       <raft_configuration>
           <server>
               <id>1</id>
               <hostname>chnode1.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>2</id>
               <hostname>chnode2.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>3</id>
               <hostname>chnode3.domain.com</hostname>
               <port>9234</port>
           </server>
       </raft_configuration>
   </keeper_server>
   ```

   以下是上述使用的基本设置:

   | 参数                  | 描述                                                                    | 示例                                            |
   | --------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
   | tcp_port              | keeper 客户端使用的端口                                                  | 9181 默认值,相当于 zookeeper 中的 2181           |
   | server_id             | raft 配置中每个 ClickHouse Keeper 服务器的标识符                         | 1                                               |
   | coordination_settings | 超时等参数的配置段                                                       | timeouts: 10000, log level: trace               |
   | server                | 参与集群的服务器定义                                                     | 每个服务器定义的列表                             |
   | raft_configuration    | keeper 集群中每个服务器的配置                                            | 每个服务器及其配置                               |
   | id                    | keeper 服务的服务器数字标识                                              | 1                                               |
   | hostname              | keeper 集群中每个服务器的主机名、IP 或 FQDN                              | `chnode1.domain.com`                            |
   | port                  | 用于服务器间 keeper 连接的监听端口                                        | 9234                                            |

4. 启用 Zookeeper 组件。它将使用 ClickHouse Keeper 引擎:

   ```xml
       <zookeeper>
           <node>
               <host>chnode1.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode2.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode3.domain.com</host>
               <port>9181</port>
           </node>
       </zookeeper>
   ```

   以下是上述使用的基本设置:

   | 参数      | 描述                                                | 示例                           |
   | --------- | --------------------------------------------------- | ------------------------------ |
   | node      | ClickHouse Keeper 连接的节点列表                     | 每个服务器的配置条目            |
   | host      | 每个 ClickHouse keeper 节点的主机名、IP 或 FQDN      | `chnode1.domain.com`           |
   | port      | ClickHouse Keeper 客户端端口                        | 9181                           |

5. 重启 ClickHouse 并验证每个 Keeper 实例是否正在运行。在每台服务器上执行以下命令。如果 Keeper 正在运行且状态健康,`ruok` 命令将返回 `imok`:

   ```bash
   # echo ruok | nc localhost 9181; echo
   imok
   ```

6. `system` 数据库中有一个名为 `zookeeper` 的表,其中包含 ClickHouse Keeper 实例的详细信息。让我们查看该表:
   ```sql
   SELECT *
   FROM system.zookeeper
   WHERE path IN ('/', '/clickhouse')
   ```


    表格如下所示：
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```

### 2. 在 ClickHouse 中配置集群 {#2--configure-a-cluster-in-clickhouse}

1. 配置一个简单的集群,在 2 个节点上使用 2 个分片,每个分片仅有一个副本。第三个节点将用于满足 ClickHouse Keeper 的仲裁要求。更新 `chnode1` 和 `chnode2` 上的配置。以下集群配置在每个节点上定义 1 个分片,总共 2 个分片且无副本。在此示例中,部分数据将位于一个节点上,部分数据将位于另一个节点上:

   ```xml
       <remote_servers>
           <cluster_2S_1R>
               <shard>
                   <replica>
                       <host>chnode1.domain.com</host>
                       <port>9000</port>
                       <user>default</user>
                       <password>ClickHouse123!</password>
                   </replica>
               </shard>
               <shard>
                   <replica>
                       <host>chnode2.domain.com</host>
                       <port>9000</port>
                       <user>default</user>
                       <password>ClickHouse123!</password>
                   </replica>
               </shard>
           </cluster_2S_1R>
       </remote_servers>
   ```

   | 参数 | 描述                                                            | 示例                           |
   | --------- | ---------------------------------------------------------------------- | --------------------------------- |
   | shard     | 集群定义中的副本列表                             | 每个分片的副本列表   |
   | replica   | 每个副本的设置列表                                      | 每个副本的设置条目 |
   | host      | 托管副本分片的服务器主机名、IP 或 FQDN          | `chnode1.domain.com`              |
   | port      | 使用原生 TCP 协议通信的端口                 | 9000                              |
   | user      | 用于集群实例身份验证的用户名    | default                           |
   | password  | 用于允许连接到集群实例的用户密码 | `ClickHouse123!`                  |

2. 重启 ClickHouse 并验证集群已创建:

   ```bash
   SHOW clusters;
   ```

   您应该看到您的集群:

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. 创建并测试分布式表 {#3-create-and-test-distributed-table}

1.  在 `chnode1` 上使用 ClickHouse 客户端在新集群上创建新数据库。`ON CLUSTER` 子句会自动在两个节点上创建数据库。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```


2. 在 `db1` 数据库中创建一个新表。同样，`ON CLUSTER` 会在两个节点上创建该表。

   ```sql
   CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
   (
       `id` UInt64,
       `column1` String
   )
   ENGINE = MergeTree
   ORDER BY column1
   ```

3. 在 `chnode1` 节点上插入几行数据：

   ```sql
   INSERT INTO db1.table1
       (id, column1)
   VALUES
       (1, 'abc'),
       (2, 'def')
   ```

4. 在 `chnode2` 节点上插入几行数据：

   ```sql
   INSERT INTO db1.table1
       (id, column1)
   VALUES
       (3, 'ghi'),
       (4, 'jkl')
   ```

5. 注意，在每个节点上执行 `SELECT` 语句只会显示该节点上的数据。例如，在 `chnode1` 上：

   ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

   ┌─id─┬─column1─┐
   │  1 │ abc     │
   │  2 │ def     │
   └────┴─────────┘

   2 rows in set. Elapsed: 0.006 sec.
   ```

   在 `chnode2` 上：

6. ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

   ┌─id─┬─column1─┐
   │  3 │ ghi     │
   │  4 │ jkl     │
   └────┴─────────┘
   ```

7. 您可以创建一个 `Distributed` 表来表示两个分片上的数据。使用 `Distributed` 表引擎的表本身不存储任何数据，但允许在多个服务器上进行分布式查询处理。读取操作会命中所有分片，写入操作可以分布到各个分片。在 `chnode1` 上执行以下查询：

   ```sql
   CREATE TABLE db1.dist_table (
       id UInt64,
       column1 String
   )
   ENGINE = Distributed(cluster_2S_1R,db1,table1)
   ```

8. 注意，查询 `dist_table` 会返回来自两个分片的全部四行数据：

   ```sql
   SELECT *
   FROM db1.dist_table
   ```

   ```response
   Query id: 495bffa0-f849-4a0c-aeea-d7115a54747a

   ┌─id─┬─column1─┐
   │  1 │ abc     │
   │  2 │ def     │
   └────┴─────────┘
   ┌─id─┬─column1─┐
   │  3 │ ghi     │
   │  4 │ jkl     │
   └────┴─────────┘

   4 rows in set. Elapsed: 0.018 sec.
   ```

### 总结 {#summary}

本指南演示了如何使用 ClickHouse Keeper 设置集群。通过 ClickHouse Keeper，您可以配置集群并定义可在分片之间复制的分布式表。


## 使用唯一路径配置 ClickHouse Keeper {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 描述 {#description}

本文介绍如何使用内置的 `{uuid}` 宏设置在 ClickHouse Keeper 或 ZooKeeper 中创建唯一条目。在频繁创建和删除表时,唯一路径非常有用,因为每次创建路径时都会使用新的 `uuid`,路径永不重用,从而避免了等待数分钟让 Keeper 垃圾回收删除路径条目的情况。

### 示例环境 {#example-environment}

一个三节点集群,所有三个节点上都配置了 ClickHouse Keeper,其中两个节点上配置了 ClickHouse。这为 ClickHouse Keeper 提供了三个节点(包括一个仲裁节点),以及一个由两个副本组成的单分片 ClickHouse 集群。

| 节点                    | 描述                         |
| ----------------------- | ----------------------------------- |
| `chnode1.marsnet.local` | 数据节点 - 集群 `cluster_1S_2R` |
| `chnode2.marsnet.local` | 数据节点 - 集群 `cluster_1S_2R` |
| `chnode3.marsnet.local` | ClickHouse Keeper 仲裁节点  |

集群配置示例:

```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
```

### 设置表以使用 `{uuid}` 的步骤 {#procedures-to-set-up-tables-to-use-uuid}

1. 在每个服务器上配置宏
   服务器 1 的示例:

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
请注意,我们为 `shard` 和 `replica` 定义了宏,但 `{uuid}` 无需在此定义,它是内置的。
:::

2. 创建数据库

```sql
CREATE DATABASE db_uuid
      ON CLUSTER 'cluster_1S_2R'
      ENGINE Atomic;
```

```response
CREATE DATABASE db_uuid ON CLUSTER cluster_1S_2R
ENGINE = Atomic

Query id: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. 使用宏和 `{uuid}` 在集群上创建表

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}' )
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Query id: 8f542664-4548-4a02-bd2a-6f2c973d0dc4

```


┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │ 0 │ │ 1 │ 0 │
│ chnode2.marsnet.local │ 9440 │ 0 │ │ 0 │ 0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

````

4.  创建分布式表

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
````

```response
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1')

Query id: 3bc7f339-ab74-4c7d-a752-1ffe54219c0e

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

### 测试 {#testing}

1.  向第一个节点插入数据(例如 `chnode1`)

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

2. 向第二个节点插入数据(例如 `chnode2`)

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

3. 使用分布式表查看记录

```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

Query id: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.007 sec.
```

### 替代方案 {#alternatives}

可以通过宏预先定义默认复制路径,同时使用 `{uuid}`

1. 在每个节点上设置表的默认值

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
如果节点用于特定数据库,您还可以在每个节点上定义宏 `{database}`。
:::

2. 创建表时不指定显式参数:

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

```


查询 ID: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │ 0 │ │ 1 │ 0 │
│ chnode1.marsnet.local │ 9440 │ 0 │ │ 0 │ 0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

返回 2 行。用时:1.175 秒。

````

3. 验证是否使用了默认配置中的设置
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
````

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

返回 1 行。用时:0.003 秒。
```

### 故障排查 {#troubleshooting}

获取表信息和 UUID 的示例命令:

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

获取上述表在 ZooKeeper 中包含 UUID 信息的示例命令

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
数据库必须是 `Atomic` 类型。如果从旧版本升级,
`default` 数据库可能是 `Ordinary` 类型。
:::

检查方法:

例如:

```sql
SELECT name, engine FROM system.databases WHERE name = 'db_uuid';
```

```response
SELECT
    name,
    engine
FROM system.databases
WHERE name = 'db_uuid'

Query id: b047d459-a1d2-4016-bcf9-3e97e30e49c2

┌─name────┬─engine─┐
│ db_uuid │ Atomic │
└─────────┴────────┘

返回 1 行。用时:0.004 秒。
```


## ClickHouse Keeper 动态重新配置 {#reconfiguration}

<SelfManaged />

### 描述 {#description-1}

如果启用了 `keeper_server.enable_reconfiguration` 配置项,ClickHouse Keeper 部分支持 ZooKeeper 的 [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) 命令,用于动态集群重新配置。

:::note
如果该配置项未启用,您可以通过手动修改副本的 `raft_configuration` 配置段来重新配置集群。请确保在所有副本上编辑配置文件,因为只有 leader 节点会应用配置变更。或者,您也可以通过任何兼容 ZooKeeper 的客户端发送 `reconfig` 查询。
:::

虚拟节点 `/keeper/config` 包含最后提交的集群配置,格式如下:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 每个服务器条目由换行符分隔。
- `server_type` 可以是 `participant` 或 `learner`([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) 不参与 leader 选举)。
- `server_priority` 是一个非负整数,用于指定[哪些节点在 leader 选举中应被优先考虑](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)。
  优先级为 0 表示该服务器永远不会成为 leader。

示例:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

您可以使用 `reconfig` 命令添加新服务器、删除现有服务器以及更改现有服务器的优先级,以下是示例(使用 `clickhouse-keeper-client`):


```bash
# 添加两台新服务器
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# 移除另外两台服务器
reconfig remove "3,4"
# 将现有服务器的优先级更改为 8
reconfig add "server.5=localhost:5123;participant;8"
```

以下是 `kazoo` 的示例：


```python
# 添加两个新服务器，移除另外两个服务器
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```


# 将现有服务器优先级更改为 8

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

`joining` 中的服务器应采用上述服务器格式。服务器条目之间应使用逗号分隔。
添加新服务器时,可以省略 `server_priority`(默认值为 1)和 `server_type`(默认值为 `participant`)。

如果要更改现有服务器的优先级,请将其添加到 `joining` 中并指定目标优先级。
服务器主机、端口和类型必须与现有服务器配置一致。

服务器按照在 `joining` 和 `leaving` 中出现的顺序进行添加和删除。
来自 `joining` 的所有更新会在来自 `leaving` 的更新之前处理。

Keeper 重新配置实现中存在一些限制:

- 仅支持增量重新配置。包含非空 `new_members` 的请求将被拒绝。

  ClickHouse Keeper 实现依赖 NuRaft API 来动态更改成员关系。NuRaft 每次只能添加或删除单个服务器。这意味着每次配置更改(`joining` 的每个部分、`leaving` 的每个部分)都必须单独处理。因此不提供批量重新配置功能,以免对最终用户造成误导。

  更改服务器类型(participant/learner)也不可行,因为 NuRaft 不支持此功能,唯一的方法是先删除再添加服务器,这同样会造成误导。

- 无法使用返回的 `znodestat` 值。
- `from_version` 字段未被使用。所有设置了 `from_version` 的请求都将被拒绝。
  这是因为 `/keeper/config` 是一个虚拟节点,它不存储在持久化存储中,而是针对每个请求使用指定的节点配置动态生成。
  做出此决定是为了避免数据重复,因为 NuRaft 已经存储了此配置。
- 与 ZooKeeper 不同,无法通过提交 `sync` 命令来等待集群重新配置完成。
  新配置将_最终_应用,但无法保证具体时间。
- `reconfig` 命令可能因各种原因而失败。您可以检查集群状态以确认更新是否已应用。
```


## 将单节点 Keeper 转换为集群 {#converting-a-single-node-keeper-into-a-cluster}

有时需要将单个 Keeper 节点扩展为集群。以下是针对 3 节点集群的分步操作方案:

- **重要提示**: 新节点必须以小于当前法定人数的批次添加,否则它们会在彼此之间选举领导者。在本示例中采用逐个添加的方式。
- 现有的 Keeper 节点必须启用 `keeper_server.enable_reconfiguration` 配置参数。
- 使用 Keeper 集群的完整新配置启动第二个节点。
- 启动后,使用 [`reconfig`](#reconfiguration) 将其添加到节点 1。
- 现在,启动第三个节点并使用 [`reconfig`](#reconfiguration) 添加它。
- 在 `clickhouse-server` 配置中添加新的 Keeper 节点来更新配置,并重启以应用更改。
- 更新节点 1 的 Raft 配置,并可选择性地重启它。

为了熟悉该流程,这里提供了一个[沙箱仓库](https://github.com/ClickHouse/keeper-extend-cluster)。


## 不支持的功能 {#unsupported-features}

虽然 ClickHouse Keeper 旨在与 ZooKeeper 完全兼容,但目前仍有一些功能尚未实现(尽管开发工作正在进行中):

- [`create`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)>) 不支持返回 `Stat` 对象
- [`create`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)>) 不支持 [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)>) 不支持 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) 监视器
- 不支持 [`removeWatch`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)>) 和 [`removeAllWatches`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)>)
- 不支持 `setWatches`
- 不支持创建 [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 类型的 znode
- 不支持 [`SASL 认证`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)
