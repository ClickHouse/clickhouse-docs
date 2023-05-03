---
date: 2023-05-02
---

# DB::Exception: Part XXXXX intersects previous part YYYYY. It is a bug or a result of manual intervention in the ZooKeeper data.

When this error occurs, a table shows as readonly and the error states intersecting parts. You can see the error in the logs or by

```sql
SELECT *
FROM system.replicas
WHERE is_readonly = 1
```

The error message looks like:

```
Code: 49. DB::Exception: Part XXXXX intersects previous part YYYYY. It is a bug or a result of manual intervention in the ZooKeeper data. (LOGICAL_ERROR) (version 21.12.4.1 (official build))
```

## Cause of the Error

This error can be caused by a race condition between `mergeSelectingTask` and queue reinitialization.

## Solution

Execute the following queries on all replicas:

```sql
DETACH TABLE table_name;  -- Required for DROP REPLICA

SYSTEM DROP REPLICA 'replica_name' FROM ZK PATH '/table_path_in_zk/'; -- It will remove everything from /table_path_in_zk

ATTACH TABLE table_name;  -- Table will be in readonly mode, because there is no metadata in ZK
```

Then execute the following on all replicas:

```sql
SYSTEM RESTORE REPLICA table_name;  -- It will detach all partitions, re-create metadata in ZK (like it's new empty table), and then attach all partitions back

SYSTEM SYNC REPLICA table_name; -- Wait for replicas to synchronize parts. Also it's recommended to check `system.detached_parts` on all replicas after recovery is finished.
```

:::tip
You should upgrade to the latest version of ClickHouse
:::


## Additional resources

Related PRs and GitHub issues:

- [ClickHouse/ClickHouse#34096](https://github.com/ClickHouse/ClickHouse/pull/34096)
- [ClickHouse/ClickHouse#30651](https://github.com/ClickHouse/ClickHouse/pull/30651)
- [ClickHouse/ClickHouse#31060](https://github.com/ClickHouse/ClickHouse/pull/31060)
- [ClickHouse/ClickHouse#35863](https://github.com/ClickHouse/ClickHouse/issues/35863)

## Versions affected:
ClickHouse v 22.12 and prior