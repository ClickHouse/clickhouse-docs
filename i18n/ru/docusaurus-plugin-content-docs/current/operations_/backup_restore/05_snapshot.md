---
description: 'Как создавать и восстанавливать облегчённые снимки облачных таблиц с помощью облачного объектного хранилища.'
sidebar_label: 'Резервное копирование снимков'
sidebar_position: 5
slug: /operations/backup/snapshot
title: 'Резервное копирование и восстановление снимков'
doc_type: 'guide'
keywords: ['снимок', 'резервное копирование', 'восстановление', 'SharedMergeTree', 'SharedSet', 'SharedJoin', 'облегчённое резервное копирование', 'облачное резервное копирование', 'S3', 'Azure Blob Storage', 'snapshot_locks', 'snapshot_parts', 'experimental_lightweight_snapshot']
---

Резервное копирование снимков — это облегченный режим резервного копирования для облачных движков таблиц. Вместо копирования данных он записывает в ClickHouse Keeper узлы блокировки для каждой части. Эти блокировки не позволяют серверу удалять части в объектном хранилище, на которые есть ссылки, пока хранится снимок. Затем резервная копия сохраняет ссылки на объектное хранилище вместо физического копирования данных, поэтому снимок создается быстро независимо от размера таблицы.

Облегченный режим применяется к [SharedMergeTree](/cloud/reference/shared-merge-tree), SharedSet и таблицам SharedJoin. Для всех остальных типов движков — например, Log или Memory — резервное копирование автоматически переходит к стандартному варианту с копированием данных.

## Создание снимка \{#create-a-snapshot\}

