---
slug: /architecture/cluster-deployment
sidebar_label: 'Cluster Deployment'
sidebar_position: 100
title: 'Cluster Deployment'
description: 'By going through this tutorial, you will learn how to set up a simple ClickHouse cluster.'
---

> In this tutorial, you'll learn how to set up a simple ClickHouse cluster
consisting of two shards and two replicas with a 3-node ClickHouse Keeper cluster
for managing coordination and keeping quorum in the cluster.

## Prerequisites {#prerequisites}

- You've already set up a [local ClickHouse server](../getting-started/install/install.mdx)
- You are familiar with basic configuration concepts of ClickHouse such as [configuration files](/operations/configuration-files)
- You have docker installed on your machine

The architecture of the cluster we will be setting up is shown below:


<VerticalStepper level="h2">

## Set up directory structure and test environment {#set-up}

In this tutorial, you will use [Docker compose](https://docs.docker.com/compose/) to
set up the ClickHouse cluster for simplicity. This setup could be modified to work
for separate local machines, virtual machines or cloud instances as well.

Run the following commands to set up the directory structure for the cluster:

```bash
mkdir clickhouse-cluster
cd clickhouse-cluster

# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done

# Create clickhouse-server directories
for i in {01..04}; do
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

Create the following sub-directories and files:

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

- The `config.d` directory contains ClickHouse server configuration file `config.xml`, 
in which custom configuration for each ClickHouse node is defined. This 
configuration gets combined with the default `config.xml` ClickHouse configuration
file that comes with every ClickHouse installation.
- The `users.d` directory contains user configuration file `users.xml`, in which
custom configuration for users is defined. This configuration gets combined with
the default ClickHouse `users.xml` configuration file that comes with every 
ClickHouse installation.

<br/>

:::tip Custom configuration directories
It is a best practice to make use of the `config.d` and `users.d` directories when
writing your own configuration, rather than directly modifying the default configuration
in `/etc/clickhouse-server/config.xml` and `etc/clickhouse-server/users.xml`.

The line 

```xml
<clickhouse replace="true">
```

Ensures that the configuration sections defined in the `config.d` and `users.d` 
directories override the default configuration sections defined in the default
`config.xml` and `users.xml` files.
:::

## Configure ClickHouse nodes {#configure-clickhouse-servers}

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
    <macros>
        <shard>01</shard>
        <replica>01</replica>
    </macros>
</clickhouse>
```

| Directory                                                 | File                                                                                                                                                                              |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml)  |
 
### Configuration explanation {#configuration-explanation-clickhouse}

External communication to the network interface is enabled by activating the listen
host setting. This ensures that the ClickHouse server host is reachable by other
hosts.

```xml
<listen_host>0.0.0.0</listen_host>
```

Note that each node in the cluster gets the same cluster configuration defined by the
`<remote_servers></remote_servers>` section:

```xml
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
```

The `<cluster_2S_2R></cluster_2S_2R>` section defines the layout of the cluster,
and acts as a template for distributed DDL queries, which are queries that execute
across the cluster using the `ON CLUSTER` clause. 

The `<ZooKeeper>` section tells ClickHouse where ClickHouse Keeper (or ZooKeeper) is running.
As we are using a ClickHouse Keeper cluster, each `<node>` of the cluster needs to be specified, 
along with it's hostname and port number using the `<host>` and `<port>` tags respectively.

Set-up of ClickHouse Keeper is explained in the next step of the tutorial.

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

Additionally, the `<macros>` section is used to define parameter substitutions for
replicated tables. These are listed in `system.macros` and allow using substitutions
like `{shard}` and `{replica}` in queries. 

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

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

:::note
Each `users.xml` file is identical for all nodes in the cluster.
:::

## Configure ClickHouse Keeper nodes {#configure-clickhouse-keeper-nodes}

In order for replication to work, a ClickHouse keeper cluster needs to be set up and
configured. ClickHouse Keeper provides the coordination system for data replication,
acting as a stand in replacement for Zookeeper, which could also be used. 
ClickHouse Keeper is however recommended, as it provides better guarantees and 
reliability and uses fewer resources than ZooKeeper. For high availability and in
order to keep quorum it is recommended to run at least 3 ClickHouse Keeper nodes.

:::note
ClickHouse Keeper can run on any node of the cluster alongside ClickHouse, although
it is recommended to have it run on a dedicated node which allows to scale and 
manage the ClickHouse Keeper cluster independently from the database cluster.
:::

Create the `keeper_config.xml` files for each ClickHouse Keeper node
using the following command:

```bash
for i in {01..03}; do
  touch fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper/keeper_config.xml
done
```

Modify these empty configuration files called `keeper_config.xml` in each
node directory `fs/volumes/clickhouse-keeper-{}/etc/clickhouse-keeper`. The 
highlighted lines below need to be changed to be specific to each node:

