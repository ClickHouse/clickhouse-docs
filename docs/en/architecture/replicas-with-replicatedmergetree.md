---
sidebar_position: 1
slug: /en/architecture/replicas-with-replicatedmergetree
sidebar_label: Replication
title: Replication
---

## Description
In this architecture, there are 3 nodes configured and two are used to host a copy of a shard. The third node is used only for a tie-breaker in the event that one of the nodes fails so that ClickHouse can continue to write data. With this example, we'll create a database and table that will be replicated across both data nodes using the ReplicatedMergeTree table engine.

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
![architecture - 3 nodes - 1 shard - 2 replicas](https://user-images.githubusercontent.com/18219420/206820984-cabeca05-ea04-4867-9c3a-c9a4e340734e.png)


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
- None needed since this node is just used for quorum and there will be no user data on it.

*Macros definition
- None needed since this node is just used for quorum and there will be no user data on it.

## Testing

1. Connect to `chnode1` and create a database on the cluster
```
CREATE DATABASE db1 ON CLUSTER 'cluster_1S_2R';
```

2. Create a table with ReplicatedMergeTree table engine on the cluster.
:::note
We do not need not to specify parameters on the table engine since these will be automatically defined based on our macros
:::

```
CREATE TABLE db1.table1 ON CLUSTER 'cluster_1S_2R' (id UInt64, column1 String) ENGINE = ReplicatedMergeTree() ORDER BY id;
```

3. Connect to `chnode1` and insert a row
```
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Connect to `chnode2` and verify the row is replicated

```
clickhouse :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: 98bc1fe0-0999-49aa-a3b3-04bf28a8852e

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

6. From `chnode2`, insert a new row
```
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

7. Connect to `chnode1` and verify row has replicated
```
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

=================================================================================
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