Для резервного копирования снимков используется стандартная команда [`BACKUP`](/operations/backup/overview#syntax) с параметром `experimental_lightweight_snapshot = true`. Параметр `id` обязателен — он задает имя снимка и используется для обращения к нему в командах разблокировки и обсервабилити:

```sql
BACKUP { TABLE [db.]table_name | DATABASE db_name | ALL [EXCEPT {TABLES | DATABASES} ...] }
TO { S3(...) | AzureBlobStorage(...) }
SETTINGS experimental_lightweight_snapshot = true, id = '<snapshot_id>'
```

Команда возвращает `id` и `status`, а `id` можно использовать для отслеживания операции в [`system.backups`](/operations/system-tables/backups).

Создайте резервную копию отдельной таблицы в S3:

```sql
BACKUP TABLE mydb.events
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

Создайте резервную копию всей базы данных:

```sql
BACKUP DATABASE mydb
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/mydb/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'mydb_snapshot_1'
```

Создайте резервную копию всех таблиц, кроме одной:

```sql
BACKUP ALL
EXCEPT TABLES mydb.staging_table
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/full/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'full_snapshot_1'
```

Те же команды применимы и к Azure Blob Storage:

```sql
BACKUP TABLE mydb.events
TO AzureBlobStorage('DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...', 'my-container', 'snapshots/events/')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

## Восстановление в том же сервисе \{#restore-to-same-service\}

Поскольку снимок хранит ссылки на файлы в объектном хранилище, а не копии данных, для восстановления в новом или другом сервисе ClickHouse требуется доступ к исходному объектному хранилищу. По этой причине межсервисное восстановление через SQL не поддерживается — оно доступно только в UI. Через SQL вы можете восстановить снимок в том же сервисе из бакета внешней резервной копии, используя `snapshot_from_current_service = 1`. При этом объекты считываются напрямую через целевой диск, а не через удалённый модуль чтения снимков:

```sql
RESTORE TABLE mydb.events AS mydb.events_restored
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

Конструкция `AS` восстанавливает данные в новую таблицу, оставляя исходную таблицу без изменений. Чтобы перезаписать исходную таблицу, сначала удалите её:

```sql
DROP TABLE mydb.events;

RESTORE TABLE mydb.events
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

## Разблокировка снимка \{#unlock-snapshot\}

Каждый снимок удерживает блокировки в ClickHouse Keeper, которые не позволяют удалить сборщиком мусора файлы Объектного хранилища, на которые ссылается снимок. После завершения восстановления — или когда снимок больше не нужен — разблокируйте его, чтобы снять эти блокировки.

Есть две формы: разблокировка на уровне системы, которая сразу снимает все блокировки для снимка, и разблокировка на уровне таблицы, которая снимает блокировку для одной таблицы, оставляя остальную часть снимка без изменений.

**Разблокировка на уровне системы** — снимает все блокировки для снимка:

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

**Разблокировка отдельной таблицы** — снимает блокировку только с одной таблицы:

```sql
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

Часть `FROM` необязательна, если пункт назначения снимка был сохранён в Keeper при создании (это видно в столбце `info` таблицы `system.snapshot_locks`):

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'

-- or per-table:
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
```

После снятия блокировки соответствующая строка исчезает из `system.snapshot_locks`, а части, на которые больше не ссылаются другие снимки, удаляются из `system.snapshot_parts`.

## Обсервабилити \{#observability\}

### system.backups \{#system-backups\}

Все операции со снимками появляются в [`system.backups`](/operations/system-tables/backups) наряду с обычными операциями резервного копирования и восстановления. Выполните к ней запрос, указав заданный вами `id` (или UUID, возвращённый командой):

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

`system.snapshot_locks` показывает зафиксированные снимки, которые в данный момент зарегистрированы в Keeper. Когда снимок фиксируется, в Keeper создаётся узел по пути `/clickhouse/snapshot/committed/{snapshot_id}`. Перед удалением любой части данных сервер проверяет, не удерживает ли какой-либо зафиксированный снимок блокировку этой части. Если да, удаление пропускается. Блокировка сохраняется, пока вы явно не снимете её со снимка.

```sql
SELECT *
FROM system.snapshot_locks
```

| Столбец     | Тип        | Описание                                      |
| ----------- | ---------- | --------------------------------------------- |
| `id`        | `String`   | Идентификатор снимка                          |
| `info`      | `String`   | Место назначения снимка, например `S3('...')` |
| `ctime`     | `DateTime` | Время создания этой блокировки в Keeper       |
| `lock_path` | `String`   | Путь в Keeper для этой блокировки             |

Каждая строка соответствует одному зафиксированному снимку. Если вы видите блокировки снимков, для которых больше не существует действительного места назначения резервной копии, выполните `SYSTEM UNLOCK SNAPSHOT`, чтобы удалить их.

Чтобы проверить, существует ли блокировка для конкретного снимка:

```sql
SELECT id, info, lock_path
FROM system.snapshot_locks
WHERE id = 'events_snapshot_1'
```

### system.snapshot_parts \{#system-snapshot-parts\}

`system.snapshot_parts` показывает части данных, в данный момент закреплённые как минимум одной блокировкой снимка. Для каждой заблокированной части по пути `/clickhouse/snapshot/{table_uuid}/{part_name}` существует узел Keeper, содержащий сжатый и несжатый размеры части. Эта таблица считывает эти узлы и показывает, какие части сейчас защищены от удаления.

```sql
SELECT *
FROM system.snapshot_parts
ORDER BY data_compressed_bytes DESC
LIMIT 20
```

| Столбец                   | Тип      | Описание                                                                     |
| ------------------------- | -------- | ---------------------------------------------------------------------------- |
| `name`                    | `String` | Имя части                                                                    |
| `table_id`                | `String` | UUID таблицы, которой принадлежит эта часть                                  |
| `data_compressed_bytes`   | `UInt64` | Размер этой части в сжатом виде                                              |
| `data_uncompressed_bytes` | `UInt64` | Размер этой части в несжатом виде                                            |
| `snapshots_size`          | `UInt64` | Количество снимков, которые в данный момент удерживают блокировку этой части |

На части, для которых `snapshots_size > 1`, ссылаются несколько снимков, и они не будут удалены из Объектного хранилища, пока не будут разблокированы все удерживающие их снимки.

Чтобы проверить общий объём закреплённых данных:

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS total_pinned_compressed,
    formatReadableSize(sum(data_uncompressed_bytes)) AS total_pinned_uncompressed,
    count() AS parts_count
FROM system.snapshot_parts
```

Чтобы найти части, заблокированные снимком, но уже удалённые или больше не активные на сервере, — то есть данные, которые удерживаются в объектном хранилище исключительно из-за блокировок снимка:

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

Это полезно для оценки накладных расходов на хранение снимков после изменения или удаления исходных данных.

## Настройки сервера \{#server-settings\}

Следующие параметры конфигурации сервера управляют поведением снимков. Они задаются в файле конфигурации сервера, а не в SQL.

| Настройка                                                                                                                                     | Тип    | По умолчанию | Можно изменить без перезапуска | Описание                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`max_held_snapshots`](/operations/server-configuration-parameters/settings#max_held_snapshots)                                               | UInt64 | `0`          | No                             | Максимальное количество облегчённых снимков, которые можно хранить одновременно. `0` означает, что ограничение отсутствует. Если лимит достигнут, создание нового снимка генерирует исключение.                                                              |
| [`max_snapshot_commit_thread_pool_size`](/operations/server-configuration-parameters/settings#max_snapshot_commit_thread_pool_size)           | UInt64 | `64`         | Yes                            | Количество потоков, используемых для фиксации узлов блокировки снимков в Keeper. Увеличьте это значение, если создание снимков на больших таблицах с большим количеством частей выполняется медленно.                                                        |
| [`max_snapshot_commit_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_snapshot_commit_thread_pool_free_size) | UInt64 | `0`          | Yes                            | Если число бездействующих потоков в пуле фиксации снимков превышает это значение, ClickHouse освобождает эти потоки и уменьшает размер пула. При необходимости потоки будут созданы снова. `0` означает, что бездействующие потоки никогда не освобождаются. |
| [`snapshot_cleaner_period`](/operations/server-configuration-parameters/settings#snapshot_cleaner_period)                                     | UInt64 | `120`        | No                             | Как часто (в секундах) запускается очистка снимков для удаления частей, на которые больше не ссылается ни одна блокировка снимка. Только в ClickHouse Cloud.                                                                                                 |
| [`snapshot_cleaner_pool_size`](/operations/server-configuration-parameters/settings#snapshot_cleaner_pool_size)                               | UInt64 | `128`        | No                             | Количество потоков в пуле потоков очистки снимков. Только в ClickHouse Cloud.                                                                                                                                                                                |