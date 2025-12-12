---
sidebar_label: 'Vector с Kafka'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Использование Vector с Kafka и ClickHouse'
title: 'Использование Vector с Kafka и ClickHouse'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'сбор логов', 'наблюдаемость', 'интеграция']
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

1. Создайте топик Kafka `github` и вставьте в него [набор данных GitHub](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson).

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

Этот набор данных содержит 200 000 строк из репозитория `ClickHouse/ClickHouse`.

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

CREATE TABLE github
(
file&#95;time DateTime,
event&#95;type Enum(&#39;CommitCommentEvent&#39; = 1, &#39;CreateEvent&#39; = 2, &#39;DeleteEvent&#39; = 3, &#39;ForkEvent&#39; = 4,
&#39;GollumEvent&#39; = 5, &#39;IssueCommentEvent&#39; = 6, &#39;IssuesEvent&#39; = 7, &#39;MemberEvent&#39; = 8, &#39;PublicEvent&#39; = 9, &#39;PullRequestEvent&#39; = 10, &#39;PullRequestReviewCommentEvent&#39; = 11, &#39;PushEvent&#39; = 12, &#39;ReleaseEvent&#39; = 13, &#39;SponsorshipEvent&#39; = 14, &#39;WatchEvent&#39; = 15, &#39;GistEvent&#39; = 16, &#39;FollowEvent&#39; = 17, &#39;DownloadEvent&#39; = 18, &#39;PullRequestReviewEvent&#39; = 19, &#39;ForkApplyEvent&#39; = 20, &#39;Event&#39; = 21, &#39;TeamAddEvent&#39; = 22),
actor&#95;login LowCardinality(String),
repo&#95;name LowCardinality(String),
created&#95;at DateTime,
updated&#95;at DateTime,
action Enum(&#39;none&#39; = 0, &#39;created&#39; = 1, &#39;added&#39; = 2, &#39;edited&#39; = 3, &#39;deleted&#39; = 4, &#39;opened&#39; = 5, &#39;closed&#39; = 6, &#39;reopened&#39; = 7, &#39;assigned&#39; = 8, &#39;unassigned&#39; = 9, &#39;labeled&#39; = 10, &#39;unlabeled&#39; = 11, &#39;review&#95;requested&#39; = 12, &#39;review&#95;request&#95;removed&#39; = 13, &#39;synchronize&#39; = 14, &#39;started&#39; = 15, &#39;published&#39; = 16, &#39;update&#39; = 17, &#39;create&#39; = 18, &#39;fork&#39; = 19, &#39;merged&#39; = 20),
comment&#95;id UInt64,
path String,
ref LowCardinality(String),
ref&#95;type Enum(&#39;none&#39; = 0, &#39;branch&#39; = 1, &#39;tag&#39; = 2, &#39;repository&#39; = 3, &#39;unknown&#39; = 4),
creator&#95;user&#95;login LowCardinality(String),
number UInt32,
title String,
labels Array(LowCardinality(String)),
state Enum(&#39;none&#39; = 0, &#39;open&#39; = 1, &#39;closed&#39; = 2),
assignee LowCardinality(String),
assignees Array(LowCardinality(String)),
closed&#95;at DateTime,
merged&#95;at DateTime,
merge&#95;commit&#95;sha String,
requested&#95;reviewers Array(LowCardinality(String)),
merged&#95;by LowCardinality(String),
review&#95;comments UInt32,
member&#95;login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event&#95;type, repo&#95;name, created&#95;at);

````toml
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
````bash
vector --config ./kafka.toml
```bash
vector --config ./kafka.toml
```sql
SELECT count() AS count FROM github;
```sql
SELECT count() AS count FROM github;
```

| Количество |
| :--------- |
| 200000     |