```xml title="/config.d/config.xml"
<clickhouse replace="true">
    <logger>
        <level>information</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!--highlight-next-line-->
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>information</raft_logs_level>
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
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### Configuration explanation {#configuration-explanation}

Each configuration file will contain the following unique configuration (shown below).
The `server_id` used should be unique for that particular ClickHouse Keeper node 
in the cluster and match the server `<id>` defined in the `<raft_configuration>` section.
`tcp_port` is the port used by _clients_ of ClickHouse Keeper.

```xml
<tcp_port>9181</tcp_port>
<server_id>{id}</server_id>
```

The following section is used to configure the servers that participate in the 
quorum for the [raft consensus algorithm](https://en.wikipedia.org/wiki/Raft_(algorithm)):

```xml
<raft_configuration>
    <server>
        <id>1</id>
        <hostname>clickhouse-keeper-01</hostname>
        <!-- TCP port used for communication between ClickHouse Keeper nodes -->
        <!--highlight-next-line-->
        <port>9234</port>
    </server>
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
```

## Test the setup {#test-the-setup}

Make sure that docker is running on your machine.
Start the cluster using the `docker-compose up` command from the `clickhouse-cluster` directory:

```bash
docker-compose up -d
```

You should see docker begin to pull the ClickHouse and Zookeeper images, 
and then start the containers:

```bash
[+] Running 8/8
 ✔ Network clickhouse-cluster_default  Created
 ✔ Container clickhouse-keeper-03      Started
 ✔ Container clickhouse-keeper-02      Started
 ✔ Container clickhouse-keeper-01      Started
 ✔ Container clickhouse-01             Started
 ✔ Container clickhouse-02             Started
 ✔ Container clickhouse-04             Started
 ✔ Container clickhouse-03             Started
```

To verify that the cluster is running, connect to any one of the nodes and run the 
following query. 
For the sake of this example, the command to connect to the 
first node is shown:

```bash
# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

If successful, you will see the ClickHouse client prompt:

```response
cluster_2S_2R node 1 :)
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
1. │ cluster_2S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_2R │         1 │           2 │ clickhouse-03 │ 9000 │
3. │ cluster_2S_2R │         2 │           1 │ clickhouse-02 │ 9000 │
4. │ cluster_2S_2R │         2 │           2 │ clickhouse-04 │ 9000 │
5. │ default       │         1 │           1 │ localhost     │ 9000 │
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
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

With this you have successfully set up a ClickHouse cluster with two shards and two replicas.
In the next step we will create a table in the cluster.

## Creating a distributed database {#creating-a-table}

In this tutorial, you will be recreating the same table as the one used in the
[UK property prices](/getting-started/example-datasets/uk-price-paid) example dataset tutorial.
It consists of around 30 million rows of prices paid for real-estate property in England and Wales
since 1995. 

Start each client of each host, by running each of the following commands from separate terminal
tabs or windows:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

You can run the query below from clickhouse-client of each host to confirm that there are no databases created yet,
apart from the default ones:

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

From the `clickhouse-01` client run the following **distributed** DDL query using the `ON CLUSTER` clause to create a
database:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

You can again run the same query as before from the client of each host 
to confirm that the database has been created across the cluster despite running
the query only from `clickhouse-01`:

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

## Creating local tables on the cluster {#creating-a-table}

Now that the database has been created, create a distributed table in the cluster.
Run the following query from any of the host clients:

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

Notice that it is identical to the query used in the original `CREATE` statement of the
[UK property prices](/getting-started/example-datasets/uk-price-paid) example dataset tutorial,
except for the `ON CLUSTER` clause and the `ReplicatedMergeTree` engine.

The `ON CLUSTER` clause is designed for distributed execution of DDL (Data Definition Language)
queries such as `CREATE`, `DROP`, `ALTER`, and `RENAME`, ensuring that these 
schema changes are applied across all nodes in a cluster.

The [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
engine works just as the ordinary `MergeTree` table engine, but it will also replicate the data. It requires two parameters to be specified:

- `zoo_path`: The Keeper/ZooKeeper path to the table's metadata.
- `replica_name`: The table's replica name.

<br/>

The `zoo_path` parameter can be set to anything you choose, although it is recommended to follow 
the convention of using prefix

```
/clickhouse/tables/{shard}/{database}/{table}
```

where:
- `{database}` and `{table}` will be replaced automatically. 
- `{shard}` and `{replica}` are macros which were [defined](#configuration-explanation-clickhouse) 
   previously in the `config.xml` file of each ClickHouse node.

You can run the query below from each host's client to confirm that the table has been created across the cluster:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name──────────┐
1. │ uk_price_paid │
   └───────────────┘
```

## Insert data using a distributed table {#inserting-data-using-distributed}

To insert data into the distributed table, `ON CLUSTER` cannot be used as it does
not apply to DML (Data Manipulation Language) queries such as `INSERT`, `UPDATE`,
and `DELETE`. In order to insert data, it is necessary to make use of the 
[`Distributed`](/engines/table-engines/special/distributed) table engine.

From any of the host clients, run the following query to create a distributed table
using the existing table we created previously with `ON CLUSTER` and 
`ReplicatedMergeTree`:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

On each host you will now see the following tables in the `uk` database:

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

Data can be inserted into the `uk_price_paid_distributed` table from any of the
host clients using the following query:

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

Run the following query to confirm that the data inserted has been evenly distributed
across the nodes of our cluster:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
LIMIT 10;

SELECT count(*) FROM uk.uk_price_paid_local LIMIT 10;
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