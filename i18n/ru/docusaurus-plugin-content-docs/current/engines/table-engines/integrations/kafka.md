---
description: 'Табличный движок Kafka может использоваться для интеграции с Apache Kafka: он позволяет публиковать данные и подписываться на потоки данных, организовывать отказоустойчивое хранение и обрабатывать потоки по мере их поступления.'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Табличный движок Kafka'
keywords: ['Kafka', 'табличный движок']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Табличный движок Kafka \{#kafka-table-engine\}

:::tip
Если вы используете ClickHouse Cloud, мы рекомендуем вместо этого использовать [ClickPipes](/integrations/clickpipes). ClickPipes нативно поддерживает приватные сетевые соединения, независимое масштабирование ресурсов для приёма данных и ресурсов кластера, а также всесторонний мониторинг при потоковой загрузке данных из Kafka в ClickHouse.
:::

- Публиковать или подписываться на потоки данных.
- Организовывать отказоустойчивое хранилище.
- Обрабатывать потоки по мере их поступления.

## Создание таблицы \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [ALIAS expr1],
    name2 [type2] [ALIAS expr2],
    ...
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'host:port',
    kafka_topic_list = 'topic1,topic2,...',
    kafka_group_name = 'group_name',
    kafka_format = 'data_format'[,]
    [kafka_security_protocol = '',]
    [kafka_sasl_mechanism = '',]
    [kafka_sasl_username = '',]
    [kafka_sasl_password = '',]
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_consumer_reschedule_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

Обязательные параметры:

* `kafka_broker_list` — список брокеров, разделённых запятыми (например, `localhost:9092`).
* `kafka_topic_list` — список топиков Kafka.
* `kafka_group_name` — группа потребителей Kafka. Смещения чтения отслеживаются отдельно для каждой группы. Если вы не хотите дублирования сообщений в кластере, используйте одно и то же имя группы везде.
* `kafka_format` — формат сообщений. Использует ту же нотацию, что и SQL-функция `FORMAT`, например, `JSONEachRow`. Для получения дополнительной информации см. раздел [Formats](../../../interfaces/formats.md).

Необязательные параметры:

- `kafka_security_protocol` — Протокол, используемый для связи с брокерами. Возможные значения: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
- `kafka_sasl_mechanism` — Механизм SASL, используемый для аутентификации. Возможные значения: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
- `kafka_sasl_username` — Имя пользователя SASL для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
- `kafka_sasl_password` — Пароль SASL для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
- `kafka_schema` — Параметр, который должен использоваться, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `kafka_schema_registry_skip_bytes` — Количество байт, которые нужно пропустить с начала каждого сообщения при использовании реестра схем с envelope-заголовками (например, AWS Glue Schema Registry, который добавляет 19-байтовый envelope). Диапазон: `[0, 255]`. По умолчанию: `0`.
- `kafka_num_consumers` — Количество консьюмеров на таблицу. Укажите больше консьюмеров, если пропускной способности одного консьюмера недостаточно. Общее количество консьюмеров не должно превышать количество партиций в топике, так как к каждой партиции может быть привязан только один консьюмер, и не должно быть больше числа физических ядер на сервере, где развернут ClickHouse. По умолчанию: `1`.
- `kafka_max_block_size` — Максимальный размер пакета (в сообщениях) для одного poll. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — Допустимое количество несовместимых со схемой сообщений Kafka на блок для парсера. Если `kafka_skip_broken_messages = N`, то движок пропускает *N* сообщений Kafka, которые не могут быть разобраны (одно сообщение соответствует одной строке данных). По умолчанию: `0`.
- `kafka_commit_every_batch` — Фиксировать (commit) каждый считанный и обработанный пакет вместо одного коммита после записи всего блока. По умолчанию: `0`.
- `kafka_client_id` — Идентификатор клиента. По умолчанию пустая строка.
- `kafka_poll_timeout_ms` — Таймаут для одного poll из Kafka. По умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — Максимальное количество сообщений, извлекаемых за один poll из Kafka. По умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Таймаут для сброса данных из Kafka. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_consumer_reschedule_ms` — Интервал повторного планирования, когда обработка потока Kafka застопорилась (например, когда нет доступных для чтения сообщений). Этот параметр управляет задержкой перед повторной попыткой опроса консьюмером. Не должен превышать `kafka_consumers_pool_ttl_ms`. По умолчанию: `500` миллисекунд.
- `kafka_thread_per_consumer` — Выделять отдельный поток для каждого консьюмера. Если включено, каждый консьюмер сбрасывает данные независимо и параллельно (в противном случае строки от нескольких консьюмеров объединяются в один блок). По умолчанию: `0`.
- `kafka_handle_error_mode` — Способ обработки ошибок для движка Kafka. Возможные значения: `default` (будет выброшено исключение, если не удалось разобрать сообщение), `stream` (сообщение об ошибке и исходное сообщение будут сохранены в виртуальных столбцах `_error` и `_raw_message`), `dead_letter_queue` (данные, связанные с ошибкой, будут сохранены в `system.dead_letter_queue`).
- `kafka_commit_on_select` — Фиксировать сообщения при выполнении запроса `SELECT`. По умолчанию: `false`.
- `kafka_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение Kafka для форматов, основанных на строках. По умолчанию: `1`.
- `kafka_compression_codec` — Кодек сжатия, используемый при публикации сообщений. Поддерживаются: пустая строка, `none`, `gzip`, `snappy`, `lz4`, `zstd`. В случае пустой строки кодек сжатия не задаётся таблицей, поэтому будут использованы значения из конфигурационных файлов или значение по умолчанию из `librdkafka`. По умолчанию: пустая строка.
- `kafka_compression_level` — Параметр уровня сжатия для алгоритма, выбранного в `kafka_compression_codec`. Более высокие значения обеспечивают лучшее сжатие за счёт большего использования CPU. Допустимый диапазон зависит от алгоритма: `[0-9]` для `gzip`; `[0-12]` для `lz4`; только `0` для `snappy`; `[0-12]` для `zstd`; `-1` = уровень сжатия по умолчанию для конкретного кодека. По умолчанию: `-1`.

Примеры:

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;

  CREATE TABLE queue2 (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka SETTINGS kafka_broker_list = 'localhost:9092',
                            kafka_topic_list = 'topic',
                            kafka_group_name = 'group1',
                            kafka_format = 'JSONEachRow',
                            kafka_num_consumers = 4;

  CREATE TABLE queue3 (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1')
              SETTINGS kafka_format = 'JSONEachRow',
                       kafka_num_consumers = 4;
```

<details markdown="1">
  <summary>Устаревший способ создания таблицы</summary>

  :::note
  Не используйте этот способ в новых проектах. По возможности переведите старые проекты на метод, описанный выше.
  :::

  ```sql
  Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
        [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_consumer_reschedule_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
  ```
</details>

:::info
Табличный движок Kafka не поддерживает столбцы со [значениями по умолчанию](/sql-reference/statements/create/table#default_values). Если вам нужны такие столбцы, их можно добавить на уровне materialized view (см. ниже).
:::

## Описание \{#description\}

Доставленные сообщения отслеживаются автоматически, поэтому каждое сообщение в группе учитывается только один раз. Если вам нужно получить данные дважды, создайте копию таблицы с другим именем группы.

Группы гибкие и синхронизируются в кластере. Например, если у вас есть 10 топиков и 5 копий таблицы в кластере, то каждая копия получает по 2 топика. Если количество копий меняется, топики автоматически перераспределяются между копиями. Подробнее об этом читайте на [http://kafka.apache.org/intro](http://kafka.apache.org/intro).

Рекомендуется, чтобы у каждого топика Kafka была своя собственная группа потребителей, что обеспечивает эксклюзивную связь между топиком и группой, особенно в средах, где топики могут динамически создаваться и удаляться (например, в тестовой или промежуточной среде).

`SELECT` мало полезен для чтения сообщений (кроме отладки), потому что каждое сообщение может быть прочитано только один раз. На практике удобнее создавать потоки в реальном времени с помощью материализованных представлений. Для этого:

1. Используйте движок для создания Kafka-потребителя и рассматривайте его как поток данных.
2. Создайте таблицу с нужной структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` привязан к движку, он начинает собирать данные в фоновом режиме. Это позволяет непрерывно получать сообщения из Kafka и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица Kafka может иметь любое количество материализованных представлений: они не читают данные из таблицы Kafka напрямую, а получают новые записи (блоками). Таким образом, можно записывать данные в несколько таблиц с разной степенью детализации (с группировкой — агрегацией и без).

Пример:

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

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

Чтобы повысить производительность, полученные сообщения группируются в блоки размером [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size). Если в течение [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) миллисекунд блок не был сформирован, данные будут принудительно записаны в таблицу независимо от полноты блока.

Чтобы прекратить получение данных топика или изменить логику преобразования, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью `ALTER`, рекомендуем отключить материализованное представление, чтобы избежать расхождений между целевой таблицей и данными из представления.

## Конфигурация \{#configuration\}

Как и движок GraphiteMergeTree, движок Kafka поддерживает расширенную конфигурацию с использованием файла конфигурации ClickHouse. Вы можете использовать два ключа конфигурации: глобальный (в секции `<kafka>`) и на уровне топика (в секции `<kafka><kafka_topic>`). Сначала применяется глобальная конфигурация, а затем — конфигурация для конкретного топика (если она задана).

```xml
  <kafka>
    <!-- Global configuration options for all tables of Kafka engine type -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- Settings for consumer -->
    <consumer>
        <auto_offset_reset>smallest</auto_offset_reset>
        <kafka_topic>
            <name>logs</name>
            <fetch_min_bytes>100000</fetch_min_bytes>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <fetch_min_bytes>50000</fetch_min_bytes>
        </kafka_topic>
    </consumer>

    <!-- Settings for producer -->
    <producer>
        <kafka_topic>
            <name>logs</name>
            <retry_backoff_ms>250</retry_backoff_ms>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <retry_backoff_ms>400</retry_backoff_ms>
        </kafka_topic>
    </producer>
  </kafka>
```

Список доступных параметров конфигурации приведён в [справочнике по конфигурации librdkafka](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). Используйте символ подчёркивания (`_`) вместо точки в конфигурации ClickHouse. Например, `check.crcs=true` будет записано как `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos \{#kafka-kerberos-support\}

Для работы с Kafka с поддержкой Kerberos добавьте дочерний элемент `security_protocol` со значением `sasl_plaintext`. Этого достаточно при наличии действительного Kerberos ticket-granting ticket (TGT), уже полученного и закэшированного средствами операционной системы.
ClickHouse может самостоятельно поддерживать учетные данные Kerberos с использованием файла keytab. Для этого используйте дочерние элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

Пример:

```xml
<!-- Kerberos-aware Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## Виртуальные столбцы \{#virtual-columns\}

- `_topic` — топик Kafka. Тип данных: `LowCardinality(String)`.
- `_key` — ключ сообщения. Тип данных: `String`.
- `_offset` — смещение сообщения. Тип данных: `UInt64`.
- `_timestamp` — временная метка сообщения. Тип данных: `Nullable(DateTime)`.
- `_timestamp_ms` — временная метка сообщения в миллисекундах. Тип данных: `Nullable(DateTime64(3))`.
- `_partition` — партиция топика Kafka. Тип данных: `UInt64`.
- `_headers.name` — массив ключей заголовков сообщения. Тип данных: `Array(String)`.
- `_headers.value` — массив значений заголовков сообщения. Тип данных: `Array(String)`.

Дополнительные виртуальные столбцы при `kafka_handle_error_mode='stream'`:

- `_raw_message` — исходное сообщение, которое не удалось разобрать. Тип данных: `String`.
- `_error` — текст исключения, возникшего при неуспешном разборе. Тип данных: `String`.

Примечание: виртуальные столбцы `_raw_message` и `_error` заполняются только в случае возникновения исключения во время разбора; при успешном разборе сообщения они всегда пусты.

## Поддержка форматов данных \{#data-formats-support\}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат построчным или блочным:

- Для построчных форматов количество строк в одном сообщении Kafka можно контролировать с помощью настройки `kafka_max_rows_per_message`.
- Для блочных форматов мы не можем разделить блок на более мелкие части, но количество строк в одном блоке можно контролировать с помощью общего параметра настройки [max_block_size](/operations/settings/settings#max_block_size).

## Движок для хранения зафиксированных смещений в ClickHouse Keeper \{#engine-to-store-committed-offsets-in-clickhouse-keeper\}

<ExperimentalBadge />

Если включён параметр `allow_experimental_kafka_offsets_storage_in_keeper`, для табличного движка Kafka можно задать ещё два параметра:

* `kafka_keeper_path` задаёт путь к таблице в ClickHouse Keeper
* `kafka_replica_name` задаёт имя реплики в ClickHouse Keeper

Оба параметра должны быть либо заданы вместе, либо оба опущены. Если оба параметра заданы, используется новый, экспериментальный движок Kafka. Новый движок не зависит от хранения зафиксированных смещений в Kafka и хранит их в ClickHouse Keeper. Он по-прежнему пытается зафиксировать смещения в Kafka, но опирается на эти смещения только при создании таблицы. Во всех остальных ситуациях (перезапуск таблицы или восстановление после ошибки) в качестве смещения, с которого продолжается потребление сообщений, будут использоваться смещения, сохранённые в ClickHouse Keeper. Помимо зафиксированного смещения, он также сохраняет, сколько сообщений было прочитано в последнем пакете, поэтому, если операция вставки завершилась с ошибкой, будет прочитано то же количество сообщений, что позволяет при необходимости включить дедупликацию.

Пример:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### Известные ограничения \{#known-limitations\}

Поскольку новый движок является экспериментальным, он ещё не готов для промышленного использования. На данный момент в реализации есть несколько известных ограничений:

- Наибольшее ограничение заключается в том, что движок не поддерживает прямое чтение. Чтение из движка с использованием материализованных представлений и запись в движок работают, но прямое чтение — нет. В результате все прямые запросы `SELECT` будут завершаться с ошибкой.
- Быстрое удаление и пересоздание таблицы или указание одного и того же пути ClickHouse Keeper для разных движков может вызывать проблемы. В качестве рекомендуемой практики можно использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтов путей.
- Для обеспечения повторяемости чтения сообщения не могут потребляться из нескольких партиций в одном потоке. С другой стороны, потребители Kafka должны регулярно опрашиваться, чтобы оставаться «живыми». В результате этих двух требований мы решили разрешать создание нескольких потребителей только в том случае, если включён `kafka_thread_per_consumer`, в противном случае слишком сложно избежать проблем, связанных с регулярным опросом потребителей.
- Потребители, создаваемые новым движком хранения, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**См. также**

- [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)