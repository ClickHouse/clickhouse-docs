## Terminology
### Replica 
A copy of data.  ClickHouse always has at least one copy of your data, and so the minimum number of **replicas** is one.  This is an important detail, you may not be used to counting the original copy of your data as a replica, but that is the term used in ClickHouse code and documentation.  Adding a second replica of your data provides fault tolerance. 

### Shard
A subset of data.  ClickHouse always has at least on shard for your data, so if you do not split the data across multiple servers you have one shard.  Sharding data across multiple systems can be used to divide the load if you exceed the capacity of a single server. The destination server is determined by the **sharding key**, which can be random, or it can be determined when you create your table.  The deployment examples that use sharding will use `rand()` as the sharding key, and will provide further information on when and how to choose a different sharding key.

### Distributed coordination
ClickHouse Keeper provides the coordination system for data replication and distributed DDL queries execution. ClickHouse Keeper is compatible with Apache ZooKeeper.
