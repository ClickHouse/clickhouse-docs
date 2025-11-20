---
sidebar_label: 'Коннектор HTTP Sink для Confluent Platform'
sidebar_position: 4
slug: /integrations/kafka/cloud/confluent/http
description: 'Использование коннектора HTTP Sink с Kafka Connect и ClickHouse'
title: 'Коннектор Confluent HTTP Sink'
doc_type: 'guide'
keywords: ['Confluent HTTP Sink Connector', 'HTTP Sink ClickHouse', 'Kafka HTTP connector
', 'ClickHouse HTTP integration', 'Confluent Cloud HTTP Sink']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# HTTP-коннектор Confluent для приёма данных

HTTP Sink Connector не зависит от типов данных и поэтому не требует схемы Kafka, а также поддерживает специфичные для ClickHouse типы данных, такие как Map и Array. Эта дополнительная гибкость достигается за счёт небольшого усложнения конфигурации.

Ниже описана простая установка, извлекающая сообщения из одного топика Kafka и вставляющая строки в таблицу ClickHouse.

:::note
HTTP Connector распространяется под лицензией [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license).
:::

### Шаги быстрого старта {#quick-start-steps}

#### 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

#### 2. Запустите Kafka Connect и HTTP-коннектор для приёма данных {#2-run-kafka-connect-and-the-http-sink-connector}

У вас есть два варианта:

- **Самостоятельное управление:** Загрузите пакет Confluent и установите его локально. Следуйте инструкциям по установке коннектора, описанным [здесь](https://docs.confluent.io/kafka-connect-http/current/overview.html).
  Если вы используете метод установки confluent-hub, ваши локальные конфигурационные файлы будут обновлены.

- **Confluent Cloud:** Полностью управляемая версия HTTP Sink доступна для тех, кто использует Confluent Cloud для хостинга Kafka. Для этого требуется, чтобы ваше окружение ClickHouse было доступно из Confluent Cloud.

:::note
В следующих примерах используется Confluent Cloud.
:::

#### 3. Создайте целевую таблицу в ClickHouse {#3-create-destination-table-in-clickhouse}

Перед проверкой подключения начнём с создания тестовой таблицы в ClickHouse Cloud — эта таблица будет получать данные из Kafka:

```sql
CREATE TABLE default.my_table
(
    `side` String,
    `quantity` Int32,
    `symbol` String,
    `price` Int32,
    `account` String,
    `userid` String
)
ORDER BY tuple()
```

#### 4. Настройте HTTP Sink {#4-configure-http-sink}

Создайте топик Kafka и экземпляр HTTP Sink Connector:

<Image
  img={createHttpSink}
  size='sm'
  alt='Интерфейс Confluent Cloud, показывающий, как создать HTTP Sink коннектор'
  border
/>

<br />

Настройте HTTP Sink Connector:

- Укажите имя созданного вами топика
- Аутентификация
  - `HTTP Url` — URL ClickHouse Cloud с указанным запросом `INSERT`: `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **Примечание**: запрос должен быть закодирован.
  - `Endpoint Authentication type` — BASIC
  - `Auth username` — имя пользователя ClickHouse
  - `Auth password` — пароль ClickHouse

:::note
Этот HTTP Url подвержен ошибкам. Убедитесь, что экранирование выполнено точно, чтобы избежать проблем.
:::

<Image
  img={httpAuth}
  size='lg'
  alt='Интерфейс Confluent Cloud, показывающий настройки аутентификации для HTTP Sink коннектора'
  border
/>
<br />

- Конфигурация
  - `Input Kafka record value format` — зависит от ваших исходных данных, но в большинстве случаев это JSON или Avro. В следующих настройках мы предполагаем `JSON`.
  - В разделе `advanced configurations`:
    - `HTTP Request Method` — установите POST
    - `Request Body Format` — json
    - `Batch batch size` — согласно рекомендациям ClickHouse, установите это значение **не менее 1000**.
    - `Batch json as array` — true
    - `Retry on HTTP codes` — 400-500, но адаптируйте по необходимости, например, это может измениться, если перед ClickHouse установлен HTTP-прокси.
    - `Maximum Reties` — значение по умолчанию (10) подходит, но можете настроить для более надёжных повторных попыток.

<Image
  img={httpAdvanced}
  size='sm'
  alt='Интерфейс Confluent Cloud, показывающий расширенные параметры конфигурации для HTTP Sink коннектора'
  border
/>

#### 5. Проверка подключения {#5-testing-the-connectivity}

Создайте сообщение в топике, настроенном для вашего HTTP Sink

<Image
  img={createMessageInTopic}
  size='md'
  alt='Интерфейс Confluent Cloud, показывающий, как создать тестовое сообщение в топике Kafka'
  border
/>

<br />

и убедитесь, что созданное сообщение было записано в ваш экземпляр ClickHouse.

### Устранение неполадок {#troubleshooting}

#### HTTP Sink не группирует сообщения в пакеты {#http-sink-doesnt-batch-messages}

Из [документации Sink](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):

> HTTP Sink коннектор не группирует в пакеты запросы для сообщений, содержащих различные значения заголовков Kafka.


1. Убедитесь, что записи Kafka имеют одинаковый ключ.
2. При добавлении параметров в URL HTTP API каждая запись может привести к уникальному URL. По этой причине пакетная обработка отключается при использовании дополнительных параметров URL.

#### 400 bad request {#400-bad-request}

##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}

Если HTTP Sink завершается с ошибкой со следующим сообщением при вставке JSON-объекта в столбец типа `String`:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

Установите настройку `input_format_json_read_objects_as_strings=1` в URL в виде закодированной строки `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### Загрузка набора данных GitHub (опционально) {#load-the-github-dataset-optional}

Обратите внимание, что этот пример сохраняет поля типа Array из набора данных Github. Мы предполагаем, что у вас есть пустой топик github в примерах, и используем [kcat](https://github.com/edenhill/kcat) для вставки сообщений в Kafka.

##### 1. Подготовка конфигурации {#1-prepare-configuration}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect в соответствии с вашим типом установки, обращая внимание на различия между автономным и распределенным кластером. При использовании Confluent Cloud применима распределенная конфигурация.

Наиболее важным параметром является `http.api.url`. [HTTP-интерфейс](../../../../interfaces/http.md) для ClickHouse требует кодирования оператора INSERT в качестве параметра в URL. Он должен включать формат (`JSONEachRow` в данном случае) и целевую базу данных. Формат должен соответствовать данным Kafka, которые будут преобразованы в строку в теле HTTP-запроса. Эти параметры должны быть экранированы для URL. Пример этого формата для набора данных Github (при условии, что ClickHouse запущен локально) показан ниже:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

Следующие дополнительные параметры относятся к использованию HTTP Sink с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html):

- `request.method` — установите значение **POST**
- `retry.on.status.codes` — установите значение 400-500 для повторных попыток при любых кодах ошибок. Уточните на основе ожидаемых ошибок в данных.
- `request.body.format` — в большинстве случаев это будет JSON.
- `auth.type` — установите значение BASIC при использовании аутентификации с ClickHouse. Другие совместимые с ClickHouse механизмы аутентификации в настоящее время не поддерживаются.
- `ssl.enabled` — установите значение true при использовании SSL.
- `connection.user` — имя пользователя для ClickHouse.
- `connection.password` — пароль для ClickHouse.
- `batch.max.size` — количество строк для отправки в одном пакете. Убедитесь, что это значение установлено достаточно большим. Согласно [рекомендациям](/sql-reference/statements/insert-into#performance-considerations) ClickHouse, значение 1000 следует считать минимальным.
- `tasks.max` — коннектор HTTP Sink поддерживает выполнение одной или нескольких задач. Это можно использовать для повышения производительности. Наряду с размером пакета это является основным средством улучшения производительности.
- `key.converter` — установите в соответствии с типами ваших ключей.
- `value.converter` — установите на основе типа данных в вашем топике. Эти данные не требуют схемы. Формат здесь должен соответствовать FORMAT, указанному в параметре `http.api.url`. Самый простой вариант — использовать JSON и конвертер org.apache.kafka.connect.json.JsonConverter. Также возможна обработка значения как строки через конвертер org.apache.kafka.connect.storage.StringConverter, хотя это потребует от пользователя извлечения значения в операторе вставки с помощью функций. [Формат Avro](/interfaces/formats/Avro) также поддерживается в ClickHouse при использовании конвертера io.confluent.connect.avro.AvroConverter.

Полный список настроек, включая конфигурацию прокси, повторных попыток и расширенных настроек SSL, можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html).


Примеры конфигурационных файлов для демонстрационных данных GitHub можно найти [здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink), при условии, что Connect запущен в автономном режиме, а Kafka размещена в Confluent Cloud.

##### 2. Создание таблицы ClickHouse {#2-create-the-clickhouse-table}

Убедитесь, что таблица создана. Ниже приведен пример минимального набора данных GitHub с использованием стандартного движка MergeTree.

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)

```

##### 3. Добавление данных в Kafka {#3-add-data-to-kafka}

Вставьте сообщения в Kafka. Ниже используется [kcat](https://github.com/edenhill/kcat) для вставки 10 000 сообщений.

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

Простой запрос к целевой таблице "Github" должен подтвердить успешную вставку данных.

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
