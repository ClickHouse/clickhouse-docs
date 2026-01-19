---
description: 'Этот движок позволяет интегрировать ClickHouse с RabbitMQ.'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'Табличный движок RabbitMQ'
doc_type: 'guide'
---

# Табличный движок RabbitMQ \{#rabbitmq-table-engine\}

Этот движок позволяет интегрировать ClickHouse с [RabbitMQ](https://www.rabbitmq.com).

`RabbitMQ` позволяет:

- Публиковать или подписываться на потоки данных.
- Обрабатывать потоки по мере их поступления.

## Создание таблицы \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = RabbitMQ SETTINGS
    rabbitmq_host_port = 'host:port' [or rabbitmq_address = 'amqp(s)://guest:guest@localhost/vhost'],
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

* `rabbitmq_host_port` – host:port (например, `localhost:5672`).
* `rabbitmq_exchange_name` – имя обмена RabbitMQ.
* `rabbitmq_format` – формат сообщений. Использует ту же нотацию, что и SQL-функция `FORMAT`, например `JSONEachRow`. Дополнительные сведения см. в разделе [Форматы](../../../interfaces/formats.md).

Необязательные параметры:


- `rabbitmq_exchange_type` – Тип обменника RabbitMQ: `direct`, `fanout`, `topic`, `headers`, `consistent_hash`. По умолчанию: `fanout`.
- `rabbitmq_routing_key_list` – Список ключей маршрутизации (routing keys), разделённых запятыми.
- `rabbitmq_schema` – Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует указать путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `rabbitmq_num_consumers` – Количество consumers на таблицу. Укажите большее число consumers, если пропускной способности одного недостаточно. По умолчанию: `1`.
- `rabbitmq_num_queues` – Общее количество очередей. Увеличение этого числа может значительно повысить производительность. По умолчанию: `1`.
- `rabbitmq_queue_base` - Укажите префикс для имён очередей. Сценарии использования этого параметра описаны ниже.
- `rabbitmq_persistent` - Если установлено в 1 (true), в запросе INSERT режим доставки будет установлен в 2 (помечает сообщения как `persistent`). По умолчанию: `0`.
- `rabbitmq_skip_broken_messages` – Допустимое количество сообщений RabbitMQ, несовместимых со схемой, в одном блоке при разборе. Если `rabbitmq_skip_broken_messages = N`, то движок пропускает *N* сообщений RabbitMQ, которые не удаётся разобрать (одно сообщение соответствует одной строке данных). По умолчанию: `0`.
- `rabbitmq_max_block_size` - Количество строк, собираемых перед сбросом данных из RabbitMQ. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `rabbitmq_flush_interval_ms` - Таймаут для сброса данных из RabbitMQ. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `rabbitmq_queue_settings_list` - Позволяет задать настройки RabbitMQ при создании очереди. Доступные настройки: `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`. Параметр `durable` для очереди включается автоматически.
- `rabbitmq_address` - Адрес для подключения. Используйте либо этот параметр, либо `rabbitmq_host_port`.
- `rabbitmq_vhost` - RabbitMQ vhost. По умолчанию: `'\`.
- `rabbitmq_queue_consume` - Использовать заранее созданные (пользовательские) очереди и не выполнять никакой конфигурации RabbitMQ: объявление exchanges, очередей, связей (bindings). По умолчанию: `false`.
- `rabbitmq_username` - Имя пользователя RabbitMQ.
- `rabbitmq_password` - Пароль RabbitMQ.
- `reject_unhandled_messages` - Отклонять сообщения (отправлять в RabbitMQ отрицательное подтверждение) в случае ошибок. Этот параметр автоматически включается, если задан `x-dead-letter-exchange` в `rabbitmq_queue_settings_list`.
- `rabbitmq_commit_on_select` - Фиксировать сообщения при выполнении запроса SELECT. По умолчанию: `false`.
- `rabbitmq_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение RabbitMQ для построчных форматов. По умолчанию: `1`.
- `rabbitmq_empty_queue_backoff_start_ms` — Начальная точка backoff (в миллисекундах) для переназначения чтения, если очередь RabbitMQ пуста.
- `rabbitmq_empty_queue_backoff_end_ms` — Конечная точка backoff (в миллисекундах) для переназначения чтения, если очередь RabbitMQ пуста.
- `rabbitmq_empty_queue_backoff_step_ms` — Шаг backoff (в миллисекундах) для переназначения чтения, если очередь RabbitMQ пуста.
- `rabbitmq_handle_error_mode` — Способ обработки ошибок для движка RabbitMQ. Возможные значения: default (будет выброшено исключение, если не удаётся разобрать сообщение), stream (текст исключения и исходное сообщение будут сохранены во виртуальных столбцах `_error` и `_raw_message`), dead_letter_queue (данные, связанные с ошибкой, будут сохранены в system.dead_letter_queue).

### SSL-соединение \{#ssl-connection\}

Используйте либо `rabbitmq_secure = 1`, либо `amqps` в адресе подключения: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`.
Используемая библиотека по умолчанию не проверяет, достаточно ли безопасно установленное TLS-соединение. Независимо от того, истёк ли срок действия сертификата, является ли он самоподписанным, отсутствующим или недействительным, соединение просто разрешается. В будущем может быть реализована более строгая проверка сертификатов.

Также вместе с настройками RabbitMQ могут быть добавлены настройки формата.

Пример:

```sql
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

Конфигурацию сервера RabbitMQ следует добавить в конфигурационный файл ClickHouse.

Требуемая конфигурация:

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

Дополнительная конфигурация:

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```


## Описание \{#description\}

`SELECT` не особенно полезен для чтения сообщений (кроме отладки), потому что каждое сообщение можно прочитать только один раз. Гораздо практичнее создавать потоки в реальном времени с помощью [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок, чтобы создать потребителя RabbitMQ и рассматривать его как поток данных.
2. Создайте таблицу с требуемой структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` связывается с движком, оно начинает собирать данные в фоновом режиме. Это позволяет непрерывно получать сообщения из RabbitMQ и конвертировать их в требуемый формат с помощью `SELECT`.
Одна таблица RabbitMQ может иметь любое количество материализованных представлений.

Данные могут направляться на основе `rabbitmq_exchange_type` и указанного `rabbitmq_routing_key_list`.
В одной таблице может быть не более одного exchange. Один exchange может использоваться несколькими таблицами — это позволяет выполнять маршрутизацию в несколько таблиц одновременно.

Варианты типа exchange:

* `direct` — маршрутизация основана на точном совпадении ключей. Пример списка ключей таблицы: `key1,key2,key3,key4,key5`, ключ сообщения может быть равен любому из них.
* `fanout` — маршрутизация во все таблицы (в которых имя exchange совпадает) независимо от ключей.
* `topic` — маршрутизация основана на шаблонах с ключами, разделёнными точкой. Примеры: `*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`.
* `headers` — маршрутизация основана на совпадениях `key=value` с параметром `x-match=all` или `x-match=any`. Пример списка ключей таблицы: `x-match=all,format=logs,type=report,year=2020`.
* `consistent_hash` — данные равномерно распределяются между всеми привязанными таблицами (в которых имя exchange совпадает). Обратите внимание, что этот тип exchange должен быть включён с помощью плагина RabbitMQ: `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`.

Настройка `rabbitmq_queue_base` может использоваться в следующих случаях:

* чтобы позволить разным таблицам разделять очереди, так что для одних и тех же очередей может быть зарегистрировано несколько потребителей, что повышает производительность. Если используются настройки `rabbitmq_num_consumers` и/или `rabbitmq_num_queues`, то точное совпадение очередей достигается в случае, когда эти параметры одинаковы.
* чтобы иметь возможность восстановить чтение из определённых устойчивых (durable) очередей, когда не все сообщения были успешно потреблены. Чтобы возобновить потребление из одной конкретной очереди — укажите её имя в настройке `rabbitmq_queue_base` и не задавайте `rabbitmq_num_consumers` и `rabbitmq_num_queues` (по умолчанию 1). Чтобы возобновить потребление из всех очередей, которые были объявлены для конкретной таблицы, просто укажите те же настройки: `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`. По умолчанию имена очередей будут уникальны для таблиц.
* чтобы повторно использовать очереди, так как они объявлены как durable и не удаляются автоматически. (Могут быть удалены с помощью любых CLI‑инструментов RabbitMQ.)

Для повышения производительности полученные сообщения группируются в блоки размером [max&#95;insert&#95;block&#95;size](/operations/settings/settings#max_insert_block_size). Если блок не был сформирован в течение [stream&#95;flush&#95;interval&#95;ms](../../../operations/server-configuration-parameters/settings.md) миллисекунд, данные будут записаны в таблицу независимо от полноты блока.

Если настройки `rabbitmq_num_consumers` и/или `rabbitmq_num_queues` указаны вместе с `rabbitmq_exchange_type`, то:

* должен быть включён плагин `rabbitmq-consistent-hash-exchange`;
* должно быть указано свойство `message_id` публикуемых сообщений (уникальное для каждого сообщения/пакета).

Для INSERT‑запроса доступна метаинформация сообщения, которая добавляется для каждого опубликованного сообщения: `messageID` и флаг `republished` (true, если сообщение было опубликовано более одного раза) — они доступны через заголовки сообщения.

Не используйте одну и ту же таблицу для вставок и материализованных представлений.

Пример:

```sql
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


## Виртуальные столбцы \{#virtual-columns\}

- `_exchange_name` — имя exchange в RabbitMQ. Тип данных: `String`.
- `_channel_id` — идентификатор канала (ChannelID), на котором был объявлен consumer, получивший сообщение. Тип данных: `String`.
- `_delivery_tag` — DeliveryTag полученного сообщения. Область действия — один канал. Тип данных: `UInt64`.
- `_redelivered` — флаг `redelivered` сообщения. Тип данных: `UInt8`.
- `_message_id` — идентификатор сообщения (messageID) полученного сообщения; непустой, если был установлен при публикации сообщения. Тип данных: `String`.
- `_timestamp` — временная метка (timestamp) полученного сообщения; непустая, если была установлена при публикации сообщения. Тип данных: `UInt64`.

Дополнительные виртуальные столбцы при `rabbitmq_handle_error_mode='stream'`:

- `_raw_message` — исходное сообщение, которое не удалось успешно разобрать. Тип данных: `Nullable(String)`.
- `_error` — текст исключения, возникшего при ошибке разбора. Тип данных: `Nullable(String)`.

Примечание: виртуальные столбцы `_raw_message` и `_error` заполняются только в случае возникновения исключения во время разбора; при успешном разборе сообщения они всегда равны `NULL`.

## Ограничения \{#caveats\}

Даже если вы укажете [выражения значений по умолчанию для столбцов](/sql-reference/statements/create/table.md/#default_values) (например, `DEFAULT`, `MATERIALIZED`, `ALIAS`) в определении таблицы, они будут игнорироваться. Вместо этого столбцы будут заполняться значениями по умолчанию своих типов.

## Поддержка форматов данных \{#data-formats-support\}

Движок RabbitMQ поддерживает все [форматы](../../../interfaces/formats.md), которые поддерживаются в ClickHouse.
Количество строк в одном сообщении RabbitMQ зависит от того, является ли формат построчным или блочным:

- Для построчных форматов количество строк в одном сообщении RabbitMQ можно контролировать с помощью настройки `rabbitmq_max_rows_per_message`.
- Для блочных форматов нельзя разделить блок на более мелкие части, но количество строк в одном блоке можно контролировать глобальной настройкой [max_block_size](/operations/settings/settings#max_block_size).