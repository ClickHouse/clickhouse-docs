---
slug: /architecture/replication
sidebar_label: '复制'
sidebar_position: 10
title: '数据复制'
description: '本页描述了一个由五台已配置服务器组成的示例架构。其中两台用于存储数据副本，其余服务器用于协调数据复制。'
doc_type: 'guide'
keywords: ['复制', '高可用性', '集群搭建', '数据冗余', '容错']
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

> 在本示例中，你将学习如何搭建一个用于数据复制的简单 ClickHouse 集群。
> 一共配置了五台服务器，其中两台用于存储数据副本，
> 另外三台服务器用于协调数据复制。

你将要搭建的集群架构如下图所示：

<Image img={ReplicationArchitecture} size="md" alt="基于 ReplicatedMergeTree、包含 1 个分片和 2 个副本的架构图" />

<DedicatedKeeperServers />


## 前置条件 {#pre-requisites}

- 您之前已设置过[本地 ClickHouse 服务器](/install)
- 您熟悉 ClickHouse 的基本配置概念，例如[配置文件](/operations/configuration-files)
- 您的机器上已安装 Docker

<VerticalStepper level="h2">
  ## 设置目录结构和测试环境

  <ExampleFiles />

  在本教程中,您将使用 [Docker compose](https://docs.docker.com/compose/) 来
  搭建 ClickHouse 集群。该配置同样可以修改后用于
  独立的本地机器、虚拟机或云实例。

  运行以下命令以设置本示例的目录结构:

  ```bash
  mkdir cluster_1S_2R
  cd cluster_1S_2R

  # 创建 clickhouse-keeper 目录
  for i in {01..03}; do
    mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
  done

  # 创建 clickhouse-server 目录
  for i in {01..02}; do
    mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
  done
  ```

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

  <ConfigExplanation />

  ## 配置 ClickHouse 节点

  ### 服务器配置

  现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d` 的每个空配置文件 `config.xml`。下面高亮显示的行需要根据每个节点的具体情况进行修改:

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
      <display_name>cluster_1S_2R node 1</display_name>
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

  | 目录                                                        | 文件                                                                                                                                                                               |
  | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

  下文将详细说明上述配置文件的各个部分。

  #### 网络和日志记录

  <ListenHost />

  日志记录在 `<logger>` 块中定义。此示例配置提供一个调试日志，该日志将在达到 1000M 时滚动三次：

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

  #### 集群配置

  集群配置在 `<remote_servers>` 块中设置。
  这里定义了集群名称 `cluster_1S_2R`。

  `<cluster_1S_2R></cluster_1S_2R>` 块定义了集群的布局，
  使用 `<shard></shard>` 和 `<replica></replica>` 设置，并作为
  分布式 DDL 查询的模板。分布式 DDL 查询通过 `ON CLUSTER` 子句在整个
  集群中执行。默认情况下，分布式 DDL 查询
  处于启用状态，但也可以通过设置 `allow_distributed_ddl_queries` 来禁用。

  `internal_replication` 设置为 true,使数据仅写入一个副本。

  ```xml
  <remote_servers>
      <!-- 集群名称(不应包含点) -->
      <cluster_1S_2R>
          <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
          <shard>
              <!-- 可选。是否仅向一个副本写入数据。默认值:false(向所有副本写入数据)。 -->
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

  `<ZooKeeper>` 部分用于指定 ClickHouse Keeper(或 ZooKeeper)的运行位置。
  由于使用的是 ClickHouse Keeper 集群,需要指定集群中的每个 `<node>`,
  并分别通过 `<host>` 和 `<port>` 标签指定其主机名和端口号。

  ClickHouse Keeper 的设置将在教程的下一步骤中进行说明。

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
  尽管可以在与 ClickHouse Server 相同的服务器上运行 ClickHouse Keeper,但在生产环境中,我们强烈建议将 ClickHouse Keeper 部署在专用主机上。
  :::

  #### 宏配置

  此外，`<macros>` 配置段用于定义复制表的参数替换。这些宏参数列在 `system.macros` 表中，允许在查询中使用 `{shard}` 和 `{replica}` 等替换变量。

  ```xml
  <macros>
      <shard>01</shard>
      <replica>01</replica>
      <cluster>cluster_1S_2R</cluster>
  </macros>
  ```

  :::note
  这些配置需要根据集群的实际布局进行相应定义。
  :::

  ### 用户配置

  现在修改位于 `fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` 路径下的每个空配置文件 `users.xml`,添加以下内容:

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

  | 目录                                                       | 文件                                                                                                                                                                            |
  | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d` | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml) |
  | `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d` | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml) |

  在此示例中,为简化配置,默认用户未设置密码。
  在生产环境中,不建议采用此配置。

  :::note
  在此示例中,集群中所有节点的 `users.xml` 文件都相同。
  :::

  ## 配置 ClickHouse Keeper

  ### Keeper 配置

  <KeeperConfig />

  | 目录                                                      | 文件                                                                                                                                                                                           |
  | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
  | `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

  <KeeperConfigExplanation />

  <CloudTip />

  ## 测试部署配置

  确保 Docker 在您的机器上运行。
  在 `cluster_1S_2R` 目录的根目录下使用 `docker-compose up` 命令启动集群:

  ```bash
  docker-compose up -d
  ```

  您应该会看到 Docker 开始拉取 ClickHouse 和 Keeper 镜像,
  然后启动容器:

  ```bash
  [+] Running 6/6
   ✔ Network cluster_1s_2r_default   已创建
   ✔ Container clickhouse-keeper-03  已启动
   ✔ Container clickhouse-keeper-02  已启动
   ✔ Container clickhouse-keeper-01  已启动
   ✔ Container clickhouse-01         已启动
   ✔ Container clickhouse-02         已启动
  ```

  要验证集群是否正在运行,请连接到 `clickhouse-01` 或 `clickhouse-02` 并运行以下查询。连接到第一个节点的命令如下所示:

  ```bash
  # 连接到任意节点
  docker exec -it clickhouse-01 clickhouse-client
  ```

  如果成功，您将看到 ClickHouse 客户端提示符：

  ```response
  cluster_1S_2R node 1 :)
  ```

  运行以下查询以检查各主机定义的集群拓扑:

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

  运行以下查询以检查 ClickHouse Keeper 集群的状态：

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

  至此,您已成功部署了一个单分片双副本的 ClickHouse 集群。
  下一步,您将在该集群中创建表。

  ## 创建数据库

  现在您已验证集群已正确设置并正在运行,接下来将重新创建与 [UK property prices](/getting-started/example-datasets/uk-price-paid) 示例数据集教程中使用的相同表。该表包含自 1995 年以来英格兰和威尔士房地产交易价格的约 3000 万行数据。

  通过在不同的终端标签页或窗口中分别运行以下各命令,连接到每个主机的客户端:

  ```bash
  docker exec -it clickhouse-01 clickhouse-client
  docker exec -it clickhouse-02 clickhouse-client
  ```

  您可以在每个主机的 clickhouse-client 中运行以下查询，确认除默认数据库外尚未创建其他数据库：

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

  从 `clickhouse-01` 客户端执行以下**分布式** DDL 查询,使用 `ON CLUSTER` 子句创建名为 `uk` 的新数据库:

  ```sql
  CREATE DATABASE IF NOT EXISTS uk 
  -- highlight-next-line
  ON CLUSTER cluster_1S_2R;
  ```

  您可以再次从每个主机的客户端运行相同的查询，
  以确认数据库已在整个集群中创建，
  即使查询仅在 `clickhouse-01` 上执行：

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

  数据库创建完成后,在集群上创建表。
  从任意主机客户端执行以下查询:

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

  请注意,该查询与[英国房产价格](/getting-started/example-datasets/uk-price-paid)示例数据集教程中原始 `CREATE` 语句使用的查询完全相同,区别仅在于添加了 `ON CLUSTER` 子句并使用了 `ReplicatedMergeTree` 引擎。

  `ON CLUSTER` 子句用于分布式执行 DDL(数据定义语言)查询,例如 `CREATE`、`DROP`、`ALTER` 和 `RENAME`,以确保这些架构变更应用于集群中的所有节点。

  [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree) 引擎的工作方式与普通的 `MergeTree` 表引擎相同,但它还会对数据进行复制。

  您可以从 `clickhouse-01` 或 `clickhouse-02` 客户端运行以下查询，
  以确认该表已在集群中创建：

  ```sql title="Query"
  SHOW TABLES IN uk;
  ```

  ```response title="Response"
  ┌─name────────────────┐
  1. │ uk_price_paid.      │
     └─────────────────────┘
  ```

  ## 插入数据

  由于数据集较大,完全摄取需要几分钟时间,因此我们将首先仅插入一小部分数据。

  从 `clickhouse-01` 使用以下查询插入数据子集:

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

  请注意，数据在每个主机上都完全复制：

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

  为了演示当其中一台主机发生故障时的情况,请从任一主机创建一个简单的测试数据库和测试表:

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

  与 `uk_price_paid` 表类似,可以从任一主机插入数据:

  ```sql
  INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
  ```

  但如果其中一台主机宕机会发生什么？要模拟这种情况，请运行以下命令停止 `clickhouse-01`：

  ```bash
  docker stop clickhouse-01
  ```

  运行以下命令检查主机是否已停止运行:

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

  在 `clickhouse-01` 已停止运行后,向测试表插入另一行数据并查询该表:

  ```sql
  INSERT INTO test.test_table (id, name) VALUES (2, 'Alexey Milovidov');
  SELECT * FROM test.test_table;
  ```

  ```response title="Response"
  ┌─id─┬─name───────────────┐
  1. │  1 │ Clicky McClickface │
  2. │  2 │ Alexey Milovidov   │
     └────┴────────────────────┘
  ```

  现在使用以下命令重启 `clickhouse-01`(您可以在之后再次运行 `docker-compose ps` 来确认):

  ```sql
  docker start clickhouse-01
  ```

  运行 `docker exec -it clickhouse-01 clickhouse-client` 后,在 `clickhouse-01` 中再次查询测试表:

  ```sql title="Query"
  SELECT * FROM test.test_table
  ```

  ```response title="Response"
  ┌─id─┬─name───────────────┐
  1. │  1 │ Clicky McClickface │
  2. │  2 │ Alexey Milovidov   │
     └────┴────────────────────┘
  ```

  如果在此阶段您希望摄取完整的英国房产价格数据集进行试验,可以运行以下查询:

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

  从 `clickhouse-02` 或 `clickhouse-01` 查询表：

  ```sql title="Query"
  SELECT count(*) FROM uk.uk_price_paid_local;
  ```

  ```response title="Response"
  ┌──count()─┐
  1. │ 30212555 │ -- 3021.26万
     └──────────┘
  ```
</VerticalStepper>

## 总结 {#conclusion}

这种集群拓扑的优势在于，在存在两个副本的情况下，
数据同时存储在两台独立的主机上。如果其中一台主机发生故障，另一台副本
可以继续无损地提供数据服务，从而在存储层面上消除单点故障。

当一台主机宕机时，剩余的副本仍然能够：

- 不间断地处理读查询
- 接受新的写入（取决于你的一致性设置）
- 维持应用程序的服务可用性

当发生故障的主机重新上线时，它能够：

- 自动从正常副本同步缺失的数据
- 在无需人工干预的情况下恢复正常运行
- 快速恢复完整的冗余

在下一个示例中，我们将介绍如何设置一个包含两个分片但只有一个副本的集群。