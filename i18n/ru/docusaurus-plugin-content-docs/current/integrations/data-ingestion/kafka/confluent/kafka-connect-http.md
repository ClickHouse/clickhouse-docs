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

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Коннектор Confluent HTTP Sink \{#confluent-http-sink-connector\}

Коннектор HTTP Sink не зависит от формата данных, поэтому не требует схемы Kafka и при этом поддерживает специфичные для ClickHouse типы данных, такие как `Map` и `Array`. Эта дополнительная гибкость приводит к небольшому усложнению конфигурации.

Ниже описана простая установка, считывающая сообщения из одного топика Kafka и вставляющая строки в таблицу ClickHouse.

:::note
  HTTP Connector распространяется по [лицензии Confluent Enterprise](https://docs.confluent.io/kafka-connect-http/current/overview.html#license).
:::

### Быстрый старт \\{#quick-start-steps\\}

#### 1. Соберите параметры подключения \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

#### 2. Запустите Kafka Connect и коннектор HTTP Sink \\{#2-run-kafka-connect-and-the-http-sink-connector\\}

У вас есть два варианта:

* **Самостоятельное развертывание:** Загрузите пакет Confluent и установите его локально. Следуйте инструкциям по установке коннектора, приведённым [здесь](https://docs.confluent.io/kafka-connect-http/current/overview.html).
  Если вы используете метод установки через confluent-hub, ваши локальные файлы конфигурации будут обновлены.

* **Confluent Cloud:** Полностью управляемая версия HTTP Sink доступна для тех, кто использует Confluent Cloud для хостинга Kafka. Для этого требуется, чтобы ваша среда ClickHouse была доступна из Confluent Cloud.

:::note
В следующих примерах используется Confluent Cloud.
:::

#### 3. Создайте целевую таблицу в ClickHouse \{#3-create-destination-table-in-clickhouse\}

Перед проверкой соединения создадим тестовую таблицу в ClickHouse Cloud, которая будет получать данные из Kafka:

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


#### 4. Настройте HTTP Sink \\{#4-configure-http-sink\\}

Создайте топик Kafka и экземпляр HTTP Sink Connector:

<Image img={createHttpSink} size="sm" alt="Интерфейс Confluent Cloud, показывающий, как создать коннектор HTTP Sink" border />

<br />

Настройте HTTP Sink Connector:

* Укажите имя созданного топика
* Authentication
  * `HTTP Url` — URL-адрес ClickHouse Cloud с указанным запросом `INSERT` `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **Примечание**: запрос должен быть закодирован.
  * `Endpoint Authentication type` — BASIC
  * `Auth username` — имя пользователя ClickHouse
  * `Auth password` — пароль ClickHouse

:::note
С этим HTTP Url легко допустить ошибку. Убедитесь, что экранирование выполнено точно, чтобы избежать проблем.
:::

<Image img={httpAuth} size="lg" alt="Интерфейс Confluent Cloud, показывающий настройки аутентификации для коннектора HTTP Sink" border />

<br />

* Configuration
  * `Input Kafka record value format` зависит от ваших исходных данных, но в большинстве случаев это JSON или Avro. В дальнейших настройках мы предполагаем формат `JSON`.
  * В разделе `advanced configurations`:
    * `HTTP Request Method` — установите POST
    * `Request Body Format` — json
    * `Batch batch size` — согласно рекомендациям ClickHouse установите значение **не менее 1000**.
    * `Batch json as array` — true
    * `Retry on HTTP codes` — 400-500, но адаптируйте при необходимости, например, это может измениться, если у вас есть HTTP-прокси перед ClickHouse.
    * `Maximum Reties` — значение по умолчанию (10) подходит, но вы можете скорректировать его для более надежных повторных попыток.

<Image img={httpAdvanced} size="sm" alt="Интерфейс Confluent Cloud, показывающий расширенные параметры конфигурации для коннектора HTTP Sink" border />

#### 5. Тестирование подключения \\{#5-testing-the-connectivity\\}

Создайте сообщение в топике, настроенном для вашего HTTP Sink

<Image img={createMessageInTopic} size="md" alt="Интерфейс Confluent Cloud, показывающий, как создать тестовое сообщение в топике Kafka" border />

<br />

и убедитесь, что созданное сообщение было записано в ваш экземпляр ClickHouse.

### Устранение неполадок \\{#troubleshooting\\}

#### HTTP Sink не объединяет сообщения в батчи \\{#http-sink-doesnt-batch-messages\\}

Из [документации по Sink](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):

> Коннектор HTTP Sink не объединяет запросы для сообщений, содержащих значения заголовков Kafka, которые различаются.

1. Убедитесь, что ваши записи Kafka имеют одинаковый ключ.
2. Когда вы добавляете параметры к URL-адресу HTTP API, каждая запись может приводить к уникальному URL-адресу. По этой причине батчирование отключается при использовании дополнительных параметров URL.

#### 400 bad request \\{#400-bad-request\\}

##### CANNOT&#95;PARSE&#95;QUOTED&#95;STRING \{#cannot_parse_quoted_string\}

Если HTTP Sink завершает работу с ошибкой со следующим сообщением при вставке JSON-объекта в столбец типа `String`:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

Установите настройку `input_format_json_read_objects_as_strings=1` в URL, указав её как URL‑кодированную строку `SETTINGS%20input_format_json_read_objects_as_strings%3D1`


### Загрузка набора данных GitHub (необязательно) \\{#load-the-github-dataset-optional\\}

Обратите внимание, что в этом примере сохраняются поля типа Array из набора данных GitHub. Мы предполагаем, что в вашем примере есть пустой топик github и что вы используете [kcat](https://github.com/edenhill/kcat) для отправки сообщений в Kafka.

##### 1. Подготовьте конфигурацию \{#1-prepare-configuration\}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) по настройке Connect в соответствии с типом вашей установки, обращая внимание на различия между автономным и распределённым кластерами. Если вы используете Confluent Cloud, вам подходит распределённая схема.

Наиболее важным параметром является `http.api.url`. [HTTP‑интерфейс](/interfaces/http) для ClickHouse требует, чтобы вы закодировали выражение INSERT как параметр в URL. Оно должно включать формат (в данном случае `JSONEachRow`) и целевую базу данных. Формат должен соответствовать формату данных в Kafka, которые будут преобразованы в строку в теле HTTP‑запроса. Эти параметры должны быть URL‑кодированы. Пример такого формата для набора данных Github (предполагая, что вы запускаете ClickHouse локально) показан ниже:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

Следующие дополнительные параметры относятся к использованию HTTP Sink с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html):

* `request.method` - Установите в **POST**.
* `retry.on.status.codes` - Установите в 400–500 для повторных попыток при любых кодах ошибок. Уточните значение на основе ожидаемых ошибок в данных.
* `request.body.format` - В большинстве случаев это будет JSON.
* `auth.type` - Установите в BASIC, если вы используете базовую аутентификацию в ClickHouse. Другие механизмы аутентификации, совместимые с ClickHouse, в настоящее время не поддерживаются.
* `ssl.enabled` - установите в true при использовании SSL.
* `connection.user` - имя пользователя для ClickHouse.
* `connection.password` - пароль для ClickHouse.
* `batch.max.size` - Количество строк, отправляемых в одном пакете. Убедитесь, что это значение достаточно велико. Согласно [рекомендациям](/sql-reference/statements/insert-into#performance-considerations) ClickHouse, значение 1000 следует считать минимальным.
* `tasks.max` - Коннектор HTTP Sink поддерживает выполнение одной или нескольких задач. Это можно использовать для повышения производительности. Совместно с размером пакета это ваши основные средства улучшения производительности.
* `key.converter` - задайте в соответствии с типами ваших ключей.
* `value.converter` - задайте исходя из типа данных в вашем топике. Для этих данных не требуется схема. Формат здесь должен быть согласован с FORMAT, указанным в параметре `http.api.url`. Проще всего использовать JSON и конвертер org.apache.kafka.connect.json.JsonConverter. Также возможно рассматривать значение как строку с помощью конвертера org.apache.kafka.connect.storage.StringConverter, однако это потребует от пользователя извлечения значения в операторе INSERT с использованием функций. [Формат Avro](/interfaces/formats/Avro) также поддерживается в ClickHouse при использовании конвертера io.confluent.connect.avro.AvroConverter.

Полный список настроек, включая конфигурацию прокси, повторные попытки и расширенный SSL, можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html).

Примеры файлов конфигурации для примера данных GitHub можно найти [здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink), при условии, что Connect запущен в автономном режиме, а Kafka развернута в Confluent Cloud.


##### 2. Создайте таблицу ClickHouse \{#2-create-the-clickhouse-table\}

Убедитесь, что таблица создана. Ниже приведён пример минимального набора данных GitHub, использующего стандартный движок MergeTree.

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


##### 3. Добавьте данные в Kafka \{#3-add-data-to-kafka\}

Отправьте сообщения в Kafka. Ниже мы используем [kcat](https://github.com/edenhill/kcat) для отправки 10 000 сообщений.

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

Простой запрос к целевой таблице «Github» должен подтвердить, что данные были вставлены.

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
