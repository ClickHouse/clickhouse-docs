---
slug: /en/architecture/replication
sidebar_label: Replication for fault tolerance
sidebar_position: 10
title: Replication for fault tolerance
---
import ReplicationShardingTerminology from '@site/docs/en/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/en/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/en/_snippets/_keeper-config-files.md';


## Description
In this architecture, there are five servers configured. Two are used to host copies of the data. The other three servers are used to coordinate the replication of data. With this example, we'll create a database and table that will be replicated across both data nodes using the ReplicatedMergeTree table engine.

## Level: Basic

<ReplicationShardingTerminology />

## Environment
### Architecture Diagram
![Architecture diagram for 1 shard and 2 replicas with ReplicatedMergeTree](@site/docs/en/deployment-guides/images/Architecture.1S_2R_ReplicatedMergeTree_5-nodes.3.CH.Keeper.nodes.2.CH.nodes.png)

|Node|Description|
|----|-----------|
|clickhouse-01|Data|
|clickhouse-02|Data|
|clickhouse-keeper-01|Distributed coordination|
|clickhouse-keeper-02|Distributed coordination|
|clickhouse-keeper-03|Distributed coordination|

:::note
It is possible to run ClickHouse Server and Keeper combined on the same server.  The other basic example, [Scaling out](/docs/en/deployment-guides/horizontal-scaling.md), uses this method.  In this example we present the recommended method of separating Keeper from ClickHouse Server.  The Keeper servers can be smaller, 4GB RAM is generally enough for each Keeper server until your ClickHouse Servers grow very large.
:::

## Install

