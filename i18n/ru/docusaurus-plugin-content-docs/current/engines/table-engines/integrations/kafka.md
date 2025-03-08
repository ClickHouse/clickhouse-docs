---
slug: /engines/table-engines/integrations/kafka
sidebar_position: 110
sidebar_label: Kafka
title: 'Kafka'
description: 'Движок Kafka работает с Apache Kafka и позволяет публиковать или подписываться на потоки данных, организовывать отказоустойчивое хранилище и обрабатывать потоки по мере их появления.'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для потоковой передачи данных Kafka в ClickHouse. Это нативно поддерживает высокопроизводительную вставку, обеспечивая разделение обязанностей с возможностью независимого масштабирования ресурсов сбора и кластера.
:::

Этот движок работает с [Apache Kafka](http://kafka.apache.org/).

Kafka позволяет вам:

- Публиковать или подписываться на потоки данных.
- Организовывать отказоустойчивое хранилище.
- Обрабатывать потоки по мере их появления.

## Создание таблицы {#creating-a-table}

``` sql
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
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1];
```

Обязательные параметры:

- `kafka_broker_list` — Запятая, разделяющая список брокеров (например, `localhost:9092`).
- `kafka_topic_list` — Список тем Kafka.
- `kafka_group_name` — Группа потребителей Kafka. Полосы чтения отслеживаются для каждой группы отдельно. Если вы не хотите, чтобы сообщения были продублированы в кластере, используйте одно и то же имя группы повсюду.
- `kafka_format` — Формат сообщения. Использует ту же нотацию, что и SQL-функция `FORMAT`, такую как `JSONEachRow`. Для получения дополнительной информации см. раздел [Formats](../../../interfaces/formats.md).

Необязательные параметры:

- `kafka_schema` — Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `kafka_num_consumers` — Число потребителей на таблицу. Укажите больше потребителей, если пропускная способность одного потребителя недостаточна. Общее количество потребителей не должно превышать число партиций в теме, поскольку только одному потребителю может быть назначена одна партиция, и не должно превышать количество физических ядер на сервере, на котором развернут ClickHouse. По умолчанию: `1`.
- `kafka_max_block_size` — Максимальный размер блока (в сообщениях) для опроса. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — Тolerance парсера сообщений Kafka к сообщениям, несовместимым со схемой, на блок. Если `kafka_skip_broken_messages = N`, то движок пропускает *N* сообщений Kafka, которые не могут быть распознаны (сообщение равно строке данных). По умолчанию: `0`.
- `kafka_commit_every_batch` — Подтверждать каждую потребляемую и обработанную партию вместо одного подтверждения после записи целого блока. По умолчанию: `0`.
- `kafka_client_id` — Идентификатор клиента. По умолчанию пустой.
- `kafka_poll_timeout_ms` — Таймаут для одного опроса из Kafka. По умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — Максимальное количество сообщений, чтобы опрашивались в одном опросе Kafka. По умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Таймаут для сброса данных из Kafka. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_thread_per_consumer` — Обеспечить независимый поток для каждого потребителя. При включении каждый потребитель сбрасывает данные независимо, параллельно (в противном случае — строки от нескольких потребителей объединяются для формирования одного блока). По умолчанию: `0`.
- `kafka_handle_error_mode` — Как обрабатывать ошибки для движка Kafka. Возможные значения: default (исключение будет выброшено, если не удастся распарсить сообщение), stream (исключение сообщение и необработанное сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).
- `kafka_commit_on_select` — Подтверждать сообщения, когда выполняется запрос select. По умолчанию: `false`.
- `kafka_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение kafka для форматов на основе строк. По умолчанию: `1`.

Примеры:

``` sql
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

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. Если возможно, переключите старые проекты на метод, описанный выше.
:::

``` sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Движок Kafka не поддерживает колонки с [значением по умолчанию](/sql-reference/statements/create/table#default_values). Если вам нужны колонки со значением по умолчанию, вы можете добавить их на уровне материализованного представления (см. ниже).
:::

## Описание {#description}

Доставленные сообщения отслеживаются автоматически, так что каждое сообщение в группе считается только один раз. Если вы хотите получить данные дважды, создайте копию таблицы с другим именем группы.

Группы гибкие и синхронизированы в кластере. Например, если у вас 10 тем и 5 копий таблицы в кластере, то каждая копия получает 2 темы. Если количество копий меняется, темы автоматически перераспределяются между копиями. Узнайте больше об этом на http://kafka.apache.org/intro.

`SELECT` не особенно полезен для чтения сообщений (кроме отладки), поскольку каждое сообщение может быть прочитано только один раз. Практичнее создавать потоки в реальном времени, используя материализованные представления. Для этого:

1. Используйте движок для создания потребителя Kafka и рассматривайте его как поток данных.
2. Создайте таблицу с желаемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` объединяется с движком, он начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать сообщения из Kafka и преобразовывать их в требуемый формат с помощью `SELECT`.
Одной таблице kafka можно создать столько материализованных представлений, сколько вы пожелаете, они не читают данные напрямую из таблицы kafka, а получают новые записи (пакетами), таким образом вы можете записывать в несколько таблиц с различным уровнем детализации (с группировкой - агрегацией и без).

Пример:

``` sql
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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```
Чтобы улучшить производительность, полученные сообщения группируются в блоки размером [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size). Если блок не был сформирован в течение [stream_flush_interval_ms](/operations/settings/settings.md#stream_flush_interval_ms) миллисекунд, данные будут сброшены в таблицу независимо от полноты блока.

Чтобы прекратить получение данных темы или изменить логику преобразования, отсоедините материализованное представление:

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Конфигурация {#configuration}

Аналогично GraphiteMergeTree, движок Kafka поддерживает расширенную конфигурацию с использованием файла конфигурации ClickHouse. Существует два ключа конфигурации, которые вы можете использовать: глобальный (ниже `<kafka>`) и на уровне темы (ниже `<kafka><kafka_topic>`). Глобальная конфигурация применяется в первую очередь, а затем применяется конфигурация на уровне темы (если она существует).

``` xml
  <kafka>
    <!-- Глобальные параметры конфигурации для всех таблиц типа движка Kafka -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- Настройки для потребителя -->
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

    <!-- Настройки для производителя -->
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

Для получения списка возможных параметров конфигурации смотрите [librdkafka configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). Используйте подчеркивание (`_`) вместо точки в конфигурации ClickHouse. Например, `check.crcs=true` будет `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos {#kafka-kerberos-support}

Для работы с Kafka, поддерживающей Kerberos, добавьте дочерний элемент `security_protocol` со значением `sasl_plaintext`. Достаточно, чтобы билет для выдачи билетов Kerberos был получен и кэширован средствами ОС.
ClickHouse может поддерживать учетные данные Kerberos, используя файл keytab. Рассмотрите дочерние элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

Пример:

``` xml
  <!-- Kafka, поддерживающая Kerberos -->
  <kafka>
    <security_protocol>SASL_PLAINTEXT</security_protocol>
	<sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
	<sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
  </kafka>
```

## Виртуальные колонки {#virtual-columns}

- `_topic` — Тема Kafka. Тип данных: `LowCardinality(String)`.
- `_key` — Ключ сообщения. Тип данных: `String`.
- `_offset` — Смещение сообщения. Тип данных: `UInt64`.
- `_timestamp` — Метка времени сообщения. Тип данных: `Nullable(DateTime)`.
- `_timestamp_ms` — Метка времени в миллисекундах сообщения. Тип данных: `Nullable(DateTime64(3))`.
- `_partition` — Партиция темы Kafka. Тип данных: `UInt64`.
- `_headers.name` — Массив ключей заголовков сообщения. Тип данных: `Array(String)`.
- `_headers.value` — Массив значений заголовков сообщения. Тип данных: `Array(String)`.

Дополнительные виртуальные колонки, когда `kafka_handle_error_mode='stream'`:

- `_raw_message` - Необработанное сообщение, которое не удалось успешно распарсить. Тип данных: `String`.
- `_error` - Сообщение исключения, возникшее во время неудачного парсинга. Тип данных: `String`.

Примечание: виртуальные колонки `_raw_message` и `_error` заполняются только в случае исключения во время парсинга, они всегда пусты, когда сообщение было успешно распознано.

## Поддержка форматов данных {#data-formats-support}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат основанным на строках или на блоках:

- Для форматов на основе строк количество строк в одном сообщении Kafka можно контролировать, устанавливая `kafka_max_rows_per_message`.
- Для форматов на основе блоков мы не можем разделить блок на более мелкие части, но количество строк в одном блоке можно контролировать общим параметром [max_block_size](/operations/settings/settings#max_block_size).

## Движок для хранения подтвержденных смещений в ClickHouse Keeper {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

Если включен `allow_experimental_kafka_offsets_storage_in_keeper`, то для движка таблицы Kafka можно указать два дополнительных параметра:
 - `kafka_keeper_path`, который указывает путь к таблице в ClickHouse Keeper
 - `kafka_replica_name`, который указывает имя реплики в ClickHouse Keeper

Необходимо указать либо оба параметра, либо ни один из них. Когда оба из них указаны, используется новый, экспериментальный движок Kafka. Новый движок не зависит от хранения подтвержденных смещений в Kafka, а хранит их в ClickHouse Keeper. Он по-прежнему пытается подтвердить смещения в Kafka, но он зависит только от этих смещений при создании таблицы. В любых других обстоятельствах (таблица перезагружается или восстанавливается после какой-либо ошибки) будут использоваться смещения, хранящиеся в ClickHouse Keeper. Кроме подтвержденного смещения, он также хранит, сколько сообщений было потреблено в последней партии, так что, если вставка не удалась, будет потреблено то же количество сообщений, позволяя избежать дублирования при необходимости.

Пример:

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

Или для использования макросов `uuid` и `replica` аналогично ReplicatedMergeTree:

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### Известные ограничения {#known-limitations}

Поскольку новый движок является экспериментальным, он еще не готов к производству. Существуют несколько известных ограничений реализации:
 - Самое значительное ограничение заключается в том, что движок не поддерживает прямое чтение. Чтение из движка с помощью материализованных представлений и запись в движок работают, но прямое чтение не работает. В результате все прямые запросы `SELECT` будут неудачны.
 - Быстрое удаление и воссоздание таблицы или указание одного и того же пути ClickHouse Keeper для разных движков могут вызвать проблемы. В качестве наилучшей практики вы можете использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтующих путей.
 - Для обеспечения повторяемых чтений сообщения не могут быть потреблены из нескольких партиций в одном потоке. С другой стороны, потребители Kafka должны опрашиваться регулярно, чтобы оставаться активными. В результате этих двух целей мы решили разрешить создание нескольких потребителей только в том случае, если `kafka_thread_per_consumer` включен, в противном случае слишком сложно избежать проблем с регулярным опросом потребителей.
 - Потребители, созданные новым движком хранения, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**См. также**

- [Виртуальные колонки](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
