---
sidebar_label: 'Technical Reference'
slug: /integrations/fivetran/reference
sidebar_position: 3
description: 'Type mappings, table engine details, metadata columns, and debugging queries for the Fivetran ClickHouse destination.'
title: 'Technical Reference'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'type mapping', 'SharedReplacingMergeTree', 'deduplication', 'FINAL', 'reference']
---

# Technical Reference

## Setup details {#setup-details}

### User and role management {#user-and-role-management}

Consider not using the `default` user; instead, create a dedicated one to use it with this Fivetran
destination only. The following commands, executed with the `default` user, will create a new `fivetran_user` with the
required privileges.

```sql
CREATE USER fivetran_user IDENTIFIED BY '<password>'; -- use a secure password generator

GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

Additionally, you can revoke access to certain databases from the `fivetran_user`.
For example, by executing the following statement, we restrict access to the `default` database:

```sql
REVOKE ALL ON default.* FROM fivetran_user;
```

You can execute these statements in the ClickHouse SQL console.

### Advanced configuration {#advanced-configuration}

The ClickHouse Cloud destination supports an optional JSON configuration file for advanced use cases. This file allows you to fine-tune destination behavior by overriding the default settings that control batch sizes, parallelism, connection pools, and request timeouts.

:::note
This configuration is entirely optional. If no file is uploaded, the destination uses sensible defaults that work well for most use cases. 
:::

The file must be valid JSON and conform to the schema described below.

If you need to modify the configuration after the initial setup, you can edit the destination configurations in the Fivetran dashboard and upload an updated file.

The configuration file has a top-level section:

```json
{
  "destination_configurations": { ... }
}
```

Inside of it you can specify the following configurations that control the internal behavior of the ClickHouse destination connector itself.
These configurations affect how the connector processes data before sending it to ClickHouse.

| Setting | Type | Default | Allowed Range | Description |
|---------|------|---------|---------------|-------------|
| `write_batch_size` | integer | `100000` | 5,000 – 100,000 | Number of rows per batch for insert, update, and replace operations. |
| `select_batch_size` | integer | `1500` | 200 – 1,500 | Number of rows per batch for SELECT queries used during updates. |
| `mutation_batch_size` | integer | `1500` | 200 – 1,500 | Number of rows per batch for ALTER TABLE UPDATE mutations in history mode. Lower it if you are experiencing large SQL statements. |
| `hard_delete_batch_size` | integer | `1500` | 200 – 1,500 | Number of rows per batch for hard delete operations in normal syncs and in history mode. Lower it if you are experiencing large SQL statements. |

All fields are optional. If a field is not specified, the default value is used.
If a value is outside the allowed range, the destination will report an error during sync.
Unknown fields are silently ignored (a warning is logged) and do not cause errors, which allows forward compatibility when new settings are added.

Example:

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "select_batch_size": 200
  }
}
```

## Type transformation mapping {#type-mapping}

