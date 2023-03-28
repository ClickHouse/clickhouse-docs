---
slug: /en/architecture/horizontal-scaling
sidebar_label: Scaling out
sidebar_position: 10
title: Scaling out
---
import ReplicationShardingTerminology from '@site/docs/en/_snippets/_replication-sharding-terminology.md';


<ReplicationShardingTerminology />

## Description
This example architecture is designed to provide scalability.  It includes three nodes: two combined ClickHouse plus coordination (ClickHouse Keeper) servers, and a third server with only ClickHouse Keeper to finish the quorum of three. With this example, we'll create a database, table, and a distributed table that will be able to query the data on both of the nodes.

## Level: Basic

## Environment
### Architecture Diagram
![Architecture diagram for 2 shards and 1 replica](@site/docs/en/deployment-guides/images/scaling-out-1.png)

|Node|Description|
|----|-----------|
|chnode1|Data + ClickHouse Keeper|
|chnode2|Data + ClickHouse Keeper|
|chnode3|Used for ClickHouse Keeper quorum|

:::note
In the more advanced configurations ClickHouse Keeper will be run on separate servers.  This basic configuration is running the Keeper functionality within the ClickHouse Server process.  As you scale out you may decide to separate the ClickHouse Servers from the Keeper servers.  See the [Replication and scaling out](/docs/en/deployment-guides/HA-plus-horizontal-scaling.md) example.
:::

## chnode1 configuration

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
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

```xml title="macros.xml on chnode1"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

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

```xml title="macros.xml on chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

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

```xml title="enable-keeper.xml"
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
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

*Zookeeper Configuration:
- None needed since this node is just used for quorum and there will be no user data on it.

*Cluster definition
- None needed since this node is just used for quorum and there will be no user data on it.

*Macros definition
- None needed since this node is just used for quorum and there will be no user data on it.

## Testing

1. Connect to `chnode1` and create a database on the cluster
```
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
```

2. Create a table with MergeTree table engine on the cluster.
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros
:::

```
CREATE TABLE db1.table1 ON CLUSTER 'cluster_2S_1R' (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

3. Connect to `chnode1` and insert a row
```
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Connect to `chnode2` and insert a row

```
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

5. Connect to either node, `chnode1` or `chnode2` and you will see only the row that was inserted into that table on that node.
for example, on `chnode2`
```
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: efb72c24-a001-4513-9926-cfb8542aa4ee

┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```


6. Create a distributed table to query both shards on both nodes.
(In this exmple, the `rand()` function is set as the sharing key so that it randomly distributes each insert)
```
CREATE TABLE db1.table1_dist ON CLUSTER 'cluster_2S_1R' (id UInt64, column1 String) ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand());
```

7. Connect to either `chnode1` or `chnode2` and query the distributed table to see both rows.
```
clickhouse :) SELECT * FROM db1.table1_dist;

SELECT *
FROM db1.table1_dist

Query id: a89e1ed4-7624-4691-a2b8-f959c12fa2e1

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

