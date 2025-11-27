---
description: 'Этот движок обеспечивает интеграцию с экосистемой Amazon S3 и позволяет
  выполнять потоковый импорт. Аналогичен движкам Kafka и RabbitMQ, но предоставляет
  специфичные для S3 возможности.'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'Табличный движок S3Queue'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# Движок таблицы S3Queue

Этот движок обеспечивает интеграцию с экосистемой [Amazon S3](https://aws.amazon.com/s3/) и позволяет выполнять потоковый импорт. Он аналогичен движкам [Kafka](../../../engines/table-engines/integrations/kafka.md) и [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md), но предоставляет функции, специфичные для S3.

Важно учитывать следующее примечание из [исходного PR по реализации S3Queue](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183): когда к таблице с этим движком присоединяется `MATERIALIZED VIEW`, движок таблицы S3Queue начинает собирать данные в фоновом режиме.

## Создать таблицу

```sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 16,]
    [parallel_inserts = false,]
    [enable_logging_to_queue_log = true,]
    [last_processed_path = "",]
    [tracked_files_limit = 1000,]
    [tracked_file_ttl_sec = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
    [buckets = 0,]
    [list_objects_batch_size = 1000,]
    [enable_hash_ring_filtering = 0,]
    [max_processed_files_before_commit = 100,]
    [max_processed_rows_before_commit = 0,]
    [max_processed_bytes_before_commit = 0,]
    [max_processing_time_sec_before_commit = 0,]
```

:::warning
До версии `24.7` требуется использовать префикс `s3queue_` для всех настроек, кроме `mode`, `after_processing` и `keeper_path`.
:::

**Параметры движка**

Параметры `S3Queue` такие же, как у табличного движка `S3`. См. раздел «Параметры» [здесь](../../../engines/table-engines/integrations/s3.md#parameters).

**Пример**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

Использование коллекций с именами:

```xml
<clickhouse>
    <named_collections>
        <s3queue_conf>
            <url>'https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
        </s3queue_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue(s3queue_conf, format = 'CSV', compression_method = 'gzip')
SETTINGS
    mode = 'ordered';
```


## Настройки \{#settings\}

Чтобы получить список настроек, заданных для таблицы, используйте таблицу `system.s3_queue_settings`. Доступно, начиная с версии `24.10`.

### Mode \{#mode\}

Возможные значения:

- unordered — В режиме unordered множество всех уже обработанных файлов отслеживается с помощью постоянных узлов в ZooKeeper.
- ordered — В режиме ordered файлы обрабатываются в лексикографическом порядке. Это означает, что если файл с именем `BBB` был обработан в какой‑то момент, а позже в бакет был добавлен файл с именем `AA`, он будет проигнорирован. В ZooKeeper сохраняются только максимальное имя (в лексикографическом смысле) успешно обработанного файла и имена файлов, которые будут повторно загружены после неудачной попытки загрузки.

Значение по умолчанию: `ordered` в версиях до 24.6. Начиная с 24.6 значение по умолчанию отсутствует, настройку требуется указывать вручную. Для таблиц, созданных в более ранних версиях, значение по умолчанию останется `ordered` для сохранения совместимости.

### `after_processing`

Что делать с файлом после успешной обработки.

Возможные значения:

* keep.
* delete.
* move.
* tag.

Значение по умолчанию: `keep`.

Для варианта `move` требуются дополнительные настройки. В случае перемещения в пределах того же бакета необходимо указать новый префикс пути в параметре `after_processing_move_prefix`.

Перемещение в другой S3‑бакет требует указания URI целевого бакета в параметре `after_processing_move_uri`, а также учетных данных доступа к S3 в параметрах `after_processing_move_access_key_id` и `after_processing_move_secret_access_key`.

Пример:

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_retries = 20,
    after_processing_move_prefix = 'dst_prefix',
    after_processing_move_uri = 'https://clickhouse-public-datasets.s3.amazonaws.com/dst-bucket',
    after_processing_move_access_key_id = 'test',
    after_processing_move_secret_access_key = 'test';
```

Для перемещения данных из одного контейнера Azure в другой необходимо указать строку подключения Blob Storage в параметре `after_processing_move_connection_string` и имя контейнера в параметре `after_processing_move_container`. См. [настройки AzureQueue](../../../engines/table-engines/integrations/azure-queue.md#settings).

Для добавления тегов необходимо указать ключ и значение тега в параметрах `after_processing_tag_key` и `after_processing_tag_value`.


### `after_processing_retries` \{#after_processing_retries\}

Количество повторных попыток выполнения запрошенного действия постобработки перед тем, как прекратить попытки.

Возможные значения:

- Неотрицательное целое число.

Значение по умолчанию: `10`.

### `after_processing_move_access_key_id` \{#after_processing_move_access_key_id\}

ID ключа доступа (Access Key ID) для S3‑бакета, в который нужно переместить успешно обработанные файлы, если целевым местом назначения является другой S3‑бакет.

Возможные значения:

- Строка.

Значение по умолчанию: пустая строка.

### `after_processing_move_prefix` \{#after_processing_move_prefix\}

Префикс пути, в который перемещаются успешно обработанные файлы. Применимо как при перемещении в пределах того же бакета, так и в другой бакет.

Возможные значения:

- Строка.

Значение по умолчанию: пустая строка.

### `after_processing_move_secret_access_key` \{#after_processing_move_secret_access_key\}

Secret Access Key для S3‑бакета, в который нужно перемещать успешно обработанные файлы, если целевой ресурс — другой S3‑бакет.

Возможные значения:

- Строка.

Значение по умолчанию: пустая строка.

### `after_processing_move_uri` \{#after_processing_move_uri\}

URI S3-бакета, в который следует перемещать успешно обработанные файлы, если местом назначения является другой S3-бакет.

Возможные значения:

- Строка.

Значение по умолчанию: пустая строка.

### `after_processing_tag_key` \{#after_processing_tag_key\}

Ключ тега, который будет использоваться для пометки успешно обработанных файлов, если `after_processing='tag'`.

Возможные значения:

- Строка.

Значение по умолчанию: пустая строка.

### `after_processing_tag_value` \{#after_processing_tag_value\}

Значение тега, которое будет присвоено успешно обработанным файлам, если `after_processing='tag'`.

Возможные значения:

- Строка.

Значение по умолчанию: пустая строка.

### `keeper_path` \{#keeper_path\}

Путь в ZooKeeper может быть задан в параметрах движка таблицы, либо путь по умолчанию может быть сформирован из пути, указанного в глобальной конфигурации, и UUID таблицы.
Возможные значения:

- строка.

Значение по умолчанию: `/`.

### `s3queue_loading_retries` \{#loading_retries\}

Повторять загрузку файла до указанного количества раз. По умолчанию повторы не выполняются.
Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_processing_threads_num` \{#processing_threads_num\}

Количество потоков обработки. Применяется только в режиме `Unordered`.

Значение по умолчанию: количество CPU или 16.

### `s3queue_parallel_inserts` \{#parallel_inserts\}

По умолчанию `processing_threads_num` будет выполнять один `INSERT`, поэтому файлы будут только загружаться и парситься в несколько потоков.
Но это ограничивает степень параллелизма, поэтому для лучшей пропускной способности используйте `parallel_inserts=true` — это позволит вставлять данные параллельно (но имейте в виду, что это приведёт к большему количеству создаваемых частей данных для семейства движков MergeTree).

:::note
`INSERT`-запросы будут создаваться с учётом настроек `max_process*_before_commit`.
:::

Значение по умолчанию: `false`.

### `s3queue_enable_logging_to_s3queue_log` \{#enable_logging_to_s3queue_log\}

Включает логирование в `system.s3queue_log`.

Значение по умолчанию: `0`.

### `s3queue_polling_min_timeout_ms` \{#polling_min_timeout_ms\}

Указывает минимальное время в миллисекундах, которое ClickHouse ожидает перед следующей попыткой опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### `s3queue_polling_max_timeout_ms` \{#polling_max_timeout_ms\}

Определяет максимальное время в миллисекундах, в течение которого ClickHouse ждёт перед запуском следующей попытки опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `10000`.

### `s3queue_polling_backoff_ms` \{#polling_backoff_ms\}

Определяет дополнительное время ожидания, добавляемое к предыдущему интервалу опроса при отсутствии новых файлов. Следующий опрос выполняется после истечения времени, равного сумме предыдущего интервала и этого значения backoff, либо по наступлении максимального интервала — в зависимости от того, что меньше.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_tracked_files_limit` \{#tracked_files_limit\}

Позволяет ограничить количество узлов ZooKeeper при использовании режима `unordered`; не влияет на режим `ordered`.
Если лимит достигнут, самые старые обработанные файлы будут удалены из узла ZooKeeper и обработаны повторно.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### `s3queue_tracked_file_ttl_sec` \{#tracked_file_ttl_sec\}

Максимальное время в секундах для хранения обработанных файлов в узле ZooKeeper (по умолчанию хранятся бессрочно) в режиме `unordered`; не влияет на режим `ordered`.
По истечении указанного времени файл будет загружен повторно.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_cleanup_interval_min_ms` \{#cleanup_interval_min_ms\}

Для режима `Ordered`. Определяет минимальное значение интервала перепланирования фоновой задачи, которая отвечает за поддержание TTL отслеживаемых файлов и ограничения на их максимальное количество.

Значение по умолчанию: `10000`.

### `s3queue_cleanup_interval_max_ms` \{#cleanup_interval_max_ms\}

Для режима `Ordered`. Определяет максимальный интервал между переназначениями фоновой задачи, которая отвечает за поддержание TTL отслеживаемых файлов и максимального набора отслеживаемых файлов.

Значение по умолчанию: `30000`.

### `s3queue_buckets` \{#buckets\}

Для режима `Ordered`. Доступно начиная с версии `24.6`. Если существует несколько реплик таблицы `S3Queue`, каждая из которых работает с одним и тем же каталогом метаданных в keeper, значение `s3queue_buckets` должно быть не меньше количества реплик. Если также используется настройка `s3queue_processing_threads`, имеет смысл дополнительно увеличить значение `s3queue_buckets`, так как она определяет фактический уровень параллелизма обработки `S3Queue`.

### `use_persistent_processing_nodes` \{#use_persistent_processing_nodes\}

По умолчанию таблица S3Queue всегда использовала эфемерные узлы обработки, что могло приводить к дублированию данных в случае, если сессия ZooKeeper истекает до того, как S3Queue зафиксирует обработанные файлы в ZooKeeper, но после того, как обработка уже началась. Эта настройка заставляет сервер исключить возможность появления дубликатов при истечении сессии Keeper.

### `persistent_processing_nodes_ttl_seconds` \{#persistent_processing_nodes_ttl_seconds\}

В случае некорректного завершения работы сервера, если включён `use_persistent_processing_nodes`, могут остаться неудалённые узлы обработки. Этот параметр определяет период времени, по истечении которого эти узлы обработки могут быть безопасно удалены.

Значение по умолчанию: `3600` (1 час).

## Настройки S3 \{#s3-settings\}

Движок поддерживает все настройки S3. Дополнительную информацию о настройках S3 см. [здесь](../../../engines/table-engines/integrations/s3.md).

## Ролевой доступ к S3

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

Движок таблицы s3Queue поддерживает ролевую модель доступа.
См. документацию [здесь](/cloud/data-sources/secure-s3) с описанием шагов по настройке роли для доступа к вашему бакету.

После настройки роли значение `roleARN` можно передать через параметр `extra_credentials`, как показано ниже:

```sql
CREATE TABLE s3_table
(
    ts DateTime,
    value UInt64
)
ENGINE = S3Queue(
                'https://<your_bucket>/*.csv',
                extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/<your_role>')
                ,'CSV')
SETTINGS
    ...
```


## Упорядоченный режим (ordered) для S3Queue \{#ordered-mode\}

Режим обработки `S3Queue` позволяет хранить меньше метаданных в ZooKeeper, но имеет ограничение: файлы, добавленные позже по времени, должны иметь имена, которые в алфавитно-цифровом порядке больше имён ранее добавленных файлов.

Режим `ordered` в `S3Queue`, так же как и `unordered`, поддерживает настройку `(s3queue_)processing_threads_num` (префикс `s3queue_` является необязательным), которая позволяет управлять количеством потоков, обрабатывающих файлы `S3` локально на сервере.
Кроме того, режим `ordered` вводит дополнительную настройку `(s3queue_)buckets`, которая означает «логические потоки». В распределённой конфигурации, когда есть несколько серверов с репликами таблиц `S3Queue`, эта настройка определяет количество единиц обработки. Например, каждый поток обработки на каждой реплике `S3Queue` будет пытаться захватить определённый `bucket` для обработки; каждый `bucket` сопоставляется определённым файлам по хэшу имени файла. Поэтому в распределённом сценарии настоятельно рекомендуется, чтобы значение настройки `(s3queue_)buckets` было как минимум равно количеству реплик или больше. Допустимо, если число бакетов больше количества реплик. Оптимальным будет сценарий, когда настройка `(s3queue_)buckets` равна произведению `number_of_replicas` и `(s3queue_)processing_threads_num`.
Использование настройки `(s3queue_)processing_threads_num` не рекомендуется до версии `24.6`.
Настройка `(s3queue_)buckets` доступна начиная с версии `24.6`.

## Описание

`SELECT` мало полезен для потокового импорта (кроме отладки), потому что каждый файл можно импортировать только один раз. Более практично создавать потоки в реальном времени с помощью [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте этот движок для создания таблицы, которая будет читать данные из указанного пути в S3 и рассматриваться как поток данных.
2. Создайте таблицу с требуемой структурой.
3. Создайте материализованное представление, которое преобразует данные из этого движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключено к этому движку, оно начинает собирать данные в фоновом режиме.

Пример:

```sql
  CREATE TABLE s3queue_engine_table (name String, value UInt32)
    ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
    SETTINGS
        mode = 'unordered';

  CREATE TABLE stats (name String, value UInt32)
    ENGINE = MergeTree() ORDER BY name;

  CREATE MATERIALIZED VIEW consumer TO stats
    AS SELECT name, value FROM s3queue_engine_table;

  SELECT * FROM stats ORDER BY name;
```


## Виртуальные столбцы \{#virtual-columns\}

- `_path` — Путь к файлу.
- `_file` — Имя файла.
- `_size` — Размер файла.
- `_time` — Время создания файла.

Дополнительную информацию о виртуальных столбцах см. [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).

## Подстановочные символы в `path` \{#wildcards-in-path\}

Аргумент `path` может задавать несколько файлов, используя подстановочные шаблоны в стиле bash. Чтобы файл был обработан, он должен существовать и полностью соответствовать шаблону пути. Перечень файлов определяется во время выполнения `SELECT` (а не в момент `CREATE`).

- `*` — Заменяет любое количество любых символов, кроме `/`, включая пустую строку.
- `**` — Заменяет любое количество любых символов, включая `/`, включая пустую строку.
- `?` — Заменяет ровно один произвольный символ.
- `{some_string,another_string,yet_another_one}` — Заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`.
- `{N..M}` — Заменяет любое число в диапазоне от N до M включительно. N и M могут содержать ведущие нули, например `000..078`.

Конструкции с `{}` аналогичны табличной функции [remote](../../../sql-reference/table-functions/remote.md).

## Ограничения \{#limitations\}

1. Дубликаты строк могут возникать в результате:

- во время парсинга происходит исключение в середине обработки файла, и включены повторные попытки через `s3queue_loading_retries`;

- `S3Queue` настроен на нескольких серверах, указывающих на один и тот же путь в ZooKeeper, и сессия Keeper завершается до того, как один из серверов успел зафиксировать обработанный файл, что может привести к тому, что другой сервер возьмет в обработку файл, который уже мог быть частично или полностью обработан первым сервером; однако это не актуально, начиная с версии 25.8, если `use_persistent_processing_nodes = 1`.

- аварийного завершения работы сервера.

2. Если `S3Queue` настроен на нескольких серверах, указывающих на один и тот же путь в ZooKeeper, и используется режим `Ordered`, то `s3queue_loading_retries` не будет работать. Это будет скоро исправлено.

## Интроспекция

Для интроспекции используйте неперсистентную таблицу `system.s3queue` и персистентную таблицу `system.s3queue_log`.

1. `system.s3queue`. Эта таблица неперсистентная и отображает состояние `S3Queue` в памяти: какие файлы в данный момент обрабатываются, какие файлы уже обработаны или завершились с ошибкой.

```sql
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue
(
    `database` String,
    `table` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` String,
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64)
    `exception` String
)
ENGINE = SystemS3Queue
COMMENT 'Содержит состояние метаданных S3Queue в памяти и текущее количество обработанных строк по каждому файлу.' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Пример:

```sql

SELECT *
FROM system.s3queue

Строка 1:
──────
zookeeper_path:        /clickhouse/s3queue/25ea5621-ae8c-40c7-96d0-cec959c5ab88/3b3f66a1-9866-4c2e-ba78-b6bfa154207e
file_name:             wikistat/original/pageviews-20150501-030000.gz
rows_processed:        5068534
status:                Обработано
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:31
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5068534,'SelectedBytes':198132283,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':2480,'S3QueueSetFileProcessedMicroseconds':9985,'S3QueuePullMicroseconds':273776,'LogTest':17}
exception:
```

2. `system.s3queue_log`. Персистентная таблица. Содержит ту же информацию, что и `system.s3queue`, но для файлов со статусами `processed` и `failed`.

Таблица имеет следующую структуру:

```sql
SHOW CREATE TABLE system.s3queue_log

ID запроса: 0ad619c3-0f2a-4ee4-8b40-c73d86e04314

┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue_log
(
    `event_date` Date,
    `event_time` DateTime,
    `table_uuid` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` Enum8('Processed' = 0, 'Failed' = 1),
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64),
    `exception` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Чтобы использовать `system.s3queue_log`, задайте его конфигурацию в файле конфигурации сервера:

```xml
    <s3queue_log>
        <database>system</database>
        <table>s3queue_log</table>
    </s3queue_log>
```

Пример:

```sql
SELECT *
FROM system.s3queue_log

Row 1:
──────
event_date:            2023-10-13
event_time:            2023-10-13 13:10:12
table_uuid:
file_name:             wikistat/original/pageviews-20150501-020000.gz
rows_processed:        5112621
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:12
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5112621,'SelectedBytes':198577687,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':1934,'S3QueueSetFileProcessedMicroseconds':17063,'S3QueuePullMicroseconds':5841972,'LogTest':17}
exception:
```
