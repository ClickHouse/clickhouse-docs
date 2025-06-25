---
'slug': '/guides/sre/keeper/clickhouse-keeper'
'sidebar_label': '配置 ClickHouse Keeper'
'sidebar_position': 10
'keywords':
- 'Keeper'
- 'ZooKeeper'
- 'clickhouse-keeper'
'description': 'ClickHouse Keeper，或 clickhouse-keeper，替代 ZooKeeper，提供复制和协调。'
'title': 'ClickHouse Keeper'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse Keeper (clickhouse-keeper)

<SelfManaged />

ClickHouse Keeper 提供数据 [复制](/engines/table-engines/mergetree-family/replication.md) 和 [分布式 DDL](/sql-reference/distributed-ddl.md) 查询执行的协调系统。 ClickHouse Keeper 与 ZooKeeper 兼容。
### 实现细节 {#implementation-details}

ZooKeeper 是第一个著名的开源协调系统之一。它用 Java 实现，具有简单而强大的数据模型。ZooKeeper 的协调算法，即 ZooKeeper 原子广播（ZAB），不提供读取的线性化保证，因为每个 ZooKeeper 节点都是本地服务读取。与 ZooKeeper 不同，ClickHouse Keeper 是用 C++ 编写的，并使用 [RAFT 算法](https://raft.github.io/) [实现](https://github.com/eBay/NuRaft)。此算法允许读取和写入的线性化，并有多种语言的开源实现。

默认情况下，ClickHouse Keeper 提供与 ZooKeeper 相同的保证：可线性化的写入和不可线性化的读取。它有一个兼容的客户端-服务器协议，因此可以使用任何标准的 ZooKeeper 客户端与 ClickHouse Keeper 进行交互。快照和日志的格式与 ZooKeeper 不兼容，但 `clickhouse-keeper-converter` 工具可以将 ZooKeeper 数据转换为 ClickHouse Keeper 快照。ClickHouse Keeper 中的服务器间协议也与 ZooKeeper 不兼容，因此不可能建立混合的 ZooKeeper / ClickHouse Keeper 集群。

ClickHouse Keeper 支持与 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) 相同的访问控制列表（ACL）。ClickHouse Keeper 支持相同的权限集，具有相同的内置方案：`world`，`auth` 和 `digest`。摘要身份验证方案使用配对 `username:password`，密码以 Base64 编码。

:::note
不支持外部集成。
:::
### 配置 {#configuration}

ClickHouse Keeper 可以作为 ZooKeeper 的独立替代品使用，也可以作为 ClickHouse 服务器的内部部分。在这两种情况下，配置几乎是相同的 `.xml` 文件。
#### Keeper 配置设置 {#keeper-configuration-settings}

主要的 ClickHouse Keeper 配置标签是 `<keeper_server>`，具有以下参数：

