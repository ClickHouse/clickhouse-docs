---
'slug': '/architecture/replication'
'sidebar_label': '容错的复制'
'sidebar_position': 10
'title': '容错的复制'
'description': '描述一个具有五台服务器配置的示例架构页面。其中两台用于托管数据副本，其余用于协调数据的复制。'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## 描述 {#description}
在此架构中，配置了五台服务器。两台用于托管数据副本。其他三台服务器用于协调数据的复制。通过此示例，我们将创建一个数据库和一个表，这些表将在两个数据节点之间使用 ReplicatedMergeTree 表引擎进行复制。

## 级别: 基础 {#level-basic}

<ReplicationShardingTerminology />

## 环境 {#environment}
### 架构图 {#architecture-diagram}

<Image img={ReplicationArchitecture} size="md" alt="ReplicatedMergeTree的1个分片和2个副本的架构图" />

|节点|描述|
|----|-----------|
|clickhouse-01|数据|
|clickhouse-02|数据|
|clickhouse-keeper-01|分布式协调|
|clickhouse-keeper-02|分布式协调|
|clickhouse-keeper-03|分布式协调|

:::note
在生产环境中，我们强烈建议为 ClickHouse Keeper 使用*专用*主机。在测试环境中，运行 ClickHouse Server 和 ClickHouse Keeper 在同一台服务器上是可以接受的。另一个基本示例， [扩展](/deployment-guides/horizontal-scaling.md)，使用了这种方法。在此示例中，我们展示了将 Keeper 与 ClickHouse Server 分开的推荐方法。Keeper 服务器可以更小，一般情况下，每个 Keeper 服务器 4GB RAM 足够，直到您的 ClickHouse 服务器变得非常庞大。
:::

## 安装 {#install}

根据 [适合您的归档类型的说明](/getting-started/install/install.mdx) 在两台服务器 `clickhouse-01` 和 `clickhouse-02` 上安装 ClickHouse 服务器和客户端 (.deb, .rpm, .tar.gz 等)。

在三台服务器 `clickhouse-keeper-01`、`clickhouse-keeper-02` 和 `clickhouse-keeper-03` 上安装 ClickHouse Keeper，根据 [适合您的归档类型的说明](/getting-started/install/install.mdx) (.deb, .rpm, .tar.gz 等)。

## 编辑配置文件 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01 配置 {#clickhouse-01-configuration}

对于 clickhouse-01，有五个配置文件。您可以选择将这些文件合并为一个文件，但为了文档的清晰，分开查看可能更简单。当您浏览配置文件时，将会看到 clickhouse-01 和 clickhouse-02 之间大部分配置是相同的；差异将被突出显示。

### 网络和日志配置 {#network-and-logging-configuration}

这些值可以根据您的需要自定义。该示例配置为您提供：
- 一个调试日志在达到 1000M 后会滚动三次
- 当您使用 `clickhouse-client` 连接时显示的名称是 `cluster_1S_2R node 1`
- ClickHouse 将在 IPV4 网络上监听 8123 和 9000 端口。

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml on clickhouse-01"
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>cluster_1S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### 宏配置 {#macros-configuration}

宏 `shard` 和 `replica` 减少了分布式 DDL 的复杂性。配置的值会自动替换到您的 DDL 查询中，从而简化了您的 DDL。此配置的宏为每个节点指定了分片和副本编号。
在这个 1 分片 2 副本的示例中，clickhouse-01 上的副本宏是 `replica_1`，而 clickhouse-02 上是 `replica_2`。由于只有一个分片，因此两个节点的分片宏都是 `1`。

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-01"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### 复制和分片配置 {#replication-and-sharding-configuration}

