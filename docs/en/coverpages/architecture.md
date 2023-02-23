---
title: Introduction to ClickHouse architecture designs
---

ClickHouse can be run as a single server, or as a cluster of servers.  In this series of documents different architecture options will be detailed for these use cases:
- Getting started / learning
- High availability
- Increased performance / horizontal scalability

## Terminology

### Replica
A minimal ClickHouse system has one copy (replica) of your data.  If you have a single replica, there is only one copy of your data.

### Replication
The process of replicating data from one server to another.  This is a common method to provide high availability of your data with ClickHouse.

### Sharding
The process of dividing data across multiple servers.  This is a common use case for ClickHouse.

### Environment
Talk about the difference between an *environment* of ClickHouse nodes, and a *cluster* is a grouping or *replicas* and *shards* on specified ClickHouse server nodes.

### Cluster
Talk about the difference between a cluster of servers, and a ClickHouse cluster that its across some of those servers, there can be many Clickhouse clusters across a cluster of machines

## Installation considerations
- Determine the release version to install
- Determine the deployment method to use (servers/ VMs, or Docker)
- Sizing
- High availability requirements

