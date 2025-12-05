---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: '配置 ClickHouse Keeper'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（clickhouse-keeper）用于替代 ZooKeeper，并提供复制与协调能力。'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---



# ClickHouse Keeper (clickhouse-keeper) {#clickhouse-keeper-clickhouse-keeper}

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper 作为数据[复制](/engines/table-engines/mergetree-family/replication.md)和[分布式 DDL](/sql-reference/distributed-ddl.md) 查询执行的协调系统。ClickHouse Keeper 与 ZooKeeper 兼容。

### 实现细节 {#implementation-details}

ZooKeeper 是最早、最知名的开源协调系统之一。它由 Java 编写，具有相对简单而强大的数据模型。ZooKeeper 的协调算法 ZooKeeper Atomic Broadcast (ZAB) 不为读操作提供线性一致性保证，因为每个 ZooKeeper 节点本地提供读服务。与 ZooKeeper 不同，ClickHouse Keeper 使用 C++ 编写，并采用 [RAFT 算法](https://raft.github.io/) 的[实现](https://github.com/eBay/NuRaft)。该算法允许对读写操作提供线性一致性，并且在不同语言中有多个开源实现。

默认情况下，ClickHouse Keeper 提供与 ZooKeeper 相同的保证：线性一致的写入和非线性一致的读取。它具有兼容的客户端-服务器协议，因此可以使用任何标准 ZooKeeper 客户端与 ClickHouse Keeper 交互。快照和日志的格式与 ZooKeeper 不兼容，但可以使用 `clickhouse-keeper-converter` 工具将 ZooKeeper 数据转换为 ClickHouse Keeper 快照。ClickHouse Keeper 中的服务器间协议同样与 ZooKeeper 不兼容，因此无法构建混合的 ZooKeeper / ClickHouse Keeper 集群。

ClickHouse Keeper 以与 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) 相同的方式支持访问控制列表 (ACL)。ClickHouse Keeper 支持相同的权限集合，并具有完全相同的内置方案：`world`、`auth` 和 `digest`。`digest` 认证方案使用 `username:password` 对，密码以 Base64 编码。

:::note
不支持外部集成。
:::

### 配置 {#configuration}

ClickHouse Keeper 可以作为 ZooKeeper 的独立替代品使用，也可以作为 ClickHouse 服务器的内部组件使用。在这两种情况下，配置几乎相同，均使用 `.xml` 文件。

#### Keeper 配置设置 {#keeper-configuration-settings}

ClickHouse Keeper 的主要配置标签是 `<keeper_server>`，并具有以下参数：


| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | 客户端连接使用的端口。                                                                                                                                                                                                                              | `2181`                                                                                                       |
| `tcp_port_secure`                    | 客户端与 keeper-server 之间进行 SSL 连接所使用的安全端口。                                                                                                                                                                                          | -                                                                                                            |
| `server_id`                          | 唯一的服务器 ID，ClickHouse Keeper 集群中的每个参与节点必须具有唯一编号（1、2、3，依此类推）。                                                                                                                                                      | -                                                                                                            |
| `log_storage_path`                   | 协调日志的存储路径，与 ZooKeeper 一样，最好将日志存储在不繁忙的节点上。                                                                                                                                                                             | -                                                                                                            |
| `snapshot_storage_path`              | 协调快照的存储路径。                                                                                                                                                                                                                                | -                                                                                                            |
| `enable_reconfiguration`             | 通过 [`reconfig`](#reconfiguration) 启用集群动态重配置。                                                                                                                                                                                            | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeper 最大内存占用的软限制（字节）。                                                                                                                                                                                                               | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | 如果未设置 `max_memory_usage_soft_limit` 或将其设置为 0，则使用该值来定义默认软限制。                                                                                                                                                               | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | 如果未设置 `max_memory_usage_soft_limit` 或将其设置为 `0`，则使用该间隔来观察物理内存大小。一旦内存大小发生变化，将根据 `max_memory_usage_soft_limit_ratio` 重新计算 Keeper 的内存软限制。                                                        | `15`                                                                                                         |
| `http_control`                       | [HTTP control](#http-control) 接口的配置。                                                                                                                                                                                                          | -                                                                                                            |
| `digest_enabled`                     | 启用实时数据一致性检查。                                                                                                                                                                                                                            | `True`                                                                                                       |
| `create_snapshot_on_exit`            | 在关闭时创建快照。                                                                                                                                                                                                                                  | -                                                                                                            |
| `hostname_checks_enabled`            | 为集群配置启用主机名有效性检查（例如，当 localhost 与远程端点一起使用时）。                                                                                                                                                                        | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw 命令白名单。                                                                                                                                                                                                                                    | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| 启用 IPv6 | `True`|

其他常用参数继承自 ClickHouse 服务器配置（`listen_host`、`logger` 等）。

#### 内部协调设置 {#internal-coordination-settings}

内部协调设置位于 `<keeper_server>.<coordination_settings>` 部分，并具有以下参数：



| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 单个客户端操作的超时时间（毫秒）                                                                                                                                                                                          | `10000`                                                                                                      |
| `min_session_timeout_ms`           | 客户端会话的最小超时时间（毫秒）                                                                                                                                                                                          | `10000`                                                                                                      |
| `session_timeout_ms`               | 客户端会话的最大超时时间（毫秒）                                                                                                                                                                                          | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper 检查失效会话并将其移除的频率（毫秒）                                                                                                                                                                   | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper leader 向 follower 发送心跳的频率（毫秒）                                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | 如果 follower 在该时间间隔内未收到来自 leader 的心跳，则可以发起 leader 选举。必须小于或等于 `election_timeout_upper_bound_ms`。理想情况下这两个值不应相等。                                                             | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | 如果 follower 在该时间间隔内未收到来自 leader 的心跳，则必须发起 leader 选举。                                                                                                                                            | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 单个文件中要存储的日志记录条数。                                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | 在压缩之前要保留的协调日志记录条数。                                                                                                                                                                                      | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper 创建新快照的频率（按日志中的记录条数计）。                                                                                                                                                             | `100000`                                                                                                     |
| `snapshots_to_keep`                | 要保留的快照数量。                                                                                                                                                                                                        | `3`                                                                                                          |
| `stale_log_gap`                    | leader 将 follower 视为已过时、并向其发送快照而非追加日志时使用的阈值。                                                                                                                                                    | `10000`                                                                                                      |
| `fresh_log_gap`                    | 节点被视为“最新”时的阈值。                                                                                                                                                                                                | `200`                                                                                                        |
| `max_requests_batch_size`          | 发送到 RAFT 之前，请求批次中包含的最大请求数量。                                                                                                                                                                         | `100`                                                                                                        |
| `force_sync`                       | 在每次写入协调日志时调用 `fsync`。                                                                                                                                                                                        | `true`                                                                                                       |
| `quorum_reads`                     | 将读请求按写请求方式，通过完整 RAFT 共识执行，具有类似的延迟。                                                                                                                                                            | `false`                                                                                                      |
| `raft_logs_level`                  | 与协调相关的文本日志级别（trace、debug 等）。                                                                                                                                                                            | `system default`                                                                                             |
| `auto_forwarding`                  | 允许将 follower 上的写请求转发到 leader。                                                                                                                                                                                | `true`                                                                                                       |
| `shutdown_timeout`                 | 等待内部连接结束并关闭的时间（毫秒）。                                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | 如果服务器在指定超时时间内未与其他 quorum 成员建立连接，则会终止（毫秒）。                                                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | 启用异步复制。在保持所有写入和读取语义保证的同时提升性能。该设置默认关闭，以避免破坏向后兼容性。                                                                                                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新日志条目的内存缓存的最大总大小                                                                                                                                                                                       | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | 提交下一步所需日志条目的内存缓存的最大总大小                                                                                                                                                                             | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | 在磁盘之间移动文件时发生故障后，两次重试之间的等待时间（毫秒）                                                                                                                                                           | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 在初始化期间，在磁盘之间移动文件时发生故障后的最大重试次数                                                                                                                                                               | `100`                                                                                                        |
| `experimental_use_rocksdb`         | 使用 RocksDB 作为后端存储                                                                                                                                                                                                 | `0`                                                                                                          |

Quorum 配置位于 `<keeper_server>.<raft_configuration>` 部分，包含服务器的相关描述。

整个 quorum 的唯一参数是 `secure`，用于为 quorum 成员之间的通信启用加密连接。如果节点之间的内部通信需要 SSL 连接，可以将该参数设置为 `true`，否则可以不设置。

每个 `<server>` 的主要参数为：



* `id` — 仲裁中的服务器标识符。
* `hostname` — 部署该服务器的主机名。
* `port` — 该服务器监听连接的端口。
* `can_become_leader` — 设为 `false` 以将服务器配置为 `learner`。如果省略，则值为 `true`。

:::note
如果你的 ClickHouse Keeper 集群拓扑发生变化（例如替换服务器），请务必保持 `server_id` 与 `hostname` 的映射关系一致，避免打乱现有 `server_id` 的顺序，或在不同服务器之间复用同一个 `server_id`（如果你依赖自动化脚本部署 ClickHouse Keeper，就有可能发生这种情况）。

如果 Keeper 实例所在的主机可能发生变化，我们建议定义并使用主机名而不是裸 IP 地址。更改主机名等同于移除服务器并重新加入，在某些情况下这可能无法完成（例如 Keeper 实例不足以组成仲裁）。
:::

:::note
为避免破坏向后兼容性，`async_replication` 默认是禁用的。如果你集群中的所有 Keeper 实例都运行在支持 `async_replication` 的版本（v23.9+）上，我们建议启用它，因为在没有任何负面影响的情况下，它可以提升性能。
:::

由三个节点组成仲裁的配置示例可以在带有 `test_keeper_` 前缀的[集成测试](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)中找到。服务器 #1 的示例配置如下：

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

ClickHouse Keeper 已包含在 ClickHouse server 软件包中，只需在 `/etc/your_path_to_config/clickhouse-server/config.xml` 中添加 `<keeper_server>` 的配置，然后像往常一样启动 ClickHouse server 即可。如果你想以独立模式运行 ClickHouse Keeper，可以采用类似的方式启动它：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

如果没有该符号链接（`clickhouse-keeper`），可以创建它，或者将 `keeper` 指定为 `clickhouse` 的参数：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 四字母命令 {#four-letter-word-commands}

ClickHouse Keeper 也提供了 4lw 命令，与 Zookeeper 几乎相同。每个命令由四个字母组成，例如 `mntr`、`stat` 等。其中有一些更实用的命令：`stat` 提供有关服务器和已连接客户端的一些通用信息，而 `srvr` 和 `cons` 则分别提供关于服务器和连接的详细信息。

4lw 命令有一个白名单配置项 `four_letter_word_white_list`，其默认值为 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`。

你可以在客户端端口通过 telnet 或 nc 向 ClickHouse Keeper 发送这些命令。

```bash
echo mntr | nc localhost 9181
```

下面是详细的 4lw 命令：

* `ruok`：用于测试服务器是否在无错误状态下运行。如果服务器正在运行，它会返回 `imok`；否则将完全没有响应。返回 `imok` 并不一定表示该服务器已经加入 quorum，只能说明服务器进程处于活动状态并已绑定到指定的客户端端口。请使用 `stat` 获取关于 quorum 状态以及客户端连接信息的详细情况。

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

* `srvr`: 显示服务器的所有详细信息。

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Latency min/avg/max: 0/0/0
Received: 2
Sent : 2
Connections: 1
Outstanding: 0
Zxid: 34
Mode: leader
Node count: 4
```

* `stat`: 列出服务器和已连接客户端的简要状态信息。

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Clients:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
Latency min/avg/max: 0/0/0
Received: 4
Sent : 4
Connections: 1
Outstanding: 0
Zxid: 36
Mode: leader
Node count: 4
```

* `srst`: 重置服务器统计信息。该命令会影响 `srvr`、`mntr` 和 `stat` 的输出结果。

```response
Server stats reset.
```

* `conf`: 打印服务配置的详细信息。

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

* `cons`: 列出所有已连接到此服务器的客户端的完整连接/会话详细信息。包括已接收/已发送数据包数量、会话 ID、操作延迟、最近执行的操作等信息。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: 重置所有连接的连接及会话统计数据。

```response
Connection stats reset.
```

* `envi`: 打印运行环境的详细信息


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

* `dirs`: 以字节为单位显示快照和日志文件的总大小

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: 用于检查服务器是否在只读模式下运行。如果处于只读模式，服务器会返回 `ro`，否则返回 `rw`。

```response
rw
```

* `wchs`: 列出该服务器上所有监视（watch）的简要信息。

```response
1 connections watching 1 paths
Total watches:1
```

* `wchc`: 按会话列出服务器上 watch 的详细信息。该命令会输出会话（连接）及其关联 watch（路径）的列表。注意：视 watch 数量而定，此操作可能开销较大（影响服务器性能），请谨慎使用。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: 按路径列出服务器上 watch 的详细信息。该命令输出包含关联会话的路径（znode）列表。注意：根据 watch 数量的不同，此操作可能开销较大（即会影响服务器性能），请谨慎使用。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: 列出所有未处理的会话和临时节点。此命令仅在 leader 节点上可用。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: 安排快照创建任务。成功时返回最后提交的日志索引，失败时返回 `Failed to schedule snapshot creation task.`。请注意，你可以通过 `lgif` 命令来判断快照是否已完成。

```response
100
```

* `lgif`: Keeper 日志信息。`first_log_idx`：本节点在日志存储中的第一个日志索引；`first_log_term`：本节点的第一个日志任期；`last_log_idx`：本节点在日志存储中的最后一个日志索引；`last_log_term`：本节点的最后一个日志任期；`last_committed_log_idx`：本节点在状态机中最后一次提交的日志索引；`leader_committed_log_idx`：从本节点视角看到的 leader 已提交日志索引；`target_committed_log_idx`：应当提交到的目标日志索引；`last_snapshot_idx`：上一份快照中最大的已提交日志索引。

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

* `rqld`: 请求成为新的 leader。如果成功发送请求，则返回 `Sent leadership request to leader.`；如果未能发送请求，则返回 `Failed to send leadership request to leader.`。注意，如果节点已经是 leader，则返回结果与成功发送请求时相同。

```response
Sent leadership request to leader.
```

* `ftfl`: 列出所有功能开关（feature flags）以及它们在该 Keeper 实例中的启用状态。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: 请求让出领导权并成为 follower。如果接收请求的服务器是 leader，它会先暂停写操作，等待继任者（当前 leader 绝不会成为继任者）完成最新日志的追赶，然后再主动卸任。继任者将会被自动选出。如果请求已发送，则返回 `Sent yield leadership request to leader.`，如果请求未发送，则返回 `Failed to send yield leadership request to leader.`。注意，如果节点已经是 follower，那么结果与请求已成功发送时相同。

```response
Sent yield leadership request to leader.
```

* `pfev`: 返回所有收集到的事件的值。对于每个事件，它会返回事件名称、事件值以及事件的描述。


```response
FileOpen        62      Number of files opened.
Seek    4       Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead        126     Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed  0       Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes   178846  Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite      7       Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed        0       Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes 153     Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync        2       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync   0       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds     12756   Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds        0       Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes     0       Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks      0       Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes       0       Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite        0       Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes   0       Number of bytes written with Linux or FreeBSD AIO interface
...
```

### HTTP 控制 {#http-control}

ClickHouse Keeper 提供了一个 HTTP 接口，用于检查副本是否已就绪，可以接收流量。它可以用于云环境，例如 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)。

启用 `/ready` 端点的配置示例：

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

### 功能开关（Feature flags） {#feature-flags}

Keeper 与 ZooKeeper 及其客户端完全兼容，但也为 ClickHouse 客户端引入了一些独有的功能和请求类型。
由于这些功能可能会带来向后不兼容的变更，其中大部分默认是禁用的，可以通过 `keeper_server.feature_flags` 配置启用。
也可以显式地禁用所有功能。
如果你想为 Keeper 集群启用某个新功能，我们建议先将集群中所有 Keeper 实例升级到支持该功能的版本，然后再启用该功能本身。

下面是一个功能开关配置示例，其中禁用了 `multi_read`，并启用了 `check_not_exists`：

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

可用的功能如下：

| 功能                     | 说明                                                                | 默认值 |
| ---------------------- | ----------------------------------------------------------------- | --- |
| `multi_read`           | 支持 multi read 请求（一次性读取多个节点的请求）                                    | `1` |
| `filtered_list`        | 支持按节点类型（临时或持久）过滤结果的列表请求                                           | `1` |
| `check_not_exists`     | 支持 `CheckNotExists` 请求，该请求用于断言节点不存在                               | `1` |
| `create_if_not_exists` | 支持 `CreateIfNotExists` 请求，如果节点不存在则尝试创建；如果节点已存在，则不会应用任何更改并返回 `ZOK` | `1` |
| `remove_recursive`     | 支持 `RemoveRecursive` 请求，该请求会删除节点及其整个子树                            | `1` |

:::note
部分功能开关自 25.7 版本起默认为启用状态。
将 Keeper 升级到 25.7+ 的推荐方式是先升级到 24.9+ 版本。
:::


### 从 ZooKeeper 迁移 {#migration-from-zookeeper}

无法实现从 ZooKeeper 到 ClickHouse Keeper 的无缝直接迁移。必须先停止 ZooKeeper 集群、转换数据，然后再启动 ClickHouse Keeper。`clickhouse-keeper-converter` 工具可以将 ZooKeeper 日志和快照转换为 ClickHouse Keeper 快照。它仅适用于 ZooKeeper 3.4 及以上版本。迁移步骤如下：

1. 停止所有 ZooKeeper 节点。

2. 可选但建议执行：找到 ZooKeeper 的 leader 节点，再将其启动并重新停止一次。这会强制 ZooKeeper 创建一致的快照。

3. 在 leader 上运行 `clickhouse-keeper-converter`，例如：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 将快照复制到已配置 `keeper` 的 ClickHouse 服务器节点，或启动 ClickHouse Keeper 来替代 ZooKeeper。快照必须在所有节点上持久化，否则空节点可能更快启动，并且其中一个可能会成为 leader。

:::note
`keeper-converter` 工具在 Keeper 独立可执行文件中不可用。
如果已安装 ClickHouse，可以直接使用该二进制文件：

```bash
clickhouse keeper-converter ...
```

否则，你可以[下载二进制文件](/getting-started/quick-start/oss#download-the-binary)，并按上文所述运行该工具，而无需安装 ClickHouse。
:::

### 在失去仲裁后进行恢复 {#recovering-after-losing-quorum}

由于 ClickHouse Keeper 使用 Raft，它可以在一定程度上容忍节点崩溃，具体取决于集群的大小。
例如，对于一个 3 节点的集群，如果只有 1 个节点崩溃，它仍然可以继续正常工作。

集群配置可以动态调整，但存在一些限制。重新配置同样依赖 Raft，
因此要向集群中添加/移除节点，你需要具备仲裁（quorum）。如果你在集群中同时失去了过多的节点，并且无法再次启动它们，
Raft 将停止工作，并且不允许你通过常规方式重新配置集群。

尽管如此，ClickHouse Keeper 提供了恢复模式，它允许你仅使用 1 个节点强制重新配置集群。
只有在你无法再次启动这些节点，或者无法在相同 endpoint 上启动新实例时，才应将此作为最后手段使用。

在继续之前需要注意的重要事项：

* 确保故障节点无法再次连接到集群。
* 在步骤中明确说明之前，不要启动任何新的节点。

在确认上述条件成立后，你需要执行以下操作：

1. 选择一个 Keeper 节点作为新的 leader。请注意，该节点的数据将被用于整个集群，因此我们建议选择状态最为更新的节点。
2. 在执行任何其他操作之前，先对所选节点的 `log_storage_path` 和 `snapshot_storage_path` 目录进行备份。
3. 在你计划使用的所有节点上重新配置集群。
4. 向选定的节点发送四字母命令 `rcvr`，这将把该节点切换到恢复模式，或者停止该节点上的 Keeper 实例，并使用 `--force-recovery` 参数重新启动。
5. 逐个启动新节点上的 Keeper 实例，并在启动下一个节点之前，确认 `mntr` 对 `zk_server_state` 返回的是 `follower`。
6. 在恢复模式下，在与新节点达到仲裁之前，leader 节点会对 `mntr` 命令返回错误信息，并拒绝来自客户端和 follower 的任何请求。
7. 达到仲裁后，leader 节点将恢复到正常工作模式，开始接受所有请求。可通过 `mntr` 验证 Raft 状态，此时 `zk_server_state` 应返回 `leader`。


## 在 Keeper 中使用磁盘 {#using-disks-with-keeper}

Keeper 支持部分[外部磁盘](/operations/storing-data.md)，用于存储快照、日志文件和状态文件。

支持的磁盘类型包括：

* s3&#95;plain
* s3
* local

下面是一个在配置文件中包含的磁盘定义示例。

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

要使用磁盘来存储日志，需要将 `keeper_server.log_storage_disk` 配置项设置为该磁盘的名称。
要使用磁盘来存储快照，需要将 `keeper_server.snapshot_storage_disk` 配置项设置为该磁盘的名称。
此外，可以通过分别使用 `keeper_server.latest_log_storage_disk` 和 `keeper_server.latest_snapshot_storage_disk`，为最新的日志或快照使用不同的磁盘。
在这种情况下，当新的日志或快照创建时，Keeper 会自动将文件移动到正确的磁盘。
要使用磁盘来存储状态文件，需要将 `keeper_server.state_storage_disk` 配置项设置为该磁盘的名称。

在磁盘之间移动文件是安全的，即使 Keeper 在传输过程中停止，也不会有数据丢失的风险。
在文件完全移动到新磁盘之前，它不会从旧磁盘中删除。

将 `keeper_server.coordination_settings.force_sync` 设置为 `true`（默认值为 `true`）的 Keeper 无法在所有类型的磁盘上提供某些保证。
目前，只有类型为 `local` 的磁盘支持持久化同步。
如果使用 `force_sync`，在未使用 `latest_log_storage_disk` 的情况下，`log_storage_disk` 必须是 `local` 类型的磁盘。
如果使用了 `latest_log_storage_disk`，它必须始终是 `local` 类型的磁盘。
如果禁用 `force_sync`，则在任何配置中都可以使用任意类型的磁盘。

一个 Keeper 实例的存储配置可能如下所示：

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

此实例会将除最新日志之外的所有日志存储在磁盘 `log_s3_plain` 上，而最新日志将存储在磁盘 `log_local` 上。
快照同样遵循这一逻辑，除最新快照之外的所有快照将存储在 `snapshot_s3_plain` 上，而最新快照将存储在磁盘 `snapshot_local` 上。

### 更改磁盘配置 {#changing-disk-setup}

:::important
在应用新的磁盘配置之前，请手动备份所有 Keeper 日志和快照。
:::

如果定义了分层磁盘配置（为最新文件使用单独的磁盘），Keeper 会在启动时尝试自动将文件移动到正确的磁盘上。
之前的安全保证依然适用：在文件完全移动到新磁盘之前，它不会从旧磁盘上删除，因此可以安全地多次重启。

如果需要将文件移动到一个全新的磁盘（或从双磁盘配置迁移到单磁盘配置），可以使用多个 `keeper_server.old_snapshot_storage_disk` 和 `keeper_server.old_log_storage_disk` 定义。

以下配置展示了如何从先前的双磁盘配置迁移到一个全新的单磁盘配置：


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

在启动时，所有日志文件都会从 `log_local` 和 `log_s3_plain` 移动到 `log_local2` 磁盘。
同时，所有快照文件都会从 `snapshot_local` 和 `snapshot_s3_plain` 移动到 `snapshot_local2` 磁盘。


## 配置日志缓存 {#configuring-logs-cache}

为尽量减少从磁盘读取的数据量，Keeper 会在内存中缓存日志条目。
如果请求很大，日志条目会占用过多内存，因此缓存的日志总量会被限制。
该限制通过以下两个配置项进行控制：
- `latest_logs_cache_size_threshold` - 缓存中存储的最新日志的总大小
- `commit_logs_cache_size_threshold` - 需要接下来提交的后续日志的总大小

如果默认值过大，可以通过减小这两个配置项来降低内存使用。

:::note
可以使用 `pfev` 命令检查从各个缓存以及从文件中读取的日志量。
也可以使用 Prometheus 端点暴露的指标来跟踪两个缓存当前的大小。
:::



## Prometheus {#prometheus}

Keeper 可以向 [Prometheus](https://prometheus.io) 暴露可供抓取的指标数据。

设置项：

* `endpoint` – Prometheus 服务器用于抓取指标的 HTTP 端点。以 &#39;/&#39; 开头。
* `port` – `endpoint` 使用的端口。
* `metrics` – 用于控制是否暴露 [system.metrics](/operations/system-tables/metrics) 表中指标的开关。
* `events` – 用于控制是否暴露 [system.events](/operations/system-tables/events) 表中指标的开关。
* `asynchronous_metrics` – 用于控制是否暴露 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表中当前指标值的开关。

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

检查（将 `127.0.0.1` 替换为 ClickHouse 服务器的 IP 地址或主机名）：

```bash
curl 127.0.0.1:9363/metrics
```

请同时参阅 ClickHouse Cloud 的 [Prometheus 集成](/integrations/prometheus)。


## ClickHouse Keeper 用户指南 {#clickhouse-keeper-user-guide}

本指南提供用于配置 ClickHouse Keeper 的简单最小配置，并包含一个测试分布式操作的示例。该示例在 Linux 上，使用 3 个节点进行演示。

### 1. 使用 Keeper 设置配置各个节点 {#1-configure-nodes-with-keeper-settings}

1. 在 3 台主机（`chnode1`、`chnode2`、`chnode3`）上安装 3 个 ClickHouse 实例。（有关安装 ClickHouse 的详细信息，请参阅 [快速开始](/getting-started/install/install.mdx)。）

2. 在每个节点上，添加以下条目以允许通过网络接口进行外部通信。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 将以下 ClickHouse Keeper 配置添加到所有三台服务器上，并为每台服务器更新 `<server_id>` 设置；对于 `chnode1` 为 `1`，`chnode2` 为 `2`，依此类推。
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

    上述示例中使用的基本设置如下：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |供 Keeper 客户端使用的端口|9181，等价于 Zookeeper 中的默认端口 2181|
    |server_id| 在 raft 配置中用于标识每个 ClickHouse Keeper 服务器的标识符| 1|
    |coordination_settings| 包含超时等参数的配置部分| 超时：10000，日志级别：trace|
    |server    |参与集群的服务器的定义|每个服务器定义的列表|
    |raft_configuration| Keeper 集群中每台服务器的设置| 每台服务器及其设置|
    |id      |Keeper 服务中服务器的数字 ID|1|
    |hostname   |Keeper 集群中每台服务器的主机名、IP 或 FQDN|`chnode1.domain.com`|
    |port|用于 Keeper 服务器之间连接监听的端口|9234|

4.  启用 Zookeeper 组件。它将使用 ClickHouse Keeper 引擎：
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

    上述示例中使用的基本设置如下：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper 连接使用的节点列表|每台服务器对应的配置条目|
    |host|每个 ClickHouse Keeper 节点的主机名、IP 或 FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper 客户端端口| 9181|

5. 重启 ClickHouse 并验证每个 Keeper 实例是否正在运行。在每台服务器上执行以下命令。如果 Keeper 正在运行且状态正常，`ruok` 命令将返回 `imok`：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` 数据库中有一个名为 `zookeeper` 的表，其中包含 ClickHouse Keeper 实例的详细信息。我们来查看该表：
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```



该表如下所示：

```response
┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
│ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
│ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
│ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
└────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
```

### 2. 在 ClickHouse 中配置集群 {#2--configure-a-cluster-in-clickhouse}

1. 我们来配置一个简单集群，其包含 2 个分片，并且仅在其中 2 个节点上各有 1 个副本。第三个节点将用于满足 ClickHouse Keeper 对仲裁的要求。更新 `chnode1` 和 `chnode2` 上的配置。以下集群在每个节点上定义 1 个分片，总计 2 个分片且不进行复制。在本示例中，部分数据会位于一个节点上，另一部分数据会位于另一个节点上：

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

   | Parameter | Description               | Example              |
   | --------- | ------------------------- | -------------------- |
   | shard     | 集群定义中的分片列表                | 每个分片的副本列表            |
   | replica   | 每个副本的设置列表                 | 每个副本的设置条目            |
   | host      | 将承载副本分片的服务器的主机名、IP 或 FQDN | `chnode1.domain.com` |
   | port      | 使用原生 TCP 协议进行通信所使用的端口     | 9000                 |
   | user      | 用于对集群实例进行身份验证的用户名         | default              |
   | password  | 为该用户定义的密码，用于允许连接到集群实例     | `ClickHouse123!`     |

2. 重启 ClickHouse 并验证集群已创建：

   ```bash
   SHOW clusters;
   ```

   你应当能看到该集群：

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. 创建并测试分布式表 {#3-create-and-test-distributed-table}

1. 使用 `chnode1` 上的 ClickHouse 客户端在新集群上创建一个新数据库。`ON CLUSTER` 子句会自动在两个节点上创建该数据库。
   ```sql
   CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
   ```


2. 在 `db1` 数据库上创建一个新表。同样地，`ON CLUSTER` 会在两个节点上都创建该表。
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. 在 `chnode1` 节点上添加几行数据：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. 在 `chnode2` 节点上添加几行数据：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 注意，在每个节点上运行 `SELECT` 语句时，只会显示该节点上的数据。例如，在 `chnode1` 上：
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
6.
    ```sql
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

6. 可以创建一个 `Distributed` 表来表示两个分片上的数据。使用 `Distributed` 表引擎的表自身不存储任何数据，但允许在多台服务器上进行分布式查询处理。读取会访问所有分片，写入可以分布到各个分片上。在 `chnode1` 上运行如下查询：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. 注意，对 `dist_table` 进行查询会返回来自两个分片的四行数据：
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

本指南演示了如何使用 ClickHouse Keeper 设置集群。借助 ClickHouse Keeper，可以配置集群并定义可以在分片之间复制的分布式表。



## 使用唯一路径配置 ClickHouse Keeper {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 描述 {#description}

本文介绍如何使用内置的 `{uuid}` 宏配置项
在 ClickHouse Keeper 或 ZooKeeper 中创建唯一条目。唯一路径在频繁创建和删除表时非常有用，因为
这样就无需等待数分钟让 Keeper 垃圾回收
去删除路径条目；每次创建路径时，都会在该路径中使用新的 `uuid`，
路径从不会被重用。

### 示例环境 {#example-environment}

一个三节点集群，将被配置为在三个节点上都运行 ClickHouse Keeper，
并在其中两个节点上运行 ClickHouse。这样
为 ClickHouse Keeper 提供了三个节点（包括一个仲裁节点），并且
提供了一个由两个副本组成的单个 ClickHouse 分片。

| node                    | description               |
| ----------------------- | ------------------------- |
| `chnode1.marsnet.local` | 数据节点 - 集群 `cluster_1S_2R` |
| `chnode2.marsnet.local` | 数据节点 - 集群 `cluster_1S_2R` |
| `chnode3.marsnet.local` | ClickHouse Keeper 仲裁节点    |

集群示例配置：

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

### 将表配置为使用 `{uuid}` 的步骤 {#procedures-to-set-up-tables-to-use-uuid}

1. 在每台服务器上配置 Macros
   以服务器 1 为例：

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
请注意，我们为 `shard` 和 `replica` 定义了宏，但 `{uuid}` 并未在此处定义，它是内置宏，无需单独定义。
:::

2. 创建一个数据库

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

3. 使用宏和 `{uuid}` 在集群中创建一张表

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


┌─host──────────────────┬─port─┬─status─┬─error─┬─num&#95;hosts&#95;remaining─┬─num&#95;hosts&#95;active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

````

4.  Create a distributed table

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

1. 在第一个节点上插入数据（例如 `chnode1`）

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

2. 将数据插入到第二个节点（例如 `chnode2`）

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

3. 通过分布式表查看记录

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

### 其他方案 {#alternatives}

可以通过宏（包括 `{uuid}`）预先定义默认复制路径。

1. 在每个节点上为表设置默认路径

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
如果某些节点只用于特定数据库，你也可以在每个节点上定义一个 `{database}` 宏。
:::

2. 在未显式指定参数的情况下创建表：

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


Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num&#95;hosts&#95;remaining─┬─num&#95;hosts&#95;active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

结果中有 2 行。耗时 1.175 秒。

````

3. Verify it used the settings used in default config
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

1 row in set. Elapsed: 0.003 sec.
```

### 故障排查 {#troubleshooting}

示例命令，用于获取表信息和 UUID：

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

用于获取上述表在 ZooKeeper 中对应 UUID 表信息的示例命令

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
数据库必须为 `Atomic`。如果是从之前的版本升级而来，
`default` 数据库很可能仍是 `Ordinary` 类型。
:::

要进行检查：

例如，

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

1 row in set. Elapsed: 0.004 sec.
```


## ClickHouse Keeper 动态重新配置 {#reconfiguration}

<SelfManaged />

### 描述 {#description-1}

在开启 `keeper_server.enable_reconfiguration` 的情况下，ClickHouse Keeper 对 ZooKeeper 的 [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) 命令提供部分支持，可用于对集群进行动态重新配置。

:::note
如果关闭了该设置，你可以通过手动修改各副本的 `raft_configuration` 部分来重新配置集群。请确保在所有副本上编辑这些文件，因为只有 leader 会实际应用更改。
或者，你也可以通过任意兼容 ZooKeeper 的客户端发送 `reconfig` 查询。
:::

虚拟节点 `/keeper/config` 以如下格式包含最近一次提交的集群配置：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

* 每个服务器记录以换行符分隔。
* `server_type` 可以是 `participant` 或 `learner`（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) 不参与领导者选举）。
* `server_priority` 是一个非负整数，用于指示[在领导者选举中应优先选择哪些节点](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)。
  优先级为 0 表示该服务器永远不会成为领导者。

示例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

可以使用 `reconfig` 命令添加新服务器、删除现有服务器并修改现有服务器的优先级。下面是一些示例（使用 `clickhouse-keeper-client`）：


```bash
# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Remove two other servers
reconfig remove "3,4"
# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

以下是 `kazoo` 的示例：


```python
# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```


# 将现有服务器的优先级更改为 8

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

Servers in `joining` should be in server format described above. Server entries should be delimited by commas.
While adding new servers, you can omit `server_priority` (default value is 1) and `server_type` (default value
is `participant`).

If you want to change existing server priority, add it to `joining` with target priority.
Server host, port, and type must be equal to existing server configuration.

Servers are added and removed in order of appearance in `joining` and `leaving`.
All updates from `joining` are processed before updates from `leaving`.

There are some caveats in Keeper reconfiguration implementation:

- Only incremental reconfiguration is supported. Requests with non-empty `new_members` are declined.

  ClickHouse Keeper implementation relies on NuRaft API to change membership dynamically. NuRaft has a way to
  add a single server or remove a single server, one at a time. This means each change to configuration
  (each part of `joining`, each part of `leaving`) must be decided on separately. Thus there is no bulk
  reconfiguration available as it would be misleading for end users.

  Changing server type (participant/learner) isn't possible either as it's not supported by NuRaft, and
  the only way would be to remove and add server, which again would be misleading.

- You cannot use the returned `znodestat` value.
- The `from_version` field is not used. All requests with set `from_version` are declined.
  This is due to the fact `/keeper/config` is a virtual node, which means it is not stored in
  persistent storage, but rather generated on-the-fly with the specified node config for every request.
  This decision was made as to not duplicate data as NuRaft already stores this config.
- Unlike ZooKeeper, there is no way to wait on cluster reconfiguration by submitting a `sync` command.
  New config will be _eventually_ applied but with no time guarantees.
- `reconfig` command may fail for various reasons. You can check cluster's state and see whether the update
  was applied.
```


## 将单节点 keeper 转换为集群 {#converting-a-single-node-keeper-into-a-cluster}

有时需要将实验性的 keeper 单节点扩展为一个集群。下面是将其逐步扩展为 3 节点集群的方案：

- **重要**：新节点必须以数量小于当前法定人数（quorum）的批次添加，否则它们会在自身之间选举出一个 leader。本示例中是逐个添加。
- 现有的 keeper 节点必须开启 `keeper_server.enable_reconfiguration` 配置参数。
- 使用 keeper 集群的完整新配置启动第二个节点。
- 第二个节点启动后，使用 [`reconfig`](#reconfiguration) 将其添加到节点 1。
- 现在，启动第三个节点，并使用 [`reconfig`](#reconfiguration) 将其添加到集群。
- 在 `clickhouse-server` 配置中添加新的 keeper 节点以更新配置，并重启以应用更改。
- 更新节点 1 的 raft 配置，并在需要时重启它。

为了方便熟悉整个过程，这里提供了一个 [sandbox 仓库](https://github.com/ClickHouse/keeper-extend-cluster)。



## 不受支持的功能 {#unsupported-features}

虽然 ClickHouse Keeper 旨在与 ZooKeeper 完全兼容，但目前仍有一些功能尚未实现（相关开发正在进行中）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持返回 `Stat` 对象
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持 [生存时间 (TTL)](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) 无法与 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) 类型的 watch 一起使用
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) 和 [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) 不受支持
- 不支持 `setWatches`
- 不支持创建 [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 类型的 znode
- 不支持 [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)
