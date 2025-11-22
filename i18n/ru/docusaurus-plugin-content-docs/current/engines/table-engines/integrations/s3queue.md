---
description: 'Этот движок обеспечивает интеграцию с экосистемой Amazon S3 и поддерживает
  потоковый импорт данных. Аналогичен движкам Kafka и RabbitMQ, но предоставляет функции,
  специфичные для S3.'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'Табличный движок S3Queue'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# Движок таблицы S3Queue

Этот движок обеспечивает интеграцию с экосистемой [Amazon S3](https://aws.amazon.com/s3/) и поддерживает потоковый импорт. Движок аналогичен движкам [Kafka](../../../engines/table-engines/integrations/kafka.md) и [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md), но предоставляет возможности, специфичные для S3.

Важно учитывать следующее замечание из [оригинального PR с реализацией S3Queue](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183): когда к этому движку подключается `MATERIALIZED VIEW`, движок таблицы S3Queue начинает собирать данные в фоновом режиме.



## Создание таблицы {#creating-a-table}

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
До версии `24.7` необходимо использовать префикс `s3queue_` для всех настроек, за исключением `mode`, `after_processing` и `keeper_path`.
:::

**Параметры движка**

Параметры `S3Queue` совпадают с параметрами табличного движка `S3`. См. раздел о параметрах [здесь](../../../engines/table-engines/integrations/s3.md#parameters).

**Пример**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

Использование именованных коллекций:

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


## Настройки {#settings}

Чтобы получить список настроек, настроенных для таблицы, используйте таблицу `system.s3_queue_settings`. Доступно начиная с версии `24.10`.

### Mode {#mode}

Возможные значения:

- unordered — В неупорядоченном режиме набор всех уже обработанных файлов отслеживается с помощью постоянных узлов в ZooKeeper.
- ordered — В упорядоченном режиме файлы обрабатываются в лексикографическом порядке. Это означает, что если файл с именем 'BBB' был обработан в какой-то момент, а позже в бакет добавляется файл с именем 'AA', он будет проигнорирован. В ZooKeeper хранятся только максимальное имя (в лексикографическом смысле) успешно обработанного файла и имена файлов, для которых будет выполнена повторная попытка после неудачной загрузки.

Значение по умолчанию: `ordered` в версиях до 24.6. Начиная с версии 24.6 значение по умолчанию отсутствует, настройку необходимо указывать вручную. Для таблиц, созданных в более ранних версиях, значение по умолчанию останется `Ordered` для обеспечения совместимости.

### `after_processing` {#after_processing}

Удалить или сохранить файл после успешной обработки.
Возможные значения:

- keep.
- delete.

Значение по умолчанию: `keep`.

### `keeper_path` {#keeper_path}

Путь в ZooKeeper может быть указан как настройка движка таблицы, или путь по умолчанию может быть сформирован из пути, предоставленного глобальной конфигурацией, и UUID таблицы.
Возможные значения:

- String.

Значение по умолчанию: `/`.

### `s3queue_loading_retries` {#loading_retries}

Повторять попытки загрузки файла до указанного количества раз. По умолчанию повторные попытки не выполняются.
Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_processing_threads_num` {#processing_threads_num}

Количество потоков для выполнения обработки. Применяется только для режима `Unordered`.

Значение по умолчанию: количество процессоров или 16.

### `s3queue_parallel_inserts` {#parallel_inserts}

По умолчанию `processing_threads_num` создаёт один `INSERT`, поэтому загрузка файлов и парсинг выполняются только в нескольких потоках.
Но это ограничивает параллелизм, поэтому для лучшей пропускной способности используйте `parallel_inserts=true`, это позволит вставлять данные параллельно (но имейте в виду, что это приведёт к большему количеству сгенерированных кусков данных для семейства MergeTree).

:::note
`INSERT` будут создаваться с учётом настроек `max_process*_before_commit`.
:::

Значение по умолчанию: `false`.

### `s3queue_enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

Включить логирование в `system.s3queue_log`.

Значение по умолчанию: `0`.

### `s3queue_polling_min_timeout_ms` {#polling_min_timeout_ms}

Указывает минимальное время в миллисекундах, которое ClickHouse ожидает перед выполнением следующей попытки опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### `s3queue_polling_max_timeout_ms` {#polling_max_timeout_ms}

Определяет максимальное время в миллисекундах, которое ClickHouse ожидает перед инициацией следующей попытки опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `10000`.

### `s3queue_polling_backoff_ms` {#polling_backoff_ms}

Определяет дополнительное время ожидания, добавляемое к предыдущему интервалу опроса, когда новые файлы не найдены. Следующий опрос происходит после суммы предыдущего интервала и этого значения отсрочки, или максимального интервала, в зависимости от того, что меньше.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_tracked_files_limit` {#tracked_files_limit}

Позволяет ограничить количество узлов ZooKeeper при использовании режима 'unordered', не действует для режима 'ordered'.
При достижении лимита самые старые обработанные файлы будут удалены из узла ZooKeeper и обработаны снова.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### `s3queue_tracked_file_ttl_sec` {#tracked_file_ttl_sec}

Максимальное количество секунд для хранения обработанных файлов в узле ZooKeeper (по умолчанию хранятся бессрочно) для режима 'unordered', не действует для режима 'ordered'.
По истечении указанного количества секунд файл будет импортирован повторно.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_cleanup_interval_min_ms` {#cleanup_interval_min_ms}

Для режима 'Ordered'. Определяет минимальную границу интервала перепланирования для фоновой задачи, которая отвечает за поддержание TTL отслеживаемых файлов и максимального набора отслеживаемых файлов.

Значение по умолчанию: `10000`.

### `s3queue_cleanup_interval_max_ms` {#cleanup_interval_max_ms}


Для режима 'Ordered'. Определяет максимальную границу интервала перепланирования для фоновой задачи, отвечающей за поддержание TTL отслеживаемых файлов и максимального количества отслеживаемых файлов.

Значение по умолчанию: `30000`.

### `s3queue_buckets` {#buckets}

Для режима 'Ordered'. Доступно начиная с версии `24.6`. Если существует несколько реплик таблицы S3Queue, каждая из которых работает с одним и тем же каталогом метаданных в keeper, значение `s3queue_buckets` должно быть не меньше количества реплик. Если также используется параметр `s3queue_processing_threads`, имеет смысл дополнительно увеличить значение параметра `s3queue_buckets`, так как он определяет фактическую степень параллелизма обработки `S3Queue`.

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

По умолчанию таблица S3Queue всегда использовала эфемерные узлы обработки, что могло приводить к дублированию данных в случае истечения сессии zookeeper до того, как S3Queue зафиксирует обработанные файлы в zookeeper, но после начала обработки. Этот параметр заставляет сервер исключить возможность появления дубликатов при истечении сессии keeper.

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

В случае аварийного завершения работы сервера возможна ситуация, когда при включённом параметре `use_persistent_processing_nodes` узлы обработки не будут удалены. Этот параметр определяет период времени, в течение которого эти узлы обработки могут быть безопасно удалены.

Значение по умолчанию: `3600` (1 час).


## Настройки, связанные с S3 {#s3-settings}

Движок поддерживает все настройки, связанные с S3. Подробнее о настройках S3 см. [здесь](../../../engines/table-engines/integrations/s3.md).


## Доступ к S3 на основе ролей {#s3-role-based-access}

<ScalePlanFeatureBadge feature='S3 Role-Based Access' />

Движок таблиц s3Queue поддерживает доступ на основе ролей.
Инструкции по настройке роли для доступа к вашему бакету см. в документации [здесь](/cloud/data-sources/secure-s3).

После настройки роли можно передать `roleARN` через параметр `extra_credentials`, как показано ниже:

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


## Режим ordered для S3Queue {#ordered-mode}

Режим обработки `S3Queue` позволяет хранить меньше метаданных в ZooKeeper, но имеет ограничение: файлы, добавленные позже по времени, должны иметь алфавитно-цифровые имена, которые идут дальше в порядке сортировки.

Режим `ordered` для `S3Queue`, как и режим `unordered`, поддерживает настройку `(s3queue_)processing_threads_num` (префикс `s3queue_` необязателен), которая позволяет управлять количеством потоков, обрабатывающих файлы `S3` локально на сервере.
Кроме того, режим `ordered` также вводит другую настройку `(s3queue_)buckets`, которая означает «логические потоки». В распределённом сценарии, когда имеется несколько серверов с репликами таблицы `S3Queue`, эта настройка определяет количество единиц обработки. Например, каждый поток обработки на каждой реплике `S3Queue` будет пытаться заблокировать определённый `bucket` для обработки; каждый `bucket` привязывается к определённым файлам по хешу имени файла. Поэтому в распределённом сценарии настоятельно рекомендуется, чтобы значение настройки `(s3queue_)buckets` было как минимум равно количеству реплик или больше. Допустимо иметь количество buckets больше, чем количество реплик. Наиболее оптимальным сценарием является случай, когда значение настройки `(s3queue_)buckets` равно произведению `number_of_replicas` и `(s3queue_)processing_threads_num`.
Настройка `(s3queue_)processing_threads_num` не рекомендуется к использованию в версиях до `24.6`.
Настройка `(s3queue_)buckets` доступна начиная с версии `24.6`.


## Description {#description}

`SELECT` не особенно полезен для потоковой загрузки данных (за исключением отладки), поскольку каждый файл может быть импортирован только один раз. Более практичным является создание потоков обработки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания таблицы, которая будет получать данные из указанного пути в S3, и рассматривайте её как поток данных.
2.  Создайте таблицу с требуемой структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, он начинает собирать данные в фоновом режиме.

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


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу.
- `_file` — Имя файла.
- `_size` — Размер файла.
- `_time` — Время создания файла.

Подробнее о виртуальных столбцах см. [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).


## Подстановочные символы в пути {#wildcards-in-path}

Аргумент `path` может указывать на несколько файлов с использованием подстановочных символов в стиле bash. Для обработки файл должен существовать и соответствовать всему шаблону пути. Список файлов определяется во время выполнения запроса `SELECT` (а не в момент выполнения `CREATE`).

- `*` — Соответствует любому количеству любых символов, кроме `/`, включая пустую строку.
- `**` — Соответствует любому количеству любых символов, включая `/`, включая пустую строку.
- `?` — Соответствует любому одиночному символу.
- `{some_string,another_string,yet_another_one}` — Соответствует любой из строк `'some_string', 'another_string', 'yet_another_one'`.
- `{N..M}` — Соответствует любому числу в диапазоне от N до M, включая обе границы. N и M могут содержать ведущие нули, например `000..078`.

Конструкции с `{}` аналогичны табличной функции [remote](../../../sql-reference/table-functions/remote.md).


## Ограничения {#limitations}

1. Дублирование строк может происходить в следующих случаях:

- возникает исключение во время парсинга в процессе обработки файла, и включены повторные попытки через параметр `s3queue_loading_retries`;

- `S3Queue` настроен на нескольких серверах, указывающих на один и тот же путь в ZooKeeper, и сессия keeper истекает до того, как один из серверов успевает зафиксировать обработанный файл, что может привести к тому, что другой сервер начнёт обработку файла, который мог быть частично или полностью обработан первым сервером; однако это не относится к версии 25.8 и выше при `use_persistent_processing_nodes = 1`.

- происходит аварийное завершение работы сервера.

2. Если `S3Queue` настроен на нескольких серверах, указывающих на один и тот же путь в ZooKeeper, и используется режим `Ordered`, то параметр `s3queue_loading_retries` не будет работать. Эта проблема будет исправлена в ближайшее время.


## Интроспекция {#introspection}

Для интроспекции используйте таблицу `system.s3queue` (без сохранения состояния) и постоянную таблицу `system.s3queue_log`.

1. `system.s3queue`. Эта таблица не сохраняет данные и отображает состояние `S3Queue` в памяти: какие файлы обрабатываются в данный момент, какие файлы обработаны или завершились с ошибкой.

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
COMMENT 'Contains in-memory state of S3Queue metadata and currently processed rows per file.' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Пример:

```sql

SELECT *
FROM system.s3queue

Row 1:
──────
zookeeper_path:        /clickhouse/s3queue/25ea5621-ae8c-40c7-96d0-cec959c5ab88/3b3f66a1-9866-4c2e-ba78-b6bfa154207e
file_name:             wikistat/original/pageviews-20150501-030000.gz
rows_processed:        5068534
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:31
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5068534,'SelectedBytes':198132283,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':2480,'S3QueueSetFileProcessedMicroseconds':9985,'S3QueuePullMicroseconds':273776,'LogTest':17}
exception:
```

2. `system.s3queue_log`. Постоянная таблица. Содержит ту же информацию, что и `system.s3queue`, но для обработанных (`processed`) и завершившихся с ошибкой (`failed`) файлов.

Структура таблицы:

```sql
SHOW CREATE TABLE system.s3queue_log

Query id: 0ad619c3-0f2a-4ee4-8b40-c73d86e04314

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

Чтобы использовать `system.s3queue_log`, определите её конфигурацию в конфигурационном файле сервера:

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
