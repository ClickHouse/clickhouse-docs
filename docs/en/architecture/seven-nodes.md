---
slug: /en/architecture/seven-nodes
sidebar_label: HA and Scalability
---

# HA with Replication and Sharding

This example architecture is designed to provide high availability and scalability.  It includes seven nodes: four ClickHouse servers, and three coordination (ClickHouse Keeper) servers.

## Terminology
- Replication: Keeping multiple copies of data.
- Sharding: Splitting data across multiple systems to divide the load.

## Description
In this architecture, there are seven nodes. Four ClickHouse nodes contain the data and three separate nodes manage the cluster replication. This architecture shows an example of having two shards and two replicas.

## Level: Intermediate

## Environment
### Architecture diagram
![Architecture diagram for 4 ClickHouse nodes and 3 Keeper nodes](@site/docs/en/architecture/images/seven-nodes.png)


|Node|Description|
|------------------------|-----------------------|
|chnode1.marsnet.local| ClickHouse Data Node  |
|chnode2.marsnet.local| ClickHouse Data Node  |
|chnode3.marsnet.local| ClickHouse Data Node  |
|chnode4.marsnet.local| ClickHouse Data Node  |
|chkeeper1.marsnet.local | ClickHouse Keeper Node|
|chkeeper2.marsnet.local | ClickHouse Keeper Node|
|chkeeper3.marsnet.local | ClickHouse Keeper Node|

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
<server_id>1</server_id>`
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

The configuration on node `chkeeper2` is the same as `chkeeper1` except for the `server_id`, see the highlighted line below. As your hostnames are probably not the same as the examples, set the hostnames to match yours for all of the ClickHouse Keeper nodes.

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

The configuration on node `chkeeper3` is the same as `chkeeper1` except for the `server_id`, see the highlighted line below. As your hostnames are probably not the same as the examples, set the hostnames to match yours for all of the ClickHouse Keeper nodes.

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
