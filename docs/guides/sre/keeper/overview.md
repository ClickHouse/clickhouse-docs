---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'Overview'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper, or clickhouse-keeper, replaces ZooKeeper and provides replication and coordination.'
title: 'ClickHouse Keeper'
doc_type: 'overview'
---


import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper provides the coordination system for data [replication](/engines/table-engines/mergetree-family/replication.md) and [distributed DDL](/sql-reference/distributed-ddl.md) queries execution. ClickHouse Keeper is compatible with ZooKeeper.

### Implementation details {#implementation-details}

ZooKeeper is one of the first well-known open-source coordination systems. It's implemented in Java, and has a simple and powerful data model. ZooKeeper's coordination algorithm, ZooKeeper Atomic Broadcast (ZAB), doesn't provide linearizability guarantees for reads, because each ZooKeeper node serves reads locally. Unlike ZooKeeper, ClickHouse Keeper is written in C++ and uses the [RAFT algorithm](https://raft.github.io/) [implementation](https://github.com/eBay/NuRaft). This algorithm allows linearizability for reads and writes, and has several open-source implementations in different languages.

By default, ClickHouse Keeper provides the same guarantees as ZooKeeper: linearizable writes and non-linearizable reads. It has a compatible client-server protocol, so any standard ZooKeeper client can be used to interact with ClickHouse Keeper. Snapshots and logs have an incompatible format with ZooKeeper, but the `clickhouse-keeper-converter` tool enables the conversion of ZooKeeper data to ClickHouse Keeper snapshots. The interserver protocol in ClickHouse Keeper is also incompatible with ZooKeeper so a mixed ZooKeeper / ClickHouse Keeper cluster is impossible.

ClickHouse Keeper supports Access Control Lists (ACLs) the same way as [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) does. ClickHouse Keeper supports the same set of permissions and has the identical built-in schemes: `world`, `auth` and `digest`. The digest authentication scheme uses the pair `username:password`, the password is encoded in Base64.

:::note
External integrations aren't supported.
:::
