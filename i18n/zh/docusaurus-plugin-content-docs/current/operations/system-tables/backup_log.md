---
description: '包含 `BACKUP` 和 `RESTORE` 操作相关日志条目的系统表。'
keywords: ['system table', 'backup_log']
slug: /operations/system-tables/backup_log
title: 'system.backup_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.backup&#95;log {#systembackup&#95;log}

<SystemTableCloud />

包含 `BACKUP` 和 `RESTORE` 操作相关信息的日志记录。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 日志记录的日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 日志记录的日期和时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 日志记录的时间（精确到微秒）。
* `id` ([String](../../sql-reference/data-types/string.md)) — 备份或恢复操作的标识符。
* `name` ([String](../../sql-reference/data-types/string.md)) — 备份存储的名称（`FROM` 或 `TO` 子句中的内容）。
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 操作状态。可能的取值：
  * `'CREATING_BACKUP'`
  * `'BACKUP_CREATED'`
  * `'BACKUP_FAILED'`
  * `'RESTORING'`
  * `'RESTORED'`
  * `'RESTORE_FAILED'`
* `error` ([String](../../sql-reference/data-types/string.md)) — 失败操作的错误信息（成功操作时为空字符串）。
* `start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 操作开始时间。
* `end_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 操作结束时间。
* `num_files` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 备份中存储的文件数量。
* `total_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 备份中存储的文件总大小。
* `num_entries` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 备份中的条目数量，即如果备份以目录形式存储，则为目录中的文件数量；如果备份以归档形式存储，则为归档中的文件数量。如果是增量备份，或者包含空文件或重复文件，则该值与 `num_files` 不同。始终满足：`num_entries <= num_files`。
* `uncompressed_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 备份的未压缩大小。
* `compressed_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 备份的压缩大小。如果备份不是以归档形式存储，则该值等于 `uncompressed_size`。
* `files_read` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 恢复操作期间读取的文件数量。
* `bytes_read` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 恢复操作期间读取的文件总大小。

**示例**

```sql
BACKUP TABLE test_db.my_table TO Disk('backups_disk', '1.zip')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ e5b74ecb-f6f1-426a-80be-872f90043885 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

```sql
SELECT * FROM system.backup_log WHERE id = 'e5b74ecb-f6f1-426a-80be-872f90043885' ORDER BY event_date, event_time_microseconds \G
```

```response
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time_microseconds: 2023-08-19 11:05:21.998566
id:                      e5b74ecb-f6f1-426a-80be-872f90043885
name:                    Disk('backups_disk', '1.zip')
status:                  CREATING_BACKUP
error:                   
start_time:              2023-08-19 11:05:21
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time:              2023-08-19 11:08:56
event_time_microseconds: 2023-08-19 11:08:56.916192
id:                      e5b74ecb-f6f1-426a-80be-872f90043885
name:                    Disk('backups_disk', '1.zip')
status:                  BACKUP_CREATED
error:                   
start_time:              2023-08-19 11:05:21
end_time:                2023-08-19 11:08:56
num_files:               57
total_size:              4290364870
num_entries:             46
uncompressed_size:       4290362365
compressed_size:         3525068304
files_read:              0
bytes_read:              0
```

```sql
RESTORE TABLE test_db.my_table FROM Disk('backups_disk', '1.zip')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ cdf1f731-52ef-42da-bc65-2e1bfcd4ce90 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

```sql
SELECT * FROM system.backup_log WHERE id = 'cdf1f731-52ef-42da-bc65-2e1bfcd4ce90' ORDER BY event_date, event_time_microseconds \G
```

```response
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time_microseconds: 2023-08-19 11:09:19.718077
id:                      cdf1f731-52ef-42da-bc65-2e1bfcd4ce90
name:                    Disk('backups_disk', '1.zip')
status:                  RESTORING
error:                   
start_time:              2023-08-19 11:09:19
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time_microseconds: 2023-08-19 11:09:29.334234
id:                      cdf1f731-52ef-42da-bc65-2e1bfcd4ce90
name:                    Disk('backups_disk', '1.zip')
status:                  RESTORED
error:                   
start_time:              2023-08-19 11:09:19
end_time:                2023-08-19 11:09:29
num_files:               57
total_size:              4290364870
num_entries:             46
uncompressed_size:       4290362365
compressed_size:         4290362365
files_read:              57
bytes_read:              4290364870
```

这些内容本质上与系统表 `system.backups` 中记录的信息相同：

```sql
SELECT * FROM system.backups ORDER BY start_time
```

```response
┌─id───────────────────────────────────┬─name──────────────────────────┬─status─────────┬─error─┬──────────start_time─┬────────────end_time─┬─num_files─┬─total_size─┬─num_entries─┬─uncompressed_size─┬─compressed_size─┬─files_read─┬─bytes_read─┐
│ e5b74ecb-f6f1-426a-80be-872f90043885 │ Disk('backups_disk', '1.zip') │ BACKUP_CREATED │       │ 2023-08-19 11:05:21 │ 2023-08-19 11:08:56 │        57 │ 4290364870 │          46 │        4290362365 │      3525068304 │          0 │          0 │
│ cdf1f731-52ef-42da-bc65-2e1bfcd4ce90 │ Disk('backups_disk', '1.zip') │ RESTORED       │       │ 2023-08-19 11:09:19 │ 2023-08-19 11:09:29 │        57 │ 4290364870 │          46 │        4290362365 │      4290362365 │         57 │ 4290364870 │
└──────────────────────────────────────┴───────────────────────────────┴────────────────┴───────┴─────────────────────┴─────────────────────┴───────────┴────────────┴─────────────┴───────────────────┴─────────────────┴────────────┴────────────┘
```

**另请参阅**

* [备份和恢复](../../operations/backup.md)
