---
'slug': '/architecture/replication'
'sidebar_label': '用于容错的复制'
'sidebar_position': 10
'title': '用于容错的复制'
'description': '页面描述了一个配置有五台服务器的示例架构。两台用于托管数据副本，其余用于协调数据的复制'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## 描述 {#description}
在此架构中，配置了五台服务器。两台用于托管数据的副本。其余的三台服务器用于协调数据的复制。在这个例子中，我们将创建一个数据库和一个将在两个数据节点之间复制的表，使用的是 ReplicatedMergeTree 表引擎。

## 级别：基础 {#level-basic}

<ReplicationShardingTerminology />

## 环境 {#environment}
### 架构图 {#architecture-diagram}

<Image img={ReplicationArchitecture} size="md" alt="包含 ReplicatedMergeTree 的 1 个分片和 2 个副本的架构图" />

|节点|描述|
|----|-----------|
|clickhouse-01|数据|
|clickhouse-02|数据|
|clickhouse-keeper-01|分布式协调|
|clickhouse-keeper-02|分布式协调|
|clickhouse-keeper-03|分布式协调|

:::note
在生产环境中，我们强烈建议为 ClickHouse Keeper 使用 *专用* 主机。在测试环境中，将 ClickHouse Server 和 ClickHouse Keeper 组合在同一服务器上运行是可以接受的。另一个基本示例，[横向扩展](/deployment-guides/horizontal-scaling.md)，就是使用这种方法。在这个示例中，我们展示了将 Keeper 与 ClickHouse Server 分开的推荐方法。Keeper 服务器可以较小，通常每台 Keeper 服务器 4GB RAM 就足够，直到你的 ClickHouse Servers 变得非常大。
:::

## 安装 {#install}

在两台服务器 `clickhouse-01` 和 `clickhouse-02` 上安装 ClickHouse 服务器和客户端，遵循 [你的归档类型的安装说明](/getting-started/install/install.mdx) （.deb, .rpm, .tar.gz 等）。

在三台服务器 `clickhouse-keeper-01`、`clickhouse-keeper-02` 和 `clickhouse-keeper-03` 上安装 ClickHouse Keeper，遵循 [你的归档类型的安装说明](/getting-started/install/install.mdx) （.deb, .rpm, .tar.gz 等）。

## 编辑配置文件 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01 配置 {#clickhouse-01-configuration}

对于 clickhouse-01，有五个配置文件。您可以选择将这些文件合并为一个文件，但为了文档的清晰性，单独查看它们可能更简单。当您阅读配置文件时，您会发现 clickhouse-01 和 clickhouse-02 之间的大部分配置是相同的；不同之处将被突出显示。

### 网络和日志配置 {#network-and-logging-configuration}

这些值可以根据您的需要自定义。该示例配置为您提供：
- 一个将在 1000M 处滚动三次的调试日志
- 当您使用 `clickhouse-client` 连接时显示的名称是 `cluster_1S_2R node 1`
- ClickHouse 将在 IPV4 网络上侦听 8123 和 9000 端口。

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

宏 `shard` 和 `replica` 减少了分布式 DDL 的复杂性。配置的值会自动替换您的 DDL 查询，从而简化您的 DDL。此配置的宏指定了每个节点的分片和副本编号。
在这个 1 个分片 2 个副本的示例中，clickhouse-01 上的副本宏是 `replica_1`，clickhouse-02 上的副本宏是 `replica_2`。分片宏在 clickhouse-01 和 clickhouse-02 上都是 `1`，因为只有一个分片。

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
- XML 的 remote_servers 部分指定环境中的每个集群。属性 `replace=true` 用指定在此文件中的 remote_server 配置替换默认 ClickHouse 配置中的示例 remote_servers。没有此属性，此文件中的远程服务器将附加到默认样本的列表中。
- 在此示例中，有一个名为 `cluster_1S_2R` 的集群。
- 为集群 `cluster_1S_2R` 创建一个名为 `mysecretphrase` 的秘密。该秘密在环境中的所有远程服务器之间共享，以确保正确的服务器连接在一起。
- 集群 `cluster_1S_2R` 有一个分片和两个副本。看看本文档开头的架构图，并将其与下面 XML 的 `shard` 定义进行对比。分片定义包含两个副本。每个副本的主机和端口被指定。一个副本存储在 `clickhouse-01` 上，另一个副本存储在 `clickhouse-02` 上。
- 此分片的内部复制设置为 true。每个分片可以在配置文件中定义 internal_replication 参数。如果此参数设置为 true，则写操作选择第一个健康的副本并将数据写入它。

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

