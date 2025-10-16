---
'slug': '/architecture/cluster-deployment'
'sidebar_label': '复制 + 扩展'
'sidebar_position': 100
'title': '复制 + 扩展'
'description': '通过这个教程，您将学习如何设置一个简单的 ClickHouse 集群。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> 在这个例子中，您将学习如何设置一个简单的 ClickHouse 集群，该集群既具有复制功能又具备扩展性。它由两个分片和两个副本组成，并使用 3 节点的 ClickHouse Keeper 集群来管理协调及保持集群中的法定人数。
>
> 您将要设置的集群架构如下所示：

<Image img={SharedReplicatedArchitecture} size='md' alt='2分片和1副本的架构图' />

<DedicatedKeeperServers/>

## 前提条件 {#prerequisites}

- 您之前已设置过一个 [本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基本配置概念，例如 [配置文件](/operations/configuration-files)
- 您的机器上已安装 docker

<VerticalStepper level="h2">

## 设置目录结构和测试环境 {#set-up}

<ExampleFiles/>

在本教程中，您将使用 [Docker compose](https://docs.docker.com/compose/) 来设置 ClickHouse 集群。该设置可以修改为适应独立的本地机器、虚拟机或云实例。

运行以下命令以设置本示例的目录结构：

```bash
mkdir cluster_2S_2R
cd cluster_2S_2R


# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Create clickhouse-server directories
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

将以下 `docker-compose.yml` 文件添加到 `clickhouse-cluster` 目录中：

```yaml title="docker-compose.yml"
version: '3.8'
services:
  clickhouse-01:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-01
    hostname: clickhouse-01
    volumes:
      - ${PWD}/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8123:8123"
      - "127.0.0.1:9000:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-02:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-02
    hostname: clickhouse-02
    volumes:
      - ${PWD}/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8124:8123"
      - "127.0.0.1:9001:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-03:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-03
    hostname: clickhouse-03
    volumes:
      - ${PWD}/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-03/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8125:8123"
      - "127.0.0.1:9002:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-04:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-04
    hostname: clickhouse-04
    volumes:
      - ${PWD}/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-04/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8126:8123"
      - "127.0.0.1:9003:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-keeper-01:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-01
    hostname: clickhouse-keeper-01
    volumes:
      - ${PWD}/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
      - "127.0.0.1:9181:9181"
  clickhouse-keeper-02:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-02
    hostname: clickhouse-keeper-02
    volumes:
      - ${PWD}/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
      - "127.0.0.1:9182:9181"
  clickhouse-keeper-03:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-03
    hostname: clickhouse-keeper-03
    volumes:
      - ${PWD}/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
      - "127.0.0.1:9183:9181"
```

创建以下子目录和文件：

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## 配置 ClickHouse 节点 {#configure-clickhouse-servers}

### 服务器设置 {#server-setup}

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 的每个空配置文件 `config.xml`。下面突出显示的行需要根据每个节点进行更改：

```xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!--highlight-next-line-->
    <display_name>cluster_2S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
        <local_directory>
            <path>/var/lib/clickhouse/access/</path>
        </local_directory>
    </user_directories>
    <distributed_ddl>
        <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <remote_servers>
        <cluster_2S_2R>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-03</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-04</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_2S_2R>
    </remote_servers>
    <zookeeper>
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
    <!--highlight-start-->
    <macros>
        <shard>01</shard>
        <replica>01</replica>
    </macros>
    <!--highlight-end-->
</clickhouse>
```

| 目录                                                         | 文件                                                                                                                                                                         |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

上述配置文件的每个部分将在下面详细解释。

#### 网络与日志记录 {#networking}

<ListenHost/>

日志配置在 `<logger>` 块中定义。此示例配置提供了一个调试日志，日志将在 1000M 时滚动三次：

```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

有关日志配置的更多信息，参见默认 ClickHouse [配置文件](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) 中包含的注释。

#### 集群配置 {#cluster-config}

集群的配置在 `<remote_servers>` 块中设置。在这里，集群名称 `cluster_2S_2R` 被定义。

`<cluster_2S_2R></cluster_2S_2R>` 块定义了集群的布局，使用 `<shard></shard>` 和 `<replica></replica>` 设置，并作为分布式 DDL 查询的模板，这些查询在集群内使用 `ON CLUSTER` 子句执行。默认情况下，允许分布式 DDL 查询，但也可以通过设置 `allow_distributed_ddl_queries` 关闭。

`internal_replication` 设置为 true，以便数据仅写入一个副本。

```xml
<remote_servers>
   <!-- cluster name (should not contain dots) -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
          <internal_replication>true</internal_replication>
          <replica>
              <host>clickhouse-01</host>
              <port>9000</port>
          </replica>
          <replica>
              <host>clickhouse-03</host>
              <port>9000</port>
          </replica>
      </shard>
      <shard>
          <internal_replication>true</internal_replication>
          <replica>
              <host>clickhouse-02</host>
              <port>9000</port>
          </replica>
          <replica>
              <host>clickhouse-04</host>
              <port>9000</port>
          </replica>
      </shard>
  </cluster_2S_2R>
</remote_servers>
```

`<cluster_2S_2R></cluster_2S_2R>` 部分定义了集群的布局，并充当分布式 DDL 查询的模板，这些查询在集群内使用 `ON CLUSTER` 子句执行。

#### Keeper 配置 {#keeper-config-explanation}

`<ZooKeeper>` 部分告知 ClickHouse 点击 House Keeper（或 ZooKeeper）在哪里运行。由于我们使用的是 ClickHouse Keeper 集群，因此集群的每个 `<node>` 都需要指定其主机名和端口号，分别使用 `<host>` 和 `<port>` 标签。

ClickHouse Keeper 的设置将在本教程的下一步中进行解释。

```xml
<zookeeper>
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
```

:::note
尽管可以在同一服务器上运行 ClickHouse Keeper 和 ClickHouse Server，但在生产环境中，我们强烈建议 ClickHouse Keeper 运行在专用主机上。
:::

#### 宏配置 {#macros-config-explanation}

此外，`<macros>` 部分用于定义复制表的参数替代。这些在 `system.macros` 中列出，并允许在查询中使用诸如 `{shard}` 和 `{replica}` 的替代。

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### 用户配置 {#cluster-configuration}

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` 的每个空配置文件 `users.xml`，内容如下：

```xml title="/users.d/users.xml"
<?xml version="1.0"?>
<clickhouse replace="true">
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>in_order</load_balancing>
            <log_queries>1</log_queries>
        </default>
    </profiles>
    <users>
        <default>
            <access_management>1</access_management>
            <profile>default</profile>
            <networks>
                <ip>::/0</ip>
            </networks>
            <quota>default</quota>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
            <show_named_collections>1</show_named_collections>
            <show_named_collections_secrets>1</show_named_collections_secrets>
        </default>
    </users>
    <quotas>
        <default>
            <interval>
                <duration>3600</duration>
                <queries>0</queries>
                <errors>0</errors>
                <result_rows>0</result_rows>
                <read_rows>0</read_rows>
                <execution_time>0</execution_time>
            </interval>
        </default>
    </quotas>
</clickhouse>
```

在本示例中，默认用户配置为无密码以简化操作。在实际应用中，这种做法是不被推荐的。

:::note
在此示例中，每个 `users.xml` 文件在集群中的所有节点上都是相同的。
:::

## 配置 ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

接下来，您将配置 ClickHouse Keeper，用于协调。

### Keeper 设置 {#configuration-explanation}

<KeeperConfig/>

| 目录                                                            | 文件                                                                                                                                                                                         |
|---------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## 测试设置 {#test-the-setup}

确保您的机器上正在运行 docker。使用 `docker-compose up` 命令从 `cluster_2S_2R` 目录的根目录启动集群：

```bash
docker-compose up -d
```

您应该会看到 docker 开始拉取 ClickHouse 和 Keeper 镜像，并随后启动容器：

```bash
[+] Running 8/8
 ✔ Network   cluster_2s_2r_default     Created
 ✔ Container clickhouse-keeper-03      Started
 ✔ Container clickhouse-keeper-02      Started
 ✔ Container clickhouse-keeper-01      Started
 ✔ Container clickhouse-01             Started
 ✔ Container clickhouse-02             Started
 ✔ Container clickhouse-04             Started
 ✔ Container clickhouse-03             Started
```

要验证集群是否正在运行，请连接到任意一个节点并运行以下查询。连接到第一个节点的命令如下所示：

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

如果成功，您将看到 ClickHouse 客户端提示：

```response
cluster_2S_2R node 1 :)
```

运行以下查询以检查定义了哪些集群拓扑以及对应的主机：

```sql title="Query"
SELECT 
    cluster,
    shard_num,
    replica_num,
    host_name,
    port
FROM system.clusters;
```

```response title="Response"
   ┌─cluster───────┬─shard_num─┬─replica_num─┬─host_name─────┬─port─┐
1. │ cluster_2S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_2R │         1 │           2 │ clickhouse-03 │ 9000 │
3. │ cluster_2S_2R │         2 │           1 │ clickhouse-02 │ 9000 │
4. │ cluster_2S_2R │         2 │           2 │ clickhouse-04 │ 9000 │
5. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

运行以下查询以检查 ClickHouse Keeper 集群的状态：

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ task_queue │       │ /clickhouse │
2. │ sessions   │       │ /clickhouse │
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus/>

通过这些步骤，您成功设置了一个具有两个分片和两个副本的 ClickHouse 集群。在下一步中，您将创建一个集群中的表。

## 创建数据库 {#creating-a-database}

现在您已经验证集群正确设置并正在运行，您将重新创建与 [英国房地产价格](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中使用的表相同的表。它由大约 3000 万行自 1995 年以来在英格兰和威尔士支付的房地产价格组成。

通过分别在不同的终端标签或窗口中运行以下每个命令，连接到每个主机的客户端：

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

您可以从每个主机的 clickhouse-client 运行如下查询，以确认除了默认的数据库外，尚未创建任何数据库：

```sql title="Query"
SHOW DATABASES;
```

```response title="Response"
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
   └────────────────────┘
```

从 `clickhouse-01` 客户端运行以下 **分布式** DDL 查询，使用 `ON CLUSTER` 子句创建一个名为 `uk` 的新数据库：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

您可以再次从每个主机的客户端运行相同的查询，以确认尽管只从 `clickhouse-01` 运行查询，但数据库已经跨集群创建：

```sql
SHOW DATABASES;
```

```response
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
#highlight-next-line
5. │ uk                 │
   └────────────────────┘
```

## 在集群上创建分布式表 {#creating-a-table}

数据库创建完成后，接下来您将创建一个分布式表。分布式表是可以访问位于不同主机的分片的表，使用 `Distributed` 表引擎进行定义。分布式表充当集群中所有分片的接口。

从任一主机客户端运行以下查询：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_2S_2R
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
--highlight-next-line
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{database}/{table}/{shard}', '{replica}')
ORDER BY (postcode1, postcode2, addr1, addr2);
```

请注意，它与原始 `CREATE` 语句中使用的查询完全相同，正如 [英国房地产价格](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中所示，只是增加了 `ON CLUSTER` 子句和使用了 `ReplicatedMergeTree` 引擎。

`ON CLUSTER` 子句旨在用于分布式执行 DDL（数据定义语言）查询，例如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`，确保这些模式更改会在集群中的所有节点上应用。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree) 引擎的工作方式与普通的 `MergeTree` 表引擎相同，但它还会复制数据。它需要指定两个参数：

- `zoo_path`：表的元数据在 Keeper/ZooKeeper 中的路径。
- `replica_name`：表的副本名称。

<br/>

`zoo_path` 参数可以设置为您选择的任何内容，尽管建议按照以下约定使用前缀

```text
/clickhouse/tables/{shard}/{database}/{table}
```

其中：
- `{database}` 和 `{table}` 将被自动替换。
- `{shard}` 和 `{replica}` 是在之前的 `config.xml` 文件中定义的宏 [定义](#macros-config-explanation)。

您可以从每个主机客户端运行下面的查询，以确认表已在集群中创建：

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## 向分布式表插入数据 {#inserting-data-using-distributed}

要向分布式表插入数据，不能使用 `ON CLUSTER`，因为它不适用于 DML（数据操作语言）查询，例如 `INSERT`、`UPDATE` 和 `DELETE`。要插入数据，必须使用 [`Distributed`](/engines/table-engines/special/distributed) 表引擎。

从任何主机客户端运行以下查询，以使用之前创建的表创建分布式表，且使用 `ON CLUSTER` 和 `ReplicatedMergeTree` 的方式：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

在每个主机上，您现在将看到 `uk` 数据库中的以下表：

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

数据可以使用以下查询从任何主机客户端插入到 `uk_price_paid_distributed` 表中：

```sql
INSERT INTO uk.uk_price_paid_distributed
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

运行以下查询以确认插入的数据已均匀分布在我们集群的节点之间：

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed;

SELECT count(*) FROM uk.uk_price_paid_local;
```

```response
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘

   ┌──count()─┐
1. │ 15105983 │ -- 15.11 million
   └──────────┘
```

</VerticalStepper>
