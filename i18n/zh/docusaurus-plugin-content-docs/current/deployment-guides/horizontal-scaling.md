---
'slug': '/architecture/horizontal-scaling'
'sidebar_label': '扩展'
'sidebar_position': 10
'title': '横向扩展'
'description': '描述一个旨在提供可扩展性的示例架构的页面'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import scalingOut1 from '@site/static/images/deployment-guides/scaling-out-1.png';

## 描述 {#description}
此示例架构旨在提供可扩展性。它包含三个节点：两个结合了 ClickHouse 及协调功能 (ClickHouse Keeper) 的服务器，以及第三个仅有 ClickHouse Keeper 的服务器，以完成三节点的法定人数。在此示例中，我们将创建一个数据库、一个表和一个能够查询两个节点上数据的分布式表。

## 级别: 基础 {#level-basic}

<ReplicationShardingTerminology />

## 环境 {#environment}
### 架构图 {#architecture-diagram}

<Image img={scalingOut1} size='md' alt='包含 2 个分片和 1 个副本的架构图' />

|节点|描述|
|----|-----------|
|`chnode1`|数据 + ClickHouse Keeper|
|`chnode2`|数据 + ClickHouse Keeper|
|`chnode3`|用于 ClickHouse Keeper 的法定人数|

:::note
在生产环境中，我们强烈建议将 ClickHouse Keeper 运行在专用主机上。这种基本配置在 ClickHouse 服务器进程内运行 Keeper 功能。有关独立部署 ClickHouse Keeper 的说明，请参见[安装文档](/getting-started/install/install.mdx)。
:::

## 安装 {#install}

按照[您档案类型的说明](/getting-started/install/install.mdx)在三台服务器上安装 ClickHouse（.deb、.rpm、.tar.gz 等）。对于此示例，您将在所有三台机器上执行 ClickHouse Server 和 Client 的安装说明。

## 编辑配置文件 {#editing-configuration-files}

<ConfigFileNote />

## chnode1 配置 {#chnode1-configuration}

对于 `chnode1`，有五个配置文件。您可以选择将这些文件合并为一个文件，但出于文档的清晰性，分开查看这些文件可能更简单。当您阅读配置文件时，您会发现 `chnode1` 与 `chnode2` 之间大部分配置是相同的；差异将被突出显示。

### 网络和日志配置 {#network-and-logging-configuration}

这些值可以根据您的需要进行自定义。此示例配置为您提供了一个调试日志，该日志将在 1000M 时滚动三次。 ClickHouse 将在 IPv4 网络上侦听端口 8123 和 9000，并将使用端口 9009 进行服务器间通信。

```xml title="network-and-logging.xml on chnode1"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### ClickHouse Keeper 配置 {#clickhouse-keeper-configuration}

ClickHouse Keeper 提供数据复制和分布式 DDL 查询执行的协调系统。 ClickHouse Keeper 与 Apache ZooKeeper 兼容。此配置在端口 9181 启用 ClickHouse Keeper。突出显示的行指定此实例的 Keeper `server_id` 为 1。这是 `enable-keeper.xml` 文件在三台服务器之间唯一的差异。`chnode2` 的 `server_id` 设置为 `2`，`chnode3` 的 `server_id` 设置为 `3`。三个服务器的 raft 配置部分是相同的，下面已突出显示以显示 `server_id` 与 raft 配置中 `server` 实例之间的关系。

:::note
如果因为任何原因替换或重建一个 Keeper 节点，请不要重用已存在的 `server_id`。例如，如果 `server_id` 为 `2` 的 Keeper 节点被重建，请将其设置为 `4` 或更高。
:::

```xml title="enable-keeper.xml on chnode1"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
    # highlight-start
        <server>
            <id>1</id>
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
    # highlight-end
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### 宏配置 {#macros-configuration}

宏 `shard` 和 `replica` 减少了分布式 DDL 的复杂性。配置的值会自动替换到您的 DDL 查询中，从而简化您的 DDL。此配置的宏为每个节点指定了分片和副本编号。在此 2 分片 1 副本示例中，副本宏在 `chnode1` 和 `chnode2` 上均为 `replica_1`，因为只有一个副本。分片宏在 `chnode1` 上为 `1`，在 `chnode2` 上为 `2`。

```xml title="macros.xml on chnode1"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>
```

### 复制与分片配置 {#replication-and-sharding-configuration}

