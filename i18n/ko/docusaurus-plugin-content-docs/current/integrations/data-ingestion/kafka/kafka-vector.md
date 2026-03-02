---
sidebar_label: 'Kafka와 Vector'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Kafka 및 ClickHouse와 함께 Vector 사용'
title: 'Kafka 및 ClickHouse와 함께 Vector 사용'
doc_type: 'guide'
keywords: ['kafka', 'vector', '로그 수집', '관측성', '통합']
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


## Kafka 및 ClickHouse와 함께 Vector 사용하기 \{#using-vector-with-kafka-and-clickhouse\}

Vector는 Kafka에서 데이터를 읽고 이벤트를 ClickHouse로 전송할 수 있는 벤더 중립적 데이터 파이프라인입니다.

ClickHouse와 함께 Vector를 사용하는 [시작하기](../etl-tools/vector-to-clickhouse.md) 가이드는 로그 사용 사례와 파일에서 이벤트를 읽는 작업에 중점을 둡니다. 여기서는 Kafka 토픽에 저장된 이벤트가 포함된 [Github 샘플 데이터셋](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)을 활용합니다.

Vector는 [sources](https://vector.dev/docs/about/concepts/#sources)를 사용하여 푸시 또는 풀 모델로 데이터를 수집합니다. 한편 [sinks](https://vector.dev/docs/about/concepts/#sinks)는 이벤트의 목적지를 정의합니다. 따라서 Kafka source와 ClickHouse sink를 사용합니다. Kafka는 sink로 지원되지만 ClickHouse source는 제공되지 않는다는 점에 유의해야 합니다. 이로 인해 Vector는 ClickHouse에서 Kafka로 데이터를 전송하려는 경우에는 적합하지 않습니다.

Vector는 데이터 [transformation](https://vector.dev/docs/reference/configuration/transforms/)도 지원합니다. 이는 이 가이드의 범위를 벗어나는 내용입니다. 데이터셋에 이 기능이 필요하면 Vector 문서를 참조하시기 바랍니다.

현재 ClickHouse sink 구현은 HTTP 인터페이스를 사용한다는 점에 유의하십시오. 또한 현재 ClickHouse sink는 JSON 스키마 사용을 지원하지 않습니다. 데이터는 Kafka에 일반 JSON 형식 또는 문자열(String) 형식으로 게시되어야 합니다.

### 라이선스 \{#license\}

Vector는 [MPL-2.0 라이선스](https://github.com/vectordotdev/vector/blob/master/LICENSE)에 따라 배포됩니다.

### 연결 세부 정보 확인하기 \{#gather-your-connection-details\}

<ConnectionDetails />

### 단계 \{#steps\}

1. Kafka에 `github` 토픽을 생성하고 [Github 데이터셋](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)을 적재합니다.

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

이 데이터셋은 `ClickHouse/ClickHouse` 저장소를 중심으로 하는 200,000개의 행으로 구성됩니다.

2. 대상 테이블이 생성되어 있는지 확인합니다. 아래에서는 기본 데이터베이스를 사용합니다.

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

3. [Vector를 다운로드하여 설치합니다](https://vector.dev/docs/setup/quickstart/). `kafka.toml` 구성 파일을 생성하고 Kafka 및 ClickHouse 인스턴스에 맞게 값을 설정합니다.

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

이 구성 및 Vector의 동작과 관련하여 다음과 같은 몇 가지 중요한 유의 사항이 있습니다.


* 이 예제는 Confluent Cloud에서 테스트되었습니다. 따라서 `sasl.*` 및 `ssl.enabled` 보안 옵션은 자가 관리형 환경에서는 적합하지 않을 수 있습니다.
* 구성 파라미터 `bootstrap_servers`에는 프로토콜 접두사가 필요하지 않습니다. 예: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
* 소스 파라미터 `decoding.codec = "json"`은 메시지가 단일 JSON 객체로 ClickHouse sink에 전달되도록 합니다. 메시지를 String으로 처리하고 기본값인 `bytes`를 사용하는 경우, 메시지의 내용이 `message` 필드에 추가됩니다. 대부분의 경우 [Vector 시작하기](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs) 가이드에 설명된 것처럼 ClickHouse에서 추가 처리가 필요합니다.
* Vector는 메시지에 [여러 필드를 추가](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)합니다. 이 예제에서는 ClickHouse sink에서 구성 파라미터 `skip_unknown_fields = true`를 통해 이러한 필드를 무시합니다. 이는 대상 테이블 스키마의 일부가 아닌 필드를 무시합니다. `offset`과 같은 이러한 메타 필드가 추가되도록 스키마를 조정해도 됩니다.
* sink가 `inputs` 파라미터를 통해 이벤트 소스를 참조하는 방식을 참고하십시오.
* ClickHouse sink의 동작은 [여기](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)에 설명되어 있습니다. 최적의 처리량을 위해 `buffer.max_events`, `batch.timeout_secs`, `batch.max_bytes` 파라미터를 조정하는 것이 좋습니다. ClickHouse [권장 사항](/sql-reference/statements/insert-into#performance-considerations)에 따르면, 단일 배치에 포함되는 이벤트 개수는 최소 1000개로 설정하는 것이 좋습니다. 균일한 고처리량 사용 사례의 경우 `buffer.max_events` 파라미터 값을 더 크게 설정할 수 있습니다. 처리량 변동이 큰 경우에는 `batch.timeout_secs` 파라미터 값을 조정해야 할 수 있습니다.
* 파라미터 `auto_offset_reset = "smallest"`는 Kafka 소스가 토픽의 시작 지점부터 읽도록 강제하여, 단계 (1)에서 게시된 메시지를 모두 소비하도록 합니다. 다른 동작이 필요할 수 있습니다. 자세한 내용은 [여기](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)를 참조하십시오.

4. Vector 시작

```bash
vector --config ./kafka.toml
```

기본적으로 ClickHouse로의 데이터 삽입이 시작되기 전에 [health check](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)가 필요합니다. 이를 통해 연결이 설정되고 스키마를 읽을 수 있는지 확인합니다. 문제가 발생했을 때 도움이 될 수 있는 추가 로그를 얻으려면 명령 앞에 `VECTOR_LOG=debug`를 붙여 실행하십시오.

5. 데이터가 삽입되었는지 확인합니다.

```sql
SELECT count() AS count FROM github;
```

| count  |
| :----- |
| 200000 |
