---
sidebar_label: Configuring ClickHouse Keeper
sidebar_position: 20
---

# Configuring ClickHouse Keeper 

ClickHouse Keeper is a component included in ClickHouse to handle replication and coordinated operations across nodes and clusters.
This part of the system replaces the requirement of having a separate Zookeper installation and is compatible with Zookeper for ClickHouse operations.

This guide provides simple and minimal settings to configure ClicKHouse Keeper with an example on how to test distributed operations. This example is performed using 3 nodes on Linux.


## 1. Configure Nodes with Keeper settings
1. Install 3 ClickHouse instances on 3 hosts (chnode1, chnode2, chnode3)

_* for details on installing ClickHouse see the Getting Started guide._

2. On each node, add the following entry to allow external communication through the network interface.
```xml
<listen_host>0.0.0.0</listen_host>
```
3. Add the following ClickHouse Keeper configuration to all three servers updating the `<server_id>` setting for each server; for `chnode1` would be `1`, `chnode2` would be `2`, etc.
```xml
<keeper_server>
    <tcp_port>9181</tcp_port>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>warning</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>chnode1.domain.com</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2.domain.com</hostname>
            <port>9444</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3.domain.com</hostname>
            <port>9444</port>
        </server>
    </raft_configuration>
</keeper_server>
```

These are the basic settings used above:

|Parameter |Description                   |Example              |
|----------|------------------------------|---------------------|
|tcp_port   |port to be used by clients of keeper|9181 default equivalent of 2181 as in zookeeper|
|server_id| identifier for each CLickHouse Keeper server used in raft configuration| 1|
|coordination_settings| section to parameters such as timeouts| timeouts: 10000, log level: trace|
|server    |definition of server participating|list of each server definition|
|raft_configuration| settings for each server in the keeper cluster| server and settings for each|
|id      |numeric id of the server for keeper services|1|
|hostname   |hostname, IP or FQDN of each server in the keeper cluster|chnode1.domain.com|
|port|port to listen on for interserver keeper connections|9444|

**Below is link to the full configuration parameters available for ClickHouse Keeper**

https://clickhouse.com/docs/en/operations/clickhouse-keeper/


4.  Enable the Zookeeper component. It will use ClickHouse Keeper engine.
```xml
    <zookeeper>
        <node>
            <host>chnode1.domain.com</host>
            <port>9181</port>
        </node>
        <node>
            <host>chnode2.domain.com</host>
            <port>9181</port>
        </node>
        <node>
            <host>chnode3.domain.com</host>
            <port>9181</port>
        </node>
    </zookeeper>
```

These are the basic settings used above:

|Parameter |Description                   |Example              |
|----------|------------------------------|---------------------|
|node   |list of nodes for ClickHouse Keeper connections|settings entry for each server|
|host|hostname, IP or FQDN of each ClickHouse keepr node| chnode1.domain.com|
|port|ClickHouse Keeper client port| 9181|



5. restart ClickHouse and verify that each zookeper is running. On each server:
```bash
# echo ruok | nc localhost 9181; echo
imok
```

6. Using the ClickHouse client, check the system table for zookeeper was built. 

*The output should look something like this but the values will be different.

```sql
root@chnode1:/# clickhouse-client --user default --password ClickHouse123!
ClickHouse client version 22.2.2.1.
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 22.2.2 revision 54455.

chnode1 :) SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')

SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')

Query id: a75b1dd6-1765-42e3-870d-1f569f6cb9f4

┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
│ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
│ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
│ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
└────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘

3 rows in set. Elapsed: 0.009 sec.
```


## 2.  Configure a cluster in ClickHouse
1. Configure a simple cluster with 2 shards and only one replica on 2 of the nodes. The 3rd node will be used to achieve quorum for the requirement in ClickHouse Keeper that there be an odd number nodes.

_*update the configuration on chnode1 and chnode2. This will define 1 shard on each node for a total of 2 shards with no replication. In this example, some of the data will be on node and some will be on the other node_
```xml
        <cluster_2S_1R>
            <shard>
                <replica>
                    <host>chnode1.domain.com</host>
                    <port>9000</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>chnode2.domain.com</host>
                    <port>9000</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                </replica>
            </shard>
        </cluster_2S_1R>
```

|Parameter |Description                   |Example              |
|----------|------------------------------|---------------------|
|shard   |list of replicas on the cluster definition|list of replicas for each shard|
|replica|list of settings for each replica|settings entries for each replica|
|host|hostname, IP or FQDN of server that will host a replica shard|chnode1.domain.com|
|port|port used to communicate using the native tcp protocol|9000|
|user|username that will be used to authenticate to the cluster instances|default|
|password|password for the user define to allow connections to cluster instances|ClickHouse123!|

:::note
The `user` and `password` fields are required if password was set for `default` user as in the case of installing through .`deb` packages or was set manually in `users.xml` . There are additional options available such as setting a `<secret>` key. 
:::

2. Restart ClickHouse and verify clusters are available
```bash
root@chnode1:/# clickhouse-client --user default --password ClickHouse123!
ClickHouse client version 22.2.2.1.
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 22.2.2 revision 54455.

chnode1 :) show clusters;

SHOW CLUSTERS

Query id: 33e129b4-0d9c-489f-9b4c-de55c05c9dda

┌─cluster───────┐
│ cluster_1S_2R │
└───────────────┘

```

## 3. Create and test distributed table
1.  Create a new database on the new cluster using ClickHouse client on `chnode1`:

_*This command will automatically create the database on both nodes where the cluster is defined._
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
```

2. Create a new table on the `db1` database:
_This command will automatically create the table on both nodes where the cluster is defined._

```sql
CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY column1
```

3. On first node, `chnode1` add sample data
```sql
insert into db1.table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def')
```

4. On second node, `chnode2` add different sample data
```sql
insert into db1.table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl')
```

5. From each node, run a select statement and should only show the data from that node.

On `chnode1`:
```sql
chnode1 :) SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.006 sec.
```

On `chnode2`
```
chnode2 :)  SELECT * FROM db1.table1;

SELECT *
FROM db1.table1

Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

┌─id─┬─column1─┐
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

6. Create a distributed table on `chnode1` 
```sql
create table db1.dist_table1 (
  id UInt64,
  column1 String
)
ENGINE = Distributed(cluster_2S_1R,db1,table1)
```

7. View data across the nodes and cluster in table1
```sql
chnode1 :) SELECT * FROM db1.dist_table1;

SELECT *
FROM db1.dist_table1

Query id: 495bffa0-f849-4a0c-aeea-d7115a54747a

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 rows in set. Elapsed: 0.018 sec.
```

## 4 Summary

This guide demostrated basic configuration for CLickHouse Keeper for use in ClickHouse DB with definition of a basic cluster and distributed operations.  In addition, ClickHouse Keeper is the component used for replication of data. See documentation for ReplicatedMergeTree, Materialized Views and Distributed tables user guides for more advanced methods and options.

