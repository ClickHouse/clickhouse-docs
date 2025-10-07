---
slug: '/engines/table-engines/integrations/nats'
sidebar_label: NATS
sidebar_position: 140
description: 'Этот движок позволяет интегрировать ClickHouse с NATS для публикации'
title: 'Движок NATS'
doc_type: guide
---
# NATS движок {#redisstreams-engine}

Этот движок позволяет интегрировать ClickHouse с [NATS](https://nats.io/).

`NATS` позволяет вам:

- Публиковать или подписываться на темы сообщений.
- Обрабатывать новые сообщения по мере их поступления.

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

- `nats_url` – host:port (например, `localhost:5672`).
- `nats_subjects` – Список тем для таблицы NATS для подписки/публикации. Поддерживает шаблонные темы, такие как `foo.*.bar` или `baz.>`.
- `nats_format` – Формат сообщения. Использует ту же нотацию, что и функция SQL `FORMAT`, такую как `JSONEachRow`. Для получения дополнительной информации смотрите раздел [Форматы](../../../interfaces/formats.md).

Необязательные параметры:

- `nats_schema` – Параметр, который должен использоваться, если формат требует определения схемы. Например, [Cap'n Proto](https://capnproto.org/) требует путь к файлу схемы и название корневого объекта `schema.capnp:Message`.
- `nats_stream` – Имя потока для NATS JetStream.
- `nats_consumer` – Имя долговременного потребителя для NATS JetStream.
- `nats_num_consumers` – Количество потребителей на таблицу. По умолчанию: `1`. Укажите большее количество потребителей, если пропускная способность одного потребителя недостаточна только для ядра NATS.
- `nats_queue_group` – Имя группы очереди для подписчиков NATS. По умолчанию это имя таблицы.
- `nats_max_reconnect` – Устарело и не имеет эффекта, повторное подключение выполняется постоянно с тайм-аутом nats_reconnect_wait.
- `nats_reconnect_wait` – Количество времени в миллисекундах для ожидания между каждой попыткой переподключения. По умолчанию: `5000`.
- `nats_server_list` - Список серверов для подключения. Может быть указан для подключения к кластеру NATS.
- `nats_skip_broken_messages` - Устойчивость парсера NATS к схемам, несовместимым с сообщениями на блоке. По умолчанию: `0`. Если `nats_skip_broken_messages = N`, то движок пропускает *N* сообщения NATS, которые не могут быть разобраны (одно сообщение соответствует одной строке данных).
- `nats_max_block_size` - Количество строк, собранных за опросы (polls) для сброса данных из NATS. По умолчанию: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `nats_flush_interval_ms` - Тайм-аут для сброса данных, прочитанных из NATS. По умолчанию: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms).
- `nats_username` - Имя пользователя NATS.
- `nats_password` - Пароль NATS.
- `nats_token` - Токен аутентификации NATS.
- `nats_credential_file` - Путь к файлу учетных данных NATS.
- `nats_startup_connect_tries` - Количество попыток подключения при старте. По умолчанию: `5`.
- `nats_max_rows_per_message` — Максимальное количество строк, записываемых в одно сообщение NATS для форматов на основе строк. (по умолчанию: `1`).
- `nats_handle_error_mode` — Как обрабатывать ошибки для движка NATS. Возможные значения: default (исключение будет выброшено, если не удастся разобрать сообщение), stream (сообщение об исключении и сырое сообщение будут сохранены в виртуальных колонках `_error` и `_raw_message`).

SSL соединение:

Для безопасного подключения используйте `nats_secure = 1`.
Поведение используемой библиотеки по умолчанию не проверяет, является ли созданное TLS соединение достаточно безопасным. Независимо от того, истек сертификат, самоподписанный, отсутствующий или недействительный: соединение просто разрешается. Более строгая проверка сертификатов может быть реализована в будущем.

Запись в таблицу NATS:

Если таблица считывает только из одной темы, любое вставляемое сообщение будет публиковаться в ту же тему.
Однако если таблица считывает из нескольких тем, нам нужно указать, в какую тему мы хотим публиковать.
Вот почему при вставке в таблицу с несколькими темами необходимо установить `stream_like_engine_insert_queue`.
Вы можете выбрать одну из тем, из которых таблица считывает, и опубликовать ваши данные там. Например:

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

Также параметры формата могут быть добавлены вместе с настройками, связанными с nats.

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

Конфигурацию сервера NATS можно добавить с помощью файла конфигурации ClickHouse.
Более конкретно, вы можете добавить пароль Redis для движка NATS:

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## Описание {#description}

`SELECT` не особенно полезен для чтения сообщений (за исключением отладки), поскольку каждое сообщение может быть прочитано только один раз. Практичнее создавать потоки в реальном времени, используя [материализованные представления](../../../sql-reference/statements/create/view.md). Для этого:

1.  Используйте движок для создания потребителя NATS и рассматривайте его как поток данных.
2.  Создайте таблицу с желаемой структурой.
3.  Создайте материализованное представление, которое преобразует данные из движка и помещает их в ранее созданную таблицу.

Когда `MATERIALIZED VIEW` соединяется с движком, он начинает собирать данные в фоновом режиме. Это позволяет вам постоянно получать сообщения из NATS и преобразовывать их в необходимый формат с помощью `SELECT`.
Одна таблица NATS может иметь столько материализованных представлений, сколько вам нужно, они не считывают данные из таблицы напрямую, а получают новые записи (пакетами), таким образом вы можете писать в несколько таблиц с разным уровнем детализации (с группировкой - агрегацией и без).

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

Чтобы прекратить получать данные потоков или изменить логику преобразования, отсоедините материализованное представление:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

Если вы хотите изменить целевую таблицу с помощью `ALTER`, мы рекомендуем отключить материализованное представление, чтобы избежать несоответствий между целевой таблицей и данными из представления.

## Виртуальные колонки {#virtual-columns}

- `_subject` - Тема сообщения NATS. Тип данных: `String`.

Дополнительные виртуальные колонки при `nats_handle_error_mode='stream'`:

- `_raw_message` - Сырой сообщение, которое не удалось успешно разобрать. Тип данных: `Nullable(String)`.
- `_error` - Сообщение об исключении, произошедшем во время неудачного разбора. Тип данных: `Nullable(String)`.

Примечание: виртуальные колонки `_raw_message` и `_error` заполняются только в случае исключения во время разбора, они всегда равны `NULL`, когда сообщение было успешно разобрано.

## Поддержка форматов данных {#data-formats-support}

Движок NATS поддерживает все [форматы](../../../interfaces/formats.md), поддерживаемые в ClickHouse.
Количество строк в одном сообщении NATS зависит от того, является ли формат основанным на строках или на блоках:

- Для форматов на основе строк количество строк в одном сообщении NATS может контролироваться с помощью задания `nats_max_rows_per_message`.
- Для форматов на основе блоков мы не можем разделить блок на более мелкие части, но количество строк в одном блоке может контролироваться общим параметром [max_block_size](/operations/settings/settings#max_block_size).