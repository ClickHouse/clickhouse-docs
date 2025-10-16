---
'slug': '/architecture/horizontal-scaling'
'sidebar_label': '扩展性'
'sidebar_position': 10
'title': '扩展性'
'description': '页面描述一个旨在提供可扩展性的示例架构'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
import ConfigFileNote from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/zh/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> 在这个示例中，您将学习如何设置一个简单的 ClickHouse 集群以进行扩展。配置了五台服务器。其中两台用于对数据进行分片，另外三台服务器用于协调。

您将要设置的集群的架构如下所示：

<Image img={ShardingArchitecture} size='md' alt='2个分片和1个副本的架构图' />

<DedicatedKeeperServers/>

## 前提条件 {#pre-requisites}

- 您之前已经设置了一个 [本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基本配置概念，例如 [配置文件](/operations/configuration-files)
- 您的机器上已安装 docker

<VerticalStepper level="h2">

## 设置目录结构和测试环境 {#set-up}

<ExampleFiles/>

在本教程中，您将使用 [Docker compose](https://docs.docker.com/compose/) 来设置 ClickHouse 集群。此设置也可以修改为适用于单独的本地机器、虚拟机或云实例。

运行以下命令以设置此示例的目录结构：

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R


# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Create clickhouse-server directories
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

将以下 `docker-compose.yml` 文件添加到 `clickhouse-cluster` 目录：

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
```

创建以下子目录和文件：

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## 配置 ClickHouse 节点 {#configure-clickhouse-servers}

### 服务器设置 {#server-setup}

现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 的每个空配置文件 `config.xml`。下面突出显示的行需要更改为特定于每个节点的内容：

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
    <display_name>cluster_2S_1R node 1</display_name>
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

| 目录                                                         | 文件                                                                                                                                                                              |
|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d`   | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d`   | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |

上面配置文件的每个部分将在下面详细解释。

#### 网络和日志 {#networking}

<ListenHost/>

日志在 `<logger>` 块中定义。此示例配置为您提供一个调试日志，该日志将在 1000M 处翻转三次：

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

有关日志配置的更多信息，请参阅默认 ClickHouse [配置文件](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) 中包含的注释。

#### 集群配置 {#cluster-configuration}

集群的配置在 `<remote_servers>` 块中设置。这里定义了集群名称 `cluster_2S_1R`。

`<cluster_2S_1R></cluster_2S_1R>` 块定义了集群的布局，使用 `<shard></shard>` 和 `<replica></replica>` 设置，并充当分布式 DDL 查询的模板，分布式 DDL 查询是指在集群中执行的查询，使用 `ON CLUSTER` 子句。默认情况下，允许分布式 DDL 查询，但可通过设置 `allow_distributed_ddl_queries` 关闭。

`internal_replication` 设置为 true，以便数据仅写入一个副本。

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

<ServerParameterTable/>

#### Keeper 配置 {#keeper-config-explanation}

`<ZooKeeper>` 部分告知 ClickHouse ClickHouse Keeper（或 ZooKeeper）在哪里运行。由于我们使用的是 ClickHouse Keeper 集群，因此每个集群的 `<node>` 需要指定其主机名和端口号，使用 `<host>` 和 `<port>` 标签分别指定。

ClickHouse Keeper 的设置将在本教程的下一步中解释。

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
尽管可以在与 ClickHouse Server 相同的服务器上运行 ClickHouse Keeper，但在生产环境中，我们强烈建议将 ClickHouse Keeper 运行在专用主机上。
:::

#### 宏配置 {#macros-config-explanation}

此外，`<macros>` 部分用于定义参数替换以用于复制表。这些列在 `system.macros` 中，并允许在查询中使用替换，如 `{shard}` 和 `{replica}`。

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
这些将在集群布局上唯一定义。
:::

### 用户配置 {#user-config}

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

| 目录                                                        | 文件                                                                                                                                                                             |
|-------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`   | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`   | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

在这个示例中，出于简便考虑，默认用户未配置密码。实际上，这不建议。

:::note
在这个示例中，每个 `users.xml` 文件在集群的所有节点上都是相同的。
:::

## 配置 ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Keeper 设置 {#configuration-explanation}

<KeeperConfig/>

| 目录                                                               | 文件                                                                                                                                                                                         |
|--------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d`   | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d`   | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d`   | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## 测试设置 {#test-the-setup}

确保您的机器上正在运行 docker。
使用 `docker-compose up` 命令从 `cluster_2S_1R` 目录的根目录启动集群：

```bash
docker-compose up -d
```

您应该会看到 docker 开始拉取 ClickHouse 和 Keeper 的镜像，然后启动容器：

```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

要验证集群是否正在运行，请连接到 `clickhouse-01` 或 `clickhouse-02`，并运行以下查询。连接到第一个节点的命令如下所示：

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

如果成功，您将看到 ClickHouse 客户端提示：

```response
cluster_2S_1R node 1 :)
```

运行以下查询以检查为哪些主机定义的集群拓扑：

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
3. │ clickhouse │       │ /           │
4. │ keeper     │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus/>

这样，您就成功设置了一个单分片和两个副本的 ClickHouse 集群。在下一步中，您将创建一个集群中的表。

## 创建数据库 {#creating-a-database}

现在您已经验证了集群正确设置并正在运行，您将重新创建与 [英国房产价格](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中使用的表相同的表。它包含自 1995 年以来在英格兰和威尔士支付的大约 3000 万行房地产价格数据。

通过在单独的终端选项卡或窗口中运行以下命令，连接到每个主机的客户端：

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

您可以从每个主机的 clickhouse-client 运行以下查询，以确认除了默认数据库外，没有数据库被创建：

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

从 `clickhouse-01` 客户端运行以下 **分布式** DDL 查询，以使用 `ON CLUSTER` 子句创建名为 `uk` 的新数据库：

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_1R;
```

您可以再次从每个主机的客户端运行与之前相同的查询，以确认尽管只在 `clickhouse-01` 上运行该查询，数据库仍然已跨集群创建：

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

现在已创建数据库，您将创建一个分布式表。分布式表是可以访问位于不同主机上的分片的表，使用 `Distributed` 表引擎定义。分布式表充当集群中所有分片的接口。

从任何主机客户端运行以下查询：

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

请注意，它与 [英国房产价格](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中的原始 `CREATE` 语句中使用的查询相同，唯一不同的是 `ON CLUSTER` 子句。

`ON CLUSTER` 子句旨在用于 DDL（数据定义语言）查询的分布式执行，例如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`，确保这些模式更改应用于集群中的所有节点。

您可以从每个主机的客户端运行以下查询，以确认表已跨集群创建：

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## 向分布式表插入数据 {#inserting-data}

在插入英国房价数据之前，让我们快速进行实验，看看从任何主机向普通表插入数据时会发生什么。

从任何主机运行以下查询创建测试数据库和表：

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_2S_1R;
CREATE TABLE test.test_table ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `name` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id;
```

现在从 `clickhouse-01` 运行以下 `INSERT` 查询：

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

切换到 `clickhouse-02` 并运行以下 `INSERT` 查询：

```sql title="Query"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

现在从 `clickhouse-01` 或 `clickhouse-02` 运行以下查询：

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

您会注意到，仅返回插入到特定主机表中的行，而不是两个行。

要从两个分片读取数据，我们需要一个接口，该接口可以处理跨所有分片的查询，在我们对其运行选择查询时结合来自两个分片的数据，并在我们运行插入查询时处理向不同分片插入数据。

在 ClickHouse 中，该接口称为分布式表，我们使用 [`Distributed`](/engines/table-engines/special/distributed) 表引擎创建它。让我们看看它是如何工作的。

使用以下查询创建一个分布式表：

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

在这个示例中，选择 `rand()` 函数作为分片键，以便插入随机分布在各个分片上。

现在从任何主机查询分布式表，您将返回在两个主机上插入的两个行：

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

让我们为我们的英国房产价格数据做同样的事情。从任意主机客户端运行以下查询，使用之前创建的现有表创建分布式表，使用 `ON CLUSTER`：

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```

现在连接到任一主机并插入数据：

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

数据插入后，您可以使用分布式表检查行数：

```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

如果您在任一主机上运行以下查询，您将看到数据已在分片间大致均匀分配（请记住，插入的分片选择是通过 `rand()` 设置的，因此结果可能会有所不同）：

```sql
-- from clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15107353 │ -- 15.11 million
--    └──────────┘

--from clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15105202 │ -- 15.11 million
--    └──────────┘
```

如果其中一台主机出现故障会发生什么？让我们通过关闭 `clickhouse-01` 来模拟这一点：

```bash
docker stop clickhouse-01
```

通过运行以下查询检查主机是否关闭：

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

现在从 `clickhouse-02` 运行我们之前在分布式表上运行的相同选择查询：

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
Received exception from server (version 25.5.2):
Code: 279. DB::Exception: Received from localhost:9000. DB::Exception: All connection tries failed. Log:

Code: 32. DB::Exception: Attempt to read after eof. (ATTEMPT_TO_READ_AFTER_EOF) (version 25.5.2.47 (official build))
Code: 209. DB::NetException: Timeout: connect timed out: 192.168.7.1:9000 (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484, connection timeout 1000 ms). (SOCKET_TIMEOUT) (version 25.5.2.47 (official build))
#highlight-next-line
Code: 198. DB::NetException: Not found address of host: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484). (DNS_ERROR) (version 25.5.2.47 (official build))

: While executing Remote. (ALL_CONNECTION_TRIES_FAILED)
```

不幸的是，我们的集群不具备容错能力。如果其中一台主机出现故障，集群将被视为不健康，并且查询失败，相比之下，我们在 [先前示例](/architecture/replication) 中看到的复制表，我们能够在其中一台主机出现故障时插入数据。

</VerticalStepper>

## 结论 {#conclusion}

这种集群拓扑的优势在于数据分布在不同的主机上，并且每个节点消耗的存储量减半。更重要的是，查询跨两个分片处理，这在内存利用率方面更有效，并减少每个主机的 I/O。

这种集群拓扑的主要缺点是，当然，失去其中一台主机使我们无法提供查询服务。

在 [下一个示例](/architecture/cluster-deployment) 中，我们将看看如何设置一个具有两个分片和两个副本的集群，以提供可扩展性和故障容错能力。
