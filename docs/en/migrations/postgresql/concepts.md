---
sidebar_label: Equivalent and different concepts
sidebar_position: 60
title: Equivalent and different concepts
slug: /en/migrations/postgresql/concepts
description: Equivalent and different concepts
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres, concepts]
---

Users coming from OLTP systems who are used to ACID transactions should be aware that Clickhouse makes deliberate compromises in not fully providing these in exchange for performance. ClickHouse semantics can deliver high durability guarantees and high write throughput if well understood. We highlight some key concepts below that users should be familiar with prior to working with ClickHouse from Postgres.

## Shards vs Replicas

Sharding and replication are two strategies used for scaling beyond one Postgres instance when storage and/or compute become a bottleneck to performance. Sharding in Postgres involves splitting a large database into smaller, more manageable pieces across multiple nodes. However, Postgres does not support sharding natively. Instead, sharding can be achieved using extensions such as [Citus](https://www.citusdata.com/), in which Postgres becomes a distributed database capable of scaling horizontally. This approach allows Postgres to handle higher transaction rates and larger datasets by spreading the load across several machines. Shards can be row or schema-based in order to provide flexibility for workload types, such as transactional or analytical. Sharding can introduce significant complexity in terms of data management and query execution as it requires coordination across multiple machines and consistency guarantees.

Unlike shards, Replicas are additional Postgres instances that contain all or some of the data from the primary node. Replicas are used for various reasons, including enhanced read performance and HA (High Availability) scenarios. Physical replication is a native feature of Postgres that involves copying the entire database or significant portions to another server, including all databases, tables, and indexes. This involves streaming WAL segments from the primary node to replicas over TCP/IP. In contrast, logical replication is a higher level of abstraction that streams changes based on INSERT, UPDATE, and DELETE operations. Although the same outcomes may apply to physical replication, greater flexibility is enabled for targeting specific tables and operations, as well as data transformations and supporting different Postgres versions.

In contrast, **ClickHouse shards** and **replicas** are two key concepts related to data distribution and redundancy. **Clickhouse replicas can be thought of as analogous to Postgres replicas, although replication is eventually consistent with no notion of a primary. Sharding, unlike Postgres, is supported natively.**

A shard is a portion of your table data. You always have at least one shard. Sharding data across multiple servers can be used to divide the load if you exceed the capacity of a single server with all shards used to run a query in parallel. Users can manually create shards for a table on different servers and insert data directly into them. Alternatively, a distributed table can be used with a sharding key defining to which shard data is routed. The sharding key can be random or as an output of a hash function. Importantly, a shard can consist of multiple replicas.

A replica is a copy of your data. ClickHouse always has at least one copy of your data, and so the minimum number of replicas is one. Adding a second replica of your data provides fault tolerance and potentially additional compute for processing more queries ([Parallel Replicas ](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)can also be used to distribute the compute for a single query thus lowering latency). Replicas are achieved with the ReplicatedMergeTree table engine, which enables ClickHouse to keep multiple copies of data in sync across different servers. Replication is physical: only compressed parts are transferred between nodes, not queries.

In summary, a replica is a copy of data that provides redundancy and reliability (and potentially distributed processing), while a shard is a subset of data that allows for distributed processing and load balancing.

:::note Single copy in ClickHouse Cloud
ClickHouse Cloud uses a single copy of data backed in S3 with multiple compute replicas. The data is available to each replica node, each of which has a local SSD cache. This relies on metadata replication only through ClickHouse Keeper.
:::

## Eventual consistency

ClickHouse uses ClickHouse Keeper (C++ ZooKeeper implementation, ZooKeeper can also be used) for managing its internal replication mechanism, focusing primarily on metadata storage and ensuring eventual consistency.  Keeper is used to assign unique sequential numbers for each insert within a distributed environment. This is crucial for maintaining order and consistency across operations. This framework also handles background operations such as merges and mutations, ensuring that the work for these is distributed while guaranteeing they are executed in the same order across all replicas. In addition to metadata, Keeper functions as a comprehensive control center for replication, including tracking checksums for stored data parts, and acts as a distributed notification system among replicas.

The replication process in ClickHouse ① starts when data is inserted into any replica. This data, in its raw insert form, is ② written to disk along with its checksums. Once written, the replica ③ attempts to register this new data part in Keeper by allocating a unique block number and logging the new part's details. Other replicas, upon ④ detecting new entries in the replication log, ⑤ download the corresponding data part via an internal HTTP protocol, verifying it against the checksums listed in ZooKeeper. This method ensures that all replicas eventually hold consistent and up-to-date data despite varying processing speeds or potential delays. Moreover, the system is capable of handling multiple operations concurrently, optimizing data management processes, and allowing for system scalability and robustness against hardware discrepancies.

<img src={require('./images/eventual_consistency.png').default} class="image" alt="Eventual consistency in ClickHouse" style={{width: '100%', marginBottom: '20px', textAlign: 'left'}}/>

Note that ClickHouse Cloud uses a [cloud-optimized replication mechanism](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates) adapted to its separation of storage and compute architecture. By storing data in shared object storage, data is automatically available for all compute nodes without the need to physically replicate data between nodes. Instead, Keeper is used to only share metadata (which data exists where in object storage) between compute nodes.

PostgreSQL employs a different replication strategy compared to ClickHouse, primarily using streaming replication, which involves a primary replica model where data is continuously streamed from the primary to one or more replica nodes. This type of replication ensures near real-time consistency and is synchronous or asynchronous, giving administrators control over the balance between availability and consistency. Unlike ClickHouse, PostgreSQL relies on a WAL (Write-Ahead Logging) with logical replication and decoding to stream data objects and changes between nodes. This approach in PostgreSQL is more straightforward but might not offer the same level of scalability and fault tolerance in highly distributed environments that ClickHouse achieves through its complex use of Keeper for distributed operations coordination and eventual consistency.

### User implications

In ClickHouse, the possibility of dirty reads - where users can write data to one replica and then read potentially unreplicated data from another—arises from its eventually consistent replication model managed via Keeper. This model emphasizes performance and scalability across distributed systems, allowing replicas to operate independently and sync asynchronously. As a result, newly inserted data might not be immediately visible across all replicas, depending on the replication lag and the time it takes for changes to propagate through the system.

Conversely, PostgreSQL's streaming replication model typically can prevent dirty reads by employing synchronous replication options where the primary waits for at least one replica to confirm the receipt of data before committing transactions. This ensures that once a transaction is committed, a guarantee exists that the data is available in another replica. In the event of primary failure, the replica will ensure queries see the committed data, thereby maintaining a stricter level of consistency.

### Recommendations

Users new to ClickHouse should be aware of these differences, which will manifest themselves in replicated environments. Typically, eventual consistency is sufficient in analytics over billions, if not trillions, of data points - where metrics are either more stable or estimation is sufficient as new data is continuously being inserted at high rates.

Several options exist for increasing the consistency of reads should this be required. Both examples require either increased complexity or overhead - reducing query performance and making it more challenging to scale ClickHouse. **We advise these approaches only if absolutely required.**

### Consistent routing

To overcome some of the limitations of eventual consistency, users can ensure clients are routed to the same replicas. This is useful in cases where multiple users are querying ClickHouse and results should be deterministic across requests. While results may differ, as new data inserted, the same replicas should be queried ensuring a consistent view.

This can be achieved through several approaches depending on your architecture and whether you are using ClickHouse OSS or ClickHouse Cloud.

#### ClickHouse Cloud

Communication to the nodes of a ClickHouse Cloud service occurs through a proxy. HTTP and Native protocol connections will be routed to the same node for the period on which they are held open. In the case of HTTP 1.1 connections from most clients, this depends on the Keep-Alive window. This can be configured on most clients e.g. [Node Js](/docs/en/integrations/language-clients/javascript#keep-alive-configuration-nodejs-only). This also requires a server side configuration, which will be higher than the client and is set to 10s in ClickHouse Cloud.

To ensure consistent routing across connections e.g. if using a connection pool or if connections expire, users can either ensure the same connection is used (easier for native) or request the exposure of sticky endpoints. This provides a set of endpoints for each node in the cluster, thus allowing clients to ensure queries are deterministically routed.

:::note Using sticky endpoints
Contact support for access to sticky endpoints.
:::

#### ClickHouse OSS

To achieve this behavior in OSS depends on your shard and replica topology and if you are using a Distributed table for querying.

When you have only one shard and replicas (common since ClickHouse vertically scales), users select the node at the client layer and query a replica directly, ensuring this is deterministically selected.

While topologies with multiple shards and replicas are possible without a distributed table, these advanced deployments typically have their own routing infrastructure. We therefore assume deployments with more than one shard are using a[ Distributed table](/docs/en/engines/table-engines/special/distributed) (distributed tables can be used with single shard deployments but are usually unnecessary).

In this case, users should ensure consistent node routing is performed based on a property e.g. session_id or user_id. The settings [`prefer_localhost_replica=0`](/docs/en/operations/settings/settings#prefer-localhost-replica),[ `load_balancing=in_order`](/docs/en/operations/settings/settings#load_balancing) should be [set in the query](/docs/en/operations/settings/query-level). This will ensure any local replicas of shards are preferred, with replicas preferred as listed in the configuration otherwise - provided they have the same number of errors - failover will occur with random selection if errors are higher. [ `load_balancing=nearest_hostname`](/docs/en/operations/settings/settings#load_balancing) can also be used as an alternative for this deterministic shard selection.

:::note Defining shards & replicas
When creating a Distributed table, users will specify a cluster. This cluster definition, specified in config.xml, will list the shards (and their replicas) - thus allowing users to control the order in which they are used from each node. Using this, users can ensure selection is deterministic.
:::

### Sequential consistency

In exceptional cases users may need sequential consistency.

Sequential consistency in databases is where the operations on a database appear to be executed in some sequential order, and this order is consistent across all processes interacting with the database. This means that every operation appears to take effect instantaneously between its invocation and completion, and there is a single, agreed-upon order in which all operations are observed by any process.

From a user's perspective this typically manifests itself as the need to write data into ClickHouse and when reading data, to guarantee that the latest inserted rows are returned.

This can be achieved in several ways (in order of preference):

1. **Read/Write to the same node** - If you are using native protocol, or a [session to do your write/read via HTTP](/docs/en/interfaces/http#default-database), you should then be connected to the same replica: in this scenario you're reading directly from the node where you're writing, then your read will always be consistent.
2. **Sync replicas manually** - If you write to one replica and read from another, you can use issue `SYSTEM SYNC REPLICA LIGHTWEIGHT` prior to reading.
3. **Enable sequential consistency** - via the query setting [ `select_sequential_consistency = 1`](/docs/en/operations/settings/settings#select_sequential_consistency). In OSS, the setting `insert_quorum = 'auto'` must also be specified.

See[ here](/docs/en/cloud/reference/shared-merge-tree#consistency) for further details on enabling these settings.

:::note Use sequential consistency carefully
Use of sequential consistency will place a greater load on ClickHouse Keeper.  The result can mean slower inserts and reads. SharedMergeTree, used in ClickHouse Cloud as the main table engine, sequential consistency [incurs less overhead and will scale better.](/docs/en/cloud/reference/shared-merge-tree#consistency) OSS users should use this approach cautiously and measure Keeper load.
:::

## Transactional (ACID) support

Users migrating from PostgreSQL may be used to its robust support for ACID (Atomicity, Consistency, Isolation, Durability) properties, making it a reliable choice for transactional databases. Atomicity in PostgreSQL ensures that each transaction is treated as a single unit, which either completely succeeds or is entirely rolled back, preventing partial updates. Consistency is maintained by enforcing constraints, triggers, and rules that guarantee that all database transactions lead to a valid state. Isolation levels, from Read Committed to Serializable, are supported in PostgreSQL, allowing fine-tuned control over the visibility of changes made by concurrent transactions. Lastly, Durability is achieved through write-ahead logging (WAL), ensuring that once a transaction is committed, it remains so even in the event of a system failure.

These properties are common for OLTP databases that act as a source of truth.

While powerful, this comes with inherent limitations and makes PB scales challenging. ClickHouse compromises on these properties in order to provide fast analytical queries at scale while sustaining high write throughput.

ClickHouse provides ACID properties under [limited configurations](/docs/en/guides/developer/transactional) - most simply when using a non-replicated instance of the MergeTree table engine with one partition. Users should not expect these properties outside of these cases and ensure these are not a requirement.

## Partitions

Postgres users will be familiar with the concept of table partitioning for enhancing performance and manageability for large databases by dividing tables into smaller, more manageable pieces called partitions. This partitioning can be achieved using either a range on a specified column (e.g., dates), defined lists, or via hash on a key. This allows administrators to organize data based on specific criteria like date ranges or geographical locations. Partitioning helps in improving query performance by enabling faster data access through partition pruning and more efficient indexing. It also helps maintenance tasks such as backups and data purges by allowing operations on individual partitions rather than the entire table. Additionally, partitioning can significantly improve the scalability of PostgreSQL databases by distributing the load across multiple partitions.

In ClickHouse, partitioning is specified on a table when it is initially defined via the `PARTITION BY` clause. This clause can contain a SQL expression on any column/s, the results of which will define which partition a row is sent to.

<img src={require('./images/partitions.png').default} class="image" alt="Partitions in ClickHouse" style={{width: '100%', marginBottom: '20px', textAlign: 'left'}}/>

The data parts are logically associated with each partition on disk and can be queried in isolation. For the example below, we partition the posts table by year using the expression `toYear(CreationDate)`. As rows are inserted into ClickHouse, this expression will be evaluated against each row and routed to the resulting partition if it exists (if the row is the first for a year, the partition will be created).

```sql
CREATE TABLE posts
(
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	`PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
	`AcceptedAnswerId` UInt32,
	`CreationDate` DateTime64(3, 'UTC'),
    ...
	`ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

### Applications

Partitioning in ClickHouse has similar applications as in Postgres but with some subtle differences. More specifically:

* **Data management** - In ClickHouse, users should principally consider partitioning to be a data management feature, not a query optimization technique. By separating data logically based on a key, each partition can be operated on independently e.g. deleted. This allows users to move partitions, and thus subnets, between [storage tiers](/docs/en/integrations/s3#storage-tiers) efficiently on time or [expire data/efficiently delete from the cluster](/docs/en/sql-reference/statements/alter/partition). In example, below we remove posts from 2008.

  ```sql
  SELECT DISTINCT partition
  FROM system.parts
  WHERE `table` = 'posts'

  ┌─partition─┐
  │ 2008  	│
  │ 2009  	│
  │ 2010  	│
  ...
  │ 2023  	│
  │ 2024  	│
  └───────────┘

  17 rows in set. Elapsed: 0.002 sec.

  	ALTER TABLE posts
  	(DROP PARTITION '2008')

  Ok.

  0 rows in set. Elapsed: 0.103 sec.
  ```

* **Query optimization** - While partitions can assist with query performance, this depends heavily on the access patterns. If queries target only a few partitions (ideally one), performance can potentially improve. This is only typically useful if the partitioning key is not in the primary key and you are filtering by it. However, queries that need to cover many partitions may perform worse than if no partitioning is used (as there may possibly be more parts as a result of partitioning). The benefit of targeting a single partition will be even less pronounced to non-existence if the partitioning key is already an early entry in the primary key. Partitioning can also be used to [optimize GROUP BY queries](/docs/en/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) if values in each partition are unique. However, in general, users should ensure the primary key is optimized and only consider partitioning as a query optimization technique in exceptional cases where access patterns access a specific predictable subset of the day, e.g. partitioning by day, with most queries in the last day.

### Recommendations

Users should consider partitioning a data management technique. It is ideal when data needs to be expired from the cluster when operating with time series data e.g. the oldest partition can [simply be dropped](/docs/en/sql-reference/statements/alter/partition#alter_drop-partition).

**Important:** Ensure your partitioning key expression does not result in a high cardinality set i.e. creating more than 100 partitions should be avoided. For example, do not partition your data by high cardinality columns such as client identifiers or names. Instead, make a client identifier or name the first column in the ORDER BY expression.

:::note Sparse primary indexes
Internally, ClickHouse [creates parts](/docs/en/optimize/sparse-primary-indexes#clickhouse-index-design) for inserted data. As more data is inserted, the number of parts increases. In order to prevent an excessively high number of parts, which will degrade query performance (more files to read), parts are merged together in a background asynchronous process. If the number of parts exceeds a pre-configured[ limit](/docs/en/operations/settings/merge-tree-settings#parts-to-throw-insert), then ClickHouse will throw an exception on insert - as a ["too many parts"](/docs/knowledgebase/exception-too-many-parts) error. This should not happen under normal operation and only occurs if ClickHouse is misconfigured or used incorrectly e.g. many small inserts. Since parts are created per partition in isolation, increasing the number of parts causes the number of parts to increase i.e. it is a multiple of the number of partitions. High cardinality partitioning keys can, therefore, cause this error and should be avoided.
:::

## Materialized views vs projections

Postgres allows for the creation of multiple indices on a single table, enabling optimization for a variety of access patterns. This flexibility allows administrators and developers to tailor database performance to specific queries and operational needs. ClickHouse’s concept of projections, while not fully analogous to this, allows users to specify multiple `ORDER BY` clauses for a table.

In [ClickHouse data modeling](/docs/en/data-modeling/schema-design) we explore how materialized views can be used in ClickHouse to pre-compute aggregations, transform rows, and optimize queries for different access patterns. For the latter of these [we provided an example](/docs/en/materialized-view#lookup-table) where the materialized view sends rows to a target table with a different ordering key than the original table receiving inserts.

For example, consider the following query:

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

This query requires all 90m rows to be scanned (admittedly quickly) as the UserId is not the ordering key. Previously we solved this using a materialized view acting as a lookup for the PostId. The same problem can be solved with a projection. The command below adds a projection for the `ORDER BY user_id`.

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

Note we have to first create the projection and then materialize it. This latter command causes the data to be stored twice on disk in two different orders. The projection can also be defined when the data is created, as shown below, and will be automatically maintained as data is inserted.

```sql
CREATE TABLE comments
(
	Id UInt32,
	PostId UInt32,
	Score UInt16,
	Text String,
	CreationDate DateTime64(3, 'UTC'),
	UserId Int32,
	UserDisplayName LowCardinality(String),
	PROJECTION comments_user_id
	(
    	SELECT *
    	ORDER BY UserId
	)
)
ENGINE = MergeTree
ORDER BY PostId
```

If the projection is created via an `ALTER` the creation is asynchronous when the `MATERIALIZE PROJECTION` command is issued. Users can confirm the progress of this operation with the following query, waiting for `is_done=1`.

```sql
SELECT
	parts_to_do,
	is_done,
	latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
│       1     │   	0   │                	 │
└─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

If we repeat the above query, we can see performance has improved significantly at the expense of additional storage.

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌──────────avg(Score)─┐
│ 0.18181818181818182 │
└─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

With an [`EXPLAIN`](/docs/en/sql-reference/statements/explain) command, we also confirm the projection was used to serve this query:


```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

┌─explain─────────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))     	  │
│   Aggregating                                   	  │
│ 	Filter                                      	  │
│   	ReadFromMergeTree (comments_user_id)      	  │
│   	Indexes:                                  	  │
│     	PrimaryKey                              	  │
│       	Keys:                                 	  │
│         	UserId                              	  │
│       	Condition: (UserId in [8592047, 8592047]) │
│       	Parts: 2/2                            	  │
│       	Granules: 2/11360                     	  │
└─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### When to use projections

Projections are an appealing feature for new users as they are automatically maintained as data is inserted. Furthermore, queries can just be sent to a single table where the projections are exploited where possible to speed up the response time.

<img src={require('./images/projections.png').default} class="image" alt="Projections in ClickHouse" style={{width: '100%', marginBottom: '20px', textAlign: 'left'}}/>

This is in contrast to Materialized views, where the user has to select the appropriate optimized target table or rewrite their query, depending on the filters. This places greater emphasis on user applications and increases client-side complexity.

Despite these advantages, projections come with some inherent limitations which users should be aware of and thus should be deployed sparingly.

* Projections don't allow to use different TTL for the source table and the (hidden) target table, materialized views allow different TTLs.
* Projections [don't](/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) currently support optimize_read_in_order for the (hidden) target table.
* Lightweight updates and deletes are not supported for tables with projections.
* Materialized views can be chained: the target table of one materialized view can be the source table of another materialized view, and so on. This is not possible with projections.
* Projections don't support joins; materialized views do.
* Projections don't support filters (`WHERE` clause); materialized views do.

We recommend using projections when:

* A complete reordering of the data is required. While the expression in the projection can, in theory, use a `GROUP BY,` materialized views are more effective for maintaining aggregates. The query optimizer is also more likely to exploit projections that use a simple reordering, i.e., `SELECT * ORDER BY x`. Users can select a subset of columns in this expression to reduce storage footprint.
* Users are comfortable with the associated increase in storage footprint and overhead of writing data twice. Test the impact on insertion speed and[ evaluate the storage overhead](/docs/en/data-compression).
