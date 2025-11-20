---
'sidebar_label': 'Kafka와 함께 벡터'
'sidebar_position': 3
'slug': '/integrations/kafka/kafka-vector'
'description': 'Kafka와 ClickHouse와 함께 벡터 사용하기'
'title': 'Kafka와 ClickHouse와 함께 벡터 사용하기'
'doc_type': 'guide'
'keywords':
- 'kafka'
- 'vector'
- 'log collection'
- 'observability'
- 'integration'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## Kafka 및 ClickHouse와 함께 Vector 사용하기 {#using-vector-with-kafka-and-clickhouse}

Vector는 Kafka에서 읽고 ClickHouse로 이벤트를 전송할 수 있는 공급업체에 구애받지 않는 데이터 파이프라인입니다.

ClickHouse와 함께 사용하는 Vector에 대한 [시작 가이드](../etl-tools/vector-to-clickhouse.md)는 로그 사용 사례 및 파일에서 이벤트 읽기에 중점을 둡니다. 우리는 Kafka 주제에 보관된 이벤트와 함께 [Github 샘플 데이터 세트](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)를 활용합니다.

Vector는 푸시 또는 풀 모델을 통해 데이터를 검색하기 위해 [소스](https://vector.dev/docs/about/concepts/#sources)를 활용합니다. [싱크](https://vector.dev/docs/about/concepts/#sinks)는 이벤트의 목적지를 제공합니다. 따라서 우리는 Kafka 소스와 ClickHouse 싱크를 활용합니다. Kafka는 Sink로 지원되지만 ClickHouse 소스는 지원되지 않는 점에 유의하십시오. 따라서 Vector는 ClickHouse에서 Kafka로 데이터를 전송하려는 사용자에게 적합하지 않습니다.

Vector는 데이터의 [변환](https://vector.dev/docs/reference/configuration/transforms/)도 지원합니다. 이는 이 가이드의 범위를 초과합니다. 데이터 세트에 대해 필요할 경우 Vector 문서를 참조하시기 바랍니다.

현재 ClickHouse 싱크의 구현은 HTTP 인터페이스를 활용합니다. 현재 ClickHouse 싱크는 JSON 스키마의 사용을 지원하지 않습니다. 데이터는 일반 JSON 형식 또는 문자열로 Kafka에 게시되어야 합니다.

### 라이센스 {#license}
Vector는 [MPL-2.0 라이센스](https://github.com/vectordotdev/vector/blob/master/LICENSE) 하에 배포됩니다.

### 연결 세부정보 수집하기 {#gather-your-connection-details}
<ConnectionDetails />

### 단계 {#steps}

1. Kafka에서 `github` 주제를 생성하고 [Github 데이터 세트](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)를 삽입합니다.

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

이 데이터 세트는 `ClickHouse/ClickHouse` 저장소에 중점을 둔 200,000개의 행으로 구성됩니다.

2. 대상 테이블이 생성되었는지 확인합니다. 아래에서 기본 데이터베이스를 사용합니다.

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

3. [Vector 다운로드 및 설치](https://vector.dev/docs/setup/quickstart/) . `kafka.toml` 구성 파일을 만들고 Kafka 및 ClickHouse 인스턴스에 대한 값을 수정합니다.

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

이 구성 및 Vector의 동작에 대한 몇 가지 중요한 참고 사항:

- 이 예제는 Confluent Cloud에서 테스트되었습니다. 따라서 `sasl.*` 및 `ssl.enabled` 보안 옵션은 자체 관리 방식에서는 적합하지 않을 수 있습니다.
- 구성 매개변수 `bootstrap_servers`에 프로토콜 접두어가 필요하지 않습니다. 예: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- 소스 매개변수 `decoding.codec = "json"`은 메시지가 ClickHouse 싱크에 단일 JSON 객체로 전달되도록 보장합니다. 메시지를 문자열로 처리하고 기본값인 `bytes`를 사용하는 경우 메시지의 내용은 `message`라는 필드에 추가됩니다. 대부분의 경우 이는 [Vector 시작 가이드](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)에서 설명하는 대로 ClickHouse에서 처리해야 합니다.
- Vector는 메시지에 [여러 필드를 추가합니다](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data). 우리의 예에서 우리는 구성 매개변수 `skip_unknown_fields = true`를 통해 ClickHouse 싱크에서 이러한 필드를 무시합니다. 이것은 대상 테이블 스키마의 일부가 아닌 필드를 무시합니다. `offset`과 같은 메타 필드가 추가되도록 스키마를 조정하십시오.
- 싱크는 이벤트 소스를 매개변수 `inputs`를 통해 참조합니다.
- ClickHouse 싱크의 동작은 [여기](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)에서 설명된 대로입니다. 최적의 처리량을 위해 사용자는 `buffer.max_events`, `batch.timeout_secs` 및 `batch.max_bytes` 매개변수를 조정할 수 있습니다. ClickHouse의 [권장 사항](/sql-reference/statements/insert-into#performance-considerations)에 따라 단일 배치의 이벤트 수에 대한 최소값으로 1000을 고려해야 합니다. 균일한 높은 처리량을 사용하는 경우 사용자는 `buffer.max_events` 매개변수를 늘릴 수 있습니다. 더 변동적인 처리량의 경우 `batch.timeout_secs` 매개변수의 변경이 필요할 수 있습니다.
- 매개변수 `auto_offset_reset = "smallest"`는 Kafka 소스가 주제의 시작 지점에서 시작하도록 강제합니다. 따라서 단계 (1)에서 게시된 메시지를 소비하도록 보장합니다. 사용자는 다른 동작을 요구할 수 있습니다. 추가 세부정보는 [여기](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)를 참조하십시오.

4. Vector 시작하기

```bash
vector --config ./kafka.toml
```

기본적으로 ClickHouse에 삽입하기 전에 [헬스 체크](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)가 필요합니다. 이를 통해 연결을 설정할 수 있고 스키마를 읽을 수 있습니다. `VECTOR_LOG=debug`를 추가하여 문제 발생 시 유용한 추가 로그를 얻을 수 있습니다.

5. 데이터 삽입 확인하기.

```sql
SELECT count() AS count FROM github;
```

| count |
| :--- |
| 200000 |