Install ClickHouse server and client on the two servers `clickhouse-01` and `clickhouse-02` following the [instructions for your archive type](/docs/en/getting-started/install.md/#available-installation-options) (.deb, .rpm, .tar.gz, etc.). 

Install ClickHouse Keeper on the three servers `clickhouse-keeper-01`, `clickhouse-keeper-02` and `clickhouse-keeper-03` following the [instructions for your archive type](/docs/en/getting-started/install.md/#install-standalone-clickhouse-keeper) (.deb, .rpm, .tar.gz, etc.).

## Editing configuration files

<ConfigFileNote />

## clickhouse-01 configuration

For clickhouse-01 there are five configuration files.  You may choose to combine these files into a single file, but for clarity in the documentation it may be simpler to look at them separately.  As you read through the configuration files you will see that most of the configuration is the same between clickhouse-01 and clickhouse-02; the differences will be highlighted.

### Network and logging configuration

These values can be customized as you wish.  This example configuration gives you:
- a debug log that will roll over at 1000M three times
- the name displayed when you connect with `clickhouse-client` is `cluster_1S_2R node 1`
- ClickHouse will listen on the IPV4 network on ports 8123 and 9000.

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml on clickhouse-01" 
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>cluster_1S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### Macros configuration

The macros `shard` and `replica` reduce the complexity of distributed DDL.  The values configured are automatically substituted in your DDL queries, which simplifies your DDL.  The macros for this configuration specify the shard and replica number for each node.  
In this 1 shard 2 replica example, the replica macro is `replica_1` on clickhouse-01 and `replica_2` on clickhouse-02.  The shard macro is `1` on both clickhouse-01 and clickhouse-02 as there is only one shard. 

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-01"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### Replication and sharding configuration

Starting from the top:
- The remote_servers section of the XML specifies each of the clusters in the environment. The attribute `replace=true` replaces the sample remote_servers in the default ClickHouse configuration with the remote_server configuration specified in this file.  Without this attribute the remote servers in this file would be appended to the list of samples in the default.  
- In this example, there is one cluster named `cluster_1S_2R`.
- A secret is created for the cluster named `cluster_1S_2R` with the value `mysecretphrase`.  The secret is shared across all of the remote servers in the environment to ensure that the correct servers are joined together.
- The cluster `cluster_1S_2R` has one shard, and two replicas.  Take a look at the architecture diagram toward the beginning of this document, and compare it with the `shard` definition in the XML below.  The shard definition contains two replicas.  The host and port for each replica is specified.  One replica is stored on `clickhouse-01`, and the other replica is stored on `clickhouse-02`.
- Internal replication for the shard is set to true.  Each shard can have the internal_replication parameter defined in the config file. If this parameter is set to true, the write operation selects the first healthy replica and writes data to it.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml on clickhouse-01"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
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
</clickhouse>
```

### Configuring the use of Keeper

This configuration file `use-keeper.xml` is configuring ClickHouse Server to use ClickHouse Keeper for the coordination of replication and distributed DDL.  This file specifies that ClickHouse Server should use Keeper on nodes clickhouse-keeper-01 - 03 on port 9181, and the file is the same on `clickhouse-01` and `clickhouse-02`.  

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- where are the ZK nodes -->
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
</clickhouse>
```

## clickhouse-02 configuration

As the configuration is very similar on clickhouse-01 and clickhouse-02 only the differences will be pointed out here.

### Network and logging configuration

This file is the same on both clickhouse-01 and clickhouse-02, with the exception of `display_name`.

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml on clickhouse-02" 
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!-- highlight-next-line -->
    <display_name>cluster_1S_2R node 2</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### Macros configuration

The macros configuration is different between clickhouse-01 and clickhouse-02.  `replica` is set to `02` on this node.

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-02"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>02</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### Replication and sharding configuration

This file is the same on both clickhouse-01 and clickhouse-02.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml on clickhouse-02"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
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
</clickhouse>
```

### Configuring the use of Keeper

This file is the same on both clickhouse-01 and clickhouse-02.

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- where are the ZK nodes -->
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
</clickhouse>
```

## clickhouse-keeper-01 configuration

<KeeperConfigFileNote />

ClickHouse Keeper provides the coordination system for data replication and distributed DDL queries execution. ClickHouse Keeper is compatible with Apache ZooKeeper.  This configuration enables ClickHouse Keeper on port 9181.  The highlighted line specifies that this instance of Keeper has server_id of 1.  This is the only difference in the `enable-keeper.xml` file across the three servers.  `clickhouse-keeper-02` will have `server_id` set to `2`, and `clickhouse-keeper-03` will have `server_id` set to `3`.  The raft configuration section is the same on all three servers, it is highlighted below to show you the relationship between `server_id` and the `server` instance within the raft configuration.

:::note
If for any reason a Keeper node is replaced or rebuilt, do not reuse an existing `server_id`.  For example, if the Keeper node with `server_id` of `2` is rebuilt, give it server_id of `4` or higher.
:::

```xml title="/etc/clickhouse-keeper/config.d/keeper.xml on clickhouse-keeper-01"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>trace</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <!-- highlight-start -->
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
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

## clickhouse-keeper-02 configuration

There is only one line difference between `clickhouse-keeper-01` and `clickhouse-keeper-02`.  `server_id` is set to `2` on this node.

```xml title="/etc/clickhouse-keeper/config.d/keeper.xml on clickhouse-keeper-02"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## clickhouse-keeper-03 configuration

There is only one line difference between `clickhouse-keeper-01` and `clickhouse-keeper-03`.  `server_id` is set to `3` on this node.

```xml title="/etc/clickhouse-keeper/config.d/keeper.xml on clickhouse-keeper-03"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## Testing

To gain experience with ReplicatedMergeTree and ClickHouse Keeper you can run the following commands which will have you:
- Create a database on the cluster configured above
- Create a table on the database using the ReplicatedMergeTree table engine
- Insert data on one node and query it on another node
- Stop one ClickHouse server node
- Insert more data on the running node
- Restart the stopped node
- Verify that the data is available when querying the restarted node

### Verify that ClickHouse Keeper is running

The `mntr` command is used to verify that the ClickHouse Keeper is running and to get state information about the relationship of the three Keeper nodes.  In the configuration used in this example there are three nodes working together.  The nodes will elect a leader, and the remaining nodes will be followers.  The `mntr` command gives information related to performance, and whether a particular node is a follower or a leader.

:::tip
You may need to install `netcat` in order to send the `mntr` command to Keeper.  Please see the [nmap.org](https://nmap.org/ncat/) page for download information.
:::

```bash title="run from a shell on clickhouse-keeper-01, clickhouse-keeper-02, and clickhouse-keeper-03"
echo mntr | nc localhost 9181
```
```response title="response from a follower"
zk_version	v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency	0
zk_max_latency	0
zk_min_latency	0
zk_packets_received	0
zk_packets_sent	0
zk_num_alive_connections	0
zk_outstanding_requests	0
# highlight-next-line
zk_server_state	follower
zk_znode_count	6
zk_watch_count	0
zk_ephemerals_count	0
zk_approximate_data_size	1271
zk_key_arena_size	4096
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	46
zk_max_file_descriptor_count	18446744073709551615
```

```response title="response from a leader"
zk_version	v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency	0
zk_max_latency	0
zk_min_latency	0
zk_packets_received	0
zk_packets_sent	0
zk_num_alive_connections	0
zk_outstanding_requests	0
# highlight-next-line
zk_server_state	leader
zk_znode_count	6
zk_watch_count	0
zk_ephemerals_count	0
zk_approximate_data_size	1271
zk_key_arena_size	4096
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	48
zk_max_file_descriptor_count	18446744073709551615
# highlight-start
zk_followers	2
zk_synced_followers	2
# highlight-end
```

### Verify ClickHouse cluster functionality

Connect to node `clickhouse-01` with `clickhouse client` in one shell, and connect to node `clickhouse-02` with `clickhouse client` in another shell.

1. Create a database on the cluster configured above

```sql title="run on either node clickhouse-01 or clickhouse-02"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. Create a table on the database using the ReplicatedMergeTree table engine
```sql title="run on either node clickhouse-01 or clickhouse-02"
CREATE TABLE db1.table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```
3. Insert data on one node and query it on another node
```sql title="run on node clickhouse-01"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Query the table on the node `clickhouse-02`
```sql title="run on node clickhouse-02"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. Insert data on the other node and query it on the node `clickhouse-01`
```sql title="run on node clickhouse-02"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="run on node clickhouse-01"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

6. Stop one ClickHouse server node
Stop one of the ClickHouse server nodes by running an operating system command similar to the command used to start the node.  If you used `systemctl start` to start the node, then use `systemctl stop` to stop it.

7. Insert more data on the running node
```sql title="run on the running node"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

Select the data:
```sql title="run on the running node"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```

8. Restart the stopped node and select from there also

```sql title="run on the restarted node"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```
