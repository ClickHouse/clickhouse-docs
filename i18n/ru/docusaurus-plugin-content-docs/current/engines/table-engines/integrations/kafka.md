---
description: 'Табличный движок Kafka можно использовать совместно с Apache Kafka: он позволяет публиковать данные или подписываться
  на потоки данных, организовывать отказоустойчивое хранение и обрабатывать потоки по мере их поступления.'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Табличный движок Kafka'
keywords: ['Kafka', 'табличный движок']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Движок таблиц Kafka

:::tip
Если вы используете ClickHouse Cloud, мы рекомендуем вместо этого использовать [ClickPipes](/integrations/clickpipes). ClickPipes изначально поддерживает приватные сетевые подключения, независимое масштабирование ресурсов приема данных и ресурсов кластера, а также комплексный мониторинг потоковой загрузки данных из Kafka в ClickHouse.
:::

- Публикация или подписка на потоки данных.
- Организация отказоустойчивого хранилища.
- Обработка потоков по мере их поступления.



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
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

Обязательные параметры:

- `kafka_broker_list` — Список брокеров, разделённых запятыми (например, `localhost:9092`).
- `kafka_topic_list` — Список топиков Kafka.
- `kafka_group_name` — Группа потребителей Kafka. Смещения чтения отслеживаются для каждой группы отдельно. Если вы не хотите дублирования сообщений в кластере, используйте одно и то же имя группы везде.
- `kafka_format` — Формат сообщений. Использует ту же нотацию, что и SQL-функция `FORMAT`, например `JSONEachRow`. Подробнее см. раздел [Форматы](../../../interfaces/formats.md).

Необязательные параметры:


