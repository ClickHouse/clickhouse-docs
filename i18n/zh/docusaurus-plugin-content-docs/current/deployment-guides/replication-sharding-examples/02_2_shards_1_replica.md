---
slug: /architecture/horizontal-scaling
sidebar_label: '扩展'
sidebar_position: 10
title: '扩展'
description: '介绍一个为实现可扩展性而设计的示例架构的页面'
doc_type: 'guide'
keywords: ['sharding', 'horizontal scaling', 'distributed data', 'cluster setup', 'data distribution']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
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

> 在本示例中，你将学习如何搭建一个简单且可扩展的 ClickHouse 集群。
> 共配置了五台服务器，其中两台用于对数据进行分片。
> 另外三台服务器用于协调。

你将要搭建的集群架构如下所示：

<Image img={ShardingArchitecture} size="md" alt="包含 2 个分片和 1 个副本的架构图" />

<DedicatedKeeperServers />


## 前置条件 {#pre-requisites}

- 您已经设置过[本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基本配置概念,例如[配置文件](/operations/configuration-files)
- 您的机器上已安装 Docker

<VerticalStepper level="h2">


## 设置目录结构和测试环境 {#set-up}

<ExampleFiles />

在本教程中,您将使用 [Docker compose](https://docs.docker.com/compose/) 来设置 ClickHouse 集群。该配置也可以修改后用于独立的本地机器、虚拟机或云实例。

运行以下命令来设置本示例的目录结构:

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R

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

将以下 `docker-compose.yml` 文件添加到 `clickhouse-cluster` 目录:

```yaml title="docker-compose.yml"
version: '3.8'
services:
  clickhouse-01:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-01
    hostname: clickhouse-01
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.1
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
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.2
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
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.5
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9181:9181"
  clickhouse-keeper-02:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-02
    hostname: clickhouse-keeper-02
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.6
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9182:9181"
  clickhouse-keeper-03:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-03
    hostname: clickhouse-keeper-03
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.7
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9183:9181"
networks:
  cluster_2S_1R:
    driver: bridge
    ipam:
      config:
        - subnet: 192.168.7.0/24
          gateway: 192.168.7.254
````

创建以下子目录和文件:


```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## 配置 ClickHouse 节点 {#configure-clickhouse-servers}

### 服务器配置 {#server-setup}

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 的每个空配置文件 `config.xml`。下面高亮显示的行需要根据每个节点进行相应修改:

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
    <display_name>cluster_2S_1R 节点 1</display_name>
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
        <cluster_2S_1R>
            <shard>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_2S_1R>
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

| Directory                                                 | File                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

下文将详细说明上述配置文件的各个部分。

#### 网络和日志 {#networking}

<ListenHost />

日志在 `<logger>` 块中定义。此示例配置提供了一个调试日志,当日志文件达到 1000M 时将滚动,最多保留三个文件:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

有关日志配置的更多信息,请参阅 ClickHouse 默认[配置文件](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml)中的注释说明。

#### 集群配置 {#cluster-configuration}

集群配置在 `<remote_servers>` 块中设置。
此处定义了集群名称 `cluster_2S_1R`。


`<cluster_2S_1R></cluster_2S_1R>` 块定义了集群的布局,
使用 `<shard></shard>` 和 `<replica></replica>` 设置,并作为
分布式 DDL 查询的模板,这些查询通过 `ON CLUSTER` 子句在整个
集群中执行。默认情况下,分布式 DDL 查询
是允许的,但也可以通过设置 `allow_distributed_ddl_queries` 来关闭。

`internal_replication` 默认保持为 false,因为每个分片只有一个副本。

```xml
<remote_servers>
    <cluster_2S_1R>
        <shard>
            <replica>
                <host>clickhouse-01</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>clickhouse-02</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
</remote_servers>
```

<ServerParameterTable />

#### Keeper 配置 {#keeper-config-explanation}

`<ZooKeeper>` 部分告诉 ClickHouse 在哪里运行 ClickHouse Keeper(或 ZooKeeper)。
由于我们使用的是 ClickHouse Keeper 集群,需要指定集群的每个 `<node>`,
并分别使用 `<host>` 和 `<port>` 标签指定其主机名和端口号。

ClickHouse Keeper 的设置将在教程的下一步中说明。

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
但在生产环境中,我们强烈建议 ClickHouse Keeper 在专用主机上运行。
:::

#### 宏配置 {#macros-config-explanation}

此外,`<macros>` 部分用于定义复制表的参数替换。
这些参数列在 `system.macros` 中,允许在查询中使用
`{shard}` 和 `{replica}` 等替换。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
这些将根据集群的布局进行唯一定义。
:::

### 用户配置 {#user-config}

现在修改位于
`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` 的每个空配置文件 `users.xml`,内容如下:

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


| 目录                                                       | 文件                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

在本示例中，为了简化配置，默认用户未设置密码。
在实际环境中，不建议这样做。

:::note
在本示例中，集群中所有节点上的 `users.xml` 文件内容完全相同。
:::



## 配置 ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Keeper 配置 {#configuration-explanation}

<KeeperConfig />

| 目录                                               | 文件                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## 测试设置 {#test-the-setup}

确保 Docker 在您的机器上运行。
从 `cluster_2S_1R` 目录的根目录使用 `docker-compose up` 命令启动集群:

```bash
docker-compose up -d
```

您应该会看到 Docker 开始拉取 ClickHouse 和 Keeper 镜像,
然后启动容器:

```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

要验证集群是否正在运行,请连接到 `clickhouse-01` 或 `clickhouse-02` 并运行以下查询。连接到第一个节点的命令如下所示:


```bash
# 连接到任意节点
docker exec -it clickhouse-01 clickhouse-client
```

如果成功，您将看到 ClickHouse 客户端提示符：

```response
cluster_2S_1R node 1 :)
```

运行以下查询，检查每个主机上定义的集群拓扑：

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
1. │ cluster_2S_1R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_1R │         2 │           1 │ clickhouse-02 │ 9000 │
3. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

运行以下查询以检查 ClickHouse Keeper 集群状态：

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ task_queue │       │ /clickhouse │
2. │ sessions   │       │ /clickhouse │
3. │ clickhouse │       │ /           │
4. │ keeper     │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus />

至此，您已经成功搭建了一个由单个分片和两个副本组成的 ClickHouse 集群。
下一步，您将在该集群中创建一张表。


## 创建数据库 {#creating-a-database}

现在您已验证集群配置正确且正在运行,接下来将重新创建与 [英国房产价格](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中相同的表。该数据集包含自 1995 年以来英格兰和威尔士房地产交易价格的约 3000 万行记录。

在不同的终端标签页或窗口中分别运行以下命令,连接到各主机的客户端:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

您可以在各主机的 clickhouse-client 中运行以下查询,确认除默认数据库外尚未创建其他数据库:

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
ON CLUSTER cluster_2S_1R;
```

您可以再次在各主机的客户端中运行相同的查询,确认虽然仅在 `clickhouse-01` 上执行了查询,但数据库已在整个集群中创建:

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

现在数据库已经创建完成,接下来将创建一个表。
从任意主机客户端运行以下查询:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_2S_1R
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
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

请注意,该查询与 [UK property prices](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中原始 `CREATE` 语句使用的查询相同,
只是增加了 `ON CLUSTER` 子句。

`ON CLUSTER` 子句用于分布式执行 DDL(数据定义语言)
查询,例如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`,确保这些
模式变更应用于集群中的所有节点。

您可以从每个主机的客户端运行以下查询,以确认该表已在整个集群中创建:

```sql title="查询"
SHOW TABLES IN uk;
```

```response title="响应"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

在插入 UK price paid 数据之前,让我们进行一个快速实验,看看
从任一主机向普通表插入数据时会发生什么。

从任一主机使用以下查询创建测试数据库和表:

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_2S_1R;
CREATE TABLE test.test_table ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `name` String
)
ENGINE = MergeTree()
ORDER BY id;
```

现在从 `clickhouse-01` 运行以下 `INSERT` 查询:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

切换到 `clickhouse-02` 并运行以下 `INSERT` 查询:

```sql title="查询"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

现在从 `clickhouse-01` 或 `clickhouse-02` 运行以下查询:

```sql
-- from clickhouse-01
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Clicky McClickface │
--   └────┴────────────────────┘

--from clickhouse-02
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Alexey Milovidov   │
--   └────┴────────────────────┘
```

您会注意到,与 `ReplicatedMergeTree` 表不同,只会返回插入到该
特定主机上表中的行,而不会同时返回两行。

要跨两个分片读取数据,我们需要一个能够处理
所有分片查询的接口,在运行 select 查询时合并来自两个分片的数据,
或在运行 insert 查询时将数据插入到两个分片。

在 ClickHouse 中,这个接口称为**分布式表**,我们使用
[`Distributed`](/engines/table-engines/special/distributed) 表引擎来创建它。让我们看看它是如何工作的。


## 创建分布式表 {#create-distributed-table}

使用以下查询创建分布式表:

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

在此示例中,选择 `rand()` 函数作为分片键,使插入的数据随机分布到各个分片。

现在从任一主机查询分布式表,您将获得在两个主机上插入的所有行,与之前的示例不同:

```sql
SELECT * FROM test.test_table_dist;
```

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

对英国房产价格数据执行相同的操作。从任一主机客户端运行以下查询,使用之前通过 `ON CLUSTER` 创建的现有表来创建分布式表:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```


## 向分布式表插入数据 {#inserting-data-into-distributed-table}

现在连接到任意一台主机并插入数据:

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

数据插入完成后,可以使用分布式表检查行数:

```sql title="查询"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="响应"
   ┌──count()─┐
1. │ 30212555 │ -- 3021万
   └──────────┘
```

如果在任意一台主机上运行以下查询,将看到数据已基本均匀地分布在各个分片上(请注意,插入到哪个分片的选择是通过 `rand()` 设置的,因此您的结果可能会有所不同):

```sql
-- 来自 clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15107353 │ -- 1511万
--    └──────────┘

-- 来自 clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15105202 │ -- 1511万
--    └──────────┘
```

如果其中一台主机发生故障会怎样?让我们通过关闭 `clickhouse-01` 来模拟这种情况:

```bash
docker stop clickhouse-01
```

运行以下命令检查主机是否已关闭:

```bash
docker-compose ps
```

```response title="响应"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X minutes ago    Up X minutes    127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X minutes ago    Up X minutes    127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X minutes ago    Up X minutes    127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X minutes ago    Up X minutes    127.0.0.1:9183->9181/tcp
```

现在从 `clickhouse-02` 运行我们之前在分布式表上执行的相同查询:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="响应"
Received exception from server (version 25.5.2):
Code: 279. DB::Exception: Received from localhost:9000. DB::Exception: All connection tries failed. Log:

```


代码: 32. DB::Exception: 尝试在文件结束符之后读取。 (ATTEMPT&#95;TO&#95;READ&#95;AFTER&#95;EOF) (版本 25.5.2.47 (official build))
代码: 209. DB::NetException: 超时：连接到 192.168.7.1:9000 超时 (clickhouse-01:9000, 192.168.7.1, 本地地址: 192.168.7.2:37484, 连接超时时间 1000 ms)。 (SOCKET&#95;TIMEOUT) (版本 25.5.2.47 (official build))
#highlight-next-line
代码: 198. DB::NetException: 找不到主机地址: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, 本地地址: 192.168.7.2:37484)。 (DNS&#95;ERROR) (版本 25.5.2.47 (official build))

：在执行 Remote 时。 (ALL&#95;CONNECTION&#95;TRIES&#95;FAILED)

```

不幸的是,我们的集群不具备容错能力。如果其中一台主机发生故障,
集群将被视为不健康状态,查询将会失败。这与我们在[上一个示例](/architecture/replication)中看到的复制表不同——
即使其中一台主机发生故障,我们仍然能够向复制表插入数据。

</VerticalStepper>
```


## 总结 {#conclusion}

这种集群拓扑的优势在于数据分布在不同的主机上，每个节点使用一半的存储空间。更重要的是，查询会在两个分片上并行处理，这在内存利用率方面更高效，并减少了每个主机的 I/O 开销。

当然，这种集群拓扑的主要缺点是，一旦丢失其中一个主机，我们将无法提供查询服务。

在[下一个示例](/architecture/cluster-deployment)中，我们将介绍如何设置一个具有两个分片和两个副本的集群，以同时提供可扩展性和容错能力。
