---
slug: /architecture/horizontal-scaling
sidebar_label: 'Scaling'
sidebar_position: 10
title: 'Scaling'
description: 'Page describing an example architecture designed to provide scalability'
doc_type: 'how-to'
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

> In this example, you'll learn how to set up a simple ClickHouse cluster which
scales. There are five servers configured. Two are used to shard the data. 
The other three servers are used for coordination.

The architecture of the cluster you will be setting up is shown below:

<Image img={ShardingArchitecture} size='md' alt='Architecture diagram for 2 shards and 1 replica' />

<DedicatedKeeperServers/>

## Prerequisites {#pre-requisites}

- You've set up a [local ClickHouse server](/install) before
- You are familiar with basic configuration concepts of ClickHouse such as [configuration files](/operations/configuration-files)
- You have docker installed on your machine

<VerticalStepper level="h2">

## Set up directory structure and test environment {#set-up}

<ExampleFiles/>

In this tutorial, you will use [Docker compose](https://docs.docker.com/compose/) to
set up the ClickHouse cluster. This setup could be modified to work
for separate local machines, virtual machines or cloud instances as well.

Run the following commands to set up the directory structure for this example:

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

Add the following `docker-compose.yml` file to the `clickhouse-cluster` directory:

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

Create the following sub-directories and files:

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## Configure ClickHouse nodes {#configure-clickhouse-servers}

### Server setup {#server-setup}

Now modify each empty configuration file `config.xml` located at
`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. The lines which are
highlighted below need to be changed to be specific to each node:

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

| Directory                                                 | File                                                                                                                                                                              |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |

Each section of the above configuration file is explained in more detail below.

#### Networking and logging {#networking}

<ListenHost/>

Logging is defined in the `<logger>` block. This example configuration gives
you a debug log that will roll over at 1000M three times:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

For more information on logging configuration, see the comments included in the
default ClickHouse [configuration file](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

#### Cluster configuration {#cluster-configuration}

Configuration for the cluster is set up in the `<remote_servers>` block.
Here the cluster name `cluster_2S_1R` is defined.

The `<cluster_2S_1R></cluster_2S_1R>` block defines the layout of the cluster,
using the `<shard></shard>` and `<replica></replica>` settings, and acts as a
template for distributed DDL queries, which are queries that execute across the
cluster using the `ON CLUSTER` clause. By default, distributed DDL queries
are allowed, but can also be turned off with setting `allow_distributed_ddl_queries`.

`internal_replication` is set to true so that data is written to just one of the replicas.

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

#### Keeper configuration {#keeper-config-explanation}

The `<ZooKeeper>` section tells ClickHouse where ClickHouse Keeper (or ZooKeeper) is running.
As we are using a ClickHouse Keeper cluster, each `<node>` of the cluster needs to be specified,
along with its hostname and port number using the `<host>` and `<port>` tags respectively.

Set up of ClickHouse Keeper is explained in the next step of the tutorial.

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
Although it is possible to run ClickHouse Keeper on the same server as ClickHouse Server,
in production environments we strongly recommend that ClickHouse Keeper runs on dedicated hosts.
:::

#### Macros configuration {#macros-config-explanation}

Additionally, the `<macros>` section is used to define parameter substitutions for
replicated tables. These are listed in `system.macros` and allow using substitutions
like `{shard}` and `{replica}` in queries.

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
These will be defined uniquely depending on the layout of the cluster.
:::

### User configuration {#user-config}

Now modify each empty configuration file `users.xml` located at
`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` with the following:

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
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

In this example, the default user is configured without a password for simplicity.
In practice, this is discouraged.

:::note
In this example, each `users.xml` file is identical for all nodes in the cluster.
:::

## Configure ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Keeper setup {#configuration-explanation}

<KeeperConfig/>

| Directory                                                        | File                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## Test the setup {#test-the-setup}

Make sure that docker is running on your machine.
Start the cluster using the `docker-compose up` command from the root of the `cluster_2S_1R` directory:

```bash
docker-compose up -d
```

You should see docker begin to pull the ClickHouse and Keeper images,
and then start the containers:

```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

To verify that the cluster is running, connect to either `clickhouse-01` or `clickhouse-02` and run the
following query. The command to connect to the first node is shown:

```bash
# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

If successful, you will see the ClickHouse client prompt:

```response
cluster_2S_1R node 1 :)
```

Run the following query to check what cluster topologies are defined for which
hosts:

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

Run the following query to check the status of the ClickHouse Keeper cluster:

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

With this, you have successfully set up a ClickHouse cluster with a single shard and two replicas.
In the next step, you will create a table in the cluster.

## Create a database {#creating-a-database}

Now that you have verified the cluster is correctly setup and is running, you
will be recreating the same table as the one used in the [UK property prices](/getting-started/example-datasets/uk-price-paid)
example dataset tutorial. It consists of around 30 million rows of prices paid
for real-estate property in England and Wales since 1995.

Connect to the client of each host by running each of the following commands from separate terminal
tabs or windows:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

You can run the query below from clickhouse-client of each host to confirm that
there are no databases created yet, apart from the default ones:

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

From the `clickhouse-01` client run the following **distributed** DDL query using the
`ON CLUSTER` clause to create a new database called `uk`:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_1R;
```

