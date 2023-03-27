---
slug: /en/architecture/introduction
sidebar_label: Introduction
title: Introduction
sidebar_position: 1
---

These deployment examples are based on the advice provided to ClickHouse users by the ClickHouse Support and Services organization.  These are working examples, and we recommend that you try them and then adjust them to suit your needs.  You may find an example here that fits your requirements exactly. Alternatively, you may have a requirement that your data is replicated three times instead of two, you should be able to add another replica by following the patterns presented here.

## Terminology
### Replica 
A copy of data.  ClickHouse always has at least one copy of your data, and so the minimum number of **replicas** is one.  This is an important detail, you may not be used to counting the original copy of your data as a replica, but that is the term used in ClickHouse code and documentation.  Adding a second replica of your data provides fault tolerance. 

### Shard
A subset of data.  ClickHouse always has at least on shard for your data, so if you do not split the data across multiple servers you have one shard.  Sharding data across multiple systems can be used to divide the load if you exceed the capacity of a single server. The destination server is determined by the **sharding key**, which can be random, or it can be determined when you create your table.  The deployment examples that use sharding will use `rand()` as the sharding key, and will provide further information on when and how to choose a different sharding key.

### Distributed synchronization

## Examples

### Basic

- The [**Scaling out**](/docs/en/deployment-guides/horizontal-scaling.md) example shows how to shard your data across two nodes, and use a distributed table.  This results in having data on two ClickHouse nodes.  The two ClickHouse nodes also run ClickHouse Keeper providing distributed synchronization.  A third node runs ClickHouse Keeper standalone to complete the ClickHouse Keeper quorum.

### Intermediate

- The [**Replication with scaling out**](/docs/en/deployment-guides/HA-plus-horizontal-scaling.md) example shows how to shard your data across two nodes, and replicate your data across two nodes.  This results in having data on four ClickHouse nodes.  Additionally, three ClickHouse Keeper nodes are deployed to provide distributed synchronization.

### Advanced

