---
sidebar_position: 2
slug: /en/architecture/replicas-with-replicatedreplacingmergetree
sidebar_label: Replication plus Deduplication
title: Replication plus Deduplication with ReplicatedReplacingMergeTree
---

## Description
In this architecture, there are 3 nodes configured. Each node will have one shard and that shard will be replicated across 3 nodes. With this example, we'll create a database and table using ReplicatedReplacingMergeTree to try to avoid duplicates.

## Level: Basic

## Environment
|Node|Description|
|----|-----------|
|chnode1.marsnet.local|Data + ClickHouse Keeper|
|chnode2.marsnet.local|Data + ClickHouse Keeper|
|chnode3.marsnet.local|Data + ClickHouse Keeper|

:::note
For more details: https://clickhouse.com/docs/en/operations/clickhouse-keeper

For SSL configurations, ports may be different, see:
https://clickhouse.com/docs/en/guides/sre/configuring-ssl
https://clickhouse.com/docs/en/guides/sre/network-ports/
:::

## Architecture Diagram
![architecture - 3 nodes - 1 shard - 3 replicas - replacing merge tree](https://user-images.githubusercontent.com/18219420/206835434-f1cd759e-c7c2-4626-aa3f-9040b14f6e7f.png)

## chnode1

### ClickHouse Keeper Configuration:

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

### Zookeeper Configuration:
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

### Cluster Definiton:
```xml
<remote_servers>
    <cluster_1S_3R>
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
    </cluster_1S_3R>
</remote_servers>
```

### Macros definition

```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```

## chnode2

### ClickHouse Keeper Configuration:

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

### Zookeeper Configuration:
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

### Cluster Definiton
```xml
<remote_servers>
    <cluster_1S_3R>
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
    </cluster_1S_3R>
</remote_servers>
```

### Macro definition
```xml
<macros>
    <shard>1</shard>
    <replica>replica_2</replica>
</macros>
```

## chnode3

### ClickHouse Keeper Configuration:

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

### Zookeeper Configuration:

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

### Cluster definition
```xml
<remote_servers>
    <cluster_1S_3R>
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
    </cluster_1S_3R>
</remote_servers>
```

### Macros definition
```xml
<macros>
    <shard>1</shard>
    <replica>replica_3</replica>
</macros>
```

## Testing

1. Connect to `chnode1` and create a database on the cluster
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_1S_3R';
```

2. Create a table using the ReplicatedReplacingMergeTree table engine on the cluster
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros.
:::

```sql
CREATE TABLE db1.table1 ON CLUSTER 'cluster_1S_3R'
(
    id UInt64,
    column1 String
)
ENGINE = ReplicatedReplacingMergeTree()
ORDER BY (id, column1);
```

3. Connect to any node and insert new rows

```sql
INSERT INTO db1.table1 (id, column1)
VALUES
(1, 'abc'),
(2, 'def'),
(3, 'ghi');
```

5. Connect to a different node and verify that the rows have been replicated
for example, on `chnode2`
```sql
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘

```


6. Try to insert the same rows again

```sql
INSERT INTO db1.table1 (id, column1)
              VALUES
              (1, 'abc'),
              (2, 'def'),
              (3, 'ghi');

```

Then view the rows
```sql
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
```

:::note
Notice that it rejected the rows because it was the same insert and would have the same hash on the block inserted. By default, ClickHouse will keep track of the last 100 blocks. If a block gets inserted after, it will insert the data.
:::

7. Insert a new block with a row that matches the id but not column1 but also contains rows that are already in the table
```sql
INSERT INTO db1.table1 (id, column1)
VALUES
(1, 'xyz'),
(2, 'def'),
(3, 'ghi');
```

8. View the rows now in the table
```sql
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ xyz     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
```

:::note
Notice that now the table contains the new block inserted and rows are duplicated. 
:::

9. Run the following `SELECT` query with the `FINAL` modifier to remove duplicate rows

```sql
SELECT *
FROM db1.table1
FINAL
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  1 │ xyz     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
```

The `FINAL` modifier forced the system to remove any duplicates based on the columns that were used in the sorting order, in our example `id` and `column1`, since only `id` matched but `column1` did not the row `1, xyz` is not considered a duplicate.

10. Force a merge on the data files to remove the duplicates with `OPTIMIZE`

:::note
This is a very resource-heavy operation and should not be used often, the system will periodically merge the parts and will remove the duplicates.

```sql
OPTIMIZE TABLE db1.table1 ON CLUSTER 'cluster_1S_3R' FINAL DEDUPLICATE;
```

11. Run the standard select query
```sql
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  1 │ xyz     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
```

Notice that the query returns with the deduplicated rows although the `FINAL` modifier was not used in the query.