### 配置使用 Keeper {#configuring-the-use-of-keeper}

此配置文件 `use-keeper.xml` 正在配置 ClickHouse Server 使用 ClickHouse Keeper 进行复制和分布式 DDL 的协调。此文件指定 ClickHouse Server 应在点击 `clickhouse-keeper-01` - 03 节点上的 9181 端口使用 Keeper，该文件在 `clickhouse-01` 和 `clickhouse-02` 上是相同的。

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

由于 clickhouse-01 和 clickhouse-02 的配置非常相似，这里只会指出不同之处。

### 网络和日志配置 {#network-and-logging-configuration-1}

此文件在 clickhouse-01 和 clickhouse-02 上是相同的，唯一的例外是 `display_name`。

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

宏配置在 clickhouse-01 和 clickhouse-02 之间是不同的。此节点上的 `replica` 设置为 `02`。

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

此文件在 clickhouse-01 和 clickhouse-02 上是相同的。

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

### 配置使用 Keeper {#configuring-the-use-of-keeper-1}

此文件在 clickhouse-01 和 clickhouse-02 上是相同的。

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

ClickHouse Keeper 提供了数据复制和分布式 DDL 查询执行的协调系统。ClickHouse Keeper 与 Apache ZooKeeper 兼容。此配置启用 ClickHouse Keeper，端口为 9181。突出显示的行指定该 Keeper 实例的 server_id 为 1。这是 `enable-keeper.xml` 文件在三台服务器之间的唯一差异。 `clickhouse-keeper-02` 的 `server_id` 设置为 `2`，而 `clickhouse-keeper-03` 的 `server_id` 设置为 `3`。raft 配置部分在三个服务器上是相同的，下面突出显示以展示 `server_id` 与 raft 配置中的 `server` 实例之间的关系。

:::note
如果由于任何原因替换或重建 Keeper 节点，请不要重用现有的 `server_id`。例如，如果 `server_id` 为 `2` 的 Keeper 节点被重建，请给它分配 `4` 或更高的 server_id。
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

`clickhouse-keeper-01` 和 `clickhouse-keeper-02` 之间只有一行差异。此节点上的 `server_id` 设置为 `2`。

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

`clickhouse-keeper-01` 和 `clickhouse-keeper-03` 之间只有一行差异。此节点上的 `server_id` 设置为 `3`。

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

为了获得对 ReplicatedMergeTree 和 ClickHouse Keeper 的经验，您可以运行以下命令，您将会：
- 在上述配置的集群上创建一个数据库
- 使用 ReplicatedMergeTree 表引擎在数据库上创建一个表
- 在一个节点上插入数据并在另一个节点上查询
- 停止一个 ClickHouse 服务器节点
- 在运行的节点上插入更多数据
- 重启已停止的节点
- 验证当查询已重启的节点时数据是否可用

### 验证 ClickHouse Keeper 是否正在运行 {#verify-that-clickhouse-keeper-is-running}

`mntr` 命令用于验证 ClickHouse Keeper 是否正在运行，并获取关于三个 Keeper 节点关系的状态信息。在本示例中使用的配置中，有三个节点协同工作。节点将选举出一个领导者，其余节点将成为跟随者。`mntr` 命令提供与性能相关的信息，以及特定节点是否为跟随者或领导者的信息。

:::tip
您可能需要安装 `netcat` 以便向 Keeper 发送 `mntr` 命令。请查看 [nmap.org](https://nmap.org/ncat/) 页面以获取下载信息。
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

在一个终端中使用 `clickhouse client` 连接到节点 `clickhouse-01`，在另一个终端中使用 `clickhouse client` 连接到节点 `clickhouse-02`。

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

5. 在另一个节点上插入数据，并在节点 `clickhouse-01` 上查询
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
通过运行与用于启动节点的操作系统命令类似的命令来停止一个 ClickHouse 服务器节点。如果您使用了 `systemctl start` 启动节点，则使用 `systemctl stop` 停止它。

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

8. 重启已停止的节点并从那里选择数据

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