| 参数                                | 描述                                                                                                                                                                                                                                                 | 默认值                                                                                                      |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                          | 客户端连接的端口。                                                                                                                                                                                                                                   | `2181`                                                                                                       |
| `tcp_port_secure`                   | 客户端与 keeper-server 之间 SSL 连接的安全端口。                                                                                                                                                                                                      | -                                                                                                            |
| `server_id`                         | 唯一服务器 ID，ClickHouse Keeper 群集中的每个参与者必须具有唯一的数字（1，2，3，依此类推）。                                                                                                                                                              | -                                                                                                            |
| `log_storage_path`                  | 协调日志的路径，就像 ZooKeeper 一样，最好在不忙的节点上存储日志。                                                                                                                                                                                     | -                                                                                                            |
| `snapshot_storage_path`             | 协调快照的路径。                                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`            | 启用通过 [`reconfig`](#reconfiguration) 动态重新配置群集。                                                                                                                                                                                           | `False`                                                                                                      |
| `max_memory_usage_soft_limit`       | Keeper 最大内存使用的软限制（字节）。                                                                                                                                                                                                                | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio` | 如果未设置 `max_memory_usage_soft_limit` 或设置为零，则使用此值来定义默认软限制。                                                                                                                                                                          | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time` | 如果未设置或设置为 `0` ，则使用此时间间隔观察物理内存的数量。一旦内存量发生变化，我们将通过 `max_memory_usage_soft_limit_ratio` 重新计算 Keeper 的内存软限制。                                                                                | `15`                                                                                                         |
| `http_control`                      | [HTTP 控制](#http-control) 接口的配置。                                                                                                                                                                                                                | -                                                                                                            |
| `digest_enabled`                    | 启用实时数据一致性检查                                                                                                                                                                                                                                | `True`                                                                                                       |
| `create_snapshot_on_exit`           | 在关闭时创建快照                                                                                                                                                                                                                                     | -                                                                                                            |
| `hostname_checks_enabled`           | 启用群集配置的主机名有效性检查（例如，是否使用 localhost 与远程端点）                                                                                                                                                                                      | `True`                                                                                                       |
| `four_letter_word_white_list`       | 4lw 命令的白名单。                                                                                                                                                                                                                                     | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |


其他常见参数继承自 ClickHouse 服务器配置（`listen_host`，`logger` 等）。
#### 内部协调设置 {#internal-coordination-settings}

内部协调设置位于 `<keeper_server>.<coordination_settings>` 部分，并具有以下参数：

| 参数                                | 描述                                                                                                                                                                                                                                               | 默认值                                                                                                      |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`              | 单个客户端操作的超时（毫秒）                                                                                                                                                                                                                           | `10000`                                                                                                      |
| `min_session_timeout_ms`            | 客户端会话的最小超时（毫秒）                                                                                                                                                                                                                            | `10000`                                                                                                      |
| `session_timeout_ms`                | 客户端会话的最大超时（毫秒）                                                                                                                                                                                                                           | `100000`                                                                                                     |
| `dead_session_check_period_ms`      | ClickHouse Keeper 检查死会话并将其删除的频率（毫秒）                                                                                                                                                                                                    | `500`                                                                                                        |
| `heart_beat_interval_ms`            | ClickHouse Keeper 领导者向跟随者发送心跳的频率（毫秒）                                                                                                                                                                                                | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`   | 如果跟随者在此时间间隔内未收到来自领导者的心跳，则可以发起领导者选举。必须小于或等于 `election_timeout_upper_bound_ms`。理想情况下它们不应相等。                                                                                                               | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`   | 如果跟随者在此时间间隔内未收到来自领导者的心跳，则必须发起领导者选举。                                                                                                                                                                                  | `2000`                                                                                                       |
| `rotate_log_storage_interval`       | 在单个文件中存储多少条日志记录。                                                                                                                                                                                                                        | `100000`                                                                                                     |
| `reserved_log_items`                | 在压缩之前要存储多少条协调日志记录。                                                                                                                                                                                                                    | `100000`                                                                                                     |
| `snapshot_distance`                 | ClickHouse Keeper 将多长时间创建新快照（以日志中的记录数计算）。                                                                                                                                                                                         | `100000`                                                                                                     |
| `snapshots_to_keep`                 | 要保留多少个快照。                                                                                                                                                                                                                                     | `3`                                                                                                          |
| `stale_log_gap`                     | 领导者认为跟随者过时的阈值，并向其发送快照而不是日志。                                                                                                                                                                                                    | `10000`                                                                                                      |
| `fresh_log_gap`                     | 节点变得新鲜的时间。                                                                                                                                                                                                                                     | `200`                                                                                                        |
| `max_requests_batch_size`           | 在发送给 RAFT 之前请求批处理的最大大小（请求计数）。                                                                                                                                                                                                    | `100`                                                                                                        |
| `force_sync`                        | 在每次写入协调日志时调用 `fsync`。                                                                                                                                                                                                                     | `true`                                                                                                       |
| `quorum_reads`                      | 通过整个 RAFT 共识以类似速度执行读取请求作为写入。                                                                                                                                                                                                        | `false`                                                                                                      |
| `raft_logs_level`                   | 有关协调的文本日志级别（trace，debug 等）。                                                                                                                                                                                                             | `system default`                                                                                             |
| `auto_forwarding`                   | 允许将跟随者的写入请求转发给领导者。                                                                                                                                                                                                                     | `true`                                                                                                       |
| `shutdown_timeout`                  | 等待完成内部连接并关闭（毫秒）。                                                                                                                                                                                                                         | `5000`                                                                                                       |
| `startup_timeout`                   | 如果服务器未在指定超时内连接到其他法定成员，则将终止（毫秒）。                                                                                                                                                                                               | `30000`                                                                                                      |
| `async_replication`                 | 启用异步复制。在实现更好的性能的同时保留所有写入和读取保证。该设置默认禁用，以避免破坏向后兼容性。                                                                                                                                                | `false`                                                                                                      |
| `latest_logs_cache_size_threshold`  | 最新日志条目内存中缓存的最大总大小                                                                                                                                                                                                                     | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold`  | 下一个提交所需的日志条目内存中缓存的最大总大小                                                                                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`         | 在文件在磁盘之间移动时发生故障后，等待重试之间的等待时间                                                                                                                                                                                                    | `1000`                                                                                                       |
| `disk_move_retries_during_init`     | 在初始化过程中在文件在磁盘之间移动时发生故障后的重试次数                                                                                                                                                                                                 | `100`                                                                                                        |
| `experimental_use_rocksdb`          | 使用 rocksdb 作为后端存储                                                                                                                                                                                                                                   | `0`                                                                                                          |

