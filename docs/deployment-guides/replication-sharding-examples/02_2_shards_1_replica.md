---
slug: /architecture/horizontal-scaling
sidebar_label: 'Scaling'
sidebar_position: 10
title: 'Scaling'
description: 'Page describing an example architecture designed to provide scalability'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import scalingOut1 from '@site/static/images/deployment-guides/scaling-out-1.png';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';

> In this example, you'll learn how to set up a simple ClickHouse cluster which
scales. It includes three nodes: two combined ClickHouse plus coordination (ClickHouse Keeper) servers,
and a third server with only ClickHouse Keeper to finish the quorum of three. 
With this example, we'll create a database, table, and a distributed table that
will be able to query the data on both of the nodes.

The architecture of the cluster you will be setting up is shown below:

<Image img={scalingOut1} size='md' alt='Architecture diagram for 2 shards and 1 replica' />

<DedicatedKeeperServers/>

## Prerequisites {#pre-requisites}

- You've set up a [local ClickHouse server](../getting-started/install/install.mdx) before
- You are familiar with basic configuration concepts of ClickHouse such as [configuration files](/operations/configuration-files)
- You have docker installed on your machine

<VerticalStepper level="h2">

## Set up directory structure and test environment {#set-up}

In this tutorial, you will use [Docker compose](https://docs.docker.com/compose/) to
set up the ClickHouse cluster. This setup could be modified to work
for separate local machines, virtual machines or cloud instances as well.

Run the following commands to set up the directory structure for this example:

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R

# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done

# Create clickhouse-server directories
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

Add the following `docker-compose.yml` file to the `clickhouse-cluster` directory:

```yaml title="docker-compose.yml"

```

Create the following sub-directories and files:

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## Configure ClickHouse nodes {#configure-clickhouse-servers}

### Server setup {#cluster-configuration}

Now modify each empty configuration file `config.xml` located at
`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. The lines which are
highlighted below need to be changed to be specific to each node:

```xml

```

| Directory                                                 | File                                                                                                                                                                              |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |

Each section of the above configuration file is explained in more detail below.

#### Networking and logging {#networking}

<ListenHost/>

Logging is defined in the `<logger>` block. This example configuration gives
you a debug log that will roll over at 1000M three times:

```xml

```

For more information on logging configuration, see the comments included in the
default ClickHouse [configuration file](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

#### Cluster configuration {#cluster-configuration}

Configuration for the cluster is set up in the `<remote_servers>` block.
Here the cluster name `cluster_1S_2R` is defined.

The `<cluster_1S_2R></cluster_1S_2R>` block defines the layout of the cluster,
using the `<shard></shard>` and `<replica></replica>` settings, and acts as a
template for distributed DDL queries, which are queries that execute across the
cluster using the `ON CLUSTER` clause. By default, distributed DDL queries
are allowed, but can also be turned off with setting `allow_distributed_ddl_queries`.

`internal_replication` is set to true so that data is written to just one of the replicas.

```xml

```

<ServerParameterTable/>

#### Keeper configuration {#keeper-config-explanation}

The `<ZooKeeper>` section tells ClickHouse where ClickHouse Keeper (or ZooKeeper) is running.
As we are using a ClickHouse Keeper cluster, each `<node>` of the cluster needs to be specified,
along with its hostname and port number using the `<host>` and `<port>` tags respectively.

Set up of ClickHouse Keeper is explained in the next step of the tutorial.

```xml

```

:::note
Although it is possible to run ClickHouse Keeper on the same server as ClickHouse Server,
in production environments we strongly recommend that ClickHouse Keeper runs on dedicated hosts.
:::

#### Macros configuration {#macros-config-explanation}

Additionally, the `<macros>` section is used to define parameter substitutions for
replicated tables. These are listed in `system.macros` and allow using substitutions
like `{shard}` and `{replica}` in queries.

```xml

```

:::note
These will be defined uniquely depending on the layout of the cluster.
:::

### User configuration {#user-config}

Now modify each empty configuration file `users.xml` located at
`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` with the following:

```xml title="/users.d/users.xml"

```

| Directory                                                 | File                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

In this example, the default user is configured without a password for simplicity.
In practice, this is discouraged.

:::note
In this example, each `users.xml` file is identical for all nodes in the cluster.
:::

## Configure ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Keeper setup {#configuration-explanation}

<KeeperConfig/>

| Directory                                                        | File                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

## Test the setup {#test-the-setup}


## Create a database {#creating-a-database}


## Create a table on the cluster {#creating-a-table}


## Insert data {#inserting-data}


</VerticalStepper>

## Conclusion {#conclusion}



