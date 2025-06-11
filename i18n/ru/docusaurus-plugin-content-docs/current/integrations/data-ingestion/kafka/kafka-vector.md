---
sidebar_label: 'Вектор с Kafka'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Использование Vector с Kafka и ClickHouse'
title: 'Использование Vector с Kafka и ClickHouse'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## Использование Vector с Kafka и ClickHouse {#using-vector-with-kafka-and-clickhouse}

 Vector — это независимый от поставщика конвейер данных с возможностью чтения из Kafka и отправки событий в ClickHouse.

Руководство по [началу работы](../etl-tools/vector-to-clickhouse.md) с Vector и ClickHouse сосредоточено на использовании журнала и чтении событий из файла. Мы используем [пример набора данных на Github](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) с событиями, хранящимися в теме Kafka.

Vector использует [источники](https://vector.dev/docs/about/concepts/#sources) для получения данных через модель push или pull. [Сливы](https://vector.dev/docs/about/concepts/#sinks) в то же время предоставляют назначение для событий. Поэтому мы используем источник Kafka и слив ClickHouse. Обратите внимание, что, хотя Kafka поддерживается как слив, источник ClickHouse недоступен. В результате Vector не подходит для пользователей, желающих передать данные в Kafka из ClickHouse.

Vector также поддерживает [преобразование](https://vector.dev/docs/reference/configuration/transforms/) данных. Это выходит за рамки данного руководства. Пользователь может обратиться к документации Vector, если ему это необходимо для своего набора данных.

Обратите внимание, что текущая реализация слива ClickHouse использует HTTP интерфейс. На данный момент слив ClickHouse не поддерживает использование схемы JSON. Данные должны публиковаться в Kafka в простом формате JSON или в виде строк.

### Лицензия {#license}
Vector распространяется по [лицензии MPL-2.0](https://github.com/vectordotdev/vector/blob/master/LICENSE)

### Соберите данные о подключении {#gather-your-connection-details}
<ConnectionDetails />

### Шаги {#steps}

1. Создайте тему Kafka `github` и вставьте [набор данных Github](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson).

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

Этот набор данных состоит из 200,000 строк, сосредоточенных на репозитории `ClickHouse/ClickHouse`.

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

3. [Скачайте и установите Vector](https://vector.dev/docs/setup/quickstart/). Создайте файл конфигурации `kafka.toml` и измените значения для ваших экземпляров Kafka и ClickHouse.

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

Несколько важных примечаний по этой конфигурации и поведению Vector:

- Этот пример был протестирован на Confluent Cloud. Поэтому параметры безопасности `sasl.*` и `ssl.enabled` могут быть неуместными в случае самоуправления.
- Префикс протокола не требуется для параметра конфигурации `bootstrap_servers`, например `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- Параметр источника `decoding.codec = "json"` гарантирует, что сообщение передается в слив ClickHouse как один объект JSON. Если обрабатывать сообщения как строки и использовать значение по умолчанию `bytes`, содержимое сообщения будет добавлено в поле `message`. В большинстве случаев это потребует обработки в ClickHouse, как описано в руководстве по [началу работы с Vector](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs).
- Vector [добавляет несколько полей](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data) к сообщениям. В нашем примере мы игнорируем эти поля в сливе ClickHouse через параметр конфигурации `skip_unknown_fields = true`. Это игнорирует поля, которые не входят в схему целевой таблицы. Не стесняйтесь настраивать свою схему, чтобы убедиться, что такие метаполя, как `offset`, добавляются.
- Обратите внимание, как слив ссылается на источник событий через параметр `inputs`.
- Обратите внимание на поведение слива ClickHouse, как описано [здесь](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches). Для оптимальной пропускной способности пользователи могут настраивать параметры `buffer.max_events`, `batch.timeout_secs` и `batch.max_bytes`. По [рекомендациям ClickHouse](/sql-reference/statements/insert-into#performance-considerations) значение 1000 должно считаться минимальным для количества событий в любой одной партии. Для однородных случаев с высокой пропускной способностью пользователи могут увеличить параметр `buffer.max_events`. Более переменные пропускные способности могут потребовать изменений в параметре `batch.timeout_secs`.
- Параметр `auto_offset_reset = "smallest"` заставляет источник Kafka начинать с начала темы, гарантируя, что мы потребляем сообщения, опубликованные на шаге (1). Пользователи могут требовать другого поведения. См. [здесь](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset) для получения дополнительной информации.

4. Запустите Vector

```bash
vector --config ./kafka.toml
```

По умолчанию необходим [проверка работоспособности](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck) перед началом вставок в ClickHouse. Это обеспечивает возможность подключения и чтения схемы. Предварительно добавьте `VECTOR_LOG=debug`, чтобы получить дополнительные логи, которые могут быть полезны, если вы столкнетесь с проблемами.

5. Подтвердите вставку данных.

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