法定配置位于 `<keeper_server>.<raft_configuration>` 部分，其中包含服务器描述。

整个法定的唯一参数是 `secure`，该参数启用法定成员之间通信的加密连接。如果需要在节点之间进行内部通信的 SSL 连接，则将参数设置为 `true`，否则可以不指定。

每个 `<server>` 的主要参数为：

- `id` — 法定中的服务器标识符。
- `hostname` — 该服务器所在的主机名。
- `port` — 该服务器侦听连接的端口。
- `can_become_leader` — 设置为 `false` 将服务器设置为 `learner`。如果省略，则值为 `true`。

:::note
在更改 ClickHouse Keeper 集群的拓扑时（例如，替换服务器），请确保保持 `server_id` 与 `hostname` 的映射一致，并避免为不同的服务器重新排列或重用现有 `server_id`（例如，如果您依赖于自动化脚本来部署 ClickHouse Keeper，可能会发生这种情况）。

如果 Keeper 实例的主机可以更改，建议定义和使用主机名，而不是原始 IP 地址。更改主机名等同于移除和重新添加服务器，这在某些情况下可能无法做到（例如，对于法定没有足够的 Keeper 实例）。
:::

:::note
`async_replication` 默认情况下被禁用，以避免破坏向后兼容性。如果您在群集中运行的所有 Keeper 实例都是支持 `async_replication` 的版本（v23.9+），我们建议启用它，因为它可以在没有任何缺点的情况下提高性能。
:::


包含三个节点的法定配置示例可在 [集成测试](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) 中找到，前缀为 `test_keeper_`。服务器 #1 的示例配置：

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

ClickHouse Keeper 包含在 ClickHouse 服务器包中，只需将 `<keeper_server>` 的配置添加到 `/etc/your_path_to_config/clickhouse-server/config.xml` 中，然后像往常一样启动 ClickHouse 服务器。如果您想单独运行 ClickHouse Keeper，可以以类似方式启动它：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

如果您没有符号链接（`clickhouse-keeper`），可以创建它或将 `keeper` 作为参数指定给 `clickhouse`：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### 四字母命令 {#four-letter-word-commands}

ClickHouse Keeper 还提供 4lw 命令，这些命令与 Zookeeper 几乎相同。每个命令由四个字母组成，例如 `mntr`，`stat` 等。有一些更有趣的命令：`stat` 提供有关服务器和连接客户端的一些一般信息，而 `srvr` 和 `cons` 分别提供有关服务器和连接的详细信息。

4lw 命令有一个白名单配置 `four_letter_word_white_list`，其默认值为 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`。

您可以通过 telnet 或 nc 在客户端端口向 ClickHouse Keeper 发出命令。

```bash
echo mntr | nc localhost 9181
```

以下是详细的 4lw 命令：

- `ruok`：测试服务器是否处于非错误状态。如果服务器正在运行，将响应 `imok`。否则，将根本不响应。响应 `imok` 并不一定表示服务器已加入法定，只表示服务器进程处于活动状态并绑定到指定的客户端端口。使用 "stat" 获取有关法定和客户端连接信息的状态详细信息。

```response
imok
```

- `mntr`：输出可用于监控集群健康状况的变量列表。

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

- `srvr`：列出服务器的完整详细信息。

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

- `stat`：列出服务器和连接客户端的简要详细信息。

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

- `srst`：重置服务器统计信息。该命令将影响 `srvr`，`mntr` 和 `stat` 的结果。

```response
Server stats reset.
```

- `conf`：打印有关服务配置的详细信息。

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

- `cons`：列出所有连接到该服务器的客户端的完整连接/会话详细信息。包括接收/发送的数据包数量、会话 ID、操作延迟、上次执行的操作等信息...

```response
192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`：重置所有连接的连接/会话统计信息。

```response
Connection stats reset.
```

- `envi`：打印有关服务环境的详细信息

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


- `dirs`：显示快照和日志文件的总大小（以字节为单位）

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`：测试服务器是否以只读模式运行。如果在只读模式下，服务器将响应 `ro`；如果未处于只读模式，则响应 `rw`。

```response
rw
```

- `wchs`：列出服务器的监视信息的简要信息。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`：按会话列出服务器的监视详细信息。输出与关联监视路径（路径）的会话（连接）列表。注意，根据监视的数量，可能会很昂贵（影响服务器性能），请谨慎使用。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`：按路径列出服务器的监视详细信息。输出与关联会话的路径（znodes）列表。注意，根据监视的数量，可能会很昂贵（即影响服务器性能），请谨慎使用。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`：列出未完成的会话和临时节点。此操作仅适用于领导者。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`：调度快照创建任务。如果调度的快照成功，将返回最后提交的日志索引；如果失败，则返回 `Failed to schedule snapshot creation task.`。请注意，`lgif` 命令可以帮助您确定快照是否完成。

