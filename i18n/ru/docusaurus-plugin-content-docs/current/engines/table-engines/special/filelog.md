---
slug: /engines/table-engines/special/filelog
sidebar_position: 160
sidebar_label: FileLog
title: 'Движок FileLog'
description: 'Этот движок позволяет обрабатывать файлы журналов приложений в виде потока записей.'
---


# Движок FileLog {#filelog-engine}

Этот движок позволяет обрабатывать файлы журналов приложений в виде потока записей.

`FileLog` позволяет вам:

- Подписаться на файлы журналов.
- Обрабатывать новые записи по мере их добавления в подписанные файлы журналов.

## Создание таблицы {#creating-a-table}

``` sql
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

- `path_to_logs` – Путь к файлам журналов для подписки. Это может быть путь к директории с файлами журналов или к одному файлу журнала. Обратите внимание, что ClickHouse допускает только пути внутри директории `user_files`.
- `format_name` - Формат записи. Обратите внимание, что FileLog обрабатывает каждую строку в файле как отдельную запись, и не все форматы данных подходят для этого.

Необязательные параметры:

- `poll_timeout_ms` - Тайм-аут для одного опроса из файла журнала. По умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `poll_max_batch_size` — Максимальное количество записей, которые будут опрошены за один опрос. По умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `max_block_size` — Максимальный размер пакета (в записях) для опроса. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `max_threads` - Максимальное количество потоков для разбора файлов, по умолчанию 0, что означает, что число будет max(1, physical_cpu_cores / 4).
- `poll_directory_watch_events_backoff_init` - Начальное значение задержки для потока наблюдения за директорией. По умолчанию: `500`.
- `poll_directory_watch_events_backoff_max` - Максимальное значение задержки для потока наблюдения за директорией. По умолчанию: `32000`.
- `poll_directory_watch_events_backoff_factor` - Скорость уменьшения задержки, по умолчанию экспоненциальная. По умолчанию: `2`.
- `handle_error_mode` — Как обрабатывать ошибки для движка FileLog. Возможные значения: default (исключение будет вызвано, если не удастся разобрать сообщение), stream (сообщение исключения и сырое сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).

## Описание {#description}

Доставленные записи отслеживаются автоматически, так что каждая запись в файле журнала учитывается только один раз.

`SELECT` не особенно полезен для чтения записей (за исключением отладки), потому что каждая запись может быть прочитана только один раз. Более практично создать потоки в реальном времени, используя [материализованные представления](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания таблицы FileLog и рассматривайте её как поток данных.
2. Создайте таблицу с желаемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` присоединяется к движку, оно начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать записи из файлов журналов и преобразовывать их в нужный формат с помощью `SELECT`.
Одна таблица FileLog может иметь столько материализованных представлений, сколько вы хотите, они не читают данные из таблицы напрямую, а получают новые записи (пакетами), таким образом вы можете записывать в несколько таблиц с различным уровнем детализации (с группировкой - агрегированием и без).

Пример:

``` sql
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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

Чтобы остановить получение потоковых данных или изменить логику преобразования, отсоедините материализованное представление:

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу, используя `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Виртуальные колонки {#virtual-columns}

- `_filename` - Имя файла журнала. Тип данных: `LowCardinality(String)`.
- `_offset` - Смещение в файле журнала. Тип данных: `UInt64`.

Дополнительные виртуальные колонки при `handle_error_mode='stream'`:

- `_raw_record` - Сырая запись, которую не удалось успешно разобрать. Тип данных: `Nullable(String)`.
- `_error` - Сообщение об исключении, произошедшее во время неудачного разбора. Тип данных: `Nullable(String)`.

Примечание: виртуальные колонки `_raw_record` и `_error` заполняются только в случае исключения во время разбора, они всегда равны `NULL`, когда сообщение было успешно разобрано.
