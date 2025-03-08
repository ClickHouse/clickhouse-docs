---
sidebar_label: HTTP Sink Connector для Confluent Platform
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/http
description: Использование HTTP Connector Sink с Kafka Connect и ClickHouse
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';



# Confluent HTTP Sink Connector
HTTP Sink Connector не зависит от типа данных и, соответственно, не требует схемы Kafka, поддерживая при этом специфические для ClickHouse типы данных, такие как Maps и Arrays. Эта дополнительная гибкость подразумевает небольшое усложнение конфигурации.

Ниже мы описываем простую установку, извлекая сообщения из одной темы Kafka и вставляя строки в таблицу ClickHouse.

:::note
  HTTP Connector распространяется по лицензии [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license).
:::

### Шаги быстрого старта {#quick-start-steps}

#### 1. Соберите ваши данные о подключении {#1-gather-your-connection-details}
<ConnectionDetails />


#### 2. Запустите Kafka Connect и HTTP Sink Connector {#2-run-kafka-connect-and-the-http-sink-connector}

У вас есть два варианта:

* **Self-managed:** Скачайте пакет Confluent и установите его локально. Следуйте инструкциям по установке коннектора, как указано [здесь](https://docs.confluent.io/kafka-connect-http/current/overview.html).
Если вы используете метод установки confluent-hub, ваши локальные конфигурационные файлы будут обновлены.

* **Confluent Cloud:** Полностью управляемая версия HTTP Sink доступна для тех, кто использует Confluent Cloud для размещения Kafka. Это требует, чтобы ваша среда ClickHouse была доступна из Confluent Cloud.

:::note
  В следующих примерах используется Confluent Cloud.
:::

#### 3. Создайте целевую таблицу в ClickHouse {#3-create-destination-table-in-clickhouse}

Прежде чем проводить тест на подключение, начнем с создания тестовой таблицы в ClickHouse Cloud, которая будет получать данные из Kafka:

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
Создайте тему Kafka и экземпляр HTTP Sink Connector:
<img src={createHttpSink} class="image" alt="Создать HTTP Sink" style={{width: '50%'}}/>

<br />

Настройте HTTP Sink Connector:
* Укажите имя темы, которую вы создали
* Аутентификация
    * `HTTP Url` - URL ClickHouse Cloud с указанием запроса `INSERT` `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **Примечание**: запрос должен быть закодирован.
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - Имя пользователя ClickHouse
    * `Auth password` - Пароль ClickHouse

:::note
  Этот HTTP Url подвержен ошибкам. Убедитесь, что экранирование выполнено точно, чтобы избежать проблем.
:::

<img src={httpAuth} class="image" alt="Опции аутентификации для Confluent HTTP Sink" style={{width: '70%'}}/>
<br/>

* Конфигурация
    * `Input Kafka record value format` зависит от ваших исходных данных, но в большинстве случаев это JSON или Avro. Мы предполагаем `JSON` в следующих настройках.
    * В разделе `advanced configurations`:
        * `HTTP Request Method` - Установите на POST
        * `Request Body Format` - json
        * `Batch batch size` - В соответствии с рекомендациями ClickHouse, установите это значение на **по меньшей мере 1000**.
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500, но адаптируйте по мере необходимости, например, это может измениться, если у вас есть HTTP-прокси перед ClickHouse.
        * `Maximum Reties` - значение по умолчанию (10) подходит, но вы можете скорректировать для более надежного повторного запроса.

<img src={httpAdvanced} class="image" alt="Расширенные опции для Confluent HTTP Sink" style={{width: '50%'}}/>

#### 5. Тестирование подключения {#5-testing-the-connectivity}
Создайте сообщение в теме, настроенной вашим HTTP Sink
<img src={createMessageInTopic} class="image" alt="Создать сообщение в теме" style={{width: '50%'}}/>

<br/>

и убедитесь, что созданное сообщение было записано в вашу инстанцию ClickHouse.

### Устранение неполадок {#troubleshooting}
#### HTTP Sink не выполняет пакетную обработку сообщений {#http-sink-doesnt-batch-messages}

Из [документации Sink](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):
> HTTP Sink connector не объединяет запросы для сообщений, содержащих различные значения заголовков Kafka.

1. Убедитесь, что ваши записи Kafka имеют одинаковый ключ.
2. Когда вы добавляете параметры к HTTP API URL, каждая запись может привести к уникальному URL. По этой причине пакетная обработка отключена при использовании дополнительных URL-параметров.

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
Если HTTP Sink терпит неудачу с сообщением при вставке JSON-объекта в `String` колонку:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

Установите параметр `input_format_json_read_objects_as_strings=1` в URL в виде закодированной строки `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### Загрузите набор данных GitHub (по желанию) {#load-the-github-dataset-optional}

Обратите внимание, что этот пример сохраняет поля Array набора данных GitHub. Мы предполагаем, что у вас есть пустая тема github в примерах и используем [kcat](https://github.com/edenhill/kcat) для вставки сообщений в Kafka.

##### 1. Подготовьте конфигурацию {#1-prepare-configuration}

Следуйте [этим инструкциям](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) для настройки Connect, относящейся к вашему типу установки,обращая внимание на отличия между автономным и распределенным кластером. Если вы используете Confluent Cloud, распределенная настройка актуальна.

Наиболее важный параметр - это `http.api.url`. [HTTP-интерфейс](../../../../interfaces/http.md) для ClickHouse требует, чтобы вы кодировали запрос INSERT как параметр в URL. Это должно включать формат (в данном случае `JSONEachRow`) и целевую базу данных. Формат должен соответствовать данным Kafka, которые будут преобразованы в строку в HTTP-теле. Эти параметры должны быть URL-экранированы. Пример такого формата для набора данных GitHub (предполагая, что вы запускаете ClickHouse локально) показан ниже:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

Следующие дополнительные параметры имеют значение при использовании HTTP Sink с ClickHouse. Полный список параметров можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html):

* `request.method` - Установите на **POST**
* `retry.on.status.codes` - Установите на 400-500 для повторной попытки при любых кодах ошибок. Уточните в зависимости от ожидаемых ошибок в данных.
* `request.body.format` - В большинстве случаев это будет JSON.
* `auth.type` - Установите на BASIC, если вы используете безопасность с ClickHouse. Другие механизмы аутентификации, совместимые с ClickHouse, в настоящее время не поддерживаются.
* `ssl.enabled` - установите на true, если используете SSL.
* `connection.user` - имя пользователя для ClickHouse.
* `connection.password` - пароль для ClickHouse.
* `batch.max.size` - Количество строк для отправки в одном пакете. Убедитесь, что это установлено на достаточное большое число. В соответствии с рекомендациями ClickHouse [рекомендации](/sql-reference/statements/insert-into#performance-considerations) значение 1000 следует считать минимальным.
* `tasks.max` - HTTP Sink connector поддерживает выполнение одной или нескольких задач. Это может использоваться для увеличения производительности. Вместе с размером пакета это представляет собой ваш основной способ улучшения производительности.
* `key.converter` - установите в зависимости от типов ваших ключей.
* `value.converter` - установите в зависимости от типа данных в вашей теме. Эти данные не требуют схемы. Формат здесь должен соответствовать FORMAT, указанному в параметре `http.api.url`. Проще всего использовать JSON и конвертер org.apache.kafka.connect.json.JsonConverter. Также возможно обращаться с значением как со строкой через конвертер org.apache.kafka.connect.storage.StringConverter - хотя это потребует от пользователя извлечения значения в выражении вставки с использованием функций. Формат [Avro](../../../../interfaces/formats.md#data-format-avro) также поддерживается в ClickHouse при использовании конвертера io.confluent.connect.avro.AvroConverter.

Полный список настроек, включая то, как настроить прокси, повторные попытки и расширенный SSL, можно найти [здесь](https://docs.confluent.io/kafka-connect-http/current/connector_config.html).

Примеры конфигурационных файлов для данных выборки GitHub можно найти [здесь](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink), при условии, что Connect работает в автономном режиме, а Kafka размещена в Confluent Cloud.

##### 2. Создайте таблицу ClickHouse {#2-create-the-clickhouse-table}

Убедитесь, что таблица создана. Пример для минимального набора данных GitHub с использованием стандартного MergeTree показан ниже.

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

Вставьте сообщения в Kafka. Ниже мы используем [kcat](https://github.com/edenhill/kcat) для вставки 10 тысяч сообщений.

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
