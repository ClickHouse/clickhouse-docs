---
slug: /engines/table-engines/integrations/rabbitmq
sidebar_position: 170
sidebar_label: RabbitMQ
title: 'RabbitMQ Engine'
description: 'Этот движок позволяет интегрировать ClickHouse с RabbitMQ.'
---


# RabbitMQ Engine

Этот движок позволяет интегрировать ClickHouse с [RabbitMQ](https://www.rabbitmq.com).

`RabbitMQ` позволяет вам:

- Публиковать или подписываться на потоки данных.
- Обрабатывать потоки по мере их поступления.

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = RabbitMQ SETTINGS
    rabbitmq_host_port = 'host:port' [или rabbitmq_address = 'amqp(s)://guest:guest@localhost/vhost'],
    rabbitmq_exchange_name = 'exchange_name',
    rabbitmq_format = 'data_format'[,]
    [rabbitmq_exchange_type = 'exchange_type',]
    [rabbitmq_routing_key_list = 'key1,key2,...',]
    [rabbitmq_secure = 0,]
    [rabbitmq_schema = '',]
    [rabbitmq_num_consumers = N,]
    [rabbitmq_num_queues = N,]
    [rabbitmq_queue_base = 'queue',]
    [rabbitmq_deadletter_exchange = 'dl-exchange',]
    [rabbitmq_persistent = 0,]
    [rabbitmq_skip_broken_messages = N,]
    [rabbitmq_max_block_size = N,]
    [rabbitmq_flush_interval_ms = N,]
    [rabbitmq_queue_settings_list = 'x-dead-letter-exchange=my-dlx,x-max-length=10,x-overflow=reject-publish',]
    [rabbitmq_queue_consume = false,]
    [rabbitmq_address = '',]
    [rabbitmq_vhost = '/',]
    [rabbitmq_username = '',]
    [rabbitmq_password = '',]
    [rabbitmq_commit_on_select = false,]
    [rabbitmq_max_rows_per_message = 1,]
    [rabbitmq_handle_error_mode = 'default']
```

Обязательные параметры:

- `rabbitmq_host_port` – host:port (например, `localhost:5672`).
- `rabbitmq_exchange_name` – имя обмена RabbitMQ.
- `rabbitmq_format` – формат сообщения. Использует ту же нотацию, что и функция SQL `FORMAT`, например, `JSONEachRow`. Для получения более подробной информации смотрите раздел [Форматы](../../../interfaces/formats.md).

Необязательные параметры:

- `rabbitmq_exchange_type` – тип обмена RabbitMQ: `direct`, `fanout`, `topic`, `headers`, `consistent_hash`. По умолчанию: `fanout`.
- `rabbitmq_routing_key_list` – Список ключей маршрутизации, разделённых запятыми.
- `rabbitmq_schema` – Параметр, который должен быть использован, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `rabbitmq_num_consumers` – количество потребителей на таблицу. Укажите большее количество потребителей, если производительность одного потребителя недостаточна. По умолчанию: `1`.
- `rabbitmq_num_queues` – Общее количество очередей. Увеличение этого числа может значительно улучшить производительность. По умолчанию: `1`.
- `rabbitmq_queue_base` - Укажите подсказку для имен очередей. Случаи использования этой настройки описаны ниже.
- `rabbitmq_deadletter_exchange` - Укажите имя для [обмена мёртвых писем](https://www.rabbitmq.com/dlx.html). Вы можете создать другую таблицу с этим именем обмена и собирать сообщения в случаях, когда они публикуются повторно в обмен мёртвых писем. По умолчанию обмен мёртвых писем не указан.
- `rabbitmq_persistent` - Если установлен в 1 (true), в режиме доставки запроса вставки будет установлен на 2 (помечает сообщения как 'постоянные'). По умолчанию: `0`.
- `rabbitmq_skip_broken_messages` – Толерантность парсера сообщений RabbitMQ к схематически несовместимым сообщениям на блок. Если `rabbitmq_skip_broken_messages = N`, то движок пропустит *N* сообщений RabbitMQ, которые не могут быть разобраны (сообщение равно строке данных). По умолчанию: `0`.
- `rabbitmq_max_block_size` - Количество строк, собранных перед сбросом данных из RabbitMQ. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `rabbitmq_flush_interval_ms` - Время ожидания для сброса данных из RabbitMQ. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `rabbitmq_queue_settings_list` - позволяет устанавливать настройки RabbitMQ при создании очереди. Доступные настройки: `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`. Настройка `durable` автоматически включается для очереди.
- `rabbitmq_address` - Адрес для подключения. Используйте либо эту настройку, либо `rabbitmq_host_port`.
- `rabbitmq_vhost` - vhost RabbitMQ. По умолчанию: `'\'`.
- `rabbitmq_queue_consume` - Используйте очереди, определенные пользователем, и не настраивайте RabbitMQ: объявления обменов, очередей, привязок. По умолчанию: `false`.
- `rabbitmq_username` - Имя пользователя RabbitMQ.
- `rabbitmq_password` - Пароль RabbitMQ.
- `reject_unhandled_messages` - Отклонять сообщения (отправлять отрицательное подтверждение RabbitMQ) в случае ошибок. Эта настройка автоматически включается, если в `rabbitmq_queue_settings_list` определен `x-dead-letter-exchange`.
- `rabbitmq_commit_on_select` - Подтверждать сообщения при выполнении запроса select. По умолчанию: `false`.
- `rabbitmq_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение RabbitMQ для форматов на основе строк. По умолчанию: `1`.
- `rabbitmq_empty_queue_backoff_start` — Начальная точка ожидания для перепланировки чтения, если очередь rabbitmq пуста.
- `rabbitmq_empty_queue_backoff_end` — Конечная точка ожидания для перепланировки чтения, если очередь rabbitmq пуста.
- `rabbitmq_handle_error_mode` — Как обрабатывать ошибки для движка RabbitMQ. Возможные значения: default (исключение будет выброшено, если не удастся разобрать сообщение), stream (сообщение об исключении и сырое сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).

* [ ] SSL-соединение:

Используйте либо `rabbitmq_secure = 1`, либо `amqps` в адресе подключения: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`.
Поведение по умолчанию используемой библиотеки не проверяет, является ли созданное TLS соединение достаточно безопасным. Независимо от того, истек ли сертификат, самоподписан, отсутствует или недействителен: соединение просто разрешается. Более строгая проверка сертификатов может быть реализована в будущем.

Также можно добавить настройки формата вместе с настройками, связанными с rabbitmq.

Пример:

``` sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                            rabbitmq_exchange_name = 'exchange1',
                            rabbitmq_format = 'JSONEachRow',
                            rabbitmq_num_consumers = 5,
                            date_time_input_format = 'best_effort';
```

Конфигурация сервера RabbitMQ должна быть добавлена с использованием конфигурационного файла ClickHouse.

Обязательная конфигурация:

``` xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

Дополнительная конфигурация:

``` xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```

## Описание {#description}

`SELECT` не очень полезен для чтения сообщений (за исключением отладки), поскольку каждое сообщение можно прочитать только один раз. Практичнее создать потоки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания потребителя RabbitMQ и рассматривайте его как поток данных.
2. Создайте таблицу с нужной структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, он начинает собирать данные в фоновом режиме. Это позволяет постоянно получать сообщения из RabbitMQ и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица RabbitMQ может иметь столько материализованных представлений, сколько вы хотите.

Данные могут быть переданы на основе `rabbitmq_exchange_type` и указанного `rabbitmq_routing_key_list`.
Не может быть более одного обмена на таблицу. Один обмен может быть использован несколькими таблицами - это позволяет маршрутизировать в несколько таблиц одновременно.

Варианты типов обмена:

- `direct` - Маршрутизация основана на точном совпадении ключей. Пример списка ключей таблицы: `key1,key2,key3,key4,key5`, ключ сообщения может равняться любому из них.
- `fanout` - Маршрутизация ко всем таблицам (где имя обмена одинаковое) независимо от ключей.
- `topic` - Маршрутизация основана на шаблонах с ключами, разделёнными точками. Примеры: `*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`.
- `headers` - Маршрутизация основана на совпадениях `key=value` с установкой `x-match=all` или `x-match=any`. Пример списка ключей таблицы: `x-match=all,format=logs,type=report,year=2020`.
- `consistent_hash` - Данные равномерно распределяются между всеми связанными таблицами (где имя обмена одинаковое). Обратите внимание, что этот тип обмена должен быть включен с помощью плагина RabbitMQ: `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`.

Настройка `rabbitmq_queue_base` может быть использована для следующих случаев:

- для того чтобы разные таблицы могли делить очереди, так чтобы несколько потребителей могли быть зарегистрированы для одних и тех же очередей, что обеспечивает лучшую производительность. Если использовать настройки `rabbitmq_num_consumers` и/или `rabbitmq_num_queues`, точное соответствие очередей достигается в случае, если эти параметры одинаковы.
- чтобы иметь возможность восстановить чтение из определённых постоянных очередей, когда не все сообщения были успешно обработаны. Чтобы возобновить потребление из одной конкретной очереди – установите её имя в настройке `rabbitmq_queue_base` и не указывайте `rabbitmq_num_consumers` и `rabbitmq_num_queues` (по умолчанию равны 1). Чтобы возобновить потребление из всех очередей, которые были объявлены для конкретной таблицы – просто укажите те же настройки: `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`. По умолчанию имена очередей будут уникальны для таблиц.
- для повторного использования очередей, так как они объявлены постоянными и не будут автоматически удалены. (Могут быть удалены с помощью любых инструментов CLI RabbitMQ.)

Для повышения производительности полученные сообщения группируются в блоки размером [max_insert_block_size](/operations/settings/settings#max_insert_block_size). Если блок не был сформирован в течение [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) миллисекунд, данные будут сброшены в таблицу независимо от полноты блока.

Если настройки `rabbitmq_num_consumers` и/или `rabbitmq_num_queues` указаны вместе с `rabbitmq_exchange_type`, то:

- Нужно включить плагин `rabbitmq-consistent-hash-exchange`.
- Свойство `message_id` публикуемых сообщений должно быть указано (уникально для каждого сообщения/пакета).

Для запроса вставки имеется метаданные сообщений, которые добавляются для каждого опубликованного сообщения: `messageID` и флаг `republished` (true, если опубликовано более одного раза) - можно получить через заголовки сообщения.

Не используйте одну и ту же таблицу для вставок и материализованных представлений.

Пример:

``` sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                            rabbitmq_exchange_name = 'exchange1',
                            rabbitmq_exchange_type = 'headers',
                            rabbitmq_routing_key_list = 'format=logs,type=report,year=2020',
                            rabbitmq_format = 'JSONEachRow',
                            rabbitmq_num_consumers = 5;

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```

## Виртуальные колонки {#virtual-columns}

- `_exchange_name` - Имя обмена RabbitMQ. Тип данных: `String`.
- `_channel_id` - ChannelID, на котором был объявлен потребитель, который получил сообщение. Тип данных: `String`.
- `_delivery_tag` - DeliveryTag полученного сообщения. Установлено на уровне канала. Тип данных: `UInt64`.
- `_redelivered` - Флаг `redelivered` сообщения. Тип данных: `UInt8`.
- `_message_id` - messageID полученного сообщения; непустой, если был установлен, когда сообщение было опубликовано. Тип данных: `String`.
- `_timestamp` - Временная метка полученного сообщения; непустая, если была установлена, когда сообщение было опубликовано. Тип данных: `UInt64`.

Дополнительные виртуальные колонки при `kafka_handle_error_mode='stream'`:

- `_raw_message` - Сырое сообщение, которое не удалось успешно разобрать. Тип данных: `Nullable(String)`.
- `_error` - Сообщение об исключении, произошедшем во время неудачного разбора. Тип данных: `Nullable(String)`.

Примечание: виртуальные колонки `_raw_message` и `_error` заполняются только в случае исключения во время разбора, они всегда равны `NULL`, когда сообщение было успешно разобрано.

## Ограничения {#caveats}

Несмотря на то, что вы можете указывать [выражения столбцов по умолчанию](/sql-reference/statements/create/table.md/#default_values) (такие как `DEFAULT`, `MATERIALIZED`, `ALIAS`) в определении таблицы, они будут проигнорированы. Вместо этого столбцы будут заполнены их соответствующими значениями по умолчанию для своих типов.

## Поддержка форматов данных {#data-formats-support}

Движок RabbitMQ поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении RabbitMQ зависит от того, является ли формат на основе строк или блоков:

- Для форматов на основе строк количество строк в одном сообщении RabbitMQ может контролироваться с помощью настройки `rabbitmq_max_rows_per_message`.
- Для форматов на основе блоков мы не можем разделить блок на меньшие части, но количество строк в одном блоке можно контролировать с помощью общей настройки [max_block_size](/operations/settings/settings#max_block_size).
