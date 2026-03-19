---
sidebar_label: 'Reference'
slug: /integrations/fivetran/reference
sidebar_position: 3
description: 'Type mappings, table engine details, metadata columns, and debugging queries for the Fivetran ClickHouse destination.'
title: 'Fivetran ClickHouse Destination - Technical Reference'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'type mapping', 'SharedReplacingMergeTree', 'deduplication', 'FINAL', 'reference']
---

# Fivetran ClickHouse Destination - Technical Reference

## Type transformation mapping {#type-mapping}

The Fivetran ClickHouse destination maps [Fivetran data types](https://fivetran.com/docs/destinations#datatypes) to ClickHouse types as follows:

| Fivetran type | ClickHouse type |
|---------------|-----------------|
| BOOLEAN | [Bool](/sql-reference/data-types/boolean) |
| SHORT | [Int16](/sql-reference/data-types/int-uint) |
| INT | [Int32](/sql-reference/data-types/int-uint) |
| LONG | [Int64](/sql-reference/data-types/int-uint) |
| BIGDECIMAL | [Decimal(P, S)](/sql-reference/data-types/decimal) |
| FLOAT | [Float32](/sql-reference/data-types/float) |
| DOUBLE | [Float64](/sql-reference/data-types/float) |
| LOCALDATE | [Date](/sql-reference/data-types/date) |
| LOCALDATETIME | [DateTime](/sql-reference/data-types/datetime) |
| INSTANT | [DateTime64(9, 'UTC')](/sql-reference/data-types/datetime64) |
| STRING | [String](/sql-reference/data-types/string) |
| BINARY | [String](/sql-reference/data-types/string) \* |
| XML | [String](/sql-reference/data-types/string) \* |
| JSON | [String](/sql-reference/data-types/string) \* |

:::note
\* BINARY, XML, and JSON are stored as [String](/sql-reference/data-types/string) because ClickHouse's `String` type can represent an arbitrary set of bytes. The destination adds a column comment to indicate the original data type. The ClickHouse [JSON](/sql-reference/data-types/newjson) data type is not used as it was marked as obsolete and never recommended for production usage.
:::

## Destination table structure {#table-structure}

All destination tables use [SharedReplacingMergeTree](/cloud/reference/shared-merge-tree) versioned by the `_fivetran_synced` column. Every column except primary (ordering) keys and Fivetran metadata columns is created as [Nullable(T)](/sql-reference/data-types/nullable).

### Single primary key {#single-pk}

For a source table `users` with primary key `id` (`INT`) and column `name` (`STRING`):

```sql
CREATE TABLE `users`
(
    `id`                Int32,
    `name`              Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY id
SETTINGS index_granularity = 8192
```

### Multiple primary keys {#multiple-pk}

For a source table `items` with primary keys `id` (`INT`) and `name` (`STRING`), plus column `description` (`STRING`):

```sql
CREATE TABLE `items`
(
    `id`                Int32,
    `name`              String,
    `description`       Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name)
SETTINGS index_granularity = 8192
```

Primary keys are used in order of their appearance in the Fivetran source table definition.

### No primary keys {#no-pk}

When the source table has no primary keys, Fivetran adds a `_fivetran_id` column as the sorting key:

```sql
CREATE TABLE events
(
    `event`             Nullable(String),
    `timestamp`         Nullable(DateTime),
    `_fivetran_id`      String,
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY _fivetran_id
SETTINGS index_granularity = 8192
```

## Data deduplication {#deduplication}

`SharedReplacingMergeTree` performs background data deduplication [only during merges at an unknown time](/engines/table-engines/mergetree-family/replacingmergetree). To query the latest version of data without duplicates, use the `FINAL` keyword with [`select_sequential_consistency`](/operations/settings/settings#select_sequential_consistency):

```sql
SELECT *
FROM example FINAL
LIMIT 1000
SETTINGS select_sequential_consistency = 1;
```

See also [Duplicate records with ReplacingMergeTree](/integrations/fivetran/troubleshooting#duplicate-records) in the troubleshooting guide.

## Fivetran metadata columns {#metadata-columns}

Every destination table includes the following metadata columns:

| Column | Type | Description |
|--------|------|-------------|
| `_fivetran_synced` | `DateTime64(9, 'UTC')` | Timestamp when the record was synced by Fivetran. Used as the version column for `ReplacingMergeTree`. |
| `_fivetran_deleted` | `Bool` | Soft delete marker. Set to `true` when the source record is deleted. |
| `_fivetran_id` | `String` | Auto-generated unique identifier. Only present when the source table has no primary keys. |

## Ownership and support model {#ownership}

The ClickHouse Fivetran destination has a split ownership model:

- **ClickHouse** develops and maintains the destination connector code ([GitHub](https://github.com/ClickHouse/clickhouse-fivetran-destination)).
- **Fivetran** hosts the connector and is responsible for data movement, pipeline scheduling, and source connectors.

When diagnosing sync failures:
- Check the ClickHouse `system.query_log` for server-side issues.
- Request Fivetran connector process logs for client-side issues.

For connector bugs, [create a GitHub issue](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues) or contact [ClickHouse Support](/about-us/support).

## Debugging Fivetran syncs {#debugging}

Use the following queries to diagnose sync failures on the ClickHouse side.

### Check recent Fivetran errors {#check-errors}

```sql
SELECT event_time, query, exception_code, exception
FROM system.query_log
WHERE client_name LIKE 'fivetran-destination%'
  AND exception_code > 0
ORDER BY event_time DESC
LIMIT 50;
```

### Check replica health {#check-replicas}

```sql
SELECT database, table, total_replicas, active_replicas, replica_is_active
FROM system.replicas
WHERE database LIKE 'ft_%'
ORDER BY active_replicas ASC;
```

### Identify orphaned replicas {#orphaned-replicas}

Orphaned replicas from migrated or scaled services can block DDL operations. Identify them with:

```sql
SELECT DISTINCT arrayJoin(mapKeys(replica_is_active)) AS replica_name
FROM system.replicas
WHERE arrayJoin(mapValues(replica_is_active)) = 0;
```

To remove an orphaned replica:

```sql
SYSTEM DROP REPLICA '<old-replica-name>' FROM TABLE <db>.<table>;
```

### Check recent Fivetran user activity {#check-activity}

```sql
SELECT event_time, query_kind, query, exception_code, exception
FROM system.query_log
WHERE user = 'fivetran_user'
ORDER BY event_time DESC
LIMIT 100;
```
