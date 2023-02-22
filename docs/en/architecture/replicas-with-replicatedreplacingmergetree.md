---
sidebar_position: 2
slug: /en/architecture/replicas-with-replicatedreplacingmergetree
sidebar_label: Multiple Replicas and Deduplication with ReplicatedReplacingMergeTree
title: Multiple Replicas and Deduplication with ReplicatedReplacingMergeTree
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

*ClickHouse Keeper Configuration:

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

*Zookeeper Configuration:
note:::
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

*Cluster Definiton:
```
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

*Macros definition

```
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```

## chnode2

*ClickHouse Keeper Configuration:

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

*Zookeeper Configuration:
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

*Cluster Definiton
```
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

*Macro definition
```
<macros>
    <shard>1</shard>
    <replica>replica_2</replica>
</macros>
```

## chnode3

*ClickHouse Keeper Configuration:

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

*Zookeeper Configuration:

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

*Cluster definition
```
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

*Macros definition
```
<macros>
    <shard>1</shard>
    <replica>replica_3</replica>
</macros>
```

## Testing

1. Connect to `chnode1` and create a database on the cluster
```
CREATE DATABASE db1 ON CLUSTER 'cluster_1S_3R';
```

2. Create a table with ReplicatedReplacingMergeTree table engine on the cluster
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros
:::

```
CREATE TABLE db1.table1 ON CLUSTER 'cluster_1S_3R' (id UInt64, column1 String) ENGINE = ReplicatedReplacingMergeTree() ORDER BY (id, column1);
```

3. Connect to any node and insert new rows

```
INSERT INTO db1.table1 (id, column1)
VALUES
(1, 'abc'),
(2, 'def'),
(3, 'ghi');
```

5. Connect to a different node, view that the rows have been replicated
for example, on `chnode2`
```
clickhouse :)  SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: e6c0b0c1-0a6e-489b-9250-aa1e8cd71158

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘

```


6. Try to insert the same rows again

```
INSERT INTO db1.table1 (id, column1)
              VALUES
              (1, 'abc'),
              (2, 'def'),
              (3, 'ghi');

```

Then view the rows
```
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: b4349f26-3075-424c-8381-b26a23b381ac

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘

```
*Notice that it rejected the rows because it was the same insert and would have the same hash on the block inserted. By default, ClickHouse will keep track of the last 100 blocks. If a block gets inserted after, it will insert the data.

7. Insert a new block with a row that matches the id but not column1 but also contains rows that are already in the table
```
INSERT INTO db1.table1 (id, column1)
VALUES
(1, 'xyz'),
(2, 'def'),
(3, 'ghi');
```

8. View the rows now in the table
```
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: d90bf382-cd56-4c07-9439-015c0219d960

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

*Notice that now the table contains the new block inserted and rows are duplicated. 

9. Run the following `SELECT` query with the `FINAL` modifier to remove duplicate rows
```
clickhouse :) SELECT * FROM db1.table1 FINAL;

SELECT *
FROM db1.table1
FINAL

Query id: 94135f3c-f342-44fe-ae62-3b8f778d5819

┌─id─┬─column1─┐
│  1 │ abc     │
│  1 │ xyz     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
```

*The `FINAL` modifier forced the system to remove any duplicates based on same columns that were used in the sorting order, in our example `id` and `column1`, since only `id` matched but `column1` did not, the row `1, xyz` is not considered a duplicate.

10. Force a merge on the data files to remove the duplicates with `OPTIMIZE`
:::note
This is a very resource heavy operation and should not be used often, the system will periodically merge the parts and will remove the duplicates.

```
OPTIMIZE TABLE db1.table1 ON CLUSTER 'cluster_1S_3R' FINAL DEDUPLICATE;
```

11. Run the standard select query
```
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: 16952724-8762-422b-a5ba-801ccaf94c2c

┌─id─┬─column1─┐
│  1 │ abc     │
│  1 │ xyz     │
│  2 │ def     │
│  3 │ ghi     │
└────┴─────────┘
```

Notice that the query returns with the deduplicated rows although the `FINAL` modifier was not used in the query.

