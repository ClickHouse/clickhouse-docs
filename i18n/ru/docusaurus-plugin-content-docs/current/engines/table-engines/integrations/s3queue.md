---
slug: '/engines/table-engines/integrations/s3queue'
sidebar_label: S3Queue
sidebar_position: 181
description: 'Этот QUEUE предоставляет возможности интеграции с Amazon S3, и разрешает'
title: 'Движок таблиц S3Queue'
doc_type: reference
---
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue движок таблиц

Этот движок обеспечивает интеграцию с экосистемой [Amazon S3](https://aws.amazon.com/s3/) и позволяет потоковый импорт. Данный движок похож на движки [Kafka](../../../engines/table-engines/integrations/kafka.md), [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md), но предоставляет функции, специфичные для S3.

Важно понимать эту заметку из [оригинального PR для реализации S3Queue](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183): когда `MATERIALIZED VIEW` соединяется с движком, движок S3Queue начинает собирать данные в фоновом режиме.

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
Перед `24.7` необходимо использовать префикс `s3queue_` для всех настроек, кроме `mode`, `after_processing` и `keeper_path`.
:::

**Параметры движка**

Параметры `S3Queue` такие же, как и поддерживаемые движком `S3`. См. раздел параметров [здесь](../../../engines/table-engines/integrations/s3.md#parameters).

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

Чтобы получить список настроек, настроенных для таблицы, используйте таблицу `system.s3_queue_settings`. Доступно с `24.10`.

### Режим {#mode}

Возможные значения:

- unordered — В режиме unordered отслеживается набор всех уже обработанных файлов с помощью постоянных узлов в ZooKeeper.
- ordered — В режиме ordered файлы обрабатываются в лексикографическом порядке. Это означает, что если файл с именем 'BBB' был обработан в какой-то момент, а позднее файл с именем 'AA' добавляется в корзину, он будет проигнорирован. Хранится только максимальное имя (в лексикографическом смысле) успешно потребленного файла и имена файлов, которые будут повторно обработаны после неудачной попытки загрузки в ZooKeeper.

Значение по умолчанию: `ordered` в версиях до 24.6. Начиная с 24.6, значение по умолчанию отсутствует, настройка становится обязательной для указания вручную. Для таблиц, созданных в более ранних версиях, значение по умолчанию останется `Ordered` для совместимости.

### `after_processing` {#after_processing}

Удалить или сохранить файл после успешной обработки. Возможные значения:

- keep.
- delete.

Значение по умолчанию: `keep`.

### `keeper_path` {#keeper_path}

Путь в ZooKeeper можно указать как настройку движка таблицы или сформировать путь по умолчанию из пути, предоставленного глобальной конфигурацией, и UUID таблицы. Возможные значения:

- Строка.

Значение по умолчанию: `/`.

### `s3queue_loading_retries` {#loading_retries}

Повторная попытка загрузки файла до указанного количества раз. По умолчанию повторов нет. Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_processing_threads_num` {#processing_threads_num}

Количество потоков для выполнения обработки. Применяется только для `Unordered` режима.

Значение по умолчанию: число CPU или 16.

### `s3queue_parallel_inserts` {#parallel_inserts}

По умолчанию `processing_threads_num` будет генерировать один `INSERT`, поэтому это будет только загружать файлы и анализировать их в нескольких потоках. Но это ограничивает параллелизм, поэтому для повышения пропускной способности используйте `parallel_inserts=true`, это позволит вставлять данные одновременно (но имейте в виду, что это приведет к большему количеству сгенерированных частей данных для семейства MergeTree).

:::note
`INSERT`s будут созданы с учетом настроек `max_process*_before_commit`.
:::

Значение по умолчанию: `false`.

### `s3queue_enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

Включить логирование в `system.s3queue_log`.

Значение по умолчанию: `0`.

### `s3queue_polling_min_timeout_ms` {#polling_min_timeout_ms}

Указывает минимальное время в миллисекундах, которое ClickHouse ждет перед следующей попыткой опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### `s3queue_polling_max_timeout_ms` {#polling_max_timeout_ms}

Определяет максимальное время в миллисекундах, которое ClickHouse ждет перед началом следующей попытки опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `10000`.

### `s3queue_polling_backoff_ms` {#polling_backoff_ms}

Определяет дополнительное время ожидания, добавляемое к предыдущему интервальному опросу, когда новые файлы не найдены. Следующий опрос происходит после суммы предыдущего интервала и этого значения backoff или максимального интервала, в зависимости от того, что меньше.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_tracked_files_limit` {#tracked_files_limit}

Позволяет ограничить количество узлов ZooKeeper, если используется режим 'unordered', ничего не делает для режима 'ordered'. Если лимит достигнут, самые старые обработанные файлы будут удалены из узла ZooKeeper и переработаны.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### `s3queue_tracked_file_ttl_sec` {#tracked_file_ttl_sec}

Максимальное количество секунд для хранения обработанных файлов в узле ZooKeeper (по умолчанию хранить бесконечно) для режима 'unordered', ничего не делает для режима 'ordered'. После указанного количества секунд файл будет повторно импортирован.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### `s3queue_cleanup_interval_min_ms` {#cleanup_interval_min_ms}

Для 'Ordered' режима. Определяет минимальную границу интервала повторного планирования для фонового задания, которое отвечает за поддержание TTL отслеживаемых файлов и максимального набора отслеживаемых файлов.

Значение по умолчанию: `10000`.

### `s3queue_cleanup_interval_max_ms` {#cleanup_interval_max_ms}

Для 'Ordered' режима. Определяет максимальную границу интервала повторного планирования для фонового задания, которое отвечает за поддержание TTL отслеживаемых файлов и максимального набора отслеживаемых файлов.

Значение по умолчанию: `30000`.

### `s3queue_buckets` {#buckets}

Для 'Ordered' режима. Доступно с `24.6`. Если есть несколько реплик таблицы S3Queue, каждая работающая с одной и той же директории метаданных в Keeper, значение `s3queue_buckets` должно быть равно как минимум количеству реплик. Если также используется настройка `s3queue_processing_threads`, имеет смысл увеличить значение настройки `s3queue_buckets`, так как оно определяет фактический параллелизм обработки `S3Queue`.

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

По умолчанию таблица S3Queue всегда использовала эфемерные узлы обработки, что могло привести к дублированиям в данных, если сессия ZooKeeper истекает до того как S3Queue зафиксирует обработанные файлы в ZooKeeper, но после того как он начал обработку. Эта настройка заставляет сервер исключить возможность дублирования в случае истечения сессии Keeper.

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

В случае некорректного завершения сервера возможно, что если `use_persistent_processing_nodes` включен, мы можем иметь не удаленные узлы обработки. Эта настройка определяет период времени, когда эти узлы обработки могут быть безопасно очищены.

Значение по умолчанию: `3600` (1 час).

## Настройки, связанные с S3 {#s3-settings}

Движок поддерживает все настройки, связанные с s3. Для получения дополнительной информации о настройках S3 см. [здесь](../../../engines/table-engines/integrations/s3.md).

## Контроль доступа на основе ролей S3 {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

Движок таблицы s3Queue поддерживает контроль доступа на основе ролей. Ознакомьтесь с документацией [здесь](/cloud/security/secure-s3) для шагов по настройке роли для доступа к вашей корзине.

После настройки роли `roleARN` можно передать через параметр `extra_credentials`, как показано ниже:
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

## Режим `S3Queue` ordered {#ordered-mode}

Режим обработки `S3Queue` позволяет хранить меньше метаданных в ZooKeeper, но имеет ограничение, что файлы, добавленные позже по времени, должны иметь алфавитно большие имена.

Режим `ordered` для `S3Queue`, как и `unordered`, поддерживает настройку `(s3queue_)processing_threads_num` (префикс `s3queue_` является необязательным), который позволяет контролировать количество потоков, которые будут обрабатывать `S3` файлы локально на сервере. В дополнение к этому режим `ordered` также вводит другую настройку, называемую `(s3queue_)buckets`, что означает "логические потоки". Это означает, что в распределенном сценарии, когда есть несколько серверов с репликами таблицы `S3Queue`, данная настройка определяет количество единиц обработки. Например, каждый поток обработки на каждой реплике `S3Queue` будет пытаться заблокировать определенную `корзину` для обработки, каждая `корзина` привязана к определенным файлам по хешу имени файла. Поэтому в распределенном сценарии настоятельно рекомендуется, чтобы настройка `(s3queue_)buckets` была как минимум равна количеству реплик или больше. Хорошо иметь количество корзин больше, чем количество реплик. Наиболее оптимальным сценарием будет, если значение `(s3queue_)buckets` будет равно произведению `number_of_replicas` и `(s3queue_)processing_threads_num`. Настройка `(s3queue_)processing_threads_num` не рекомендуется к использованию до версии `24.6`. Настройка `(s3queue_)buckets` доступна начиная с версии `24.6`.

## Описание {#description}

`SELECT` не является особенно полезным для потокового импорта (кроме для отладки), потому что каждый файл можно импортировать только один раз. Гораздо практичнее создавать потоки в реальном времени с помощью [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания таблицы для потребления из указанного пути в S3 и считайте это потоком данных.
2. Создайте таблицу с желаемой структурой.
3. Создайте материализованное представление, которое конвертирует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` соединяется с движком, он начинает собирать данные в фоновом режиме.

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

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу.
- `_file` — Имя файла.
- `_size` — Размер файла.
- `_time` — Время создания файла.

Для получения дополнительной информации о виртуальных колонках смотрите [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).

## Подстановочные знаки в пути {#wildcards-in-path}

Аргумент `path` может указывать на несколько файлов, используя подстановочные знаки в стиле bash. Для обработки файл должен существовать и соответствовать полному шаблону пути. Перечисление файлов определяется во время `SELECT` (не в момент `CREATE`).

- `*` — Заменяет любое количество любых символов, кроме `/`, включая пустую строку.
- `**` — Заменяет любое количество любых символов, включая `/`, включая пустую строку.
- `?` — Заменяет любой единичный символ.
- `{some_string,another_string,yet_another_one}` — Заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`.
- `{N..M}` — Заменяет любое число в диапазоне от N до M, включая оба конца. N и M могут иметь ведущие нули, например, `000..078`.

Конструкции с `{}` аналогичны функции таблицы [remote](../../../sql-reference/table-functions/remote.md).

## Ограничения {#limitations}

1. Дублированные строки могут возникнуть в результате:

- Исключение происходит во время разбора в середине обработки файла, и повторы включены через `s3queue_loading_retries`;

- `S3Queue` настроен на нескольких серверах, указывающих на один и тот же путь в ZooKeeper, и сессия Keeper истекает до того, как один сервер смог зафиксировать обработанный файл, что может привести к тому, что другой сервер возьмет на себя обработку файла, который мог быть частично или полностью обработан первым сервером; Однако это не так с версии 25.8, если `use_persistent_processing_nodes = 1`.

- Некорректное завершение сервера.

2. `S3Queue` настроен на нескольких серверах, указывающих на один и тот же путь в ZooKeeper и используется режим `Ordered`, тогда `s3queue_loading_retries` не будет работать. Это будет исправлено в ближайшее время.

## Интроспекция {#introspection}

Для интроспекции используйте бессостоящую таблицу `system.s3queue` и постоянную таблицу `system.s3queue_log`.

1. `system.s3queue`. Эта таблица не является постоянной и показывает состояние `S3Queue` в памяти: какие файлы в настоящее время обрабатываются, какие файлы обработаны или завершились неудачей.

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

2. `system.s3queue_log`. Постоянная таблица. Содержит ту же информацию, что и `system.s3queue`, но для `processed` и `failed` файлов.

Таблица имеет следующую структуру:

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

Для использования `system.s3queue_log` определите его конфигурацию в файле конфигурации сервера:

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