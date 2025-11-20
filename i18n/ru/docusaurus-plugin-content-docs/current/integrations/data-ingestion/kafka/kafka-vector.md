---
sidebar_label: 'Vector и Kafka'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Использование Vector с Kafka и ClickHouse'
title: 'Использование Vector с Kafka и ClickHouse'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'log collection', 'observability', 'integration']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


## Использование Vector с Kafka и ClickHouse {#using-vector-with-kafka-and-clickhouse}

Vector — это независимый от поставщика конвейер данных с возможностью чтения из Kafka и отправки событий в ClickHouse.

[Руководство по началу работы](../etl-tools/vector-to-clickhouse.md) с Vector и ClickHouse сосредоточено на сценарии использования логов и чтении событий из файла. Мы используем [демонстрационный набор данных Github](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) с событиями, хранящимися в топике Kafka.

Vector использует [источники (sources)](https://vector.dev/docs/about/concepts/#sources) для получения данных через модель push или pull. [Приёмники (sinks)](https://vector.dev/docs/about/concepts/#sinks) в свою очередь предоставляют место назначения для событий. Таким образом, мы используем источник Kafka и приёмник ClickHouse. Обратите внимание, что хотя Kafka поддерживается в качестве приёмника, источник ClickHouse недоступен. Поэтому Vector не подходит для пользователей, желающих передавать данные из ClickHouse в Kafka.

Vector также поддерживает [преобразование](https://vector.dev/docs/reference/configuration/transforms/) данных. Это выходит за рамки данного руководства. Если пользователю требуется преобразование данных, следует обратиться к документации Vector.

Обратите внимание, что текущая реализация приёмника ClickHouse использует HTTP-интерфейс. Приёмник ClickHouse в настоящее время не поддерживает использование JSON-схемы. Данные должны публиковаться в Kafka либо в формате обычного JSON, либо в виде строк.

### Лицензия {#license}

Vector распространяется под [лицензией MPL-2.0](https://github.com/vectordotdev/vector/blob/master/LICENSE)

### Соберите данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

### Шаги {#steps}

1. Создайте топик Kafka `github` и загрузите [набор данных Github](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson).

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

Этот набор данных состоит из 200 000 строк, относящихся к репозиторию `ClickHouse/ClickHouse`.

2. Убедитесь, что целевая таблица создана. Ниже мы используем базу данных по умолчанию.

```sql

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

````

3. [Скачайте и установите Vector](https://vector.dev/docs/setup/quickstart/). Создайте файл конфигурации `kafka.toml` и укажите параметры для ваших экземпляров Kafka и ClickHouse.

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
````

Несколько важных замечаний о этой конфигурации и поведении Vector:


* Этот пример протестирован с Confluent Cloud. Поэтому параметры безопасности `sasl.*` и `ssl.enabled` могут быть неприменимы в сценариях с самостоятельным управлением.
* Для конфигурационного параметра `bootstrap_servers` не требуется префикс протокола, например `pkc-2396y.us-east-1.aws.confluent.cloud:9092`.
* Параметр источника `decoding.codec = "json"` гарантирует, что сообщение передаётся в приёмник ClickHouse как единый JSON-объект. При обработке сообщений как `String` и использовании значения по умолчанию `bytes` содержимое сообщения будет добавлено в поле `message`. В большинстве случаев это потребует обработки в ClickHouse, как описано в руководстве [Vector getting started](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs).
* Vector [добавляет ряд полей](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data) к сообщениям. В нашем примере мы игнорируем эти поля в приёмнике ClickHouse с помощью конфигурационного параметра `skip_unknown_fields = true`. Это позволяет игнорировать поля, которые не являются частью целевой схемы таблицы. При необходимости скорректируйте схему, чтобы добавить такие метаполя, как `offset`.
* Обратите внимание, как приёмник ссылается на источник событий через параметр `inputs`.
* Обратите внимание на поведение приёмника ClickHouse, описанное [здесь](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches). Для оптимальной пропускной способности пользователи могут настроить параметры `buffer.max_events`, `batch.timeout_secs` и `batch.max_bytes`. В соответствии с [рекомендациями](/sql-reference/statements/insert-into#performance-considerations) ClickHouse значение 1000 следует считать минимальным количеством событий в одном батче. Для сценариев с равномерно высокой пропускной способностью пользователи могут увеличить параметр `buffer.max_events`. При более переменной нагрузке может потребоваться изменение параметра `batch.timeout_secs`.
* Параметр `auto_offset_reset = "smallest"` заставляет источник Kafka начинать с начала топика, что гарантирует потребление сообщений, опубликованных на шаге (1). Пользователям может потребоваться иное поведение. Подробности см. [здесь](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset).

4. Запустите Vector

```bash
vector --config ./kafka.toml
```

По умолчанию перед началом вставки данных в ClickHouse выполняется [health check](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck). Это позволяет убедиться, что соединение может быть установлено и схема доступна для чтения. Установите переменную окружения `VECTOR_LOG=debug`, чтобы включить расширенное логирование, которое может быть полезно при возникновении проблем.

5. Убедитесь, что данные были вставлены.

```sql
SELECT count() AS count FROM github;
```

| count  |
| :----- |
| 200000 |
