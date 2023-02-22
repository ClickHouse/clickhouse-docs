---
title: Introduction to ClickHouse architecture designs
---

ClickHouse can be run as a single server, or as a cluster of servers.  In this series of documents different architecture options will be detailed for these use cases:
- Getting started / learning
- High availability
- Increased performance / horizontal scalability

## Terminology

### Replication
The process of replicating data from one server to another.  This is a common method to provide high availability of your data with ClickHouse.

### Sharding
The process of dividing data across multiple servers.  This is a common use case for ClickHouse.

## Installation considerations
- Determine the release version to install
- Determine the deployment method to use (servers/ VMs, or Docker)
- Sizing
- High availability requirements