==================================================================================================================
This example architecture is designed to provide multiple copies (replicas) of your data, and horizontal scalability (sharding). It includes seven nodes: four ClickHouse servers, and three coordination (ClickHouse Keeper) servers.

## Terminology
- Replication: Keeping multiple copies of data.
- Sharding: Splitting data across multiple systems to divide the load.

## Advantages and Disadvantages

To Do

## Level: Intermediate

## Environment
### Architecture diagram
![Architecture diagram for 4 ClickHouse nodes and 3 Keeper nodes](@site/docs/en/architecture/images/seven-nodes.png)


| Node                    | Description            |
|-------------------------|------------------------|
| chnode1.marsnet.local   | ClickHouse Data Node   |
| chnode2.marsnet.local   | ClickHouse Data Node   |
| chnode3.marsnet.local   | ClickHouse Data Node   |
| chnode4.marsnet.local   | ClickHouse Data Node   |
| chkeeper1.marsnet.local | ClickHouse Keeper Node |
| chkeeper2.marsnet.local | ClickHouse Keeper Node |
| chkeeper3.marsnet.local | ClickHouse Keeper Node |

## ClickHouse Keeper node configurations

The configuration file for ClickHouse Keeper should be placed in `/etc/clickhouse-keeper/config.d/`.  In this example, we use the filename `keeper-config.xml`, so the full path would be /etc/clickhouse-keeper/config.d/keeper-config.xml`.

:::note
Do not edit the existing `config.xml` in `/etc/clickhouse-keeper/`, add your local config to the `config.d` directory.  The `config.d` directory will not be overwritten during upgrades.
:::

The configuration on the three ClickHouse Keeper servers is identical with one exception.  The `<server_id>` line varies based on which server you are configuring. Using the sample configuration for node `chkeeper1` as an example examine the highlighted lines.  


### chkeeper1

```xml title="keeper-config.xml on node chkeeper1"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>2</count>
        </logger>
        <listen_host>0.0.0.0</listen_host>
        <keeper_server>
                <tcp_port>9181</tcp_port>
 # highlight-next-line
                <server_id>1</server_id>
                <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
                <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

                <coordination_settings>
                        <operation_timeout_ms>10000</operation_timeout_ms>
                        <session_timeout_ms>30000</session_timeout_ms>
                        <raft_logs_level>debug</raft_logs_level>
                </coordination_settings>
# highlight-start
                <raft_configuration>
                        <server>
                                <id>1</id>
                                <hostname>chkeeper1.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
                        <server>
                                <id>2</id>
                                <hostname>chkeeper2.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
                        <server>
                                <id>3</id>
                                <hostname>chkeeper3.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
                </raft_configuration>
# highlight-end
        </keeper_server>
</clickhouse>
```

You should see that `server_id` is set to `1`:

```xml
<server_id>1</server_id>
```
You should also see that the `raft_configuration` contains three `server` entries and that each of them has an `id` specified.  The server with id `1` is shown here:
```xml
                        <server>
                                <id>1</id>
                                <hostname>chkeeper1.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
```

Putting the two highlighted sections together, you should know that this configuration is for the server with id `1` and hostname `chkeeper1.marsnet.local`.

### chkeeper2

The configuration on node `chkeeper2` is the same as `chkeeper1` except for the `server_id`, see the highlighted line below. As your hostnames are probably not the same as the examples, set the hostnames to match yours for all the ClickHouse Keeper nodes.

```xml title="keeper-config.xml on node chkeeper2"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>2</count>
        </logger>
        <listen_host>0.0.0.0</listen_host>
        <keeper_server>
                <tcp_port>9181</tcp_port>
 # highlight-next-line
                <server_id>2</server_id>
                <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
                <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

                <coordination_settings>
                        <operation_timeout_ms>10000</operation_timeout_ms>
                        <session_timeout_ms>30000</session_timeout_ms>
                        <raft_logs_level>debug</raft_logs_level>
                </coordination_settings>

                <raft_configuration>
                        <server>
                                <id>1</id>
                                <hostname>chkeeper1.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
# highlight-start
                        <server>
                                <id>2</id>
                                <hostname>chkeeper2.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
# highlight-end
                        <server>
                                <id>3</id>
                                <hostname>chkeeper3.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
                </raft_configuration>
        </keeper_server>