从顶部开始：
- XML 的 remote_servers 部分指定了环境中的每个集群。属性 `replace=true` 将默认 ClickHouse 配置中的示例 remote_servers 替换为此文件中指定的 remote_server 配置。如果没有此属性，此文件中的远程服务器将附加到默认示例列表。
- 在此示例中，存在一个名为 `cluster_1S_2R` 的集群。
- 为名为 `cluster_1S_2R` 的集群创建了一个秘密，值为 `mysecretphrase`。这个秘密在环境中的所有远程服务器之间共享，以确保正确的服务器被连接在一起。
- 集群 `cluster_1S_2R` 有一个分片和两个副本。查看本文档开头的架构图，并将其与下面 XML 中的 `shard` 定义进行比较。分片定义包含两个副本。每个副本的主机和端口都已指定。一个副本存储在 `clickhouse-01`，另一个副本存储在 `clickhouse-02`。
- 分片的内部复制设置为 true。每个分片可以在配置文件中定义 internal_replication 参数。如果该参数设置为 true，则写入操作选择第一个健康的副本并向其写入数据。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml on clickhouse-01"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

### 配置 Keeper 的使用 {#configuring-the-use-of-keeper}

此配置文件 `use-keeper.xml` 正在配置 ClickHouse Server 使用 ClickHouse Keeper 来协调复制和分布式 DDL。此文件指定 ClickHouse Server 应该在节点 clickhouse-keeper-01 - 03 上使用 Keeper，端口为 9181，并且该文件在 `clickhouse-01` 和 `clickhouse-02` 上是相同的。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- where are the ZK nodes -->
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## clickhouse-02 配置 {#clickhouse-02-configuration}

由于 clickhouse-01 和 clickhouse-02 的配置非常相似，因此这里只指出差异。

### 网络和日志配置 {#network-and-logging-configuration-1}

此文件在 clickhouse-01 和 clickhouse-02 上是相同的，除了 `display_name`。

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml on clickhouse-02"
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!-- highlight-next-line -->
    <display_name>cluster_1S_2R node 2</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### 宏配置 {#macros-configuration-1}

宏配置在 clickhouse-01 和 clickhouse-02 之间有所不同。在该节点上的 `replica` 被设置为 `02`。

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-02"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>02</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### 复制和分片配置 {#replication-and-sharding-configuration-1}

此文件在 clickhouse-01 和 clickhouse-02 上相同。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml on clickhouse-02"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

### 配置 Keeper 的使用 {#configuring-the-use-of-keeper-1}

此文件在 clickhouse-01 和 clickhouse-02 上相同。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- where are the ZK nodes -->
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## clickhouse-keeper-01 配置 {#clickhouse-keeper-01-configuration}

<KeeperConfigFileNote />

ClickHouse Keeper 提供数据复制和分布式 DDL 查询执行的协调系统。ClickHouse Keeper 与 Apache ZooKeeper 兼容。此配置使 ClickHouse Keeper 在端口 9181 上启用。突出显示的行指定此实例的 Keeper 具有 server_id 1。这是三个服务器的 `enable-keeper.xml` 文件之间唯一的差异。 `clickhouse-keeper-02` 的 `server_id` 将设置为 `2`，`clickhouse-keeper-03` 的 `server_id` 将设置为 `3`。raft 配置部分在三台服务器上相同，下面突出显示了 `server_id` 与 raft 配置内的 `server` 实例之间的关系。

:::note
如果出于任何原因替换或重建 Keeper 节点，请勿重用现有的 `server_id`。例如，如果 `server_id` 为 `2` 的 Keeper 节点被重建，请将其 `server_id` 设置为 `4` 或更高。
:::

```xml title="/etc/clickhouse-keeper/keeper_config.xml on clickhouse-keeper-01"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>trace</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <!-- highlight-start -->
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## clickhouse-keeper-02 配置 {#clickhouse-keeper-02-configuration}

`clickhouse-keeper-01` 和 `clickhouse-keeper-02` 之间只有一行差异。在该节点上，`server_id` 被设置为 `2`。

```xml title="/etc/clickhouse-keeper/keeper_config.xml on clickhouse-keeper-02"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>2</server_id>
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## clickhouse-keeper-03 配置 {#clickhouse-keeper-03-configuration}

