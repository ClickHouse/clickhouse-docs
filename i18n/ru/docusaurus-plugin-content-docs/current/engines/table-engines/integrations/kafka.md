---
description: 'Движок Kafka работает с Apache Kafka и позволяет вам публиковать или подписываться на потоки данных, организовывать отказоустойчивое хранилище и обрабатывать потоки по мере их появления.'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для потоковой передачи данных Kafka в ClickHouse. Это изначально поддерживает высокопроизводительную вставку, обеспечивая при этом разделение ответственности с возможностью независимого масштабирования приема данных и ресурсов кластера.
:::

Этот движок работает с [Apache Kafka](http://kafka.apache.org/).

Kafka позволяет вам:

- Публиковать или подписываться на потоки данных.
- Организовывать отказоустойчивое хранилище.
- Обрабатывать потоки по мере их появления.

## Создание таблицы {#creating-a-table}

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
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1];
```

Обязательные параметры:

- `kafka_broker_list` — Список брокеров, разделенных запятыми (например, `localhost:9092`).
- `kafka_topic_list` — Список тем Kafka.
- `kafka_group_name` — Группа потребителей Kafka. Пограничные чтения отслеживаются для каждой группы отдельно. Если вы не хотите, чтобы сообщения дублировались в кластере, используйте одно и то же имя группы повсюду.
- `kafka_format` — Формат сообщений. Использует такую же нотацию, как функция SQL `FORMAT`, например `JSONEachRow`. Для получения дополнительной информации смотрите раздел [Formats](../../../interfaces/formats.md).

Дополнительные параметры:

- `kafka_security_protocol` - Протокол, используемый для общения с брокерами. Возможные значения: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
- `kafka_sasl_mechanism` - SASL механизм, используемый для аутентификации. Возможные значения: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
- `kafka_sasl_username` - SASL имя пользователя для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
- `kafka_sasl_password` - SASL пароль для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
- `kafka_schema` — Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `kafka_num_consumers` — Количество потребителей на таблицу. Укажите большее количество потребителей, если пропускная способность одного потребителя недостаточна. Общее количество потребителей не должно превышать количество партиций в теме, поскольку на каждую партицию может быть назначен только один потребитель, и не должно превышать количество физических ядер на сервере, где развернут ClickHouse. По умолчанию: `1`.
- `kafka_max_block_size` — Максимальный размер партии (в сообщениях) для опроса. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — Толерантность парсера сообщений Kafka к схемам, несовместимым с сообщениями за блок. Если `kafka_skip_broken_messages = N`, то движок пропустит *N* сообщений Kafka, которые не могут быть распознаны (сообщение равно строке данных). По умолчанию: `0`.
- `kafka_commit_every_batch` — Подтверждать каждую потребляемую и обработанную партию вместо одного подтверждения после записи целого блока. По умолчанию: `0`.
- `kafka_client_id` — Идентификатор клиента. По умолчанию пустой.
- `kafka_poll_timeout_ms` — Тайм-аут для одного опроса от Kafka. По умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — Максимальное количество сообщений, которые будут опрошены в одном опросе Kafka. По умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Тайм-аут для сброса данных из Kafka. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_thread_per_consumer` — Предоставить независимый поток для каждого потребителя. Когда это включено, каждый потребитель сбрасывает данные независимо, параллельно (в противном случае — строки от нескольких потребителей будут объединены, чтобы образовать один блок). По умолчанию: `0`.
- `kafka_handle_error_mode` — Как обрабатывать ошибки для движка Kafka. Возможные значения: default (исключение будет выброшено, если парсинг сообщения не удался), stream (исключение сообщения и необработанное сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).
- `kafka_commit_on_select` — Подтверждать сообщения, когда выполняется запрос. По умолчанию: `false`.
- `kafka_max_rows_per_message` — Максимальное количество строк, записанных в одном сообщении kafka для форматов на основе строк. По умолчанию: `1`.

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

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. Если возможно, переключите старые проекты на метод, описанный выше.
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Движок таблицы Kafka не поддерживает колонки с [значением по умолчанию](/sql-reference/statements/create/table#default_values). Если вам нужны колонки со значением по умолчанию, вы можете добавить их на уровне материализованного представления (см. ниже).
:::

## Описание {#description}

Доставляемые сообщения отслеживаются автоматически, поэтому каждое сообщение в группе учитывается только один раз. Если вы хотите получить данные дважды, создайте копию таблицы с другим именем группы.

Группы являются гибкими и синхронизируются в кластере. Например, если у вас есть 10 тем и 5 копий таблицы в кластере, тогда каждая копия получает 2 темы. Если количество копий изменяется, темы автоматически перераспределяются между копиями. Читайте больше об этом на http://kafka.apache.org/intro.

`SELECT` не очень полезен для чтения сообщений (за исключением отладки), потому что каждое сообщение можно прочитать только один раз. Практичнее создавать потоки в реальном времени с помощью материализованных представлений. Для этого:

1. Используйте движок для создания потребителя Kafka и рассматривайте его как поток данных.
2. Создайте таблицу с желаемой структурой.
3. Создайте материализованное представление, которое конвертирует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` соединяется с движком, он начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать сообщения из Kafka и конвертировать их в требуемый формат с помощью `SELECT`.
Одна таблица kafka может иметь столько материализованных представлений, сколько вам нужно, они не читают данные напрямую из таблицы kafka, а получают новые записи (пакетами), таким образом, вы можете записывать в несколько таблиц с различным уровнем деталей (с группировкой - агрегацией и без).

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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```
Для повышения производительности полученные сообщения группируются в блоки размером [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size). Если блок не был сформирован в течение [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) миллисекунд, данные будут сброшены в таблицу независимо от полноты блока.

Чтобы остановить получение данных темы или изменить логику конвертации, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу, используя `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Настройка {#configuration}

Подобно GraphiteMergeTree, движок Kafka поддерживает расширенную настройку с использованием файла конфигурации ClickHouse. Существует два ключа конфигурации, которые вы можете использовать: глобальный (ниже `<kafka>`) и на уровне темы (ниже `<kafka><kafka_topic>`). Глобальная конфигурация применяется первой, а затем применяются настройки на уровне темы (если они существуют).

```xml
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

Для получения списка возможных параметров конфигурации смотрите [librdkafka configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). Используйте нижнее подчеркивание (`_`) вместо точки в конфигурации ClickHouse. Например, `check.crcs=true` будет `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos {#kafka-kerberos-support}

Чтобы работать с Kafka, поддерживающей Kerberos, добавьте дочерний элемент `security_protocol` со значением `sasl_plaintext`. Достаточно, чтобы билет на предоставление билетов Kerberos был получен и кэширован средствами ОС.
ClickHouse способен поддерживать учетные данные Kerberos с использованием файла keytab. Рассмотрите элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

Пример:

```xml
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

Дополнительные виртуальные колонки при `kafka_handle_error_mode='stream'`:

- `_raw_message` - Необработанное сообщение, которое не удалось успешно распознать. Тип данных: `String`.
- `_error` - Сообщение исключения, возникшего во время неудачного парсинга. Тип данных: `String`.

Примечание: виртуальные колонки `_raw_message` и `_error` заполняются только в случае исключения во время парсинга, они всегда пусты, когда сообщение было успешно разобрано.

## Поддержка форматов данных {#data-formats-support}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат основанным на строках или блоках:

- Для форматов, основанных на строках, количество строк в одном сообщении Kafka может контролироваться с помощью настройки `kafka_max_rows_per_message`.
- Для форматов на основе блоков мы не можем делить блок на более мелкие части, но количество строк в одном блоке можно контролировать с помощью общей настройки [max_block_size](/operations/settings/settings#max_block_size).

## Движок для хранения подтвержденных смещений в ClickHouse Keeper {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

Если `allow_experimental_kafka_offsets_storage_in_keeper` включен, тогда можно указать еще два параметра для движка таблицы Kafka:
 - `kafka_keeper_path` указывает путь к таблице в ClickHouse Keeper
 - `kafka_replica_name` указывает имя реплики в ClickHouse Keeper

Либо оба параметра должны быть указаны, либо ни один из них. Когда оба указаны, будет использован новый экспериментальный движок Kafka. Новый движок не зависит от хранения подтвержденных смещений в Kafka, а хранит их в ClickHouse Keeper. Он все еще пытается подтвердить смещения в Kafka, но он зависит от этих смещений только при создании таблицы. В любых других обстоятельствах (таблица перезапускается или восстанавливается после ошибки) будут использоваться смещения, хранящиеся в ClickHouse Keeper, как смещение для продолжения потребления сообщений. Помимо подтвержденного смещения, он также хранит, сколько сообщений было потреблено в последней партии, так что если вставка не удалась, будет потреблено такое же количество сообщений, что позволяет избежать дублирования, если это необходимо.

Пример:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

Или для использования макросов `uuid` и `replica`, аналогично ReplicatedMergeTree:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### Известные ограничения {#known-limitations}

Поскольку новый движок является экспериментальным, он еще не готов к производству. Существует несколько известных ограничений реализации:
 - Главным ограничением является то, что движок не поддерживает прямое чтение. Чтение из движка с использованием материализованных представлений и запись в движок работает, но прямое чтение не работает. В результате все прямые запросы `SELECT` будут завершаться неудачей.
 - Быстрое удаление и пере создание таблицы или указание одного и того же пути ClickHouse Keeper для разных движков может вызвать проблемы. Как лучшая практика, вы можете использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтующих путей.
 - Для выполнения повторяемых чтений сообщения не могут потребляться из нескольких партиций в одном потоке. С другой стороны, потребители Kafka должны периодически опрашиваться, чтобы оставаться активными. В результате этих двух целей мы решили позволить создание нескольких потребителей только при включении `kafka_thread_per_consumer`, иначе это слишком сложно, чтобы избежать проблем с частым опросом потребителей.
 - Потребители, созданные новым движком хранения, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**Смотрите также**

- [Виртуальные колонки](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
