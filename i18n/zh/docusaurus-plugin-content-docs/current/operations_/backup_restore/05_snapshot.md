---
description: '如何使用云对象存储创建和恢复云原生表的轻量级快照。'
sidebar_label: '快照备份'
sidebar_position: 5
slug: /operations/backup/snapshot
title: '快照备份与恢复'
doc_type: 'guide'
keywords: ['快照', '备份', '恢复', 'SharedMergeTree', 'SharedSet', 'SharedJoin', '轻量级备份', '云备份', 'S3', 'Azure Blob Storage', 'snapshot_locks', 'snapshot_parts', 'experimental_lightweight_snapshot']
---

快照备份是云原生表引擎的一种轻量级备份模式。它不会复制数据，而是将每个 part 对应的锁节点写入 ClickHouse Keeper。只要快照仍被保留，这些锁就会阻止服务器删除被引用的对象存储 parts。随后，备份记录的是对象存储引用，而不是实际复制任何数据，因此无论表的大小如何，创建快照都很快。

这种轻量级方案适用于 [SharedMergeTree](/cloud/reference/shared-merge-tree)、SharedSet 和 SharedJoin 表。对于所有其他引擎类型 (例如 Log 或 Memory) ，备份会自动回退到标准的复制型备份。

## 创建快照 \{#create-a-snapshot\}

