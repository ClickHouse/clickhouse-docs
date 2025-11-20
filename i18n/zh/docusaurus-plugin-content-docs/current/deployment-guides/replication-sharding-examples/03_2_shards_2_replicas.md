---
slug: /architecture/cluster-deployment
sidebar_label: '复制与扩展'
sidebar_position: 100
title: '复制与扩展'
description: '通过学习本教程，您将掌握如何搭建一个简单的 ClickHouse 集群。'
doc_type: 'guide'
keywords: ['cluster deployment', 'replication', 'sharding', 'high availability', 'scalability']
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> 在本示例中，你将学习如何搭建一个既支持复制又可扩展的简单 ClickHouse 集群。
> 该集群由两个分片和两个副本组成，并包含一个由 3 个节点构成的 ClickHouse Keeper 集群，用于负责集群内的协调管理并维持仲裁（quorum）。

你将要搭建的集群架构如下所示：

<Image img={SharedReplicatedArchitecture} size="md" alt="用于 2 个分片和 1 个副本的架构图" />

<DedicatedKeeperServers />


## 前置条件 {#prerequisites}

- 您已经设置过[本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基本配置概念,如[配置文件](/operations/configuration-files)
- 您的机器上已安装 Docker

<VerticalStepper level="h2">


## 设置目录结构和测试环境 {#set-up}

<ExampleFiles />

在本教程中，您将使用 [Docker compose](https://docs.docker.com/compose/) 来搭建 ClickHouse 集群。该配置也可以修改后用于独立的本地机器、虚拟机或云实例。

运行以下命令来创建本示例所需的目录结构：

```bash
mkdir cluster_2S_2R
cd cluster_2S_2R

```


# 创建 clickhouse-keeper 目录

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# 创建 clickhouse-server 目录

for i in {01..04}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

```

将以下 `docker-compose.yml` 文件添加到 `clickhouse-cluster` 目录:

```


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

创建如下子目录和文件：

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## 配置 ClickHouse 节点 {#configure-clickhouse-servers}

### 服务器配置 {#server-setup}

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 的各个空配置文件 `config.xml`。下面高亮显示的行需要根据每个节点进行相应修改:

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
    <display_name>cluster_2S_2R 节点 1</display_name>
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

| 目录                                                 | 文件                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

下面将详细说明上述配置文件的各个部分。

#### 网络与日志 {#networking}

<ListenHost />

日志配置在 `<logger>` 块中定义。此示例配置提供一个调试日志,当日志文件达到 1000M 时将进行滚动,最多保留三个文件:


```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

有关日志配置的更多信息,请参阅默认 ClickHouse [配置文件](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)中的注释说明。

#### 集群配置 {#cluster-config}

集群配置在 `<remote_servers>` 块中设置。
这里定义了集群名称 `cluster_2S_2R`。

`<cluster_2S_2R></cluster_2S_2R>` 块使用 `<shard></shard>` 和 `<replica></replica>` 设置定义集群的拓扑结构,并作为分布式 DDL 查询的模板,这些查询通过 `ON CLUSTER` 子句在整个集群上执行。默认情况下,分布式 DDL 查询是允许的,但也可以通过 `allow_distributed_ddl_queries` 设置来禁用。

`internal_replication` 设置为 true,使数据仅写入其中一个副本。

```xml
<remote_servers>
   <!-- 集群名称(不应包含点号) -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- 可选。是否仅将数据写入其中一个副本。默认值:false(将数据写入所有副本)。 -->
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

`<cluster_2S_2R></cluster_2S_2R>` 部分定义集群的拓扑结构,并作为分布式 DDL 查询的模板,这些查询通过 `ON CLUSTER` 子句在整个集群上执行。

#### Keeper 配置 {#keeper-config-explanation}

`<ZooKeeper>` 部分指定 ClickHouse Keeper(或 ZooKeeper)的运行位置。
由于我们使用的是 ClickHouse Keeper 集群,因此需要指定集群的每个 `<node>`,
并分别使用 `<host>` 和 `<port>` 标签指定其主机名和端口号。

ClickHouse Keeper 的配置将在教程的下一步中详细说明。

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
虽然可以在与 ClickHouse Server 相同的服务器上运行 ClickHouse Keeper,
但在生产环境中,我们强烈建议将 ClickHouse Keeper 部署在专用主机上。
:::

#### 宏配置 {#macros-config-explanation}

此外,`<macros>` 部分用于定义复制表的参数替换。这些参数列在 `system.macros` 中,允许在查询中使用 `{shard}` 和 `{replica}` 等替换变量。

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### 用户配置 {#cluster-configuration}

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` 的每个空配置文件 `users.xml`,添加以下内容:


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

在本示例中，为了简化起见，将默认用户配置为无密码。
在实际使用中，不建议这样做。

:::note
在本示例中，集群中所有节点上的 `users.xml` 文件内容完全相同。
:::


## 配置 ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

接下来将配置用于协调的 ClickHouse Keeper。

### Keeper 配置 {#configuration-explanation}

<KeeperConfig />

| 目录                                               | 文件                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## 测试设置 {#test-the-setup}

确保 Docker 在您的机器上正在运行。
在 `cluster_2S_2R` 目录的根目录下使用 `docker-compose up` 命令启动集群:

```bash
docker-compose up -d
```

您将看到 Docker 开始拉取 ClickHouse 和 Keeper 镜像,
然后启动容器:

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

要验证集群是否正在运行,请连接到任意一个节点并执行
以下查询。连接到第一个节点的命令如下:


```bash
# 连接到任意节点
docker exec -it clickhouse-01 clickhouse-client
```

如果连接成功，你会看到 ClickHouse 客户端的提示符：

```response
cluster_2S_2R node 1 :)
```

运行以下查询，查看为各主机定义的集群拓扑：

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

<VerifyKeeperStatus />

至此，你已经成功搭建了一个包含两个分片和两个副本的 ClickHouse 集群。
下一步，你将在该集群中创建一张表。


## 创建数据库 {#creating-a-database}

现在您已验证集群配置正确且正在运行,接下来将重新创建与 [英国房产价格](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中相同的表。该数据集包含自 1995 年以来英格兰和威尔士房地产交易价格的约 3000 万行数据。

在不同的终端标签页或窗口中分别运行以下命令,连接到各个主机的客户端:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

您可以在每个主机的 clickhouse-client 中运行以下查询,确认除默认数据库外尚未创建其他数据库:

```sql title="查询"
SHOW DATABASES;
```

```response title="响应"
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
   └────────────────────┘
```

在 `clickhouse-01` 客户端中运行以下**分布式** DDL 查询,使用 `ON CLUSTER` 子句创建名为 `uk` 的新数据库:

```sql
CREATE DATABASE IF NOT EXISTS uk
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

您可以再次在每个主机的客户端中运行相同的查询,确认尽管仅从 `clickhouse-01` 运行了查询,但数据库已在整个集群中创建:

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


## 在集群上创建表 {#creating-a-table}

现在数据库已经创建完成,接下来您将创建一个带有复制功能的表。

从任意主机客户端运行以下查询:

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

请注意,该查询与[英国房产价格](/getting-started/example-datasets/uk-price-paid)示例数据集教程中原始 `CREATE` 语句使用的查询相同,只是增加了 `ON CLUSTER` 子句并使用了 `ReplicatedMergeTree` 引擎。

`ON CLUSTER` 子句专为分布式执行 DDL(数据定义语言)查询而设计,例如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`,确保这些模式变更应用于集群中的所有节点。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
引擎的工作方式与普通的 `MergeTree` 表引擎相同,但它还会复制数据。
它需要指定两个参数:

- `zoo_path`:表元数据在 Keeper/ZooKeeper 中的路径。
- `replica_name`:表的副本名称。

<br />

`zoo_path` 参数可以设置为您选择的任何值,但建议遵循使用前缀的约定

```text
/clickhouse/tables/{shard}/{database}/{table}
```

其中:

- `{database}` 和 `{table}` 将自动替换。
- `{shard}` 和 `{replica}` 是宏,之前已在每个 ClickHouse 节点的 `config.xml` 文件中[定义](#macros-config-explanation)。

您可以从每个主机的客户端运行以下查询,以确认表已在整个集群中创建:

```sql title="查询"
SHOW TABLES IN uk;
```

```response title="响应"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```


## 向分布式表插入数据 {#inserting-data-using-distributed}

向表中插入数据时,不能使用 `ON CLUSTER`,因为它不适用于 DML(数据操作语言)查询,如 `INSERT`、`UPDATE` 和 `DELETE`。要插入数据,需要使用 [`Distributed`](/engines/table-engines/special/distributed) 表引擎。
正如您在[指南](/architecture/horizontal-scaling)中学习的设置具有 2 个分片和 1 个副本的集群时所了解的,分布式表是能够访问位于不同主机上的分片的表,使用 `Distributed` 表引擎定义。
分布式表充当集群中所有分片的统一接口。

从任意主机客户端运行以下查询,使用我们在上一步中创建的现有复制表来创建分布式表:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

现在,您将在每个主机的 `uk` 数据库中看到以下表:

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

可以使用以下查询从任意主机客户端向 `uk_price_paid_distributed` 表插入数据:

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

运行以下查询以确认插入的数据已均匀分布在集群的各个节点上:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed;

SELECT count(*) FROM uk.uk_price_paid_local;
```

```response
   ┌──count()─┐
1. │ 30212555 │ -- 3021万
   └──────────┘

   ┌──count()─┐
1. │ 15105983 │ -- 1510万
   └──────────┘
```

</VerticalStepper>


## 总结 {#conclusion}

这种包含 2 个分片和 2 个副本的集群拓扑的优势在于它同时提供了可扩展性和容错能力。
数据分布在不同的主机上,降低了每个节点的存储和 I/O 需求,同时查询在两个分片上并行处理,从而提高了性能和内存效率。
更重要的是,集群可以容忍单个节点的故障并继续不间断地提供查询服务,因为每个分片在另一个节点上都有备份副本。

这种集群拓扑的主要缺点是存储开销增加——由于每个分片都被复制,它需要的存储容量是无副本配置的两倍。
此外,虽然集群可以在单个节点故障时继续运行,但同时丢失两个节点可能会导致集群无法运行,具体取决于哪些节点发生故障以及分片的分布方式。
这种拓扑在可用性和成本之间取得了平衡,适用于需要一定程度容错能力但又不希望承担更高副本因子成本的生产环境。

要了解 ClickHouse Cloud 如何处理查询并同时提供可扩展性和容错能力,请参阅["并行副本"](/deployment-guides/parallel-replicas)部分。