```response
100
```

- `lgif`：Keeper 日志信息。`first_log_idx` : 我在日志存储中的第一个日志索引；`first_log_term` : 我在日志中的第一个日志任期；`last_log_idx` : 我在日志存储中的最后一个日志索引；`last_log_term` : 我的最后一个日志任期；`last_committed_log_idx` : 我在状态机中最后提交的日志索引；`leader_committed_log_idx` : 从我的角度看，领导者提交的日志索引；`target_committed_log_idx` : 应提交的目标日志索引；`last_snapshot_idx` : 最近快照中的最大已提交日志索引。

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

- `rqld`：请求成为新的领导者。如果请求已发送，将返回 `Sent leadership request to leader.`，如果请求未发送，将返回 `Failed to send leadership request to leader.`。请注意，如果节点已经是领导者，结果与请求相同。

```response
Sent leadership request to leader.
```

- `ftfl`：列出所有功能标志及其是否为 Keeper 实例启用。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`：请求放弃领导权并成为跟随者。如果接收请求的服务器是领导者，它将首先暂停写入操作，等待后继者（当前领导者绝不能是后继者）完成对最新日志的赶超，然后辞职。后继者将被自动选择。如果请求发送，将返回 `Sent yield leadership request to leader.`，如果请求未发送，将返回 `Failed to send yield leadership request to leader.`。请注意，如果节点已经是跟随者，结果与请求相同。

```response
Sent yield leadership request to leader.
```

- `pfev`：返回所有收集事件的值。对于每个事件，它返回事件名称、事件值和事件描述。

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

ClickHouse Keeper 提供 HTTP 接口以检查副本是否准备好接收流量。它可用于云环境，例如 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)。

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
### 功能标志 {#feature-flags}

Keeper 完全兼容 ZooKeeper 及其客户端，但它还引入了一些唯一的功能和请求类型，可供 ClickHouse 客户端使用。
由于这些功能可能会引入向后不兼容的更改，因此默认情况下大多数功能都处于禁用状态，可以通过 `keeper_server.feature_flags` 配置启用。
所有功能都可以显式禁用。
如果要为 Keeper 群集启用新功能，建议首先将群集中所有 Keeper 实例更新为支持该功能的版本，然后再启用该功能。

禁用 `multi_read` 和启用 `check_not_exists` 的功能标志配置示例：

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

以下功能可用：

- `multi_read` - 支持读取多个请求。默认值：`1`
- `filtered_list` - 支持按节点类型（临时或持久）过滤结果的列表请求。默认值：`1`
- `check_not_exists` - 支持 `CheckNotExists` 请求，断言节点不存在。默认值：`0`
- `create_if_not_exists` - 支持 `CreateIfNotExists` 请求，如果节点不存在则尝试创建。如果存在，则不应用任何更改，并返回 `ZOK`。默认值：`0`
- `remove_recursive` - 支持 `RemoveRecursive` 请求，删除该节点及其子树。默认值：`0`
### 从 ZooKeeper 迁移 {#migration-from-zookeeper}

从 ZooKeeper 无缝迁移到 ClickHouse Keeper 是不可能的。您必须停止 ZooKeeper 群集，转换数据，然后启动 ClickHouse Keeper。 `clickhouse-keeper-converter` 工具可将 ZooKeeper 日志和快照转换为 ClickHouse Keeper 快照。它仅适用于 ZooKeeper > 3.4。迁移步骤：

1. 停止所有 ZooKeeper 节点。

2. 可选，但建议：找到 ZooKeeper 领导节点，启动并停止它。这将强制 ZooKeeper 创建一致的快照。

3. 在领导节点上运行 `clickhouse-keeper-converter`，例如：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 将快照复制到配置了 `keeper` 的 ClickHouse 服务器节点或启动 ClickHouse Keeper 代替 ZooKeeper。快照必须在所有节点上持久存在，否则空节点可能更快，其中一个可能成为领导者。

:::note
`keeper-converter` 工具在 Keeper 独立二进制文件中不可用。
如果您已安装 ClickHouse，可以直接使用该二进制文件：

```bash
clickhouse keeper-converter ...
```

否则，您可以 [下载二进制文件](/getting-started/quick-start#download-the-binary) 并按照上述描述运行该工具，而无需安装 ClickHouse。
:::
### 恢复失去的法定人数 {#recovering-after-losing-quorum}

由于 ClickHouse Keeper 使用 Raft，它可以容忍一定数量的节点崩溃，具体取决于集群的大小。 \
例如，对于一个 3 节点集群，如果只有 1 个节点崩溃，它将继续正常工作。

集群配置可以动态配置，但存在一些限制。重新配置同样依赖于 Raft，因此要添加/移除节点，您需要拥有法定人数。如果您同时失去了集群中的太多节点，且没有任何机会重新启动它们，Raft 将停止工作，并不允许您以常规方式重新配置集群。

然而，ClickHouse Keeper 具有恢复模式，允许您仅使用 1 个节点强制重新配置集群。只有在您无法再次启动节点或在同一端点上启动新实例时，这种操作才应作为最后的手段进行。

继续之前要注意的重要事项：
- 确保失败的节点无法再次连接到集群。
- 在步骤规定之前，请勿启动任何新节点。

确保上述事项为真后，您需要执行以下操作：
1. 选择一个 Keeper 节点作为新的领导者。请注意，该节点的数据将用于整个集群，因此建议使用状态最新的节点。
2. 在做其他任何事情之前，备份所选节点的 `log_storage_path` 和 `snapshot_storage_path` 文件夹。
3. 在您想要使用的所有节点上重新配置集群。
4. 向您选择的节点发送四字母命令 `rcvr`，这将使该节点进入恢复模式，或者停止所选节点上的 Keeper 实例，然后使用 `--force-recovery` 参数重新启动它。
5. 一一启动新节点上的 Keeper 实例，确保在启动下一个实例之前，`mntr` 对 `zk_server_state` 返回 `follower`。
6. 在恢复模式下，领导者节点将对 `mntr` 命令返回错误消息，直到它与新节点达成法定人数为止，并拒绝来自客户端和跟随者的任何请求。
7. 达成法定人数后，领导者节点将恢复正常操作模式，接受所有请求并通过 Raft 验证，`mntr` 应该对 `zk_server_state` 返回 `leader`。

## 使用 Keeper 的磁盘 {#using-disks-with-keeper}

Keeper 支持一部分 [外部磁盘](/operations/storing-data.md) 用于存储快照、日志文件和状态文件。

支持的磁盘类型有：
- s3_plain
- s3
- local

以下是包含在配置中的磁盘定义示例。

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

要为日志使用磁盘，`keeper_server.log_storage_disk` 配置应设置为磁盘名称。
要为快照使用磁盘，`keeper_server.snapshot_storage_disk` 配置应设置为磁盘名称。
此外，可以通过使用 `keeper_server.latest_log_storage_disk` 和 `keeper_server.latest_snapshot_storage_disk` 分别为最新日志或快照使用不同的磁盘。
在这种情况下，Keeper 会在创建新日志或快照时自动将文件移动到正确的磁盘。
要为状态文件使用磁盘，`keeper_server.state_storage_disk` 配置应设置为磁盘名称。

在磁盘之间移动文件是安全的，如果 Keeper 在传输中停止，数据不会丢失。
在文件完全移动到新磁盘之前，它不会从旧磁盘中删除。

将 `keeper_server.coordination_settings.force_sync` 设置为 `true`（默认值为 `true`）的 Keeper 无法满足所有类型磁盘的一些保证。
目前，只有类型为 `local` 的磁盘支持持久同步。
如果使用 `force_sync`，`log_storage_disk` 应该是一个 `local` 磁盘，前提是未使用 `latest_log_storage_disk`。
如果使用 `latest_log_storage_disk`，它应该始终是一个 `local` 磁盘。
如果禁用 `force_sync`，所有类型的磁盘可以在任何设置中使用。

Keeper 实例的可能存储设置如下所示：

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

该实例将所有但最新的日志存储在 `log_s3_plain` 磁盘上，而最新的日志将位于 `log_local` 磁盘上。
同样的逻辑适用于快照，所有但最新的快照将存储在 `snapshot_s3_plain` 中，而最新的快照将位于 `snapshot_local` 磁盘上。
### 更改磁盘设置 {#changing-disk-setup}

:::important
在应用新磁盘设置之前，请手动备份所有 Keeper 日志和快照。
:::

如果定义了分层磁盘设置（使用单独的磁盘用于最新文件），Keeper 在启动时将尝试自动将文件移动到正确的磁盘。
同样的保证适用于前面；在文件完全移动到新磁盘之前，它不会从旧磁盘中删除，因此可以安全地进行多次重启。

如果需要将文件移动到全新的磁盘（或从 2 磁盘设置移动到单一磁盘设置），可以使用多个定义的 `keeper_server.old_snapshot_storage_disk` 和 `keeper_server.old_log_storage_disk`。

以下配置展示了我们如何从以前的 2 磁盘设置移动到全新的单磁盘设置：

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

在启动时，所有日志文件将从 `log_local` 和 `log_s3_plain` 移动到 `log_local2` 磁盘。
同时，所有快照文件将从 `snapshot_local` 和 `snapshot_s3_plain` 移动到 `snapshot_local2` 磁盘。
## 配置日志缓存 {#configuring-logs-cache}

为了最小化从磁盘读取的数据量，Keeper 在内存中缓存日志条目。
如果请求很大，日志条目将占用过多内存，因此缓存的日志数量有上限。
该限制由以下两个配置控制：
- `latest_logs_cache_size_threshold` - 缓存中存储的最新日志的总大小
- `commit_logs_cache_size_threshold` - 下一个需要提交的后续日志的总大小

如果默认值太大，可以通过减少这两个配置来降低内存使用。

:::note
您可以使用 `pfev` 命令检查从每个缓存和文件中读取的日志数量。
您还可以使用 Prometheus 端点的度量来跟踪两个缓存的当前大小。
:::
## Prometheus {#prometheus}

Keeper 可以公开供 [Prometheus](https://prometheus.io) 抓取的度量数据。

设置：

- `endpoint` - Prometheus 服务器抓取度量的 HTTP 端点。以 '/' 开头。
- `port` - `endpoint` 的端口。
- `metrics` - 设置为从 [system.metrics](/operations/system-tables/metrics) 表中公开度量的标志。
- `events` - 设置为从 [system.events](/operations/system-tables/events) 表中公开度量的标志。
- `asynchronous_metrics` - 设置为从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中公开当前度量值的标志。

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

检查（用您的 ClickHouse 服务器的 IP 地址或主机名替换 `127.0.0.1`）：
```bash
curl 127.0.0.1:9363/metrics
```

另请参见 ClickHouse Cloud [Prometheus 集成](/integrations/prometheus)。
## ClickHouse Keeper 用户指南 {#clickhouse-keeper-user-guide}

本指南提供了简单且最小的设置，以配置 ClickHouse Keeper，并示范如何测试分布式操作。该示例使用 3 个在 Linux 上的节点进行。
### 1. 配置带 Keeper 设置的节点 {#1-configure-nodes-with-keeper-settings}

1. 在 3 个主机上安装 3 个 ClickHouse 实例（`chnode1`，`chnode2`，`chnode3`）。 （查看 [快速入门](/getting-started/install/install.mdx) 获取有关安装 ClickHouse 的详细信息。）

2. 在每个节点上添加以下条目，以允许通过网络接口进行外部通信。
```xml
<listen_host>0.0.0.0</listen_host>
```

3. 将以下 ClickHouse Keeper 配置添加到所有三个服务器中，更新每个服务器的 `<server_id>` 设置；对于 `chnode1` 应为 `1`，对于 `chnode2` 应为 `2`，以此类推。
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

    这些是上述使用的基本设置：

    |参数 |描述                   |示例              |
    |----------|------------------------------|---------------------|
    |tcp_port   | Keeper 客户端使用的端口|9181，默认值对应 ZooKeeper 的 2181|
    |server_id| 在 Raft 配置中每个 ClickHouse Keeper 服务器的标识符| 1|
    |coordination_settings| 超时等参数的部分| 超时：10000，日志级别：trace|
    |server    | 参与服务器的定义|每个服务器定义的列表|
    |raft_configuration| Keeper 集群中每个服务器的设置| 每个服务器及其设置|
    |id      | Keeper 服务的服务器数字 ID|1|
    |hostname   | Keeper 集群中每个服务器的主机名、IP 或完全合格域名|`chnode1.domain.com`|
    |port|用于监听内部 Keeper 连接的端口|9234|


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

    这些是上述使用的基本设置：

    |参数 |描述                   |示例              |
    |----------|------------------------------|---------------------|
    |node   | ClickHouse Keeper 连接的节点列表|每个服务器的设置条目|
    |host| ClickHouse Keeper 节点的主机名、IP 或完全合格域名| `chnode1.domain.com`|
    |port|ClickHouse Keeper 客户端端口| 9181|

5. 重启 ClickHouse 并验证每个 Keeper 实例是否正在运行。在每个服务器上执行以下命令。`ruok` 命令返回 `imok`，如果 Keeper 正在运行且健康：
```bash

