---
slug: /architecture/cluster-deployment
sidebar_label: '复制与扩展'
sidebar_position: 100
title: '复制与扩展'
description: '通过本教程，您将学会如何搭建一个简单的 ClickHouse 集群。'
doc_type: 'guide'
keywords: ['集群部署', '复制', '分片', '高可用性', '可扩展性']
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

> 在这个示例中，你将学习如何设置一个既可复制又可扩展的简单 ClickHouse 集群。该集群由两个分片和两个副本组成，并包含一个由 3 个节点构成的 ClickHouse Keeper 集群，用于进行协调管理并维持集群内的仲裁（quorum）。

你即将搭建的集群架构如下图所示：

<Image img={SharedReplicatedArchitecture} size="md" alt="2 个分片和 1 个副本的架构示意图" />

<DedicatedKeeperServers />


## 前置条件 {#prerequisites}

- 您已经设置过[本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基本配置概念,如[配置文件](/operations/configuration-files)
- 您的机器上已安装 Docker

<VerticalStepper level="h2">


## 设置目录结构和测试环境

<ExampleFiles />

在本教程中，将使用 [Docker Compose](https://docs.docker.com/compose/) 来
搭建 ClickHouse 集群。该配置也可以调整后用于
单独的本地机器、虚拟机或云实例。

运行以下命令为本示例设置目录结构：

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

将以下 `docker-compose.yml` 文件添加到 `clickhouse-cluster` 目录中:

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

创建以下子目录和文件：

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## 配置 ClickHouse 节点

### 服务器配置

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 中的每个空配置文件 `config.xml`。下面高亮显示的行需要根据各个节点进行相应修改：

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

| 目录                                                        | 文件                                                                                                                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

上述配置文件的各个部分将在下文中进行更详细的说明。

#### 网络与日志

<ListenHost />

日志配置在 `<logger>` 块中定义。此示例配置会生成调试日志，并在日志文件大小达到 1000M 时进行滚动，最多保留 3 个轮转文件：


```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

有关日志配置的更多信息，请参阅默认 ClickHouse [配置文件](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) 中的注释。

#### 集群配置

集群的配置在 `<remote_servers>` 块中进行设置。
这里定义了集群名称 `cluster_2S_2R`。

`<cluster_2S_2R></cluster_2S_2R>` 块定义了集群的拓扑结构，
使用 `<shard></shard>` 和 `<replica></replica>` 设置，并作为分布式 DDL 查询的
模板。这类查询会使用 `ON CLUSTER` 子句在整个集群上执行。默认情况下，允许
分布式 DDL 查询，但也可以通过设置 `allow_distributed_ddl_queries` 将其关闭。

`internal_replication` 设置为 true，这样数据只会写入其中一个副本。

```xml
<remote_servers>
   <!-- 集群名称（不应包含点） -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- 可选。是否仅将数据写入一个副本。默认值：false（将数据写入所有副本）。 -->
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

`<cluster_2S_2R></cluster_2S_2R>` 部分定义了集群的布局，
并作为分布式 DDL 查询的模板，这类查询会使用 `ON CLUSTER` 子句
在整个集群上执行。

#### Keeper 配置

`<ZooKeeper>` 部分用于告知 ClickHouse ClickHouse Keeper（或 ZooKeeper）运行的位置。
由于我们使用的是 ClickHouse Keeper 集群，因此需要为该集群中的每个 `<node>` 进行配置，
并分别使用 `<host>` 和 `<port>` 标签来指定其主机名和端口号。

ClickHouse Keeper 的部署配置将在本教程的下一步中进行说明。

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
虽然可以在与 ClickHouse Server 相同的服务器上运行 ClickHouse Keeper，
但在生产环境中我们强烈建议将 ClickHouse Keeper 部署在专用主机上。
:::

#### 宏（Macros）配置

此外，`<macros>` 部分用于为复制表定义参数替换。
这些参数列在 `system.macros` 中，并允许在查询中使用 `{shard}` 和 `{replica}` 等替换项。

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### 用户配置

现在将位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` 的每个空配置文件 `users.xml` 修改为以下内容：


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

在本示例中，为了简化配置，默认用户未设置密码。
在实际使用中并不推荐这样做。

:::note
在本示例中，集群中所有节点的 `users.xml` 文件内容完全相同。
:::


## 配置 ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

接下来将配置 ClickHouse Keeper，用于协调管理。

### Keeper 配置 {#configuration-explanation}

<KeeperConfig/>

| 目录                                                        | 文件                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>



## 测试配置

确保你的机器上已启动 Docker。
在 `cluster_2S_2R` 目录的根路径下运行 `docker-compose up` 命令以启动集群：

```bash
docker-compose up -d
```

你应当会看到 Docker 开始拉取 ClickHouse 和 Keeper 镜像，
然后启动容器：

```bash
[+] 运行中 8/8
 ✔ 网络   cluster_2s_2r_default     已创建
 ✔ 容器 clickhouse-keeper-03      已启动
 ✔ 容器 clickhouse-keeper-02      已启动
 ✔ 容器 clickhouse-keeper-01      已启动
 ✔ 容器 clickhouse-01             已启动
 ✔ 容器 clickhouse-02             已启动
 ✔ 容器 clickhouse-04             已启动
 ✔ 容器 clickhouse-03             已启动
```

要验证集群是否正在运行，请连接到任意节点并运行以下查询。连接到第一个节点的命令如下：


```bash
# 连接到任意节点
docker exec -it clickhouse-01 clickhouse-client
```

如果成功，将看到 ClickHouse 客户端提示符：

```response
cluster_2S_2R node 1 :)
```

运行以下查询，查看各主机定义的集群拓扑：

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

运行以下查询来检查 ClickHouse Keeper 集群的状态：

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

至此，你已成功部署了一个具有两个分片和两个副本的 ClickHouse 集群。
下一步，你将在该集群中创建一张表。


## 创建数据库

现在，您已经验证集群已正确配置并正在运行，接下来将重新创建与 [UK property prices](/getting-started/example-datasets/uk-price-paid)
示例数据集教程中使用的同一个表。该数据集包含自 1995 年以来英格兰和威尔士房地产成交价格的大约 3000 万行记录。

在不同的终端标签页或窗口中分别运行以下命令，以连接到每个主机上的客户端：

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

你可以在每台主机上通过 clickhouse-client 运行下面的查询，以确认除了默认数据库外尚未创建任何其他数据库：

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

在 `clickhouse-01` 客户端中运行以下 **分布式** DDL 查询，使用
`ON CLUSTER` 子句创建一个名为 `uk` 的新数据库：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

你可以像之前一样，从每个主机上的客户端再次运行相同的查询，
以确认即使只在 `clickhouse-01` 上运行了该查询，
数据库也已经在整个集群中创建：

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


## 在集群上创建表

现在数据库已经创建完成，接下来将创建一个带副本的表。

在任意一台主机上的客户端运行以下查询：

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

请注意，这个查询与示例数据集教程
[UK property prices](/getting-started/example-datasets/uk-price-paid)
中原始 `CREATE` 语句所使用的查询完全相同，
只是多了 `ON CLUSTER` 子句并使用了 `ReplicatedMergeTree` 引擎。

`ON CLUSTER` 子句是为 DDL（Data Definition Language，数据定义语言）
语句（如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`）的分布式执行而设计的，
用于确保这些架构更改会应用到集群中的所有节点。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
引擎的工作方式与普通的 `MergeTree` 表引擎相同，但它还会复制数据。
它需要指定两个参数：

* `zoo_path`：Keeper/ZooKeeper 中表元数据的路径。
* `replica_name`：表副本名称。

<br />

`zoo_path` 参数可以设置为任意值，不过建议遵循以下约定，
使用前缀

```text
/clickhouse/tables/{shard}/{database}/{table}
```

其中：

* `{database}` 和 `{table}` 会被自动替换。
* `{shard}` 和 `{replica}` 是宏，之前已经在每个 ClickHouse 节点的 `config.xml` 文件中[定义](#macros-config-explanation)。

你可以在每个主机上的客户端中运行下面的查询，以确认该表已在整个集群中创建：

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
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


## 结论 {#conclusion}

这种由 2 个分片和 2 个副本组成的集群拓扑结构的优势在于，同时提供可扩展性和容错能力。
数据分布在不同主机上，降低了每个节点的存储和 I/O 需求，同时查询会在两个分片上并行处理，从而提升性能和内存效率。
更为关键的是，集群可以在单个节点发生故障时继续无中断地提供查询服务，因为每个分片在另一节点上都拥有可用的副本。

该集群拓扑结构的主要劣势是更高的存储开销——与无副本的部署相比，它需要两倍的存储容量，因为每个分片都会被复制一份。
此外，虽然集群可以在单个节点故障时保持运行，但如果两个节点同时失效，可能会导致集群无法工作，这取决于故障发生在哪些节点以及分片是如何分布的。
这种拓扑在可用性与成本之间取得了平衡，适合用于需要一定容错能力、但又不希望付出更高复制因子成本的生产环境。

若要了解 ClickHouse Cloud 如何处理查询，以同时实现可扩展性和容错能力，请参阅 ["Parallel Replicas"](/deployment-guides/parallel-replicas) 一节。