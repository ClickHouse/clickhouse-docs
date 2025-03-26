---
sidebar_label: 'HTTP Sink Connector для Confluent Platform'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/http
description: 'Использование HTTP Connector Sink с Kafka Connect и ClickHouse'
title: 'Коннектор HTTP Sink для Confluent'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';



# Коннектор HTTP Sink для Confluent
Коннектор HTTP Sink не зависим от типа данных и, таким образом, не требует схемы Kafka, а также поддерживает специфические для ClickHouse типы данных, такие как Maps и Arrays. Эта дополнительная гибкость сопровождается незначительным увеличением сложности конфигурации.

Ниже мы описываем простую установку, извлекая сообщения из одной темы Kafka и вставляя строки в таблицу ClickHouse.

:::note
  Коннектор HTTP предоставляется по лицензии [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license).
:::

### Быстрый старт {#quick-start-steps}

#### 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />


#### 2. Запустите Kafka Connect и коннектор HTTP Sink {#2-run-kafka-connect-and-the-http-sink-connector}

У вас есть два варианта:

* **Самоуправляемый:** Скачайте пакет Confluent и установите его локально. Следуйте инструкциям по установке для установки коннектора, описанным [здесь](https://docs.confluent.io/kafka-connect-http/current/overview.html).
Если вы используете метод установки confluent-hub, ваши локальные файлы конфигурации будут обновлены.

* **Confluent Cloud:** Полностью управляемая версия HTTP Sink доступна для тех, кто использует Confluent Cloud для хостинга их Kafka. Это требует, чтобы ваша среда ClickHouse была доступна из Confluent Cloud.

:::note
  Следующие примеры используют Confluent Cloud.
:::

#### 3. Создайте целевую таблицу в ClickHouse {#3-create-destination-table-in-clickhouse}

Перед проверкой подключения давайте начнем с создания тестовой таблицы в ClickHouse Cloud, эта таблица будет принимать данные из Kafka:

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

#### 4. Настройка HTTP Sink {#4-configure-http-sink}
Создайте тему Kafka и экземпляр коннектора HTTP Sink:
<Image img={createHttpSink} size="sm" alt="Интерфейс Confluent Cloud, показывающий, как создать коннектор HTTP Sink" border/>

<br />

Настройте HTTP Sink Connector:
* Укажите название темы, которую вы создали
* Аутентификация
    * `HTTP Url` - URL ClickHouse Cloud с указанным запросом `INSERT` `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **Примечание**: запрос должен быть закодирован.
    * `Тип аутентификации для EndPoint` - BASIC
    * `Имя пользователя для аутентификации` - имя пользователя ClickHouse
    * `Пароль аутентификации` - пароль ClickHouse

:::note
  Этот HTTP Url подвержен ошибкам. Убедитесь, что экранирование точное, чтобы избежать проблем.
:::

<Image img={httpAuth} size="lg" alt="Интерфейс Confluent Cloud, показывающий настройки аутентификации для коннектора HTTP Sink" border/>
<br/>

* Конфигурация
    * `Формат значения записи Kafka` Зависит от ваших исходных данных, но в большинстве случаев это будет JSON или Avro. Мы предполагаем `JSON` в следующих настройках.
    * В разделе `расширенные настройки`:
        * `Метод HTTP-запроса` - Установите на POST
        * `Формат тела запроса` - json
        * `Размер пакетной загрузки` - В соответствии с рекомендациями ClickHouse, установите это значение **не менее 1000**.
        * `Пакет json как массив` - true
        * `Повторная попытка по HTTP-кодам` - 400-500, но адаптируйте по мере необходимости, например, это может измениться, если у вас есть HTTP-прокси перед ClickHouse.
        * `Максимальные повторные попытки` - по умолчанию (10) это значение подходит, но вы можете настроить для более надежных повторных попыток.

<Image img={httpAdvanced} size="sm" alt="Интерфейс Confluent Cloud, показывающий расширенные параметры конфигурации для коннектора HTTP Sink" border/>

#### 5. Проверка подключения {#5-testing-the-connectivity}
Создайте сообщение в теме, настроенной вашим HTTP Sink
<Image img={createMessageInTopic} size="md" alt="Интерфейс Confluent Cloud, показывающий, как создать тестовое сообщение в теме Kafka" border/>

<br/>

и проверьте, что созданное сообщение было записано в вашу инстанцию ClickHouse.

### Устранение неполадок {#troubleshooting}
#### HTTP Sink не объединяет сообщения {#http-sink-doesnt-batch-messages}

Из [документации по Sink](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):
> Коннектор HTTP Sink не объединяет запросы для сообщений, содержащих разные значения заголовков Kafka.

1. Убедитесь, что ваши записи Kafka имеют одинаковый ключ.
2. Когда вы добавляете параметры к URL HTTP API, каждая запись может привести к уникальному URL. По этой причине объединение отключено при использовании дополнительных параметров URL.

#### 400 Неверный запрос {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
Если HTTP Sink выдает сообщение об ошибке при вставке объекта JSON в столбец `String`:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

Установите параметр `input_format_json_read_objects_as_strings=1` в URL как закодированную строку `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### Загрузка набора данных GitHub (по желанию) {#load-the-github-dataset-optional}

Обратите внимание, что этот пример сохраняет поля Array набора данных Github. Мы предполагаем, что у вас есть пустая тема github в примерах и используется [kcat](https://github.com/edenhill/kcat) для вставки сообщений в Kafka.

##### 1. Подготовьте конфигурацию {#1-prepare-configuration}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect в зависимости от вашего типа установки, учитывая различия между автономным и распределенным кластером. Если вы используете Confluent Cloud, актуальна настройка для распределенной установки.

Самый важный параметр - это `http.api.url`. [HTTP интерфейс](../../../../interfaces/http.md) для ClickHouse требует, чтобы вы закодировали оператор INSERT как параметр в URL. Это должно включать формат (`JSONEachRow` в этом случае) и целевую базу данных. Формат должен соответствовать данным Kafka, которые будут преобразованы в строку в HTTP полезной нагрузке. Эти параметры должны быть URL-экранированы. Пример этого формата для набора данных Github (при условии, что вы запускаете ClickHouse локально) показан ниже:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

Следующие дополнительные параметры имеют отношение к использованию HTTP Sink с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html):


* `request.method` - Установите на **POST**
* `retry.on.status.codes` - Установите на 400-500 для повторной попытки при любых кодах ошибок. Уточняйте в зависимости от ожидаемых ошибок в данных.
* `request.body.format` - В большинстве случаев это будет JSON.
* `auth.type` - Установите на BASIC, если вы используете безопасность с ClickHouse. Другие совместимые механизмы аутентификации ClickHouse в настоящее время не поддерживаются.
* `ssl.enabled` - установите значение true, если используете SSL.
* `connection.user` - имя пользователя для ClickHouse.
* `connection.password` - пароль для ClickHouse.
* `batch.max.size` - количество строк для отправки в одном пакете. Убедитесь, что установлено подходящее значение. Согласно рекомендациям ClickHouse [рекомендации](/sql-reference/statements/insert-into#performance-considerations) следует рассматривать значение 1000 как минимум.
* `tasks.max` - Коннектор HTTP Sink поддерживает запуск одной или нескольких задач. Это может быть использовано для повышения производительности. Наряду с размером пакета это ваши основные средства для улучшения производительности.
* `key.converter` - установите в зависимости от типов ваших ключей.
* `value.converter` - установите на основе типа данных в вашей теме. Эти данные не требуют схемы. Формат здесь должен соответствовать ФОРМАТУ, указанному в параметре `http.api.url`. Проще всего здесь использовать JSON и конвертер org.apache.kafka.connect.json.JsonConverter. Также возможно рассматривать значение как строку через конвертер org.apache.kafka.connect.storage.StringConverter, хотя это потребует от пользователя извлечь значение в операторах вставки, используя функции. Формат [Avro](../../../../interfaces/formats.md#data-format-avro) также поддерживается в ClickHouse при использовании конвертера io.confluent.connect.avro.AvroConverter.

Полный список настроек, включая то, как настроить прокси, повторные попытки и расширенный SSL, можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html).

Пример конфигурационных файлов для образцов данных Github можно найти [здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink), при условии, что Connect работает в автономном режиме, а Kafka размещён в Confluent Cloud.

##### 2. Создайте таблицу ClickHouse {#2-create-the-clickhouse-table}

Убедитесь, что таблица была создана. Пример для минимального набора данных github с использованием стандартного MergeTree показан ниже.

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

##### 3. Добавьте данные в Kafka {#3-add-data-to-kafka}

Вставьте сообщения в Kafka. Ниже используется [kcat](https://github.com/edenhill/kcat) для вставки 10 тыс. сообщений.

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

Простое чтение из целевой таблицы "Github" должно подтвердить вставку данных.

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