# echo ruok | nc localhost 9181; echo
imok
```

6. `system` 数据库中有一个名为 `zookeeper` 的表，包含您的 ClickHouse Keeper 实例的详细信息。让我们查看该表：
```sql
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

    表如下所示：
```response
┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
│ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
│ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
│ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
└────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
```
### 2. 在 ClickHouse 中配置集群 {#2--configure-a-cluster-in-clickhouse}

1. 让我们配置一个简单的集群，包含 2 个分片和 2 个节点上的一个副本。第三个节点将用于实现 ClickHouse Keeper 中的法定人数。更新 `chnode1` 和 `chnode2` 的配置。以下集群定义每个节点上有 1 个分片，总共 2 个分片，没有复制。在此示例中，一些数据将在一个节点上，另一些数据将在另一个节点上：
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

    |参数 |描述                   |示例              |
    |----------|------------------------------|---------------------|
    |shard   | 集群定义中的副本列表|每个分片的副本列表|
    |replica| 每个副本的设置列表|每个副本的设置条目|
    |host| 将主机副本的服务器的主机名、IP 或完全合格域名|`chnode1.domain.com`|
    |port| 用于使用本地 TCP 协议进行通信的端口|9000|
    |user| 用于对集群实例进行身份验证的用户名|default|
    |password| 允许连接到集群实例的用户的密码|`ClickHouse123!`|