* `kafka_security_protocol` - Протокол, используемый для взаимодействия с брокерами. Возможные значения: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`.
* `kafka_sasl_mechanism` - Механизм SASL, используемый для аутентификации. Возможные значения: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`.
* `kafka_sasl_username` - Имя пользователя SASL для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
* `kafka_sasl_password` - Пароль SASL для использования с механизмами `PLAIN` и `SASL-SCRAM-..`.
* `kafka_schema` — Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap&#39;n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
* `kafka_schema_registry_skip_bytes` — Количество байт, которые нужно пропустить в начале каждого сообщения при использовании реестра схем с конвертом в заголовке (например, AWS Glue Schema Registry, который включает 19-байтовый конверт). Диапазон: `[0, 255]`. По умолчанию: `0`.
* `kafka_num_consumers` — Количество потребителей на таблицу. Укажите большее количество потребителей, если пропускная способность одного потребителя недостаточна. Общее количество потребителей не должно превышать количество партиций в топике, так как только один потребитель может быть назначен на партицию, и не должно быть больше числа физических ядер на сервере, где развернут ClickHouse. По умолчанию: `1`.
* `kafka_max_block_size` — Максимальный размер пакета (в сообщениях) для poll. По умолчанию: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size).
* `kafka_skip_broken_messages` — Допустимое количество сообщений Kafka в блоке, несовместимых со схемой, для парсера сообщений Kafka. Если `kafka_skip_broken_messages = N`, то движок пропускает *N* сообщений Kafka, которые не могут быть разобраны (сообщение соответствует строке данных). По умолчанию: `0`.
* `kafka_commit_every_batch` — Фиксировать (commit) каждый прочитанный и обработанный пакет вместо единственного коммита после записи всего блока. По умолчанию: `0`.
* `kafka_client_id` — Идентификатор клиента. По умолчанию пустой.
* `kafka_poll_timeout_ms` — Таймаут для одного poll из Kafka. По умолчанию: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
* `kafka_poll_max_batch_size` — Максимальное количество сообщений, запрашиваемых за один poll Kafka. По умолчанию: [max&#95;block&#95;size](/operations/settings/settings#max_block_size).
* `kafka_flush_interval_ms` — Таймаут для сброса (flushing) данных из Kafka. По умолчанию: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms).
* `kafka_thread_per_consumer` — Выделять отдельный поток для каждого потребителя. Если включено, каждый потребитель сбрасывает данные независимо, параллельно (в противном случае строки от нескольких потребителей объединяются для формирования одного блока). По умолчанию: `0`.
* `kafka_handle_error_mode` — Способ обработки ошибок для движка Kafka. Возможные значения: `default` (будет сгенерировано исключение, если не удалось разобрать сообщение), `stream` (текст исключения и исходное сообщение будут сохранены во виртуальных столбцах `_error` и `_raw_message`), `dead&#95;letter&#95;queue` (данные, связанные с ошибками, будут сохранены в system.dead&#95;letter&#95;queue).
* `kafka_commit_on_select` — Фиксировать сообщения при выполнении запроса `SELECT`. По умолчанию: `false`.
* `kafka_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение Kafka для построчных форматов. По умолчанию: `1`.
* `kafka_compression_codec` — Кодек сжатия, используемый для формирования сообщений. Поддерживаются: пустая строка, `none`, `gzip`, `snappy`, `lz4`, `zstd`. В случае пустой строки кодек сжатия не задаётся таблицей, поэтому будут использоваться значения из конфигурационных файлов или значение по умолчанию из `librdkafka`. По умолчанию: пустая строка.
* `kafka_compression_level` — Параметр уровня сжатия для алгоритма, выбранного `kafka_compression_codec`. Более высокие значения дают лучшее сжатие за счёт большего использования CPU. Допустимый диапазон зависит от алгоритма: `[0-9]` для `gzip`; `[0-12]` для `lz4`; только `0` для `snappy`; `[0-12]` для `zstd`; `-1` = уровень сжатия по умолчанию, зависящий от кодека. По умолчанию: `-1`.

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

<summary>Устаревший способ создания таблицы</summary>

:::note
Не используйте этот способ в новых проектах. По возможности переведите старые проекты на способ, описанный выше.
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
````

</details>

:::info
Движок таблиц Kafka не поддерживает столбцы со [значением по умолчанию](/sql-reference/statements/create/table#default_values). Если необходимы столбцы со значением по умолчанию, их можно добавить на уровне материализованного представления (см. ниже).
:::


## Описание {#description}

Доставленные сообщения отслеживаются автоматически, поэтому каждое сообщение в группе учитывается только один раз. Если необходимо получить данные дважды, создайте копию таблицы с другим именем группы.

Группы являются гибкими и синхронизируются в кластере. Например, если у вас есть 10 топиков и 5 копий таблицы в кластере, то каждая копия получает 2 топика. При изменении количества копий топики автоматически перераспределяются между копиями. Подробнее об этом читайте на http://kafka.apache.org/intro.

Рекомендуется, чтобы каждый топик Kafka имел свою выделенную группу потребителей, обеспечивая эксклюзивную связь между топиком и группой, особенно в средах, где топики могут создаваться и удаляться динамически (например, в тестовых или промежуточных средах).

`SELECT` не особенно полезен для чтения сообщений (за исключением отладки), поскольку каждое сообщение может быть прочитано только один раз. Более практично создавать потоки реального времени с использованием материализованных представлений. Для этого:

1.  Используйте движок для создания потребителя Kafka и рассматривайте его как поток данных.
2.  Создайте таблицу с желаемой структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` присоединяется к движку, оно начинает собирать данные в фоновом режиме. Это позволяет непрерывно получать сообщения из Kafka и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица Kafka может иметь сколько угодно материализованных представлений, они не читают данные из таблицы Kafka напрямую, а получают новые записи (блоками), таким образом можно записывать данные в несколько таблиц с различным уровнем детализации (с группировкой и агрегацией или без них).

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

Для повышения производительности полученные сообщения группируются в блоки размером [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size). Если блок не был сформирован в течение [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) миллисекунд, данные будут записаны в таблицу независимо от полноты блока.

Чтобы прекратить получение данных из топика или изменить логику преобразования, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если необходимо изменить целевую таблицу с помощью `ALTER`, рекомендуется отключить материализованное представление, чтобы избежать расхождений между целевой таблицей и данными из представления.


## Конфигурация {#configuration}

Аналогично GraphiteMergeTree, движок Kafka поддерживает расширенную конфигурацию через конфигурационный файл ClickHouse. Доступны два уровня конфигурации: глобальный (в разделе `<kafka>`) и на уровне топика (в разделе `<kafka><kafka_topic>`). Сначала применяется глобальная конфигурация, затем конфигурация уровня топика (если она задана).

```xml
  <kafka>
    <!-- Глобальные параметры конфигурации для всех таблиц с движком Kafka -->
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

Список доступных параметров конфигурации см. в [справочнике по конфигурации librdkafka](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md). В конфигурации ClickHouse используйте символ подчеркивания (`_`) вместо точки. Например, `check.crcs=true` записывается как `<check_crcs>true</check_crcs>`.

### Поддержка Kerberos {#kafka-kerberos-support}

Для работы с Kafka с поддержкой Kerberos добавьте дочерний элемент `security_protocol` со значением `sasl_plaintext`. Достаточно, чтобы ticket-granting ticket Kerberos был получен и кэширован средствами операционной системы.
ClickHouse может управлять учетными данными Kerberos с использованием файла keytab. Используйте дочерние элементы `sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`.

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
- `_timestamp` — временная метка сообщения. Тип данных: `Nullable(DateTime)`.
- `_timestamp_ms` — временная метка сообщения в миллисекундах. Тип данных: `Nullable(DateTime64(3))`.
- `_partition` — партиция топика Kafka. Тип данных: `UInt64`.
- `_headers.name` — массив ключей заголовков сообщения. Тип данных: `Array(String)`.
- `_headers.value` — массив значений заголовков сообщения. Тип данных: `Array(String)`.

Дополнительные виртуальные столбцы при `kafka_handle_error_mode='stream'`:

- `_raw_message` — исходное сообщение, которое не удалось успешно разобрать. Тип данных: `String`.
- `_error` — сообщение об исключении, возникшем при неудачном разборе. Тип данных: `String`.

Примечание: виртуальные столбцы `_raw_message` и `_error` заполняются только в случае возникновения исключения при разборе; они всегда пусты, когда сообщение было успешно разобрано.


## Поддержка форматов данных {#data-formats-support}

Движок Kafka поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении Kafka зависит от того, является ли формат построчным или блочным:

- Для построчных форматов количество строк в одном сообщении Kafka можно контролировать с помощью настройки `kafka_max_rows_per_message`.
- Для блочных форматов невозможно разделить блок на более мелкие части, но количество строк в одном блоке можно контролировать с помощью общей настройки [max_block_size](/operations/settings/settings#max_block_size).


## Движок для хранения зафиксированных смещений в ClickHouse Keeper {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge />

Если включена настройка `allow_experimental_kafka_offsets_storage_in_keeper`, для движка таблиц Kafka можно указать две дополнительные настройки:

- `kafka_keeper_path` — путь к таблице в ClickHouse Keeper
- `kafka_replica_name` — имя реплики в ClickHouse Keeper

Должны быть указаны либо обе настройки, либо ни одна из них. При указании обеих настроек будет использоваться новый экспериментальный движок Kafka. Новый движок не зависит от хранения зафиксированных смещений в Kafka, а сохраняет их в ClickHouse Keeper. Он по-прежнему пытается зафиксировать смещения в Kafka, но использует эти смещения только при создании таблицы. Во всех остальных случаях (перезапуск таблицы или восстановление после ошибки) для продолжения потребления сообщений будут использоваться смещения, хранящиеся в ClickHouse Keeper. Помимо зафиксированного смещения, движок также сохраняет количество сообщений, потребленных в последнем пакете. Поэтому в случае сбоя вставки будет потреблено то же количество сообщений, что при необходимости позволяет выполнить дедупликацию.

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

Поскольку новый движок является экспериментальным, он еще не готов к использованию в продакшене. Существует несколько известных ограничений реализации:

- Основное ограничение заключается в том, что движок не поддерживает прямое чтение. Чтение из движка с использованием материализованных представлений и запись в движок работают, но прямое чтение не поддерживается. В результате все прямые запросы `SELECT` будут завершаться с ошибкой.
- Быстрое удаление и повторное создание таблицы или указание одного и того же пути ClickHouse Keeper для разных движков может вызвать проблемы. Рекомендуется использовать `{uuid}` в `kafka_keeper_path`, чтобы избежать конфликтов путей.
- Для обеспечения повторяемых чтений сообщения не могут потребляться из нескольких партиций в одном потоке. С другой стороны, потребители Kafka должны регулярно опрашиваться для поддержания их активности. В результате этих двух требований мы решили разрешить создание нескольких потребителей только при включенной настройке `kafka_thread_per_consumer`, иначе слишком сложно избежать проблем, связанных с регулярным опросом потребителей.
- Потребители, созданные новым движком хранения, не отображаются в таблице [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md).

**См. также**

- [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
