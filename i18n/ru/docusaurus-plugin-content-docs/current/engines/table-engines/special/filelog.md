---
description: 'Этот движок позволяет обрабатывать файлы журналов приложений как поток
  записей.'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'Движок таблиц FileLog'
doc_type: 'reference'
---



# Движок таблицы FileLog {#filelog-engine}

Этот движок позволяет обрабатывать файлы журналов приложений как поток записей.

`FileLog` позволяет:

- Подписываться на файлы журналов.
- Обрабатывать новые записи по мере их добавления в подписанные файлы журналов.



## Создание таблицы

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

* `path_to_logs` – Путь к лог-файлам для чтения. Это может быть путь к каталогу с лог-файлами или к отдельному лог-файлу. Обратите внимание, что ClickHouse допускает только пути внутри каталога `user_files`.
* `format_name` - Формат записей. Учтите, что FileLog обрабатывает каждую строку в файле как отдельную запись, и не все форматы данных подходят для этого.

Необязательные параметры:

* `poll_timeout_ms` - Тайм-аут для одного опроса лог-файла. Значение по умолчанию: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
* `poll_max_batch_size` — Максимальное количество записей, считываемых за один опрос. Значение по умолчанию: [max&#95;block&#95;size](/operations/settings/settings#max_block_size).
* `max_block_size` — Максимальный размер пакета (в записях) для одного опроса. Значение по умолчанию: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size).
* `max_threads` - Максимальное количество потоков для разбора файлов, по умолчанию `0`, что означает значение max(1, physical&#95;cpu&#95;cores / 4).
* `poll_directory_watch_events_backoff_init` - Начальное значение паузы для потока, отслеживающего каталог. Значение по умолчанию: `500`.
* `poll_directory_watch_events_backoff_max` - Максимальное значение паузы для потока, отслеживающего каталог. Значение по умолчанию: `32000`.
* `poll_directory_watch_events_backoff_factor` - Коэффициент увеличения паузы (backoff), по умолчанию экспоненциальный. Значение по умолчанию: `2`.
* `handle_error_mode` — Как обрабатывать ошибки в движке FileLog. Возможные значения: default (будет сгенерировано исключение, если не удалось разобрать сообщение), stream (сообщение об исключении и исходное сообщение будут сохранены во виртуальных столбцах `_error` и `_raw_message`).


## Описание

Поступившие записи отслеживаются автоматически, поэтому каждая запись в файле журнала учитывается только один раз.

`SELECT` не особенно полезен для чтения записей (кроме отладки), потому что каждую запись можно прочитать только один раз. Гораздо практичнее создавать потоки в реальном времени, используя [материализованные представления](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания таблицы FileLog и рассматривайте её как поток данных.
2. Создайте таблицу с требуемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, оно начинает собирать данные в фоновом режиме. Это позволяет постоянно получать записи из файлов журналов и преобразовывать их в нужный формат с помощью `SELECT`.
Одна таблица FileLog может иметь сколько угодно материализованных представлений; они не читают данные из таблицы напрямую, а получают новые записи (блоками), таким образом можно записывать данные в несколько таблиц с разным уровнем детализации (с группировкой — агрегацией и без неё).

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

Чтобы прекратить приём потоковых данных или изменить логику преобразования, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью команды `ALTER`, мы рекомендуем предварительно отключить материализованное представление, чтобы избежать расхождений между целевой таблицей и данными из представления.


## Виртуальные столбцы {#virtual-columns}

- `_filename` — Имя файла журнала. Тип данных: `LowCardinality(String)`.
- `_offset` — Смещение в файле журнала. Тип данных: `UInt64`.

Дополнительные виртуальные столбцы при `handle_error_mode='stream'`:

- `_raw_record` — Исходная запись, которую не удалось разобрать. Тип данных: `Nullable(String)`.
- `_error` — Сообщение об исключении, возникшем при неудачном разборе. Тип данных: `Nullable(String)`.

Примечание: виртуальные столбцы `_raw_record` и `_error` заполняются только в случае исключения во время разбора; при успешном разборе сообщения они всегда имеют значение `NULL`.