`clickhouse-keeper-01` 和 `clickhouse-keeper-03` 之间只有一行差异。在该节点上，`server_id` 被设置为 `3`。

```xml title="/etc/clickhouse-keeper/keeper_config.xml on clickhouse-keeper-03"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>3</server_id>
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## 测试 {#testing}

为了获得对 ReplicatedMergeTree 和 ClickHouse Keeper 的经验，您可以运行以下命令：
- 在上述配置的集群上创建一个数据库
- 使用 ReplicatedMergeTree 表引擎在数据库上创建一个表
- 在一个节点上插入数据并在另一个节点上查询
- 停止一个 ClickHouse 服务器节点
- 在运行的节点上插入更多数据
- 重启停止的节点
- 验证重启节点上的数据是否可用

### 验证 ClickHouse Keeper 是否在运行 {#verify-that-clickhouse-keeper-is-running}

`mntr` 命令用于验证 ClickHouse Keeper 是否在运行，并获取关于三个 Keeper 节点关系的状态信息。在此示例中使用的配置中，有三台节点协同工作。节点将选举领导者，剩余节点将是跟随者。`mntr` 命令提供与性能相关的信息，以及特定节点是跟随者还是领导者。

:::tip
您可能需要安装 `netcat` 才能向 Keeper 发送 `mntr` 命令。请参阅 [nmap.org](https://nmap.org/ncat/) 页面以获取下载信息。
:::

```bash title="run from a shell on clickhouse-keeper-01, clickhouse-keeper-02, and clickhouse-keeper-03"
echo mntr | nc localhost 9181
```
```response title="response from a follower"
zk_version      v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     0
zk_packets_sent 0
zk_num_alive_connections        0
zk_outstanding_requests 0

# highlight-next-line
zk_server_state follower
zk_znode_count  6
zk_watch_count  0
zk_ephemerals_count     0
zk_approximate_data_size        1271
zk_key_arena_size       4096
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   46
zk_max_file_descriptor_count    18446744073709551615
```

```response title="response from a leader"
zk_version      v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     0
zk_packets_sent 0
zk_num_alive_connections        0
zk_outstanding_requests 0

# highlight-next-line
zk_server_state leader
zk_znode_count  6
zk_watch_count  0
zk_ephemerals_count     0
zk_approximate_data_size        1271
zk_key_arena_size       4096
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   48
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```

### 验证 ClickHouse 集群功能 {#verify-clickhouse-cluster-functionality}

在一个 shell 中使用 `clickhouse client` 连接到节点 `clickhouse-01`，在另一个 shell 中使用 `clickhouse client` 连接到节点 `clickhouse-02`。

1. 在上述配置的集群上创建一个数据库

```sql title="run on either node clickhouse-01 or clickhouse-02"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. 使用 ReplicatedMergeTree 表引擎在数据库上创建一个表
```sql title="run on either node clickhouse-01 or clickhouse-02"
CREATE TABLE db1.table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```
3. 在一个节点上插入数据并在另一个节点上查询
```sql title="run on node clickhouse-01"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. 在节点 `clickhouse-02` 上查询表
```sql title="run on node clickhouse-02"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. 在另一个节点上插入数据并在节点 `clickhouse-01` 上查询
```sql title="run on node clickhouse-02"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="run on node clickhouse-01"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

6. 停止一个 ClickHouse 服务器节点
通过运行类似于启动节点的操作系统命令来停止一个 ClickHouse 服务器节点。如果您使用 `systemctl start` 启动节点，则使用 `systemctl stop` 停止它。

7. 在运行的节点上插入更多数据
```sql title="run on the running node"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

选择数据：
```sql title="run on the running node"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```

8. 重启停止的节点并从那里也选择

```sql title="run on the restarted node"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```
