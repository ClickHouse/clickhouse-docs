---
slug: /architecture/replication
sidebar_label: '复制'
sidebar_position: 10
title: '数据复制'
description: '本页面描述了一个包含五台服务器的示例架构：其中两台用于承载数据副本，其余服务器用于协调数据复制'
doc_type: 'guide'
keywords: ['复制', '高可用性', '集群设置', '数据冗余', '容错']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/replication.png';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> 在本示例中，你将学习如何搭建一个简单的 ClickHouse 集群，用于进行数据复制。该集群中配置了五台服务器，其中两台用于存储数据副本，另外三台服务器用于协调数据复制过程。

你将要搭建的集群架构如下图所示：

<Image img={ReplicationArchitecture} size="md" alt="包含 1 个分片和 2 个副本的 ReplicatedMergeTree 架构示意图" />

<DedicatedKeeperServers />


## 前提条件 {#pre-requisites}

- 您已经部署过[本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基础配置概念，例如[配置文件](/operations/configuration-files)
- 您的机器上已经安装了 Docker

<VerticalStepper level="h2">


## 设置目录结构和测试环境

<ExampleFiles />

在本教程中，您将使用 [Docker Compose](https://docs.docker.com/compose/) 来
搭建 ClickHouse 集群。该配置也可以调整后用于
独立的本地机器、虚拟机或云实例。

运行以下命令，为本示例创建目录结构：

```bash
mkdir cluster_1S_2R
cd cluster_1S_2R
```


# 创建 clickhouse-keeper 目录

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# 创建 clickhouse-server 目录

for i in {01..02}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

````

将以下 `docker-compose.yml` 文件添加到 `cluster_1S_2R` 目录中：

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
````

创建以下子目录和文件：

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## 配置 ClickHouse 节点

### 服务器设置

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 中的每个空配置文件 `config.xml`。以下高亮的行需要根据各个节点分别进行修改：

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
    <display_name>cluster_1S_2R 节点 1</display_name>
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
        <cluster_1S_2R>
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
        <cluster>cluster_1S_2R</cluster>
    </macros>
    <!--highlight-end-->
</clickhouse>
```

| Directory                                                 | File                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

上述配置文件的各个部分在下文会有更为详细的说明。

#### 网络和日志

<ListenHost />

日志在 `<logger>` 块中定义。此示例配置会为你提供调试日志，
当日志大小达到 1000M 时触发轮转，最多轮转三次：

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

集群的配置在 `<remote_servers>` 块中完成。
这里定义了集群名称 `cluster_1S_2R`。


`<cluster_1S_2R></cluster_1S_2R>` 块使用 `<shard></shard>` 和 `<replica></replica>` 设置来定义集群布局，并作为分布式 DDL 查询的模板。这类查询通过 `ON CLUSTER` 子句在整个集群上执行。默认情况下允许分布式 DDL 查询，但也可以通过设置 `allow_distributed_ddl_queries` 将其关闭。

`internal_replication` 被设置为 true，因此数据只会写入其中一个副本。

```xml
<remote_servers>
    <!-- 集群名称(不应包含点) -->
    <cluster_1S_2R>
        <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
        <shard>
            <!-- 可选。是否仅将数据写入一个副本。默认值: false(将数据写入所有副本)。 -->
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
```

<ServerParameterTable />

#### Keeper 配置

`<ZooKeeper>` 部分用于告诉 ClickHouse，ClickHouse Keeper（或 ZooKeeper） 正在运行的位置。
由于我们使用的是 ClickHouse Keeper 集群，需要为集群中的每个 `<node>` 指定配置，
并分别通过 `<host>` 和 `<port>` 标签配置其主机名和端口号。

ClickHouse Keeper 的设置将在本教程的下一步中进行讲解。

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
尽管可以在与 ClickHouse Server 相同的服务器上运行 ClickHouse Keeper，
但在生产环境中我们强烈建议将 ClickHouse Keeper 运行在独立主机上。
:::

#### 宏配置

此外，`&lt;macros&gt;` 部分用于为复制表定义参数替换。
这些宏列在 `system.macros` 中，并允许在查询中使用 `{shard}` 和 `{replica}` 等替换参数。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
    <cluster>cluster_1S_2R</cluster>
</macros>
```

:::note
这些值需要根据集群的拓扑结构单独定义。
:::

### 用户配置

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


| Directory                                                 | File                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

在此示例中，为了简单起见，将默认用户配置为不设密码。
在实际生产环境中，不建议这样做。

:::note
在此示例中，集群中所有节点上的 `users.xml` 文件内容完全相同。
:::



## 配置 ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Keeper 配置 {#configuration-explanation}

<KeeperConfig/>

| 目录                                                        | 文件                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>



## 测试部署

确保 Docker 已在本机运行。
在 `cluster_1S_2R` 目录的根目录下使用 `docker-compose up` 命令启动集群：

```bash
docker-compose up -d
```

现在应能看到 Docker 开始拉取 ClickHouse 和 Keeper 镜像，
然后启动这些容器：

```bash
[+] 正在运行 6/6
 ✔ 网络 cluster_1s_2r_default   已创建
 ✔ 容器 clickhouse-keeper-03  已启动
 ✔ 容器 clickhouse-keeper-02  已启动
 ✔ 容器 clickhouse-keeper-01  已启动
 ✔ 容器 clickhouse-01         已启动
 ✔ 容器 clickhouse-02         已启动
```

要验证集群是否已正常运行，可以连接到 `clickhouse-01` 或 `clickhouse-02` 并运行以下查询。下面展示的是连接到第一个节点的命令：


```bash
# 连接到任意节点
docker exec -it clickhouse-01 clickhouse-client
```

如果成功，你将看到 ClickHouse 客户端提示符：

```response
cluster_1S_2R node 1 :)
```

运行以下查询，检查各主机上定义的集群拓扑：

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
1. │ cluster_1S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_1S_2R │         1 │           2 │ clickhouse-02 │ 9000 │
3. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

运行以下查询来检查 ClickHouse Keeper 集群状态：

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ sessions   │       │ /clickhouse │
2. │ task_queue │       │ /clickhouse │
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus />

至此，您已经成功部署了一个由单个分片和两个副本组成的 ClickHouse 集群。
下一步，您将在该集群中创建一张表。


## 创建数据库

现在你已经验证集群已正确完成设置并正在运行，接下来你将重新创建一张与 [UK property prices](/getting-started/example-datasets/uk-price-paid)
示例数据集教程中使用的同一张表。该表包含自 1995 年以来英格兰和威尔士房地产成交价格的大约 3,000 万行记录。

在不同的终端标签页或窗口中分别运行以下每条命令，以连接到每个主机上的客户端：

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

你可以在每台主机上通过 clickhouse-client 运行下面的查询，以确认除默认数据库外尚未创建任何其他数据库：

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

在 `clickhouse-01` 客户端上运行以下带有 `ON CLUSTER` 子句的**分布式** DDL 查询，以创建名为 `uk` 的新数据库：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_1S_2R;
```

你可以再次在每个主机的客户端上运行之前的同一条查询，
以确认尽管只在 `clickhouse-01` 上运行过该查询，
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


## 在集群上创建一张表

现在数据库已经创建完成，接下来在集群上创建一张表。
在任意一台主机上的客户端中运行以下查询：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_1S_2R
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
ENGINE = ReplicatedMergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

请注意，该查询与
[UK property prices](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中最初的
`CREATE` 语句完全相同，
只是多了 `ON CLUSTER` 子句，并且使用了 `ReplicatedMergeTree` 引擎。

`ON CLUSTER` 子句用于在集群中分布式执行 DDL（Data Definition Language，数据定义语言）
查询，比如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`，以确保这些
模式变更会应用到集群中的所有节点。

[`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
引擎的工作方式与普通的 `MergeTree` 表引擎相同，但它还会对数据进行复制。

你可以在 `clickhouse-01` 或 `clickhouse-02` 客户端中运行下面的查询，
以确认该表已经在整个集群中创建完成：

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid.      │
   └─────────────────────┘
```


## 插入数据

由于数据集较大，完全摄取需要几分钟时间，我们将先只插入一个较小的子集。

在 `clickhouse-01` 上使用下面的查询插入这个较小的数据子集：

```sql
INSERT INTO uk.uk_price_paid_local
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
) LIMIT 10000
SETTINGS max_http_get_redirects=10;
```

请注意，每台主机上都保存了一份完整的数据副本：

```sql
-- clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local

--   ┌─count()─┐
-- 1.│   10000 │
--   └─────────┘

-- clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local

--   ┌─count()─┐
-- 1.│   10000 │
--   └─────────┘
```

为了演示当其中一台主机发生故障时会发生什么，请在任意一台主机上创建一个简单的测试数据库和测试表：

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_1S_2R;
CREATE TABLE test.test_table ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `name` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id;
```

与 `uk_price_paid` 表类似，我们可以在任意一台主机上插入数据：

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

但如果其中一个主机宕机会发生什么？要模拟这种情况，请运行以下命令停止
`clickhouse-01`：

```bash
docker stop clickhouse-01
```

通过运行以下命令确认该主机是否已宕机：

```bash
docker-compose ps
```

```response title="Response"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X minutes ago    Up X minutes    127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X minutes ago    Up X minutes    127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X minutes ago    Up X minutes    127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X minutes ago    Up X minutes    127.0.0.1:9183->9181/tcp
```

现在 `clickhouse-01` 已停止运行，再向测试表中插入一行数据，然后查询该表：

```sql
INSERT INTO test.test_table (id, name) VALUES (2, 'Alexey Milovidov');
SELECT * FROM test.test_table;
```


```response title="响应"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

现在使用以下命令重启 `clickhouse-01`(之后可以再次运行 `docker-compose ps` 确认):

```sql
docker start clickhouse-01
```

运行 `docker exec -it clickhouse-01 clickhouse-client` 后,从 `clickhouse-01` 再次查询测试表:

```sql title="查询"
SELECT * FROM test.test_table
```

```response title="响应"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

如果此时您希望摄取完整的英国房产价格数据集进行测试,可以运行以下查询:

```sql
TRUNCATE TABLE uk.uk_price_paid_local ON CLUSTER cluster_1S_2R;
INSERT INTO uk.uk_price_paid_local
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

从 `clickhouse-02` 或 `clickhouse-01` 查询表:

```sql title="查询"
SELECT count(*) FROM uk.uk_price_paid_local;
```

```response title="响应"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

</VerticalStepper>


## 结论 {#conclusion}

这种集群拓扑结构的优势在于，在使用两个副本时，你的数据会存在于两台不同的主机上。如果其中一台主机发生故障，另一台副本可以继续无损地提供数据服务，从而消除存储层面的单点故障。

当一台主机宕机时，剩余的副本仍然可以：
- 不间断地处理读查询
- 接受新的写入（取决于你的一致性配置）
- 为应用程序保持服务可用性

当发生故障的主机恢复上线后，它将能够：
- 自动从健康副本同步缺失的数据
- 在无需人工干预的情况下恢复正常运行
- 快速恢复完整冗余能力

在下一个示例中，我们将介绍如何设置一个具有两个分片但只有一个副本的集群。
