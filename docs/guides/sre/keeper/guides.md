---
slug: /guides/sre/keeper/guides

sidebar_label: 'Guides'
sidebar_position: 40
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper', 'user guide', 'uuid', 'reconfiguration', 'cluster']
description: 'Practical guides for ClickHouse Keeper including cluster setup, unique paths, dynamic reconfiguration, and cluster expansion.'
title: 'ClickHouse Keeper Guides'
doc_type: 'guide'
---


import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## ClickHouse Keeper user guide {#clickhouse-keeper-user-guide}

This guide provides simple and minimal settings to configure ClickHouse Keeper with an example on how to test distributed operations. This example is performed using 3 nodes on Linux.

### 1. Configure nodes with Keeper settings {#1-configure-nodes-with-keeper-settings}

1. Install 3 ClickHouse instances on 3 hosts (`chnode1`, `chnode2`, `chnode3`). (View the [Quick Start](/getting-started/install/install.mdx) for details on installing ClickHouse.)

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
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>chnode2.domain.com</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>3</id>
                <hostname>chnode3.domain.com</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
    ```

    These are the basic settings used above:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |port to be used by clients of keeper|9181 default equivalent of 2181 as in zookeeper|
    |server_id| identifier for each ClickHouse Keeper server used in raft configuration| 1|
    |coordination_settings| section to parameters such as timeouts| timeouts: 10000, log level: trace|
    |server    |definition of server participating|list of each server definition|
    |raft_configuration| settings for each server in the keeper cluster| server and settings for each|
    |id      |numeric id of the server for keeper services|1|
    |hostname   |hostname, IP or FQDN of each server in the keeper cluster|`chnode1.domain.com`|
    |port|port to listen on for interserver keeper connections|9234|

4.  Enable the Zookeeper component. It will use the ClickHouse Keeper engine:
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
    |host|hostname, IP or FQDN of each ClickHouse keeper node| `chnode1.domain.com`|
    |port|ClickHouse Keeper client port| 9181|

5. Restart ClickHouse and verify that each Keeper instance is running. Execute the following command on each server. The `ruok` command returns `imok` if Keeper is running and healthy:
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. The `system` database has a table named `zookeeper` that contains the details of your ClickHouse Keeper instances. Let's view the table:
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```

    The table looks like:
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```

### 2.  Configure a cluster in ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. Let's configure a simple cluster with 2 shards and only one replica on 2 of the nodes. The third node will be used to achieve a quorum for the requirement in ClickHouse Keeper. Update the configuration on `chnode1` and `chnode2`. The following cluster defines 1 shard on each node for a total of 2 shards with no replication. In this example, some of the data will be on node and some will be on the other node:
    ```xml
        <remote_servers>
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
        </remote_servers>
    ```

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |shard   |list of replicas on the cluster definition|list of replicas for each shard|
    |replica|list of settings for each replica|settings entries for each replica|
    |host|hostname, IP or FQDN of server that will host a replica shard|`chnode1.domain.com`|
    |port|port used to communicate using the native tcp protocol|9000|
    |user|username that will be used to authenticate to the cluster instances|default|
    |password|password for the user define to allow connections to cluster instances|`ClickHouse123!`|

2. Restart ClickHouse and verify the cluster was created:
    ```sql
    SHOW clusters;
    ```

    You should see your cluster:
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```

### 3. Create and test distributed table {#3-create-and-test-distributed-table}

1.  Create a new database on the new cluster using ClickHouse client on `chnode1`. The `ON CLUSTER` clause automatically creates the database on both nodes.
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. Create a new table on the `db1` database. Once again, `ON CLUSTER` creates the table on both nodes.
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. On the `chnode1` node, add a couple of rows:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. Add a couple of rows on the `chnode2` node:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. Notice that running a `SELECT` statement on each node only shows the data on that node. For example, on `chnode1`:
    ```sql
    SELECT *
    FROM db1.table1
    ```

    ```response
    Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

    ┌─id─┬─column1─┐
    │  1 │ abc     │
    │  2 │ def     │
    └────┴─────────┘

    2 rows in set. Elapsed: 0.006 sec.
    ```

    On `chnode2`:
