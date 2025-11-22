---
description: 'Этот движок позволяет обрабатывать файлы журналов приложений как поток записей.'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'Движок таблицы FileLog'
doc_type: 'reference'
---



# Движок таблиц FileLog {#filelog-engine}

Этот движок позволяет обрабатывать файлы журналов приложений как поток записей.

`FileLog` позволяет:

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

- `path_to_logs` – Путь к файлам журналов для чтения. Может быть путём к каталогу с файлами журналов или к отдельному файлу журнала. Обратите внимание, что ClickHouse разрешает только пути внутри каталога `user_files`.
- `format_name` - Формат записи. Обратите внимание, что FileLog обрабатывает каждую строку в файле как отдельную запись, и не все форматы данных подходят для этого.

Необязательные параметры:

- `poll_timeout_ms` - Таймаут для одного опроса файла журнала. Значение по умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `poll_max_batch_size` — Максимальное количество записей, получаемых за один опрос. Значение по умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `max_block_size` — Максимальный размер пакета (в записях) для опроса. Значение по умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `max_threads` - Максимальное количество потоков для разбора файлов. Значение по умолчанию: 0, что означает max(1, physical_cpu_cores / 4).
- `poll_directory_watch_events_backoff_init` - Начальное значение задержки для потока мониторинга каталога. Значение по умолчанию: `500`.
- `poll_directory_watch_events_backoff_max` - Максимальное значение задержки для потока мониторинга каталога. Значение по умолчанию: `32000`.
- `poll_directory_watch_events_backoff_factor` - Коэффициент увеличения задержки, по умолчанию экспоненциальный. Значение по умолчанию: `2`.
- `handle_error_mode` — Способ обработки ошибок для движка FileLog. Возможные значения: default (при ошибке разбора сообщения будет выброшено исключение), stream (сообщение об ошибке и исходное сообщение будут сохранены в виртуальных столбцах `_error` и `_raw_message`).


## Description {#description}

Доставленные записи отслеживаются автоматически, поэтому каждая запись в лог-файле учитывается только один раз.

`SELECT` не особенно полезен для чтения записей (за исключением отладки), поскольку каждую запись можно прочитать только один раз. Практичнее создавать потоки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания таблицы FileLog и рассматривайте её как поток данных.
2.  Создайте таблицу с нужной структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, оно начинает собирать данные в фоновом режиме. Это позволяет непрерывно получать записи из лог-файлов и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица FileLog может иметь любое количество материализованных представлений. Они не читают данные из таблицы напрямую, а получают новые записи (блоками), таким образом можно записывать данные в несколько таблиц с различным уровнем детализации (с группировкой и агрегацией или без).

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

Чтобы остановить получение потоковых данных или изменить логику преобразования, отключите материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью `ALTER`, рекомендуется отключить материализованное представление, чтобы избежать расхождений между целевой таблицей и данными из представления.


## Виртуальные столбцы {#virtual-columns}

- `_filename` - Имя лог-файла. Тип данных: `LowCardinality(String)`.
- `_offset` - Смещение в лог-файле. Тип данных: `UInt64`.

Дополнительные виртуальные столбцы при `handle_error_mode='stream'`:

- `_raw_record` - Необработанная запись, которую не удалось успешно распарсить. Тип данных: `Nullable(String)`.
- `_error` - Сообщение об исключении, возникшем при неудачном парсинге. Тип данных: `Nullable(String)`.

Примечание: виртуальные столбцы `_raw_record` и `_error` заполняются только в случае возникновения исключения при парсинге, они всегда имеют значение `NULL`, когда сообщение было успешно распарсено.
