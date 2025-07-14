---
slug: /architecture/cluster-deployment
sidebar_label: 'Cluster deployment'
sidebar_position: 100
title: 'Cluster deployment'
description: 'By going through this tutorial, you will learn how to set up a simple ClickHouse cluster.'
---

This tutorial assumes you've already set up a [local ClickHouse server](../getting-started/install/install.mdx)

By going through this tutorial, you'll learn how to set up a simple ClickHouse cluster. It'll be small, but fault-tolerant and scalable. Then we will use one of the example datasets to fill it with data and execute some demo queries.

## Cluster deployment {#cluster-deployment}

This ClickHouse cluster will be a homogeneous cluster. Here are the steps:

1.  Install ClickHouse server on all machines of the cluster
2.  Set up cluster configs in configuration files
3.  Create local tables on each instance
4.  Create a [Distributed table](../engines/table-engines/special/distributed.md)

    A [distributed table](../engines/table-engines/special/distributed.md) is a kind of "view" to the local tables in a ClickHouse cluster. A SELECT query from a distributed table executes using resources of all cluster's shards. You may specify configs for multiple clusters and create multiple distributed tables to provide views for different clusters.

    Here is an example config for a cluster with three shards, with one replica each:

    ```xml
    <remote_servers>
    <perftest_3shards_1replicas>
        <shard>
            <replica>
                <host>example-perftest01j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>example-perftest02j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>example-perftest03j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
    </perftest_3shards_1replicas>
    </remote_servers>
    ```

    For further demonstration, let's create a new local table with the same `CREATE TABLE` query that we used for `hits_v1` in the single node deployment tutorial, but with a different table name:

    ```sql
    CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
    ```

    Creating a distributed table provides a view into the local tables of the cluster:

    ```sql
    CREATE TABLE tutorial.hits_all AS tutorial.hits_local
    ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
    ```

    A common practice is to create similar distributed tables on all machines of the cluster. This allows running distributed queries on any machine of the cluster. There's also an alternative option to create a temporary distributed table for a given SELECT query using [remote](../sql-reference/table-functions/remote.md) table function.

    Let's run [INSERT SELECT](../sql-reference/statements/insert-into.md) into the distributed table to spread the table to multiple servers.

    ```sql
    INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
    ```

    As you would expect, computationally heavy queries run N times faster if they utilize 3 servers instead of one.

    In this case, we use a cluster with 3 shards, and each shard contains a single replica.

    To provide resilience in a production environment, we recommend that each shard contain 2-3 replicas spread between multiple availability zones or datacenters (or at least racks). Note that ClickHouse supports an unlimited number of replicas.

    Here is an example config for a cluster of one shard containing three replicas:

    ```xml
    <remote_servers>
    ...
    <perftest_1shards_3replicas>
        <shard>
            <replica>
                <host>example-perftest01j.clickhouse.com</host>
                <port>9000</port>
             </replica>
             <replica>
                <host>example-perftest02j.clickhouse.com</host>
                <port>9000</port>
             </replica>
             <replica>
                <host>example-perftest03j.clickhouse.com</host>
                <port>9000</port>
             </replica>
        </shard>
    </perftest_1shards_3replicas>
    </remote_servers>
    ```

    To enable native replication [ZooKeeper](http://zookeeper.apache.org/), is required. ClickHouse takes care of data consistency on all replicas and runs a restore procedure after a failure automatically. It's recommended to deploy the ZooKeeper cluster on separate servers (where no other processes including ClickHouse are running).

    :::note Note
    ZooKeeper is not a strict requirement: in some simple cases, you can duplicate the data by writing it into all the replicas from your application code. This approach is **not** recommended, as in this case, ClickHouse won't be able to guarantee data consistency on all replicas. Thus, it becomes the responsibility of your application.
    :::

    ZooKeeper locations are specified in the configuration file:

    ```xml
    <zookeeper>
    <node>
        <host>zoo01.clickhouse.com</host>
        <port>2181</port>
    </node>
    <node>
        <host>zoo02.clickhouse.com</host>
        <port>2181</port>
    </node>
    <node>
        <host>zoo03.clickhouse.com</host>
        <port>2181</port>
    </node>
    </zookeeper>
    ```

    Also, we need to set macros for identifying each shard and replica which are used on table creation:

    ```xml
    <macros>
    <shard>01</shard>
    <replica>01</replica>
    </macros>
    ```

    If there are no replicas at the moment of replicated table creation, a new first replica is instantiated. If there are already live replicas, the new replica clones data from existing ones. You have an option to create all replicated tables first, and then insert data to it. Another option is to create some replicas and add the others after or during data insertion.

    ```sql
    CREATE TABLE tutorial.hits_replica (...)
    ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
    )
    ...
    ```

    Here we use the [ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md) table engine. In parameters, we specify the ZooKeeper path containing the shard and replica identifiers.

    ```sql
    INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
    ```

    Replication operates in multi-master mode. Data can be loaded into any replica, and the system then syncs it with other instances automatically. Replication is asynchronous so at a given moment, not all replicas may contain recently inserted data. At least one replica should be up to allow for data ingestion. Others will sync up data and repair consistency once they become active again. Note that this approach allows for the low possibility of loss of recently inserted data.
