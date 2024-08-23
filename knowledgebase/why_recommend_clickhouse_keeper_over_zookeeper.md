---
date: 2023-06-07
---

# Why is ClickHouse Keeper recommended over ZooKeeper?

ClickHouse Keeper provides the coordination system for data replication and distributed DDL queries execution. ClickHouse Keeper is compatible with ZooKeeper, but it might not be obvious why you should use ClickHouse Keeper instead of ZooKeeper. This article discusses some of the benefits of Keeper.


## Answer

[ClickHouse Cloud](https://clickhouse.cloud/) uses `clickhouse-keeper` at large scale for thousands of services in a multi-tenant environment. We designed and built Keeper so that we could remove our dependency on the Java-based ZooKeeper implementation. ClickHouse Keeper solves many well-known drawbacks of ZooKeeper and makes additional improvements, including:

- Snapshots and logs consume much less disk space due to better compression
- No limit on the default packet and node data size (it is 1 MB in ZooKeeper)
- No `zxid` overflow issue (it forces a restart for every 2B transactions in ZooKeeper)
- Faster recovery after network partitions due to the use of a better distributed consensus protocol
- It uses less memory for the same volume of data
- It is easier to setup, and it does not require specifying the JVM heap size or a custom garbage collection implementation
- A few custom commands in the protocol enable faster operations in `ReplicatedMergeTree` tables
- A larger coverage by Jepsen tests

In addition, ClickHouse Support has observed a massive decrease in cluster problems in cases with sites who use `clickhouse-keeper` rather than ZooKeeper.

Check out the [Keeper docs page](https://clickhouse.com/docs/en/guides/sre/keeper/clickhouse-keeper) for more details on how to configure and run ClickHouse Keeper.