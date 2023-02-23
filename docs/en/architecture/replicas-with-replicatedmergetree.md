---
sidebar_position: 1
slug: /en/architecture/replicas-with-replicatedmergetree
sidebar_label: Replication
title: Replication
---

## Description
In this architecture, there are three nodes configured and two are used to host a copy, or replica, of a shard. The third node is used only for a ClickHouse Keeper tie-breaker in the event that one of the nodes fails so that ClickHouse can continue to write data. With this example, we'll create a database and table that will be replicated across both data nodes using the ReplicatedMergeTree table engine.

## Level: Basic

## Environment
|Node|Description|
|----|-----------|
|chnode1.marsnet.local|Data + ClickHouse Keeper|
|chnode2.marsnet.local|Data + ClickHouse Keeper|
|chnode3.marsnet.local|Used for ClickHouseKeeper quorum|

:::note
chnode3 can be set up to run ClickHouse Keeper standalone.
For more details: https://clickhouse.com/docs/en/operations/clickhouse-keeper

For SSL configurations, ports may be different, see:
https://clickhouse.com/docs/en/guides/sre/configuring-ssl
https://clickhouse.com/docs/en/guides/sre/network-ports/
:::

## Architecture Diagram
![architecture - 3 nodes - 1 shard - 2 replicas](@site/docs/en/architecture/images/1S-2R-ReplicatedMergeTree.png)


## chnode1

*ClickHouse Keeper Configuration:

```xml
<keeper_server>
    <tcp_port>9181</tcp_port>
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
            <hostname>chnode1.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3.marsnet.local</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
</keeper_server>
```

*Zookeeper Configuration:
note:::
although ClickHouse Keeper is being used, this configuration is still needed to define where ClickHouse will connect for shared metadata.
:::

```xml
<zookeeper>
    <node>
        <host>chnode1.marsnet.local</host>
        <port>9181</port>
    </node>
    <node>
        <host>chnode2.marsnet.local</host>
        <port>9181</port>
    </node>
    <node>
        <host>chnode3.marsnet.local</host>
        <port>9181</port>
    </node>
</zookeeper>
```

### Cluster Definition
```xml
<remote_servers>
    <cluster_1S_2R>
        <secret>mysecretphrase</secret>
        <shard>
        <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1.marsnet.local</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>chnode2.marsnet.local</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_1S_2R>
</remote_servers>
```

*Macros definition

```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```

## chnode2

*ClickHouse Keeper Configuration:

```xml
<keeper_server>
    <tcp_port>9181</tcp_port>
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
            <hostname>chnode1.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3.marsnet.local</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
</keeper_server>
```

*Zookeeper Configuration:
```xml
<zookeeper>
    <node>
        <host>chnode1.marsnet.local</host>
        <port>9181</port>
    </node>
    <node>
        <host>chnode2.marsnet.local</host>
        <port>9181</port>
    </node>
    <node>
        <host>chnode3.marsnet.local</host>
        <port>9181</port>
    </node>
</zookeeper>
```

### Cluster Definition
```xml
<remote_servers>
    <cluster_1S_2R>
        <secret>mysecretphrase</secret>
        <shard>
        <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1.marsnet.local</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>chnode2.marsnet.local</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_1S_2R>
</remote_servers>
```

*Macro definition
```xml
<macros>
    <shard>1</shard>
    <replica>replica_2</replica>
</macros>
```

## chnode3

*ClickHouse Keeper Configuration:

```xml
<keeper_server>
    <tcp_port>9181</tcp_port>
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
            <hostname>chnode1.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2.marsnet.local</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3.marsnet.local</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
</keeper_server>
```

*Zookeeper Configuration:

```xml
<zookeeper>
    <node>
        <host>chnode1.marsnet.local</host>
        <port>9181</port>
    </node>
    <node>
        <host>chnode2.marsnet.local</host>
        <port>9181</port>
    </node>
    <node>
        <host>chnode3.marsnet.local</host>
        <port>9181</port>
    </node>
</zookeeper>
```

*Cluster definition
- No cluster definition is needed since this node is just used for the ClickHouse Keeper quorum.

*Macros definition
- No macros are defined since this node is just used for the ClickHouse Keeper quorum.

## Testing

1. Connect to `chnode1` and create a database on the cluster
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_1S_2R';
```

2. Create a table with ReplicatedMergeTree table engine on the cluster.
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros
:::

```sql
CREATE TABLE db1.table1 ON CLUSTER 'cluster_1S_2R' (id UInt64, column1 String) ENGINE = ReplicatedMergeTree() ORDER BY id;
```

3. Connect to `chnode1` and insert a row
```sql
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Connect to `chnode2` and verify the row is replicated

```sql
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: 98bc1fe0-0999-49aa-a3b3-04bf28a8852e

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

6. From `chnode2`, insert a new row
```sql
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

7. Connect to `chnode1` and verify row has replicated
```sql
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: dad32bec-49a9-4ef0-b28a-f0bf422404d6

┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

