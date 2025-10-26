---
slug: '/integrations/kafka/kafka-vector'
sidebar_label: 'Вектор с Kafka'
sidebar_position: 3
description: 'Использование Vector с Kafka и ClickHouse'
title: 'Использование Vector с Kafka и ClickHouse'
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## Использование Vector с Kafka и ClickHouse {#using-vector-with-kafka-and-clickhouse}

 Vector — это универсальный конвейер данных, способный считывать данные из Kafka и отправлять события в ClickHouse.

Руководство по [началу работы](../etl-tools/vector-to-clickhouse.md) с Vector и ClickHouse сосредоточено на использовании логов и считывании событий из файла. Мы используем [пример набора данных из Github](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson), содержащий события на Kafka-теме.

Vector использует [источники](https://vector.dev/docs/about/concepts/#sources) для получения данных через модель push или pull. В то же время [синхронизация](https://vector.dev/docs/about/concepts/#sinks) предоставляет назначение для событий. Поэтому мы используем источник Kafka и синхронизацию ClickHouse. Обратите внимание, что хотя Kafka поддерживается в качестве синхронизации, источник ClickHouse недоступен. Следовательно, Vector не подходит для пользователей, желающих передавать данные из ClickHouse в Kafka.

Vector также поддерживает [преобразование](https://vector.dev/docs/reference/configuration/transforms/) данных. Это выходит за рамки данного руководства. Пользователю рекомендуется обратиться к документации Vector, если ему это необходимо для их набора данных.

Обратите внимание, что текущая реализация синхронизации ClickHouse использует HTTP интерфейс. В настоящее время синхронизация ClickHouse не поддерживает использование JSON-схемы. Данные должны быть отправлены в Kafka в простом формате JSON или в виде строк.

### Лицензия {#license}
Vector распространяется по лицензии [MPL-2.0](https://github.com/vectordotdev/vector/blob/master/LICENSE)

### Соберите свои данные для подключения {#gather-your-connection-details}
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

Некоторые важные примечания по этой конфигурации и поведению Vector:

- Этот пример был протестирован в Confluent Cloud. Поэтому параметры безопасности `sasl.*` и `ssl.enabled` могут быть неуместны в самоуправляемых случаях.
- Префикс протокола не требуется для параметра конфигурации `bootstrap_servers`, например, `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- Параметр источника `decoding.codec = "json"` гарантирует, что сообщение передается в синхронизацию ClickHouse как один объект JSON. Если обрабатывать сообщения как строки и использовать значение по умолчанию `bytes`, содержимое сообщения будет добавлено в поле `message`. В большинстве случаев это потребует обработки в ClickHouse, как описано в руководстве [Vector по началу работы](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs).
- Vector [добавляет ряд полей](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data) к сообщениям. В нашем примере мы игнорируем эти поля в синхронизации ClickHouse с помощью параметра конфигурации `skip_unknown_fields = true`. Это игнорирует поля, которые не являются частью схемы целевой таблицы. Вы можете настроить свою схему, чтобы обеспечить добавление этих метаполей, таких как `offset`.
- Обратите внимание, как ссылка на синхронизацию ссылается на источник событий через параметр `inputs`.
- Обратите внимание на поведение синхронизации ClickHouse, как описано [здесь](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches). Для оптимальной пропускной способности пользователи могут захотеть настроить параметры `buffer.max_events`, `batch.timeout_secs` и `batch.max_bytes`. В соответствии с [рекомендуемыми значениями](/sql-reference/statements/insert-into#performance-considerations) ClickHouse, значение 1000 должно считаться минимумом для количества событий в любом отдельном пакете. Для равномерных случаев с высокой пропускной способностью пользователи могут увеличить параметр `buffer.max_events`. Более переменные пропускные способности могут потребовать изменений в параметре `batch.timeout_secs`.
- Параметр `auto_offset_reset = "smallest"` заставляет источник Kafka начинать с начала темы, тем самым гарантируя, что мы обрабатываем сообщения, опубликованные на шаге (1). Пользователям может потребоваться другое поведение. Дополнительные сведения смотрите [здесь](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset).

4. Запустите Vector

```bash
vector --config ./kafka.toml
```

По умолчанию требуется [проверка состояния](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck) перед началом вставок в ClickHouse. Это обеспечивает возможность установления соединения и считывания схемы. Предварительно добавьте `VECTOR_LOG=debug`, чтобы получить дополнительное логирование, что может быть полезно, если у вас возникли проблемы.

5. Подтвердите вставку данных.

```sql
SELECT count() AS count FROM github;
```

| count |
| :--- |
| 200000 |