快照备份使用标准的 [`BACKUP`](/operations/backup/overview#syntax) 命令，并将 `experimental_lightweight_snapshot` 设为 `true`。`id` 设置是必需的——它用于为快照命名，并在 解锁 和可观测性命令中用于引用该快照：

```sql
BACKUP { TABLE [db.]table_name | DATABASE db_name | ALL [EXCEPT {TABLES | DATABASES} ...] }
TO { S3(...) | AzureBlobStorage(...) }
SETTINGS experimental_lightweight_snapshot = true, id = '<snapshot_id>'
```

该命令语会返回 `id` 和 `status`，并且可使用 `id` 在 [`system.backups`](/operations/system-tables/backups) 中跟踪该操作。

将单个表备份到 S3：

```sql
BACKUP TABLE mydb.events
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

备份整个数据库：

```sql
BACKUP DATABASE mydb
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/mydb/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'mydb_snapshot_1'
```

备份除一张表外的所有表：

```sql
BACKUP ALL
EXCEPT TABLES mydb.staging_table
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/full/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'full_snapshot_1'
```

同样的命令也适用于 Azure Blob Storage：

```sql
BACKUP TABLE mydb.events
TO AzureBlobStorage('DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...', 'my-container', 'snapshots/events/')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

## 恢复到同一服务 \{#restore-to-same-service\}

由于快照存储的是对象存储文件的引用，而不是数据副本，因此要恢复到新的或不同的 ClickHouse 服务，就需要访问原始对象存储。因此，不支持通过 SQL 执行跨服务恢复——只能通过 UI 进行。通过 SQL，您可以使用 `snapshot_from_current_service = 1`，将外部备份存储桶中的快照恢复到同一服务。这样会通过目标端磁盘直接读取对象，而不是经过远程快照读取器：

```sql
RESTORE TABLE mydb.events AS mydb.events_restored
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

`AS` 子句会将数据恢复到一个新的表名下，原始表保持不变。要覆盖原始表，请先将其删除：

```sql
DROP TABLE mydb.events;

RESTORE TABLE mydb.events
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

## 解锁快照 \{#unlock-snapshot\}

每个快照都会在 ClickHouse Keeper 中保留锁，防止其引用的对象存储文件被垃圾回收。恢复完成后，或快照不再需要时，解锁该快照以释放这些锁。

分为两种方式：系统级解锁会一次性移除该快照的全部锁；按表解锁则只移除单个表的锁，同时保留快照其余部分不变。

**系统级解锁** — 移除该快照的所有锁：

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

**单表解锁** — 仅移除单个表的锁定：

```sql
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

如果在创建时已将快照目标端存储到 Keeper 中，则 `FROM` 子句可省略 (可在 `system.snapshot_locks` 的 `info` 列中看到) ：

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'

-- or per-table:
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
```

解锁后，相应的行会从 `system.snapshot_locks` 中消失，而不再被其他快照引用的 parts 也会从 `system.snapshot_parts` 中消失。

## 可观测性 \{#observability\}

### system.backups \{#system-backups\}

所有快照操作都会显示在 [`system.backups`](/operations/system-tables/backups) 中，与常规备份和恢复操作一起列出。使用您设置的 `id` (或该命令返回的 UUID) 查询它：

```sql
SELECT id, name, status, error, start_time, end_time, num_files, uncompressed_size, compressed_size
FROM system.backups
WHERE id = 'events_snapshot_1'
FORMAT Vertical
```

```response
Row 1:
──────
id:                events_snapshot_1
name:              S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', '[HIDDEN]')
status:            BACKUP_CREATED
error:
start_time:        2024-06-01 10:00:00
end_time:          2024-06-01 10:00:03
num_files:         42
uncompressed_size: 1073741824
compressed_size:   0
```

### system.snapshot_locks \{#system-snapshot-locks\}

`system.snapshot_locks` 显示当前在 Keeper 中注册的已提交快照。当提交某个快照时，会在 `/clickhouse/snapshot/committed/{snapshot_id}` 创建一个 Keeper 节点。在删除任何数据分区片段之前，服务器会检查是否有已提交的快照对该分区片段加锁。如果有，则会跳过删除。该锁会一直保留，直到你显式解锁该快照。

```sql
SELECT *
FROM system.snapshot_locks
```

| 列           | 类型         | 描述                   |
| ----------- | ---------- | -------------------- |
| `id`        | `String`   | 快照 ID                |
| `info`      | `String`   | 快照目标端，例如 `S3('...')` |
| `ctime`     | `DateTime` | 此锁在 Keeper 中的创建时间    |
| `lock_path` | `String`   | 此锁在 Keeper 中的路径      |

每一行表示一个已提交的快照。如果你看到某些快照的锁对应的备份目标端已失效，请运行 `SYSTEM UNLOCK SNAPSHOT` 将其清理。

要检查某个特定快照锁是否存在：

```sql
SELECT id, info, lock_path
FROM system.snapshot_locks
WHERE id = 'events_snapshot_1'
```

### system.snapshot_parts \{#system-snapshot-parts\}

`system.snapshot_parts` 显示当前至少被一个快照锁固定的 数据分区片段。对于每个被锁定的数据分区片段，Keeper 都会在 `/clickhouse/snapshot/{table_uuid}/{part_name}` 下存在一个节点，其中包含该数据分区片段的压缩大小和未压缩大小。此表会读取这些节点，以显示当前哪些数据分区片段受到保护，不会被删除。

```sql
SELECT *
FROM system.snapshot_parts
ORDER BY data_compressed_bytes DESC
LIMIT 20
```

| 列                         | 类型       | 描述                |
| ------------------------- | -------- | ----------------- |
| `name`                    | `String` | 数据分区片段名称          |
| `table_id`                | `String` | 此数据分区片段所属表的 UUID  |
| `data_compressed_bytes`   | `UInt64` | 此数据分区片段的压缩大小      |
| `data_uncompressed_bytes` | `UInt64` | 此数据分区片段的未压缩大小     |
| `snapshots_size`          | `UInt64` | 当前持有此数据分区片段锁的快照数量 |

`snapshots_size > 1` 的 parts 会被多个快照引用，在所有持有它的快照都解锁之前，不会从对象存储中移除。

要检查被锁定存储的总量：

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS total_pinned_compressed,
    formatReadableSize(sum(data_uncompressed_bytes)) AS total_pinned_uncompressed,
    count() AS parts_count
FROM system.snapshot_parts
```

要查找被快照锁定、但已被删除或在服务器上已不再活跃的 parts——也就是说，仅因快照锁而仍保留在对象存储中的数据：

```sql
SELECT
    count(*),
    sum(data_uncompressed_bytes)
FROM system.snapshot_parts
WHERE (name, table_id) NOT IN (
    SELECT
        name,
        toString(tables.uuid)
    FROM system.parts
    INNER JOIN system.tables ON (parts.`table` = tables.name) AND parts.active
)
```

```response
┌─count()─┬─sum(data_uncompressed_bytes)─┐
│    1000 │                        96037 │
└─────────┴──────────────────────────────┘
```

这有助于了解在原始数据已被修改或删除后保留快照所产生的存储开销。

## 服务器设置 \{#server-settings\}

以下服务器配置参数用于控制快照行为。它们在服务器设置文件中配置，而不是在 SQL 中配置。

| 设置                                                                                                                                            | 类型     | 默认值   | 无需重启即可修改 | 说明                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | -------- | ----------------------------------------------------------------------- |
| [`max_held_snapshots`](/operations/server-configuration-parameters/settings#max_held_snapshots)                                               | UInt64 | `0`   | No       | 可同时保留的轻量级快照最大数量。`0` 表示不受限制。如果达到上限，创建新快照将抛出异常。                           |
| [`max_snapshot_commit_thread_pool_size`](/operations/server-configuration-parameters/settings#max_snapshot_commit_thread_pool_size)           | UInt64 | `64`  | 是        | 用于将快照锁节点提交到 Keeper 的线程数。如果在包含大量 parts 的大表上创建快照较慢，请增大此值。                 |
| [`max_snapshot_commit_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_snapshot_commit_thread_pool_free_size) | UInt64 | `0`   | 是        | 如果快照提交池中的空闲线程数超过此值，ClickHouse 会释放这些线程并缩减线程池。线程会在需要时重新创建。`0` 表示空闲线程永不释放。 |
| [`snapshot_cleaner_period`](/operations/server-configuration-parameters/settings#snapshot_cleaner_period)                                     | UInt64 | `120` | No       | 快照清理器运行的频率 (以秒为单位) ，用于移除不再被任何快照锁引用的 parts。仅 ClickHouse Cloud。           |
| [`snapshot_cleaner_pool_size`](/operations/server-configuration-parameters/settings#snapshot_cleaner_pool_size)                               | UInt64 | `128` | No       | 快照清理器线程池中的线程数。仅 ClickHouse Cloud。                                       |