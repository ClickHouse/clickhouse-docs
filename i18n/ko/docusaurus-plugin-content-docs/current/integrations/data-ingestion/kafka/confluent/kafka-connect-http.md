---
'sidebar_label': 'Confluent Platform 용 HTTP Sink Connector'
'sidebar_position': 4
'slug': '/integrations/kafka/cloud/confluent/http'
'description': 'Kafka Connect 와 ClickHouse 와 함께 HTTP Connector Sink 사용하기'
'title': 'Confluent HTTP Sink Connector'
'doc_type': 'guide'
'keywords':
- 'Confluent HTTP Sink Connector'
- 'HTTP Sink ClickHouse'
- 'Kafka HTTP connector '
- 'ClickHouse HTTP integration'
- 'Confluent Cloud HTTP Sink'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP 싱크 커넥터
HTTP 싱크 커넥터는 데이터 유형에 구애받지 않으므로 Kafka 스키마가 필요하지 않으며 Maps 및 Arrays와 같은 ClickHouse 고유의 데이터 유형도 지원합니다. 이 추가적인 유연성은 구성 복잡성이 약간 증가하는 대가로 제공됩니다.

아래에서는 단일 Kafka 주제에서 메시지를 가져와 ClickHouse 테이블에 행을 삽입하는 간단한 설치 방법을 설명합니다.

:::note
  HTTP 커넥터는 [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) 하에 배포됩니다.
:::

### 빠른 시작 단계 {#quick-start-steps}

#### 1. 연결 세부 정보 수집 {#1-gather-your-connection-details}
<ConnectionDetails />

#### 2. Kafka Connect 및 HTTP 싱크 커넥터 실행 {#2-run-kafka-connect-and-the-http-sink-connector}

두 가지 옵션이 있습니다:

* **자체 관리:** Confluent 패키지를 다운로드하고 로컬에 설치하십시오. 커넥터 설치에 대한 지침은 [여기](https://docs.confluent.io/kafka-connect-http/current/overview.html)에서 확인할 수 있습니다. confluent-hub 설치 방법을 사용하는 경우, 로컬 구성 파일이 업데이트됩니다.

* **Confluent Cloud:** Kafka 호스팅을 위해 Confluent Cloud를 사용하는 경우 HTTP 싱크의 완전 관리 버전을 이용할 수 있습니다. 이 경우 ClickHouse 환경이 Confluent Cloud에서 접근 가능해야 합니다.

:::note
  다음 예시는 Confluent Cloud를 사용하고 있습니다.
:::

#### 3. ClickHouse에서 대상 테이블 생성 {#3-create-destination-table-in-clickhouse}

연결성 테스트 전에 ClickHouse Cloud에 테스트 테이블을 생성해 보겠습니다. 이 테이블은 Kafka에서 데이터를 수신합니다:

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

#### 4. HTTP 싱크 구성 {#4-configure-http-sink}
Kafka 주제와 HTTP 싱크 커넥터 인스턴스를 생성합니다:
<Image img={createHttpSink} size="sm" alt="Confluent Cloud 인터페이스에서 HTTP Sink 커넥터 생성 방법" border/>

<br />

HTTP 싱크 커넥터를 구성합니다:
* 생성한 주제 이름 제공
* 인증
  * `HTTP Url` - ClickHouse Cloud URL에 `INSERT` 쿼리를 지정합니다 `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **주의:** 쿼리는 인코딩되어야 합니다.
  * `Endpoint Authentication type` - BASIC
  * `Auth username` - ClickHouse 사용자 이름
  * `Auth password` - ClickHouse 비밀번호

:::note
  이 HTTP Url은 오류가 발생하기 쉽습니다. 문제를 피하기 위해 이스케이핑이 정확해야 합니다.
:::

<Image img={httpAuth} size="lg" alt="Confluent Cloud 인터페이스에서 HTTP Sink 커넥터 인증 설정" border/>
<br/>

* 구성
  * `Input Kafka record value format` - 소스 데이터에 따라 달라지지만 대부분의 경우 JSON 또는 Avro입니다. 다음 설정에서는 `JSON`을 가정합니다.
  * `고급 구성` 섹션에서:
    * `HTTP Request Method` - POST로 설정
    * `Request Body Format` - json
    * `Batch batch size` - ClickHouse 권장 사항에 따라 **최소 1000**으로 설정합니다.
    * `Batch json as array` - true
    * `Retry on HTTP codes` - 400-500으로 설정하되 필요에 따라 조정하십시오. 예를 들어 ClickHouse 앞에 HTTP 프록시가 있는 경우 변경될 수 있습니다.
    * `Maximum Reties` - 기본값(10)이 적합하지만 보다 강력한 재시도를 위해 조정할 수 있습니다.

<Image img={httpAdvanced} size="sm" alt="Confluent Cloud 인터페이스에서 HTTP Sink 커넥터의 고급 구성 옵션" border/>

#### 5. 연결성 테스트 {#5-testing-the-connectivity}
HTTP 싱크에 의해 구성된 주제에서 메시지를 생성합니다
<Image img={createMessageInTopic} size="md" alt="Confluent Cloud 인터페이스에서 Kafka 주제에 테스트 메시지를 생성하는 방법" border/>

<br/>

그리고 생성된 메시지가 ClickHouse 인스턴스에 써졌는지 확인합니다.

### 문제 해결 {#troubleshooting}
#### HTTP 싱크가 메시지를 배치하지 않음 {#http-sink-doesnt-batch-messages}

[싱크 문서](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)에서:
> HTTP 싱크 커넥터는 서로 다른 Kafka 헤더 값을 포함하는 메시지의 요청을 배치하지 않습니다.

1. Kafka 레코드의 키가 동일한지 확인하십시오.
2. HTTP API URL에 매개변수를 추가하면 각 레코드가 고유한 URL을 생성할 수 있습니다. 이러한 이유로 추가 URL 매개변수를 사용할 때는 배치가 비활성화됩니다.

#### 400 잘못된 요청 {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTP 싱크가 `String` 컬럼에 JSON 객체를 삽입할 때 다음 메시지와 함께 실패하는 경우:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URL에 인코딩된 문자열로 `SETTINGS%20input_format_json_read_objects_as_strings%3D1` 설정을 추가합니다.

### GitHub 데이터셋 로드 (선택 사항) {#load-the-github-dataset-optional}

이 예제는 GitHub 데이터셋의 Array 필드를 유지합니다. 예제에서 빈 github 주제가 있다고 가정하고 메시지를 Kafka에 삽입하기 위해 [kcat](https://github.com/edenhill/kcat)를 사용합니다.

##### 1. 구성 준비 {#1-prepare-configuration}

설치 유형에 따라 Connect 설정을 위한 [이 지침](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)을 따르십시오. 독립 실행형 클러스터와 분산 클러스터 간의 차이를 주의 깊게 확인하십시오. Confluent Cloud를 사용할 경우 분산 설정이 적용됩니다.

가장 중요한 매개변수는 `http.api.url`입니다. ClickHouse의 [HTTP 인터페이스](../../../../interfaces/http.md)는 INSERT 문을 URL의 매개변수로 인코딩해야 합니다. 여기에는 포맷(`JSONEachRow`인 경우)과 대상 데이터베이스가 포함되어야 합니다. 이 형식은 HTTP 페이로드에서 문자열로 변환될 Kafka 데이터와 일치해야 합니다. 이러한 매개변수는 URL로 이스케이프되어야 합니다. Github 데이터셋에 대한 형식 예는 아래와 같습니다(ClickHouse를 로컬에서 실행한다고 가정):

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTP 싱크를 ClickHouse와 함께 사용하기 위해 관련된 추가 매개변수는 다음과 같습니다. 전체 매개변수 목록은 [여기](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)에서 확인할 수 있습니다:

* `request.method` - **POST**로 설정
* `retry.on.status.codes` - 오류 코드가 발생할 경우 400-500으로 설정하여 재시도합니다. 데이터의 예상 오류에 따라 조정하십시오.
* `request.body.format` - 대부분의 경우 JSON이 됩니다.
* `auth.type` - ClickHouse와 보안을 사용하는 경우 BASIC으로 설정합니다. 현재 ClickHouse와 호환되는 다른 인증 메커니즘은 지원되지 않습니다.
* `ssl.enabled` - SSL을 사용할 경우 true로 설정합니다.
* `connection.user` - ClickHouse의 사용자 이름입니다.
* `connection.password` - ClickHouse의 비밀번호입니다.
* `batch.max.size` - 단일 배치에서 전송할 행 수입니다. 적절히 큰 숫자로 설정하십시오. ClickHouse [권장 사항](/sql-reference/statements/insert-into#performance-considerations)에 따르면 최소값으로 1000을 고려해야 합니다.
* `tasks.max` - HTTP 싱크 커넥터는 하나 이상의 작업을 실행할 수 있습니다. 이는 성능 향상에 사용될 수 있습니다. 배치 크기와 함께 이는 성능 개선의 주요 수단입니다.
* `key.converter` - 키의 유형에 따라 설정하십시오.
* `value.converter` - 주제의 데이터 유형에 따라 설정합니다. 이 데이터는 스키마가 필요하지 않습니다. 여기의 포맷은 `http.api.url` 매개변수에 지정된 FORMAT와 일치해야 합니다. 가장 간단한 방법은 JSON을 사용하고 org.apache.kafka.connect.json.JsonConverter 변환기를 사용하는 것입니다. 값을 문자열로 처리하려면 org.apache.kafka.connect.storage.StringConverter 변환기를 통해 가능하지만, 이 경우 사용자가 삽입 문에서 값을 추출해야 합니다. ClickHouse에서는 [Avro 형식](/interfaces/formats/Avro)도 io.confluent.connect.avro.AvroConverter 변환기를 사용하는 경우 지원됩니다.

프록시 구성, 재시도 및 고급 SSL을 포함한 모든 설정 목록은 [여기](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)에서 볼 수 있습니다.

Github 샘플 데이터에 대한 전체 구성 파일은 [여기](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)에서 찾을 수 있습니다. 이를 통해 Connect가 독립 실행 모드로 실행되며 Kafka가 Confluent Cloud에서 호스팅된다고 가정합니다.

##### 2. ClickHouse 테이블 생성 {#2-create-the-clickhouse-table}

테이블이 생성되었는지 확인하십시오. 표준 MergeTree를 사용하는 최소 github 데이터셋을 위한 예는 아래와 같습니다.

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

##### 3. Kafka에 데이터 추가 {#3-add-data-to-kafka}

Kafka에 메시지를 삽입합니다. 아래에서는 [kcat](https://github.com/edenhill/kcat)를 사용하여 10k 메시지를 삽입합니다.

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

대상 테이블 "Github"에서 간단한 읽기를 통해 데이터 삽입을 확인할 수 있어야 합니다.

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
