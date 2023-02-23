---
sidebar_position: 2
slug: /en/architecture/sharded-distributed-table
sidebar_label: Horizontal Scaling
title: Horizontal Scaling
---

## Description
In this architecture, there are 3 nodes configured. Each of the data nodes will have a part of the total data. The third node is used only for a tie-breaker in the event that one of the nodes fails so that ClickHouse can continue to write data. With this example, we'll create a database, table and a distributed table that will be able to query the data on both of the nodes.

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
![architecture - 3 nodes - 2 shards - 1 replica](@site/docs/en/architecture/images/2S-1R-DistributedTable.png)

### chnode1

#### ClickHouse Keeper Configuration:

```
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

#### Zookeeper Configuration:

:::note
although ClickHouse Keeper is being used, this configuration is still needed to define where ClickHouse will connect for shared metadata.
:::

```
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

#### Cluster Definiton:
```
<remote_servers>
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1.marsnet.local</host>
                <port>9000</port>
            </replica>
        </shard>
            <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2.marsnet.local</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
</remote_servers>
```

#### Macros definition

```
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```

### chnode2

#### ClickHouse Keeper Configuration:

```
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

#### Zookeeper Configuration:
```
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

#### Cluster Definiton
```
<remote_servers>
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1.marsnet.local</host>
                <port>9000</port>
            </replica>
        </shard>
            <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2.marsnet.local</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
</remote_servers>
```

#### Macro definition
```
<macros>
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
```

### chnode3

#### ClickHouse Keeper Configuration:

```
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

#### Zookeeper Configuration:

```
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

#### Cluster definition
- None needed since this node is just used for quorum and there will be no user data on it.

#### Macros definition
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

