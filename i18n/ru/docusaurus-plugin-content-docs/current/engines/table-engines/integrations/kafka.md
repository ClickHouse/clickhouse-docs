---
description: 'Движок Kafka работает с Apache Kafka и позволяет вам публиковать или подписываться на потоки данных, организовывать отказоустойчивое хранилище и обрабатывать потоки по мере их поступления.'
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
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для потоковой передачи данных Kafka в ClickHouse. Это нативно поддерживает высокопроизводительные вставки, обеспечивая разделение задач с возможностью независимого масштабирования приема данных и ресурсов кластера.
:::

Этот движок работает с [Apache Kafka](http://kafka.apache.org/).

Kafka позволяет вам:

- Публиковать или подписываться на потоки данных.
- Организовывать отказоустойчивое хранилище.
- Обрабатывать потоки по мере их поступления.

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

- `kafka_broker_list` — Список брокеров, разделённых запятыми (например, `localhost:9092`).
- `kafka_topic_list` — Список топиков Kafka.
- `kafka_group_name` — Группа потребителей Kafka. Параметры чтения отслеживаются для каждой группы отдельно. Если вы не хотите, чтобы сообщения дублировались в кластере, используйте одно и то же имя группы везде.
- `kafka_format` — Формат сообщений. Использует ту же нотацию, что и SQL функция `FORMAT`, например, `JSONEachRow`. Для получения дополнительной информации смотрите раздел [Форматы](../../../interfaces/formats.md).

Необязательные параметры:

- `kafka_schema` — Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `kafka_num_consumers` — Количество потребителей на таблицу. Укажите больше потребителей, если пропускная способность одного потребителя недостаточна. Общее количество потребителей не должно превышать количество партиций в топике, так как только один потребитель может быть назначен на каждую партицию, и не должно быть больше, чем количество физических ядер на сервере, на котором развернут ClickHouse. По умолчанию: `1`.
- `kafka_max_block_size` — Максимальный размер пакета (в сообщениях) для извлечения. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — Устойчивость парсера сообщений Kafka к сообщениям, несовместимым со схемой, на блок. Если `kafka_skip_broken_messages = N`, то движок пропустит *N* сообщений Kafka, которые не могут быть разобраны (сообщение равно строке данных). По умолчанию: `0`.
- `kafka_commit_every_batch` — Фиксировать каждую обработанную партию, вместо одной фиксации после записи целого блока. По умолчанию: `0`.
- `kafka_client_id` — Идентификатор клиента. По умолчанию пустой.
- `kafka_poll_timeout_ms` — Тайм-аут для одного извлечения из Kafka. По умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — Максимальное количество сообщений, которые могут быть извлечены за одно обращение к Kafka. По умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Тайм-аут для сброса данных из Kafka. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_thread_per_consumer` — Обеспечить независимый поток для каждого потребителя. При включении каждый потребитель сбрасывает данные независимо, параллельно (в противном случае строки от нескольких потребителей будут объединены, чтобы сформировать один блок). По умолчанию: `0`.
- `kafka_handle_error_mode` — Как обрабатывать ошибки для движка Kafka. Возможные значения: default (исключение будет выброшено, если не удастся разобрать сообщение), stream (исключительное сообщение и необработанное сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).
- `kafka_commit_on_select` — Фиксировать сообщения при выполнении запроса на выборку. По умолчанию: `false`.
- `kafka_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение kafka для форматов, основанных на строках. По умолчанию: `1`.

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
Не используйте этот метод в новых проектах. Если возможно, переключите старые проекты на описанный выше метод.
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Движок таблиц Kafka не поддерживает колонки с [значением по умолчанию](/sql-reference/statements/create/table#default_values). Если вам нужны колонки со значением по умолчанию, вы можете добавить их на уровне материализованного представления (см. ниже).
:::

## Описание {#description}

Доставляемые сообщения автоматически отслеживаются, поэтому каждое сообщение в группе учитывается только один раз. Если вы хотите получить данные дважды, создайте копию таблицы с другим именем группы.

Группы гибкие и синхронизируются по кластеру. Например, если у вас 10 топиков и 5 копий таблицы в кластере, то каждая копия получает 2 топика. Если количество копий изменяется, топики перераспределяются между копиями автоматически. Подробнее об этом можно прочитать на http://kafka.apache.org/intro.

`SELECT` не очень полезен для чтения сообщений (за исключением отладки), так как каждое сообщение можно прочитать только один раз. Более практично создать потоки в реальном времени, используя материализованные представления. Для этого:

1.  Используйте движок для создания потребителя Kafka и считайте его потоком данных.
2.  Создайте таблицу с нужной структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` связывается с движком, он начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать сообщения из Kafka и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица kafka может иметь столько материализованных представлений, сколько вам нужно, они не читают данные непосредственно из таблицы kafka, а получают новые записи (пакетами), таким образом вы можете записывать в несколько таблиц с разным уровнем детализации (с группировкой - агрегацией и без).

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

Чтобы остановить получение данных топика или изменить логику преобразования, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу, используя `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Конфигурация {#configuration}

Аналогично GraphiteMergeTree, движок Kafka поддерживает расширенную конфигурацию с использованием файла конфигурации ClickHouse. Существует два ключа конфигурации, которые вы можете использовать: глобальный (ниже `<kafka>`) и уровень топика (ниже `<kafka><kafka_topic>`). Глобальная конфигурация применяется первой, а затем применяется конфигурация уровня топика (если она существует).

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

Для списка возможных параметров конфигурации смотрите [справочник конфигурации librdkafka](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). Используйте нижнее подчеркивание (`_`) вместо точки в конфигурации ClickHouse. Например, `check.crcs=true` будет `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos {#kafka-kerberos-support}

Чтобы работать с Kafka, осведомленной о Kerberos, добавьте элемент `security_protocol` с значением `sasl_plaintext`. Достаточно, чтобы билет на выдачу билетов Kerberos был получен и кэширован средствами операционной системы.
ClickHouse может поддерживать учетные данные Kerberos с помощью файла ключей. Рассмотрите элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

Пример:

```xml
<!-- Kafka, осведомленная о Kerberos -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## Виртуальные колонки {#virtual-columns}

- `_topic` — Топик Kafka. Тип данных: `LowCardinality(String)`.
- `_key` — Ключ сообщения. Тип данных: `String`.
- `_offset` — Смещение сообщения. Тип данных: `UInt64`.
- `_timestamp` — Метка времени сообщения. Тип данных: `Nullable(DateTime)`.
- `_timestamp_ms` — Метка времени в миллисекундах сообщения. Тип данных: `Nullable(DateTime64(3))`.
- `_partition` — Партиция топика Kafka. Тип данных: `UInt64`.
- `_headers.name` — Массив ключей заголовков сообщения. Тип данных: `Array(String)`.
- `_headers.value` — Массив значений заголовков сообщения. Тип данных: `Array(String)`.

Дополнительные виртуальные колонки, когда `kafka_handle_error_mode='stream'`:

- `_raw_message` - Необработанное сообщение, которое не удалось успешно разобрать. Тип данных: `String`.
- `_error` - Сообщение об ошибке, возникшей во время неудачного разбора. Тип данных: `String`.

Примечание: виртуальные колонки `_raw_message` и `_error` заполняются только в случае исключения во время разбора, они всегда пусты, когда сообщение было успешно разобрано.

## Поддержка форматов данных {#data-formats-support}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат основанным на строках или блоках:

- Для форматов, основанных на строках, количество строк в одном сообщении Kafka можно контролировать, задав `kafka_max_rows_per_message`.
- Для форматов на основе блоков мы не можем разделить блок на меньшие части, но количество строк в одном блоке можно контролировать с помощью общего параметра [max_block_size](/operations/settings/settings#max_block_size).

## Движок для хранения зафиксированных смещений в ClickHouse Keeper {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

Если `allow_experimental_kafka_offsets_storage_in_keeper` включен, то можно указать ещё два параметра для движка таблицы Kafka:
 - `kafka_keeper_path` указывает путь к таблице в ClickHouse Keeper
 - `kafka_replica_name` указывает имя реплики в ClickHouse Keeper

Либо оба параметра должны быть указаны, либо ни один из них. Когда оба указаны, будет использоваться новый, экспериментальный движок Kafka. Новый движок не зависит от хранения зафиксированных смещений в Kafka, а сохраняет их в ClickHouse Keeper. Он все еще пытается зафиксировать смещения в Kafka, но зависит только от этих смещений при создании таблицы. В любых других обстоятельствах (таблица перезапускается или восстанавливается после ошибки) будут использоваться смещения, хранящиеся в ClickHouse Keeper, как смещение для продолжения потребления сообщений. Кроме зафиксированного смещения, он также хранит, сколько сообщений было потреблено в последней партии, так что если вставка не удалась, будет потреблено такое же количество сообщений, что позволит при необходимости избежать дублирования.

Пример:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

Или для использования макросов `uuid` и `replica` аналогично ReplicatedMergeTree:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### Известные ограничения {#known-limitations}

Поскольку новый движок является экспериментальным, он пока не готов к производству. Есть некоторые известные ограничения реализации:
 - Наибольшее ограничение заключается в том, что движок не поддерживает прямое чтение. Чтение из движка с использованием материализованных представлений и запись в движок работают, но прямое чтение не работает. В результате все прямые запросы `SELECT` будут завершается неудачей.
 - Быстрое удаление и воссоздание таблицы или указание одного и того же пути ClickHouse Keeper для различных движков может вызвать проблемы. В качестве наилучшей практики вы можете использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтов путей.
 - Для осуществления повторяемых чтений сообщения не могут быть потреблены из нескольких партиций в одном потоке. С другой стороны, потребители Kafka должны регулярно опрашиваться, чтобы оставаться активными. В результате этих двух задач мы решили разрешить создание нескольких потребителей только в том случае, если `kafka_thread_per_consumer` включен, в противном случае слишком сложно избежать проблем, связанных с регулярным опросом потребителей.
 - Потребители, созданные новым хранилищем, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**См. также**

- [Виртуальные колонки](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
