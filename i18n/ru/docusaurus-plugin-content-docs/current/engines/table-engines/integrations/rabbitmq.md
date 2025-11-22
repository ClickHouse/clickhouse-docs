---
description: 'Этот движок позволяет интегрировать ClickHouse с RabbitMQ.'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'Табличный движок RabbitMQ'
doc_type: 'guide'
---



# Табличный движок RabbitMQ

Этот табличный движок позволяет интегрировать ClickHouse с [RabbitMQ](https://www.rabbitmq.com).

`RabbitMQ` позволяет:

- Публиковать потоки данных или подписываться на них.
- Обрабатывать потоки по мере их поступления.



## Создание таблицы {#creating-a-table}

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

- `rabbitmq_host_port` – хост:порт (например, `localhost:5672`).
- `rabbitmq_exchange_name` – имя точки обмена RabbitMQ.
- `rabbitmq_format` – формат сообщения. Использует ту же нотацию, что и SQL-функция `FORMAT`, например, `JSONEachRow`. Подробнее см. раздел [Форматы](../../../interfaces/formats.md).

Необязательные параметры:


- `rabbitmq_exchange_type` – Тип обменника RabbitMQ: `direct`, `fanout`, `topic`, `headers`, `consistent_hash`. По умолчанию: `fanout`.
- `rabbitmq_routing_key_list` – Список ключей маршрутизации (routing key), разделённых запятыми.
- `rabbitmq_schema` – Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
- `rabbitmq_num_consumers` – Количество потребителей на таблицу. Укажите большее число потребителей, если пропускной способности одного потребителя недостаточно. По умолчанию: `1`.
- `rabbitmq_num_queues` – Общее количество очередей. Увеличение этого числа может существенно повысить производительность. По умолчанию: `1`.
- `rabbitmq_queue_base` - Укажите подсказку (префикс) для имён очередей. Варианты использования этого параметра описаны ниже.
- `rabbitmq_deadletter_exchange` - Укажите имя [dead letter exchange](https://www.rabbitmq.com/dlx.html). Вы можете создать другую таблицу с этим именем обменника и собирать сообщения в случаях, когда они повторно публикуются в dead letter exchange. По умолчанию dead letter exchange не задан.
- `rabbitmq_persistent` - Если установлено в 1 (true), в запросе INSERT режим доставки будет установлен в 2 (помечает сообщения как persistent). По умолчанию: `0`.
- `rabbitmq_skip_broken_messages` – Допуск анализатора сообщений RabbitMQ к несовместимым со схемой сообщениям на блок. Если `rabbitmq_skip_broken_messages = N`, то движок пропускает *N* сообщений RabbitMQ, которые не могут быть разобраны (одно сообщение соответствует одной строке данных). По умолчанию: `0`.
- `rabbitmq_max_block_size` - Количество строк, собираемых перед сбросом данных из RabbitMQ. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `rabbitmq_flush_interval_ms` - Таймаут для сброса данных из RabbitMQ. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `rabbitmq_queue_settings_list` - Позволяет задать настройки RabbitMQ при создании очереди. Доступные настройки: `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`. Настройка `durable` для очереди включается автоматически.
- `rabbitmq_address` - Адрес для подключения. Используйте либо этот параметр, либо `rabbitmq_host_port`.
- `rabbitmq_vhost` - Виртуальный хост (vhost) RabbitMQ. По умолчанию: `'\'`.
- `rabbitmq_queue_consume` - Использовать пользовательские очереди и не выполнять никакую настройку RabbitMQ: объявление обменников, очередей и привязок. По умолчанию: `false`.
- `rabbitmq_username` - Имя пользователя RabbitMQ.
- `rabbitmq_password` - Пароль RabbitMQ.
- `reject_unhandled_messages` - Отклонять сообщения (отправлять в RabbitMQ отрицательное подтверждение) в случае ошибок. Этот параметр автоматически включается, если `x-dead-letter-exchange` задан в `rabbitmq_queue_settings_list`.
- `rabbitmq_commit_on_select` - Подтверждать сообщения при выполнении запроса SELECT. По умолчанию: `false`.
- `rabbitmq_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение RabbitMQ для построчных форматов. По умолчанию: `1`.
- `rabbitmq_empty_queue_backoff_start` — Начальная точка backoff-задержки для переназначения чтения, если очередь RabbitMQ пуста.
- `rabbitmq_empty_queue_backoff_end` — Конечная точка backoff-задержки для переназначения чтения, если очередь RabbitMQ пуста.
- `rabbitmq_handle_error_mode` — Как обрабатывать ошибки для движка RabbitMQ. Возможные значения: default (будет сгенерировано исключение, если не удалось распарсить сообщение), stream (сообщение об исключении и сырое сообщение будут сохранены в виртуальных столбцах `_error` и `_raw_message`), dead_letter_queue (данные, связанные с ошибкой, будут сохранены в system.dead_letter_queue).

  * [ ] SSL connection:

Используйте либо `rabbitmq_secure = 1`, либо `amqps` в адресе подключения: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`.
Поведение используемой библиотеки по умолчанию заключается в том, что она не проверяет, является ли созданное TLS‑подключение достаточно безопасным. Независимо от того, просрочен ли сертификат, самоподписан, отсутствует или недействителен — подключение просто разрешается. Более строгая проверка сертификатов может быть реализована в будущем.

Также вместе с параметрами, связанными с RabbitMQ, могут быть добавлены настройки формата.

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

Конфигурацию сервера RabbitMQ необходимо добавить в конфигурационный файл ClickHouse.

Требуемая конфигурация:

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

Дополнительная настройка:

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```


## Description {#description}

`SELECT` не особенно полезен для чтения сообщений (за исключением отладки), поскольку каждое сообщение может быть прочитано только один раз. Более практично создавать потоки в реальном времени с использованием [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания потребителя RabbitMQ и рассматривайте его как поток данных.
2.  Создайте таблицу с нужной структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, он начинает собирать данные в фоновом режиме. Это позволяет непрерывно получать сообщения из RabbitMQ и преобразовывать их в требуемый формат с помощью `SELECT`.
Одна таблица RabbitMQ может иметь любое количество материализованных представлений.

Данные могут направляться на основе `rabbitmq_exchange_type` и указанного `rabbitmq_routing_key_list`.
На одну таблицу может приходиться не более одного обменника. Один обменник может использоваться несколькими таблицами — это позволяет маршрутизировать данные в несколько таблиц одновременно.

Варианты типов обменников:

- `direct` — маршрутизация основана на точном совпадении ключей. Пример списка ключей таблицы: `key1,key2,key3,key4,key5`, ключ сообщения может совпадать с любым из них.
- `fanout` — маршрутизация во все таблицы (где имя обменника совпадает) независимо от ключей.
- `topic` — маршрутизация основана на шаблонах с ключами, разделенными точками. Примеры: `*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`.
- `headers` — маршрутизация основана на совпадениях `key=value` с настройкой `x-match=all` или `x-match=any`. Пример списка ключей таблицы: `x-match=all,format=logs,type=report,year=2020`.
- `consistent_hash` — данные равномерно распределяются между всеми связанными таблицами (где имя обменника совпадает). Обратите внимание, что этот тип обменника должен быть включен с помощью плагина RabbitMQ: `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`.

Настройка `rabbitmq_queue_base` может использоваться в следующих случаях:

- чтобы позволить разным таблицам использовать общие очереди, чтобы несколько потребителей могли быть зарегистрированы для одних и тех же очередей, что обеспечивает более высокую производительность. При использовании настроек `rabbitmq_num_consumers` и/или `rabbitmq_num_queues` точное совпадение очередей достигается в случае, если эти параметры одинаковы.
- чтобы иметь возможность восстановить чтение из определенных долговременных очередей, когда не все сообщения были успешно обработаны. Чтобы возобновить потребление из одной конкретной очереди — укажите её имя в настройке `rabbitmq_queue_base` и не указывайте `rabbitmq_num_consumers` и `rabbitmq_num_queues` (по умолчанию 1). Чтобы возобновить потребление из всех очередей, которые были объявлены для конкретной таблицы — просто укажите те же настройки: `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`. По умолчанию имена очередей будут уникальными для таблиц.
- чтобы повторно использовать очереди, поскольку они объявлены долговременными и не удаляются автоматически. (Могут быть удалены с помощью любых инструментов командной строки RabbitMQ.)

Для повышения производительности полученные сообщения группируются в блоки размером [max_insert_block_size](/operations/settings/settings#max_insert_block_size). Если блок не был сформирован в течение [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) миллисекунд, данные будут записаны в таблицу независимо от полноты блока.

Если настройки `rabbitmq_num_consumers` и/или `rabbitmq_num_queues` указаны вместе с `rabbitmq_exchange_type`, то:

- плагин `rabbitmq-consistent-hash-exchange` должен быть включен.
- свойство `message_id` публикуемых сообщений должно быть указано (уникальное для каждого сообщения/пакета).

Для запроса вставки существуют метаданные сообщения, которые добавляются для каждого опубликованного сообщения: `messageID` и флаг `republished` (true, если опубликовано более одного раза) — доступны через заголовки сообщения.

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


## Виртуальные столбцы {#virtual-columns}

- `_exchange_name` - имя точки обмена RabbitMQ. Тип данных: `String`.
- `_channel_id` - идентификатор канала, на котором был объявлен получивший сообщение потребитель. Тип данных: `String`.
- `_delivery_tag` - тег доставки полученного сообщения. Область действия ограничена каналом. Тип данных: `UInt64`.
- `_redelivered` - флаг `redelivered` сообщения. Тип данных: `UInt8`.
- `_message_id` - идентификатор полученного сообщения; не пустой, если был установлен при публикации сообщения. Тип данных: `String`.
- `_timestamp` - временная метка полученного сообщения; не пустая, если была установлена при публикации сообщения. Тип данных: `UInt64`.

Дополнительные виртуальные столбцы при `rabbitmq_handle_error_mode='stream'`:

- `_raw_message` - исходное сообщение, которое не удалось успешно разобрать. Тип данных: `Nullable(String)`.
- `_error` - сообщение об исключении, возникшем при неудачном разборе. Тип данных: `Nullable(String)`.

Примечание: виртуальные столбцы `_raw_message` и `_error` заполняются только при возникновении исключения во время разбора, они всегда имеют значение `NULL`, когда сообщение было успешно разобрано.


## Ограничения {#caveats}

Несмотря на то, что в определении таблицы можно указать [выражения по умолчанию для столбцов](/sql-reference/statements/create/table.md/#default_values) (такие как `DEFAULT`, `MATERIALIZED`, `ALIAS`), они будут проигнорированы. Вместо этого столбцы будут заполнены стандартными значениями по умолчанию для соответствующих типов данных.


## Поддержка форматов данных {#data-formats-support}

Движок RabbitMQ поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении RabbitMQ зависит от того, является ли формат построчным или блочным:

- Для построчных форматов количество строк в одном сообщении RabbitMQ можно контролировать с помощью настройки `rabbitmq_max_rows_per_message`.
- Для блочных форматов блок нельзя разделить на более мелкие части, но количество строк в одном блоке можно контролировать с помощью общей настройки [max_block_size](/operations/settings/settings#max_block_size).
