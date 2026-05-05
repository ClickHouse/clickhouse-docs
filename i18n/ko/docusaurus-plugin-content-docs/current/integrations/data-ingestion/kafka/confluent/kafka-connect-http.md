---
sidebar_label: 'Confluent Platform용 HTTP Sink 커넥터'
sidebar_position: 4
slug: /integrations/kafka/cloud/confluent/http
description: 'Kafka Connect와 ClickHouse에서 HTTP Sink Connector 사용하기'
title: 'Confluent HTTP Sink 커넥터'
doc_type: 'guide'
keywords: ['Confluent HTTP Sink 커넥터', 'HTTP Sink ClickHouse', 'Kafka HTTP 커넥터', 'ClickHouse HTTP 통합', 'Confluent Cloud HTTP Sink']
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP Sink 커넥터 \{#confluent-http-sink-connector\}

HTTP Sink 커넥터는 데이터 유형에 구애받지 않으므로 Kafka 스키마가 필요하지 않고, 맵(Map) 및 배열(Array)과 같은 ClickHouse 특화 데이터 타입도 지원합니다. 이와 같은 추가적인 유연성으로 인해 설정이 약간 더 복잡해집니다.

아래에서는 단일 Kafka 토픽에서 메시지를 가져와 ClickHouse 테이블에 행을 삽입하는 간단한 설치 방법을 설명합니다.

:::note
  HTTP 커넥터는 [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) 하에 배포됩니다.
:::

### 빠른 시작 단계 \{#quick-start-steps\}

#### 1. 연결 정보 준비 \{#1-gather-your-connection-details\}

<ConnectionDetails />

#### 2. Kafka Connect와 HTTP sink 커넥터 실행 \{#2-run-kafka-connect-and-the-http-sink-connector\}

다음 두 가지 옵션이 있습니다.

* **Self-managed(자가 관리형):** Confluent 패키지를 다운로드하여 로컬에 설치합니다. 커넥터 설치 방법은 [여기](https://docs.confluent.io/kafka-connect-http/current/overview.html)에 문서화된 내용을 따르십시오.
Confluent Hub 설치 방법을 사용하는 경우 로컬 설정 파일이 업데이트됩니다.

* **Confluent Cloud:** Kafka 호스팅에 Confluent Cloud를 사용하는 경우 HTTP Sink의 완전 관리형 버전을 사용할 수 있습니다. 이를 위해서는 Confluent Cloud에서 ClickHouse 환경에 접근할 수 있어야 합니다.

:::note
  다음 예제에서는 Confluent Cloud를 사용합니다.
:::

#### 3. ClickHouse에서 대상 테이블 생성 \{#3-create-destination-table-in-clickhouse\}

연결 테스트에 앞서 먼저 ClickHouse Cloud에 테스트 테이블을 생성합니다. 이 테이블은 Kafka에서 전달되는 데이터를 저장합니다.

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


#### 4. Configure HTTP Sink \{#4-configure-http-sink\}

Kafka 토픽과 HTTP Sink Connector 인스턴스를 생성합니다:

<Image img={createHttpSink} size="sm" alt="HTTP Sink connector를 생성하는 방법을 보여주는 Confluent Cloud 인터페이스" border/>

<br />

HTTP Sink Connector를 구성합니다:

* 앞에서 생성한 토픽 이름을 입력합니다.
* Authentication
  * `HTTP Url` - `INSERT` 쿼리가 지정된 ClickHouse Cloud URL: `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`. **Note**: 쿼리는 반드시 인코딩되어야 합니다.
  * `Endpoint Authentication type` - BASIC
  * `Auth username` - ClickHouse 사용자 이름
  * `Auth password` - ClickHouse 비밀번호

:::note
  이 HTTP Url은 오류가 발생하기 쉽습니다. 문제가 발생하지 않도록 이스케이프 처리를 정확하게 하십시오.
:::

<Image img={httpAuth} size="lg" alt="HTTP Sink connector에 대한 인증 설정을 보여주는 Confluent Cloud 인터페이스" border/>

<br/>

* Configuration
  * `Input Kafka record value format` - 소스 데이터에 따라 다르지만 대부분의 경우 JSON 또는 Avro입니다. 이후 설정에서는 `JSON`을 사용하는 것으로 가정합니다.
  * `advanced configurations` 섹션에서:
    * `HTTP Request Method` - POST로 설정합니다.
    * `Request Body Format` - json
    * `Batch batch size` - ClickHouse 권장 사항에 따라 **최소 1000 이상**으로 설정합니다.
    * `Batch json as array` - true
    * `Retry on HTTP codes` - 400-500으로 설정하되, 필요에 따라 조정합니다. 예를 들어 ClickHouse 앞에 HTTP 프록시가 있는 경우 값이 달라질 수 있습니다.
    * `Maximum Reties` - 기본값(10)으로 적절하지만, 보다 견고한 재시도를 위해 조정해도 됩니다.

<Image img={httpAdvanced} size="sm" alt="HTTP Sink connector에 대한 고급 구성 옵션을 보여주는 Confluent Cloud 인터페이스" border/>

#### 5. 연결 테스트 \{#5-testing-the-connectivity\}

HTTP Sink로 구성한 토픽에 메시지를 생성합니다.

<Image img={createMessageInTopic} size="md" alt="Kafka 토픽에 테스트 메시지를 생성하는 방법을 보여 주는 Confluent Cloud 인터페이스" border/>

<br/>

생성된 메시지가 ClickHouse 인스턴스에 정상적으로 기록되었는지 확인합니다.

### 문제 해결 \{#troubleshooting\}

#### HTTP Sink가 메시지를 배치 처리하지 않음 \{#http-sink-doesnt-batch-messages\}

[Sink 문서](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)에 따르면:

> HTTP Sink 커넥터는 서로 다른 Kafka 헤더 값을 포함하는 메시지에 대해서는 요청을 배치 처리하지 않습니다.

1. Kafka 레코드에 동일한 키가 있는지 확인합니다.
2. HTTP API URL에 매개변수를 추가하면 각 레코드가 고유한 URL을 생성할 수 있습니다. 이 때문에 추가 URL 매개변수를 사용하는 경우 배치가 비활성화됩니다.

#### 400 잘못된 요청 \{#400-bad-request\}

##### CANNOT_PARSE_QUOTED_STRING \{#cannot_parse_quoted_string\}

HTTP Sink가 `String` 컬럼에 JSON 객체를 삽입하려 할 때 다음 메시지와 함께 실패하는 경우:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URL에 `input_format_json_read_objects_as_strings=1` 설정을 URL 인코딩된 문자열 `SETTINGS%20input_format_json_read_objects_as_strings%3D1`로 지정합니다


### GitHub 데이터셋 로드(선택 사항) \{#load-the-github-dataset-optional\}

이 예제에서는 GitHub 데이터셋의 Array 필드를 그대로 유지합니다. 예제에서는 비어 있는 GitHub 토픽이 있다고 가정하고, Kafka로 메시지를 전송하기 위해 [kcat](https://github.com/edenhill/kcat)을 사용합니다.

##### 1. 구성 준비 \{#1-prepare-configuration\}

단독 및 분산 클러스터 간 차이점에 유의하면서 설치 유형에 맞게 Connect를 설정하기 위해 [다음 지침](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)을 따르십시오. Confluent Cloud를 사용하는 경우 분산 구성이 해당합니다.

가장 중요한 매개변수는 `http.api.url`입니다. ClickHouse의 [HTTP 인터페이스](/interfaces/http)는 URL의 매개변수로 INSERT 문을 인코딩할 것을 요구합니다. 여기에는 형식(이 경우 `JSONEachRow`)과 대상 데이터베이스가 포함되어야 합니다. 형식은 HTTP 페이로드에서 문자열로 변환될 Kafka 데이터와 일치해야 합니다. 이러한 매개변수는 URL 인코딩되어야 합니다. GitHub 데이터셋에 대한 이 형식의 예시는(로컬에서 ClickHouse를 실행한다고 가정할 때) 아래와 같습니다.

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

다음 추가 매개변수들은 ClickHouse와 함께 HTTP Sink를 사용할 때 고려해야 합니다. 전체 매개변수 목록은 [여기](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)에서 확인할 수 있습니다:

* `request.method` - **POST**로 설정합니다.
* `retry.on.status.codes` - 모든 오류 코드에서 재시도하도록 400-500으로 설정합니다. 데이터에서 예상되는 오류에 따라 값을 조정하십시오.
* `request.body.format` - 대부분의 경우 JSON을 사용합니다.
* `auth.type` - ClickHouse에 보안을 설정한 경우 BASIC으로 설정합니다. 현재 다른 ClickHouse 호환 인증 메커니즘은 지원되지 않습니다.
* `ssl.enabled` - SSL을 사용하는 경우 true로 설정합니다.
* `connection.user` - ClickHouse 사용자 이름입니다.
* `connection.password` - ClickHouse 비밀번호입니다.
* `batch.max.size` - 단일 배치로 전송할 행의 수입니다. 이 값이 충분히 큰 값으로 설정되어 있는지 확인하십시오. ClickHouse [권장 사항](/sql-reference/statements/insert-into#performance-considerations)에 따르면 최소값으로 1000을 고려해야 합니다.
* `tasks.max` - HTTP Sink 커넥터는 하나 이상의 태스크 실행을 지원합니다. 이는 성능을 높이는 데 사용할 수 있습니다. 배치 크기와 함께 성능을 개선하는 주요 수단이 됩니다.
* `key.converter` - 키의 유형에 맞게 설정합니다.
* `value.converter` - 토픽의 데이터 유형에 따라 설정합니다. 이 데이터에는 스키마가 필요하지 않습니다. 여기에서 사용하는 포맷은 `http.api.url` 매개변수에 지정된 FORMAT과 일치해야 합니다. 가장 간단한 방법은 JSON과 org.apache.kafka.connect.json.JsonConverter 컨버터를 사용하는 것입니다. 값을 org.apache.kafka.connect.storage.StringConverter 컨버터를 통해 문자열로 처리하는 것도 가능합니다. 다만 이 경우 INSERT 문에서 함수를 사용해 값을 추출해야 합니다. 또한 io.confluent.connect.avro.AvroConverter 컨버터를 사용하는 경우 ClickHouse에서 [Avro format](/interfaces/formats/Avro)도 지원됩니다.

프록시, 재시도, 고급 SSL 설정 방법을 포함한 전체 설정 목록은 [여기](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)에서 확인할 수 있습니다.

GitHub 샘플 데이터용 예제 설정 파일은 Connect가 standalone 모드로 실행되고 Kafka가 Confluent Cloud에서 호스팅된다고 가정할 때 [여기](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)에서 찾을 수 있습니다.


##### 2. ClickHouse 테이블 생성 \{#2-create-the-clickhouse-table\}

테이블이 생성되었는지 확인합니다. 아래는 표준 MergeTree를 사용한 최소 GitHub 데이터셋 예시입니다.

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


##### 3. Kafka에 데이터 추가 \{#3-add-data-to-kafka\}

Kafka로 메시지를 전송합니다. 아래에서는 [kcat](https://github.com/edenhill/kcat)을 사용하여 10,000개의 메시지를 전송합니다.

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

대상 테이블 「Github」을(를) 단순 조회하면 데이터가 삽입되었는지 확인할 수 있습니다.

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
