---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 配置 ClickHouse Keeper
sidebar_position: 10
keywords:
  - Keeper
  - ZooKeeper
  - clickhouse-keeper
  - 复制
description: ClickHouse Keeper，或称 clickhouse-keeper，替代了 ZooKeeper，并提供复制和协调功能。
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper 提供数据 [复制](/engines/table-engines/mergetree-family/replication.md) 和 [分布式 DDL](/sql-reference/distributed-ddl.md) 查询执行的协调系统。ClickHouse Keeper 与 ZooKeeper 兼容。
### 实现细节 {#implementation-details}

ZooKeeper 是第一个知名的开源协调系统之一。它是用 Java 实现的，具有相当简单且强大的数据模型。ZooKeeper 的协调算法 ZooKeeper Atomic Broadcast (ZAB) 不提供读取的线性可化保证，因为每个 ZooKeeper 节点都是本地处理读取请求。与 ZooKeeper 不同，ClickHouse Keeper 是用 C++ 编写的，并使用 [RAFT 算法](https://raft.github.io/) 的 [实现](https://github.com/eBay/NuRaft)。该算法允许读取和写入的线性可化，并在不同语言中有若干开源实现。

默认情况下，ClickHouse Keeper 提供与 ZooKeeper 相同的保证：线性可化的写入和非线性可化的读取。它具有兼容的客户端-服务器协议，因此任何标准的 ZooKeeper 客户端都可以与 ClickHouse Keeper 进行交互。快照和日志与 ZooKeeper 的格式不兼容，但 `clickhouse-keeper-converter` 工具支持将 ZooKeeper 数据转换为 ClickHouse Keeper 的快照。ClickHouse Keeper 中的服务器间协议也与 ZooKeeper 不兼容，因此混合使用 ZooKeeper / ClickHouse Keeper 集群是不可能的。

ClickHouse Keeper 以与 [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) 相同的方式支持访问控制列表 (ACL)。ClickHouse Keeper 支持相同的权限集，并具有相同的内置方案：`world`，`auth` 和 `digest`。摘要身份验证方案使用 `username:password` 对，密码以 Base64 编码。

:::note
不支持外部集成。
:::
### 配置 {#configuration}

ClickHouse Keeper 可以作为 ZooKeeper 的独立替代品使用，或者作为 ClickHouse 服务器的内部部分。在这两种情况下，配置几乎都是相同的 `.xml` 文件。
#### Keeper 配置设置 {#keeper-configuration-settings}

主要的 ClickHouse Keeper 配置标签是 `<keeper_server>`，具有以下参数：

| 参数                                   | 描述                                                                                                                                                                                                                                            | 默认值                                                                                                          |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `tcp_port`                             | 客户端连接的端口。                                                                                                                                                                                                                              | `2181`                                                                                                         |
| `tcp_port_secure`                     | 客户端和 keeper-server 之间 SSL 连接的安全端口。                                                                                                                                                                                                | -                                                                                                              |
| `server_id`                            | 唯一的服务器 ID，ClickHouse Keeper 集群中的每个参与者必须具有唯一的编号 (1，2，3，依此类推)。                                                                                                                                                     | -                                                                                                              |
| `log_storage_path`                     | 协调日志的路径，与 ZooKeeper 一样，最好在不忙的节点上存储日志。                                                                                                                                                                                  | -                                                                                                              |
| `snapshot_storage_path`                | 协调快照的路径。                                                                                                                                                                                                                                | -                                                                                                              |
| `enable_reconfiguration`               | 通过 [`reconfig`](#reconfiguration) 启用动态集群重新配置。                                                                                                                                                                                      | `False`                                                                                                        |
| `max_memory_usage_soft_limit`          | keeper 最大内存使用的软限制（字节）。                                                                                                                                                                                                            | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`    | 如果未设置 `max_memory_usage_soft_limit` 或设置为零，则使用此值定义默认的软限制。                                                                                                                                                                    | `0.9`                                                                                                          |
| `cgroups_memory_observer_wait_time`    | 如果未设置或设置为 `0` 的 `max_memory_usage_soft_limit`，则使用此间隔观察物理内存的数量。一旦内存数量发生变化，将按 `max_memory_usage_soft_limit_ratio` 重新计算 Keeper 的内存软限制。                                                      | `15`                                                                                                           |
| `http_control`                         | [HTTP 控制](#http-control) 接口的配置。                                                                                                                                                                                                          | -                                                                                                              |
| `digest_enabled`                       | 启用实时数据一致性检查。                                                                                                                                                                                                                        | `True`                                                                                                         |
| `create_snapshot_on_exit`              | 关机时创建快照。                                                                                                                                                                                                                                | -                                                                                                              |
| `hostname_checks_enabled`              | 为集群配置启用主机名检查（例如，如果在远程端点使用 localhost）。                                                                                                                                                                                  | `True`                                                                                                         |
| `four_letter_word_white_list`          | 4lw 命令的白名单。                                                                                                                                                                                                                                 | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |

其他常见参数继承自 ClickHouse 服务器配置（`listen_host`，`logger` 等）。
#### 内部协调设置 {#internal-coordination-settings}

内部协调设置位于 `<keeper_server>.<coordination_settings>` 节中，具有以下参数：

| 参数                                 | 描述                                                                                                                                                                                          | 默认值                                                                                                          |
|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`               | 单个客户端操作的超时（毫秒）。                                                                                                                                                                    | `10000`                                                                                                        |
| `min_session_timeout_ms`             | 客户端会话的最小超时（毫秒）。                                                                                                                                                                     | `10000`                                                                                                        |
| `session_timeout_ms`                 | 客户端会话的最大超时（毫秒）。                                                                                                                                                                     | `100000`                                                                                                       |
| `dead_session_check_period_ms`       | ClickHouse Keeper 检查死亡会话并将其删除的频率（毫秒）。                                                                                                                                           | `500`                                                                                                          |
| `heart_beat_interval_ms`             | ClickHouse Keeper 领导者向跟随者发送心跳的频率（毫秒）。                                                                                                                                           | `500`                                                                                                          |
| `election_timeout_lower_bound_ms`    | 如果跟随者在此时间间隔内未收到领导者的心跳，则可以发起领导者选举。必须小于或等于`election_timeout_upper_bound_ms`。理想情况下，它们不应相等。                                                   | `1000`                                                                                                         |
| `election_timeout_upper_bound_ms`    | 如果跟随者在此时间间隔内未收到领导者的心跳，则必须发起领导者选举。                                                                                                                             | `2000`                                                                                                         |
| `rotate_log_storage_interval`        | 单个文件中要存储的日志记录数。                                                                                                                                                                    | `100000`                                                                                                       |
| `reserved_log_items`                 | 在压缩之前要存储的协调日志记录数。                                                                                                                                                                    | `100000`                                                                                                       |
| `snapshot_distance`                  | ClickHouse Keeper 创建新快照的频率（以日志中的记录数为单位）。                                                                                                                                     | `100000`                                                                                                       |
| `snapshots_to_keep`                  | 要保留的快照数量。                                                                                                                                                                                | `3`                                                                                                            |
| `stale_log_gap`                      | 领导者将跟随者视为过时的阈值，并发送快照而不是日志。                                                                                                                                              | `10000`                                                                                                        |
| `fresh_log_gap`                      | 节点变得新的时间。                                                                                                                                                                                | `200`                                                                                                          |
| `max_requests_batch_size`            | 请求计数的最大批大小，达到该大小后将发送到 RAFT。                                                                                                                                                 | `100`                                                                                                          |
| `force_sync`                         | 在每次写入到协调日志时调用 `fsync`。                                                                                                                                                                 | `true`                                                                                                         |
| `quorum_reads`                       | 通过整个 RAFT 共识以类似速度执行读取请求。                                                                                                                                                          | `false`                                                                                                        |
| `raft_logs_level`                    | 关于协调的文本日志级别（跟踪、调试等）。                                                                                                                                                             | `system default`                                                                                               |
| `auto_forwarding`                    | 允许将写请求从跟随者转发到领导者。                                                                                                                                                                  | `true`                                                                                                         |
| `shutdown_timeout`                   | 等待完成内部连接并关闭（毫秒）。                                                                                                                                                                       | `5000`                                                                                                         |
| `startup_timeout`                    | 如果服务器在指定的超时内未连接到其他法定参与者，则将终止（毫秒）。                                                                                                                                  | `30000`                                                                                                       |
| `async_replication`                  | 启用异步复制。在实现更好的性能的同时保留所有写入和读取保证。该设置默认禁用，以避免破坏向后兼容性。                                                                                                    | `false`                                                                                                        |
| `latest_logs_cache_size_threshold`   | 最新日志条目的内存缓存的最大总大小。                                                                                                                                                               | `1GiB`                                                                                                         |
| `commit_logs_cache_size_threshold`   | 提交所需的日志条目的内存缓存的最大总大小。                                                                                                                                                           | `500MiB`                                                                                                       |
| `disk_move_retries_wait_ms`          | 出现文件在磁盘之间移动时失败后等待重试的时间。                                                                                                                                                       | `1000`                                                                                                         |
| `disk_move_retries_during_init`      | 在初始化期间出现文件在磁盘之间移动的失败后进行重试的次数。                                                                                                                                           | `100`                                                                                                          |
| `experimental_use_rocksdb`           | 使用 rocksdb 作为后端存储。                                                                                                                                                                            | `0`                                                                                                            |

法定配置位于 `<keeper_server>.<raft_configuration>` 节中，并包含服务器描述。

整个法定的唯一参数是 `secure`，它启用法定参与者之间通信的加密连接。该参数可以设置为 `true`，以要求节点间的内部通信使用 SSL 连接，否则可以不指定。

每个 `<server>` 的主要参数如下：

- `id` — 法定中的服务器标识符。
- `hostname` — 此服务器所在的主机名。
- `port` — 此服务器监听连接的端口。
- `can_become_leader` — 设置为 `false` 以将服务器设置为 `learner`。如果省略，则值为 `true`。

:::note
在您对 ClickHouse Keeper 集群进行拓扑更改的情况下（例如，替换服务器），请务必保持 `server_id` 与 `hostname` 的映射一致，避免在不同服务器间重新排序或重复使用现有的 `server_id`（例如，如果您依赖自动化脚本来部署 ClickHouse Keeper，则可能会发生这种情况）。

如果 Keeper 实例的主机可能会变更，建议定义并使用主机名而不是原始 IP 地址。更改主机名等同于删除并重新添加服务器，某些情况下可能无法执行（例如，法定参与者数量不足）。
:::

:::note
`async_replication` 默认禁用，以避免破坏向后兼容性。如果您在支持 `async_replication` 的版本 (v23.9+) 中运行集群中的所有 Keeper 实例，我们建议启用它，因为它可以在没有任何缺点的情况下提高性能。
:::


有关拥有三个节点的法定的配置示例，可以在 [integration tests](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) 中找到，前缀为 `test_keeper_`。服务器 #1 的示例配置：

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

ClickHouse Keeper 打包在 ClickHouse 服务器包中，只需将 `<keeper_server>` 的配置添加到您的 `/etc/your_path_to_config/clickhouse-server/config.xml` 中，然后像往常一样启动 ClickHouse 服务器。如果您想独立运行 ClickHouse Keeper，可以使用以下方式启动：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

如果您没有符号链接 (`clickhouse-keeper`)，可以创建它，或将 `keeper` 作为参数传递给 `clickhouse`：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### 四个字母命令 {#four-letter-word-commands}

ClickHouse Keeper 还提供了 4lw 命令，这些命令与 Zookeeper 几乎相同。每个命令由四个字母组成，如 `mntr`、`stat` 等。还有一些更有趣的命令：`stat` 提供有关服务器和连接客户端的一些一般信息，而 `srvr` 和 `cons` 分别提供有关服务器和连接的详细信息。

4lw 命令有一个白名单配置 `four_letter_word_white_list`，其默认值为 `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`。

您可以通过 telnet 或 nc 在客户端端口向 ClickHouse Keeper 发出命令。

```bash
echo mntr | nc localhost 9181
```

以下是详细的 4lw 命令：

- `ruok`: 测试服务器是否处于非错误状态。如果服务器正在运行，将响应 `imok`。否则，它将根本不做出响应。响应 `imok` 并不一定表示服务器已加入法定人数，仅表示服务器进程处于活动状态并绑定到指定的客户端端口。使用 `stat` 获取有关法定人数和客户端连接信息的详细信息。

```response
imok
```

- `mntr`: 输出可以用于监控集群健康状况的变量列表。

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

- `srvr`: 列出服务器的完整详细信息。

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

- `stat`: 列出服务器和连接客户端的简要信息。

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

- `srst`: 重置服务器统计信息。该命令将影响 `srvr`、`mntr` 和 `stat` 的结果。

```response
Server stats reset.
```

- `conf`: 打印有关服务配置的详细信息。

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

- `cons`: 列出与此服务器连接的所有客户端的完整连接/会话详细信息。包括接收/发送的包数、会话 ID、操作延迟、上次执行的操作等信息...

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: 重置所有连接/会话的统计信息。

```response
Connection stats reset.
```

- `envi`: 打印有关服务环境的详细信息。

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

- `dirs`: 显示快照和日志文件的总大小（字节）。

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: 测试服务器是否以只读模式运行。如果处于只读模式，服务器将响应 `ro`，如果不处于只读模式，则响应 `rw`。

```response
rw
```

- `wchs`: 列出服务器的监视简要信息。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: 按会话列出服务器的监视详细信息。这会输出带有关联监视（路径）的会话（连接）列表。请注意，视监视的数量而定，此操作可能会很昂贵（影响服务器性能），请谨慎使用。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: 按路径列出服务器的监视详细信息。这会输出带有关联会话的路径（znodes）列表。请注意，视监视的数量而定，此操作可能会很昂贵（即，影响服务器性能），请谨慎使用。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: 列出未完成的会话和临时节点。这只在领导者上有效。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: 调度快照创建任务。如果成功返回调度快照的最后提交日志索引，失败则返回 `Failed to schedule snapshot creation task.`。请注意，`lgif` 命令可以帮助您确定快照是否完成。

```response
100
```

- `lgif`: Keeper 日志信息。`first_log_idx`：我的第一个日志索引；`first_log_term`：我的第一个日志术语；`last_log_idx`：我的最后一个日志索引；`last_log_term`：我的最后一个日志术语；`last_committed_log_idx`：我在状态机中最后提交的日志索引；`leader_committed_log_idx`：从我的角度来看，领导者提交的日志索引；`target_committed_log_idx`：应提交的目标日志索引；`last_snapshot_idx`：最后快照中最大的已提交日志索引。

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

- `rqld`: 请求成为新领导者。如果请求已发送，则返回 `Sent leadership request to leader.`；如果请求未发送，则返回 `Failed to send leadership request to leader.`。请注意，如果节点已经是领导者，结果与请求发送相同。

```response
Sent leadership request to leader.
```

- `ftfl`: 列出所有功能标志及其是否启用。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: 请求放弃领导权，成为跟随者。如果接收请求的服务器是领导者，它将首先暂停写操作，等待继任者（当前领导者绝对不能是继任者）完成捕获最新日志，然后辞职。继任者将自动选择。如果请求发送，则返回 `Sent yield leadership request to leader.`；如果请求未发送，则返回 `Failed to send yield leadership request to leader.`。请注意，如果节点已经是跟随者，结果与请求发送相同。

```response
Sent yield leadership request to leader.
```

- `pfev`: 返回所有收集事件的值。对于每个事件，返回事件名称、事件值及事件描述。

```response
FileOpen	62	Number of files opened.
Seek	4	Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead	126	Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed	0	Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes	178846	Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite	7	Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed	0	Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes	153	Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync	2	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync	0	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds	12756	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds	0	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes	0	Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks	0	Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes	0	Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite	0	Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes	0	Number of bytes written with Linux or FreeBSD AIO interface
...
```
### HTTP 控制 {#http-control}

ClickHouse Keeper 提供了一个 HTTP 接口，用于检查副本是否准备好接收流量。它可用于云环境，如 [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)。

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

Keeper 完全兼容 ZooKeeper 及其客户端，但它还引入了一些独特的功能和请求类型，可以被 ClickHouse 客户端使用。由于这些功能可能会引入向后不兼容的变化，因此大多数功能默认情况下都是禁用的，并可以使用 `keeper_server.feature_flags` 配置启用。所有功能都可以明确禁用。如果您想为 Keeper 集群启用新功能，我们建议您首先将集群中的所有 Keeper 实例更新为支持该功能的版本，然后再启用该功能。

禁用 `multi_read` 并启用 `check_not_exists` 的功能标志配置示例：

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

`multi_read` - 支持读取多请求。默认：`1`  
`filtered_list` - 支持按节点类型（临时或持久）过滤结果的列表请求。默认：`1`  
`check_not_exists` - 支持 `CheckNotExists` 请求，确保节点不存在。默认：`0`  
`create_if_not_exists` - 支持 `CreateIfNotExists` 请求，如果节点不存在则尝试创建它。如果它存在，则不应用任何更改，并返回 `ZOK`。默认：`0`

### 从 ZooKeeper 迁移 {#migration-from-zookeeper}

从 ZooKeeper 到 ClickHouse Keeper 的无缝迁移是不可能的。您必须停止 ZooKeeper 集群，转换数据，然后启动 ClickHouse Keeper。`clickhouse-keeper-converter` 工具允许将 ZooKeeper 日志和快照转换为 ClickHouse Keeper 快照。它仅适用于 ZooKeeper > 3.4。迁移步骤：

1. 停止所有 ZooKeeper 节点。

2. 可选但推荐：查找 ZooKeeper 领导节点，重新启动并停止它。这样可以强制 ZooKeeper 创建一个一致的快照。

3. 在领导节点上运行 `clickhouse-keeper-converter`，例如：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 将快照复制到配置了 `keeper` 的 ClickHouse 服务器节点，或在 ZooKeeper 上启动 ClickHouse Keeper。快照必须在所有节点上持久化，否则空节点会更快，其中一个节点可能成为领导者。

:::note
`keeper-converter` 工具在 Keeper 独立二进制文件中不可用。如果您安装了 ClickHouse，可以直接使用该二进制文件：

```bash
clickhouse keeper-converter ...
```

否则，您可以 [下载二进制文件](/getting-started/quick-start#download-the-binary) 并按照上述说明运行该工具，而不需要安装 ClickHouse。
:::

### 在失去法定人数后恢复 {#recovering-after-losing-quorum}

由于 ClickHouse Keeper 使用 Raft，因此可以容忍一定数量的节点崩溃，具体取决于集群大小。例如，对于 3 节点集群，如果仅有 1 个节点崩溃，它将继续正常工作。

集群配置可以动态配置，但有一些限制。重新配置也依赖于 Raft，因此要添加/删除集群中的节点，您需要有法定人数。如果您在集群中同时失去太多节点而没有任何恢复它们的机会，Raft 将停止工作，并不允许您以常规方式重新配置您的集群。

尽管如此，ClickHouse Keeper 具有恢复模式，使您能够仅用 1 个节点强制重新配置集群。如果您无法再次启动节点或在同一端点上启动新实例，这应该作为最后的手段执行。

继续之前需要注意的重要事项：
- 确保失败的节点无法再次连接到集群。
- 在步骤中未指定之前，不要启动任何新节点。

确保上述事项成立后，您需要执行以下操作：
1. 选择一个 Keeper 节点作为新领导者。请注意，该节点的数据将用于整个集群，因此我们建议使用状态最新的节点。
2. 在做其他事情之前，备份所选节点的 `log_storage_path` 和 `snapshot_storage_path` 文件夹。
3. 在您想要使用的所有节点上重新配置集群。
4. 向您选择的节点发送四字命令 `rcvr`，这将移动该节点到恢复模式，或者停止所选节点上的 Keeper 实例并使用 `--force-recovery` 参数重新启动它。
5. 一个接一个地在新节点上启动 Keeper 实例，确保在启动下一个节点之前 `mntr` 返回 `follower` 作为 `zk_server_state`。
6. 在恢复模式下，领导节点将对于 `mntr` 命令返回错误消息，直到它与新节点达成法定人数，并拒绝来自客户端和跟随者的任何请求。
7. 达成法定人数后，领导节点将返回到正常的操作模式，接受使用 Raft 验证的所有请求，`mntr` 应该返回 `leader` 作为 `zk_server_state`。

## 使用磁盘与 Keeper {#using-disks-with-keeper}

Keeper 支持一部分 [外部磁盘](/operations/storing-data.md) 用于存储快照、日志文件和状态文件。

支持的磁盘类型有：
- s3_plain
- s3
- local

以下是包含磁盘定义的配置示例。

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

要将磁盘用于日志，`keeper_server.log_storage_disk` 配置应设置为磁盘的名称。  
要将磁盘用于快照，`keeper_server.snapshot_storage_disk` 配置应设置为磁盘的名称。  
此外，可以通过使用 `keeper_server.latest_log_storage_disk` 和 `keeper_server.latest_snapshot_storage_disk` 分别为最新日志或快照使用不同的磁盘。  
在这种情况下，Keeper 会在创建新日志或快照时自动将文件移动到正确的磁盘上。
要将磁盘用于状态文件，`keeper_server.state_storage_disk` 配置应设置为磁盘的名称。

在文件在传输中间停止的情况下，将文件在磁盘之间移动是安全的，并且没有丢失数据的风险。  
在文件完全移动到新磁盘之前，旧磁盘上的文件不会被删除。

将 `keeper_server.coordination_settings.force_sync` 设置为 `true`（默认为 `true`）的 Keeper 无法为所有类型的磁盘提供某些保证。  
目前，只有 `local` 类型的磁盘支持持久同步。  
如果使用 `force_sync`，则 `log_storage_disk` 应为 `local` 磁盘（如果未使用 `latest_log_storage_disk`）。  
如果使用 `latest_log_storage_disk`，则它应始终是 `local` 磁盘。  
如果禁用 `force_sync`，则可以在任何配置中使用所有类型的磁盘。

Keeper 实例的一个可能存储设置如下所示：

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

该实例将所有除最新日志之外的日志存储在 `log_s3_plain` 磁盘上，而最新日志将存储在 `log_local` 磁盘上。  
同样的逻辑适用于快照，除了最新快照之外的所有快照将存储在 `snapshot_s3_plain` 上，而最新快照将存储在 `snapshot_local` 磁盘上。

### 更改磁盘设置 {#changing-disk-setup}

:::important
在应用新磁盘设置之前，手动备份所有 Keeper 日志和快照。
:::

如果定义了分层磁盘设置（为最新文件使用不同的磁盘），则 Keeper 将尝试在启动时自动将文件移动到正确的磁盘。  
同样的保证也适用；直到文件完全移动到新磁盘，它不会从旧磁盘中删除，因此可以安全地进行多次重启。

如果需要将文件移动到完全新磁盘（或从两个磁盘的设置移动到单个磁盘设置），可以使用多个 `keeper_server.old_snapshot_storage_disk` 和 `keeper_server.old_log_storage_disk` 的定义。

以下配置展示了从以前的两个磁盘的设置移动到完全新的单磁盘设置的方法：

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
同样，所有快照文件将从 `snapshot_local` 和 `snapshot_s3_plain` 移动到 `snapshot_local2` 磁盘。

## 配置日志缓存 {#configuring-logs-cache}

为了最小化从磁盘读取的数据量，Keeper 将日志条目缓存在内存中。  
如果请求较大，日志条目将占用太多内存，因此缓存的日志数量是有限制的。  
此限制由以下两个配置控制：
- `latest_logs_cache_size_threshold` - 以字节为单位存储在缓存中的最新日志的总大小
- `commit_logs_cache_size_threshold` - 下一步需要提交的后续日志的总大小

如果默认值太大，可以通过减少这两个配置来降低内存使用率。

:::note
您可以使用 `pfev` 命令检查每个缓存中读取的日志数量和从文件读取的日志数量。  
您还可以使用来自 Prometheus 端点的指标来跟踪两个缓存的当前大小。
:::

## Prometheus {#prometheus}

Keeper 可以公开用于从 [Prometheus](https://prometheus.io) 抓取的指标数据。

设置：

- `endpoint` – Prometheus 服务器抓取指标的 HTTP 端点。以 ‘/’ 开头。
- `port` – `endpoint` 的端口。
- `metrics` – 此标志设置为从 [system.metrics](/operations/system-tables/metrics) 表中公开指标。
- `events` – 此标志设置为从 [system.events](/operations/system-tables/events) 表中公开指标。
- `asynchronous_metrics` – 此标志设置为从 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中公开当前指标值。

**示例**

``` xml
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

检查（将 `127.0.0.1` 替换为您的 ClickHouse 服务器的 IP 地址或主机名）：
```bash
curl 127.0.0.1:9363/metrics
```

请参阅 ClickHouse Cloud [Prometheus 集成](/integrations/prometheus)。

## ClickHouse Keeper 用户指南 {#clickhouse-keeper-user-guide}

本指南提供了简单且最小的设置以配置 ClickHouse Keeper，并给出了测试分布式操作的示例。该示例在 Linux 上使用 3 个节点执行。

### 1. 配置具有 Keeper 设置的节点 {#1-configure-nodes-with-keeper-settings}

1. 在 3 个主机（`chnode1`，`chnode2`，`chnode3`）上安装 3 个 ClickHouse 实例。（有关安装 ClickHouse 的详细信息，请查看 [快速入门](/getting-started/install.md)）。

2. 在每个节点上添加以下条目，以允许通过网络接口进行外部通信。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 向所有三台服务器添加以下 ClickHouse Keeper 配置，更新每台服务器的 `<server_id>` 设置；`chnode1` 为 `1`，`chnode2` 为 `2`，以此类推。
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

    以上设置是基本设置：

    |参数         |描述                                  |示例                       |
    |-------------|---------------------------------------|----------------------------|
    |tcp_port     | Keeper 客户端使用的端口               |9181 默认，相当于 Zookeeper 的 2181|
    |server_id    | 每个 ClickHouse Keeper 服务器在 Raft 配置中的标识符 | 1                          |
    |coordination_settings | 包括超时等参数的部分         | 超时：10000，日志级别：trace |
    |server       | 参与的服务器的定义                   | 每个服务器定义的列表        |
    |raft_configuration| Keeper 集群中每个服务器的设置 | 每个服务器的设置          |
    |id           | Keeper 服务的服务器的数字 ID         | 1                          |
    |hostname     | Keeper 集群中每个服务器的主机名、IP 或 FQDN | `chnode1.domain.com`       |
    |port         | 用于服务器间 Keeper 连接的监听端口   | 9234                       |

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

    以上设置是基本设置：

    |参数         |描述                                  |示例                       |
    |-------------|---------------------------------------|----------------------------|
    |node        | ClickHouse Keeper 连接的节点列表      | 每个服务器的设置条目       |
    |host        | 每个 ClickHouse Keeper 节点的主机名、IP 或 FQDN | `chnode1.domain.com`       |
    |port        | ClickHouse Keeper 客户端端口          | 9181                       |

5. 重新启动 ClickHouse，验证每个 Keeper 实例是否正在运行。在每台服务器上执行以下命令。`ruok` 命令返回 `imok` 如果 Keeper 正在运行且运行良好：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` 数据库有一个名为 `zookeeper` 的表，包含您的 ClickHouse Keeper 实例的详细信息。让我们查看这个表：
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```

    表看起来像：
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```
### 2. 在 ClickHouse 中配置集群 {#2--configure-a-cluster-in-clickhouse}

1. 让我们配置一个简单的集群，包含 2 个分片和仅 1 个副本在 2 个节点上。第三个节点将用于实现 ClickHouse Keeper 中的法定人数。在 `chnode1` 和 `chnode2` 上更新配置。以下集群在每个节点上定义 1 个分片，总共 2 个分片，没有复制。在本示例中，部分数据将位于一个节点上，部分数据将位于另一个节点上：
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

    |参数        |描述                      |示例                       |
    |----------|------------------------|--------------------------|
    |shard     |集群定义中副本的列表        |每个分片的副本列表             |
    |replica   |每个副本的设置列表         |每个副本的设置条目            |
    |host      |将托管副本分片的服务器的主机名、IP 或 FQDN|`chnode1.domain.com`|
    |port      |用于使用原生 TCP 协议进行通信的端口|9000                       |
    |user      |用于对集群实例进行身份验证的用户名|default                    |
    |password  |允许连接到集群实例的用户的密码|`ClickHouse123!`|

2. 重启 ClickHouse，并验证集群是否创建：
    ```bash
    SHOW clusters;
    ```

    你应该会看到你的集群：
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```

### 3. 创建和测试分布式表 {#3-create-and-test-distributed-table}

1. 使用 ClickHouse 客户端在 `chnode1` 上创建新集群的新数据库。`ON CLUSTER` 子句会自动在两个节点上创建数据库。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. 在 `db1` 数据库上创建新表。再次，`ON CLUSTER` 会在两个节点上创建表。
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

5. 请注意，在每个节点上运行 `SELECT` 语句只会显示该节点上的数据。例如，在 `chnode1` 上：
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

6. 你可以创建一个 `Distributed` 表来表示两个分片上的数据。使用 `Distributed` 表引擎的表不会存储自己的任何数据，但允许在多个服务器上进行分布式查询处理。读取时会命中所有分片，写入也可以分布到各个分片。请在 `chnode1` 上运行以下查询：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. 请注意，查询 `dist_table` 返回两个分片上的所有四行数据：
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

本指南演示了如何使用 ClickHouse Keeper 设置集群。通过 ClickHouse Keeper，您可以配置集群并定义可以跨分片复制的分布式表。

## 使用唯一路径配置 ClickHouse Keeper {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### 描述 {#description}

本文描述了如何使用内置的 `{uuid}` 宏设置在 ClickHouse Keeper 或 ZooKeeper 中创建唯一条目。唯一路径在频繁创建和删除表时很有帮助，因为这避免了必须等待几分钟让 Keeper 垃圾回收器删除路径条目，每次创建路径时都使用一个新的 `uuid`，路径从不重复使用。

### 示例环境 {#example-environment}
一个三节点集群，将配置为在所有三个节点上部署 ClickHouse Keeper，并在两个节点上部署 ClickHouse。这为 ClickHouse Keeper 提供了三个节点（包括一个决策节点）以及由两个副本组成的单个 ClickHouse 分片。

|节点                          |描述                                  |
|-----------------------------|-------------------------------------|
|`chnode1.marsnet.local`     |数据节点 - 集群 `cluster_1S_2R`     |
|`chnode2.marsnet.local`     |数据节点 - 集群 `cluster_1S_2R`     |
|`chnode3.marsnet.local`     | ClickHouse Keeper 决策节点           |

示例配置：
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

### 使用 `{uuid}` 设置表的流程 {#procedures-to-set-up-tables-to-use-uuid}

1. 在每个服务器上配置宏
服务器 1 的示例：
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
请注意，我们为 `shard` 和 `replica` 定义了宏，但这里没有定义 `{uuid}`，它是内置的，无需定义。
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

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. 创建分布式表

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
1. 在第一个节点（例如 `chnode1`）插入数据
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

2. 在第二个节点（例如，`chnode2`）插入数据
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
可以通过宏和使用 `{uuid}` 提前定义默认复制路径

1. 在每个节点上为表设置默认值
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
如果节点用于特定的数据库，你还可以在每个节点上定义一个宏 `{database}`。
:::

2. 没有显式参数的创建表：
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

3. 验证使用了默认配置中使用的设置
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

Query id: 5925ecce-a54f-47d8-9c3a-ad3257840c9e

┌─statement────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id
SETTINGS index_granularity = 8192 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

### 故障排除 {#troubleshooting}

获取表信息和 UUID 的示例命令：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

获取 ZooKeeper 中有关该表的 UUID 信息的示例命令：
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
数据库必须为 `Atomic`，如果要从之前的版本进行升级，`default` 数据库可能是 `Ordinary` 类型。
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

## ClickHouse Keeper 动态重配置 {#reconfiguration}

<SelfManaged />
### 描述 {#description-1}

ClickHouse Keeper 部分支持 ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) 命令，用于动态集群重配置，前提是 `keeper_server.enable_reconfiguration` 已开启。

:::note
如果该设置关闭，您可以通过手动修改副本的 `raft_configuration` 部分重新配置集群。请确保在所有副本上编辑文件，因为只有领导者会应用更改。
或者，您可以通过任何与 ZooKeeper 兼容的客户端发送 `reconfig` 查询。
:::

虚拟节点 `/keeper/config` 包含最后提交的集群配置，格式如下：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 每个服务器条目由换行符分隔。
- `server_type` 是 `participant` 或 `learner`（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) 不参与领导者选举）。
- `server_priority` 是一个非负整数，表示[哪个节点在领导者选举中应该优先](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)。优先级为 0 表示服务器将永远不会成为领导者。

示例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

您可以使用 `reconfig` 命令添加新服务器，移除现有服务器并更改现有服务器的优先级，这里是一些示例（使用 `clickhouse-keeper-client`）：

```bash

# 添加两个新服务器
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# 移除另外两个服务器
reconfig remove "3,4"

# 将现有服务器的优先级更改为 8
reconfig add "server.5=localhost:5123;participant;8"
```

以下是 `kazoo` 的示例：

```python

# 添加两个新服务器，移除另外两个服务器
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# 将现有服务器的优先级更改为 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining` 中的服务器应按上述描述的格式给出。服务器条目应以逗号分隔。
在添加新服务器时，可以省略 `server_priority`（默认值为 1）和 `server_type`（默认值为 `participant`）。

如果您希望更改现有服务器的优先级，请将其添加到 `joining` 中，并指定目标优先级。
服务器主机、端口和类型必须与现有服务器配置相同。

服务器按 `joining` 和 `leaving` 中的出现顺序进行添加和删除。
来自 `joining` 的所有更新将优先于来自 `leaving` 的更新进行处理。

在 Keeper 重配置实现中存在一些注意事项：

- 仅支持增量重配置。带有非空 `new_members` 的请求将被拒绝。

  ClickHouse Keeper 实现依赖于 NuRaft API 动态更改成员。NuRaft 有一种添加单个服务器或移除单个服务器的方法，因此每次配置更改（`joining` 的每一部分，`leaving` 的每一部分）必须单独决定。因此，没有可用的批量重配置，因为这对最终用户可能会产生误导。

  更改服务器类型（participant/learner）也不可能，因为 NuRaft 不支持，唯一的方法是移除并添加服务器，这同样会产生误导。

- 您无法使用返回的 `znodestat` 值。
- `from_version` 字段未使用。所有带有设置 `from_version` 的请求将被拒绝。
  这是因为 `/keeper/config` 是一个虚拟节点，这意味着它不会存储在持久存储中，而是在每个请求的指定节点配置上动态生成。
  这个决定是为了避免重复数据，因为 NuRaft 已经存储了这个配置。
- 与 ZooKeeper 不同，无法通过提交 `sync` 命令等待集群重配置。
  新配置将会 _最终_ 被应用，但没有时间保证。
- `reconfig` 命令可能由于各种原因失败。您可以检查集群的状态以查看更新是否已应用。

## 将单节点 Keeper 转换为集群 {#converting-a-single-node-keeper-into-a-cluster}

有时需要将实验性 Keeper 节点扩展为集群。以下是如何一步一步地将其扩展为 3 节点集群的方案：

- **重要**：新节点必须分批添加，批量小于当前法定人数，否则它们将相互选举领导者。在本示例中逐个添加。
- 现有的 Keeper 节点必须启用 `keeper_server.enable_reconfiguration` 配置参数。
- 启动一个新的节点，使用完整的新配置的 Keeper 集群。
- 启动后，将其添加到节点 1，使用 [`reconfig`](#reconfiguration)。
- 现在，启动第三个节点并使用 [`reconfig`](#reconfiguration) 添加它。
- 通过在配置中添加新的 Keeper 节点来更新 `clickhouse-server` 配置，并重新启动以应用更改。
- 更新节点 1 的 raft 配置，并可选地重新启动它。

为了对过程充满信心，这里有一个 [沙盒仓库](https://github.com/ClickHouse/keeper-extend-cluster)。

## 不支持的功能 {#unsupported-features}

虽然 ClickHouse Keeper 旨在与 ZooKeeper 完全兼容，但某些功能当前尚未实现（尽管开发仍在继续）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持返回 `Stat` 对象
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) 不支持 [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) 不适用于 [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) 监视
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) 和 [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) 不支持
- `setWatches` 不支持
- 创建 [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 类型的 znodes 不支持
- 不支持 [`SASL 认证`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)
