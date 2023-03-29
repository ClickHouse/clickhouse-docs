---
slug: /en/architecture/horizontal-scaling
sidebar_label: Scaling out
sidebar_position: 10
title: Scaling out
---
import ReplicationShardingTerminology from '@site/docs/en/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/en/_snippets/_config-files.md';


## Description
This example architecture is designed to provide scalability.  It includes three nodes: two combined ClickHouse plus coordination (ClickHouse Keeper) servers, and a third server with only ClickHouse Keeper to finish the quorum of three. With this example, we'll create a database, table, and a distributed table that will be able to query the data on both of the nodes.

## Level: Basic

<ReplicationShardingTerminology />

## Environment
### Architecture Diagram
![Architecture diagram for 2 shards and 1 replica](@site/docs/en/deployment-guides/images/scaling-out-1.png)

|Node|Description|
|----|-----------|
|chnode1|Data + ClickHouse Keeper|
|chnode2|Data + ClickHouse Keeper|
|chnode3|Used for ClickHouse Keeper quorum|

:::note
In the more advanced configurations ClickHouse Keeper will be run on separate servers.  This basic configuration is running the Keeper functionality within the ClickHouse Server process.  As you scale out you may decide to separate the ClickHouse Servers from the Keeper servers.  The instructions for deploying ClickHouse Keeper standalone are available in the [installation documentation](/docs/en/getting-started/install.md/#install-standalone-clickhouse-keeper).
:::

## Install

Install Clickhouse on three servers following the [instructions for your archive type](/docs/en/getting-started/install.md/#available-installation-options) (.deb, .rpm, .tar.gz, etc.). For this example, you will follow the installation instructions for ClickHouse Server and Client on all three machines.       

## Editing configuration files

<ConfigFileNote />

## chnode1 configuration

For chnode1 there are five configuration files.  You may choose to combine these files into a single file, but for clarity in the documentation it may be simpler to look at them separately.  As you read through the configuration files you will see that most of the configuration is the same between chnode1 and chnode2; the differences will be highlighted.

### Network and logging configuration

These values can be customized as you wish.  This example configuration gives you a debug log that will roll over at 1000M three times.  ClickHouse will listen on the IPV4 network on ports 8123 and 9000, and will use port 9009 for interserver communication.

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

### ClickHouse Keeper configuration

ClickHouse Keeper provides the coordination system for data replication and distributed DDL queries execution. ClickHouse Keeper is compatible with Apache ZooKeeper.  This configuration enables ClickHouse Keeper on port 9181.  The highlighted line specifies that this instance of Keeper has server_id of 1.  This is the only difference in the `enable-keeper.xml` file across the three servers.  `chnode2` will have `server_id` set to `2`, and `chnode3` will have `server_id` set to `3`.  The raft configuration section is the same on all three servers, it is highlighted below to show you the raltionship between `server_id` and the `server` instance within the raft configuration.

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
            <port>9444</port>
        </server>
    # highlight-end
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### Macros configuration

The macros `shard` and `replica` reduce the complexity of distributed DDL.  The values configured are automatically substituted in your DDL queries, which simplifies your DDL.  The macros for this configuration specify the shard and replica number for each node.  
In this 2 shard 1 replica example, the replica macro is `replica_1` on both chnode1 and chnode2 as there is only one replica.  The shard macro is `1` on chnode1 and `2` on chnode2. 

```xml title="macros.xml on chnode1"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>
```

### Replication and sharding configuration

Starting from the top:
- The remote_servers section of the XML specifies each of the clusters in the environment. The attribute `replace=true` replaces the sample remote_servers in the default ClickHouse configuration with the remote_server configuration specified in this file.  Without this attribute the remote servers in this file would be appended to the list of samples in the default.  
- In this example, there is one cluster named `cluster_2S_1R`.
- A secret is created for the cluster named `cluster_2S_1R` with the value `mysecretphrase`.  The secret is shared across all of the remote servers in the environment to ensure that the correct servers are joined together.
- The cluster `cluster_2S_1R` has two shards, and each of those shards has one replica.  Take a look at the architecture diagram toward the beginning of this document, and compare it with the two `shard` definitions in the XML below.  In each of the shard definitions there is one replica.  The replica is for that specific shard.  The host and port for that replica is specified.  The replica for the first shard in the configuration is stored on `chnode1`, and the replica for the second shard in the configuration is stored on `chnode2`.
- Internal replication for the shards is set to true.  Each shard can have the internal_replication parameter defined in the config file. If this parameter is set to true, the write operation selects the first healthy replica and writes data to it.

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

### Configuring the use of Keeper

Up above a few files ClickHouse Keeper was configured.  This configuration file `use-keeper.xml` is configuring ClickHouse Server to use ClickHouse Keeper for the coordination of replication and distributed DDL.  This file specifies that ClickHouse Server should use Keeper on nodes chnode1 - 3 on port 9181, and the file is the same on `chnode1` and `chnode2`.  

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

## chnode2 configuration

As the configuration is very similar on chnode1 and chnode2 only the differences will be pointed out here.

### Network and logging configuration

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

### ClickHouse Keeper configuration

This file contains one of the two differences between chnode1 and chnode2.  In the Keeper configuration the `server_id` is set to `2`.

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
            <port>9444</port>
        </server>
        # highlight-start
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9444</port>
        </server>
        # highlight-end
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### Macros configuration

The macros configuration has one of the differences between chnode1 and chnode2.  `shard` is set to `2` on this node.

```xml title="macros.xml on chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

### Replication and sharding configuration

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

### Configuring the use of Keeper

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

## chnode3 configuration

As chnode3 is not storing data and is only used for ClickHouse Keeper to provide the third node in the quorum chnode3 has only two configuration files, one to configure the network and logging, and one to configure ClickHouse Keeper.

### Network and logging configuration

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

### ClickHouse Keeper configuration

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
            <port>9444</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9444</port>
        </server>
        # highlight-start
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9444</port>
        </server>
        # highlight-end
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

## Testing

1. Connect to `chnode1` and verify that the cluster `cluster_2S_1R` configured above exists
```sql
SHOW CLUSTERS
```
```response
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```

2. Create a database on the cluster
```sql
CREATE DATABASE db1 ON CLUSTER cluster_2S_1R
```
```response
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. Create a table with MergeTree table engine on the cluster.
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros
:::

```sql
CREATE TABLE db1.table1 ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
```
```response
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. Connect to `chnode1` and insert a row
```sql
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Connect to `chnode2` and insert a row

```sql
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

5. Connect to either node, `chnode1` or `chnode2` and you will see only the row that was inserted into that table on that node.
for example, on `chnode2`
```sql
SELECT * FROM db1.table1;
```
```response
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```


6. Create a distributed table to query both shards on both nodes.
(In this exmple, the `rand()` function is set as the sharding key so that it randomly distributes each insert)
```sql
CREATE TABLE db1.table1_dist ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand())
```
```response
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

7. Connect to either `chnode1` or `chnode2` and query the distributed table to see both rows.
```
SELECT * FROM db1.table1_dist;
```
```reponse
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

## More information about:

- The [Distributed Table Engine](/docs/en/engines/table-engines/special/distributed.md)
- [ClickHouse Keeper](/docs/en/guides/sre/keeper/index.md)