2. 重启 ClickHouse 并验证集群是否创建成功：
```bash
SHOW clusters;
```

    您应该能看到您的集群：
```response
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```
### 3. 创建并测试分布式表 {#3-create-and-test-distributed-table}

1.  使用 ClickHouse 客户端在新集群上创建一个新数据库，`ON CLUSTER` 子句会自动在两个节点上创建该数据库。
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
```

2. 在 `db1` 数据库上创建一个新表。同样，`ON CLUSTER` 在两个节点上创建该表。
```sql
CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY column1
```

3. 在 `chnode1` 节点上添加几行：
```sql
INSERT INTO db1.table1
    (id, column1)
VALUES
    (1, 'abc'),
    (2, 'def')
```

4. 在 `chnode2` 节点上添加几行：
```sql
INSERT INTO db1.table1
    (id, column1)
VALUES
    (3, 'ghi'),
    (4, 'jkl')
```

5. 请注意，在每个节点上运行 `SELECT` 语句仅显示该节点上的数据。例如，在 `chnode1` 上：
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

6. 您可以创建一个 `Distributed` 表来表示两个分片上的数据。带有 `Distributed` 表引擎的表不会存储自己的数据，而是允许在多个服务器上进行分布式查询处理。读取会命中所有的分片，而写入可以分布在分片之间。在 `chnode1` 上运行以下查询：
```sql
CREATE TABLE db1.dist_table (
    id UInt64,
    column1 String
)
ENGINE = Distributed(cluster_2S_1R,db1,table1)
```

7. 查询 `dist_table` 返回来自两个分片的所有四行数据：
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

本指南演示了如何使用 ClickHouse Keeper 设置集群。借助 ClickHouse Keeper，您可以配置集群并定义可以在分片之间复制的分布式表。
## 使用唯一路径配置 ClickHouse Keeper {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### 描述 {#description}

本文介绍了如何使用内置的 `{uuid}` 宏设置在 ClickHouse Keeper 或 ZooKeeper 中创建唯一条目。唯一路径在频繁创建和删除表时非常有用，因为这避免了必须等待几分钟的 Keeper 垃圾收集以删除路径条目，因为每次创建路径时都会使用新的 `uuid`；路径永远不会重用。
### 示例环境 {#example-environment}
一个三节点集群，将配置在所有三个节点上运行 ClickHouse Keeper，并在两个节点上运行 ClickHouse。这为 ClickHouse Keeper 提供了三个节点（包括一个决胜节点），以及由两个副本组成的单个 ClickHouse 分片。

|节点|描述|
|-----|-----|
|`chnode1.marsnet.local`|数据节点 - 集群 `cluster_1S_2R`|
|`chnode2.marsnet.local`|数据节点 - 集群 `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeper 决胜节点|

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
### 设置使用 `{uuid}` 的表的步骤 {#procedures-to-set-up-tables-to-use-uuid}

