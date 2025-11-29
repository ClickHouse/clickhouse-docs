---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: '配置 ClickHouse Keeper'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（clickhouse-keeper）用于替代 ZooKeeper，提供复制和协调功能。'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---



# ClickHouse Keeper（clickhouse-keeper） {#clickhouse-keeper-clickhouse-keeper}

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper 为数据[复制](/engines/table-engines/mergetree-family/replication.md)和[分布式 DDL](/sql-reference/distributed-ddl.md) 查询执行提供协调系统。ClickHouse Keeper 与 ZooKeeper 兼容。

### 实现细节 {#implementation-details}

ZooKeeper 是最早广为人知的开源协调系统之一。它用 Java 实现，具有相当简单而强大的数据模型。ZooKeeper 的协调算法 ZooKeeper Atomic Broadcast (ZAB) 不为读操作提供线性一致性保证，因为每个 ZooKeeper 节点本地提供读服务。与 ZooKeeper 不同，ClickHouse Keeper 使用 C++ 编写，并采用 [RAFT 算法](https://raft.github.io/)的[实现](https://github.com/eBay/NuRaft)。该算法允许对读写操作提供线性一致性，并且在不同语言中有多种开源实现。

默认情况下，ClickHouse Keeper 提供与 ZooKeeper 相同的保证：线性一致的写入以及非线性一致的读取。它具有兼容的客户端-服务器协议，因此可以使用任何标准 ZooKeeper 客户端与 ClickHouse Keeper 交互。快照和日志的格式与 ZooKeeper 不兼容，但 `clickhouse-keeper-converter` 工具可以将 ZooKeeper 数据转换为 ClickHouse Keeper 快照。ClickHouse Keeper 的服务器间协议同样与 ZooKeeper 不兼容，因此无法构建混合的 ZooKeeper / ClickHouse Keeper 集群。

ClickHouse Keeper 以与 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) 相同的方式支持访问控制列表 (ACL)。ClickHouse Keeper 支持相同的权限集合，并具有相同的内置方案：`world`、`auth` 和 `digest`。`digest` 认证方案使用 `username:password` 这一对值，其中密码以 Base64 编码。

:::note
不支持外部集成。
:::

### 配置 {#configuration}

ClickHouse Keeper 可以作为 ZooKeeper 的独立替代品，或作为 ClickHouse 服务器的内部组件使用。在这两种情况下，配置文件几乎相同，都是 `.xml` 文件。

#### Keeper 配置设置 {#keeper-configuration-settings}

ClickHouse Keeper 主要的配置标签是 `<keeper_server>`，并包含以下参数：


| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | 客户端连接使用的端口。                                                                                                                                                                                                                             | `2181`                                                                                                       |
| `tcp_port_secure`                    | 客户端与 keeper-server 之间通过 SSL 连接使用的安全端口。                                                                                                                                                                                           | -                                                                                                            |
| `server_id`                          | 唯一的服务器 ID，ClickHouse Keeper 集群中的每个节点都必须有唯一编号（1、2、3 等）。                                                                                                                                                                | -                                                                                                            |
| `log_storage_path`                   | 协调日志的存储路径，与 ZooKeeper 一样，最好将日志存储在负载较低的节点上。                                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | 协调快照的存储路径。                                                                                                                                                                                                                               | -                                                                                                            |
| `enable_reconfiguration`             | 通过 [`reconfig`](#reconfiguration) 启用动态集群重配置。                                                                                                                                                                                           | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeper 最大内存使用量的软限制（字节）。                                                                                                                                                                                                            | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | 如果未设置 `max_memory_usage_soft_limit` 或将其设置为 0，则使用此值来定义默认软限制。                                                                                                                                                               | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | 如果未设置 `max_memory_usage_soft_limit` 或将其设置为 `0`，则使用该时间间隔监控物理内存大小。一旦内存大小发生变化，将通过 `max_memory_usage_soft_limit_ratio` 重新计算 Keeper 的内存软限制。                                                       | `15`                                                                                                         |
| `http_control`                       | [HTTP control](#http-control) 接口的配置。                                                                                                                                                                                                         | -                                                                                                            |
| `digest_enabled`                     | 启用实时数据一致性检查。                                                                                                                                                                                                                           | `True`                                                                                                       |
| `create_snapshot_on_exit`            | 在关闭期间创建快照。                                                                                                                                                                                                                               | -                                                                                                            |
| `hostname_checks_enabled`            | 为集群配置启用主机名合理性检查（例如，当 `localhost` 与远程端点一起使用时）。                                                                                                                                                                      | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw 命令的白名单。                                                                                                                                                                                                                                 | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| 启用 IPv6 | `True`|

其他常用参数继承自 ClickHouse 服务器配置（`listen_host`、`logger` 等）。

#### 内部协调设置 {#internal-coordination-settings}

内部协调设置位于 `<keeper_server>.<coordination_settings>` 部分，并包含以下参数：



| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 单个客户端操作的超时时间（毫秒）                                                                                                                                                                                          | `10000`                                                                                                      |
| `min_session_timeout_ms`           | 客户端会话的最小超时时间（毫秒）                                                                                                                                                                                          | `10000`                                                                                                      |
| `session_timeout_ms`               | 客户端会话的最大超时时间（毫秒）                                                                                                                                                                                          | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper 检查并清理失效会话的周期（毫秒）                                                                                                                                                                       | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper 领导节点向跟随者发送心跳的时间间隔（毫秒）                                                                                                                                                             | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | 如果跟随者在该时间间隔内没有收到来自领导者的心跳，则可以发起领导者选举。必须小于或等于 `election_timeout_upper_bound_ms`。理想情况下，这两个值不应相等。                                                                | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | 如果跟随者在该时间间隔内没有收到来自领导者的心跳，则必须发起领导者选举。                                                                                                                                                 | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 单个文件中要存储的日志记录数量。                                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | 在压缩之前要保留的协调日志记录数量。                                                                                                                                                                                      | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper 创建新快照的频率（按日志记录条数计）。                                                                                                                                                                 | `100000`                                                                                                     |
| `snapshots_to_keep`                | 要保留的快照数量。                                                                                                                                                                                                        | `3`                                                                                                          |
| `stale_log_gap`                    | 领导者将跟随者视为“过期”，并向其发送快照而非日志时所使用的阈值。                                                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | 节点被认为重新变为“最新”的阈值。                                                                                                                                                                                          | `200`                                                                                                        |
| `max_requests_batch_size`          | 在发送到 RAFT 之前，请求批次中包含的最大请求数量。                                                                                                                                                                       | `100`                                                                                                        |
| `force_sync`                       | 每次写入协调日志时调用 `fsync`。                                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | 通过完整的 RAFT 共识机制，以类似写请求的速度执行读请求。                                                                                                                                                                 | `false`                                                                                                      |
| `raft_logs_level`                  | 协调相关文本日志的日志级别（trace、debug 等）。                                                                                                                                                                          | `system default`                                                                                             |
| `auto_forwarding`                  | 允许将写请求从跟随者转发到领导者。                                                                                                                                                                                        | `true`                                                                                                       |
| `shutdown_timeout`                 | 等待内部连接完成并关闭的时间（毫秒）。                                                                                                                                                                                    | `5000`                                                                                                       |
| `startup_timeout`                  | 如果服务器在指定的超时时间内未能连接到其他仲裁参与者，则会终止（毫秒）。                                                                                                                                                 | `30000`                                                                                                      |
| `async_replication`                | 启用异步复制。在保留所有写入和读取保证的同时获得更好的性能。为避免破坏向后兼容性，该设置默认禁用。                                                                                                                       | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新日志条目的内存缓存的最大总大小。                                                                                                                                                                                      | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | 为下一次提交所需日志条目的内存缓存的最大总大小。                                                                                                                                                                          | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | 在一次磁盘间文件移动失败后，两次重试之间等待的时间（毫秒）。                                                                                                                                                             | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 在初始化期间，磁盘间文件移动失败后重试的次数。                                                                                                                                                                           | `100`                                                                                                        |
| `experimental_use_rocksdb`         | 使用 RocksDB 作为后端存储                                                                                                                                                                                                 | `0`                                                                                                          |

仲裁（quorum）配置位于 `<keeper_server>.<raft_configuration>` 部分中，并包含各服务器的配置说明。

整个仲裁范围内唯一的参数是 `secure`，用于为仲裁参与者之间的通信启用加密连接。如果内部节点间通信需要 SSL 连接，可以将该参数设置为 `true`，否则可以保持未指定。

每个 `<server>` 的主要参数为：



* `id` — 仲裁中服务器的标识符。
* `hostname` — 部署该服务器的主机名。
* `port` — 该服务器监听连接的端口。
* `can_become_leader` — 设为 `false` 可将该服务器配置为 `learner`。如果省略，则默认为 `true`。

:::note
当 ClickHouse Keeper 集群的拓扑发生变化时（例如替换某个服务器），请务必保持 `server_id` 与 `hostname` 的映射关系一致，避免打乱顺序或在不同服务器之间复用已有的 `server_id`（例如，如果依赖自动化脚本部署 ClickHouse Keeper，就有可能发生这种情况）。

如果 Keeper 实例所在的主机可能发生变化，建议定义并使用主机名而不是原始 IP 地址。更改主机名等同于先移除该服务器再将其重新加入，在某些情况下这可能无法完成（例如 Keeper 实例数量不足以形成仲裁）。
:::

:::note
`async_replication` 默认是禁用的，以避免破坏向后兼容性。如果集群中的所有 Keeper 实例都运行在支持 `async_replication` 的版本上（v23.9+），建议启用该功能，因为它可以在没有任何负面影响的情况下提升性能。
:::

关于包含三个节点的仲裁配置示例，可以在带有 `test_keeper_` 前缀的[集成测试](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)中找到。服务器 #1 的配置示例如下：

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

ClickHouse Keeper 已打包在 ClickHouse 服务器安装包中，只需在 `/etc/your_path_to_config/clickhouse-server/config.xml` 中添加 `<keeper_server>` 的配置，然后像平常一样启动 ClickHouse 服务器即可。如果你想以独立方式运行 ClickHouse Keeper，可以通过类似的方式启动它：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

如果尚未创建名为 `clickhouse-keeper` 的符号链接，可以手动创建，或者在运行 `clickhouse` 时将 `keeper` 作为参数指定：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 四字母命令 {#four-letter-word-commands}

ClickHouse Keeper 也提供了与 ZooKeeper 基本相同的 4lw 命令。每个命令由四个字母组成，例如 `mntr`、`stat` 等。其中有一些更为实用的命令：`stat` 提供关于服务器及其已连接客户端的一些通用信息，而 `srvr` 和 `cons` 则分别提供关于服务器和连接的详细信息。

4lw 命令有一个白名单配置项 `four_letter_word_white_list`，其默认值为 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`。

你可以通过 telnet 或 nc 在客户端端口向 ClickHouse Keeper 发送这些命令。

```bash
echo mntr | nc localhost 9181
```

下面是详细的 4lw 命令：

* `ruok`：测试服务器是否在非错误状态下运行。如果服务器正在运行，则会响应 `imok`，否则将完全不会有任何响应。`imok` 的响应并不一定表示服务器已加入仲裁，只表明服务器进程处于活动状态并已绑定到指定的客户端端口。使用 &quot;stat&quot; 获取有关仲裁状态和客户端连接信息的详细内容。

```response
正常
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

* `srvr`: 显示服务器的完整详细信息。

```response
ClickHouse Keeper 版本: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
延迟 最小值/平均值/最大值: 0/0/0
已接收: 2
已发送: 2
连接数: 1
待处理请求: 0
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
待处理: 0
Zxid: 36
模式: leader
节点数: 4
```

* `srst`: 重置服务器统计信息。该命令会影响 `srvr`、`mntr` 和 `stat` 的结果。

```response
服务器统计数据已重置。
```

* `conf`: 输出服务配置的详细信息。

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

* `cons`: 列出当前连接到此服务器的所有客户端的完整连接/会话详情。包括接收/发送的数据包数量、会话 ID、操作延迟、最近一次执行的操作等。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: 重置所有连接/会话的统计信息。

```response
连接统计已重置。
```

* `envi`: 打印当前服务环境的详细信息


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

* `dirs`: 显示快照和日志文件的总大小（字节）

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: 检测服务器是否在只读模式下运行。如果处于只读模式，服务器将返回 `ro`，否则返回 `rw`。

```response
rw
```

* `wchs`: 列出该服务器上的 watch 概要信息。

```response
1 个连接监视 1 个路径
总监视数：1
```

* `wchc`: 按会话列出服务器上的监控项（watch）详细信息。该命令输出包含关联监控项（路径）的会话（连接）列表。注意：根据监控项数量的多少，此操作可能开销较大（影响服务器性能），请谨慎使用。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: 按路径列出服务器上 watch 的详细信息。该命令会输出包含关联会话的路径（znode）列表。注意：根据 watch 数量的不同，此操作可能会开销较大（即影响服务器性能），请谨慎使用。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: 列出当前未完成的会话和临时节点。仅可在 leader 节点上使用。

```response
会话转储 (2):
0x0000000000000001
0x0000000000000002
包含临时节点的会话 (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: 调度一个快照创建任务。成功时返回已提交日志中该快照的最后索引；失败时返回 `Failed to schedule snapshot creation task.`。注意可以通过 `lgif` 命令来判断快照是否已完成。

```response
100
```

* `lgif`: Keeper 日志信息。`first_log_idx`：本节点在日志存储中的第一个日志索引；`first_log_term`：本节点的第一个日志任期（term）；`last_log_idx`：本节点在日志存储中的最后一个日志索引；`last_log_term`：本节点的最后一个日志任期（term）；`last_committed_log_idx`：本节点在状态机中最后一次提交的日志索引；`leader_committed_log_idx`：从本节点视角看到的 leader 已提交的日志索引；`target_committed_log_idx`：目标应提交到的日志索引；`last_snapshot_idx`：上一个快照中已提交的最大日志索引。

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

* `rqld`: 请求成为新的 leader。若请求已发送则返回 `Sent leadership request to leader.`，若请求未发送则返回 `Failed to send leadership request to leader.`。注意，如果该节点已经是 leader，则结果与请求已发送时相同。

```response
已向 Leader 发送领导权请求。
```

* `ftfl`: 列出所有功能开关以及这些开关在该 Keeper 实例中是否已启用。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`：请求让出领导权并转为 follower 角色。如果接收该请求的服务器是 leader，它会先暂停写操作，等待继任者（当前 leader 本身永远不会被选为继任者）完成对最新日志的追赶，然后再辞去领导身份。继任者将自动选出。如果请求已发送，则返回 `Sent yield leadership request to leader.`，如果请求未发送，则返回 `Failed to send yield leadership request to leader.`。注意，如果节点已经是 follower，则效果等同于请求已成功发送。

```response
已向 Leader 发送让出领导权请求。
```

* `pfev`: 返回所有已收集事件的值。对于每个事件，返回事件名称、事件值以及事件描述。


```response
FileOpen        62      已打开的文件数。
Seek    4       'lseek' 函数的调用次数。
ReadBufferFromFileDescriptorRead        126     从文件描述符执行读取操作(read/pread)的次数。不包括套接字。
ReadBufferFromFileDescriptorReadFailed  0       从文件描述符执行读取操作(read/pread)失败的次数。
ReadBufferFromFileDescriptorReadBytes   178846  从文件描述符读取的字节数。如果文件已压缩,则显示压缩后的数据大小。
WriteBufferFromFileDescriptorWrite      7       向文件描述符执行写入操作(write/pwrite)的次数。不包括套接字。
WriteBufferFromFileDescriptorWriteFailed        0       向文件描述符执行写入操作(write/pwrite)失败的次数。
WriteBufferFromFileDescriptorWriteBytes 153     写入文件描述符的字节数。如果文件已压缩,则显示压缩后的数据大小。
FileSync        2       对文件调用 F_FULLFSYNC/fsync/fdatasync 函数的次数。
DirectorySync   0       对目录调用 F_FULLFSYNC/fsync/fdatasync 函数的次数。
FileSyncElapsedMicroseconds     12756   等待文件 F_FULLFSYNC/fsync/fdatasync 系统调用的总耗时。
DirectorySyncElapsedMicroseconds        0       等待目录 F_FULLFSYNC/fsync/fdatasync 系统调用的总耗时。
ReadCompressedBytes     0       从压缩源(文件、网络)读取的字节数(解压前的字节数)。
CompressedReadBufferBlocks      0       从压缩源(文件、网络)读取的压缩块数(相互独立压缩的数据块)。
CompressedReadBufferBytes       0       从压缩源(文件、网络)读取的未压缩字节数(解压后的字节数)。
AIOWrite        0       使用 Linux 或 FreeBSD AIO 接口执行写入操作的次数
AIOWriteBytes   0       使用 Linux 或 FreeBSD AIO 接口写入的字节数
...
```

### HTTP 控制接口 {#http-control}

ClickHouse Keeper 提供了一个 HTTP 接口，用于检查副本是否已准备好接收请求。它可用于云环境中，例如 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)。

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

Keeper 与 ZooKeeper 及其客户端完全兼容，但它也为 ClickHouse 客户端引入了一些独特的功能和请求类型。
由于这些功能可能会引入向后不兼容的变更，因此大多数功能默认处于禁用状态，可以通过 `keeper_server.feature_flags` 配置启用。
所有功能也都可以被显式禁用。
如果你想为 Keeper 集群启用某个新功能，我们建议你先将集群中所有 Keeper 实例更新到支持该功能的版本，然后再启用该功能本身。

下面是一个功能开关配置示例，其中禁用了 `multi_read` 并启用了 `check_not_exists`：

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

| 功能                     | 描述                                                                    | 默认值 |
| ---------------------- | --------------------------------------------------------------------- | --- |
| `multi_read`           | 支持多读（multi read）请求                                                    | `1` |
| `filtered_list`        | 支持按节点类型（临时节点或持久节点）过滤结果的列表请求                                           | `1` |
| `check_not_exists`     | 支持 `CheckNotExists` 请求，用于断言某个节点不存在                                    | `1` |
| `create_if_not_exists` | 支持 `CreateIfNotExists` 请求：如果节点不存在则尝试创建该节点；如果节点已存在，则不会应用任何更改，并返回 `ZOK` | `1` |
| `remove_recursive`     | 支持 `RemoveRecursive` 请求，用于删除该节点及其整个子树                                 | `1` |

:::note
从 25.7 版本开始，部分功能标志（feature flag）默认启用。\
将 Keeper 升级到 25.7+ 的推荐方式是先升级到 24.9+ 版本。
:::


### 从 ZooKeeper 迁移 {#migration-from-zookeeper}

无法实现从 ZooKeeper 到 ClickHouse Keeper 的无缝迁移。需要先停止 ZooKeeper 集群、转换数据，然后再启动 ClickHouse Keeper。`clickhouse-keeper-converter` 工具可将 ZooKeeper 日志和快照转换为 ClickHouse Keeper 快照。它仅适用于 ZooKeeper 3.4 及以上版本。迁移步骤如下：

1. 停止所有 ZooKeeper 节点。

2. 可选但推荐：找到 ZooKeeper 的 leader 节点，将其启动后再停止一次。这会强制 ZooKeeper 创建一致的快照。

3. 在 leader 节点上运行 `clickhouse-keeper-converter`，例如：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 将快照复制到已配置了 `keeper` 的 ClickHouse 服务器节点上，或启动 ClickHouse Keeper 来替代 ZooKeeper。快照必须在所有节点上持久化保存，否则空节点可能启动得更快并成为 leader。

:::note
`keeper-converter` 工具在 Keeper 独立二进制文件中不可用。
如果已安装 ClickHouse，可以直接使用该二进制文件：

```bash
clickhouse keeper-converter ...
```

Otherwise, you can [download the binary](/getting-started/quick-start/oss#download-the-binary) and run the tool as described above without installing ClickHouse.
:::

### 在丢失法定人数后的恢复 {#recovering-after-losing-quorum}

由于 ClickHouse Keeper 使用 Raft，它可以在一定程度上容忍节点宕机，具体取决于集群规模。\
例如，对于一个 3 节点集群，如果只有 1 个节点宕机，它仍然可以正常工作。

集群配置可以动态变更，但存在一些限制。重新配置同样依赖 Raft，\
因此要向集群添加或移除节点，必须具备法定人数。如果在无法重启的情况下，集群中同时有太多节点宕机，\
Raft 将停止工作，并且不允许你通过常规方式重新配置集群。

尽管如此，ClickHouse Keeper 提供了一种恢复模式，允许你仅使用 1 个节点强制重新配置集群。\
只有在无法重新启动这些节点，或无法在相同端点上启动新的实例时，才应将该模式作为最后手段使用。

在继续之前需要注意的重要事项：

* 确保故障节点无法再次连接到集群。
* 在步骤中特别指出之前，不要启动任何新节点。

在确认上述事项之后，你需要执行以下操作：

1. 选择一个 Keeper 节点作为新的 leader。请注意，将使用该节点上的数据作为整个集群的数据，因此建议选择状态最新的节点。
2. 在执行任何其他操作之前，为选定节点的 `log_storage_path` 和 `snapshot_storage_path` 目录创建备份。
3. 在你计划继续使用的所有节点上重新配置集群。
4. 向你选定的节点发送四字母命令 `rcvr`，它会将该节点切换到恢复模式；或者停止该节点上的 Keeper 实例，并使用 `--force-recovery` 参数重新启动。
5. 依次启动新节点上的 Keeper 实例，在启动下一个节点之前，确保 `mntr` 命令对 `zk_server_state` 的返回值为 `follower`。
6. 在恢复模式下，leader 节点在与新节点达成法定人数之前，会对 `mntr` 命令返回错误信息，并拒绝来自客户端和 follower 的任何请求。
7. 达成法定人数后，leader 节点会恢复到正常运行模式，使用 Raft 接受所有请求——可通过 `mntr` 进行验证，此时 `zk_server_state` 应返回 `leader`。


## 在 Keeper 中使用磁盘 {#using-disks-with-keeper}

Keeper 支持 [外部磁盘](/operations/storing-data.md) 类型中的一部分，用于存储快照、日志文件和状态文件。

支持的磁盘类型包括：

* s3&#95;plain
* s3
* local

下面是一个配置文件中磁盘定义的示例。

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

若要将某块磁盘用于日志，需将 `keeper_server.log_storage_disk` 配置设为该磁盘的名称。
若要将某块磁盘用于快照，需将 `keeper_server.snapshot_storage_disk` 配置设为该磁盘的名称。
此外，还可以通过分别使用 `keeper_server.latest_log_storage_disk` 和 `keeper_server.latest_snapshot_storage_disk`，为最新日志或快照使用不同的磁盘。
在这种情况下，当创建新的日志或快照时，Keeper 会自动将文件移动到正确的磁盘上。
若要将某块磁盘用于状态文件，需将 `keeper_server.state_storage_disk` 配置设为该磁盘的名称。

在磁盘之间移动文件是安全的，即使 Keeper 在传输中途停止，也不会有数据丢失的风险。
在文件完全移动到新磁盘之前，不会从旧磁盘上删除。

当 `keeper_server.coordination_settings.force_sync` 被设置为 `true`（默认即为 `true`）时，Keeper 无法在所有类型的磁盘上都满足某些一致性保证。
目前，只有类型为 `local` 的磁盘支持持久同步。
如果使用 `force_sync` 且未使用 `latest_log_storage_disk`，则 `log_storage_disk` 必须是 `local` 磁盘。
如果使用了 `latest_log_storage_disk`，则它必须始终是 `local` 磁盘。
如果禁用 `force_sync`，则在任意配置中都可以使用任意类型的磁盘。

Keeper 实例的一种可能存储配置如下所示：

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

此实例会将除最新日志外的所有日志存储在 `log_s3_plain` 磁盘上，而最新日志将存储在 `log_local` 磁盘上。
同样的逻辑也适用于快照：除最新快照外的所有快照将存储在 `snapshot_s3_plain` 磁盘上，而最新快照将存储在 `snapshot_local` 磁盘上。

### 更改磁盘配置 {#changing-disk-setup}

:::important
在应用新的磁盘配置之前，请手动备份所有 Keeper 日志和快照。
:::

如果定义了分层磁盘配置（为最新文件使用单独的磁盘），Keeper 会在启动时尝试自动将文件移动到正确的磁盘。
仍然提供与之前相同的保证：在文件完全移动到新磁盘之前，不会从旧磁盘上删除它，因此可以安全地多次重启。

如果需要将文件移动到一块全新的磁盘（或从双磁盘配置迁移到单磁盘配置），可以使用多个 `keeper_server.old_snapshot_storage_disk` 和 `keeper_server.old_log_storage_disk` 定义。

以下配置展示了如何从之前的双磁盘配置迁移到一个全新的单磁盘配置：


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
同样，所有快照文件都会从 `snapshot_local` 和 `snapshot_s3_plain` 移动到 `snapshot_local2` 磁盘。


## 配置日志缓存 {#configuring-logs-cache}

为了尽量减少从磁盘读取的数据量，Keeper 会在内存中缓存日志条目。
如果请求很大，日志条目会占用过多内存，因此缓存的日志数据量会被限制。
该限制由以下两个配置项控制：
- `latest_logs_cache_size_threshold` - 缓存中存储的最新日志的总大小
- `commit_logs_cache_size_threshold` - 接下来需要提交的后续日志的总大小

如果默认值过大，可以通过降低这两个配置项来减少内存使用。

:::note
可以使用 `pfev` 命令检查从每个缓存以及从文件读取的日志量。
也可以使用 Prometheus 端点中的指标来跟踪这两个缓存的当前大小。
:::



## Prometheus {#prometheus}

Keeper 可以对 [Prometheus](https://prometheus.io) 暴露指标数据，以供抓取。

设置：

* `endpoint` – Prometheus 服务器用于抓取指标的 HTTP 端点，应以 &#39;/&#39; 开头。
* `port` – `endpoint` 所使用的端口。
* `metrics` – 开关，用于暴露 [system.metrics](/operations/system-tables/metrics) 表中的指标。
* `events` – 开关，用于暴露 [system.events](/operations/system-tables/events) 表中的指标。
* `asynchronous_metrics` – 开关，用于暴露 [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 表中的当前指标值。

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

另请参阅 ClickHouse Cloud 的 [Prometheus 集成](/integrations/prometheus)。


## ClickHouse Keeper 用户指南 {#clickhouse-keeper-user-guide}

本指南提供了一组简单且最小化的设置，用于配置 ClickHouse Keeper，并通过一个示例演示如何测试分布式操作。该示例在 Linux 上使用 3 个节点完成。

### 1. 使用 Keeper 设置配置节点 {#1-configure-nodes-with-keeper-settings}

1. 在 3 台主机（`chnode1`、`chnode2`、`chnode3`）上安装 3 个 ClickHouse 实例。（有关安装 ClickHouse 的详细信息，请参阅[快速开始](/getting-started/install/install.mdx)。）

2. 在每个节点上添加以下条目，以允许通过网络接口进行外部通信。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 在所有三台服务器上添加以下 ClickHouse Keeper 配置，并为每台服务器更新 `<server_id>` 设置；例如 `chnode1` 为 `1`，`chnode2` 为 `2`，依此类推。
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

    上面使用的是以下基本设置：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |供 keeper 客户端使用的端口|9181，等同于 zookeeper 中的默认端口 2181|
    |server_id| 在 raft 配置中为每个 ClickHouse Keeper 服务器设置的标识符| 1|
    |coordination_settings| 用于配置诸如超时等参数的部分| 超时：10000，日志级别：trace|
    |server    |参与的服务器的定义|每台服务器的定义列表|
    |raft_configuration| keeper 集群中每台服务器的设置| 每台服务器及其相关设置|
    |id      |keeper 服务中服务器的数字 ID|1|
    |hostname   |keeper 集群中每台服务器的主机名、IP 或 FQDN|`chnode1.domain.com`|
    |port|用于 keeper 服务器间连接监听的端口|9234|

4. 启用 Zookeeper 组件。它将使用 ClickHouse Keeper 引擎：
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

    上面使用的是以下基本设置：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |用于 ClickHouse Keeper 连接的节点列表|每台服务器的一条配置记录|
    |host|每个 ClickHouse Keeper 节点的主机名、IP 或 FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper 客户端端口| 9181|

5. 重启 ClickHouse 并验证每个 Keeper 实例是否正在运行。在每台服务器上执行以下命令。如果 Keeper 正常运行且处于健康状态，`ruok` 命令将返回 `imok`：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` 数据库中有一张名为 `zookeeper` 的表，其中包含 ClickHouse Keeper 实例的详细信息。我们来查看该表：
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

### 2.  在 ClickHouse 中配置集群 {#2--configure-a-cluster-in-clickhouse}

1. 让我们在 2 个节点上配置一个包含 2 个分片且每个分片只有 1 个副本的简单集群。第三个节点将用于满足 ClickHouse Keeper 的仲裁（quorum）要求。在 `chnode1` 和 `chnode2` 上更新配置。下面的集群配置在每个节点上定义了 1 个分片，总计 2 个分片且无复制。在此示例中，一部分数据会位于一个节点上，另一部分数据会位于另一个节点上：

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
   | replica   | 每个副本的配置列表                 | 每个副本的配置项             |
   | host      | 将托管副本分片的服务器的主机名、IP 或 FQDN | `chnode1.domain.com` |
   | port      | 使用原生 TCP 协议进行通信的端口        | 9000                 |
   | user      | 用于对集群实例进行身份验证的用户名         | default              |
   | password  | 为该用户设置的密码，用于允许连接到集群实例     | `ClickHouse123!`     |

2. 重启 ClickHouse 并验证集群是否已创建：

   ```bash
   SHOW clusters;
   ```

   你应该能看到你的集群：

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. 创建并测试分布式表 {#3-create-and-test-distributed-table}

1. 使用 `chnode1` 上的 ClickHouse 客户端在新集群上创建一个新的数据库。`ON CLUSTER` 子句会自动在两个节点上创建该数据库。
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

6. 可以创建一个 `Distributed` 表来汇总表示两个分片上的数据。使用 `Distributed` 表引擎的表本身不存储任何数据，但允许在多个服务器上进行分布式查询处理。读操作会访问所有分片，写操作可以分布到各个分片上。在 `chnode1` 上运行以下查询：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. 注意，对 `dist_table` 发起查询会返回来自两个分片的全部四行数据：
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

本指南演示了如何使用 ClickHouse Keeper 来设置集群。借助 ClickHouse Keeper，可以配置集群并定义可以在分片间复制的分布式表。



## 使用唯一路径配置 ClickHouse Keeper {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 描述 {#description}

本文介绍如何使用内置的 `{uuid}` 宏配置项，
在 ClickHouse Keeper 或 ZooKeeper 中创建唯一条目。唯一路径
在频繁创建和删除表时非常有用，因为
这避免了需要等待数分钟让 Keeper 垃圾回收
去清理路径条目；每次创建路径时，都会在该路径中使用新的 `uuid`，
路径从不复用。

### 示例环境 {#example-environment}

一个由三个节点组成的集群，将被配置为在所有三个节点上运行 ClickHouse Keeper，
并在其中两个节点上运行 ClickHouse。这样为 ClickHouse Keeper 提供了三个节点（包括一个仲裁节点），
以及一个由两个副本组成的单个 ClickHouse 分片。

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

### 将表设置为使用 `{uuid}` 的步骤 {#procedures-to-set-up-tables-to-use-uuid}

1. 在每台服务器上配置宏（Macros）\
   以服务器 1 为例：

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
请注意，我们为 `shard` 和 `replica` 定义了宏，但 `{uuid}` 并未在此处定义，它是内置的，无需显式定义。
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

查询 ID: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. 利用宏和 `{uuid}` 在集群上创建表

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

1. 向第一个节点插入数据（例如 `chnode1`）

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

1 行数据。耗时: 0.033 秒。
```

2. 向第二个节点插入数据（例如 `chnode2`）

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

查询 ID: edc6f999-3e7d-40a0-8a29-3137e97e3607

完成。

结果集包含 1 行。耗时: 0.529 秒。
```

3. 通过分布式表查看记录

```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

查询 ID: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

返回 2 行。用时:0.007 秒。
```

### 替代方案 {#alternatives}

可以通过宏预先定义默认复制路径，并同时使用 `{uuid}`。

1. 在每个节点上为表设置默认默认路径

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
如果某些节点仅用于特定数据库，你也可以在每个节点上定义一个 `{database}` 宏。
:::

2. 在不显式指定参数的情况下创建表：

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

结果共 2 行。耗时：1.175 秒。

````

3. 验证其使用了默认配置中的设置
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

返回 1 行。用时：0.003 秒。
```

### 故障排查 {#troubleshooting}

示例命令，用于获取表信息和 UUID：

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

用于获取 ZooKeeper 中上述表的 UUID 相关信息的示例命令

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
数据库必须为 `Atomic`。如果是从之前的版本升级，则 `default` 数据库很可能是 `Ordinary` 类型。
:::

检查方式：

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

如果开启了 `keeper_server.enable_reconfiguration`，ClickHouse Keeper 对用于动态集群重新配置的 ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) 命令提供部分支持。

:::note
如果该设置关闭，您可以通过手动修改各副本的 `raft_configuration` 节来重新配置集群。请确保在所有副本上都编辑这些文件，因为只有 leader 会应用更改。
或者，您也可以通过任何兼容 ZooKeeper 的客户端发送 `reconfig` 查询。
:::

虚拟节点 `/keeper/config` 中包含最近一次提交的集群配置，格式如下：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

* 每个服务器条目以换行符分隔。
* `server_type` 可以是 `participant` 或 `learner`（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) 不参与 leader 选举）。
* `server_priority` 是一个非负整数，用于指定[在 leader 选举时应优先选择哪些节点](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)。
  优先级为 0 表示该服务器永远不会成为 leader。

示例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

可以使用 `reconfig` 命令来添加新服务器、删除现有服务器以及修改现有服务器的优先级，下面是一些示例（使用 `clickhouse-keeper-client`）：


```bash
# 添加两台新服务器 {#add-two-new-servers}
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# 移除另外两台服务器 {#remove-two-other-servers}
reconfig remove "3,4"
# 将现有服务器的优先级更改为 8 {#change-existing-server-priority-to-8}
reconfig add "server.5=localhost:5123;participant;8"
```

以下是 `kazoo` 的示例：


```python
# 添加两台新服务器，移除两台现有服务器 {#add-two-new-servers-remove-two-other-servers}
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```


# 将现有服务器的优先级更改为 8 {#change-existing-server-priority-to-8}

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

`joining` 中的服务器应采用上述服务器格式。服务器条目之间应以逗号分隔。
添加新服务器时,可以省略 `server_priority`(默认值为 1)和 `server_type`(默认值为 `participant`)。

如果要更改现有服务器的优先级,请将其添加到 `joining` 中并指定目标优先级。
服务器主机、端口和类型必须与现有服务器配置一致。

服务器按照在 `joining` 和 `leaving` 中出现的顺序进行添加和删除。
来自 `joining` 的所有更新会在来自 `leaving` 的更新之前处理。

Keeper 重新配置实现中存在以下注意事项:

- 仅支持增量重新配置。包含非空 `new_members` 的请求将被拒绝。

  ClickHouse Keeper 实现依赖 NuRaft API 来动态更改成员关系。NuRaft 提供了每次添加或删除单个服务器的方式。这意味着每次配置更改(`joining` 的每个部分、`leaving` 的每个部分)必须单独决定。因此不提供批量重新配置功能,因为这会对最终用户造成误导。

  更改服务器类型(participant/learner)也不可行,因为 NuRaft 不支持此功能,唯一的方法是先删除再添加服务器,这同样会造成误导。

- 无法使用返回的 `znodestat` 值。
- 不使用 `from_version` 字段。所有设置了 `from_version` 的请求都将被拒绝。
  这是因为 `/keeper/config` 是一个虚拟节点,这意味着它不存储在持久化存储中,而是针对每个请求使用指定的节点配置动态生成。
  做出此决定是为了避免数据重复,因为 NuRaft 已经存储了此配置。
- 与 ZooKeeper 不同,无法通过提交 `sync` 命令来等待集群重新配置完成。
  新配置将_最终_应用,但无法保证具体时间。
- `reconfig` 命令可能因各种原因失败。您可以检查集群状态以确认更新是否已应用。
```


## 将单节点 keeper 转换为集群 {#converting-a-single-node-keeper-into-a-cluster}

有时需要将用于实验的单个 keeper 节点扩展为一个集群。下面是将其一步步扩展为 3 节点集群的示意流程：

- **重要**：新增节点必须分批添加，每批数量需小于当前仲裁数，否则它们会在彼此之间选举出一个 leader。本示例中为逐个添加。
- 现有 keeper 节点必须开启 `keeper_server.enable_reconfiguration` 配置参数。
- 启动第二个节点，使用 keeper 集群的全新完整配置。
- 启动完成后，使用 [`reconfig`](#reconfiguration) 将其添加到节点 1。
- 然后，启动第三个节点，并使用 [`reconfig`](#reconfiguration) 将其添加进来。
- 在 `clickhouse-server` 配置中添加新的 keeper 节点以更新配置，并重启以应用更改。
- 更新节点 1 的 raft 配置，并在需要时选择性地重启它。

为便于熟悉这一过程，这里提供了一个 [sandbox 仓库](https://github.com/ClickHouse/keeper-extend-cluster)。



## 不支持的功能 {#unsupported-features}

虽然 ClickHouse Keeper 旨在与 ZooKeeper 完全兼容，但目前仍有一些功能尚未实现（相关开发仍在进行中）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持返回 `Stat` 对象
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持 [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) 无法与 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) 类型的 watch 一起使用
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) 和 [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) 不支持
- 不支持 `setWatches`
- 不支持创建 [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 类型的 znode
- 不支持 [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)（SASL 身份验证）
