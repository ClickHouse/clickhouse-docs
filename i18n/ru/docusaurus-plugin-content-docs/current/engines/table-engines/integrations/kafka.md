---
description: 'Движок таблиц Kafka можно использовать для взаимодействия с Apache Kafka: он позволяет публиковать или подписываться
  на потоки данных, организовывать отказоустойчивое хранилище и обрабатывать потоки по мере их
  поступления.'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Движок таблиц Kafka'
keywords: ['Kafka', 'table engine']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Табличный движок Kafka

:::tip
Если вы используете ClickHouse Cloud, мы рекомендуем вместо этого использовать [ClickPipes](/integrations/clickpipes). ClickPipes нативно поддерживает подключения по частной сети, независимое масштабирование ресурсов ингестии и самого кластера, а также комплексный мониторинг потоковой загрузки данных из Kafka в ClickHouse.
:::

- Публиковать или подписываться на потоки данных.
- Организовывать отказоустойчивое хранилище.
- Обрабатывать потоки по мере их поступления.



## Создание таблицы

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
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

Обязательные параметры:

* `kafka_broker_list` — список брокеров, разделённых запятыми (например, `localhost:9092`).
* `kafka_topic_list` — список топиков Kafka.
* `kafka_group_name` — группа потребителей Kafka. Смещения чтения отслеживаются отдельно для каждой группы. Если вы не хотите, чтобы сообщения дублировались в кластере, используйте одно и то же имя группы повсюду.
* `kafka_format` — формат сообщений. Использует тот же синтаксис, что и SQL-функция `FORMAT`, например `JSONEachRow`. Дополнительную информацию см. в разделе [Formats](../../../interfaces/formats.md).

Необязательные параметры:


* `kafka_security_protocol` — Протокол, используемый для взаимодействия с брокерами. Возможные значения: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
* `kafka_sasl_mechanism` — Механизм SASL, используемый для аутентификации. Возможные значения: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
* `kafka_sasl_username` — Имя пользователя SASL для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
* `kafka_sasl_password` — Пароль SASL для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
* `kafka_schema` — Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap&#39;n Proto](https://capnproto.org/) требует указания пути к файлу схемы и имени корневого объекта `schema.capnp:Message`.
* `kafka_schema_registry_skip_bytes` — Количество байт, которое нужно пропустить в начале каждого сообщения при использовании реестра схем с заголовками-конвертами (например, AWS Glue Schema Registry, который включает 19-байтовый конверт). Диапазон: `[0, 255]`. Значение по умолчанию: `0`.
* `kafka_num_consumers` — Количество потребителей на таблицу. Укажите большее количество потребителей, если пропускной способности одного потребителя недостаточно. Общее число потребителей не должно превышать число партиций в топике, так как на одну партицию может быть назначен только один потребитель, и не должно быть больше количества физических ядер на сервере, где развернут ClickHouse. Значение по умолчанию: `1`.
* `kafka_max_block_size` — Максимальный размер пакета (в сообщениях) для опроса (poll). Значение по умолчанию: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size).
* `kafka_skip_broken_messages` — Допустимое количество сообщений Kafka с несовместимой схемой на блок для парсера сообщений. Если `kafka_skip_broken_messages = N`, то движок пропускает *N* сообщений Kafka, которые не могут быть разобраны (одно сообщение соответствует одной строке данных). Значение по умолчанию: `0`.
* `kafka_commit_every_batch` — Подтверждать (commit) каждый потреблённый и обработанный пакет вместо одного commit после записи всего блока. Значение по умолчанию: `0`.
* `kafka_client_id` — Идентификатор клиента. По умолчанию пустой.
* `kafka_poll_timeout_ms` — Таймаут для одного опроса (poll) из Kafka. Значение по умолчанию: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
* `kafka_poll_max_batch_size` — Максимальное количество сообщений, которое может быть получено за один опрос Kafka. Значение по умолчанию: [max&#95;block&#95;size](/operations/settings/settings#max_block_size).
* `kafka_flush_interval_ms` — Таймаут для сброса (flushing) данных из Kafka. Значение по умолчанию: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms).
* `kafka_thread_per_consumer` — Выделять отдельный поток для каждого потребителя. При включении каждый потребитель сбрасывает данные независимо, параллельно (в противном случае строки от нескольких потребителей объединяются в один блок). Значение по умолчанию: `0`.
* `kafka_handle_error_mode` — Способ обработки ошибок для движка Kafka. Возможные значения: `default` (будет выброшено исключение, если не удалось разобрать сообщение), `stream` (текст исключения и исходное сообщение будут сохранены во виртуальных столбцах `_error` и `_raw_message`), `dead_letter_queue` (данные, относящиеся к ошибкам, будут сохранены в `system.dead_letter_queue`).
* `kafka_commit_on_select` — Подтверждать (commit) сообщения при выполнении запроса `SELECT`. Значение по умолчанию: `false`.
* `kafka_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение Kafka для построчных форматов. Значение по умолчанию: `1`.
* `kafka_compression_codec` — Кодек сжатия, используемый при публикации сообщений. Поддерживаются: пустая строка, `none`, `gzip`, `snappy`, `lz4`, `zstd`. В случае пустой строки кодек сжатия не задаётся на уровне таблицы, поэтому будут использоваться значения из конфигурационных файлов или значение по умолчанию из `librdkafka`. Значение по умолчанию: пустая строка.
* `kafka_compression_level` — Параметр уровня сжатия для алгоритма, выбранного в `kafka_compression_codec`. Более высокие значения обеспечивают лучшее сжатие ценой большего использования CPU. Допустимый диапазон зависит от алгоритма: `[0-9]` для `gzip`; `[0-12]` для `lz4`; только `0` для `snappy`; `[0-12]` для `zstd`; `-1` = уровень сжатия по умолчанию, зависящий от кодека. Значение по умолчанию: `-1`.

Примеры:

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;
```


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