6.
    ```sql
    SELECT *
    FROM db1.table1
    ```

    ```response
    Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

    ┌─id─┬─column1─┐
    │  3 │ ghi     │
    │  4 │ jkl     │
    └────┴─────────┘
    ```

6. You can create a `Distributed` table to represent the data on the two shards. Tables with the `Distributed` table engine don't store any data of their own, but allow distributed query processing on multiple servers. Reads hit all the shards, and writes can be distributed across the shards. Run the following query on `chnode1`:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. Notice querying `dist_table` returns all four rows of data from the two shards:
    ```sql
    SELECT *
    FROM db1.dist_table
    ```

    ```response
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

### Summary {#summary}

This guide demonstrated how to set up a cluster using ClickHouse Keeper. With ClickHouse Keeper, you can configure clusters and define distributed tables that can be replicated across shards.

## Configuring ClickHouse Keeper with unique paths {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### Description {#description}

This article describes how to use the built-in `{uuid}` macro setting
to create unique entries in ClickHouse Keeper or ZooKeeper. Unique
paths help when creating and dropping tables frequently because
this avoids having to wait several minutes for Keeper garbage collection
to remove path entries as each time a path is created a new `uuid` is used
in that path; paths are never reused.

### Example environment {#example-environment}
A three node cluster that will be configured to have ClickHouse Keeper
on all three nodes, and ClickHouse on two of the nodes. This provides
ClickHouse Keeper with three nodes (including a tiebreaker node), and
a single ClickHouse shard made up of two replicas.

|node|description|
|-----|-----|
|`chnode1.marsnet.local`|data node - cluster `cluster_1S_2R`|
|`chnode2.marsnet.local`|data node - cluster `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeper tie breaker node|

Example config for cluster:
```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
```

### Procedures to set up tables to use `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. Configure Macros on each server
example for server 1:
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
Notice that we define macros for `shard` and `replica`, but that `{uuid}` isn't defined here — it's built-in and there is no need to define it.
:::

2. Create a Database

```sql
CREATE DATABASE db_uuid
      ON CLUSTER 'cluster_1S_2R'
      ENGINE Atomic;
```

```response
CREATE DATABASE db_uuid ON CLUSTER cluster_1S_2R
ENGINE = Atomic

Query id: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. Create a table on the cluster using the macros and `{uuid}`

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}' )
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Query id: 8f542664-4548-4a02-bd2a-6f2c973d0dc4

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4.  Create a distributed table

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
```

```response
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1')

Query id: 3bc7f339-ab74-4c7d-a752-1ffe54219c0e

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

### Testing {#testing}
1.  Insert data into first node (e.g `chnode1`)
```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

2. Insert data into second node (e.g., `chnode2`)
```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

3. View records using distributed table
```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

Query id: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.007 sec.
```

### Alternatives {#alternatives}
The default replication path can be defined beforehand by macros and using also `{uuid}`

1. Set default for tables on each node
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
You can also define a macro `{database}` on each node if nodes are used for certain databases.
:::

2. Create table without explicit parameters:
```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 1.175 sec.
```

3. Verify it used the settings used in default config
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

1 row in set. Elapsed: 0.003 sec.
```

### Troubleshooting {#troubleshooting}

Example command to get table information and UUID:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

Example command to get information about the table in zookeeper with UUID for the table above
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
Database must be `Atomic`, if upgrading from a previous version, the
`default` database is likely of `Ordinary` type.
:::

To check:

For example,

```sql
SELECT name, engine FROM system.databases WHERE name = 'db_uuid';
```