You can again run the same query as before from the client of each host
to confirm that the database has been created across the cluster despite running
the query only `clickhouse-01`:

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

## Create a table on the cluster {#creating-a-table}

Now that the database has been created, you will create a distributed table.
Distributed tables are tables which have access to shards located on different
hosts and are defined using the `Distributed` table engine. The distributed table
acts as the interface across all the shards in the cluster.

Run the following query from any of the host clients:

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

Notice that it is identical to the query used in the original `CREATE` statement of the
[UK property prices](/getting-started/example-datasets/uk-price-paid) example dataset tutorial,
except for the `ON CLUSTER` clause.

The `ON CLUSTER` clause is designed for distributed execution of DDL (Data Definition Language)
queries such as `CREATE`, `DROP`, `ALTER`, and `RENAME`, ensuring that these
schema changes are applied across all nodes in a cluster.

You can run the query below from each host's client to confirm that the table has been created across the cluster:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## Insert data into a distributed table {#inserting-data}

Before we insert the UK price paid data, let's perform a quick experiment to see
what happens when we insert data into an ordinary table from either host.

Create a test database and table with the following query from either host:

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

Now from `clickhouse-01` run the following `INSERT` query:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

Switch over to `clickhouse-02` and run the following `INSERT` query:

```sql title="Query"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

Now from `clickhouse-01` or `clickhouse-02` run the following query:

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

You will notice that only the row that was inserted into the table on that
particular host is returned and not both rows.

To read the data from the two shards we need an interface which can handle queries
across all the shards, combining the data from both shards when we run select queries
on it, and handling the insertion of data to the separate shards when we run insert queries.

In ClickHouse this interface is called a distributed table, which we create using
the [`Distributed`](/engines/table-engines/special/distributed) table engine. Let's take a look at how it works.

Create a distributed table with the following query:

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

In this example, the `rand()` function is chosen as the sharding key so that
inserts are randomly distributed across the shards.

Now query the distributed table from either host and you will get back
both of the rows which were inserted on the two hosts:

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

Let's do the same for our UK property prices data. From any of the host clients, 
run the following query to create a distributed table using the existing table
we created previously with `ON CLUSTER`:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```

Now connect to either of the hosts and insert the data:

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

Once the data is inserted, you can check the number of rows using the distributed
table:

```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

If you run the following query on either host you will see that the data has been
more or less evenly distributed across the shards (keeping in mind the choice of which
shard to insert into was set with `rand()` so results may differ for you):

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

What will happen if one of the hosts fails? Let's simulate this by shutting down
`clickhouse-01`:

```bash
docker stop clickhouse-01
```

Check that the host is down by running:

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

Now from `clickhouse-02` run the same select query we ran before on the distributed
table:

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

Unfortunately, our cluster is not fault-tolerant. If one of the hosts fails, the
cluster is considered unhealthy and the query fails compared to the replicated
table we saw in the [previous example](/architecture/replication) for which
we were able to insert data even when one of the hosts failed.

</VerticalStepper>

## Conclusion {#conclusion}

The advantage of this cluster topology is that data gets distributed across
separate hosts and uses half the storage per node. More importantly, queries
are processed across both shards, which is more efficient in terms of memory
utilization and reduces I/O per host.

The main disadvantage of this cluster topology is, of course, that losing one of 
the hosts renders us unable to serve queries.

In the [next example](/architecture/cluster-deployment), we'll look at how to 
set up a cluster with two shards and two replicas offering both scalability and
fault tolerance.