````

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. По возможности переключите старые проекты на метод, описанный выше.
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
````

</details>

:::info
Табличный движок Kafka не поддерживает столбцы со [значением по умолчанию](/sql-reference/statements/create/table#default_values). Если вам нужны столбцы со значением по умолчанию, вы можете добавить их на уровне материализованного представления (см. ниже).
:::


## Описание

Доставленные сообщения отслеживаются автоматически, поэтому каждое сообщение в группе учитывается только один раз. Если вы хотите получить данные дважды, создайте копию таблицы с другим именем группы.

Группы гибкие и синхронизированы в кластере. Например, если у вас есть 10 топиков и 5 копий таблицы в кластере, то каждая копия получает по 2 топика. Если число копий изменится, топики будут автоматически перераспределены между копиями. Подробнее об этом читайте на [http://kafka.apache.org/intro](http://kafka.apache.org/intro).

Рекомендуется, чтобы у каждого топика Kafka была собственная выделенная группа потребителей (consumer group), обеспечивающая эксклюзивную связку между топиком и группой, особенно в средах, где топики могут динамически создаваться и удаляться (например, в тестовой или staging-среде).

`SELECT` не особенно полезен для чтения сообщений (кроме отладки), потому что каждое сообщение можно прочитать только один раз. Гораздо практичнее создавать потоки реального времени, используя материализованные представления. Для этого:

1. Используйте движок, чтобы создать consumer Kafka и рассматривать его как поток данных.
2. Создайте таблицу с требуемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` привязывается к движку, оно начинает собирать данные в фоновом режиме. Это позволяет постоянно получать сообщения из Kafka и преобразовывать их в нужный формат с помощью `SELECT`.\
Одна таблица Kafka может иметь сколько угодно материализованных представлений: они не читают данные непосредственно из таблицы Kafka, а получают новые записи (блоками). Таким образом, вы можете писать в несколько таблиц с разным уровнем детализации (с группировкой — агрегацией и без).

Пример:

```sql
  CREATE TABLE очередь (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  CREATE TABLE ежедневно (
    day Date,
    level String,
    total UInt64
  ) ENGINE = SummingMergeTree(day, (day, level), 8192);

  CREATE MATERIALIZED VIEW потребитель TO ежедневно
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
    FROM очередь GROUP BY day, level;

  SELECT level, sum(total) FROM ежедневно GROUP BY level;
```

Для повышения производительности полученные сообщения группируются в блоки размером [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size). Если блок не был сформирован в течение [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) миллисекунд, данные будут записаны в таблицу независимо от полноты блока.

Чтобы прекратить получение данных из топика или изменить логику преобразования, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью оператора `ALTER`, рекомендуем предварительно отключить материализованное представление, чтобы избежать расхождений между целевой таблицей и данными из представления.


## Конфигурация

Аналогично GraphiteMergeTree, движок Kafka поддерживает расширенную конфигурацию с использованием конфигурационного файла ClickHouse. Доступно два ключа конфигурации: глобальный (в секции `<kafka>`) и на уровне топика (в секции `<kafka><kafka_topic>`). Сначала применяется глобальная конфигурация, затем — конфигурация на уровне топика (если она существует).

```xml
  <kafka>
    <!-- Глобальные параметры конфигурации для всех таблиц с движком типа Kafka -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- Настройки потребителя -->
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

    <!-- Настройки продюсера -->
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

Список возможных вариантов конфигурации см. в [справочнике по конфигурации librdkafka](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). В конфигурации ClickHouse используйте символ подчёркивания (`_`) вместо точки. Например, `check.crcs=true` будет `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos

Для работы с Kafka, поддерживающей Kerberos, добавьте дочерний элемент `security_protocol` со значением `sasl_plaintext`. Этого достаточно, если основной билет Kerberos (ticket-granting ticket) получен и закэширован средствами ОС.
ClickHouse может управлять учётными данными Kerberos с использованием keytab-файла. Можно использовать дочерние элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

Пример:

```xml
<!-- Kafka с поддержкой Kerberos -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```


## Виртуальные столбцы {#virtual-columns}

- `_topic` — топик Kafka. Тип данных: `LowCardinality(String)`.
- `_key` — ключ сообщения. Тип данных: `String`.
- `_offset` — смещение сообщения. Тип данных: `UInt64`.
- `_timestamp` — метка времени сообщения. Тип данных: `Nullable(DateTime)`.
- `_timestamp_ms` — метка времени сообщения в миллисекундах. Тип данных: `Nullable(DateTime64(3))`.
- `_partition` — партиция топика Kafka. Тип данных: `UInt64`.
- `_headers.name` — массив ключей заголовков сообщения. Тип данных: `Array(String)`.
- `_headers.value` — массив значений заголовков сообщения. Тип данных: `Array(String)`.

Дополнительные виртуальные столбцы при `kafka_handle_error_mode='stream'`:

- `_raw_message` — исходное сообщение, которое не удалось разобрать. Тип данных: `String`.
- `_error` — текст исключения, возникшего при неудачном разборе. Тип данных: `String`.

Примечание: виртуальные столбцы `_raw_message` и `_error` заполняются только в случае исключения во время разбора, при успешном разборе сообщения они всегда пусты.



## Поддержка форматов данных {#data-formats-support}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат строко-ориентированным или блочно-ориентированным:

- Для строко-ориентированных форматов количество строк в одном сообщении Kafka можно контролировать с помощью настройки `kafka_max_rows_per_message`.
- Для блочно-ориентированных форматов нельзя разбить блок на более мелкие части, но количество строк в одном блоке можно контролировать с помощью общей настройки [max_block_size](/operations/settings/settings#max_block_size).



## Движок для хранения зафиксированных смещений в ClickHouse Keeper

<ExperimentalBadge />

Если включён `allow_experimental_kafka_offsets_storage_in_keeper`, то для движка таблицы Kafka можно задать ещё два параметра:

* `kafka_keeper_path` задаёт путь к таблице в ClickHouse Keeper
* `kafka_replica_name` задаёт имя реплики в ClickHouse Keeper

Должны быть либо заданы оба параметра, либо ни один из них. Когда оба параметра заданы, используется новый, экспериментальный движок Kafka. Новый движок не зависит от хранения зафиксированных смещений в Kafka, а сохраняет их в ClickHouse Keeper. Он по-прежнему пытается зафиксировать смещения в Kafka, но опирается на эти смещения только при создании таблицы. Во всех остальных случаях (перезапуск таблицы или восстановление после какой-либо ошибки) смещения, сохранённые в ClickHouse Keeper, будут использоваться как смещение, с которого следует продолжить потребление сообщений. Помимо зафиксированного смещения, он также сохраняет, сколько сообщений было прочитано в последнем батче, поэтому, если вставка завершится неудачей, будет прочитано то же количество сообщений, что при необходимости позволяет включить дедупликацию.

Пример:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### Известные ограничения

Поскольку новый движок является экспериментальным, он еще не готов для промышленной эксплуатации. Реализация имеет несколько известных ограничений:

* Наибольшее ограничение заключается в том, что движок не поддерживает прямое чтение. Чтение из движка с использованием материализованных представлений и запись в движок работают, но прямое чтение — нет. В результате все прямые запросы `SELECT` будут завершаться с ошибкой.
* Быстрое удаление и повторное создание таблицы или указание одного и того же пути ClickHouse Keeper для разных движков может вызвать проблемы. В качестве рекомендации по лучшей практике вы можете использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтов путей.
* Для обеспечения повторяемых чтений сообщения не могут потребляться из нескольких партиций в одном потоке. С другой стороны, Kafka‑консьюмеры необходимо регулярно опрашивать, чтобы поддерживать их в активном состоянии. В результате этих двух требований мы решили разрешать создание нескольких консьюмеров только в том случае, если включен `kafka_thread_per_consumer`, в противном случае слишком сложно избежать проблем, связанных с регулярным опросом консьюмеров.
* Консьюмеры, создаваемые новым движком хранения, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**См. также**

* [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
* [system.kafka&#95;consumers](../../../operations/system-tables/kafka_consumers.md)
