---
slug: '/engines/table-engines/special/filelog'
sidebar_label: FileLog
sidebar_position: 160
description: 'Этот движок позволяет обрабатывать файлы журналов приложений как поток'
title: 'Движок FileLog'
doc_type: reference
---
# `FileLog` движок {#filelog-engine}

Этот движок позволяет обрабатывать файлы журналов приложений в виде потока записей.

`FileLog` позволяет вам:

- Подписываться на файлы журналов.
- Обрабатывать новые записи по мере их добавления в подписанные файлы журналов.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = FileLog('path_to_logs', 'format_name') SETTINGS
    [poll_timeout_ms = 0,]
    [poll_max_batch_size = 0,]
    [max_block_size = 0,]
    [max_threads = 0,]
    [poll_directory_watch_events_backoff_init = 500,]
    [poll_directory_watch_events_backoff_max = 32000,]
    [poll_directory_watch_events_backoff_factor = 2,]
    [handle_error_mode = 'default']
```

Аргументы движка:

- `path_to_logs` – Путь к файлам журналов, на которые нужно подписаться. Это может быть путь к директории с файлами журналов или к одному файлу журнала. Обратите внимание, что ClickHouse позволяет использовать только пути внутри директории `user_files`.
- `format_name` - Формат записи. Обратите внимание, что FileLog обрабатывает каждую строку в файле как отдельную запись, и не все форматы данных подходят для этого.

Дополнительные параметры:

- `poll_timeout_ms` - Тайм-аут для одного опроса из файла журнала. По умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `poll_max_batch_size` — Максимальное количество записей, которые могут быть опрошены за один раз. По умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `max_block_size` — Максимальный размер партии (в записях) для опроса. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `max_threads` - Максимальное количество потоков для парсинга файлов, по умолчанию 0, что означает, что количество будет max(1, physical_cpu_cores / 4).
- `poll_directory_watch_events_backoff_init` - Начальное значение ожидания для потока наблюдения за директорией. По умолчанию: `500`.
- `poll_directory_watch_events_backoff_max` - Максимальное значение ожидания для потока наблюдения за директорией. По умолчанию: `32000`.
- `poll_directory_watch_events_backoff_factor` - Скорость отката, по умолчанию экспоненциальная. По умолчанию: `2`.
- `handle_error_mode` — Способ обработки ошибок для движка FileLog. Возможные значения: default (исключение будет выброшено, если не удалось разобрать сообщение), stream (сообщение об исключении и необработанное сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).

## Описание {#description}

Доставленные записи отслеживаются автоматически, поэтому каждая запись в файле журнала учитывается только один раз.

`SELECT` не особенно полезен для чтения записей (за исключением отладки), поскольку каждая запись может быть прочитана только один раз. Более практично создавать потоки в реальном времени, используя [материализованные представления](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания таблицы FileLog и рассматривайте ее как поток данных.
2.  Создайте таблицу с желаемой структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, он начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать записи из файлов журналов и преобразовывать их в необходимый формат с помощью `SELECT`.
Одна таблица FileLog может иметь столько материализованных представлений, сколько вы хотите, они не читают данные напрямую из таблицы, а получают новые записи (пакетами), таким образом вы можете записывать в несколько таблиц с разным уровнем детализации (с группировкой - агрегацией и без).

Пример:

```sql
CREATE TABLE logs (
  timestamp UInt64,
  level String,
  message String
) ENGINE = FileLog('user_files/my_app/app.log', 'JSONEachRow');

CREATE TABLE daily (
  day Date,
  level String,
  total UInt64
) ENGINE = SummingMergeTree(day, (day, level), 8192);

CREATE MATERIALIZED VIEW consumer TO daily
  AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
  FROM queue GROUP BY day, level;

SELECT level, sum(total) FROM daily GROUP BY level;
```

Чтобы прекратить получение данных потоков или изменить логику преобразования, отсоедините материализованное представление:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Виртуальные колонки {#virtual-columns}

- `_filename` - Имя файла журнала. Тип данных: `LowCardinality(String)`.
- `_offset` - Смещение в файле журнала. Тип данных: `UInt64`.

Дополнительные виртуальные колонки при `handle_error_mode='stream'`:

- `_raw_record` - Необработанная запись, которую не удалось успешно разобрать. Тип данных: `Nullable(String)`.
- `_error` - Сообщение об исключении, возникшем во время неудачного разбора. Тип данных: `Nullable(String)`.

Примечание: виртуальные колонки `_raw_record` и `_error` заполняются только в случае возникновения исключения во время разбора, они всегда равны `NULL`, когда сообщение было успешно разобрано.