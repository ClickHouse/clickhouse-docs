---
slug: /en/guides/developer/shared-merge-tree
sidebar_label: SharedMergeTree
title: SharedMergeTree
keywords: [shared merge tree sharedmergetree engine]
---

# SharedMergeTree Table Engine

*\* Available exclusively in ClickHouse Cloud (and first party partner cloud services)*

The SharedMergeTree (SMT) table engine belongs to the family of MergeTree table engines. Designed to work natively on top of object storage (e.g. S3, GCS, MinIO, Azure Blob Storage, Cloudflare R2) within architectures that separate compute and storage. The SharedMergeTree table engine can also be extended to all the other table engine from the MergeTree table engine family, like the SharedReplacingMergeTree, SharedAggregatingMergeTree, etc.

SharedMergeTree provides a replacement to the ReplicatedMergeTree table engine in ClickHouse Cloud. For an end-user, it is identical in behavior and usage to the ReplicatedMergeTree table engine, while providing additional benefits:
- Higher insert throughput
- Improved throughput of background merges
- Improved throughput of mutations
- Faster scale-up and scale-down operations
- More lightweight strong consistency for select queries

A significant improvement that the SharedMergeTree brings is that it provides a deeper separation of compute and storage compared to the ReplicatedMergeTree. You can see below how the ReplicatedMergeTree separate the compute and storage: 

![ReplicatedMergeTree Diagram](./images/shared-merge-tree-1.png)

As you can see, even though the data stored in the ReplicatedMergeTree are in the object storage, the metadata are still residing on each of the ClickHouse servers. This means that for every replicated operations, metadata also needs to be replicated on all replicas.

![ReplicatedMergeTree Diagram with Metadata](./images/shared-merge-tree-2.png)

Unlike ReplicatedMergeTree, SharedMergeTree doesn't require replicas to communicate with each other. Instead, all communication happens through shared storage and clickhouse-keeper. SharedMergeTree implements asynchronous leaderless replication and uses clickhouse-keeper for coordination and metadata storage. This means that metadata doesn’t need to be replicated as your service scales up and down. This leads to faster replication, mutation, merges and scale-up operations. SharedMergeTree allows for hundreds of replicas for each table, making it possible to dynamically scale without shards. For distributed query execution, the parallel replicas approach must be applied.

## Introspection

Most of the system tables used for introspection of ReplicatedMergeTree also work for SharedMergeTree, except for `system.replication_queue` and `system.replicated_fetches`. However, SharedMergeTree has corresponding alternatives for these two tables.

**system.virtual_parts**

This table serves as a SharedMergeTree’s alternative to `system.replication_queue`. It stores information about the most recent set of current parts, as well as future parts in progress such as merges, mutations, and dropped partitions.


**system.shared_merge_tree_fetches**

This table is a SharedMergeTree’s alternative to `system.replicated_fetches`. It contains information about current in-progress fetches of primary keys and checksums into memory.

## Enabling SharedMergeTree

By default, `SharedMergeTree` is the default table engine in all the development environments and can be enabled in production environments via support request: https://clickhouse.cloud/support.

Once enabled, you can create a table using SharedMergeTree. The arguments of the engine and their semantics are the same as those for ReplicatedMergeTree. To enable SharedMergeTree in your production environment, you need to enable `allow_experimental_shared_merge_tree`. You can enable it at the session level:

```sql
SET allow_experimental_shared_merge_tree = 1;
```

This will allow you to create a SharedMergeTree table only during the ongoing session. 

```sql
ALTER USER myUser SETTINGS allow_experimental_shared_merge_tree = 1;
```

The command above allows the user `myUser` to create new tables using the SharedMergeTree table engine. Finally, you can run:

```sql
SET allow_experimental_shared_merge_tree = 1;

CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = SharedMergeTree
ORDER BY key 
SETTINGS allow_experimental_shared_merge_tree = 1;
```

This will create the table `my_table` using the SharedMergeTree table engine.

## Settings

Each MergeTree table engine has its own set of settings, and some settings are common to all engines. However, for the SharedMergeTree, certain settings do not work because they are not applicable. These settings include:

 - `max_replicated_logs_to_keep`
 - `min_replicated_logs_to_keep`
 - `prefer_fetch_merged_part_time_threshold`
 - `prefer_fetch_merged_part_size_threshold`
 - `execute_merges_on_single_replica_time_threshold`
 - `remote_fs_execute_merges_on_single_replica_time_threshold`
 - `try_fetch_recompressed_part_timeout`
 - `always_fetch_merged_part`
 - `replicated_fetches_http_connection_timeout`
 - `replicated_fetches_http_send_timeout`
 - `replicated_fetches_http_receive_timeout`
 - `detach_not_byte_identical_parts`
 - `detach_old_local_parts_when_cloning_replica`
 - `max_replicated_fetches_network_bandwidth`
 - `max_replicated_sends_network_bandwidth`
 - `allow_remote_fs_zero_copy_replication`

In addition, there are some special SharedMergeTree settings that apply only to the SharedMergeTree:
 - `cleanup_threads` -- the number of threads used to mark outdated parts
 - `kill_delay_period` -- the period for checking and removing outdated parts from S3 and Keeper
 - `kill_delay_period_random_add` -- a value added to `kill_delay_period` to avoid a "thundering herd effect" and subsequent Denial of Service (DoS) of ClickHouse-Keeper when there are a large number of tables
 - `kill_threads` -- the number of threads used to remove outdated parts
 - `shared_merge_tree_disable_merges_and_mutations_assignment` -- stops merge assignment for shared merge tree, intended for testing purposes only.

Some settings behavior is significantly changed:
- `insert_quorum` -- all inserts to SharedMergeTree are quorum inserts (written to shared storage) so this setting is not needed when using SharedMergeTree table engine. 
