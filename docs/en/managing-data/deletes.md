---
slug: /en/deletes
title: Deleting Data
description: How to delete data in ClickHouse
keywords: [delete, truncate, drop, lightweight delete]
---

There are several ways to delete data in ClickHouse, each with its own advantages and performance characteristics. You should select the appropriate method based on your data model and the amount of data you intend to delete.

| Method | Syntax | When to use |
| --- | --- | --- |
| [Lightweight delete](/en/guides/developer/lightweight-delete) | `DELETE FROM [table]` | Use when deleting small amounts of data. Rows are immediately filtered out of all subsequent SELECT queries but are initially only internally marked as deleted, not removed from disk. |
| [Delete mutation](/en/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | Use when data must be deleted from disk immediately (e.g. for compliance). Negatively affects SELECT performance. |
| [Truncate table](/en/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | Efficiently removes all data from a table. |
| [Drop partition](/en/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | Efficiently removes all data from a partition. |

Here is a summary of the different ways to delete data in ClickHouse:

## Lightweight Deletes

Lightweight deletes cause rows to be immediately marked as deleted such that they can be automatically filtered out of all subsequent `SELECT` queries. Subsequent removal of these deleted rows occurs during natural merge cycles and thus incurs less I/O. As a result, it is possible that for an unspecified period, data is not actually deleted from storage and is only marked as deleted. If you need to guarantee that data is deleted, consider the above mutation command.

```sql
-- delete all data from 2018 with a mutation. Not recommended.
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

Deleting large volumes of data with the lightweight `DELETE` statement can also negatively affect `SELECT` query performance. The command is also not compatible with tables with projections.

Note that a mutation is used in the operation to [mark the deleted rows](/en/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse) (adding a `_row_exists` column), thus incurring some I/O.

In general, lightweight deletes should be preferred over mutations if the existence of the deleted data on disk can be tolerated (e.g. in non-compliance cases). This approach should still be avoided if all data needs to be deleted.

Read more about [lightweight deletes](/en/guides/developer/lightweight-delete).

## Delete Mutations

Delete mutations can be issued through a `ALTER TABLE … DELETE` command e.g. 

```sql
-- delete all data from 2018 with a mutation. Not recommended.
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

These can be executed either synchronously (by default if non-replicated) or asynchronously (determined by the [mutations_sync](/en/operations/settings/settings#mutations_sync) setting). These are extremely IO-heavy, rewriting all the parts that match the `WHERE` expression. There is no atomicity to this process - parts are substituted for mutated parts as soon as they are ready, and a `SELECT` query that starts executing during a mutation will see data from parts that have already been mutated along with data from parts that have not been mutated yet. Users can track the state of the progress via the [systems.mutations](/en/operations/system-tables/mutations#system_tables-mutations) table. These are I/O intense operations and should be used sparingly as they can impact cluster `SELECT` performance.

Read more about [delete mutations](/en/sql-reference/statements/alter/delete).

## Truncate Table

If all data in a table needs to be deleted, use the `TRUNCATE TABLE` command shown below. This is a lightweight operation.

```sql
TRUNCATE TABLE posts
```

Read more about [TRUNCATE TABLE](/en/sql-reference/statements/truncate).

## Drop Partition

If you have specified a custom partitioning key for your data, partitions can be efficiently dropped. Avoid high cardinality partitioning.

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

Read more about [DROP PARTITION](/en/sql-reference/statements/alter/partition).

## More Resources

- [Handling Updates and Deletes in ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