1. 在每个服务器上配置宏
服务器 1 的示例：
```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```
:::note
请注意，我们为 `shard` 和 `replica` 定义了宏，但这里不需要定义 `{uuid}`，它是内置的。
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

3. 使用宏和 `{uuid}` 创建集群上的表

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

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4.  创建一个分布式表

```sql
create table db_uuid.dist_uuid_table1 on cluster 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
```

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
1.  向第一个节点插入数据（例如 `chnode1`）
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

2. 向第二个节点插入数据（例如，`chnode2`）
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
默认复制路径可以预先通过宏定义，同时也可以使用 `{uuid}`

1. 在每个节点上为表设置默认值
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
如果节点用于某些数据库，您还可以在每个节点上定义宏 `{database}`。
:::

2. 创建没有显式参数的表：
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

Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 1.175 sec.
```

3. 验证它使用了默认配置中的设置
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

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
### 排查故障 {#troubleshooting}

获取表信息和 UUID 的示例命令：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

获取在 ZooKeeper 中具有 UUID 的表信息的示例命令
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
数据库必须是 `Atomic`，如果是从早期版本升级，则 `default` 数据库可能是 `Ordinary` 类型。
:::

检查：

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

如果将 `keeper_server.enable_reconfiguration` 设置为开启状态，ClickHouse Keeper 部分支持 ZooKeeper 的 [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
命令进行动态集群重新配置。

:::note
如果此设置关闭，您可以通过手动更改副本的 `raft_configuration` 部分来重新配置集群。确保在所有副本上编辑文件，因为只有领导者会应用更改。
另外，您可以通过任何兼容 ZooKeeper 的客户端发送 `reconfig` 查询。
:::

虚拟节点 `/keeper/config` 包含最后提交的集群配置，格式如下：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 每个服务器条目以换行符分隔。
- `server_type` 是 `participant` 或 `learner` （[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) 不参与领导者选举）。
- `server_priority` 是一个非负整数，用于告诉 [哪些节点应在领导者选举中优先](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)。
  优先级为 0 意味着服务器永远不会成为领导者。

示例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

您可以使用 `reconfig` 命令添加新服务器、移除现有服务器并更改现有服务器的优先级，以下是示例（使用 `clickhouse-keeper-client`）：

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


# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

在 `joining` 中的服务器应符合上述描述的服务器格式。服务器条目应以逗号分隔。
在添加新服务器时，您可以省略 `server_priority`（默认值为 1）和 `server_type`（默认值为 `participant`）。

如果您想更改现有服务器的优先级，请将其添加到 `joining` 并指定目标优先级。
服务器的主机、端口和类型必须与现有服务器配置相等。

服务器按其在 `joining` 和 `leaving` 中出现的顺序添加和移除。
`joining` 中的所有更新都在 `leaving` 中的更新之前处理。

在 Keeper 重新配置实现中有一些注意事项：

- 仅支持增量重新配置。带有非空 `new_members` 的请求将被拒绝。

  ClickHouse Keeper 的实现依赖于 NuRaft API 动态更改成员资格。NuRaft 提供了逐个添加或逐个删除单个服务器的方法。这意味着每次更改配置（`joining` 的每个部分、`leaving` 的每个部分）必须单独决定。因此，无法提供捆绑的重新配置，因为这对最终用户来说会产生误导。

  更改服务器类型（participant/learner）也是不可能的，因为 NuRaft 不支持，唯一的方法是删除并添加服务器，这同样会导致误导。

- 您无法使用返回的 `znodestat` 值。
- `from_version` 字段未使用。所有设置了 `from_version` 的请求都会被拒绝。
  这是因为 `/keeper/config` 是一个虚拟节点，这意味着它不存储在持久存储中，而是为每个请求动态生成指定的节点配置。
  做出这个决定是为了避免数据重复，因为 NuRaft 已经存储了此配置。
- 与 ZooKeeper 不同，没有办法通过提交 `sync` 命令等待集群重新配置。
  新配置将会_逐渐_应用，但没有时间保证。
- `reconfig` 命令可能因各种原因而失败。您可以检查集群的状态，看看更新是否已应用。
## 将单节点 Keeper 转换为集群 {#converting-a-single-node-keeper-into-a-cluster}

有时需要将实验性 Keeper 节点扩展为集群。以下是逐步执行 3 节点集群的方案：

- **重要**：新节点必须批量添加，数量少于当前法定人数，否则它们将相互选举领导者。在这个示例中一个接一个地添加。
- 现有的 Keeper 节点必须启用 `keeper_server.enable_reconfiguration` 配置参数。
- 启动第二个节点，使用完整的新 Keeper 集群配置。
- 启动后，将其添加到节点 1，使用 [`reconfig`](#reconfiguration)。
- 现在，启动第三个节点并使用 [`reconfig`](#reconfiguration) 将其添加。
- 更新 `clickhouse-server` 配置，在其中添加新的 Keeper 节点，然后重启以应用更改。
- 更新节点 1 的 raft 配置，并可选择性重启它。

为确保您对该过程有信心，这里有一个 [sandbox repository](https://github.com/ClickHouse/keeper-extend-cluster)。
## 不支持的功能 {#unsupported-features}

虽然 ClickHouse Keeper 旨在与 ZooKeeper 完全兼容，但目前有一些功能尚未实现（尽管开发仍在进行中）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持返回 `Stat` 对象
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))  不支持 [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) 不适用于 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) 监视器
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) 和 [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.WatcherType,boolean)) 不受支持
- `setWatches` 不受支持
- 创建 [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 类型的 znodes 不受支持
- 不支持 [`SASL 认证`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)
