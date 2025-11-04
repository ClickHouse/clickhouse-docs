---
slug: '/engines/table-engines/integrations/kafka'
sidebar_label: Kafka
sidebar_position: 110
description: 'Движок таблицы Kafka можно использовать для публикации работ с Apache'
title: Kafka
doc_type: guide
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka движок таблиц

:::note
Если вы используете ClickHouse Cloud, мы рекомендуем использовать [ClickPipes](/integrations/clickpipes) вместо этого. ClickPipes нативно поддерживает частные сетевые подключения, масштабирование загрузки данных и ресурсов кластера независимо, а также комплексное мониторинг для потоковых данных Kafka в ClickHouse.
:::

- Публикация или подписка на потоки данных.
- Организация отказоустойчивого хранения.
- Обработка потоков по мере их доступности.

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

- `kafka_broker_list` — Список брокеров, разделенный запятыми (например, `localhost:9092`).
- `kafka_topic_list` — Список тем Kafka.
- `kafka_group_name` — Группа потребителей Kafka. Пограничные значения читаются для каждой группы отдельно. Если вы не хотите, чтобы сообщения дублировались в кластере, используйте одно и то же имя группы повсюду.
- `kafka_format` — Формат сообщения. Использует ту же нотацию, что и SQL-функция `FORMAT`, такую как `JSONEachRow`. Для получения дополнительной информации смотрите раздел [Форматы](../../../interfaces/formats.md).

Необязательные параметры:

- `kafka_security_protocol` - Протокол, используемый для связи с брокерами. Возможные значения: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
- `kafka_sasl_mechanism` - SASL механизм для аутентификации. Возможные значения: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
- `kafka_sasl_username` - SASL имя пользователя для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
- `kafka_sasl_password` - SASL пароль для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
- `kafka_schema` — Параметр, который должен быть использован, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `kafka_num_consumers` — Количество потребителей на таблицу. Укажите больше потребителей, если пропускная способность одного потребителя недостаточна. Общее количество потребителей не должно превышать количество партиций в теме, поскольку только один потребитель может быть назначен на одну партицию, и не должно превышать количество физических ядер на сервере, где развернут ClickHouse. Значение по умолчанию: `1`.
- `kafka_max_block_size` — Максимальный размер пакета (в сообщениях) для опроса. Значение по умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `kafka_skip_broken_messages` — Толерантность парсера сообщений Kafka к схемам, несовместимым с сообщениями в блоке. Если `kafka_skip_broken_messages = N`, то движок пропустит *N* сообщений Kafka, которые не могут быть разобраны (сообщение равняется одной строке данных). Значение по умолчанию: `0`.
- `kafka_commit_every_batch` — Коммит каждого потребленного и обработанного пакета вместо одного коммита после записи целого блока. Значение по умолчанию: `0`.
- `kafka_client_id` — Идентификатор клиента. По умолчанию пустой.
- `kafka_poll_timeout_ms` — Таймаут для одного опроса из Kafka. Значение по умолчанию: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `kafka_poll_max_batch_size` — Максимальное количество сообщений, которые могут быть опрошены за один опрос Kafka. Значение по умолчанию: [max_block_size](/operations/settings/settings#max_block_size).
- `kafka_flush_interval_ms` — Таймаут для сброса данных из Kafka. Значение по умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `kafka_thread_per_consumer` — Обеспечить независимый поток для каждого потребителя. При включении каждый потребитель сбрасывает данные независимо, параллельно (в противном случае — строки от нескольких потребителей собираются, чтобы сформировать один блок). Значение по умолчанию: `0`.
- `kafka_handle_error_mode` — Как обрабатывать ошибки для движка Kafka. Возможные значения: по умолчанию (исключение будет выбрасываться, если не удастся разобрать сообщение), поток (сообщение исключения и сырье будет сохранено в виртуальных колонках `_error` и `_raw_message`), dead_letter_queue (данные, относящиеся к ошибке, будут сохранены в system.dead_letter_queue).
- `kafka_commit_on_select` — Коммит сообщений, когда выполняется запрос select. Значение по умолчанию: `false`.
- `kafka_max_rows_per_message` — Максимальное количество строк, записываемых в одном сообщении Kafka для форматов на основе строк. Значение по умолчанию : `1`.

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
Не используйте этот метод в новых проектах. По возможности, переключите старые проекты на метод, описанный выше.
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Движок таблиц Kafka не поддерживает колонки с [значением по умолчанию](/sql-reference/statements/create/table#default_values). Если вам необходимы колонки со значением по умолчанию, вы можете добавить их на уровне материализованного представления (см. ниже).
:::

## Описание {#description}

Доставленные сообщения отслеживаются автоматически, поэтому каждое сообщение в группе учитывается только один раз. Если вы хотите получить данные дважды, создайте копию таблицы с другим именем группы.

Группы гибкие и синхронизированы в кластере. Например, если у вас 10 тем и 5 копий таблицы в кластере, то каждая копия получает 2 темы. Если количество копий изменится, темы перераспределяются между копиями автоматически. Узнайте больше об этом на http://kafka.apache.org/intro.

Рекомендуется, чтобы каждая тема Kafka имела свою собственную выделенную группу потребителей, что обеспечивает эксклюзивную пару между темой и группой, особенно в условиях, когда темы могут создаваться и удаляться динамически (например, в тестировании или на промежуточной стадии).

`SELECT` не особенно полезен для чтения сообщений (за исключением отладки), потому что каждое сообщение может быть прочитано только один раз. Более практично создавать потоки в реальном времени, используя материализованные представления. Для этого:

1. Используйте движок для создания потребителя Kafka и рассматривайте его как поток данных.
2. Создайте таблицу с желаемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` присоединяется к движку, он начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать сообщения из Kafka и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица Kafka может иметь столько материализованных представлений, сколько вы хотите; они не читают данные напрямую из таблицы kafka, а получают новые записи (пакетами), таким образом, вы можете записывать в несколько таблиц с разным уровнем детализации (с группировкой - агрегацией и без).

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
Чтобы улучшить производительность, полученные сообщения группируются в блоки размером [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size). Если блок не был сформирован в течение [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) миллисекунд, данные будут сброшены в таблицу, независимо от завершенности блока.

Чтобы прекратить получение данных темы или изменить логику преобразования, отсоедините материализованное представление:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу, используя `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Конфигурация {#configuration}

Подобно GraphiteMergeTree, движок Kafka поддерживает расширенную конфигурацию с использованием файла конфигурации ClickHouse. Есть два ключевых конфигурации, которые вы можете использовать: глобальная (ниже `<kafka>`) и на уровне темы (ниже `<kafka><kafka_topic>`). Глобальная конфигурация применяется первой, а затем применяется конфигурация на уровне темы (если она существует).

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

Для списка возможных параметров конфигурации смотрите [справочник конфигурации librdkafka](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). Используйте нижнее подчеркивание (`_`) вместо точки в конфигурации ClickHouse. Например, `check.crcs=true` будет `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos {#kafka-kerberos-support}

Для работы с Kafka, поддерживающей Kerberos, добавьте дочерний элемент `security_protocol` со значением `sasl_plaintext`. Достаточно, если билет на получение билетов Kerberos получен и кэширован средствами ОС.
ClickHouse может поддерживать учетные данные Kerberos с использование файла keytab. Учитывайте дочерние элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

Пример:

```xml
<!-- Kerberos-aware Kafka -->
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
- `_timestamp` — Временная метка сообщения. Тип данных: `Nullable(DateTime)`.
- `_timestamp_ms` — Временная метка в миллисекундах сообщения. Тип данных: `Nullable(DateTime64(3))`.
- `_partition` — Партиция темы Kafka. Тип данных: `UInt64`.
- `_headers.name` — Массив ключей заголовков сообщения. Тип данных: `Array(String)`.
- `_headers.value` — Массив значений заголовков сообщения. Тип данных: `Array(String)`.

Дополнительные виртуальные колонки, когда `kafka_handle_error_mode='stream'`:

- `_raw_message` - Сырой сообщение, которое не удалось успешно разобрать. Тип данных: `String`.
- `_error` - Сообщение исключения, возникшее во время неудачного разбора. Тип данных: `String`.

Примечание: Виртуальные колонки `_raw_message` и `_error` заполняются только в случае исключения при разборе; они всегда пустые, когда сообщение было успешно разобрано.

## Поддержка форматов данных {#data-formats-support}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат базирующимся на строках или на блоках:

- Для форматов на основе строк количество строк в одном сообщении Kafka можно контролировать, установив `kafka_max_rows_per_message`.
- Для форматов на основе блоков мы не можем разделить блок на более мелкие части, но количество строк в одном блоке можно контролировать с помощью общего параметра [max_block_size](/operations/settings/settings#max_block_size).

## Движок для хранения зафиксированных смещений в ClickHouse Keeper {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

Если `allow_experimental_kafka_offsets_storage_in_keeper` включен, то можно указать два дополнительных параметра для движка таблицы Kafka:
- `kafka_keeper_path` указывает путь к таблице в ClickHouse Keeper
- `kafka_replica_name` указывает имя реплики в ClickHouse Keeper

Оба параметра должны быть указаны либо ни один из них. Когда оба указаны, будет использоваться новый, экспериментальный движок Kafka. Новый движок не зависит от хранения зафиксированных смещений в Kafka, но сохраняет их в ClickHouse Keeper. Он по-прежнему пытается зафиксировать смещения в Kafka, но зависит от этих смещений только при создании таблицы. При любых других обстоятельствах (таблица перезапускается или восстанавливается после какой-либо ошибки) будут использоваться смещения, хранящиеся в ClickHouse Keeper, как смещение для продолжения потребления сообщений. Помимо зафиксированного смещения, он также хранит, сколько сообщений было потреблено в последнем пакете, так что если вставка завершится неудачей, будет потреблено такое же количество сообщений, что позволит провести дедупликацию при необходимости.

Пример:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### Известные ограничения {#known-limitations}

Поскольку новый движок является экспериментальным, он еще не готов к производству. Существуют несколько известных ограничений реализации:
- Наибольшее ограничение заключается в том, что движок не поддерживает прямое чтение. Чтение из движка с использованием материальных представлений и запись в движок работают, но прямое чтение не работает. В результате все прямые запросы `SELECT` будут завершаться неудачей.
- Быстрое удаление и воссоздание таблицы или указание одного и того же пути ClickHouse Keeper для разных движков может вызвать проблемы. В качестве лучшей практики вы можете использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтующих путей.
- Чтобы обеспечить повторяемость чтений, сообщения не могут быть потреблены из нескольких партиций в одном потоке. С другой стороны, потребители Kafka должны опрашиваться регулярно, чтобы оставаться активными. В результате этих двух целей мы решили разрешить создание нескольких потребителей только если `kafka_thread_per_consumer` включен, в противном случае слишком сложно избежать проблем, связанных с регулярной опроской потребителей.
- Потребители, создаваемые новым движком хранения, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**См. также**

- [Виртуальные колонки](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)