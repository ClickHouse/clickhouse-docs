---
slug: /architecture/replication
sidebar_label: 故障容忍的复制
sidebar_position: 10
title: 故障容忍的复制
---

import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## 描述 {#description}
在此架构中，配置了五台服务器。两台用于托管数据的副本。其他三台服务器用于协调数据的复制。在此示例中，我们将创建一个数据库和一个将通过 ReplicatedMergeTree 表引擎在两个数据节点之间进行复制的表。

## 级别：基础 {#level-basic}

<ReplicationShardingTerminology />

## 环境 {#environment}
### 架构图 {#architecture-diagram}

<img src={ReplicationArchitecture} alt="具有 ReplicatedMergeTree 的 1 个分片和 2 个副本的架构图" />

| 节点 | 描述 |
|------|------|
| clickhouse-01 | 数据 |
| clickhouse-02 | 数据 |
| clickhouse-keeper-01 | 分布式协调 |
| clickhouse-keeper-02 | 分布式协调 |
| clickhouse-keeper-03 | 分布式协调 |

:::note
在生产环境中，我们强烈建议为 ClickHouse Keeper 使用 *专用* 主机。在测试环境中，ClickHouse Server 和 ClickHouse Keeper 可以在同一服务器上运行。另一个基本示例 [扩展](/deployment-guides/horizontal-scaling.md) 使用了这种方法。在这个示例中，我们展示了将 Keeper 与 ClickHouse Server 分离的推荐方法。Keeper 服务器可以更小，4GB RAM 通常足够每个 Keeper 服务器，直到你的 ClickHouse 服务器变得非常庞大。
:::

## 安装 {#install}