```response
SELECT
    name,
    engine
FROM system.databases
WHERE name = 'db_uuid'

Query id: b047d459-a1d2-4016-bcf9-3e97e30e49c2

┌─name────┬─engine─┐
│ db_uuid │ Atomic │
└─────────┴────────┘

1 row in set. Elapsed: 0.004 sec.
```

## ClickHouse Keeper dynamic reconfiguration {#reconfiguration}

<SelfManaged />

### Description {#description-1}

ClickHouse Keeper partially supports ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
command for dynamic cluster reconfiguration if `keeper_server.enable_reconfiguration` is turned on.

:::note
If this setting is turned off, you may reconfigure the cluster by altering the replica's `raft_configuration`
section manually. Make sure you the edit files on all replicas as only the leader will apply changes.
Alternatively, you can send a `reconfig` query through any ZooKeeper-compatible client.
:::

A virtual node `/keeper/config` contains last committed cluster configuration in the following format:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- Each server entry is delimited by a newline.
- `server_type` is either `participant` or `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) doesn't participate in leader elections).
- `server_priority` is a non-negative integer telling [which nodes should be prioritised on leader elections](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md).
  Priority of 0 means server will never be a leader.

Example:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

You can use `reconfig` command to add new servers, remove existing ones, and change existing servers'
priorities, here are examples (using `clickhouse-keeper-client`):

```bash
# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Remove two other servers
reconfig remove "3,4"
# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

And here are examples for `kazoo`:

```python
# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")

# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

Servers in `joining` should be in server format described above. Server entries should be delimited by commas.
While adding new servers, you can omit `server_priority` (default value is 1) and `server_type` (default value
is `participant`).

If you want to change existing server priority, add it to `joining` with target priority.
Server host, port, and type must be equal to existing server configuration.

Servers are added and removed in order of appearance in `joining` and `leaving`.
All updates from `joining` are processed before updates from `leaving`.

There are some caveats in Keeper reconfiguration implementation:

- Only incremental reconfiguration is supported. Requests with non-empty `new_members` are declined.

  ClickHouse Keeper implementation relies on NuRaft API to change membership dynamically. NuRaft has a way to
  add a single server or remove a single server, one at a time. This means each change to configuration
  (each part of `joining`, each part of `leaving`) must be decided on separately. Thus there is no bulk
  reconfiguration available as it would be misleading for end users.

  Changing server type (participant/learner) isn't possible either as it's not supported by NuRaft, and
  the only way would be to remove and add server, which again would be misleading.

- You can't use the returned `znodestat` value.
- The `from_version` field isn't used. All requests with set `from_version` are declined.
  This is due to the fact `/keeper/config` is a virtual node, which means it isn't stored in
  persistent storage, but rather generated on-the-fly with the specified node config for every request.
  This decision was made as to not duplicate data as NuRaft already stores this config.
- Unlike ZooKeeper, there is no way to wait on cluster reconfiguration by submitting a `sync` command.
  New config will be _eventually_ applied but with no time guarantees.
- `reconfig` command may fail for various reasons. You can check cluster's state and see whether the update
  was applied.

## Converting a single-node keeper into a cluster {#converting-a-single-node-keeper-into-a-cluster}

Sometimes it's necessary to extend experimental keeper node into a cluster. Here's a scheme of how to do it step-by-step for 3 nodes cluster:

- **IMPORTANT**: new nodes must be added in batches less than the current quorum, otherwise they will elect a leader among them. In this example one by one.
- The existing keeper node must have `keeper_server.enable_reconfiguration` configuration parameter turned on.
- Start a second node with the full new configuration of keeper cluster.
- After it's started, add it to the node 1 using [`reconfig`](#reconfiguration).
- Now, start a third node and add it using [`reconfig`](#reconfiguration).
- Update the `clickhouse-server` configuration by adding new keeper node there and restart it to apply the changes.
- Update the raft configuration of the node 1 and, optionally, restart it.

To get confident with the process, here's a [sandbox repository](https://github.com/ClickHouse/keeper-extend-cluster).
