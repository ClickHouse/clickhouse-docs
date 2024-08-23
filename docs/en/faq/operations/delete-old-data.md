---
slug: /en/faq/operations/delete-old-data
title: Is it possible to delete old records from a ClickHouse table?
toc_hidden: true
toc_priority: 20
---

# Is It Possible to Delete Old Records from a ClickHouse Table? {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

The short answer is “yes”. ClickHouse has multiple mechanisms that allow freeing up disk space by removing old data. Each mechanism is aimed for different scenarios.

## TTL {#ttl}

ClickHouse allows to automatically drop values when some condition happens. This condition is configured as an expression based on any columns, usually just static offset for any timestamp column.

The key advantage of this approach is that it does not need any external system to trigger, once TTL is configured, data removal happens automatically in background.

:::note
TTL can also be used to move data not only to [/dev/null](https://en.wikipedia.org/wiki/Null_device), but also between different storage systems, like from SSD to HDD.
:::

More details on [configuring TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).

## DELETE FROM
[DELETE FROM](/docs/en/sql-reference/statements/delete.md) allows standard DELETE queries to be run in ClickHouse. The rows targeted in the filter clause are marked as deleted, and removed from future result sets.  Cleanup of the rows happens asynchronously.

:::note
DELETE FROM is generally available from version 23.3 and newer. On older versions, it is experimental and must be enabled with:
```
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE removes rows using asynchronous batch operations. Unlike DELETE FROM, queries run after the ALTER DELETE and before the batch operations complete will include the rows targeted for deletion.  For more details see the [ALTER DELETE](/docs/en/sql-reference/statements/alter/delete.md) docs.

`ALTER DELETE` can be issued to flexibly remove old data. If you need to do it regularly, the main downside will be the need to have an external system to submit the query. There are also some performance considerations since mutations rewrite complete parts even there is only a single row to be deleted.

This is the most common approach to make your system based on ClickHouse [GDPR](https://gdpr-info.eu)-compliant.

More details on [mutations](../../sql-reference/statements/alter/index.md#alter-mutations).

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` provides a cost-efficient way to drop a whole partition. It’s not that flexible and needs proper partitioning scheme configured on table creation, but still covers most common cases. Like mutations need to be executed from an external system for regular use.

More details on [manipulating partitions](../../sql-reference/statements/alter/partition.md#alter_drop-partition).

## TRUNCATE {#truncate}

It’s rather radical to drop all data from a table, but in some cases it might be exactly what you need.

More details on [table truncation](/docs/en/sql-reference/statements/truncate.md).