The Fivetran ClickHouse destination maps [Fivetran data types](https://fivetran.com/docs/destinations#datatypes) to ClickHouse types as follows:

| Fivetran type | ClickHouse type                                              |
|---------------|--------------------------------------------------------------|
| BOOLEAN       | [Bool](/sql-reference/data-types/boolean)                    |
| SHORT         | [Int16](/sql-reference/data-types/int-uint)                  |
| INT           | [Int32](/sql-reference/data-types/int-uint)                  |
| LONG          | [Int64](/sql-reference/data-types/int-uint)                  |
| BIGDECIMAL    | [Decimal(P, S)](/sql-reference/data-types/decimal)           |
| FLOAT         | [Float32](/sql-reference/data-types/float)                   |
| DOUBLE        | [Float64](/sql-reference/data-types/float)                   |
| LOCALDATE     | [Date32](/sql-reference/data-types/date32)                   |
| LOCALDATETIME | [DateTime64(0, 'UTC')](/sql-reference/data-types/datetime64) |
| INSTANT       | [DateTime64(9, 'UTC')](/sql-reference/data-types/datetime64) |
| STRING        | [String](/sql-reference/data-types/string)                   |
| LOCALTIME     | [String](/sql-reference/data-types/string) \* \*\*           |
| BINARY        | [String](/sql-reference/data-types/string) \*                |
| XML           | [String](/sql-reference/data-types/string) \*                |
| JSON          | [String](/sql-reference/data-types/string) \*                |

:::note
\* BINARY, XML, LOCALTIME, and JSON are stored as [String](/sql-reference/data-types/string) because ClickHouse's `String` type can represent an arbitrary set of bytes. The destination adds a column comment to indicate the original data type. The ClickHouse [JSON](/sql-reference/data-types/newjson) data type is not used as it was marked as obsolete and never recommended for production usage.
\*\* NOTE: Issue to track the support for LOCALTIME type: [clickhouse-fivetran-destination #15](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues/15).
:::

### Date and time value ranges {#date-and-time-value-ranges}

Fivetran sources can send date and time values in the range [0001-01-01, 9999-12-31](https://fivetran.com/docs/destinations#dateandtimevaluerange).
ClickHouse Cloud date types have narrower ranges, so values outside the supported range are silently clamped to the nearest boundary:

| Fivetran type | ClickHouse Cloud type  | Min value                 | Max value                 |
|---------------|------------------------|---------------------------|---------------------------|
| LOCALDATE     | Date32                 | 1900-01-01                | 2299-12-31                |
| LOCALDATETIME | DateTime64(0, 'UTC')   | 1900-01-01 00:00:00       | 2262-04-11 23:47:16       |
| INSTANT       | DateTime64(9, 'UTC')   | 1900-01-01 00:00:00       | 2262-04-11 23:47:16       |

- The INSTANT upper bound is 2262-04-11 23:47:16 because DateTime64(9) stores nanoseconds since epoch as int64, and 2^63 - 1 nanoseconds corresponds to this date.
ClickHouse itself supports DateTime64 with precision \<= 9 up to 2299-12-31 23:59:59.
- The LOCALDATETIME upper bound is also limited to 2262-04-11 23:47:16 due to a [known bug](https://github.com/ClickHouse/clickhouse-go/issues/1311) in the Go ClickHouse driver, where `time.Time.UnixNano()` is called for all DateTime64 precisions before scaling, causing int64 overflow for dates beyond 2262 even at precision 0.

## Destination tables {#table-structure}

The ClickHouse Cloud destination uses
[Replacing](/engines/table-engines/mergetree-family/replacingmergetree) engine type of
[SharedMergeTree](/cloud/reference/shared-merge-tree) family
(specifically, `SharedReplacingMergeTree`), versioned by the `_fivetran_synced` column.

Every column except primary (ordering) keys and Fivetran metadata columns is created
as [Nullable(T)](/sql-reference/data-types/nullable), where `T` is a
ClickHouse Cloud type based on the [data types mapping](#type-mapping).

Every destination table includes the following metadata columns:

| Column | Type | Description |
|--------|------|-------------|
| `_fivetran_synced` | `DateTime64(9, 'UTC')` | Timestamp when the record was synced by Fivetran. Used as the version column for `SharedReplacingMergeTree`. |
| `_fivetran_deleted` | `Bool` | Soft delete marker. Set to `true` when the source record is deleted. |
| `_fivetran_id` | `String` | Auto-generated unique identifier. Only present when the source table has no primary keys. |

### Single primary key in the source table {#single-pk}

For example, source table `users` has a primary key column `id` (`INT`) and a regular column `name` (`STRING`).
The destination table will be defined as follows:

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

In this case, the `id` column is chosen as a table sorting key.

### Multiple primary keys in the source table {#multiple-pks}

If the source table has multiple primary keys, they are used in order of their appearance in the Fivetran source table
definition.

For example, there is a source table `items` with primary key columns `id` (`INT`) and `name` (`STRING`), plus an
additional regular column `description` (`STRING`). The destination table will be defined as follows:

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

In this case, `id` and `name` columns are chosen as table sorting keys.

### No primary keys in the source table {#no-pks}

If the source table has no primary keys, a unique identifier will be added by Fivetran as a `_fivetran_id` column.
Consider an `events` table that only has the `event` (`STRING`) and `timestamp` (`LOCALDATETIME`) columns in the source.
The destination table in that case is as follows:

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

Since `_fivetran_id` is unique and there are no other primary key options, it is used as a table sorting key.

### Selecting the latest version of the data without duplicates {#selecting-latest-version}

`SharedReplacingMergeTree` performs background data deduplication
[only during merges at an unknown time](/engines/table-engines/mergetree-family/replacingmergetree).
However, selecting the latest version of the data without duplicates ad-hoc is possible with the `FINAL` keyword and
[select_sequential_consistency](/operations/settings/settings#select_sequential_consistency)
setting:

```sql
SELECT *
FROM example FINAL
LIMIT 1000 
SETTINGS select_sequential_consistency = 1;
```

See also [Duplicate records with ReplacingMergeTree](/integrations/fivetran/troubleshooting#duplicate-records) in the troubleshooting guide.

## Retries on network failures {#retries-on-network-failures}

The ClickHouse Cloud destination retries transient network errors using the exponential backoff algorithm.
This is safe even when the destination inserts the data, as any potential duplicates are handled by
the `SharedReplacingMergeTree` table engine, either during background merges,
or when querying the data with `SELECT FINAL`.
