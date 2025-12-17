---
sidebar_label: 'Vector с Kafka'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Использование Vector с Kafka и ClickHouse'
title: 'Использование Vector с Kafka и ClickHouse'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'сбор логов', 'обсервабилити', 'интеграция']
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


## Использование Vector с Kafka и ClickHouse {#using-vector-with-kafka-and-clickhouse}

Vector — это независимый от поставщиков конвейер обработки данных, который может читать из Kafka и отправлять события в ClickHouse.

Руководство по [началу работы](../etl-tools/vector-to-clickhouse.md) с Vector и ClickHouse сфокусировано на сценарии с логами и чтении событий из файла. Мы используем [пример набора данных GitHub](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) с событиями, размещёнными в топике Kafka.

Vector использует [sources](https://vector.dev/docs/about/concepts/#sources) для получения данных по push- или pull-модели. [Sinks](https://vector.dev/docs/about/concepts/#sinks), в свою очередь, являются приёмниками событий. Поэтому мы используем источник Kafka и приёмник ClickHouse. Обратите внимание, что хотя Kafka поддерживается как Sink, источник ClickHouse недоступен. В результате Vector не подходит пользователям, желающим передавать данные из ClickHouse в Kafka.

Vector также поддерживает [transformation](https://vector.dev/docs/reference/configuration/transforms/) данных. Это выходит за рамки данного руководства. При необходимости применения трансформаций к своему набору данных пользователю следует обратиться к документации Vector.

Обратите внимание, что текущая реализация приёмника ClickHouse использует HTTP-интерфейс. Приёмник ClickHouse в данный момент не поддерживает использование JSON-схемы. Данные должны публиковаться в Kafka либо в виде обычного JSON-формата, либо в виде строк (Strings).

### Лицензия {#license}

Vector распространяется по [лицензии MPL-2.0](https://github.com/vectordotdev/vector/blob/master/LICENSE)

### Сбор параметров подключения {#gather-your-connection-details}

<ConnectionDetails />

### Шаги {#steps}

1. Создайте топик Kafka `github` и загрузите в него [набор данных GitHub](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson).

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

Этот набор данных состоит из 200 000 строк, относящихся к репозиторию `ClickHouse/ClickHouse`.

2. Убедитесь, что целевая таблица создана. Ниже мы используем базу данных по умолчанию.

```sql

CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,
                    'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at);

```

3. [Скачайте и установите Vector](https://vector.dev/docs/setup/quickstart/). Создайте конфигурационный файл `kafka.toml` и измените значения для экземпляров Kafka и ClickHouse.

```toml
[sources.github]
type = "kafka"
auto_offset_reset = "smallest"
bootstrap_servers = "<kafka_host>:<kafka_port>"
group_id = "vector"
topics = [ "github" ]
tls.enabled = true
sasl.enabled = true
sasl.mechanism = "PLAIN"
sasl.username = "<username>"
sasl.password = "<password>"
decoding.codec = "json"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["github"]
endpoint = "http://localhost:8123"
database = "default"
table = "github"
skip_unknown_fields = true
auth.strategy = "basic"
auth.user = "username"
auth.password = "password"
buffer.max_events = 10000
batch.timeout_secs = 1
```

Несколько важных замечаний относительно этой конфигурации и поведения Vector:


* Этот пример был протестирован с Confluent Cloud. Поэтому параметры безопасности `sasl.*` и `ssl.enabled` могут быть неприменимы в сценариях с самостоятельным управлением кластером.
* Префикс протокола не требуется для параметра конфигурации `bootstrap_servers`, например: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`.
* Параметр источника `decoding.codec = "json"` гарантирует, что сообщение передается в ClickHouse sink как один JSON-объект. При обработке сообщений как строк (String) и использовании значения по умолчанию `bytes` содержимое сообщения будет добавлено в поле `message`. В большинстве случаев это потребует обработки в ClickHouse, как описано в руководстве [Vector getting started](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs).
* Vector [добавляет ряд полей](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data) к сообщениям. В нашем примере мы игнорируем эти поля в ClickHouse sink с помощью параметра конфигурации `skip_unknown_fields = true`. Это приводит к игнорированию полей, которые не являются частью схемы целевой таблицы. При необходимости скорректируйте схему, чтобы такие мета-поля, как `offset`, также добавлялись.
* Обратите внимание, как sink ссылается на источник событий через параметр `inputs`.
* Обратите внимание на поведение ClickHouse sink, описанное [здесь](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches). Для оптимальной пропускной способности вы можете настроить параметры `buffer.max_events`, `batch.timeout_secs` и `batch.max_bytes`. Согласно [рекомендациям](/sql-reference/statements/insert-into#performance-considerations) ClickHouse, значение 1000 следует рассматривать как минимальное количество событий в одном пакете. Для сценариев с равномерно высокой пропускной способностью вы можете увеличить параметр `buffer.max_events`. При более переменной нагрузке могут потребоваться изменения параметра `batch.timeout_secs`.
* Параметр `auto_offset_reset = "smallest"` заставляет источник Kafka начинать чтение с начала топика, гарантируя, что мы потребляем сообщения, опубликованные на шаге (1). Вам может потребоваться иное поведение. См. подробности [здесь](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset).

4. Запустите Vector

```bash
vector --config ./kafka.toml
```

По умолчанию перед началом вставки данных в ClickHouse требуется [проверка работоспособности](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck). Это гарантирует, что можно установить соединение и прочитать схему. Добавьте перед командой `VECTOR_LOG=debug`, чтобы получить более подробные логи, которые могут быть полезны при возникновении проблем.

5. Подтвердите вставку данных.

```sql
SELECT count() AS count FROM github;
```

| Количество |
| :--------- |
| 200000     |
