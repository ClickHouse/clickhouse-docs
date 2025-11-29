---
description: 'Этот движок позволяет интегрировать ClickHouse с NATS для публикации
  или подписки на темы сообщений и обработки новых сообщений по мере их поступления.'
sidebar_label: 'NATS'
sidebar_position: 140
slug: /engines/table-engines/integrations/nats
title: 'Табличный движок NATS'
doc_type: 'guide'
---



# Табличный движок NATS {#redisstreams-engine}

Этот движок позволяет интегрировать ClickHouse с [NATS](https://nats.io/).

`NATS` позволяет:

- Публиковать сообщения в сабжекты (subjects) или подписываться на них.
- Обрабатывать новые сообщения по мере их появления.



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = NATS SETTINGS
    nats_url = 'host:port',
    nats_subjects = 'subject1,subject2,...',
    nats_format = 'data_format'[,]
    [nats_schema = '',]
    [nats_num_consumers = N,]
    [nats_queue_group = 'group_name',]
    [nats_secure = false,]
    [nats_max_reconnect = N,]
    [nats_reconnect_wait = N,]
    [nats_server_list = 'host1:port1,host2:port2,...',]
    [nats_skip_broken_messages = N,]
    [nats_max_block_size = N,]
    [nats_flush_interval_ms = N,]
    [nats_username = 'user',]
    [nats_password = 'password',]
    [nats_token = 'clickhouse',]
    [nats_credential_file = '/var/nats_credentials',]
    [nats_startup_connect_tries = '5']
    [nats_max_rows_per_message = 1,]
    [nats_handle_error_mode = 'default']
```

Обязательные параметры:

* `nats_url` – host:port (например, `localhost:5672`).
* `nats_subjects` – Список subject, к которым таблица NATS подписывается/в которые публикует. Поддерживаются шаблоны subject с подстановочными знаками, такие как `foo.*.bar` или `baz.>`.
* `nats_format` – Формат сообщений. Использует ту же нотацию, что и SQL-функция `FORMAT`, например `JSONEachRow`. Дополнительные сведения см. в разделе [Formats](../../../interfaces/formats.md).

Необязательные параметры:

* `nats_schema` – Параметр, который необходимо использовать, если формат требует определения схемы. Например, [Cap&#39;n Proto](https://capnproto.org/) требует путь к файлу схемы и имя корневого объекта `schema.capnp:Message`.
* `nats_stream` – Имя существующего потока (stream) в NATS JetStream.
* `nats_consumer` – Имя существующего постоянного (durable) pull-консьюмера в NATS JetStream.
* `nats_num_consumers` – Количество консьюмеров на таблицу. Значение по умолчанию: `1`. Укажите больше консьюмеров, если пропускной способности одного консьюмера недостаточно (только для NATS core).
* `nats_queue_group` – Имя группы очереди для подписчиков NATS. По умолчанию используется имя таблицы.
* `nats_max_reconnect` – Устаревший параметр, не оказывает никакого эффекта, переподключение выполняется постоянно с таймаутом `nats_reconnect_wait`.
* `nats_reconnect_wait` – Время в миллисекундах для ожидания между каждой попыткой переподключения. Значение по умолчанию: `5000`.
* `nats_server_list` – Список серверов для подключения. Может быть указан для подключения к кластеру NATS.
* `nats_skip_broken_messages` – Допуск парсера сообщений NATS к сообщениям, несовместимым со схемой, в пределах одного блока. Значение по умолчанию: `0`. Если `nats_skip_broken_messages = N`, то движок пропускает *N* сообщений NATS, которые не могут быть разобраны (сообщение соответствует одной строке данных).
* `nats_max_block_size` – Количество строк, собираемых в результате опроса (poll) для сброса данных из NATS. Значение по умолчанию: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size).
* `nats_flush_interval_ms` – Таймаут для сброса данных, прочитанных из NATS. Значение по умолчанию: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms).
* `nats_username` – Имя пользователя NATS.
* `nats_password` – Пароль NATS.
* `nats_token` – Токен аутентификации NATS.
* `nats_credential_file` – Путь к файлу учетных данных NATS.
* `nats_startup_connect_tries` – Количество попыток подключения при старте. Значение по умолчанию: `5`.
* `nats_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение NATS для построчных форматов (по умолчанию: `1`).
* `nats_handle_error_mode` — Режим обработки ошибок для движка NATS. Возможные значения: `default` (будет сгенерировано исключение, если не удалось разобрать сообщение), `stream` (сообщение об исключении и исходное сообщение будут сохранены во виртуальных столбцах `_error` и `_raw_message`).

SSL-подключение:


Для безопасного соединения используйте `nats_secure = 1`.
Поведение используемой библиотеки по умолчанию состоит в том, что она не проверяет, достаточно ли безопасно установленное TLS‑соединение. Просрочен ли сертификат, самоподписан, отсутствует или недействителен — соединение всё равно устанавливается. Более строгая проверка сертификатов может быть реализована в будущем.

Запись в таблицу NATS:

Если таблица читает только из одного subject, любая операция INSERT будет публиковаться в тот же subject.
Однако, если таблица читает из нескольких subject, необходимо указать, в какой subject мы хотим публиковать.
Поэтому при вставке в таблицу с несколькими subject требуется установить `stream_like_engine_insert_queue`.
Вы можете выбрать один из subject, из которых читает таблица, и публиковать туда свои данные. Например:

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1,subject2',
             nats_format = 'JSONEachRow';

  INSERT INTO queue
  SETTINGS stream_like_engine_insert_queue = 'subject2'
  VALUES (1, 1);
```

Параметры форматирования можно указать вместе с настройками, связанными с NATS.

Пример:

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';
```

Конфигурацию сервера NATS можно задать в конфигурационном файле ClickHouse.
В частности, вы можете указать пароль Redis для движка NATS:

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```


## Описание {#description}

`SELECT` не особенно полезен для чтения сообщений (кроме отладки), потому что каждое сообщение может быть прочитано только один раз. Гораздо практичнее создавать потоки в реальном времени с помощью [материализованных представлений](../../../sql-reference/statements/create/view.md). Для этого:

1. Используйте движок для создания потребителя NATS и рассматривайте его как поток данных.
2. Создайте таблицу с нужной структурой.
3. Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` подключается к движку, оно начинает собирать данные в фоновом режиме. Это позволяет постоянно получать сообщения из NATS и преобразовывать их в требуемый формат с помощью оператора `SELECT`.
Одна таблица NATS может иметь любое количество материализованных представлений; они не читают данные из таблицы напрямую, а получают только новые записи (блоками). Таким образом, вы можете записывать данные в несколько таблиц с разной степенью детализации (с группировкой — агрегацией и без нее).

Пример:

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```

Чтобы прекратить приём потоковых данных или изменить логику преобразования, отсоедините материализованное представление:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью `ALTER`, рекомендуем предварительно отключить материализованное представление, чтобы избежать расхождений между целевой таблицей и данными из представления.


## Виртуальные столбцы {#virtual-columns}

- `_subject` — тема сообщения NATS. Тип данных: `String`.

Дополнительные виртуальные столбцы при `nats_handle_error_mode='stream'`:

- `_raw_message` — исходное сообщение, которое не удалось успешно распарсить. Тип данных: `Nullable(String)`.
- `_error` — текст исключения, возникшего при неудачном парсинге. Тип данных: `Nullable(String)`.

Примечание: виртуальные столбцы `_raw_message` и `_error` заполняются только в случае возникновения исключения при парсинге; при успешном парсинге сообщения они всегда имеют значение `NULL`.



## Поддержка форматов данных {#data-formats-support}

Движок NATS поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении NATS зависит от того, является ли формат строковым или блочным:

- Для строковых форматов количеством строк в одном сообщении NATS можно управлять с помощью настройки `nats_max_rows_per_message`.
- Для блочных форматов блок нельзя разделить на более мелкие части, но количеством строк в одном блоке можно управлять с помощью общей настройки [max_block_size](/operations/settings/settings#max_block_size).



## Использование JetStream {#using-jetstream}

Прежде чем использовать движок NATS с NATS JetStream, необходимо создать поток NATS (stream) и устойчивого (durable) pull‑consumer&#39;а. Для этого можно использовать, например, утилиту `nats` из пакета [NATS CLI](https://github.com/nats-io/natscli):

<details>
  <summary>создание stream&#39;а</summary>

  ```bash
  $ nats stream add
  ? Stream Name stream_name
  ? Subjects stream_subject
  ? Storage file
  ? Replication 1
  ? Retention Policy Limits
  ? Discard Policy Old
  ? Stream Messages Limit -1
  ? Per Subject Messages Limit -1
  ? Total Stream Size -1
  ? Message TTL -1
  ? Max Message Size -1
  ? Duplicate tracking time window 2m0s
  ? Allow message Roll-ups No
  ? Allow message deletion Yes
  ? Allow purging subjects or the entire stream Yes
  Stream stream_name was created

  Information for Stream stream_name created 2025-10-03 14:12:51

                  Subjects: stream_subject
                  Replicas: 1
                   Storage: File

  Options:

                 Retention: Limits
           Acknowledgments: true
            Discard Policy: Old
          Duplicate Window: 2m0s
                Direct Get: true
         Allows Msg Delete: true
              Allows Purge: true
    Allows Per-Message TTL: false
            Allows Rollups: false

  Limits:

          Maximum Messages: unlimited
       Maximum Per Subject: unlimited
             Maximum Bytes: unlimited
               Maximum Age: unlimited
      Maximum Message Size: unlimited
         Maximum Consumers: unlimited

  State:

                  Messages: 0
                     Bytes: 0 B
            First Sequence: 0
             Last Sequence: 0
          Active Consumers: 0
  ```
</details>

<details>
  <summary>создание устойчивого pull‑consumer&#39;а</summary>

  ```bash
  $ nats consumer add
  ? Select a Stream stream_name
  ? Consumer name consumer_name
  ? Delivery target (empty for Pull Consumers) 
  ? Start policy (all, new, last, subject, 1h, msg sequence) all
  ? Acknowledgment policy explicit
  ? Replay policy instant
  ? Filter Stream by subjects (blank for all) 
  ? Maximum Allowed Deliveries -1
  ? Maximum Acknowledgments Pending 0
  ? Deliver headers only without bodies No
  ? Add a Retry Backoff Policy No
  Information for Consumer stream_name > consumer_name created 2025-10-03T14:13:51+03:00

  Configuration:

                      Name: consumer_name
                 Pull Mode: true
            Deliver Policy: All
                Ack Policy: Explicit
                  Ack Wait: 30.00s
             Replay Policy: Instant
           Max Ack Pending: 1,000
         Max Waiting Pulls: 512

  State:

    Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
      Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
          Outstanding Acks: 0 out of maximum 1,000
      Redelivered Messages: 0
      Unprocessed Messages: 0
             Waiting Pulls: 0 of maximum 512
  ```
</details>

После создания stream&#39;а и устойчивого pull‑consumer&#39;а можно создать таблицу с движком NATS. Для этого необходимо инициализировать параметры: nats&#95;stream, nats&#95;consumer&#95;name и nats&#95;subjects:

```SQL
CREATE TABLE nats_jet_stream (
    key UInt64,
    value UInt64
  ) ENGINE NATS 
    SETTINGS  nats_url = 'localhost:4222',
              nats_stream = 'stream_name',
              nats_consumer_name = 'consumer_name',
              nats_subjects = 'stream_subject',
              nats_format = 'JSONEachRow';
```
