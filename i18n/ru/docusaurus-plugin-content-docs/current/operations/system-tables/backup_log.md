---
description: 'Системная таблица, содержащая записи логирования с информацией о `BACKUP`
  и `RESTORE` операциях.'
keywords: ['системная таблица', 'backup_log']
slug: /operations/system-tables/backup_log
title: 'system.backup_log'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.backup_log

<SystemTableCloud/>

Содержит записи логирования с информацией о `BACKUP` и `RESTORE` операциях.

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата записи.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время записи.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время записи с точностью до микросекунд.
- `id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор операции резервного копирования или восстановления.
- `name` ([String](../../sql-reference/data-types/string.md)) — Имя хранилища резервных копий (содержимое клаузулы `FROM` или `TO`).
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — Статус операции. Возможные значения:
    - `'CREATING_BACKUP'`
    - `'BACKUP_CREATED'`
    - `'BACKUP_FAILED'`
    - `'RESTORING'`
    - `'RESTORED'`
    - `'RESTORE_FAILED'`
- `error` ([String](../../sql-reference/data-types/string.md)) — Сообщение об ошибке неудачной операции (пустая строка для успешных операций).
- `start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала операции.
- `end_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время окончания операции.
- `num_files` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество файлов, хранящихся в резервной копии.
- `total_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Общий размер файлов, хранящихся в резервной копии.
- `num_entries` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество записей в резервной копии, т.е. количество файлов внутри папки, если резервная копия хранится как папка, или количество файлов внутри архива, если резервная копия хранится как архив. Это не то же самое, что `num_files`, если это инкрементная резервная копия или если она содержит пустые файлы или дубликаты. Всегда верно: `num_entries <= num_files`.
- `uncompressed_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Неразжатый размер резервной копии.
- `compressed_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Сжатый размер резервной копии. Если резервная копия не хранится как архив, она равна `uncompressed_size`.
- `files_read` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество файлов, прочитанных во время операции восстановления.
- `bytes_read` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Общий размер файлов, прочитанных во время операции восстановления.

**Пример**

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

Это по сути та же информация, что записана в системной таблице `system.backups`:

```sql
SELECT * FROM system.backups ORDER BY start_time
```
```response
┌─id───────────────────────────────────┬─name──────────────────────────┬─status─────────┬─error─┬──────────start_time─┬────────────end_time─┬─num_files─┬─total_size─┬─num_entries─┬─uncompressed_size─┬─compressed_size─┬─files_read─┬─bytes_read─┐
│ e5b74ecb-f6f1-426a-80be-872f90043885 │ Disk('backups_disk', '1.zip') │ BACKUP_CREATED │       │ 2023-08-19 11:05:21 │ 2023-08-19 11:08:56 │        57 │ 4290364870 │          46 │        4290362365 │      3525068304 │          0 │          0 │
│ cdf1f731-52ef-42da-bc65-2e1bfcd4ce90 │ Disk('backups_disk', '1.zip') │ RESTORED       │       │ 2023-08-19 11:09:19 │ 2023-08-19 11:09:29 │        57 │ 4290364870 │          46 │        4290362365 │      4290362365 │         57 │ 4290364870 │
└──────────────────────────────────────┴───────────────────────────────┴────────────────┴───────┴─────────────────────┴─────────────────────┴───────────┴────────────┴─────────────┴───────────────────┴─────────────────┴────────────┴────────────┘
```

**Смотрите Также**

- [Резервное копирование и восстановление](../../operations/backup.md)
