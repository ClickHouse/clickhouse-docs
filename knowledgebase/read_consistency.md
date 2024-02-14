---
date: 2024-02-14
---

# How to achieve data read consistency in ClickHouse?

## Question

I'm writing data into ClickHouse cloud and need to be able ,when reading data, to guarantee that I'm getting the latest complete information.

## Answer

### Talking to same node

If you are using native protocol, or a session to do your write/read, you should then be connected to the same replica: in this scenario you're reading directly from the node where you're writing, then your read will always be consistent.

### Talking to a random node

If you can't guarantee you're talking to the same node (for example talking to the node via HTTPS calls which get shuffled via the a load load balancer), you can either:

A)

 1. write your data
 2. connect to a new replica
 3. run `SYSTEM SYNC REPLICA LIGHTWEIGHT`
 4. read the latest data

See `SYSTEM` commands [reference](https://clickhouse.com/docs/en/sql-reference/statements/system#sync-replica)

OR

B) read anytime with sequential consistency

```sql
SELECT 
...
SETTINGS select_sequential_consistency = 1
```

note when using ClickHouse Cloud and its default [SharedMergeTree](https://clickhouse.com/docs/en/cloud/reference/shared-merge-tree) Engine, using insert_quorum_parallel is not required (it's a given)

Using [SYSTEM SYNC REPLICAS](https://clickhouse.com/docs/en/sql-reference/statements/system#sync-replica) or [select_sequential_consistency](https://clickhouse.com/docs/en/operations/settings/settings#select_sequential_consistency) will increase the load on ClickHouse Keeper and might have slower performance depending on the load on the service.


The recommended approach is to do the writes/read using the same session or the native protocol (sticky connection).

