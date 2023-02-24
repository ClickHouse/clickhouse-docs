---
sidebar_position: 2
slug: /en/architecture/sharded-distributed-table
sidebar_label: Horizontal Scaling
title: Horizontal Scaling
---

## Description
In this architecture, there are 3 nodes configured. Each of the data nodes will have a part of the total data. The third node is used only for a tie-breaker in the event that one of the nodes fails so that ClickHouse can continue to write data. With this example, we'll create a database, two local tables, and a distributed table that will be able to query the data on both of the nodes.

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

#### ClickHouse Keeper Configuration

```xml title="/etc/clickhouse-server/config.d/enable_keeper.xml on node chnode1"
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

#### Zookeeper Configuration

:::note
This configuration allows the ClickHouse server to connect to the ClickHouse Keeper nodes.
:::

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml on node chnode1"
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

#### Cluster Definition
```xml title="/etc/clickhouse-server/config.d/remote_servers.xml on node chnode1"
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

#### Macros definition

```xml title="/etc/clickhouse-server/config.d/macros.xml on node chnode1"
<clickhouse>
    <macros>
    # highlight-next-line
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```

### chnode2

#### ClickHouse Keeper Configuration:

```xml title="/etc/clickhouse-server/config.d/enable_keeper.xml on node chnode2"
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

#### Zookeeper Configuration

:::tip
This file is the same on all ClickHouse server nodes
:::

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml on node chnode2"
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

#### Cluster Definition

:::tip
This file is the same on all ClickHouse server nodes
:::

```xml title="/etc/clickhouse-server/config.d/remote_servers.xml on node chnode2"
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

#### Macro definition
```xml title="/etc/clickhouse-server/config.d/macros.xml on node chnode2"
<clickhouse>
    <macros>
    # highlight-next-line
        <shard>2</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```

### chnode3

#### ClickHouse Keeper Configuration:

:::note
1. This is the only configuration file necessary for this server.  Because there is no ClickHouse server (only Keeper) running on this server, the only configuration file is `enable_keeper.xml`.
2. The path for this file is slightly different, as this server, `chnode3`, is only running ClickHouse Keeper, the path is `/etc/clickhouse-keeper/config.d/`.
:::

```xml title="/etc/clickhouse-keeper/config.d/enable_keeper.xml on node chnode3"
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

1. Verify that your cluster is defined

  ```sql
  SHOW CLUSTERS
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_2S_1R │
  └───────────────┘
  ```

1. Connect to `chnode1` and create a database on the cluster
  ```sql
  CREATE DATABASE db1 ON CLUSTER cluster_2S_1R
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode2 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode1 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```

2. Create a table using the MergeTree table engine on the cluster.
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros
:::

  ```sql
  CREATE TABLE db1.table1 ON CLUSTER cluster_2S_1R
  (
      id UInt64,
      column1 String
  )
  ENGINE = MergeTree
  ORDER BY id
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode2 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode1 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
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
  ```sql
  SELECT *
  FROM db1.table1
  ```
  ```response
  ┌─id─┬─column1─┐
  │  2 │ def     │
  └────┴─────────┘
  ```

6. Create a distributed table to query both shards on both nodes.
(In this example, the `rand()` function is set as the sharing key so that it randomly distributes each insert)
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
  │ chnode1 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode2 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```

7. Connect to either `chnode1` or `chnode2` and query the distributed table to see both rows.
  ```sql
  SELECT *
  FROM db1.table1_dist
  ```
  ```response
  ┌─id─┬─column1─┐
  │  1 │ abc     │
  └────┴─────────┘
  ┌─id─┬─column1─┐
  │  2 │ def     │
  └────┴─────────┘
  ```

9. Insert into the distributed table
  ```sql
  INSERT INTO db1.table1_dist (id, column1) VALUES (3, 'ghi');
  ```

10. Query the distributed table to see all of the rows.

  ```sql
  SELECT *
  FROM db1.table1_dist
  ```
  ```response
  ┌─id─┬─column1─┐
  │  2 │ def     │
  └────┴─────────┘
  ┌─id─┬─column1─┐
  │  3 │ ghi     │
  └────┴─────────┘
  ┌─id─┬─column1─┐
  │  1 │ abc     │
  └────┴─────────┘
  ```
