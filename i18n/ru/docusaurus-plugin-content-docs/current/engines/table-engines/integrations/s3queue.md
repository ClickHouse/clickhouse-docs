---
description: 'Этот движок обеспечивает интеграцию с экосистемой Amazon S3 и позволяет потоковую загрузку. Похож на движки Kafka и RabbitMQ, но предоставляет специфичные для S3 функции.'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'Движок таблиц S3Queue'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# Движок таблиц S3Queue

Этот движок обеспечивает интеграцию с [Amazon S3](https://aws.amazon.com/s3/) и позволяет потоковую загрузку. Этот движок похож на движки [Kafka](../../../engines/table-engines/integrations/kafka.md), [RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md), но предоставляет специфичные для S3 функции.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 1,]
    [enable_logging_to_s3queue_log = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [tracked_file_ttl_sec = 0,]
    [tracked_files_limit = 1000,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
```

:::warning
До `24.7` необходимо использовать префикс `s3queue_` для всех настроек, кроме `mode`, `after_processing` и `keeper_path`.
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

Чтобы получить список настроек, сконфигурированных для таблицы, используйте таблицу `system.s3_queue_settings`. Доступна с `24.10`.

### mode {#mode}

Возможные значения:

- unordered — В режиме unordered набор всех уже обработанных файлов отслеживается с помощью постоянных узлов в ZooKeeper.
- ordered — В режиме ordered файлы обрабатываются в лексикографическом порядке. Это означает, что если файл с именем 'BBB' был обработан в какой-то момент, и позже в корзину добавляется файл с именем 'AA', он будет проигнорирован. В ZooKeeper хранятся только максимальное имя (в лексикографическом смысле) успешно потребленного файла и имена файлов, которые будут повторно загружены после неудачной попытки загрузки.

Значение по умолчанию: `ordered` в версиях до 24.6. Начиная с 24.6, значение по умолчанию отсутствует, настройка должна быть указана вручную. Для таблиц, созданных в более ранних версиях, значение по умолчанию останется `Ordered` для совместимости.

### after_processing {#after_processing}

Удалить или сохранить файл после успешной обработки.
Возможные значения:

- keep.
- delete.

Значение по умолчанию: `keep`.

### keeper_path {#keeper_path}

Путь в ZooKeeper можно указать как настройку движка таблицы или формировать путь по умолчанию из глобальной конфигурации и UUID таблицы.
Возможные значения:

- String.

Значение по умолчанию: `/`.

### s3queue_loading_retries {#loading_retries}

Повторить загрузку файла до указанного количества раз. По умолчанию повторы отсутствуют.
Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### s3queue_processing_threads_num {#processing_threads_num}

Количество потоков для выполнения обработки. Применяется только для режима `Unordered`.

Значение по умолчанию: `1`.

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

Включить ведение журналов в `system.s3queue_log`.

Значение по умолчанию: `0`.

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

Указывает минимальное время, в миллисекундах, которое ClickHouse ожидает перед следующей попыткой опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

Определяет максимальное время, в миллисекундах, которое ClickHouse ожидает перед началом следующей попытки опроса.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `10000`.

### s3queue_polling_backoff_ms {#polling_backoff_ms}

Определяет дополнительное время ожидания, добавляемое к предыдущему интервалу опроса, когда новые файлы не найдены. Следующий опрос происходит после суммы предыдущего интервала и этого значения отступа или максимального интервала, в зависимости от того, что меньше.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### s3queue_tracked_files_limit {#tracked_files_limit}

Позволяет ограничить количество узлов ZooKeeper, если используется режим 'unordered', не влияет на режим 'ordered'.
При достижении лимита самые старые обработанные файлы будут удалены из узла ZooKeeper и обработаны заново.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `1000`.

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

Максимальное количество секунд для хранения обработанных файлов в узле ZooKeeper (по умолчанию хранится вечно) для режима 'unordered', не влияет на режим 'ordered'.
После указанного количества секунд файл будет повторно импортирован.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `0`.

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

Для режима 'Ordered'. Определяет минимальную границу для интервала перераспределения для фоновой задачи, которая отвечает за поддержание TTL отслеживаемого файла и максимального набора отслеживаемых файлов.

Значение по умолчанию: `10000`.

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

Для режима 'Ordered'. Определяет максимальную границу для интервала перераспределения для фоновой задачи, которая отвечает за поддержание TTL отслеживаемого файла и максимального набора отслеживаемых файлов.

Значение по умолчанию: `30000`.

### s3queue_buckets {#buckets}

Для режима 'Ordered'. Доступно с `24.6`. Если есть несколько реплик таблицы S3Queue, каждая из которых работает с одним и тем же каталогом метаданных в Keeper, значение `s3queue_buckets` должно быть равно как минимум количеству реплик. Если также используется настройка `s3queue_processing_threads`, имеет смысл увеличить значение настройки `s3queue_buckets`, так как оно определяет фактический параллелизм обработки `S3Queue`.

## Настройки, связанные с S3 {#s3-settings}

Движок поддерживает все настройки, связанные с S3. Для получения дополнительной информации о настройках S3 смотрите [здесь](../../../engines/table-engines/integrations/s3.md).

## Контроль доступа на основе ролей S3 {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

Движок таблиц s3Queue поддерживает контроль доступа на основе ролей.
См. документацию [здесь](/cloud/security/secure-s3) для получения шагов по настройке роли для доступа к вашему бакету.

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

## Режим Ordered для S3Queue {#ordered-mode}

Режим обработки `S3Queue` позволяет сохранять меньше метаданных в ZooKeeper, но имеет ограничение, что файлы, которые добавляются позже по времени, должны иметь алфавитно большие имена.

Режим `ordered` `S3Queue`, как и `unordered`, поддерживает настройку `(s3queue_)processing_threads_num` (префикс `s3queue_` является необязательным), которая позволяет контролировать количество потоков, обрабатывающих файлы `S3` локально на сервере. В дополнение, режим `ordered` также вводит другую настройку под названием `(s3queue_)buckets`, которая означает "логические потоки". Это означает, что в распределённой системе, когда есть несколько серверов с репликами таблицы `S3Queue`, эта настройка определяет количество единиц обработки. Например, каждый поток обработки на каждой реплике `S3Queue` будет пытаться захватить определенный `bucket` для обработки, каждый `bucket` приписывается определенным файлам по хешу имени файла. Поэтому в распределенной системе настоятельно рекомендуется иметь настройку `(s3queue_)buckets`, равную как минимум количеству реплик или больше. Нормально, когда количество ведер больше числа реплик. Наиболее оптимальным сценарием будет установка настройки `(s3queue_)buckets`, равной произведению `number_of_replicas` и `(s3queue_)processing_threads_num`. Использование настройки `(s3queue_)processing_threads_num` не рекомендуется до версии `24.6`. Настройка `(s3queue_)buckets` доступна, начиная с версии `24.6`.

## Описание {#description}

`SELECT` не особенно полезен для потоковой загрузки (за исключением отладки), потому что каждый файл можно импортировать только один раз. Более практично создавать потоки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания таблицы для потребления из заданного пути в S3 и рассматривайте её как поток данных.
2. Создайте таблицу с желаемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` присоединяется к движку, оно начинает собирать данные в фоновом режиме.

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

Для получения дополнительной информации о виртуальных столбцах смотрите [здесь](../../../engines/table-engines/index.md#table_engines-virtual_columns).

## Подстановочные знаки в пути {#wildcards-in-path}

Аргумент `path` может указывать на несколько файлов с помощью подстановочных знаков, похожих на bash. Для обработки файл должен существовать и соответствовать паттерну полного пути. Список файлов определяется во время `SELECT` (не в момент `CREATE`).

- `*` — Заменяет любое количество любых символов, кроме `/`, включая пустую строку.
- `**` — Заменяет любое количество любых символов, включая `/`, включая пустую строку.
- `?` — Заменяет любой отдельный символ.
- `{some_string,another_string,yet_another_one}` — Заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`.
- `{N..M}` — Заменяет любое число в диапазоне от N до M, включая оба конца. N и M могут иметь ведущие нули, например, `000..078`.

Конструкции с `{}` подобны функции [remote](../../../sql-reference/table-functions/remote.md).

## Ограничения {#limitations}

1. Дублированные строки могут быть результатом:

- исключения, возникающего во время разбора в середине обработки файла и повторные попытки включены через `s3queue_loading_retries`;

- `S3Queue` настроен на нескольких серверах, указывающих на тот же путь в ZooKeeper, и сессия Keeper истекает до того, как один сервер смог закоммитить обработанный файл, что может привести к тому, что другой сервер начнет обрабатывать файл, который мог быть частично или полностью обработан первым сервером;

- ненормальное завершение сервера.

2. Если `S3Queue` настроен на нескольких серверах, указывающих на тот же путь в ZooKeeper и используется режим `Ordered`, тогда `s3queue_loading_retries` не будет работать. Это будет исправлено в ближайшее время.

## Интроспекция {#introspection}

Для интроспекции используйте статическую таблицу `system.s3queue` и постоянную таблицу `system.s3queue_log`.

1. `system.s3queue`. Эта таблица не является постоянной и показывает состояние в памяти `S3Queue`: какие файлы в данный момент обрабатываются, какие файлы были обработаны или потерпели неудачу.

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
COMMENT 'Содержит состояние в памяти метаданных S3Queue и в данный момент обрабатываемых строк для каждого файла.' │
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