</clickhouse>
```

### chkeeper3

The configuration on node `chkeeper3` is the same as `chkeeper1` except for the `server_id`, see the highlighted line below. As your hostnames are probably not the same as the examples, set the hostnames to match yours for all the ClickHouse Keeper nodes.

```xml title="keeper-config.xml on node chkeeper3"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>2</count>
        </logger>
        <listen_host>0.0.0.0</listen_host>
        <keeper_server>
                <tcp_port>9181</tcp_port>
 # highlight-next-line
                <server_id>3</server_id>
                <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
                <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

                <coordination_settings>
                        <operation_timeout_ms>10000</operation_timeout_ms>
                        <session_timeout_ms>30000</session_timeout_ms>
                        <raft_logs_level>debug</raft_logs_level>
                </coordination_settings>

                <raft_configuration>
                        <server>
                                <id>1</id>
                                <hostname>chkeeper1.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
                        <server>
                                <id>2</id>
                                <hostname>chkeeper2.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
# highlight-start
                        <server>
                                <id>3</id>
                                <hostname>chkeeper3.marsnet.local</hostname>
                                <port>9444</port>
                        </server>
# highlight-end
                </raft_configuration>
        </keeper_server>
</clickhouse>
```

## ClickHouse Server node configurations
### chnodes base configuration
*update the macros according to the node where replicas and shards will be defined. 
see the following macro configurations based on each node.

```xml
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
        <zookeeper>
                <node>
                        <host>chkeeper1.marsnet.local</host>
                        <port>9181</port>
                </node>
                <node>
                        <host>chkeeper2.marsnet.local</host>
                        <port>9181</port>
                </node>
                <node>
                        <host>chkeeper3.marsnet.local</host>
                        <port>9181</port>
                </node>
        </zookeeper>
        <remote_servers>
                <cluster_2S_2R>
                        <secret>mysecret</secret>
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
                        <shard>
                                <internal_replication>true</internal_replication>
                                <replica>
                                        <host>chnode3.marsnet.local</host>
                                        <port>9000</port>
                                </replica>
                                <replica>
                                        <host>chnode4.marsnet.local</host>
                                        <port>9000</port>
                                </replica>
                        </shard>
                </cluster_2S_2R>
        </remote_servers>

<!-- Macros definition -->

</clickhouse>
```

chnode1:

```xml
	<macros>
		<shard>1</shard>
		<replica>replica_1</replica>
	</macros>
```

chnode2:

```xml
	<macros>
		<shard>1</shard>
		<replica>replica_2</replica>
	</macros>
```

chnode3:

```xml
	<macros>
		<shard>2</shard>
		<replica>replica_1</replica>
	</macros>
```

chnode4

```xml
	<macros>
		<shard>2</shard>
		<replica>replica_2</replica>
	</macros>
```


## Startup and verification

Below is how to start ClickHouse Keeper as a stand-alone service:
```bash
sudo -u clickhouse clickhouse-keeper --config /etc/clickhouse-server/config.xml --daemon
```

Log into the client:
```bash
clickhouse-client --user default --password ClickHouse123!  --port 9000 --host chnode1.marsnet.local
```

Create a database and table on the Cluster then add data to test:
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_2R';
```

```sql
CREATE TABLE db1.table1 ON CLUSTER 'cluster_2S_2R' (id UInt64, column1 String) ENGINE = ReplicatedMergeTree() ORDER BY id;
```

```sql
CREATE TABLE db1.table1_dist ON CLUSTER 'cluster_2S_2R' (id UInt64, column1 String) ENGINE = Distributed('cluster_2S_2R', 'db1', 'table1', rand());
```

```sql
INSERT INTO db1.table1_dist 
  (id, column1) 
VALUES 
  (1, 'abc'),
  (2, 'def');
```

#### chnode1:
```sql
SELECT *
FROM db1.table1
```
```response
Ok.

0 rows in set. Elapsed: 0.003 sec.
```

#### Test from node 3 to ensure that records have replicated:
#### chnode3:
```sql
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

#### chnode2:
```sql
SELECT *
FROM db1.table1_dist
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```