从顶部开始：
- XML 的 `remote_servers` 部分指定了环境中的每个集群。属性 `replace=true` 将默认 ClickHouse 配置中的示例 `remote_servers` 替换为此文件中指定的 `remote_servers` 配置。没有此属性时，此文件中的远程服务器将附加到默认配置中的示例列表后面。
- 在此示例中，有一个名为 `cluster_2S_1R` 的集群。
- 为名为 `cluster_2S_1R` 的集群创建了一个值为 `mysecretphrase` 的秘密。此秘密在环境中的所有远程服务器之间共享，以确保正确的服务器连接在一起。
- 集群 `cluster_2S_1R` 具有两个分片，每个分片都有一个副本。请查看本文件开头的架构图，并将其与下面 XML 中的两个 `shard` 定义进行比较。在每个分片定义中都有一个副本。副本为该特定分片。指定了该副本的主机和端口。配置中第一个分片的副本存储在 `chnode1` 上，第二个分片的副本存储在 `chnode2` 上。
- 分片的内部复制设置为 true。每个分片可以在配置文件中定义 `internal_replication` 参数。如果将此参数设置为 true，则写操作将选择第一个健康的副本并将数据写入其中。

```xml title="remote-servers.xml on chnode1"
<clickhouse>
  <remote_servers replace="true">
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
  </remote_servers>
</clickhouse>
```

### 配置 Keeper 的使用 {#configuring-the-use-of-keeper}

在上方的几个文件中配置了 ClickHouse Keeper。此配置文件 `use-keeper.xml` 配置 ClickHouse Server 使用 ClickHouse Keeper 进行复制和分布式 DDL 的协调。该文件指定 ClickHouse Server 应在 chnode1 - 3 上的端口 9181 使用 Keeper，并且 `chnode1` 和 `chnode2` 上的文件是相同的。

```xml title="use-keeper.xml on chnode1"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>chnode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## chnode2 配置 {#chnode2-configuration}

由于 `chnode1` 和 `chnode2` 的配置非常相似，这里只会指出差异。

### 网络和日志配置 {#network-and-logging-configuration-1}

```xml title="network-and-logging.xml on chnode2"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### ClickHouse Keeper 配置 {#clickhouse-keeper-configuration-1}

此文件包含 `chnode1` 和 `chnode2` 之间的两个差异之一。在 Keeper 配置中，`server_id` 设置为 `2`。

```xml title="enable-keeper.xml on chnode2"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
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
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
        # highlight-start
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        # highlight-end
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### 宏配置 {#macros-configuration-1}

宏配置是 `chnode1` 和 `chnode2` 之间的差异之一。该节点上的 `shard` 设置为 `2`。

```xml title="macros.xml on chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

### 复制与分片配置 {#replication-and-sharding-configuration-1}

```xml title="remote-servers.xml on chnode2"
<clickhouse>
  <remote_servers replace="true">
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1</host>
                <port>9000</port>
            </replica>
        </shard>
            <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
  </remote_servers>
</clickhouse>
```

### 配置 Keeper 的使用 {#configuring-the-use-of-keeper-1}

```xml title="use-keeper.xml on chnode2"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>chnode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## chnode3 配置 {#chnode3-configuration}

由于 `chnode3` 不存储数据，仅用于 ClickHouse Keeper 提供法定人数的第三个节点，`chnode3` 仅有两个配置文件，一个用于配置网络和日志，另一个用于配置 ClickHouse Keeper。

### 网络和日志配置 {#network-and-logging-configuration-2}

```xml title="network-and-logging.xml on chnode3"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### ClickHouse Keeper 配置 {#clickhouse-keeper-configuration-2}

```xml title="enable-keeper.xml on chnode3"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
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
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        # highlight-start
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
        # highlight-end
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

## 测试 {#testing}

1. 连接到 `chnode1` 并验证上述配置的集群 `cluster_2S_1R` 是否存在

```sql title="Query"
SHOW CLUSTERS
```

```response title="Response"
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```

2. 在集群上创建数据库

```sql title="Query"
CREATE DATABASE db1 ON CLUSTER cluster_2S_1R
```

```response title="Response"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. 在集群上创建一个 MergeTree 表引擎的表。
:::note
我们不需要在表引擎上指定参数，因为这些参数将根据我们的宏自动定义。
:::

```sql title="Query"
CREATE TABLE db1.table1 ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
```
```response title="Response"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. 连接到 `chnode1` 并插入一行

```sql title="Query"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

5. 连接到 `chnode2` 并插入一行

```sql title="Query"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

6. 连接到任一节点，`chnode1` 或 `chnode2`，您将仅看到在该节点的表中插入的行。例如，在 `chnode2` 上

```sql title="Query"
SELECT * FROM db1.table1;
```

```response title="Response"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

7. 创建一个分布式表以查询两个节点的两个分片。
（在此示例中，`rand()` 函数被设置为分片键，以便随机分配每个插入）

```sql title="Query"
CREATE TABLE db1.table1_dist ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand())
```

```response title="Response"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

8. 连接到 `chnode1` 或 `chnode2`，并查询分布式表以查看两行。

```sql title="Query"
SELECT * FROM db1.table1_dist;
```

```reponse title="Response"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```


## 了解更多信息： {#more-information-about}

- [分布式表引擎](/engines/table-engines/special/distributed.md)
- [ClickHouse Keeper](/guides/sre/keeper/index.md)