在两台服务器 `clickhouse-01` 和 `clickhouse-02` 上安装 ClickHouse 服务器和客户端，按照 [您所选择的归档类型的说明](/getting-started/install.md/#available-installation-options) (.deb, .rpm, .tar.gz 等)。

在三台服务器 `clickhouse-keeper-01`、`clickhouse-keeper-02` 和 `clickhouse-keeper-03` 上安装 ClickHouse Keeper，遵循 [您所选择的归档类型的说明](/getting-started/install.md/#install-standalone-clickhouse-keeper) (.deb, .rpm, .tar.gz 等)。

## 编辑配置文件 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01 配置 {#clickhouse-01-configuration}

对于 clickhouse-01，有五个配置文件。您可以选择将这些文件合并为一个文件，但为了文档的清晰起见，分别查看这些文件可能更简单。当您浏览配置文件时，您会看到 clickhouse-01 和 clickhouse-02 之间的大部分配置是相同的；差异将被突出显示。

### 网络和日志配置 {#network-and-logging-configuration}

这些值可以根据需要进行自定义。此示例配置为您提供：
- 一个将在 1000M 处翻滚三次的调试日志
- 使用 `clickhouse-client` 连接时显示的名称为 `cluster_1S_2R node 1`
- ClickHouse 将在 8123 和 9000 端口上监听 IPV4 网络。

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

宏 `shard` 和 `replica` 减少了分布式 DDL 的复杂性。配置的值会自动替换到您的 DDL 查询中，从而简化您的 DDL。此配置的宏指定了每个节点的分片和副本编号。
在这个 1 个分片 2 个副本的示例中，clickhouse-01 上的副本宏为 `replica_1`，clickhouse-02 上的副本宏为 `replica_2`。由于只有一个分片，分片宏在 clickhouse-01 和 clickhouse-02 上均为 `1`。

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
- XML 的 remote_servers 部分指定了环境中的每个集群。属性 `replace=true` 将默认 ClickHouse 配置中的样本 remote_servers 替换为此文件中指定的 remote_server 配置。如果没有此属性，此文件中的远程服务器将附加到默认样本列表中。
- 在此示例中，有一个名为 `cluster_1S_2R` 的集群。
- 为名为 `cluster_1S_2R` 的集群创建了一个值为 `mysecretphrase` 的秘密。该秘密跨环境中的所有远程服务器共享，以确保正确的服务器组合在一起。
- 集群 `cluster_1S_2R` 具有一个分片和两个副本。查看本文档开头的架构图，并与以下 XML 中的 `shard` 定义进行比较。分片定义包含两个副本。每个副本的主机和端口被指定。一个副本存储在 `clickhouse-01` 上，另一个副本存储在 `clickhouse-02` 上。
- 分片的内部复制设置为 true。每个分片可以在配置文件中定义 internal_replication 参数。如果此参数设置为 true，则写入操作选择第一个健康副本并将数据写入其中。

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

此配置文件 `use-keeper.xml` 正在配置 ClickHouse Server 使用 ClickHouse Keeper 来协调复制和分布式 DDL。此文件指定 ClickHouse Server 应在 clickhouse-keeper-01 至 clickhouse-keeper-03 节点上使用 Keeper，端口为 9181，该文件在 `clickhouse-01` 和 `clickhouse-02` 上是相同的。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- ZK 节点在哪里 -->
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

此文件在 clickhouse-01 和 clickhouse-02 上相同，唯一的例外是 `display_name`。

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

宏配置在 clickhouse-01 和 clickhouse-02 之间有所不同。该节点的 `replica` 设置为 `02`。

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

### 配置 Keeper 使用 {#configuring-the-use-of-keeper-1}

此文件在 clickhouse-01 和 clickhouse-02 上相同。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- ZK 节点在哪里 -->
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

ClickHouse Keeper 提供数据复制和分布式 DDL 查询执行的协调系统。ClickHouse Keeper 与 Apache ZooKeeper 兼容。 此配置启用 ClickHouse Keeper，端口为 9181。突出显示的行指定此 Keeper 实例的 `server_id` 为 1。`enable-keeper.xml` 文件在三台服务器中的唯一差异就是这一点。`clickhouse-keeper-02` 将具有 `server_id` 设置为 `2`，`clickhouse-keeper-03` 将具有 `server_id` 设置为 `3`。 漂亮的配置部分在所有三台服务器上都是相同的，下面突出显示以显示 `server_id` 和 raft 配置内的 `server` 实例之间的关系。

:::note
如果出于任何原因替换或重建 Keeper 节点，请勿重用现有的 `server_id`。例如，如果重建 `server_id` 为 `2` 的 Keeper 节点，请将其分配给 `4` 或更高的 server_id。
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

`clickhouse-keeper-01` 和 `clickhouse-keeper-02` 之间只有一行差异。该节点的 `server_id` 设置为 `2`。

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

在 `clickhouse-keeper-01` 和 `clickhouse-keeper-03` 之间只有一行差异。该节点的 `server_id` 设置为 `3`。

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

要体验 ReplicatedMergeTree 和 ClickHouse Keeper，您可以运行以下命令：
- 在上面配置的集群上创建一个数据库
- 在数据库上使用 ReplicatedMergeTree 表引擎创建一个表
- 在一个节点上插入数据，并在另一个节点上查询
- 停止一个 ClickHouse 服务器节点
- 在运行的节点上插入更多数据
- 重启停止的节点
- 验证重新启动的节点在查询时数据是否可用

### 验证 ClickHouse Keeper 是否正在运行 {#verify-that-clickhouse-keeper-is-running}

`mntr` 命令用于验证 ClickHouse Keeper 是否正在运行，并获取有关三个 Keeper 节点关系的状态信息。在此示例中使用的配置中有三个节点协同工作。节点将选举一个领导者，剩余节点将是跟随者。`mntr` 命令提供与性能相关的信息，以及特定节点是否为跟随者或领导者。

:::tip
您可能需要安装 `netcat` 以便向 Keeper 发送 `mntr` 命令。请参阅 [nmap.org](https://nmap.org/ncat/) 页面获取下载信息。
:::

```bash title="在 clickhouse-keeper-01、clickhouse-keeper-02 和 clickhouse-keeper-03 上运行"
echo mntr | nc localhost 9181
```
```response title="来自跟随者的响应"
zk_version	v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency	0
zk_max_latency	0
zk_min_latency	0
zk_packets_received	0
zk_packets_sent	0
zk_num_alive_connections	0
zk_outstanding_requests	0

# highlight-next-line
zk_server_state	follower
zk_znode_count	6
zk_watch_count	0
zk_ephemerals_count	0
zk_approximate_data_size	1271
zk_key_arena_size	4096
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	46
zk_max_file_descriptor_count	18446744073709551615
```

```response title="来自领导者的响应"
zk_version	v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency	0
zk_max_latency	0
zk_min_latency	0
zk_packets_received	0
zk_packets_sent	0
zk_num_alive_connections	0
zk_outstanding_requests	0

# highlight-next-line
zk_server_state	leader
zk_znode_count	6
zk_watch_count	0
zk_ephemerals_count	0
zk_approximate_data_size	1271
zk_key_arena_size	4096
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	48
zk_max_file_descriptor_count	18446744073709551615

# highlight-start
zk_followers	2
zk_synced_followers	2

# highlight-end
```

### 验证 ClickHouse 集群功能 {#verify-clickhouse-cluster-functionality}

在一个 shell 中使用 `clickhouse client` 连接到节点 `clickhouse-01`，并在另一个 shell 中连接到节点 `clickhouse-02`。

1. 在上面配置的集群上创建一个数据库

```sql title="在 clickhouse-01 或 clickhouse-02 上运行"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. 使用 ReplicatedMergeTree 表引擎在数据库上创建一个表
```sql title="在 clickhouse-01 或 clickhouse-02 上运行"
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
```sql title="在节点 clickhouse-01 上运行"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. 在节点 `clickhouse-02` 上查询该表
```sql title="在节点 clickhouse-02 上运行"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. 在另一个节点上插入数据并在节点 `clickhouse-01` 上查询
```sql title="在节点 clickhouse-02 上运行"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="在节点 clickhouse-01 上运行"
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
通过运行与启动节点相类似的操作系统命令停止一个 ClickHouse 服务器节点。如果您使用 `systemctl start` 启动该节点，请使用 `systemctl stop` 停止它。

7. 在运行的节点上插入更多数据
```sql title="在运行的节点上运行"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

选择数据：
```sql title="在运行的节点上运行"
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

8. 重新启动停止的节点并从那里选择

```sql title="在重新启动的节点上运行"
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
